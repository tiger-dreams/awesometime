# GitHub Action distribution — design spec

Date: 2026-09-19

## Context

awesometime currently ships two distribution channels, both built on the same
framework-free `lib/` code:

1. **Hosted URL** (`awesometime.vercel.app/api?...`) — zero setup, re-rendered
   live on every view.
2. **npm library** (`@jeongpd/awesometime`) — `import` the functions to build
   a custom badge service.

A competitive gap analysis (2026-09-19) found that the closest niche
competitors — `chengxilo/countdown` and `lowlighter/metrics` — also ship a
**GitHub Action** that renders a badge and commits it straight into the
consumer's repo. That model serves users the URL approach can't:

- No dependency on an external live server (Vercel or otherwise) ever being
  up.
- Works in environments where outbound requests to arbitrary third-party
  domains are blocked, but `github.com` itself and the Action's own checkout
  are reachable (e.g. some enterprise GitHub runners).
- Discoverable via GitHub Marketplace, a channel the URL/npm model doesn't
  reach at all.

This spec adds a **third, coexisting** distribution channel — it does not
replace the hosted URL or the npm package. All three sit on top of the same
`lib/render.js` → `renderFromQuery(query, now)` pure function; the Action is
a thin wrapper around it, not a rewrite.

## Goals

- Primary: let a user run awesometime with **zero runtime external
  dependency** — no live server, no npm registry fetch at Action run time.
- Full feature parity with the hosted API's query parameters, in v1.
- Discoverable and usable via a single step in the consumer's own workflow
  YAML (auto-commit built in, not a separate step).

## Non-goals

- Not replacing the hosted URL or npm package — both stay as-is.
- Not solving live, per-second-accurate ticking for committed files (see
  "Motion default" below) — the committed SVG is a periodic snapshot,
  refreshed on whatever cron the consumer sets up.
- Not publishing to a separate repo — the Action ships from the same
  `tiger-dreams/awesometime` repo, versioned independently of the npm
  package.

## Architecture

**JavaScript Action**, bundled with `@vercel/ncc` into a single committed
`dist/index.js`. Ruled out:

- **Docker Action** — requires pulling a container image at run time, which
  is itself an external runtime dependency. Contradicts the primary goal.
- **Composite Action shelling out to `npx @jeongpd/awesometime`** — requires
  an npm registry fetch at run time. Same problem.

A JS Action with an ncc-bundled `dist/index.js` has no runtime fetch beyond
the checkout of the Action's own repo (which GitHub Actions does natively).
`lib/render.js`'s `renderFromQuery(query, now)` already takes a plain query
object and returns an SVG string, so the Action's own logic is small:

1. Read inputs via `@actions/core`.
2. Build a `query` object from them.
3. Call `renderFromQuery(query, new Date())`.
4. Write the SVG to `output-path`.
5. Commit + push if the file changed.

`action.yml` lives at the repo root, alongside the existing `lib/`, `api/`,
and `tests/` directories.

## Inputs

Full parity with the hosted API's query parameters, mapped 1:1:

| Input | Maps to query param |
|---|---|
| `type` | `type` |
| `date` | `date` |
| `label` | `label` |
| `theme` | `theme` |
| `style` | `style` |
| `period` | `period` |
| `locale` | `locale` |
| `tz` | `tz` |
| `font` | `font` |
| `color`, `accent2`, `bg`, `border`, `text`, `dim`, `bar-bg` | `color`, `accent2`, `bg`, `border`, `text`, `dim`, `barBg` |
| `motion` | `motion` (see default below) |

Two Action-only inputs, not part of the query API:

- `output-path` — where to write the SVG. Default: `awesometime.svg`.
- `commit-message` — default: `chore: update awesometime badge`.

## Motion default: `reduce`, not the hosted API's default

`renderCountdownCard`'s seconds digit uses a 60-second looping SMIL
`<animate>` (`lib/svg.js:232`) anchored to the second at render time. On the
hosted URL, every page view re-renders fresh, so the loop re-syncs to the
real current second on each fetch. A **committed static file** only
re-renders when the Action's cron fires — between runs, the animation still
visually loops (SMIL runs client-side, independent of how the file was
served), but it's looping around a second value that stopped being real the
moment the Action finished. Decorative motion with no informational value,
and worse, actively misleading (looks live, isn't).

The Action defaults `motion` to `reduce` (the existing static-digit mode),
overridable via the `motion` input for anyone who wants the visual anyway.
The hosted API's own default (ticking) is unchanged — this default only
applies to the Action.

## Commit behavior (built into the Action)

- Diff the rendered output against the existing file at `output-path`; skip
  the commit entirely if nothing changed (avoids empty commits and avoids
  the Action's own commit re-triggering a push-based workflow in a loop).
- Committer identity: `github-actions[bot]` /
  `41898282+github-actions[bot]@users.noreply.github.com` (the standard
  bot identity used by `actions/checkout`-style auto-commit workflows).
- Commit message: `commit-message` input, default `chore: update awesometime badge`.
- Pushes to whatever branch is currently checked out — the consumer's
  workflow controls which branch that is via `actions/checkout`.
- Requires `permissions: contents: write` in the consumer's workflow; this
  gets documented in the Action's README usage snippet, not enforced by the
  Action itself.

## Versioning and release

The Action's source lives in the same `tiger-dreams/awesometime` repo as the
npm package, but is versioned on an **independent track** — an npm
`v0.3.0` publish does not imply a new Action release, and vice versa.

A major-version floating tag (`v1`) is maintained so consumers can pin
`uses: tiger-dreams/awesometime@v1` and receive non-breaking updates
automatically, following the same convention as `actions/checkout@v4` etc.

A new workflow, `.github/workflows/release-action.yml`, handles moving the
tag: triggered manually via `workflow_dispatch` only (not on every npm
version tag — the Action and the npm package release independently, so
tying the trigger to the existing `v*` npm tags would re-release the Action
on npm-only changes that never touched `action.yml`/`dist/`). It rebuilds
`dist/index.js` via `ncc` and force-moves the `v1` tag to that commit. This
is separate from the existing `publish.yml` (npm/OIDC) workflow, which is
untouched by this spec.

`dist/index.js` is committed to the repo (standard practice for JS Actions)
and marked `linguist-generated=true` in `.gitattributes` so it's collapsed
in diffs and excluded from GitHub's language stats.

## Example usage (goes in README)

```yaml
on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:
permissions:
  contents: write
jobs:
  update-badge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: tiger-dreams/awesometime@v1
        with:
          type: countdown
          date: '2027-01-01'
          theme: dracula
          output-path: awesometime.svg
```

## Testing plan

- Unit tests for the input-object → `renderFromQuery` query mapping
  (mirrors the existing `tests/render.test.js` coverage, one level up).
- An integration test that runs the bundled `dist/index.js` in a scratch git
  repo (via `@actions/*` test harness or a local `act`-style run) and
  asserts: file written, first run commits, second run with no date/theme
  change produces no commit.
- Manual smoke test: a real workflow in a scratch repo, run via
  `workflow_dispatch`, confirming the commit appears with the right
  committer and the SVG renders correctly on github.com.
