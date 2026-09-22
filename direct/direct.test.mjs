import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

test('생수 폼은 인증된 QA 토큰을 URL에서 제거하고 서버에만 전달한다', () => {
  assert.match(html, /qaMode=qs\.get\('qa'\)==='1'&&qaToken\.length>=32/);
  assert.match(html, /history\.replaceState\(null,'',location\.pathname\+location\.search\)/);
  assert.match(html, /testField\.value=qaMode\?'true':'false'/);
  assert.match(html, /tokenField\.value=qaToken/);
});

test('신뢰한 Apps Script 응답과 일치하는 요청만 처리한다', () => {
  assert.match(html, /googleusercontent\.com/);
  assert.match(html, /data\.request_id!==pendingRequestId/);
  assert.match(html, /event\.source!==frame\.contentWindow/);
  assert.match(html, /data\.is_test!==qaMode\|\|!data\.lead_id/);
});

test('유효 신규 제출만 GA와 Meta Lead로 전환 처리한다', () => {
  assert.match(html, /data\.kind!=='duplicate'/);
  assert.match(html, /!data\.performance_excluded/);
  assert.match(html, /data\.conversion_eligible===true/);
  assert.match(html, /event_id:data\.lead_id/);
  assert.match(html, /deliveryinMeta\.trackLead/);
});
