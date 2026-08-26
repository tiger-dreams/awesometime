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

## Cycle 3 — 2026-08-27

**Research**: Two angles. (1) 2026 profile-README trend pieces converge on "quality over quantity" and "functional over decorative" — validates the existing minimal/clean visual direction rather than suggesting a pivot toward busier widgets. Also confirms contribution-streak tracking is a saturated, well-served niche (`github-readme-streak-stats` and similar) — correctly stayed out of that lane rather than repeating the skillport-vs-vercel-labs mistake. (2) Timezone confusion in countdown widgets is a widely and repeatedly reported real complaint across unrelated products (Elementor, WordPress countdown plugins, hackathon counters) — a genuine, well-documented UX gap that directly applies to `type=countdown`/`dayssince`, which were UTC-only.

**Shipped**: `tz=<IANA zone>` param (e.g. `tz=Asia/Seoul`) for `countdown`/`dayssince`, interpreting `date` as local wall-clock time in that zone instead of UTC. DST-aware (uses the same offset-detection technique real timezone libraries use — verified against known UTC offsets for `Asia/Seoul` and both `America/New_York` seasons), built on Node's built-in `Intl` (no new dependency). An unrecognized zone name is a 400, not a silent wrong-answer fallback to UTC — deliberately, since the whole point of researching this was that *silent* timezone mishandling is what generates complaints elsewhere.

**Gap not pursued**: "milestone celebration" badges (round-number day counts) — searched, didn't find clear distinct demand separate from what `countdown`/`dayssince` already cover.
