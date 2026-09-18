import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NAMED_THEMES } from '../lib/themes.js';

// WCAG 2.x relative luminance / contrast ratio — same formula used by any
// accessibility checker. Kept as a standalone test (not imported from
// lib/) so a future color change to lib/svg.js's THEMES is checked against
// these exact values, not against itself.
function luminance(hex) {
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Built-in themes (must match lib/svg.js's BUILTIN_THEMES exactly)
const BUILTIN_THEMES = {
  dark: {
    bg: '#0d1117',
    text: '#c9d1d9',
    dim: '#8b949e',
    accent: '#58a6ff',
    accent2: '#3fb950',
  },
  light: {
    bg: '#ffffff',
    text: '#1f2328',
    dim: '#59636e',
    accent: '#0969da',
    accent2: '#1a7f37',
  },
};

// Safety sign colors (not theme-linked, but tested for contrast)
const SAFETY_COLORS = {
  white: '#ffffff',
  black: '#161616',
  yellow: '#f2c400',
};

const ALL_THEMES = { ...BUILTIN_THEMES, ...NAMED_THEMES };

// Test pairs: [description, fgKey, bgKey]
const PAIR_KEYS = [
  ['text on bg', 'text', 'bg'],
  ['dim on bg', 'dim', 'bg'],
  ['accent on bg', 'accent', 'bg'],
  ['accent2 on bg', 'accent2', 'bg'],
];

for (const [themeName, theme] of Object.entries(ALL_THEMES)) {
  for (const [pairName, fgKey, bgKey] of PAIR_KEYS) {
    const fg = theme[fgKey].slice(1); // strip #
    const bg = theme[bgKey].slice(1);
    test(`WCAG AA (>=4.5:1) contrast: ${themeName} - ${pairName}`, () => {
      const ratio = contrast(fg, bg);
      assert.ok(ratio >= 4.5, `${themeName} - ${pairName}: ${ratio.toFixed(2)}:1 is below WCAG AA (4.5:1)`);
    });
  }
}

// Safety sign contrast tests (unchanged)
test('WCAG AA (>=4.5:1) contrast: safety sign - white number on black', () => {
  const ratio = contrast(SAFETY_COLORS.white.slice(1), SAFETY_COLORS.black.slice(1));
  assert.ok(ratio >= 4.5, `safety sign - white number on black: ${ratio.toFixed(2)}:1 is below WCAG AA (4.5:1)`);
});

test('WCAG AA (>=4.5:1) contrast: safety sign - yellow caption on black', () => {
  const ratio = contrast(SAFETY_COLORS.yellow.slice(1), SAFETY_COLORS.black.slice(1));
  assert.ok(ratio >= 4.5, `safety sign - yellow caption on black: ${ratio.toFixed(2)}:1 is below WCAG AA (4.5:1)`);
});