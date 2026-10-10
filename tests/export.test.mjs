import test from 'node:test';
import assert from 'node:assert/strict';
import { csvText } from '../src/export.ts';

test('CSV escapes spreadsheet formulas and quoted values', () => {
  const csv = csvText(['Label', 'Characters'], [
    ['=HYPERLINK("https://example.invalid")', 10],
    ['+SUM(1,1)', 12],
    ['-5', 0],
    ['@FIELD', null],
    ['Safe,Text', 7],
    ['A "quoted" value', 4],
  ]);
  assert.match(csv, /"'=HYPERLINK\(""https:\/\/example\.invalid""\)"/);
  assert.match(csv, /"'\+SUM\(1,1\)"/);
  assert.match(csv, /"'-5"/);
  assert.match(csv, /"'@FIELD"/);
  assert.match(csv, /"Safe,Text"/);
  assert.match(csv, /"A ""quoted"" value"/);
  assert.match(csv, /"'@FIELD",""\r\n/);
});

test('CSV never inserts an invented zero for unknown metrics', () => {
  const csv = csvText(['Return count','Eligible'],[[null,0]]);
  assert.equal(csv,'"Return count","Eligible"\r\n"","0"\r\n');
});
