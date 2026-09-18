/**
 * Named theme gallery for awesometime.
 * Each theme defines all 7 semantic color keys:
 *   bg      — card/background
 *   border  — card border, box strokes
 *   text    — primary text (titles, percent, labels)
 *   dim     — secondary/muted text (elapsed/remaining, unit labels)
 *   barBg   — progress bar track background
 *   accent  — primary accent (percent, filled bar, gradient start)
 *   accent2 — secondary accent (gradient end, ticking seconds, badge D-day)
 *
 * All themes here are dark-style backgrounds for v1.
 * Light variants may be added in a future release.
 * All text/bg, dim/bg, accent/bg, accent2/bg pairs meet WCAG AA 4.5:1.
 */

export const THEME_KEYS = ['bg', 'border', 'text', 'dim', 'barBg', 'accent', 'accent2'];

export const NAMED_THEMES = {
  tokyonight: {
    bg: '#1a1b26',
    border: '#292e42',
    text: '#c0caf5',
    dim: '#7885bf',
    barBg: '#24283b',
    accent: '#7aa2f7',
    accent2: '#9ece6a',
  },
  dracula: {
    bg: '#282a36',
    border: '#44475a',
    text: '#f8f8f2',
    dim: '#7f94d5',
    barBg: '#3a3c4e',
    accent: '#bd93f9',
    accent2: '#50fa7b',
  },
  nord: {
    bg: '#2e3440',
    border: '#3b4252',
    text: '#eceff4',
    dim: '#90a3c9',
    barBg: '#3b4252',
    accent: '#88c0d0',
    accent2: '#a3be8c',
  },
  gruvbox: {
    bg: '#282828',
    border: '#3c3836',
    text: '#ebdbb2',
    dim: '#a0907f',
    barBg: '#3c3836',
    accent: '#fabd2f',
    accent2: '#8ec07c',
  },
  onedark: {
    bg: '#282c34',
    border: '#3e4451',
    text: '#abb2bf',
    dim: '#8a94a8',
    barBg: '#353b45',
    accent: '#61afef',
    accent2: '#98c379',
  },
  monokai: {
    bg: '#272822',
    border: '#3e3d32',
    text: '#f8f8f2',
    dim: '#98927a',
    barBg: '#3e3d32',
    accent: '#ff39ab',
    accent2: '#a6e22e',
  },
  cobalt: {
    bg: '#193549',
    border: '#2a4a6b',
    text: '#ffffff',
    dim: '#74abd2',
    barBg: '#224466',
    accent: '#ffee80',
    accent2: '#ff7000',
  },
  synthwave: {
    bg: '#2b213a',
    border: '#4a3d5e',
    text: '#f8f8f2',
    dim: '#9f87b7',
    barBg: '#3a2d4e',
    accent: '#ff6ac1',
    accent2: '#00f0ff',
  },
  'solarized-dark': {
    bg: '#002b36',
    border: '#073642',
    text: '#839496',
    dim: '#7b9aa3',
    barBg: '#073642',
    accent: '#2998e7',
    accent2: '#859900',
  },
  'github-dark': {
    bg: '#161b22',
    border: '#30363d',
    text: '#e6edf3',
    dim: '#8b949e',
    barBg: '#21262d',
    accent: '#58a6ff',
    accent2: '#3fb950',
  },
  radical: {
    bg: '#141321',
    border: '#2a2940',
    text: '#fefefe',
    dim: '#8482aa',
    barBg: '#1e1d30',
    accent: '#fe428e',
    accent2: '#a9fef7',
  },
  'ayu-dark': {
    bg: '#0b0e14',
    border: '#1f2430',
    text: '#c9c7cd',
    dim: '#777e8b',
    barBg: '#141821',
    accent: '#ffb454',
    accent2: '#7fd96b',
  },
};

/**
 * All known theme keys including the built-in 'dark', 'light', 'auto'.
 * Used for validation in render.js.
 */
export const ALL_THEME_KEYS = ['dark', 'light', 'auto', ...Object.keys(NAMED_THEMES)];