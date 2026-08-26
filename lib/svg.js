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

const FONT = "'SFMono-Regular','Consolas','Liberation Mono','Menlo',monospace";

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

function card({ t, children, width = WIDTH, height = HEIGHT, a11yTitle }) {
  const title = a11yTitle ? `<title>${escapeXml(a11yTitle)}</title>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
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
export function renderTerminalProgress({ title, percent, elapsedLabel, remainingLabel, theme = 'dark', colors }) {
  const t = resolveTheme(theme, colors);
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
    children: `
  <text x="24" y="34" font-family="${FONT}" font-size="15" font-weight="600" fill="${t.text}">${escapeXml(title)}</text>
  <text x="${WIDTH - 24}" y="34" text-anchor="end" font-family="${FONT}" font-size="15" font-weight="600" fill="${t.accent}">${Math.round(pct)}%</text>
  ${bar}
  <text x="24" y="94" font-family="${FONT}" font-size="13" fill="${t.dim}">${escapeXml(elapsedLabel)} · ${escapeXml(remainingLabel)}</text>
  `,
  });
}

/**
 * "gradient" style: a smooth gradient-filled progress bar.
 */
export function renderGradientProgress({ title, percent, elapsedLabel, remainingLabel, theme = 'dark', colors }) {
  const t = resolveTheme(theme, colors);
  const pct = clampPercent(percent);
  const barX = 24;
  const barW = WIDTH - 48;
  const barY = 58;
  const barH = 14;
  const fillW = Math.round((pct / 100) * barW);
  const gradId = `at-grad-${theme}-${Math.round(pct)}`;
  return card({
    t,
    children: `
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${t.accent}"/>
      <stop offset="100%" stop-color="${t.accent2}"/>
    </linearGradient>
  </defs>
  <text x="24" y="34" font-family="${FONT}" font-size="15" font-weight="600" fill="${t.text}">${escapeXml(title)}</text>
  <text x="${WIDTH - 24}" y="34" text-anchor="end" font-family="${FONT}" font-size="15" font-weight="600" fill="${t.text}">${Math.round(pct)}%</text>
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="7" fill="${t.barBg}"/>
  <rect x="${barX}" y="${barY}" width="${fillW}" height="${barH}" rx="7" fill="url(#${gradId})"/>
  <text x="24" y="94" font-family="${FONT}" font-size="13" fill="${t.dim}">${escapeXml(elapsedLabel)} · ${escapeXml(remainingLabel)}</text>
  `,
  });
}

/**
 * "minimal" style: a single thin line, no card chrome — for tucking into
 * dense layouts.
 */
export function renderMinimalProgress({ title, percent, theme = 'dark', colors }) {
  const t = resolveTheme(theme, colors);
  const pct = clampPercent(percent);
  const barX = 16;
  const barW = 320 - 32;
  const barY = 30;
  const barH = 6;
  const fillW = Math.round((pct / 100) * barW);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="46" viewBox="0 0 320 46" role="img">
  <text x="16" y="18" font-family="${FONT}" font-size="12" fill="${t.text}">${escapeXml(title)} — ${Math.round(pct)}%</text>
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
 * @param {{ x: number, y: number, startSecond: number, color: string }} opts
 */
function animatedSecondsDigit({ x, y, startSecond, color }) {
  let frames = '';
  for (let i = 0; i < 60; i++) {
    // This frame's one-second-wide visibility window, relative to page
    // load (t=0), phased so the digit matching `startSecond` is already
    // showing at t=0 instead of waiting up to 59s for its turn.
    const localStart = (i - startSecond + 60) % 60;
    const beginFrac = (localStart / 60).toFixed(4);
    const endFrac = (Math.min(localStart + 1, 60) / 60).toFixed(4);
    frames += `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="700" fill="${color}" opacity="0">${String(i).padStart(2, '0')}<animate attributeName="opacity" dur="60s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${beginFrac};${endFrac};1" values="0;1;0;0"/></text>`;
  }
  return frames;
}

/**
 * Countdown "flip-clock" style card: big digits for days/hours/minutes,
 * plus a live-animating seconds digit (see `animatedSecondsDigit`), for a
 * target date (or elapsed time, if the target is in the past).
 */
export function renderCountdownCard({ title, days, hours, minutes, seconds = 0, isPast, theme = 'dark', colors }) {
  const t = resolveTheme(theme, colors);
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
  <text x="${x + boxW / 2}" y="82" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="700" fill="${t.accent}">${digits}</text>
  <text x="${x + boxW / 2}" y="112" text-anchor="middle" font-family="${FONT}" font-size="11" letter-spacing="1" fill="${t.dim}">${escapeXml(label)}</text>`;
    })
    .join('');
  const secX = startX + 3 * (boxW + gap);
  const secLabel = isPast ? 'SEC' : 'SEC';
  const secDigits = animatedSecondsDigit({
    x: secX + boxW / 2,
    y: 82,
    startSecond: Math.max(0, Math.min(59, seconds)),
    color: t.accent2,
  });
  const secBox = `
  <rect x="${secX}" y="46" width="${boxW}" height="52" rx="8" fill="${t.barBg}" stroke="${t.border}"/>
  ${secDigits}
  <text x="${secX + boxW / 2}" y="112" text-anchor="middle" font-family="${FONT}" font-size="11" letter-spacing="1" fill="${t.dim}">${secLabel}</text>`;
  return card({
    t,
    height: 128,
    children: `
  <text x="${WIDTH / 2}" y="28" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${t.text}">${escapeXml(title)}</text>
  ${boxes}
  ${secBox}
  `,
  });
}
