import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../lib/index.js';

test('package entry point exports every renderer, including renderCountdownBadge', () => {
  const fns = [
    'yearProgress', 'periodProgress', 'countdown', 'parseDateParam', 'isValidTimeZone',
    'renderTerminalProgress', 'renderGradientProgress', 'renderMinimalProgress',
    'renderCountdownCard', 'renderCountdownBadge', 'renderSafetySign',
    'renderFromQuery', 'strings',
  ];
  for (const name of fns) {
    assert.equal(typeof api[name], 'function', `${name} should be exported from lib/index.js`);
  }
  assert.ok(Array.isArray(api.SUPPORTED_LOCALES) && api.SUPPORTED_LOCALES.includes('en'));
});
