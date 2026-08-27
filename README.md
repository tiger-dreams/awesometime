# awesometime

**Pretty, dynamic SVG badges for your GitHub README — progress bars for any period, doomsday-style countdowns, the classic "days since" sign, and a library to build your own.**

[![CI](https://github.com/tiger-dreams/awesometime/actions/workflows/ci.yml/badge.svg)](https://github.com/tiger-dreams/awesometime/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@jeongpd/awesometime.svg)](https://www.npmjs.com/package/@jeongpd/awesometime)
[![license](https://img.shields.io/npm/l/@jeongpd/awesometime.svg)](https://github.com/tiger-dreams/awesometime/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/@jeongpd/awesometime.svg)](https://www.npmjs.com/package/@jeongpd/awesometime)

No install, no build step — drop an image URL in your README and it renders live, every time someone views the page.

```md
![Year Progress](https://awesometime.vercel.app/api)
```

![Year Progress](https://awesometime.vercel.app/api)

## Where people actually use this

Any of these is just the image URL dropped somewhere that renders Markdown or plain `<img>` — no account, no build step, no JS.

- **Your GitHub profile README** (`github.com/<you>/<you>`) — a year-progress bar as a small personal touch, or a countdown to something you're building toward.
- **A project's README** — `dayssince` for "days since last incident/regression," the classic status-page pattern, right at the top of the repo instead of buried in a dashboard only the team sees.
- **A conference, hackathon, or launch page** — `countdown` to the event date, with the live-ticking seconds for a bit of urgency, embedded in a plain landing page `<img>` tag.
- **A roadmap or OKR doc** (Notion, Confluence, a wiki page that renders Markdown images) — `period=quarter` or `period=month` next to a milestone list, so "how much of this quarter is left" doesn't require opening a separate calendar. See [`docs/notion-guide.md`](./docs/notion-guide.md) for the exact steps and a caching caveat worth knowing.
- **A personal blog or portfolio site** — "127 days until I ship v2" as a plain `<img>`, no different from embedding any other image.
- **A Slack/Discord pinned message or channel topic** — most chat clients unfurl image URLs, so a `dayssince`/`countdown` badge works as a lightweight shared status indicator without a bot.

## Countdown to anything

Not just the calendar year — point it at any date and get a doomsday-clock-style countdown card.

```md
![Countdown](https://awesometime.vercel.app/api?type=countdown&date=2026-12-25&label=Christmas)
```

![Countdown](https://awesometime.vercel.app/api?type=countdown&date=2026-12-25&label=Christmas)

The **seconds box actually ticks**, live, in your browser — it's not a screenshot. That's not JavaScript (an `<img>`-embedded SVG can't run scripts); it's a declarative SMIL `<animate>` loop baked into the SVG itself, so it keeps animating even though the underlying file is only re-fetched per the cache headers below.

Constant motion isn't for everyone — add `&motion=reduce` for a static seconds digit instead of the ticking animation, no different from choosing `theme=light` explicitly. (A CSS `prefers-reduced-motion` media query can't reliably stop an already-running SMIL timeline across renderers, so this is an explicit opt-in rather than an automatic one we can't fully guarantee.)

**Dates default to UTC.** "Countdown widgets show the wrong time" is a genuinely common complaint elsewhere (timezone-unaware countdown plugins are a recurring source of confused bug reports). Pass `tz` with any IANA zone name to interpret `date` as local wall-clock time there instead — DST-aware, computed with the same technique real timezone libraries use, no external dependency:

```md
![](https://awesometime.vercel.app/api?type=countdown&date=2027-01-01&tz=Asia/Seoul&label=New%20Year%20KST)
```

A `tz` that isn't a real IANA zone name renders a 400 error card rather than silently guessing UTC.

## Not just the year — any period

`year-progress` generalizes to `period=day|week|month|quarter|year` (year is still the default):

```md
![](https://awesometime.vercel.app/api?period=week&style=gradient)
```

![](https://awesometime.vercel.app/api?period=week&style=gradient)

## The classic "days since" sign

The workplace-safety-sign parody every dev knows, as a real embeddable badge instead of a one-off screenshot — hazard stripes included:

```md
![](https://awesometime.vercel.app/api?type=dayssince&date=2026-08-01&label=Last%20Incident)
```

![](https://awesometime.vercel.app/api?type=dayssince&date=2026-08-01&label=Last%20Incident)

Give it a future date and it flips to "DAYS UNTIL" automatically — works equally well for "days until launch" as for "days since the last incident."

## Auto dark/light mode

Two ways to make a badge match the viewer's theme instead of committing to one:

**On GitHub specifically**, use GitHub's own light/dark URL-fragment convention — GitHub's markdown renderer wraps these in a `<picture>` element for you:

```md
![Year Progress](https://awesometime.vercel.app/api?theme=light#gh-light-mode-only)
![Year Progress](https://awesometime.vercel.app/api?theme=dark#gh-dark-mode-only)
```

**Everywhere else** (or if you'd rather ship one URL), pass `theme=auto`. The SVG embeds its own `prefers-color-scheme` media query, so the *same* image file switches itself based on the viewer's OS/browser setting — verified working in Chromium with light- and dark-mode emulation, no separate URLs needed:

```md
![](https://awesometime.vercel.app/api?theme=auto)
```

This degrades gracefully (stays in light mode) on renderers that don't support CSS custom properties inside an SVG `<style>` block.

## Styles

Three built-in styles, two themes plus `auto`, and a full set of query params to tune the rest.

**`style=terminal`** (default) — block-segment progress bar:

```md
![](https://awesometime.vercel.app/api?style=terminal)
```

![](https://awesometime.vercel.app/api?style=terminal)

**`style=gradient`** — smooth gradient fill, light theme:

```md
![](https://awesometime.vercel.app/api?style=gradient&theme=light)
```

![](https://awesometime.vercel.app/api?style=gradient&theme=light)

**`style=minimal`** — a thin bar with no card chrome, for tucking into dense layouts:

```md
![](https://awesometime.vercel.app/api?style=minimal)
```

![](https://awesometime.vercel.app/api?style=minimal)

**Custom accent color**, any style:

```md
![](https://awesometime.vercel.app/api?style=terminal&color=ff6b6b&theme=light)
```

![](https://awesometime.vercel.app/api?style=terminal&color=ff6b6b&theme=light)

**Localized labels** — `locale=ko`, `zh`, `ja`, `es`, or `pt`, or bring your own text entirely via `label=`:

```md
![](https://awesometime.vercel.app/api?locale=ko)
![](https://awesometime.vercel.app/api?locale=zh)
![](https://awesometime.vercel.app/api?locale=ja)
```

![](https://awesometime.vercel.app/api?locale=ko)

**Pick a font.** No font files are embedded — these are curated font-family stacks of monospace fonts developers actually have installed (JetBrains Mono, Fira Code, IBM Plex Mono, Cascadia Code, Space Mono), each falling back gracefully if you don't:

```md
![](https://awesometime.vercel.app/api?style=terminal&font=jetbrains)
```

![](https://awesometime.vercel.app/api?style=terminal&font=jetbrains)

## Query params

| Param | Values | Default | Applies to |
|---|---|---|---|
| `type` | `year-progress`, `countdown`, `dayssince` | `year-progress` | — |
| `period` | `day`, `week`, `month`, `quarter`, `year` | `year` | `year-progress` |
| `style` | `terminal`, `gradient`, `minimal` | `terminal` | `year-progress` |
| `theme` | `dark`, `light`, `auto` | `dark` | `year-progress`, `countdown` |
| `locale` | `en`, `ko`, `zh`, `ja`, `es`, `pt` | `en` | `year-progress`, `countdown` |
| `font` | `mono`, `jetbrains`, `fira`, `ibm`, `cascadia`, `space` | `mono` | all |
| `year` | any 4-digit year | current year | `year-progress` with `period=year` |
| `date` | `YYYY-MM-DD` (optionally `THH:MM:SS`) | — (required) | `countdown`, `dayssince` |
| `tz` | an IANA zone, e.g. `Asia/Seoul` | UTC | `countdown`, `dayssince` — interprets `date` as local time there (DST-aware); an unrecognized zone is a 400, not a silent UTC fallback |
| `label` | any text | auto-generated | all |
| `color` | 3 or 6-digit hex, no `#` | theme default | all — overrides the accent color (the hazard-stripe color for `dayssince`) |
| `accent2` | 3 or 6-digit hex, no `#` | theme default | `year-progress`, `countdown` — overrides the secondary accent |
| `bg` | 3 or 6-digit hex, no `#` | theme default | all — overrides the card background |
| `motion` | `reduce` | (animated) | `countdown` — static seconds digit instead of the live-ticking animation |

An unrecognized `period` falls back to `year` rather than erroring, same as an unrecognized `style`.

Malformed params fall back to defaults instead of erroring, except a missing/invalid `date` on a `type=countdown` request, which renders a small red error card so a typo is obvious at a glance instead of silently wrong.

## Use it as a library

The hosted API at `awesometime.vercel.app` is just a thin wrapper — everything it does is exported so you can build your own badge service, add styles it doesn't have, embed a card in a static-site generator, or self-host instead of depending on someone else's uptime.

```bash
npm install @jeongpd/awesometime
```

(Published as `@jeongpd/awesometime` — the unscoped `awesometime` name was too similar to an existing unrelated package. Installing straight from GitHub also still works: `npm install github:tiger-dreams/awesometime`.)

```js
import { yearProgress, countdown, renderTerminalProgress, renderCountdownCard } from '@jeongpd/awesometime';

const { percent, daysElapsed, daysRemaining } = yearProgress(2026);

const svg = renderTerminalProgress({
  title: '2026 Progress',
  percent,
  elapsedLabel: `${daysElapsed} days elapsed`,
  remainingLabel: `${daysRemaining} days left`,
  theme: 'dark',
});
// svg is a plain string — write it to a file, serve it from your own
// endpoint, or inline it directly in HTML.
```

Every function is pure (no I/O, no globals) — `yearProgress` and `countdown` are plain date math, and the `render*` functions are plain string builders. See [`lib/index.js`](./lib/index.js) for the full exported surface.

## Why this and not a JS widget?

If you want a live-ticking countdown on an actual webpage, a small JS component is the right tool, and there are good ones. This project is specifically for the **README / static-image use case** — profile READMEs, project READMEs, doc sites — anywhere you can drop an `<img>` or `![]()` but can't run JavaScript. The image itself is regenerated fresh on every request (subject to the cache headers below), so it stays accurate without any script running on the page that embeds it.

## Accessibility

Badge accessibility is a real, [documented](https://github.com/orgs/community/discussions/14904) [problem](https://usethis.r-lib.org/articles/badge-accessibility.html) elsewhere — shields.io-style badges have been called out for contrast that fails WCAG. This project checks:

- **Contrast**: every text/background color pair used across all themes and styles (including the safety-sign badge) is tested against WCAG AA (4.5:1 minimum) as part of the test suite (`tests/contrast.test.js`) — most pairs clear AAA (7:1). A future color change that regresses this fails CI.
- **`<title>`**: every SVG includes a `<title>` element describing its current value (e.g. "2026 Progress: 65% complete"), which assistive tech can pick up for inline/object-embedded SVGs.
- **Motion**: `motion=reduce` on `countdown` swaps the live-ticking seconds animation for a static digit — an explicit opt-in rather than an automatic `prefers-reduced-motion` detection, since CSS can't reliably halt an already-running SMIL timeline across renderers.

One honest limitation, shared by every dynamic badge service including much larger ones: the `alt` text on a `![alt](url)` Markdown image is static, written once by whoever adds the badge to their README, while the badge's *value* changes over time — there's no way for the image itself to update text that lives in someone else's Markdown file. Write a real, current description rather than leaving `alt` empty or generic, e.g. `![2026 is 65% over](https://awesometime.vercel.app/api)`.

## Caching

Responses are served with `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` — GitHub's own image proxy (camo) also caches on top of that, so a badge typically updates within an hour of being re-fetched, not instantly. That's the right tradeoff for "days left in the year," not a design accident.

## Self-hosting

Fork the repo and deploy your own copy to Vercel (or adapt `api/index.js` to any platform that runs a fetch-style edge/serverless handler — the actual logic lives in framework-free `lib/` code):

```bash
git clone https://github.com/tiger-dreams/awesometime
cd awesometime
vercel deploy --prod
```

## Contributing

Bug reports and PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for running tests and adding a new style.

## License

MIT © [tiger-dreams](https://github.com/tiger-dreams) — see [LICENSE](./LICENSE).
