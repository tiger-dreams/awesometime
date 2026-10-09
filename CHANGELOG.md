# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- Long labels no longer overflow their badge: visible titles are truncated
  with an ellipsis to fit the card (the accessible `<title>` keeps the full
  text).
- Error (400) responses are cached for 60 seconds instead of an hour, so a
  corrected URL recovers quickly.

### Added

- `renderCountdownBadge` is now exported from the package entry point, like
  every other renderer.
- TypeScript type declarations (`lib/index.d.ts`).

### Changed

- CI now tests Node 18, 20, 22, and 24 (the Action runs on node24 and the
  publish workflow on Node 22; both were previously untested).

## [0.3.0] - 2026-09-18

### Added

- 12 named themes: tokyonight, dracula, nord, gruvbox, onedark, monokai,
  cobalt, synthwave, solarized-dark, github-dark, radical, ayu-dark.
- Individual color overrides for `border`, `text`, `dim`, and `barBg` (in
  addition to the existing `accent`/`accent2`/`bg`).

## [0.2.1] - 2026-08-31

### Added

- `/view` — a full-screen HTML wrapper for badges, meant for "Add to Home
  Screen".
- `style=badge` for countdowns: a purpose-built compact D-day pill.

### Documentation

- Notion embedding guide, with an honest caching caveat.
- Install instructions updated to the real npm package name,
  `@jeongpd/awesometime`.

## [0.2.0] - 2026-08-27

### Added

- Initial release: year/period progress badges, countdown cards with a
  live-ticking seconds digit, the "days since" safety sign, the hosted API
  on Vercel, the npm library, and the GitHub Action.
