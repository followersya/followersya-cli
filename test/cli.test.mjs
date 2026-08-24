import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cli = join(root, 'followersya.mjs');

test('prints help without credentials', () => {
  const result = spawnSync(process.execPath, [cli, 'help'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /followersya — commerce API CLI/);
});

test('returns a usage error when search has no query', () => {
  const result = spawnSync(process.execPath, [cli, 'search'], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /usage: followersya search <query>/);
});
