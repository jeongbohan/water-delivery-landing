import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./meta-pixel.js', import.meta.url), 'utf8');

function load(search = '', hash = '') {
  const stored = new Map();
  const appended = [];
  const context = {
    URLSearchParams,
    location: {search, hash},
    localStorage: {getItem: key => stored.get(key) || null, setItem: (key, value) => stored.set(key, value)},
    document: {
      currentScript: {dataset: {pixelId: '284709942981308'}},
      createElement: () => ({}),
      head: {appendChild: node => appended.push(node)}
    },
    window: {}
  };
  vm.runInNewContext(source, context);
  return {context, stored, appended};
}

test('유효 신규 제출만 Lead를 eventID=lead_id로 한 번 전송한다', () => {
  const {context, stored} = load();
  const input = {leadId:'K-260922-ABC12345',kind:'new',isTest:false,performanceExcluded:false,conversionEligible:true,contentId:'AD-20260916-002-801',sourceCode:'kurly-k3-2609-801-a',variant:'a'};
  assert.deepEqual({...context.window.deliveryinMeta.trackLead(input)}, {sent:true,reason:'sent'});
  const track = context.window.fbq.queue.find(args => args[0] === 'track');
  assert.equal(track[1], 'Lead');
  assert.equal(track[3].eventID, input.leadId);
  assert.equal(stored.get(`meta_lead_event_${input.leadId}`), '1');
  assert.deepEqual({...context.window.deliveryinMeta.trackLead(input)}, {sent:false,reason:'duplicate_event'});
  assert.equal(context.window.fbq.queue.filter(args => args[0] === 'track').length, 1);
});

test('QA 모드에서는 Pixel을 초기화하지 않고 Lead도 보내지 않는다', () => {
  const token = 'x'.repeat(32);
  const {context, appended} = load('?qa=1', `#qa_token=${token}`);
  const result = context.window.deliveryinMeta.trackLead({leadId:'K-QA-1',conversionEligible:true});
  assert.deepEqual({...result}, {sent:false,reason:'qa_mode'});
  assert.equal(context.window.fbq, undefined);
  assert.equal(appended.length, 0);
});

test('중복·성과제외·전환불가 응답은 Lead를 보내지 않는다', () => {
  for (const input of [
    {leadId:'L-1',kind:'duplicate',conversionEligible:true},
    {leadId:'L-2',kind:'new',performanceExcluded:true,conversionEligible:true},
    {leadId:'L-3',kind:'new',conversionEligible:false}
  ]) {
    const {context} = load();
    assert.equal(context.window.deliveryinMeta.trackLead(input).sent, false);
    assert.equal(context.window.fbq.queue.filter(args => args[0] === 'track').length, 0);
  }
});

test('세 운영 랜딩이 동일 Pixel 모듈을 사용한다', () => {
  for (const path of ['./kurly/index.html','./furniture/index.html','./direct/index.html']) {
    const html = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.match(html, /meta-pixel\.js\?v=20260922-1/);
    assert.match(html, /data-pixel-id="284709942981308"/);
  }
});
