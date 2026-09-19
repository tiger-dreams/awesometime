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
