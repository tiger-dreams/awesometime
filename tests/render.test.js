import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderFromQuery } from '../lib/render.js';

const NOW = new Date('2026-08-27T00:00:00Z');

test('default query renders a year-progress card for the current year', () => {
  const { svg, status } = renderFromQuery({}, NOW);
  assert.equal(status, 200);
  assert.match(svg, /2026/);
});

test('type=countdown with a valid future date renders 200', () => {
  const { svg, status } = renderFromQuery({ type: 'countdown', date: '2026-12-31', label: 'New Year' }, NOW);
  assert.equal(status, 200);
  assert.match(svg, /New Year/);
});

test('type=countdown with a missing date renders a 400 error card', () => {
  const { status } = renderFromQuery({ type: 'countdown' }, NOW);
  assert.equal(status, 400);
});

test('type=countdown with a garbage date renders a 400 error card', () => {
  const { status } = renderFromQuery({ type: 'countdown', date: 'whenever' }, NOW);
  assert.equal(status, 400);
});

test('unknown style falls back to terminal instead of throwing', () => {
  const { status } = renderFromQuery({ style: 'not-a-real-style' }, NOW);
  assert.equal(status, 200);
});

test('locale=ko swaps in Korean labels', () => {
  const { svg } = renderFromQuery({ locale: 'ko' }, NOW);
  assert.match(svg, /진행률/);
});

test('font param swaps the font-family stack, unknown font falls back to default', () => {
  const jetbrains = renderFromQuery({ font: 'jetbrains' }, NOW);
  assert.match(jetbrains.svg, /JetBrains Mono/);

  const fallback = renderFromQuery({ font: 'not-a-real-font' }, NOW);
  assert.match(fallback.svg, /SFMono-Regular/);
});

test('period=week/month/quarter/day render 200 with period-appropriate titles', () => {
  const week = renderFromQuery({ period: 'week' }, NOW);
  assert.equal(week.status, 200);
  assert.match(week.svg, /This Week/);

  const month = renderFromQuery({ period: 'month' }, NOW);
  assert.equal(month.status, 200);
  assert.match(month.svg, /August/);

  const quarter = renderFromQuery({ period: 'quarter' }, NOW);
  assert.equal(quarter.status, 200);
  assert.match(quarter.svg, /Q3 2026/);

  const day = renderFromQuery({ period: 'day' }, NOW);
  assert.equal(day.status, 200);
  assert.match(day.svg, /hours elapsed/);
});

test('an unrecognized period falls back to year (not a 400/crash)', () => {
  const { status, svg } = renderFromQuery({ period: 'fortnight' }, NOW);
  assert.equal(status, 200);
  assert.match(svg, /2026 Progress/);
});

test('period=year with an explicit year= still honors the requested year', () => {
  const { svg } = renderFromQuery({ period: 'year', year: '2028' }, NOW);
  assert.match(svg, /2028/);
});

test('type=dayssince renders a safety-sign card for a past date', () => {
  const { svg, status } = renderFromQuery({ type: 'dayssince', date: '2026-08-01', label: 'Last Incident' }, NOW);
  assert.equal(status, 200);
  assert.match(svg, />DAYS SINCE</);
  assert.match(svg, /LAST INCIDENT/);
  assert.match(svg, />26</); // Aug 1 -> Aug 27 is 26 days
});

test('type=dayssince with a future date says DAYS UNTIL instead', () => {
  const { svg } = renderFromQuery({ type: 'dayssince', date: '2026-12-25', label: 'Launch' }, NOW);
  assert.match(svg, />DAYS UNTIL</);
});

test('type=dayssince with a missing/invalid date renders a 400 error card', () => {
  const { status } = renderFromQuery({ type: 'dayssince' }, NOW);
  assert.equal(status, 400);
});
