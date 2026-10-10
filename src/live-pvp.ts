export type PvpHourlyRow = {
  time: string;
  skirmishes: number;
  scenarios: number;
  rvr: number;
  kills: number;
  participants: number;
};

export type PvpActivityTrend = {
  hours: number;
  since: string;
  points: PvpHourlyRow[];
};

function safeCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export function summarizePvpTrend(data: PvpActivityTrend) {
  if (!data || !Array.isArray(data.points)) return null;
  if (!Number.isInteger(data.hours) || data.hours < 1 || data.hours > 24) return null;
  let rvr = 0, scenarios = 0, kills = 0, skirmishes = 0, peakHourlyParticipants = 0;
  for (const point of data.points) {
    if (!point || Number.isNaN(Date.parse(point.time))) return null;
    const counts = [point.rvr, point.scenarios, point.kills, point.skirmishes, point.participants].map(safeCount);
    if (counts.some(v => v === null)) return null;
    const [rv, sc, kl, sk, people] = counts as number[];
    if (rv + sc !== sk) return null;
    rvr += rv; scenarios += sc; kills += kl; skirmishes += sk;
    peakHourlyParticipants = Math.max(peakHourlyParticipants, people);
  }
  return {
    rvr, scenarios, kills, skirmishes, peakHourlyParticipants,
    hoursWithSavedEvents: data.points.length,
    latestHours: [...data.points].sort((a,b) => Date.parse(b.time)-Date.parse(a.time)).slice(0,8),
  };
}
