import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizePvpTrend } from '../src/live-pvp.ts';

const row=(time,rvr,scenarios,kills,participants)=>({
  time,rvr,scenarios,kills,participants,skirmishes:rvr+scenarios,
});

test('open RvR and scenario counts come from actual recorded events',()=>{
  const x=summarizePvpTrend({hours:24,since:'2026-10-09T00:00:00Z',points:[
    row('2026-10-09T10:00:00Z',4,2,27,51),
    row('2026-10-09T11:00:00Z',3,1,12,48),
  ]});
  assert.deepEqual([x.rvr,x.scenarios,x.skirmishes,x.kills,x.peakHourlyParticipants],
    [7,3,10,39,51]);
  assert.equal(x.latestHours[0].time,'2026-10-09T11:00:00Z');
});

test('peak characters in an hour is not improperly summed into daily unique players',()=>{
  const x=summarizePvpTrend({hours:24,since:'2026-10-09T00:00:00Z',points:[
    row('2026-10-09T10:00:00Z',1,1,5,50),
    row('2026-10-09T11:00:00Z',1,1,5,50),
  ]});
  assert.equal(x.peakHourlyParticipants,50);
  assert.equal(x.skirmishes,4);
});

test('invalid source responses cannot fabricate activity counts',()=>{
  assert.equal(summarizePvpTrend({hours:24,points:[row('garbage',1,0,0,1)]}),null);
  assert.equal(summarizePvpTrend({hours:24,points:[{...row('2026-10-09T11:00:00Z',1,0,0,1),skirmishes:7}]}),null);
  assert.equal(summarizePvpTrend({hours:24,points:[row('2026-10-09T11:00:00Z',-1,0,0,1)]}),null);
  assert.equal(summarizePvpTrend({hours:240,points:[]}),null);
});

test('empty periods have no events but do not mean no one played the game',()=>{
  const x=summarizePvpTrend({hours:6,since:'2026-10-09T00:00:00Z',points:[]});
  assert.equal(x.skirmishes,0);
  assert.equal(x.hoursWithSavedEvents,0);
});
