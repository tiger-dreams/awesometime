const THEMES = {
  dark: {
    bg: '#0d1117',
    border: '#30363d',
    text: '#c9d1d9',
    dim: '#8b949e',
    barBg: '#21262d',
    accent: '#58a6ff',
    accent2: '#3fb950',
  },
  light: {
    bg: '#ffffff',
    border: '#d0d7de',
    text: '#1f2328',
    dim: '#59636e',
    barBg: '#eef0f2',
    accent: '#0969da',
    accent2: '#1a7f37',
  },
};

// Curated monospace stacks engineers actually have installed (or that
// degrade gracefully to a familiar system mono font). `mono` is the
// default; pass `?font=jetbrains` etc. to pick another. Each entry leads
// with the named font so it's used where a viewer has it, and falls back
// through other popular dev fonts before hitting the platform default —
// no font files are embedded, so nothing renders until *some* fallback in
// the chain is actually installed, same as any CSS font-family stack.
const FONT_PRESETS = {
  mono: "'SFMono-Regular','Consolas','Liberation Mono','Menlo',monospace",
  jetbrains: "'JetBrains Mono','SFMono-Regular','Consolas','Menlo',monospace",
  fira: "'Fira Code','JetBrains Mono','SFMono-Regular','Consolas',monospace",
  ibm: "'IBM Plex Mono','SFMono-Regular','Consolas','Menlo',monospace",
  cascadia: "'Cascadia Code','Cascadia Mono','Consolas','Menlo',monospace",
  space: "'Space Mono','SFMono-Regular','Consolas',monospace",
};

function resolveFont(key) {
  return FONT_PRESETS[key] || FONT_PRESETS.mono;
}

function escapeXml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[c]));
}

function clampPercent(p) {
  return Math.min(100, Math.max(0, p));
}

const HEX_COLOR = /^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;

/**
 * Resolves a theme, allowing callers to override individual colors (e.g.
 * `?color=ff6b6b&bg=1a1a2e`) without picking a whole new theme. Unknown or
 * malformed overrides are ignored so a bad query param can't break the SVG.
 * @param {'dark'|'light'} theme
 * @param {{ accent?: string, accent2?: string, bg?: string }} [overrides]
 */
function resolveTheme(theme, overrides = {}) {
  const base = THEMES[theme] || THEMES.dark;
  const next = { ...base };
  for (const key of ['accent', 'accent2', 'bg']) {
    const v = overrides[key];
    if (typeof v === 'string' && HEX_COLOR.test(v)) next[key] = `#${v}`;
  }
  return next;
}

const THEME_KEYS = ['bg', 'border', 'text', 'dim', 'barBg', 'accent', 'accent2'];

/**
 * `theme=auto` support: instead of resolving to concrete hex values, every
 * color resolves to a `var(--at-KEY)` reference. `autoStyleBlock()` then
 * emits a `<style>` defining those variables for light mode as the base
 * (so viewers whose browser/OS don't report a preference still get a
 * sensible default) and overrides them under
 * `@media (prefers-color-scheme: dark)`. This works inside a plain
 * `<img>`-embedded SVG in Chrome/Firefox — the same mechanism sites like
 * github-readme-stats use for auto dark-mode badges — though it degrades
 * silently (stays light) on renderers that don't support CSS custom
 * properties inside SVG `<style>`, notably older Safari.
 * @param {{ accent?: string, accent2?: string, bg?: string }} [overrides]
 */
function resolveThemeAuto() {
  const t = {};
  for (const key of THEME_KEYS) t[key] = `var(--at-${key})`;
  return t;
}

function autoStyleBlock(overrides = {}) {
  const light = resolveTheme('light', overrides);
  const dark = resolveTheme('dark', overrides);
  const vars = (t) => THEME_KEYS.map((k) => `--at-${k}:${t[k]};`).join('');
  return `<style>:root{${vars(light)}}@media (prefers-color-scheme: dark){:root{${vars(dark)}}}</style>`;
}

function resolveThemeOrAuto(theme, overrides) {
  return theme === 'auto' ? resolveThemeAuto() : resolveTheme(theme, overrides);
}

