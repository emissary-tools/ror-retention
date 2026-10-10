import { useState } from 'react';
import {
  useReport,
  type ScenarioReturnReport,
  type ScenarioOutcomeReport,
  type ScenarioGroupReport,
} from './api';
import { downloadCSV } from './export';

const num = (n: number | null | undefined): string => n == null ? 'Unavailable' : n.toLocaleString('en-US');
const rate = (n: number | null | undefined, eligible: number | null | undefined, complete = false): string => {
  if (!complete) return 'Unverified coverage';
  if (n == null || eligible == null) return 'Unavailable';
  if (!Number.isFinite(n) || !Number.isFinite(eligible) || n < 0 || eligible < 0 || n > eligible) return 'Invalid source data';
  return !eligible ? 'Not eligible' : `${((100 * n) / eligible).toFixed(1)}%`;
};

function Note({ children }: {children: string}) {
  return <p className="method-note" role="note"><span className="note-marker">!</span><span>{children}</span></p>;
}
function Pending({error}:{error: string | null}) {
  return <section className="empty-state planned" role="status"><h3>Awaiting verified scenario retention data</h3><p>{error ? `The scenario retention endpoint is not available (${error}). ` : ''}The page does not substitute sample data, zeros, or live GraphQL calls. Existing match history will be processed into coverage-verified cohorts before any results appear.</p></section>;
}
function LastCoverage({coverage,asOf}:{coverage:{firstCoveredDay:string|null;lastCompleteDay:string|null;missingDays:number|null;complete:boolean};asOf:string}) {
  return <p className="data-stamp">Last complete observed day: {coverage.lastCompleteDay ?? 'not verified'} · Missing days: {num(coverage.missingDays)} · API timestamp: {asOf?.slice(0,10) ?? 'Unknown'}</p>;
}
function MetricTable({rows,compare='Return within 7 days',verified=false}:{rows:{key:string;label:string;exposedCharacters:number;eligibleCharacters:number;returnedCharacters:number;sourceMatchCount?:number}[];compare?:string;verified?:boolean}){
  return <div className="table-scroller"><table><thead><tr><th>Observation</th><th>Exposed characters</th><th>Eligible characters</th><th>Return count</th><th>{compare}</th></tr></thead><tbody>{rows.map(row=><tr key={row.key}><td>{row.label}</td><td>{num(row.exposedCharacters)}</td><td>{num(row.eligibleCharacters)}</td><td>{num(row.returnedCharacters)}</td><td><strong>{rate(row.returnedCharacters,row.eligibleCharacters,verified)}</strong></td></tr>)}</tbody></table></div>;
}

