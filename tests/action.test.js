import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildQuery } from '../action/mapInputs.js';
import { renderFromQuery } from '../lib/render.js';

const NOW = new Date('2026-08-27T00:00:00Z');

test('buildQuery drops empty-string inputs so renderFromQuery falls back to its own defaults', () => {
  const inputs = {
    type: '', date: '', label: '', theme: '', style: '', period: '',
    locale: '', tz: '', font: '', color: '', accent2: '', bg: '',
    border: '', text: '', dim: '', 'bar-bg': '', motion: 'reduce',
  };
  assert.deepEqual(buildQuery(inputs), { motion: 'reduce' });
});

test('buildQuery maps bar-bg (kebab-case Action input) to barBg (query key)', () => {
  const query = buildQuery({ 'bar-bg': '21262d', motion: 'reduce' });
  assert.equal(query.barBg, '21262d');
  assert.equal(query['bar-bg'], undefined);
});

test('buildQuery passes through a full set of inputs unchanged (except bar-bg)', () => {
  const inputs = {
    type: 'countdown', date: '2026-12-31', label: 'New Year', theme: 'dracula',
    style: 'badge', period: 'week', locale: 'ko', tz: 'Asia/Seoul', font: 'jetbrains',
    color: 'ff6b6b', accent2: '00ff00', bg: '111111', border: '222222',
    text: '333333', dim: '444444', 'bar-bg': '555555', motion: 'reduce',
  };
  const query = buildQuery(inputs);
  assert.equal(query.type, 'countdown');
  assert.equal(query.date, '2026-12-31');
  assert.equal(query.theme, 'dracula');
  assert.equal(query.barBg, '555555');
  assert.equal(query.motion, 'reduce');
});

test('a mapped query renders successfully through renderFromQuery', () => {
  const query = buildQuery({
    type: 'countdown', date: '2026-12-31', label: 'New Year',
    theme: 'dracula', motion: 'reduce',
  });
  const { svg, status } = renderFromQuery(query, NOW);
  assert.equal(status, 200);
  assert.match(svg, /New Year/);
});
