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
