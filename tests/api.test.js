import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/index.js';

test('successful badge responses keep the long cache', () => {
  const res = handler(new Request('https://awesometime.example/api'));
  assert.equal(res.status, 200);
  assert.match(res.headers.get('cache-control'), /max-age=3600/);
});

test('error responses are only cached briefly', () => {
  const res = handler(new Request('https://awesometime.example/api?type=countdown&date=not-a-date'));
  assert.equal(res.status, 400);
  const cc = res.headers.get('cache-control');
  assert.match(cc, /max-age=60/);
  assert.ok(!cc.includes('3600'), 'error responses must not carry the 1-hour cache');
});
