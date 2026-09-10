import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('./app.js', import.meta.url), 'utf8');

test('운영 수신기가 연결되기 전 제출을 잠근다', () => {
  assert.match(html, /data-submit-endpoint=""/);
  assert.match(html, /id="submitButton"[^>]*disabled/);
});

test('컬리 전용 추적키와 A\/B 변수를 보존한다', () => {
  for (const name of ['content_id','source_code','utm_source','utm_medium','utm_campaign','utm_content','campaign_id','adset_id','ad_id','lp_variant','funnel_type','request_id']) {
    assert.match(html, new RegExp(`name="${name}"`));
  }
  assert.match(app, /kurly-direct-2609-/);
  assert.match(app, /LP-KURLY-PROOF-01/);
  assert.match(app, /proofSlotEarly/);
  assert.match(app, /proofSlotLate/);
});

test('광고 표면 금지어와 보장 표현을 사용하지 않는다', () => {
  for (const forbidden of ['면접','합격','심사','선발','지원서','무조건','누구나','수익 보장','평균 급여']) {
    assert.equal(html.includes(forbidden), false, `금지 표현 발견: ${forbidden}`);
  }
});

test('컬리 차량 기준과 사례 한계를 명시한다', () => {
  assert.match(html, /냉동탑차/);
  assert.match(html, /2026년 5월 지급 사례 6건/);
  assert.match(html, /평균이나 보장을 뜻하지 않아요/);
});

test('GA4 전환 퍼널 이벤트를 포함한다', () => {
  for (const eventName of ['landing_view','landing_click','proof_view','form_start','generate_lead']) {
    assert.match(app, new RegExp(eventName));
  }
});
