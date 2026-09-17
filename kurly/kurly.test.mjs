import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('./app.js', import.meta.url), 'utf8');

test('운영 수신기를 연결하고 고객 제출을 연다', () => {
  assert.match(html, /data-submit-endpoint="https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec"/);
  assert.match(html, /data-customer-submit-enabled="true"/);
  assert.match(html, /id="submitButton"[^>]*disabled/);
  assert.match(app, /qa_token/);
  assert.match(app, /data\.is_test !== qaMode/);
});

test('컬리 전용 추적키를 보존하고 801은 A안으로 고정한다', () => {
  for (const name of ['content_id','source_code','utm_source','utm_medium','utm_campaign','utm_content','campaign_id','adset_id','ad_id','campaign_name','adset_name','ad_name','lp_variant','funnel_type','request_id']) {
    assert.match(html, new RegExp(`name="${name}"`));
  }
  assert.match(app, /kurly-k3-2609-801-/);
  assert.match(app, /AD-20260916-002-801/);
  assert.match(app, /const variant = 'a'/);
  assert.equal(app.includes('Math.random() < .5'), false);
  assert.match(app, /proofSlotEarly/);
  assert.match(app, /proofSlotLate/);
});

test('회사 로고를 사용하고 실험안 표시는 노출하지 않는다', () => {
  assert.match(html, /\.\.\/img\/deliveryin-logo\.png/);
  assert.equal(html.includes('variant-chip'), false);
  assert.equal(html.includes('LP A안'), false);
  assert.equal(app.includes('variantChip'), false);
});

test('광고 표면 금지어와 보장 표현을 사용하지 않는다', () => {
  for (const forbidden of ['면접','합격','심사','선발','지원서','무조건','누구나','수익 보장','평균 급여']) {
    assert.equal(html.includes(forbidden), false, `금지 표현 발견: ${forbidden}`);
  }
});

test('컬리 지급 사례의 한계를 명시한다', () => {
  assert.match(html, /2026년 5월 지급 사례 6건/);
  assert.match(html, /평균이나 보장을 뜻하지 않아요/);
});

test('폼에서 냉동탑차 준비 질문을 제거하고 생수 랜딩 동의 흐름을 사용한다', () => {
  assert.equal(html.includes('name="vehicle_status"'), false);
  assert.equal(html.includes('냉동탑차 준비 상태'), false);
  for (const copy of ['지원을 위한 정보 수집에 동의해주세요.','전체 동의에는 필수 및 선택목적','선택동의를 거부하셔도 지원은 가능합니다.','전체 동의','[필수]','개인정보 수집 및 이용 동의','[선택]','광고성 정보 및 신규 모집 소식 수신 동의','수신 동의 혜택','가이드북과 인터넷 강의 자료']) {
    assert.equal(html.includes(copy), true, `동의 문구 누락: ${copy}`);
  }
  for (const id of ['allConsent','privacyConsent','marketingConsent']) {
    assert.match(html, new RegExp(`id="${id}"`));
    assert.match(app, new RegExp(id));
  }
});

test('지급 자료 바로 아래에 고해상도 소득 안내를 두고 차량 경고 문구를 사용한다', () => {
  assert.match(html, /<template id="proofTemplate">[\s\S]*pay-statements-may-2026\.jpg[\s\S]*income-1000-profile-hd\.png[\s\S]*<\/template>/);
  assert.match(html, /차 부터 구매하지 마세요!/);
  assert.equal(html.includes('차량을 바로 준비해야 하나요?'), false);
});

test('기존 세로형 상세페이지의 핵심 정보 흐름을 보존한다', () => {
  for (const marker of ['hero-driver-v4.png','여성도 · 50대도 조건 확인','차량 없어도 신청 가능','10년차 기사의 선택','예비 기사님들을 위한','차량이 아직 없어도','마지막 확인','현장 이야기','간단 조건 확인']) {
    assert.match(html, new RegExp(marker));
  }
});

test('히어로와 일러스트 배경의 보라색을 통일한다', () => {
  assert.match(readFileSync(new URL('./style.css', import.meta.url), 'utf8'), /\.hero\{[^}]*background:#71249a/);
  assert.match(readFileSync(new URL('./style.css', import.meta.url), 'utf8'), /\.hero:before\{content:none\}/);
});

test('기존 Q1~Q4 단가·무게·적응·수입 이미지를 순서대로 사용한다', () => {
  for (const image of ['qa-1-unit-price.png','qa-2-weight.png','qa-3-adaptation.png','qa-4-income.png']) {
    assert.match(html, new RegExp(image));
  }
  assert.equal(html.includes('reason-list'), false);
});

test('Q1 상품명, 차량 임대 안내, 지원 조건 문구를 요청안으로 표시한다', () => {
  assert.match(html, /<strong>마켓컬리<\/strong>, 단가는 얼마인가요\?/);
  assert.match(html, /vehicle-rental-hd\.png/);
  for (const copy of ['스케쥴 문제 없는 성실함','바로 그만두지 않는 끈기','운전면허 소지자(1,2종 무관)','55세 이하의 여성과 남성','체력과 열정이 남다르시다면 혹시 모릅니다']) {
    assert.equal(html.includes(copy), true, `요청 문구 누락: ${copy}`);
  }
});

test('FAQ 대신 최신 2,588명 신뢰 섹션을 표시한다', () => {
  assert.match(html, /배송인그룹 소속 배송인/);
  assert.match(html, /2,588명/);
  assert.match(html, /근속 유지율 95\.7%/);
  assert.match(html, /route-manager-count-2588\.webp/);
  assert.equal(html.includes('class="section faq"'), false);
});

test('신뢰 섹션은 보유 단체 사진을 배경으로 쓰고 현황판 하단 여백을 자른다', () => {
  const css = readFileSync(new URL('./style.css', import.meta.url), 'utf8');
  assert.match(css, /\.trust-head\{[^}]*scholarship-group\.jpg/);
  assert.match(css, /\.trust-section>img\{[^}]*aspect-ratio:1\.04[^}]*object-fit:cover[^}]*object-position:center top/);
});

test('Only 구간은 기존 랜딩 문구를 그대로 사용한다', () => {
  for (const copy of ['오직 컬리','가장 가벼운 택배','여자도 가능한 고수익 배송','50대 기사 만족도 1위']) {
    assert.match(html, new RegExp(copy));
  }
});

test('GA4 전환 퍼널 이벤트를 포함한다', () => {
  for (const eventName of ['landing_view','landing_click','proof_view','form_start','generate_lead']) {
    assert.match(app, new RegExp(eventName));
  }
});

test('영상은 유튜브로 이탈하지 않고 페이지 내부 팝업에서 재생한다', () => {
  assert.equal(html.includes('href="https://www.youtube.com'), false);
  assert.equal(html.includes('target="_blank"'), false);
  assert.equal((html.match(/data-video-id=/g) || []).length, 4);
  assert.match(html, /id="videoModal"[^>]*hidden/);
  assert.match(html, /role="dialog"[^>]*aria-modal="true"/);
  assert.match(app, /youtube-nocookie\.com\/embed/);
  assert.match(app, /playsinline=1/);
  assert.match(app, /videoFrame\.src = ''/);
  assert.match(app, /event\.key === 'Escape'/);
});
