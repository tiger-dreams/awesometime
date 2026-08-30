import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderTerminalProgress,
  renderGradientProgress,
  renderMinimalProgress,
  renderCountdownCard,
  renderCountdownBadge,
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

test('renderCountdownCard embeds a live-animating seconds digit (60 frames, SEC label)', () => {
  const svg = renderCountdownCard({ title: 'Launch', days: 5, hours: 3, minutes: 9, seconds: 42, isPast: false });
  assert.match(svg, />SEC</);
  // one <animate> per second-frame, 0-59
  const animateCount = (svg.match(/<animate /g) || []).length;
  assert.equal(animateCount, 60);
  // the frame for the current second (42) must be visible immediately (keyTimes starts "0;0;")
  assert.match(svg, /keyTimes="0;0\.0000;0\.0167;1"/);
});

test('renderCountdownCard seconds digit defaults to 0 and stays well-formed', () => {
  const svg = renderCountdownCard({ title: 'Launch', days: 0, hours: 0, minutes: 0, isPast: false });
  assert.match(svg, /^<svg/);
  assert.match(svg, /<\/svg>$/);
});

test('renderCountdownBadge is a small, purpose-built card, not a shrunk countdown card', () => {
  const svg = renderCountdownBadge({ title: '2026 추석', days: 25, isPast: false });
  assert.match(svg, /width="200" height="60"/);
  assert.match(svg, />D-25</);
  // No box grid, no ticking-seconds animation — those don't fit a badge this small.
  assert.equal((svg.match(/<animate /g) || []).length, 0);
  assert.equal((svg.match(/<rect /g) || []).length, 1);
});

test('renderCountdownBadge uses D+N for a past date and clamps negative days to 0', () => {
  const svg = renderCountdownBadge({ title: 'Launch', days: -3, isPast: true });
  assert.match(svg, />D\+0</);
});

test('renderCountdownBadge escapes the title', () => {
  const svg = renderCountdownBadge({ title: '<script>evil()</script>', days: 1, isPast: false });
  assert.doesNotMatch(svg, /<script>evil/);
});

test('theme=auto emits CSS custom properties and a media-query style block, no literal fallback hex', () => {
  const svg = renderTerminalProgress({
    title: 'Auto', percent: 50, elapsedLabel: '', remainingLabel: '', theme: 'auto',
  });
  assert.match(svg, /<style>:root\{--at-bg:/);
  assert.match(svg, /@media \(prefers-color-scheme: dark\)/);
  assert.match(svg, /fill="var\(--at-text\)"/);
});

test('theme=auto respects color overrides in both the light base and dark override', () => {
  const svg = renderTerminalProgress({
    title: 'Auto', percent: 50, elapsedLabel: '', remainingLabel: '', theme: 'auto',
    colors: { accent: 'ff6b6b' },
  });
  // The override applies to both branches of the style block (light base + dark media query).
  const occurrences = (svg.match(/#ff6b6b/g) || []).length;
  assert.equal(occurrences, 2);
});

test('theme=dark/light still emit plain literal colors, no var() or style block', () => {
  const svg = renderTerminalProgress({ title: 'Plain', percent: 50, elapsedLabel: '', remainingLabel: '', theme: 'dark' });
  assert.doesNotMatch(svg, /var\(--at-/);
  assert.doesNotMatch(svg, /<style>/);
});

test('every style embeds a descriptive <title> for accessibility', () => {
  const terminal = renderTerminalProgress({ title: '2026 Progress', percent: 65, elapsedLabel: '238 days elapsed', remainingLabel: '127 days left' });
  assert.match(terminal, /<title>2026 Progress: 65% — 238 days elapsed, 127 days left<\/title>/);

  const gradient = renderGradientProgress({ title: '2026 Progress', percent: 65, elapsedLabel: '238 days elapsed', remainingLabel: '127 days left' });
  assert.match(gradient, /<title>2026 Progress: 65%/);

  const minimal = renderMinimalProgress({ title: 'Year', percent: 65 });
  assert.match(minimal, /<title>Year: 65% complete<\/title>/);

  const countdown = renderCountdownCard({ title: 'Launch in', days: 5, hours: 3, minutes: 9, isPast: false });
  assert.match(countdown, /<title>Launch in 5 days, 3 hours, 9 minutes<\/title>/);
});

test('renderCountdownCard: motion=reduce (reduceMotion) renders a static digit, no SMIL', () => {
  const animated = renderCountdownCard({ title: 'Launch', days: 5, hours: 3, minutes: 9, seconds: 42, isPast: false });
  assert.match(animated, /<animate /);

  const reduced = renderCountdownCard({ title: 'Launch', days: 5, hours: 3, minutes: 9, seconds: 42, isPast: false, reduceMotion: true });
  assert.doesNotMatch(reduced, /<animate /);
  assert.match(reduced, />42</);
});
