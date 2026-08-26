import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yearProgress, periodProgress, countdown, parseDateParam } from '../lib/time.js';

test('yearProgress: Jan 1 is day 1', () => {
  const r = yearProgress(2026, new Date('2026-01-01T12:00:00Z'));
  assert.equal(r.daysElapsed, 1);
  assert.equal(r.daysInYear, 365);
  assert.equal(r.daysRemaining, 364);
});

test('yearProgress: Dec 31 is the last day, 100%', () => {
  const r = yearProgress(2026, new Date('2026-12-31T23:00:00Z'));
  assert.equal(r.daysElapsed, 365);
  assert.equal(r.daysRemaining, 0);
  assert.equal(r.percent, 100);
});

test('yearProgress: leap year has 366 days', () => {
  const r = yearProgress(2028, new Date('2028-06-01T00:00:00Z'));
  assert.equal(r.daysInYear, 366);
});

test('yearProgress: a date in the wrong year clamps into range', () => {
  const before = yearProgress(2026, new Date('2020-01-01T00:00:00Z'));
  assert.equal(before.daysElapsed, 1);
  const after = yearProgress(2026, new Date('2030-01-01T00:00:00Z'));
  assert.equal(after.daysElapsed, 365);
});

test('countdown: future date reports isPast=false with correct breakdown', () => {
  const now = new Date('2026-01-01T00:00:00Z');
  const target = new Date('2026-01-03T06:30:00Z');
  const c = countdown(target, now);
  assert.equal(c.isPast, false);
  assert.equal(c.days, 2);
  assert.equal(c.hours, 6);
  assert.equal(c.minutes, 30);
});

test('countdown: past date reports isPast=true', () => {
  const now = new Date('2026-01-10T00:00:00Z');
  const target = new Date('2026-01-08T00:00:00Z');
  const c = countdown(target, now);
  assert.equal(c.isPast, true);
  assert.equal(c.days, 2);
});

test('parseDateParam: accepts YYYY-MM-DD', () => {
  const d = parseDateParam('2026-12-25');
  assert.ok(d);
  assert.equal(d.getUTCFullYear(), 2026);
  assert.equal(d.getUTCMonth(), 11);
  assert.equal(d.getUTCDate(), 25);
});

test('parseDateParam: accepts date+time', () => {
  const d = parseDateParam('2026-12-25T09:30:00');
  assert.ok(d);
  assert.equal(d.getUTCHours(), 9);
  assert.equal(d.getUTCMinutes(), 30);
});

test('parseDateParam: rejects garbage and overflowed dates', () => {
  assert.equal(parseDateParam('not-a-date'), null);
  assert.equal(parseDateParam('2026-13-40'), null);
  assert.equal(parseDateParam(''), null);
  assert.equal(parseDateParam(undefined), null);
});

test('periodProgress: day is measured in hours elapsed of 24', () => {
  const r = periodProgress('day', new Date('2026-08-04T06:30:00Z'));
  assert.equal(r.unitsElapsed, 6);
  assert.equal(r.unitsRemaining, 18);
  assert.equal(r.unitsTotal, 24);
  assert.equal(r.percent, 27.1);
});

test('periodProgress: week is Monday-start ISO week', () => {
  // 2026-08-04 is a Tuesday; the ISO week starts Monday 2026-08-03.
  const r = periodProgress('week', new Date('2026-08-04T12:00:00Z'));
  assert.equal(r.unitsElapsed, 2);
  assert.equal(r.unitsRemaining, 5);
  assert.equal(r.unitsTotal, 7);
});

test('periodProgress: month counts day-of-month against days-in-month', () => {
  // 2026-08-04, August has 31 days.
  const r = periodProgress('month', new Date('2026-08-04T12:00:00Z'));
  assert.equal(r.unitsElapsed, 4);
  assert.equal(r.unitsTotal, 31);
  assert.equal(r.unitsRemaining, 27);
});

test('periodProgress: quarter spans 3 calendar months', () => {
  // 2026-08-04 is the 35th day of Q3 2026 (Jul 31 + Aug 4), Q3 has 92 days.
  const r = periodProgress('quarter', new Date('2026-08-04T12:00:00Z'));
  assert.equal(r.unitsElapsed, 35);
  assert.equal(r.unitsTotal, 92);
});

test('periodProgress: year matches yearProgress for the same date', () => {
  const now = new Date('2026-08-04T12:00:00Z');
  const yp = yearProgress(2026, now);
  const pp = periodProgress('year', now);
  assert.equal(pp.unitsElapsed, yp.daysElapsed);
  assert.equal(pp.unitsTotal, yp.daysInYear);
  assert.equal(pp.percent, yp.percent);
});
