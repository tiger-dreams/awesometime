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

## Cycle 4 — 2026-08-27

**Research**: Searched Chinese (CSDN, Gitee, HackMD zh) and Japanese (Zenn, Qiita) dev-blog ecosystems for badge-generator content. Both communities write actively about README badges (shields.io, profile-readme generators are common topics) but neither turned up a dedicated "year progress"/countdown SVG tool — same open-niche pattern as the English-language research in Cycle 1, now confirmed across two more language communities. Real, sizeable audiences (`awesome-github-profile-readme-chinese` alone: 309★) with no direct competitor and no locale support in this project until now (was `en`/`ko` only).

**Shipped**: `locale=zh` and `locale=ja`, covering year/period titles, elapsed/remaining phrasing, and countdown title phrasing (`距{label}还有` / `{label}已过` for zh; `{label}まで` / `{label}から` for ja). Verified CJK glyph rendering visually (rsvg-convert) for both — no tofu/missing-glyph issues. Deliberately left `type=dayssince`'s "DAYS SINCE"/"DAYS UNTIL" caption English-only across all locales — it's a specific US workplace-sign meme reference, and translating it would dilute the joke for anyone who recognizes the original rather than making it more accessible.

**Note for next cycle**: locale coverage is now en/ko/zh/ja. A reasonable next research angle is Spanish/Portuguese (large GitHub populations in Brazil/Latin America) if buzz supports it — not yet checked.

## Cycle 5 — 2026-08-27

**Research**: Followed up on Cycle 4's own "next cycle" note — checked Portuguese-BR (TabNews, Alura, Rocketseat, and a dedicated Brazilian badge-generator business at githubstats.com.br) and Spanish (DEV.to es, Alura es) dev communities. Same pattern a third time: active badge/README content, no dedicated year-progress/countdown tool in either language.

**Shipped**: `locale=es` and `locale=pt`, same coverage as zh/ja (year/period titles, elapsed/remaining, countdown phrasing). Month names use `Intl`'s own `es-ES`/`pt-BR` locale data (capitalized — Romance-language month names are lowercase by default) rather than a hardcoded list. Locale coverage is now en/ko/zh/ja/es/pt — six languages, zero new dependencies (labels.js is still plain template functions).

**Running insight across cycles 1, 4, 5**: the "no dedicated tool for this specific niche" finding has now replicated across three separate research passes in three different language ecosystems (en, zh+ja, es+pt). That's a much stronger signal than any single search — this is a real, consistent gap, not a fluke of one language's search results.

## Cycle 6 — 2026-08-27

**Research**: Badge accessibility is a real, actively-discussed problem (GitHub community discussion #14904 about screen-reader users and badges; the `usethis` R package has a dedicated badge-accessibility article; `a11y-badges` exists as its own project; shields.io-style badges have been called out for failing WCAG contrast).

**Shipped**: (1) Computed real WCAG contrast ratios for every color pair used across all themes/styles — all pass AA, most pass AAA — and locked that in as a CI-enforced regression test (`tests/contrast.test.js`), not just a one-time check. (2) Caught and fixed a real bug while writing the README's accessibility section: `card()` had supported an `a11yTitle` param since an earlier cycle, but *no render function actually passed one* — every SVG's `<title>` was silently empty. Wired real, descriptive titles (e.g. "2026 Progress: 65% — 238 days elapsed, 127 days left") into all four progress/countdown render functions, with tests asserting the exact text. (3) Documented the one honest limitation that applies industry-wide, not just here: Markdown `alt` text is static and can't reflect a badge's live value.

**Insight**: writing the documentation surfaced a real shipped-but-silently-broken feature (the empty `<title>`) that 60 passing tests hadn't caught, because nothing had asserted on `<title>` content before — a good reminder that "the test suite is green" isn't the same claim as "the feature works," especially for a param that was added but never actually threaded through.

## Cycle 7 — 2026-08-27

**Research/observation** (not a search this time — direct verification): checked whether `awesometime.vercel.app` had Open Graph / Twitter Card meta tags for social-sharing link previews. It had none — sharing the link on Twitter, Slack, or Discord would show a bare, generic preview with no title/description/image, which directly hurts click-through when people share the project (a real cost for something specifically trying to grow via word-of-mouth/sharing).

**Shipped**: `og:*` and `twitter:*` meta tags on the landing page, plus a real 1200×630 `social-preview.png` composited from the actual badge output (progress bar, days-since sign, countdown) rather than a generic banner — so the link preview itself demonstrates the product. Built by rendering each component as SVG (rsvg-convert, which handles text reliably) and compositing with ImageMagick (which doesn't, in this environment — no ghostscript/font resolution — so text was rendered via SVG first, image-only compositing via ImageMagick second, working around the tool's actual limitation rather than fighting it).

**Process note**: first compositing attempt had a real bug (badges overlapping due to a height/scale miscalculation) — caught by actually looking at the rendered PNG before shipping, not just checking that the `convert` commands exited 0.
