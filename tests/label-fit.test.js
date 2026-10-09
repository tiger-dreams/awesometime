import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderTerminalProgress,
  renderGradientProgress,
  renderMinimalProgress,
  renderCountdownCard,
  renderCountdownBadge,
  renderSafetySign,
} from '../lib/svg.js';

const LONG = 'A'.repeat(80);
const base = { percent: 42, elapsedLabel: '10 days elapsed', remainingLabel: '20 days left' };

test('long labels are truncated with an ellipsis in every style', () => {
  const svgs = [
    renderTerminalProgress({ ...base, title: LONG }),
    renderGradientProgress({ ...base, title: LONG }),
    renderMinimalProgress({ title: LONG, percent: 42 }),
    renderCountdownCard({ title: LONG, days: 3, hours: 2, minutes: 1, seconds: 0, isPast: false }),
    renderCountdownBadge({ title: LONG, days: 3, isPast: false }),
    renderSafetySign({ title: LONG, days: 3 }),
  ];
  for (const svg of svgs) {
    assert.ok(svg.includes('…'), 'expected an ellipsis for an 80-char label');
  }
});

test('short labels are left untouched', () => {
  const svg = renderCountdownBadge({ title: 'Release', days: 3, isPast: false });
  assert.ok(svg.includes('Release'));
  assert.ok(!svg.includes('…'));
});

test('the accessible title keeps the full, untruncated label', () => {
  const svg = renderTerminalProgress({ ...base, title: LONG });
  assert.ok(svg.includes(`<title>${LONG}`), 'a11y <title> should keep the full label');
});
