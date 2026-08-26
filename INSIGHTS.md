# Research & Development Log

Internal notes from benchmarking similar projects and tracking online buzz around time/countdown/progress content, and what got built in response. Not part of the public-facing README — this is a working log for the maintainer.

## Cycle 1 — 2026-08-26/27

**Research**: Searched for existing "year progress" / countdown badge tools. Found many small standalone apps (max ~136★ on GitHub: `RedL0tus/YearProgressBot`, `zhanghai/DoubanYearProgress`, etc.) but no dominant *README-embeddable dynamic SVG* generator in this exact niche — confirms the category (proven by `github-readme-stats` at 70k+★) is real but this specific sub-niche is open.

**Shipped**: `period=day|week|month|quarter|year` (generalizes the year-only progress bar), `type=dayssince` (the "DAYS SINCE LAST INCIDENT" workplace-sign meme, as a real embeddable badge — nothing else hosts this dynamically, only static one-off scripts exist).

**Gap not pursued**: general "profile README widget" categories (streak counters, visitor counters, WakaTime-style coding-time trackers) — different domain (contribution/activity data, not date/time), out of scope for this project's identity.

## Cycle 2 — 2026-08-26/27

**Research**: `prefers-color-scheme` inside `<img>`-embedded SVGs is a documented, real technique (multiple 2025 blog posts: Kera Cudmore, Dries Vints, Paul.af) used by major badge tools for GitHub dark-mode support. Confirmed working in Chrome/Firefox, flaky in older Safari — acceptable tradeoff (graceful degrade to light).

**Shipped**: `theme=auto` (CSS custom properties + media query, verified via Playwright with real `prefers-color-scheme` emulation — light and dark screenshots confirmed the *same URL* renders differently). Also documented GitHub's native `#gh-dark-mode-only` / `#gh-light-mode-only` fragment convention as the primary recommended approach for GitHub specifically (zero technical risk, GitHub-native).

**Insight**: badge quality bar in this space is "auto-theming is table stakes for anything aspiring to be taken seriously" — competitors that don't support it (most of the small year-progress apps found in Cycle 1) read as unpolished by comparison.
