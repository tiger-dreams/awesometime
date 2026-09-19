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
