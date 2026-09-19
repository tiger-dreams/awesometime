# GitHub Action Distribution Channel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third awesometime distribution channel — a GitHub Action that renders a badge via the existing `renderFromQuery` function and commits it into the consumer's repo, with zero runtime external dependency.

**Architecture:** A thin wrapper around `lib/render.js`'s `renderFromQuery(query, now)`. New `action/` directory holds the Action's own source (`mapInputs.js` → `main.js` → `index.js`), bundled with `@vercel/ncc` into a committed `dist/index.js` that `action.yml` points `runs.main` at. Git commit logic uses plain `node:child_process` (`execSync`), no extra runtime dependency.

**Tech Stack:** Node.js (existing `"type": "module"` ESM, `node --test`), `@actions/core` (devDependency, bundled), `@vercel/ncc` (devDependency, build-time only).

## Global Constraints

- Node engines floor: `>=18` (existing `package.json`) — no change.
- The published npm package (`@jeongpd/awesometime`) must stay zero-runtime-dependency: `@actions/core` and `@vercel/ncc` go in `devDependencies` only, never `dependencies`.
- Action implementation must be a **JS Action** (not Docker, not a composite action shelling out to `npx`) — both alternatives require a runtime fetch (image pull / npm registry), which contradicts the whole point of this channel (see spec's Architecture section).
- The Action defaults `motion` to `reduce`; the hosted API's own default (ticking) is unchanged.
- `release-action.yml` triggers via `workflow_dispatch` only — never tied to the existing npm `v*` tag pattern (the Action and the npm package release independently).
- Commit identity for both the Action's own commits and any commits made while testing it: `github-actions[bot]` / `41898282+github-actions[bot]@users.noreply.github.com`.
- `dist/index.js` is committed to the repo and marked `linguist-generated=true` in `.gitattributes`.
- `.github/workflows/publish.yml` (the existing npm/OIDC workflow) is not touched by this plan.
- Spec: `docs/superpowers/specs/2026-09-19-github-action-design.md`.

---

### Task 1: Input mapping (`action/mapInputs.js`)

**Files:**
- Create: `action/mapInputs.js`
- Test: `tests/action.test.js`

**Interfaces:**
- Consumes: nothing (pure function, no dependency on other new files).
- Produces: `buildQuery(inputs: Record<string,string>): Record<string,string>` — later tasks (`action/main.js`) call this with the flat input map read from `@actions/core.getInput`, and feed its return value straight into `renderFromQuery` from `lib/render.js` (already exists — see `lib/render.js:29`).

- [ ] **Step 1: Write the failing tests**

Create `tests/action.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildQuery } from '../action/mapInputs.js';
import { renderFromQuery } from '../lib/render.js';

const NOW = new Date('2026-08-27T00:00:00Z');

test('buildQuery drops empty-string inputs so renderFromQuery falls back to its own defaults', () => {
  const inputs = {
    type: '', date: '', label: '', theme: '', style: '', period: '',
    locale: '', tz: '', font: '', color: '', accent2: '', bg: '',
    border: '', text: '', dim: '', 'bar-bg': '', motion: 'reduce',
  };
  assert.deepEqual(buildQuery(inputs), { motion: 'reduce' });
});

test('buildQuery maps bar-bg (kebab-case Action input) to barBg (query key)', () => {
  const query = buildQuery({ 'bar-bg': '21262d', motion: 'reduce' });
  assert.equal(query.barBg, '21262d');
  assert.equal(query['bar-bg'], undefined);
});

test('buildQuery passes through a full set of inputs unchanged (except bar-bg)', () => {
  const inputs = {
    type: 'countdown', date: '2026-12-31', label: 'New Year', theme: 'dracula',
    style: 'badge', period: 'week', locale: 'ko', tz: 'Asia/Seoul', font: 'jetbrains',
    color: 'ff6b6b', accent2: '00ff00', bg: '111111', border: '222222',
    text: '333333', dim: '444444', 'bar-bg': '555555', motion: 'reduce',
  };
  const query = buildQuery(inputs);
  assert.equal(query.type, 'countdown');
  assert.equal(query.date, '2026-12-31');
  assert.equal(query.theme, 'dracula');
  assert.equal(query.barBg, '555555');
  assert.equal(query.motion, 'reduce');
});

test('a mapped query renders successfully through renderFromQuery', () => {
  const query = buildQuery({
    type: 'countdown', date: '2026-12-31', label: 'New Year',
    theme: 'dracula', motion: 'reduce',
  });
  const { svg, status } = renderFromQuery(query, NOW);
  assert.equal(status, 200);
  assert.match(svg, /New Year/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../action/mapInputs.js'` (the file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `action/mapInputs.js`:

```js
/**
 * Maps GitHub Action inputs (flat string map, Actions Toolkit style — every
 * value is a string, '' when not provided) to the query object
 * renderFromQuery expects. Empty values are dropped so renderFromQuery's own
 * fallback logic (theme -> 'dark', style -> 'terminal', etc.) applies,
 * exactly like an omitted query param on the hosted API.
 * @param {Record<string,string>} inputs
 * @returns {Record<string,string>}
 */
export function buildQuery(inputs) {
  const query = {};
  const passthrough = [
    'type', 'date', 'label', 'theme', 'style', 'period',
    'locale', 'tz', 'font', 'color', 'accent2', 'bg',
    'border', 'text', 'dim', 'motion',
  ];
  for (const key of passthrough) {
    if (inputs[key]) query[key] = inputs[key];
  }
  if (inputs['bar-bg']) query.barBg = inputs['bar-bg'];
  return query;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all 4 new tests green, plus the existing suite unaffected.

- [ ] **Step 5: Commit**

```bash
git add action/mapInputs.js tests/action.test.js
git commit -m "feat(action): add input-to-query mapping for the GitHub Action"
```

---

### Task 2: Action logic (`action/main.js`)

**Files:**
- Create: `action/main.js`
- Create: `tests/helpers/tempGitRepo.js`
- Modify: `tests/action.test.js` (append tests)
- Modify: `package.json` (add `@actions/core` devDependency)

**Interfaces:**
- Consumes: `buildQuery` from `action/mapInputs.js` (Task 1); `renderFromQuery` from `lib/render.js` (existing).
- Produces: `run({ getInput, now }?): void` — Task 3's `action/index.js` imports and calls this with no arguments (real `@actions/core.getInput` and real `Date`).

- [ ] **Step 1: Install the dependency**

Run: `npm install --save-dev @actions/core`
Expected: `package.json` gains a `"devDependencies": { "@actions/core": "^X.Y.Z" }` entry (npm picks the current version).

- [ ] **Step 2: Write the test helper**

Create `tests/helpers/tempGitRepo.js`:

```js
import { mkdtempSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Creates a throwaway git repo with a real local "origin" remote (a bare
 * repo on the same filesystem), so code under test can `git push` for real
 * without touching the network. Returns the working repo's directory.
 */
export function makeTempGitRepo() {
  const bareDir = mkdtempSync(join(tmpdir(), 'awesometime-action-remote-'));
  execSync('git init -q --bare', { cwd: bareDir });

  const dir = mkdtempSync(join(tmpdir(), 'awesometime-action-test-'));
  execSync('git init -q -b main', { cwd: dir });
  execSync('git config user.name test', { cwd: dir });
  execSync('git config user.email test@example.com', { cwd: dir });
  writeFileSync(join(dir, 'README.md'), '# test\n');
  execSync('git add README.md', { cwd: dir });
  execSync('git commit -q -m init', { cwd: dir });
  execSync(`git remote add origin ${JSON.stringify(bareDir)}`, { cwd: dir });
  execSync('git push -q -u origin main', { cwd: dir });
  return dir;
}
```

- [ ] **Step 3: Write the failing tests**

In `tests/action.test.js`, add these imports to the existing import block at
the top of the file:

```js
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { run } from '../action/main.js';
import { makeTempGitRepo } from './helpers/tempGitRepo.js';
```

Then append the following below the existing tests (`NOW` is already
in scope from Task 1's top-of-file declaration):

```js
function fakeGetInput(values) {
  return (name) => values[name] || '';
}

test('run() writes the badge and commits it when the file changed', () => {
  const dir = makeTempGitRepo();
  const cwd = process.cwd();
  process.chdir(dir);
  try {
    run({
      getInput: fakeGetInput({
        type: 'countdown', date: '2026-12-31', label: 'New Year',
        theme: 'dracula', 'output-path': 'awesometime.svg',
      }),
      now: NOW,
    });

    assert.ok(existsSync(join(dir, 'awesometime.svg')));
    assert.match(readFileSync(join(dir, 'awesometime.svg'), 'utf8'), /New Year/);

    const log = execSync('git log --oneline -1', { cwd: dir }).toString();
    assert.match(log, /chore: update awesometime badge/);
  } finally {
    process.chdir(cwd);
  }
});

test('run() skips the commit when the rendered SVG is unchanged', () => {
  const dir = makeTempGitRepo();
  const cwd = process.cwd();
  process.chdir(dir);
  try {
    const inputs = fakeGetInput({
      type: 'countdown', date: '2026-12-31', label: 'New Year',
      'output-path': 'awesometime.svg',
    });
    run({ getInput: inputs, now: NOW });
    const firstLog = execSync('git log --oneline', { cwd: dir }).toString();

    run({ getInput: inputs, now: NOW });
    const secondLog = execSync('git log --oneline', { cwd: dir }).toString();

    assert.equal(firstLog, secondLog);
  } finally {
    process.chdir(cwd);
  }
});

test('run() does not write a file when the date input is invalid', () => {
  const dir = makeTempGitRepo();
  const cwd = process.cwd();
  process.chdir(dir);
  try {
    run({
      getInput: fakeGetInput({ type: 'countdown', date: 'not-a-date', 'output-path': 'awesometime.svg' }),
      now: NOW,
    });
    assert.equal(existsSync(join(dir, 'awesometime.svg')), false);
  } finally {
    process.chdir(cwd);
  }
});
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../action/main.js'`.

- [ ] **Step 5: Write the implementation**

Create `action/main.js`:

```js
import * as core from '@actions/core';
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { renderFromQuery } from '../lib/render.js';
import { buildQuery } from './mapInputs.js';

const INPUT_NAMES = [
  'type', 'date', 'label', 'theme', 'style', 'period', 'locale', 'tz',
  'font', 'color', 'accent2', 'bg', 'border', 'text', 'dim', 'bar-bg', 'motion',
];

/**
 * The Action's entrypoint logic. `getInput`/`now` are injectable so tests
 * can run this without a real Actions environment or system clock.
 * @param {{ getInput?: (name: string) => string, now?: Date }} [opts]
 */
export function run({ getInput = core.getInput, now = new Date() } = {}) {
  const inputs = {};
  for (const name of INPUT_NAMES) inputs[name] = getInput(name);
  const outputPath = getInput('output-path') || 'awesometime.svg';
  const commitMessage = getInput('commit-message') || 'chore: update awesometime badge';

  const query = buildQuery(inputs);
  const { svg, status } = renderFromQuery(query, now);

  if (status !== 200) {
    core.setFailed(`awesometime rendered an error card (status ${status}) — check the "date"/"tz" inputs.`);
    return;
  }

  const previous = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : null;
  if (previous === svg) {
    core.info('No change to the badge, skipping commit.');
    return;
  }

  writeFileSync(outputPath, svg);

  execSync('git config user.name "github-actions[bot]"');
  execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  execSync(`git add ${JSON.stringify(outputPath)}`);
  execSync(`git commit -m ${JSON.stringify(commitMessage)}`);
  execSync('git push');
  core.info(`Committed ${outputPath}`);
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all tests green, including the 3 new ones and Task 1's 4.

- [ ] **Step 7: Commit**

```bash
git add action/main.js tests/helpers/tempGitRepo.js tests/action.test.js package.json package-lock.json
git commit -m "feat(action): add run() — render, write, and commit the badge"
```

---

### Task 3: Bundled entrypoint (`action.yml` + `dist/index.js`)

**Files:**
- Create: `action/index.js`
- Create: `action.yml`
- Create: `.gitattributes`
- Modify: `package.json` (add `@vercel/ncc` devDependency, add `build:action` script)
- Create (generated): `dist/index.js`
- Test: `tests/action-dist.test.js`

**Interfaces:**
- Consumes: `run` from `action/main.js` (Task 2).
- Produces: `dist/index.js` — the file `action.yml`'s `runs.main` points at; this is what GitHub Actions actually executes when a consumer's workflow does `uses: tiger-dreams/awesometime@v1`.

- [ ] **Step 1: Install the bundler**

Run: `npm install --save-dev @vercel/ncc`

- [ ] **Step 2: Write the entrypoint**

Create `action/index.js`:

```js
import { run } from './main.js';

run();
```

- [ ] **Step 3: Write `action.yml`**

Create `action.yml` at the repo root:

```yaml
name: 'awesometime badge'
description: 'Render an awesometime SVG badge (year progress, countdown, or days-since) and commit it into this repository.'
author: 'tiger-dreams'
branding:
  icon: 'clock'
  color: 'blue'
inputs:
  type:
    description: "'year-progress' (default), 'countdown', or 'dayssince'"
    default: ''
  date:
    description: 'YYYY-MM-DD — required for type=countdown or type=dayssince'
    default: ''
  label:
    description: 'Badge title/label text'
    default: ''
  theme:
    description: "'dark' (default), 'light', 'auto', or a named theme: tokyonight, dracula, nord, gruvbox, onedark, monokai, cobalt, synthwave, solarized-dark, github-dark, radical, ayu-dark"
    default: ''
  style:
    description: "'terminal' (default), 'gradient', 'minimal', or 'badge' (countdown only)"
    default: ''
  period:
    description: "'day', 'week', 'month', 'quarter', or 'year' (default) — year-progress only"
    default: ''
  locale:
    description: "'en' (default), 'ko', 'zh', 'ja', 'es', or 'pt'"
    default: ''
  tz:
    description: 'IANA timezone (e.g. Asia/Seoul) for interpreting "date"'
    default: ''
  font:
    description: "'mono' (default), 'jetbrains', 'fira', 'ibm', 'cascadia', or 'space'"
    default: ''
  color:
    description: 'Accent color override, 3 or 6-digit hex, no #'
    default: ''
  accent2:
    description: 'Secondary accent color override, hex no #'
    default: ''
  bg:
    description: 'Background color override, hex no #'
    default: ''
  border:
    description: 'Border color override, hex no #'
    default: ''
  text:
    description: 'Primary text color override, hex no #'
    default: ''
  dim:
    description: 'Secondary/muted text color override, hex no #'
    default: ''
  bar-bg:
    description: 'Progress/track background color override, hex no #'
    default: ''
  motion:
    description: "'reduce' (default here — a static seconds digit) or any other value to keep the ticking countdown animation despite it being a periodic snapshot once committed"
    default: 'reduce'
  output-path:
    description: 'Where to write the SVG file, relative to the repo root'
    default: 'awesometime.svg'
  commit-message:
    description: 'Commit message used when the rendered badge changed'
    default: 'chore: update awesometime badge'
runs:
  using: 'node24'
  main: 'dist/index.js'
```

- [ ] **Step 4: Add the build script and `.gitattributes`**

In `package.json`, add to `"scripts"`:

```json
"build:action": "ncc build action/index.js -o dist --license licenses.txt"
```

Create `.gitattributes`:

```
dist/** linguist-generated=true
```

- [ ] **Step 5: Build the bundle**

Run: `npm run build:action`
Expected: `dist/index.js` (and `dist/licenses.txt`) are created.

- [ ] **Step 6: Write the failing smoke test**

Create `tests/action-dist.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeTempGitRepo } from './helpers/tempGitRepo.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST_ENTRY = resolve(__dirname, '..', 'dist', 'index.js');

test('the bundled dist/index.js renders and commits a badge end-to-end', () => {
  const dir = makeTempGitRepo();
  execFileSync('node', [DIST_ENTRY], {
    cwd: dir,
    env: {
      ...process.env,
      INPUT_TYPE: 'countdown',
      INPUT_DATE: '2027-01-01',
      INPUT_LABEL: '2027',
      INPUT_THEME: 'dracula',
      'INPUT_OUTPUT-PATH': 'awesometime.svg',
      'INPUT_COMMIT-MESSAGE': 'chore: update awesometime badge',
    },
  });

  const svgPath = join(dir, 'awesometime.svg');
  assert.ok(existsSync(svgPath));
  assert.match(readFileSync(svgPath, 'utf8'), /2027/);

  const log = execFileSync('git', ['log', '--oneline', '-1'], { cwd: dir }).toString();
  assert.match(log, /chore: update awesometime badge/);
});
```

Note: this test depends on `dist/index.js` already existing (Step 5) — it does not rebuild it. This mirrors reality: CI and consumers both run the already-built, committed `dist/index.js`, never a rebuild-on-the-fly.

- [ ] **Step 7: Run the test to verify it fails first (sanity check), then passes**

Run: `npm test`
Expected: this specific test PASSes on the first run, since `dist/index.js` was already built in Step 5 — there is no "make it fail first" step here because there's no logic to implement in this task, only bundling. Instead, verify the sanity check the other way: temporarily rename `dist/index.js`, run `npm test`, confirm this test fails with `ENOENT` or a spawn error, then restore the file and re-run to confirm it passes again.

- [ ] **Step 8: Commit**

```bash
git add action/index.js action.yml .gitattributes package.json package-lock.json dist tests/action-dist.test.js
git commit -m "feat(action): bundle the Action with ncc and add action.yml"
```

---

### Task 4: Release workflow (`.github/workflows/release-action.yml`)

**Files:**
- Create: `.github/workflows/release-action.yml`

**Interfaces:**
- Consumes: `npm run build:action` (Task 3), `npm test` (existing).
- Produces: a moving `v1` git tag that `uses: tiger-dreams/awesometime@v1` resolves against — nothing later in this plan depends on it programmatically.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/release-action.yml`:

```yaml
name: Release Action

on:
  workflow_dispatch: {}

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v7
        with:
          node-version: '22'

      - run: npm ci

      - run: npm test

      - name: Build dist/index.js
        run: npm run build:action

      - name: Commit dist if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add dist
          git diff --cached --quiet && echo "No dist changes" || git commit -m "chore: rebuild action dist"
          git push origin HEAD:main

      - name: Move the v1 tag to this commit
        run: |
          git tag -f v1
          git push origin v1 --force
```

- [ ] **Step 2: Verify the YAML is well-formed**

Push this file to a branch (as part of this task's commit, pushed to `main` per this plan's normal flow) and open the repo's **Actions** tab on GitHub. Confirm "Release Action" appears in the workflow list on the left — GitHub silently omits a workflow file from that list if it fails to parse, so its presence there is the verification.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release-action.yml
git commit -m "ci: add manual release workflow for the GitHub Action (v1 tag)"
```

---

### Task 5: Documentation (`README.md`)

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: nothing (documentation only).
- Produces: nothing further in this plan depends on it.

- [ ] **Step 1: Add the "GitHub Action" section**

In `README.md`, insert a new section immediately after the existing `## Self-hosting` section (before `## Contributing`):

```markdown
## GitHub Action

A third way to use awesometime, alongside the hosted URL and the npm
library: a GitHub Action that renders a badge and commits it straight into
your repo. Unlike the hosted URL, this has **zero runtime external
dependency** — no live server involved, ever — and works in environments
where outbound requests to third-party domains are blocked but `github.com`
itself is reachable.

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

Inputs mirror the hosted API's query parameters (`type`, `date`, `label`,
`theme`, `style`, `period`, `locale`, `tz`, `font`, `color`, `accent2`,
`bg`, `border`, `text`, `dim`, `bar-bg`), plus two Action-only inputs:
`output-path` (default `awesometime.svg`) and `commit-message` (default
`chore: update awesometime badge`).

One difference from the hosted URL: the committed SVG is a periodic
snapshot, refreshed only on whatever `schedule` cron you set, not
re-rendered on every view. Because of that, `motion` defaults to `reduce`
here (a static seconds digit) instead of the hosted API's live-ticking
default — a ticking animation baked into a file that only updates once a
day would loop convincingly but show the wrong second.
```

- [ ] **Step 2: Verify the addition renders correctly**

Run: `grep -n "## GitHub Action" README.md`
Expected: one match, positioned between `## Self-hosting` and `## Contributing`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document the GitHub Action distribution channel"
```

---

## Self-Review Notes

- **Spec coverage:** Architecture (Task 3), input parity (Task 1), motion default (Task 1 default + Task 3 `action.yml` default + Task 5 doc), commit behavior incl. no-op skip (Task 2), versioning/release (Task 4), example usage (Task 5), testing plan's three levels — unit (Task 1), integration-via-scratch-repo (Task 2), and bundled end-to-end (Task 3) — all covered.
- **Placeholder scan:** no TBD/TODO markers remain; the two items the spec had deferred (tag trigger convention, `.gitattributes` handling) were resolved during the spec's self-review and are concrete here (Task 4 step 1, Task 3 step 4).
- **Type/signature consistency:** `buildQuery(inputs)` (Task 1) is called identically in `action/main.js`'s `run()` (Task 2); `run({ getInput, now })`'s options object shape matches between its definition (Task 2 Step 5) and every call site in tests (Task 2 Step 3, Task 3's dist test invokes it indirectly via env vars instead, consistent with real Actions input passing).