export function ScenarioRetentionPanel(){
  const [days,setDays]=useState(7);
  const [months,setMonths]=useState(12);
  const {data,loading,error}=useReport<ScenarioReturnReport>(`/api/retention/scenario-return?windowDays=${days}&months=${months}&mode=within`);
  return <>
    <Note>First-observed scenario characters are not new player accounts. A return within N days is not strict Day N retention. All results require complete source days and mature eligibility windows.</Note>
    <div className="toolbar"><label htmlFor="scenario-return-days">Return window</label><select id="scenario-return-days" value={days} onChange={e=>setDays(Number(e.target.value))}>{[1,7,14,30,60,90].map(day=><option value={day} key={day}>{day} days</option>)}</select><label htmlFor="scenario-return-months">Cohort history</label><select id="scenario-return-months" value={months} onChange={e=>setMonths(Number(e.target.value))}>{[6,12,24].map(n=><option value={n} key={n}>{n} months</option>)}</select><button className="export-button" disabled={!data?.cohorts?.length||!data.coverage.complete} onClick={()=>data&&downloadCSV('scenario-retention.csv',['Month','Cohort','Eligible','Returned any scenario','Returned same map','Returned any PvP','Window days','Coverage complete'],data.cohorts.map(c=>[c.month,c.cohortCharacters,c.eligibleCharacters,c.returnedAnyScenario,c.returnedSameMap,c.returnedAnyPvP,days,data.coverage.complete?'Yes':'No']))}>Export CSV</button></div>
    {loading?<p role="status">Loading retained scenario metrics…</p>:!data?.coverage||!Array.isArray(data.cohorts)?<Pending error={error}/>:<>
    {!data.coverage.complete?<Note>Source coverage is incomplete. These results are provisional and must not be treated as verified retention.</Note>:null}
    <section className="panel table-panel"><h3>First observed in scenarios, then returned</h3><p>{data.definition}</p><div className="table-scroller"><table><thead><tr><th>First scenario month</th><th>Characters</th><th>Eligible</th><th>Returned to scenarios</th><th>Same-map return</th><th>Any PvP return</th></tr></thead><tbody>{data.cohorts.map(c=><tr key={c.month}><td>{c.month}</td><td>{num(c.cohortCharacters)}</td><td>{num(c.eligibleCharacters)}</td><td><strong>{rate(c.returnedAnyScenario,c.eligibleCharacters,data.coverage.complete)}</strong><small>{num(c.returnedAnyScenario)} of {num(c.eligibleCharacters)}</small></td><td>{rate(c.returnedSameMap,c.eligibleCharacters,data.coverage.complete)}</td><td>{rate(c.returnedAnyPvP,c.eligibleCharacters,data.coverage.complete)}</td></tr>)}</tbody></table></div><LastCoverage coverage={data.coverage} asOf={data.asOf}/></section></>}
    <section className="panel"><h3>What the result can tell us</h3><p>This measures how often previously observed scenario characters return. By splitting same-map, any-scenario and any-PvP returns, we can separate scenario engagement from wider PvP participation without claiming to know why someone left.</p></section>
  </>;
}
export function ScenarioExperiencePanel(){
  const [window,setWindow]=useState('30d');
  const {data,loading,error}=useReport<ScenarioOutcomeReport>(`/api/retention/scenario-outcomes?window=${window}`);
  return <>
    <Note>These are observational associations. A loss, surrender or particular map appearing in someone's last scenario does not prove it caused them to leave. Repeat exposures, rotation schedules and participant selection must be considered.</Note>
    <div className="toolbar"><label htmlFor="scenario-experience-window">Observed period</label><select id="scenario-experience-window" value={window} onChange={e=>setWindow(e.target.value)}><option value="7d">7 days</option><option value="30d">30 days</option><option value="90d">90 days</option></select></div>
    {loading?<p role="status">Loading scenario experience associations…</p>:!data?.coverage||!Array.isArray(data.outcomes)||!Array.isArray(data.maps)?<Pending error={error}/>:<><section className="panel"><h3>Participation following match outcomes</h3><p>{data.definition}</p><MetricTable rows={data.outcomes} verified={data.coverage.complete}/></section><section className="panel"><h3>By scenario map</h3><MetricTable rows={data.maps} verified={data.coverage.complete}/><LastCoverage coverage={data.coverage} asOf={data.asOf}/></section></>}
  </>;
}
export function ScenarioGroupsPanel(){
  const [window,setWindow]=useState('30d');
  const {data,loading,error}=useReport<ScenarioGroupReport>(`/api/retention/scenario-groups?window=${window}`);
  return <>
    <Note>No observed same-guild teammates does not prove solo queuing. Three or four same-guild members indicate an observed cluster; five or more indicate a large cluster. Explicit upstream premade flags are a separate category and can overlap.</Note>
    <div className="toolbar"><label htmlFor="scenario-group-window">Observed period</label><select id="scenario-group-window" value={window} onChange={e=>setWindow(e.target.value)}><option value="7d">7 days</option><option value="30d">30 days</option><option value="90d">90 days</option></select></div>
    {loading?<p role="status">Loading group-related associations…</p>:!data?.coverage||!Array.isArray(data.groups)?<Pending error={error}/>:<section className="panel"><h3>Return after observed group experiences</h3><p>{data.definition}</p><MetricTable rows={data.groups} verified={data.coverage.complete}/><LastCoverage coverage={data.coverage} asOf={data.asOf}/></section>}
  </>;
}
