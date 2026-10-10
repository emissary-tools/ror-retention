import { useEffect, useState } from 'react';

export interface CommonMetadata {
  asOf: string;
  unit: 'character';
  event: string;
  loginTracking: boolean;
  accountLinkage: boolean;
  historicLevelSnapshots: boolean;
  sourceCoverageVerified: boolean;
  notice: string;
  status: string;
}
export interface Overview extends CommonMetadata {
  observedCharacters: number;
  observedLast7Days: number;
  observedLast30Days: number;
  newlyObservedLast30Days: number;
  notObserved30Days: number;
  notObserved60Days: number;
  notObserved90Days: number;
  withLatestKnownLevel: number;
  withLatestKnownRenownRank: number;
  firstSourceObservation: string | null;
  lastSourceObservation: string | null;
}
export interface RetentionCount { eligible: number; observed: number; percent: number | null }
export interface ObservedCohort { month: string; observedCohortSize: number; span7: RetentionCount; span30: RetentionCount; span90: RetentionCount }
export interface Cohorts extends CommonMetadata { semantics: string; months: number; cohorts: ObservedCohort[] }
export interface Progress extends CommonMetadata { semantics: string; inactiveDays: number; levelBands: {band: string; characters: number}[]; renownBands: {band: string; characters: number}[] }
export interface Capabilities { unit: string; loginTracking: boolean; accountLinkage: boolean; sourceCoverageVerified: boolean; supported: string[]; planned: string[]; prerequisites: Record<string,string> }
export interface ScenarioCoverage extends CommonMetadata { metric: string; firstScenarioDay: string | null; lastScenarioDay: string | null; lastCompleteDay: string | null; coveredDays: number; dailyRows: number; characters: number; backfillComplete: boolean; scenarioBootstrapComplete: boolean; leaderboardBackfillComplete: boolean; collectorLatestPoll: string | null; incompleteCurrentDay: boolean; gaps: string }
export interface ScenarioReturnMetric { eligible: number; strict: number; strictPercent: number | null; returnOnOrAfter: number; returnOnOrAfterPercent: number | null }
export interface ScenarioReturnCohort { cohortDay: string; cohortSize: number; returns: Record<string, ScenarioReturnMetric> }
export interface ScenarioReturns extends CommonMetadata { metric: string; semantics: string; cohortWindowDays: number; coverage: ScenarioCoverage; cohorts: ScenarioReturnCohort[] }

// The canonical Cloudflare router will proxy /api/retention to Ultra. The
// app must never send RoR GraphQL requests itself.
export function useReport<T>(url: string | null) {
  const [state, setState] = useState<{loading: boolean; data: T | null; error: string | null}>({loading: !!url, data: null, error: null});
  useEffect(() => {
    if (!url) { setState({loading: false, data: null, error: null}); return; }
    const controller = new AbortController();
    setState({loading: true, data: null, error: null});
    fetch(url, {signal: controller.signal, headers: {Accept: 'application/json'}})
      .then(async response => {
        if (!response.ok) throw Error(`Retention API returned HTTP ${response.status}`);
        const data = await response.json() as T;
        if (!data || typeof data !== 'object') throw Error('Invalid retention API response');
        return data;
      })
      .then(data => setState({loading: false, data, error: null}))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({loading: false, data: null, error: String(error instanceof Error ? error.message : error)});
      });
    return () => controller.abort();
  }, [url]);
  return state;
}
