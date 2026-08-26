# Contributing

## Running tests

```bash
npm test
```

Tests are plain `node:test` — no test framework dependency. `lib/time.js` and `lib/svg.js` are pure functions, so most tests just assert on their return values / output strings directly.

## Adding a new style

1. Add a `render*` function to `lib/svg.js` following the existing signature shape: `{ title, percent, elapsedLabel, remainingLabel, theme, colors } -> svgString`.
2. Register it in the `PROGRESS_STYLES` map in `lib/render.js`.
3. Export it from `lib/index.js` so library consumers can use it directly.
4. Add tests in `tests/svg.test.js` (structural assertions on the output string — no snapshot/pixel testing needed).
5. Add an example to the README's "Styles" section, using the live production URL so it renders inline on GitHub.

Use `<rect>` elements for any bar/segment visuals rather than Unicode block characters (`█`, `░`, etc.) — glyph availability for those varies across the fonts a viewer's browser falls back to, while a `<rect>` renders identically everywhere.

## Code style

- Zero runtime dependencies. `lib/` only uses Node.js builtins.
- Keep `lib/` framework-free — `api/index.js` is the only file that knows about Vercel's request/response shape. If you're adding a new deployment target (Cloudflare Workers, Netlify, etc.), it should be a new thin adapter file, not a change to `lib/`.

## Reporting bugs

Open an issue with the exact query string you used and what you expected vs. what rendered — a link to the badge image (or the raw SVG) is the fastest way to reproduce.
