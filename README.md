# awesometime

**Pretty, dynamic SVG badges for your GitHub README — progress bars for any period, doomsday-style countdowns, the classic "days since" sign, and a library to build your own.**

[![npm version](https://img.shields.io/npm/v/awesometime.svg)](https://www.npmjs.com/package/awesometime)
[![license](https://img.shields.io/npm/l/awesometime.svg)](https://github.com/tiger-dreams/awesometime/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/awesometime.svg)](https://www.npmjs.com/package/awesometime)

No install, no build step — drop an image URL in your README and it renders live, every time someone views the page.

```md
![Year Progress](https://awesometime.vercel.app/api)
```

![Year Progress](https://awesometime.vercel.app/api)

## Countdown to anything

Not just the calendar year — point it at any date and get a doomsday-clock-style countdown card.

```md
![Countdown](https://awesometime.vercel.app/api?type=countdown&date=2026-12-25&label=Christmas)
```

![Countdown](https://awesometime.vercel.app/api?type=countdown&date=2026-12-25&label=Christmas)

The **seconds box actually ticks**, live, in your browser — it's not a screenshot. That's not JavaScript (an `<img>`-embedded SVG can't run scripts); it's a declarative SMIL `<animate>` loop baked into the SVG itself, so it keeps animating even though the underlying file is only re-fetched per the cache headers below.

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

**Korean labels** (`locale=ko`) — or bring your own via `label=`:

```md
![](https://awesometime.vercel.app/api?locale=ko)
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
| `locale` | `en`, `ko` | `en` | `year-progress`, `countdown` |
| `font` | `mono`, `jetbrains`, `fira`, `ibm`, `cascadia`, `space` | `mono` | all |
| `year` | any 4-digit year | current year | `year-progress` with `period=year` |
| `date` | `YYYY-MM-DD` (optionally `THH:MM:SS`) | — (required) | `countdown`, `dayssince` |
| `label` | any text | auto-generated | all |
| `color` | 3 or 6-digit hex, no `#` | theme default | all — overrides the accent color (the hazard-stripe color for `dayssince`) |
| `accent2` | 3 or 6-digit hex, no `#` | theme default | `year-progress`, `countdown` — overrides the secondary accent |
| `bg` | 3 or 6-digit hex, no `#` | theme default | all — overrides the card background |

An unrecognized `period` falls back to `year` rather than erroring, same as an unrecognized `style`.

Malformed params fall back to defaults instead of erroring, except a missing/invalid `date` on a `type=countdown` request, which renders a small red error card so a typo is obvious at a glance instead of silently wrong.

## Use it as a library

The hosted API at `awesometime.vercel.app` is just a thin wrapper — everything it does is exported so you can build your own badge service, add styles it doesn't have, embed a card in a static-site generator, or self-host instead of depending on someone else's uptime.

```bash
# Not yet on the npm registry — install straight from GitHub for now:
npm install github:tiger-dreams/awesometime
```

```js
import { yearProgress, countdown, renderTerminalProgress, renderCountdownCard } from 'awesometime';

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
