import { useState } from 'react';
import { useReport } from './api';

interface InstanceSourceCoverage {
  sourceWindowCertified: boolean;
  savedRunImportFinished: boolean;
  sourceEpochStart: string | null;
  lastCompleteDay: string | null;
  missingDays: number | null;
  status: 'not_imported'|'importing'|'imported_uncertified'|'partially_certified'|'certified';
}
interface InstanceRunRow {
  instanceId: string;
  name: string;
  observedRuns: number | null;
  observedCharacters: number | null;
  // A repeat rate denominator requires independently certified input windows.
  repeatRate: number | null;
  eligibleCharacters: number | null;
}
interface InstanceActivityReport {
  asOf: string | null;
  unit: 'character';
  mode: 'instance';
  scope: 'recorded_sources_only';
  definition: string;
  period: { fromDay: string | null; throughDay: string | null; days: number };
  coverage: InstanceSourceCoverage;
  observedRuns: number | null;
  observedCharacters: number | null;
  observedCharacterDays: number | null;
  repeatedRunCharacters: number | null;
  instances: InstanceRunRow[];
  notice: string;
}
const fmt = (x: number|null|undefined) => x == null || !Number.isFinite(x)
  ? 'Unavailable'
  : x.toLocaleString('en-US');
const pct = (x: number|null|undefined) => x == null || !Number.isFinite(x)
  ? 'Not certified'
  : `${x.toFixed(1)}%`;

export function InstanceActivityPanel() {
  const [days,setDays] = useState(()=>{
    const n = Number(new URLSearchParams(window.location.search).get('days'));
    return [7,30,90].includes(n) ? n : 30;
  });
  const {data, loading, error} = useReport<InstanceActivityReport>(`/api/retention/instance-activity?days=${days}`);
  const compatible = data?.unit === 'character' && data.mode === 'instance'
    && data.scope === 'recorded_sources_only';

  return <>
    <div className="toolbar">
      <label htmlFor="instance-observation-window">Observation window</label>
      <select id="instance-observation-window" value={days} onChange={e=>{
        const next = Number(e.target.value);
        setDays(next);
        const url = new URL(window.location.href);
        url.searchParams.set('days',String(next));
        window.history.replaceState({},'',url);
      }}>
        <option value={7}>Last 7 days</option>
        <option value={30}>Last 30 days</option>
        <option value={90}>Last 90 days</option>
      </select>
    </div>
    <div className="method-note" role="note">
      <span className="note-marker">!</span><span>
        Instance participation is evidence of PvE gameplay. It is not a complete
        account-login record or proof of all PvE activity. Observation days use the
        instance run's UTC start date, which may differ from a participant's joining day.
        Missing records do not mean that a character stopped playing.
      </span>
    </div>
    {loading ? <div className="empty-state" aria-live="polite">Loading saved instance observations…</div>
      : !data ? <div className="empty-state planned">
        <span className="label-overline">Source found, historical import pending</span>
        <h3>Instance participation is not connected yet</h3>
        <p>The existing game API exposes instance runs with participant character IDs.
          A complete, checkpointed import and independently assessed source coverage
          must precede verified retention figures.</p>
        {error ? <p>Backend status: {error}</p> : null}
      </div>
      : !compatible ? <div className="method-note" role="alert">
          <span className="note-marker">!</span>
          <span>Unsupported response scope. Account counts or unqualified full-server
            participation cannot be displayed here.</span>
        </div>
      : data.coverage.status === 'not_imported' && data.observedRuns == null
        ? <div className="empty-state planned">
            <span className="label-overline">Import not finished</span>
            <h3>Historical dungeon participation is not available yet</h3>
            <p>The game exposes instance runs with character IDs, but
              the recorded history has not been fully imported and verified.
              No missing activity is being counted as zero.</p>
          </div>
        : <>
        <section className="panel">
          <h3>Recorded dungeon and instance activity</h3>
          <p>{data.period.fromDay && data.period.throughDay ? `${data.period.fromDay} to ${data.period.throughDay}, UTC` : 'Observation window not yet verified'}</p>
          <dl className="key-values">
            <dt>Saved run import</dt>
            <dd>{data.coverage.savedRunImportFinished?'Finished for recorded crawl':'Incomplete or not started'}</dd>
            <dt>Independent source-window certification</dt>
            <dd>{data.coverage.sourceWindowCertified?'Certified for reported window':'Not certified'}</dd>
            <dt>Most recent independently complete UTC day</dt>
            <dd>{data.coverage.lastCompleteDay ?? 'Unknown'}</dd>
            <dt>Saved source status</dt>
            <dd>{data.coverage.status.replaceAll('_',' ')}</dd>
          </dl>
          <div className="stats">
            <div className="stat-card"><div className="stat-title">Observed instance runs</div><strong>{fmt(data.observedRuns)}</strong><p>Saved positive observations, not all dungeon sessions</p></div>
            <div className="stat-card"><div className="stat-title">Observed characters</div><strong>{fmt(data.observedCharacters)}</strong><p>Unique immutable character IDs associated with runs</p></div>
            <div className="stat-card"><div className="stat-title">Character-days</div><strong>{fmt(data.observedCharacterDays)}</strong><p>Deduplicated on run start day</p></div>
            <div className="stat-card"><div className="stat-title">Verified repeat participants</div><strong>{data.coverage.sourceWindowCertified?fmt(data.repeatedRunCharacters):'Not certified'}</strong><p>Requires complete comparable observation windows</p></div>
          </div>
          <div className="method-note" role="note">
            <span className="note-marker">!</span><span>
              {data.notice || 'All totals are observed-character records, not game account sessions.'}
              {!data.coverage.sourceWindowCertified
                ? ' These are positive recorded observations only; no absence or retention percentage is certified.'
                : ''}
            </span>
          </div>
        </section>
        <section className="panel table-panel">
          <h3>Instance participation by dungeon</h3>
          <div className="table-scroller">
            <table>
              <thead><tr><th>Instance</th><th>Observed runs</th><th>Observed characters</th><th>Repeat participation</th></tr></thead>
              <tbody>{data.instances.map(row=><tr key={row.instanceId}>
                <td>{row.name}</td>
                <td>{fmt(row.observedRuns)}</td>
                <td>{fmt(row.observedCharacters)}</td>
                <td>{data.coverage.sourceWindowCertified && row.eligibleCharacters != null
                  ? pct(row.repeatRate)
                  : 'Not certified'}</td>
              </tr>)}</tbody>
            </table>
          </div>
          {!data.instances.length ? <p>No sourced instance breakdown is available yet.</p> : null}
          <p className="data-stamp">Report calculated: {data.asOf ?? 'Unavailable'}. A snapshot timestamp does not certify source completeness.</p>
        </section>
      </>}
  </>;
}
