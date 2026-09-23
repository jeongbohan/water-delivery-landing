import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('./app.js', import.meta.url), 'utf8');

test('Apps Script의 opaque-origin 응답은 제출 iframe에서 온 경우에만 처리한다', () => {
  assert.match(app, /event\.origin==='null'/);
  assert.match(app, /event\.source!==frame\.contentWindow\|\|!trustedOrigin/);
  assert.match(app, /data\.source!=='deliveryin-furniture-direct-form'/);
  assert.match(app, /data\.request_id!==pending/);
});

test('브라우저가 수정된 제출 로직을 즉시 받도록 캐시 키를 갱신한다', () => {
  assert.match(html, /app\.js\?v=20260923-701/);
});
