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

test('type=countdown&style=badge renders the compact badge, not the full card', () => {
  const { svg, status } = renderFromQuery(
    { type: 'countdown', date: '2026-09-25', label: '2026 추석', style: 'badge' },
    NOW
  );
  assert.equal(status, 200);
  assert.match(svg, /width="200" height="60"/);
  assert.match(svg, />D-29</); // 2026-08-27 -> 2026-09-25 is 29 days
  assert.match(svg, /2026 추석/);
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

test('type=dayssince with tz interprets the date in the given zone, not UTC', () => {
  // A reference "now" with a non-zero hour so the +9h Seoul shift crosses
  // a whole extra day boundary (unlike the shared NOW fixture, which is
  // exact UTC midnight and would floor to the same day count either way).
  const now2 = new Date('2026-08-27T23:00:00Z');
  // No tz: 2026-08-25T00:00:00Z is 71h before now2 -> floor(71/24) = 2 days.
  const withoutTz = renderFromQuery({ type: 'dayssince', date: '2026-08-25', label: 'X' }, now2);
  assert.match(withoutTz.svg, />2</);
  // With tz: 2026-08-25 00:00 KST = 2026-08-24T15:00:00Z, 80h before now2 -> floor(80/24) = 3 days.
  const withTz = renderFromQuery({ type: 'dayssince', date: '2026-08-25', tz: 'Asia/Seoul', label: 'X' }, now2);
  assert.equal(withTz.status, 200);
  assert.match(withTz.svg, />3</);
});

test('an unrecognized tz renders a 400, not a silent UTC fallback', () => {
  const { status } = renderFromQuery({ type: 'countdown', date: '2026-12-25', tz: 'Not/AZone' }, NOW);
  assert.equal(status, 400);
});

test('locale=zh and locale=ja render their own titles (not falling back to English)', () => {
  const zh = renderFromQuery({ locale: 'zh' }, NOW);
  assert.match(zh.svg, /2026年进度/);

  const ja = renderFromQuery({ locale: 'ja' }, NOW);
  assert.match(ja.svg, /2026年の進捗/);
});

test('locale=zh/ja also localize period titles and countdown phrasing', () => {
  const zhWeek = renderFromQuery({ locale: 'zh', period: 'week' }, NOW);
  assert.match(zhWeek.svg, /本周/);

  const jaCountdown = renderFromQuery({ locale: 'ja', type: 'countdown', date: '2026-12-25', label: 'クリスマス' }, NOW);
  assert.match(jaCountdown.svg, /クリスマスまで/);
});

test('an unrecognized locale falls back to English rather than erroring', () => {
  const { status, svg } = renderFromQuery({ locale: 'xx' }, NOW);
  assert.equal(status, 200);
  assert.match(svg, /2026 Progress/);
});

test('locale=es and locale=pt render their own titles', () => {
  const es = renderFromQuery({ locale: 'es' }, NOW);
  assert.match(es.svg, /Progreso de 2026/);

  const pt = renderFromQuery({ locale: 'pt' }, NOW);
  assert.match(pt.svg, /Progresso de 2026/);
});

test('locale=es/pt localize period titles and countdown phrasing', () => {
  const esMonth = renderFromQuery({ locale: 'es', period: 'month' }, NOW);
  assert.match(esMonth.svg, /Agosto/);

  const ptCountdown = renderFromQuery({ locale: 'pt', type: 'countdown', date: '2026-12-25', label: 'Natal' }, NOW);
  assert.match(ptCountdown.svg, /Natal em/);
});

test('motion=reduce disables the ticking seconds animation', () => {
  const { svg } = renderFromQuery({ type: 'countdown', date: '2026-12-25', motion: 'reduce' }, NOW);
  assert.doesNotMatch(svg, /<animate /);
});