/**
 * Renders the block progress bar used by the "terminal" style as actual
 * <rect> elements (not Unicode block-character glyphs, which aren't
 * guaranteed to exist in every monospace font a viewer's browser falls
 * back to — a rect always renders identically).
 */
function blockBarRects({ x, y, segments, filled, segW, segH, gap, filledColor, emptyColor }) {
  let out = '';
  for (let i = 0; i < segments; i++) {
    const sx = x + i * (segW + gap);
    out += `<rect x="${sx}" y="${y}" width="${segW}" height="${segH}" rx="1" fill="${i < filled ? filledColor : emptyColor}"/>`;
  }
  return out;
}

const WIDTH = 480;
const HEIGHT = 120;

function card({ t, children, width = WIDTH, height = HEIGHT, a11yTitle, styleBlock = '' }) {
  const title = a11yTitle ? `<title>${escapeXml(a11yTitle)}</title>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  ${styleBlock}
  ${title}
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${t.bg}" stroke="${t.border}"/>
  ${children}
</svg>`;
}

/**
 * "terminal" style: monospace card with a block-character progress bar,
 * mirroring the look of a CLI progress indicator.
 * `colors` optionally overrides `accent`, `accent2`, and/or `bg` (hex, no `#`)
 * so consumers can theme the card to match their own site without picking
 * a whole new named theme.
 */
export function renderTerminalProgress({ title, percent, elapsedLabel, remainingLabel, theme = 'dark', colors, font: fontKey }) {
  const t = resolveThemeOrAuto(theme, colors);
  const font = resolveFont(fontKey);
  const pct = clampPercent(percent);
  const segments = 32;
  const filled = Math.round((pct / 100) * segments);
  const gap = 3;
  const segW = (WIDTH - 48 - gap * (segments - 1)) / segments;
  const bar = blockBarRects({
    x: 24, y: 52, segments, filled, segW, segH: 16, gap,
    filledColor: t.accent2, emptyColor: t.barBg,
  });
  return card({
    t,
    styleBlock: theme === 'auto' ? autoStyleBlock(colors) : '',
    a11yTitle: `${title}: ${Math.round(pct)}% — ${elapsedLabel}, ${remainingLabel}`,
    children: `
  <text x="24" y="34" font-family="${font}" font-size="15" font-weight="600" fill="${t.text}">${escapeXml(title)}</text>
  <text x="${WIDTH - 24}" y="34" text-anchor="end" font-family="${font}" font-size="15" font-weight="600" fill="${t.accent}">${Math.round(pct)}%</text>
  ${bar}
  <text x="24" y="94" font-family="${font}" font-size="13" fill="${t.dim}">${escapeXml(elapsedLabel)} · ${escapeXml(remainingLabel)}</text>
  `,
  });
}

/**
 * "gradient" style: a smooth gradient-filled progress bar.
 */
export function renderGradientProgress({ title, percent, elapsedLabel, remainingLabel, theme = 'dark', colors, font: fontKey }) {
  const t = resolveThemeOrAuto(theme, colors);
  const font = resolveFont(fontKey);
  const pct = clampPercent(percent);
  const barX = 24;
  const barW = WIDTH - 48;
  const barY = 58;
  const barH = 14;
  const fillW = Math.round((pct / 100) * barW);
  const gradId = `at-grad-${theme}-${Math.round(pct)}`;
  return card({
    t,
    styleBlock: theme === 'auto' ? autoStyleBlock(colors) : '',
    a11yTitle: `${title}: ${Math.round(pct)}% — ${elapsedLabel}, ${remainingLabel}`,
    children: `
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${t.accent}"/>
      <stop offset="100%" stop-color="${t.accent2}"/>
    </linearGradient>
  </defs>
  <text x="24" y="34" font-family="${font}" font-size="15" font-weight="600" fill="${t.text}">${escapeXml(title)}</text>
  <text x="${WIDTH - 24}" y="34" text-anchor="end" font-family="${font}" font-size="15" font-weight="600" fill="${t.text}">${Math.round(pct)}%</text>
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="7" fill="${t.barBg}"/>
  <rect x="${barX}" y="${barY}" width="${fillW}" height="${barH}" rx="7" fill="url(#${gradId})"/>
  <text x="24" y="94" font-family="${font}" font-size="13" fill="${t.dim}">${escapeXml(elapsedLabel)} · ${escapeXml(remainingLabel)}</text>
  `,
  });
}

