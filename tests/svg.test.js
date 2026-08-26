import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderTerminalProgress,
  renderGradientProgress,
  renderMinimalProgress,
  renderCountdownCard,
} from '../lib/svg.js';

test('renderTerminalProgress produces valid-looking SVG with escaped title', () => {
  const svg = renderTerminalProgress({
    title: '<script>evil()</script>',
    percent: 42,
    elapsedLabel: '10 days',
    remainingLabel: '20 days',
  });
  assert.match(svg, /^<svg/);
  assert.match(svg, /42%/);
  assert.doesNotMatch(svg, /<script>/);
  assert.match(svg, /&lt;script&gt;/);
});

test('renderTerminalProgress clamps out-of-range percent', () => {
  const over = renderTerminalProgress({ title: 't', percent: 150, elapsedLabel: '', remainingLabel: '' });
  assert.match(over, />100%</);
  const under = renderTerminalProgress({ title: 't', percent: -10, elapsedLabel: '', remainingLabel: '' });
  assert.match(under, />0%</);
});

test('renderGradientProgress applies a color override', () => {
  const svg = renderGradientProgress({
    title: 't', percent: 50, elapsedLabel: '', remainingLabel: '',
    colors: { accent: 'ff0000' },
  });
  assert.match(svg, /#ff0000/);
});

test('renderGradientProgress ignores a malformed color override', () => {
  const svg = renderGradientProgress({
    title: 't', percent: 50, elapsedLabel: '', remainingLabel: '',
    colors: { accent: 'not-a-hex-color; </style>' },
  });
  assert.doesNotMatch(svg, /not-a-hex-color/);
});

test('renderMinimalProgress produces a compact SVG', () => {
  const svg = renderMinimalProgress({ title: 'Year', percent: 65 });
  assert.match(svg, /width="320"/);
  assert.match(svg, /65%/);
});

test('renderCountdownCard shows zero-padded digits and pluralizes past label', () => {
  const future = renderCountdownCard({ title: 'Launch', days: 5, hours: 3, minutes: 9, isPast: false });
  assert.match(future, />05</);
  assert.match(future, />DAYS</);

  const past = renderCountdownCard({ title: 'Launch', days: 5, hours: 3, minutes: 9, isPast: true });
  assert.match(past, />DAYS AGO</);
});
