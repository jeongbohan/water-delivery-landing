(() => {
  const qs = new URLSearchParams(location.search);
  const fragment = new URLSearchParams(location.hash.slice(1));
  const qaToken = fragment.get('qa_token') || '';
  const qaMode = qs.get('qa') === '1' && qaToken.length >= 32;
  if (qaToken) history.replaceState(null, '', location.pathname + location.search);
  // 801은 저예산 단일 경로 검증이다. 랜딩 변수까지 나뉘지 않도록 A안으로 고정한다.
  const variant = 'a';

  const proof = document.querySelector('#proofTemplate').content.cloneNode(true);
  document.querySelector(variant === 'b' ? '#proofSlotEarly' : '#proofSlotLate').appendChild(proof);
  document.documentElement.dataset.variant = variant;

  const tracking = {
    content_id: qs.get('content_id') || 'AD-20260916-002-801',
    source_code: qs.get('source_code') || `kurly-k3-2609-801-${variant}`,
    utm_source: qs.get('utm_source') || 'meta',
    utm_medium: qs.get('utm_medium') || 'paid_social',
    utm_campaign: qs.get('utm_campaign') || 'kurly_directform_202609',
    utm_content: qs.get('utm_content') || '',
    campaign_id: qs.get('campaign_id') || '',
    adset_id: qs.get('adset_id') || '',
    ad_id: qs.get('ad_id') || '',
    campaign_name: qs.get('campaign_name') || '',
    adset_name: qs.get('adset_name') || '',
    ad_name: qs.get('ad_name') || '',
    lp_variant: variant
  };
  Object.entries(tracking).forEach(([key, value]) => {
    const id = '#' + key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const field = document.querySelector(id);
    if (field) field.value = value;
  });

  gtag('event', 'landing_view', {
    content_id: tracking.content_id,
    lp_variant: variant,
    source_code: tracking.source_code
  });

  document.querySelectorAll('[data-track]').forEach(element => {
    element.addEventListener('click', () => gtag('event', 'landing_click', {
      element_id: element.dataset.track,
      lp_variant: variant,
      content_id: tracking.content_id
    }));
  });

  const videoModal = document.querySelector('#videoModal');
  const videoFrame = document.querySelector('#videoFrame');
  const videoModalTitle = document.querySelector('#videoModalTitle');
  const videoModalClose = document.querySelector('#videoModalClose');
  let lastVideoTrigger = null;
  const closeVideo = () => {
    if (videoModal.hidden) return;
    videoModal.hidden = true;
    videoFrame.src = '';
    document.body.classList.remove('video-modal-open');
    if (lastVideoTrigger) lastVideoTrigger.focus();
  };
  document.querySelectorAll('[data-video-id]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      lastVideoTrigger = trigger;
      videoModalTitle.textContent = trigger.dataset.videoTitle;
      videoFrame.src = `https://www.youtube-nocookie.com/embed/${trigger.dataset.videoId}?autoplay=1&playsinline=1&rel=0`;
      videoModal.hidden = false;
      document.body.classList.add('video-modal-open');
      requestAnimationFrame(() => videoModalClose.focus());
    });
  });
  videoModal.addEventListener('click', event => {
    if (event.target.hasAttribute('data-video-close')) closeVideo();
  });
  videoModalClose.addEventListener('click', closeVideo);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeVideo();
  });

  const proofElement = document.querySelector('.proof');
  let proofSeen = false;
  new IntersectionObserver(entries => {
    if (!proofSeen && entries.some(entry => entry.isIntersecting)) {
      proofSeen = true;
      gtag('event', 'proof_view', {lp_variant: variant, content_id: tracking.content_id});
    }
  }, {threshold: .35}).observe(proofElement);

  const form = document.querySelector('#leadForm');
  const button = document.querySelector('#submitButton');
  const notice = document.querySelector('#notice');
  const endpoint = document.body.dataset.submitEndpoint.trim();
  const customerOpen = document.body.dataset.customerSubmitEnabled === 'true';
  const canSubmit = Boolean(endpoint && (customerOpen || qaMode));
  const frame = document.querySelector('#submitResultFrame');
  const phone = document.querySelector('#phone');
  const age = document.querySelector('#age');
  let formStarted = false;
  form.addEventListener('input', () => {
    if (formStarted) return;
    formStarted = true;
    gtag('event', 'form_start', {lp_variant: variant, content_id: tracking.content_id});
  });
  phone.addEventListener('input', () => {
    const digits = phone.value.replace(/\D/g, '').slice(0, 11);
    phone.value = digits.length > 7 ? `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}` : digits.length > 3 ? `${digits.slice(0,3)}-${digits.slice(3)}` : digits;
  });
  age.addEventListener('input', () => { age.value = age.value.replace(/\D/g, '').slice(0, 3); });

  const allConsent = document.querySelector('#allConsent');
  const privacyConsent = document.querySelector('#privacyConsent');
  const marketingConsent = document.querySelector('#marketingConsent');
  const syncAllConsent = () => {
    allConsent.checked = privacyConsent.checked && marketingConsent.checked;
    allConsent.indeterminate = privacyConsent.checked !== marketingConsent.checked;
  };
  allConsent.addEventListener('change', () => {
    privacyConsent.checked = allConsent.checked;
    marketingConsent.checked = allConsent.checked;
    allConsent.indeterminate = false;
  });
  privacyConsent.addEventListener('change', syncAllConsent);
  marketingConsent.addEventListener('change', syncAllConsent);

  const privacyToggle = document.querySelector('#privacyToggle');
  privacyToggle.addEventListener('click', () => {
    const detail = document.querySelector('#privacyDetail');
    const open = detail.classList.toggle('is-open');
    privacyToggle.setAttribute('aria-expanded', String(open));
    privacyToggle.textContent = open ? '닫기' : '내용보기';
  });

  const requestId = document.querySelector('#requestId');
  if (canSubmit) {
    button.disabled = false;
    button.textContent = '내 조건 확인 요청하기';
    document.querySelector('#draftBanner').hidden = true;
  }

  function showNotice(message, success = false) {
    notice.textContent = message;
    notice.classList.toggle('success', success);
    notice.style.display = 'block';
  }

  let pendingRequestId = '';
  let submitTimeout = 0;
  window.addEventListener('message', event => {
    if (!/^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/.test(event.origin) && event.origin !== 'https://script.google.com' && event.origin !== 'https://script.googleusercontent.com') return;
    const data = event.data || {};
    if (data.source !== 'deliveryin-kurly-direct-form' || data.request_id !== pendingRequestId) return;
    if (event.origin === 'https://script.google.com' && event.source !== frame.contentWindow) return;
    clearTimeout(submitTimeout);
    pendingRequestId = '';
    if (!data.ok) {
      showNotice(data.error || '요청을 접수하지 못했어요. 잠시 후 다시 시도해주세요.');
      button.disabled = false;
      button.textContent = '내 조건 확인 요청하기';
      return;
    }
    if (data.is_test !== qaMode || !data.lead_id) {
      showNotice('접수 확인값이 일치하지 않아요. 잠시 후 다시 시도해주세요.');
      button.disabled = false;
      return;
    }
    if (!qaMode && data.kind !== 'duplicate' && !data.performance_excluded && data.conversion_eligible) gtag('event', 'generate_lead', {
      content_id: tracking.content_id,
      lp_variant: variant,
      submission_kind: data.kind || 'new'
    });
    showNotice(qaMode ? '검수 제출을 기록했어요. 성과 집계에서 제외됩니다.' : '요청이 접수됐어요. 담당자가 순차적으로 안내드릴게요.', true);
    form.reset();
    button.textContent = '접수 완료';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!canSubmit) {
      showNotice('컬리 전용 수신 경로를 연결하는 중이에요. 아직 실제 정보는 제출되지 않습니다.');
      return;
    }
    if (!form.reportValidity()) return;
    pendingRequestId = `KURLY-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    requestId.value = pendingRequestId;
    let testField = form.querySelector('input[name="is_test"]');
    if (!testField) { testField = document.createElement('input'); testField.type = 'hidden'; testField.name = 'is_test'; form.append(testField); }
    testField.value = qaMode ? 'true' : 'false';
    let tokenField = form.querySelector('input[name="qa_token"]');
    if (!tokenField) { tokenField = document.createElement('input'); tokenField.type = 'hidden'; tokenField.name = 'qa_token'; form.append(tokenField); }
    tokenField.value = qaToken;
    button.disabled = true;
    button.textContent = '접수 중…';
    form.target = 'submitResultFrame';
    form.method = 'post';
    form.action = endpoint;
    HTMLFormElement.prototype.submit.call(form);
    submitTimeout = window.setTimeout(() => {
      pendingRequestId = '';
      showNotice('응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.');
      button.disabled = false;
      button.textContent = '내 조건 확인 요청하기';
    }, 15000);
  });
})();
