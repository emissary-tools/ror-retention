import { useState } from 'react';
import { useReport } from './api';
import { summarizePvpTrend, type PvpActivityTrend } from './live-pvp';

const fmt = (n: number) => n.toLocaleString('en-US');
function Cell({title,value,note}:{title:string;value:number;note:string}) {
  return <div className="stat-card">
    <div className="stat-title">{title}</div>
    <strong>{fmt(value)}</strong>
    <p>{note}</p>
  </div>;
}

/**
 * An immediately useful REAL report sourced from the existing, production
 * Class Activity read-only API. This is not a server-login/retention metric:
 * no whole-game absence, daily unique accounts or cross-mode churn inferred.
 */
export function RecordedPvpPanel() {
  const [hours,setHours] = useState(24);
  const {data,loading,error} = useReport<PvpActivityTrend>(`/api/class-activity-stats/activity-trend?hours=${hours}`);
  const totals = data ? summarizePvpTrend(data) : null;
  return <section className="panel" aria-label="Recorded PvP activity">
    <div className="toolbar">
      <h3>Recorded PvP activity <span className="data-badge">LIVE CLASS ACTIVITY DATA</span></h3>
      <label htmlFor="pvp-observation-hours">Period</label>
      <select id="pvp-observation-hours" value={hours} onChange={e=>setHours(Number(e.target.value))}>
        <option value={6}>6 hours</option>
        <option value={12}>12 hours</option>
        <option value={24}>24 hours</option>
      </select>
    </div>
    <p>This section reads an existing production report. It counts recorded skirmish events, not logins or all gameplay. It includes open RvR and scenarios only.</p>
    {loading ? <p aria-live="polite">Loading recorded activity…</p>
      : error ? <p role="status">Recorded activity is temporarily unavailable: {error}. <a href="/class-activity?tab=activity">Open the existing Class Activity dashboard</a>.</p>
      : !totals ? <p role="status">The activity source returned an unexpected response; no figures are being displayed.</p>
      : <>
        <div className="stats">
          <Cell title="Open RvR skirmishes" value={totals.rvr} note="Recorded event count, not unique players"/>
          <Cell title="Scenarios" value={totals.scenarios} note="Recorded event count"/>
          <Cell title="PvP kills" value={totals.kills} note="Kills in saved skirmish records"/>
          <Cell title="Peak characters in one hour" value={totals.peakHourlyParticipants} note="Distinct within one hour only; not the day's unique players"/>
        </div>
        <div className="table-scroller">
          <table>
            <thead><tr><th>Hour (UTC)</th><th>Open RvR</th><th>Scenarios</th><th>Kills</th><th>Characters in hour</th></tr></thead>
            <tbody>{totals.latestHours.map(p=><tr key={p.time}>
              <td>{new Date(p.time).toISOString().slice(0,16).replace('T',' ')}</td>
              <td>{fmt(p.rvr)}</td><td>{fmt(p.scenarios)}</td><td>{fmt(p.kills)}</td><td>{fmt(p.participants)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {totals.hoursWithSavedEvents === 0 ? <p>No recorded skirmish events in this requested period. That does not mean no one played the game.</p> : null}
        <p className="panel-caption">Window begins {data?.since ? new Date(data.since).toISOString().slice(0,16).replace('T',' ') + ' UTC' : 'unknown'}; figures may lag collection. Characters repeated in different hours are not deduplicated across the period. Source: <a href="/class-activity?tab=activity">Class Activity</a>.</p>
      </>}
  </section>;
}