/**
 * "minimal" style: a single thin line, no card chrome — for tucking into
 * dense layouts.
 */
export function renderMinimalProgress({ title, percent, theme = 'dark', colors, font: fontKey }) {
  const t = resolveThemeOrAuto(theme, colors);
  const font = resolveFont(fontKey);
  const pct = clampPercent(percent);
  const barX = 16;
  const barW = 320 - 32;
  const barY = 30;
  const barH = 6;
  const fillW = Math.round((pct / 100) * barW);
  const styleBlock = theme === 'auto' ? autoStyleBlock(colors) : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="46" viewBox="0 0 320 46" role="img">
  <title>${escapeXml(`${title}: ${Math.round(pct)}% complete`)}</title>
  ${styleBlock}
  <text x="16" y="18" font-family="${font}" font-size="12" fill="${t.text}">${escapeXml(title)} — ${Math.round(pct)}%</text>
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="3" fill="${t.barBg}"/>
  <rect x="${barX}" y="${barY}" width="${fillW}" height="${barH}" rx="3" fill="${t.accent}"/>
</svg>`;
}

/**
 * Renders a live-ticking seconds digit as 60 stacked <text> elements, each
 * toggled visible for exactly one second of a 60s looping SMIL animation.
 * This is NOT JavaScript — SMIL <animate> keeps running in the viewer's
 * browser purely from the declarative markup, even though the image itself
 * is a static file fetched once (and re-fetched only per the cache headers).
 * That's what makes a "ticking" countdown possible inside a README `<img>`.
 * @param {{ x: number, y: number, startSecond: number, color: string, font: string }} opts
 */
function animatedSecondsDigit({ x, y, startSecond, color, font }) {
  let frames = '';
  for (let i = 0; i < 60; i++) {
    // This frame's one-second-wide visibility window, relative to page
    // load (t=0), phased so the digit matching `startSecond` is already
    // showing at t=0 instead of waiting up to 59s for its turn.
    const localStart = (i - startSecond + 60) % 60;
    const beginFrac = (localStart / 60).toFixed(4);
    const endFrac = (Math.min(localStart + 1, 60) / 60).toFixed(4);
    frames += `<text x="${x}" y="${y}" text-anchor="middle" font-family="${font}" font-size="28" font-weight="700" fill="${color}" opacity="0">${String(i).padStart(2, '0')}<animate attributeName="opacity" dur="60s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${beginFrac};${endFrac};1" values="0;1;0;0"/></text>`;
  }
  return frames;
}

/**
 * Countdown "flip-clock" style card: big digits for days/hours/minutes,
 * plus a live-animating seconds digit (see `animatedSecondsDigit`), for a
 * target date (or elapsed time, if the target is in the past).
 */
export function renderCountdownCard({ title, days, hours, minutes, seconds = 0, isPast, theme = 'dark', colors, font: fontKey, reduceMotion = false }) {
  const t = resolveThemeOrAuto(theme, colors);
  const font = resolveFont(fontKey);
  const units = [
    [days, isPast ? 'DAYS AGO' : 'DAYS'],
    [hours, 'HRS'],
    [minutes, 'MIN'],
  ];
  const boxW = 84;
  const gap = 12;
  const totalBoxes = 4;
  const startX = (WIDTH - (boxW * totalBoxes + gap * (totalBoxes - 1))) / 2;
  const boxes = units
    .map(([value, label], i) => {
      const x = startX + i * (boxW + gap);
      const digits = String(Math.max(0, value)).padStart(2, '0');
      return `
  <rect x="${x}" y="46" width="${boxW}" height="52" rx="8" fill="${t.barBg}" stroke="${t.border}"/>
  <text x="${x + boxW / 2}" y="82" text-anchor="middle" font-family="${font}" font-size="28" font-weight="700" fill="${t.accent}">${digits}</text>
  <text x="${x + boxW / 2}" y="112" text-anchor="middle" font-family="${font}" font-size="11" letter-spacing="1" fill="${t.dim}">${escapeXml(label)}</text>`;
    })
    .join('');
  const secX = startX + 3 * (boxW + gap);
  const secLabel = isPast ? 'SEC' : 'SEC';
  const clampedSeconds = Math.max(0, Math.min(59, seconds));
  // `reduceMotion` opts out of the SMIL ticking animation entirely — a
  // static digit, not just a CSS-suppressed one. `prefers-reduced-motion`
  // can't reliably disable an already-running SMIL <animate> timeline via
  // a stylesheet rule, so rather than ship an automatic media-query "fix"
  // that might not actually stop the animation in every renderer, this is
  // an explicit, honest opt-in a README author picks deliberately — the
  // same pattern GitHub's own #gh-light-mode-only convention uses.
  const secDigits = reduceMotion
    ? `<text x="${secX + boxW / 2}" y="82" text-anchor="middle" font-family="${font}" font-size="28" font-weight="700" fill="${t.accent2}">${String(clampedSeconds).padStart(2, '0')}</text>`
    : animatedSecondsDigit({
        x: secX + boxW / 2,
        y: 82,
        startSecond: clampedSeconds,
        color: t.accent2,
        font,
      });
  const secBox = `
  <rect x="${secX}" y="46" width="${boxW}" height="52" rx="8" fill="${t.barBg}" stroke="${t.border}"/>
  ${secDigits}
  <text x="${secX + boxW / 2}" y="112" text-anchor="middle" font-family="${font}" font-size="11" letter-spacing="1" fill="${t.dim}">${secLabel}</text>`;
  return card({
    t,
    height: 128,
    styleBlock: theme === 'auto' ? autoStyleBlock(colors) : '',
    a11yTitle: `${title} ${Math.max(0, days)} days, ${Math.max(0, hours)} hours, ${Math.max(0, minutes)} minutes`,
    children: `
  <text x="${WIDTH / 2}" y="28" text-anchor="middle" font-family="${font}" font-size="15" font-weight="600" fill="${t.text}">${escapeXml(title)}</text>
  ${boxes}
  ${secBox}
  `,
  });
}

/**
 * "safety" style: the classic workplace "DAYS SINCE LAST INCIDENT" sign,
 * parodied everywhere in dev culture — a big bold number framed by a
 * yellow/black hazard-stripe border. Not theme-linked (the whole point is
 * the hazard-sign look), but `colors` can still override `accent` (the
 * stripe color) and `bg` (the sign face) for anyone who wants to reskin it.
 */
export function renderSafetySign({ title, days, isPast = true, colors = {}, font: fontKey }) {
  const font = resolveFont(fontKey);
  const stripe = /^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(colors.accent || '') ? `#${colors.accent}` : '#f2c400';
  const bg = /^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(colors.bg || '') ? `#${colors.bg}` : '#161616';
  const w = 420;
  const h = 140;
  const border = 10;
  const stripeW = 18;
  const patId = 'at-hazard-stripes';
  const caption = isPast ? 'DAYS SINCE' : 'DAYS UNTIL';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
  <title>${escapeXml(`${Math.max(0, days)} ${caption} ${title}`)}</title>
  <defs>
    <pattern id="${patId}" width="${stripeW}" height="${stripeW}" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="${stripeW}" height="${stripeW}" fill="${stripe}"/>
      <rect width="${stripeW / 2}" height="${stripeW}" fill="#111"/>
    </pattern>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${patId})"/>
  <rect x="${border}" y="${border}" width="${w - border * 2}" height="${h - border * 2}" fill="${bg}"/>
  <text x="${w / 2}" y="46" text-anchor="middle" font-family="${font}" font-size="13" font-weight="700" letter-spacing="2" fill="${stripe}">${escapeXml(caption)}</text>
  <text x="${w / 2}" y="98" text-anchor="middle" font-family="${font}" font-size="52" font-weight="700" fill="#ffffff">${Math.max(0, days)}</text>
  <text x="${w / 2}" y="122" text-anchor="middle" font-family="${font}" font-size="13" font-weight="600" letter-spacing="1" fill="${stripe}">${escapeXml(title.toUpperCase())}</text>
</svg>`;
}
