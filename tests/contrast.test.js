import { test } from 'node:test';
import assert from 'node:assert/strict';

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

// Must match lib/svg.js's THEMES + the safety-sign colors exactly — a
// deliberate duplication (not imported) so this test fails loudly if
// someone changes a color there without re-checking contrast here.
const PAIRS = [
  ['dark theme: text on bg', 'c9d1d9', '0d1117'],
  ['dark theme: dim on bg', '8b949e', '0d1117'],
  ['dark theme: accent on bg', '58a6ff', '0d1117'],
  ['dark theme: accent2 on bg', '3fb950', '0d1117'],
  ['light theme: text on bg', '1f2328', 'ffffff'],
  ['light theme: dim on bg', '59636e', 'ffffff'],
  ['light theme: accent on bg', '0969da', 'ffffff'],
  ['light theme: accent2 on bg', '1a7f37', 'ffffff'],
  ['safety sign: white number on black', 'ffffff', '161616'],
  ['safety sign: yellow caption on black', 'f2c400', '161616'],
];

for (const [name, fg, bg] of PAIRS) {
  test(`WCAG AA (>=4.5:1) contrast: ${name}`, () => {
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= 4.5, `${name}: ${ratio.toFixed(2)}:1 is below WCAG AA (4.5:1)`);
  });
}
