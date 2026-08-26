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
