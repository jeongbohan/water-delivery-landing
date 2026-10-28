(() => {
  const automation = (()=>{try{return PM10Automation.observe(globalThis.navigator);}catch(_){return {automation_rule_version:'webdriver-observed-v1-20261028',automation_evaluated_at:new Date().toISOString(),automation_signal_status:'error',automation_webdriver:''};}})();
  const qs = new URLSearchParams(location.search);
  const fragment = new URLSearchParams(location.hash.slice(1));
  const qaToken = fragment.get('qa_token') || '';
  // QA traffic stays excluded even when its submission credentials are absent/invalid.
  const qaRequested = qs.get('qa') === '1' || ['a','b'].includes(qs.get('variant'));
  const qaMode = qs.get('qa') === '1' && qaToken.length >= 32;
  if (qaToken) history.replaceState(null, '', location.pathname + location.search);
  const experimentId = 'EXP-02';
  const assignmentVersion = 'pm10-exp02-v2';
  const landingRevision = 'PM10-EXP02-g2-20261028';
  const variantStorageKey = 'deliveryin_kurly_exp02_assignment_v2';
  let assignment;
  try { assignment = JSON.parse(localStorage.getItem(variantStorageKey)); } catch {}
  if (!assignment || assignment.version !== assignmentVersion || !['a','b'].includes(assignment.arm)) {
    const arm = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296 < .5 ? 'a' : 'b';
    assignment = {version:assignmentVersion, arm, browser_id:crypto.randomUUID(), assignment_id:crypto.randomUUID(), exposure_id:crypto.randomUUID(), first_landing_at:new Date().toISOString()};
    try { localStorage.setItem(variantStorageKey,JSON.stringify(assignment)); } catch {}
  }
  const forced = qs.get('variant');
  const qaTraffic = qaRequested;
  const variant = qaTraffic && ['a','b'].includes(forced) ? forced : assignment.arm;
  let storagePersisted = false;
  try { storagePersisted = JSON.parse(localStorage.getItem(variantStorageKey)).assignment_id === assignment.assignment_id; } catch {}
  const measurement = {...automation,assignment_version:assignmentVersion, assignment_id:assignment.assignment_id, browser_id:assignment.browser_id, exposure_id:assignment.exposure_id, first_landing_at:assignment.first_landing_at, landing_revision:landingRevision, storage_persisted:String(storagePersisted), assigned_arm:assignment.arm};
  const emit = (kind,params) => {
    const record={...tracking,...params,...measurement,assigned_arm:assignment.arm,is_test:qaTraffic,event_at:new Date().toISOString()};
    if (globalThis.pm10LocalCapture) globalThis.pm10LocalCapture(kind,record);
    if (!qaTraffic) gtag('event',kind,record);
  };

  const proof = document.querySelector('#proofTemplate').content.cloneNode(true);
  document.querySelector(variant === 'b' ? '#proofSlotEarly' : '#proofSlotLate').appendChild(proof);
  document.documentElement.dataset.variant = variant;
  document.documentElement.dataset.landingRevision = landingRevision;

  const tracking = {
    content_id: qs.get('content_id') || 'AD-20260916-002-801',
    source_code: `kurly-exp02-801b-${variant}`,
    incoming_source_code: qs.get('source_code') || '',
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
    lp_variant: variant,
    experiment_id: experimentId,
    ...measurement
  };
  Object.entries(measurement).forEach(([name,value]) => {const f=document.createElement('input');f.type='hidden';f.name=name;f.value=value;document.querySelector('#leadForm').append(f);});
  Object.entries(tracking).forEach(([key, value]) => {
    const id = '#' + key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const field = document.querySelector(id);
    if (field) field.value = value;
  });

  emit('landing_view', {
    content_id: tracking.content_id,
    lp_variant: variant,
    source_code: tracking.source_code,
    experiment_id: experimentId
  });

  document.querySelectorAll('[data-track]').forEach(element => {
    element.addEventListener('click', () => emit('landing_click', {
      element_id: element.dataset.track,
      lp_variant: variant,
      content_id: tracking.content_id,
      experiment_id: experimentId
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
      const external = trigger.dataset.externalWatch === 'true';
      videoFrame.parentElement.hidden = external;
      document.querySelector('#externalVideoNotice').hidden = !external;
      document.querySelector('#externalVideoLink').href = external ? `https://www.youtube.com/watch?v=${trigger.dataset.videoId}` : '';
      videoFrame.src = external ? '' : `https://www.youtube-nocookie.com/embed/${trigger.dataset.videoId}?autoplay=1&playsinline=1&rel=0`;
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
      emit('proof_view', {lp_variant: variant, content_id: tracking.content_id, experiment_id: experimentId});
    }
  }, {threshold: .35}).observe(proofElement);

  const form = document.querySelector('#leadForm');
  const button = document.querySelector('#submitButton');
  const notice = document.querySelector('#notice');
  const endpoint = document.body.dataset.submitEndpoint.trim();
  const customerOpen = document.body.dataset.customerSubmitEnabled === 'true';
  const canSubmit = Boolean(endpoint && (qaMode || (customerOpen && !qaTraffic)));
  let boundary = {start(){}, attach(){}, ready:()=>false};
  try { if (typeof PM10Boundary !== 'undefined') boundary = PM10Boundary.create({endpoint, tracking, qaTraffic, qaMode, qaToken, enabled:document.body.dataset.measurementEnabled === 'true' && canSubmit}); } catch (_) {}
  const frame = document.querySelector('#submitResultFrame');
  const phone = document.querySelector('#phone');
  const age = document.querySelector('#age');
  let formStarted = false;
  form.addEventListener('input', () => {
    if (formStarted) return;
    formStarted = true;
    emit('form_start', {lp_variant: variant, content_id: tracking.content_id, experiment_id: experimentId});
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
  try { boundary.start(() => {}); } catch (_) {}
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
  let pendingAction = '';
  // A timeout retries the same request; edited payload is rejected server-side.
  // A business request survives measurement browser/arm changes within this session.
  // Scope stays exact to this form/path/content/receiver and customer vs QA traffic.
  const submissionKey = `kurly-pending-v6:${JSON.stringify([location.pathname, 'leadForm', endpoint, tracking.content_id, qaTraffic ? 'qa' : 'customer'])}`;
  const legacySubmissionKey = `kurly-request-v5:${assignment.browser_id}:${qaTraffic}:${variant}`;
  const legacyEndpoint = 'https://script.google.com/macros/s/AKfycbzpwlreYaodyL33R1pH47fIaATpmWNMrmeI_Jo8CfBQKASZ_3S9tZJMoiox6HWnvBy08A/exec';
  const validPendingId = value => /^[a-zA-Z0-9-]{20,100}$/.test(value || '');
  let migratedLegacyKey = '';
  let submissionId;
  try {
    const current = sessionStorage.getItem(submissionKey);
    if (validPendingId(current)) submissionId = current;
    // R5 lacks receiver/form scope. Import ONLY the exact still-persisted assignment
    // on its original canonical form/content/receiver; never scan other browser/arm keys.
    const canonicalLegacyForm = /^\/(?:water-delivery-landing\/)?kurly\/(?:index\.html)?$/.test(location.pathname)
      && endpoint === legacyEndpoint && tracking.content_id === 'AD-20260916-002-801';
    if (!submissionId && current === null && storagePersisted && canonicalLegacyForm) {
      const legacy = sessionStorage.getItem(legacySubmissionKey);
      if (validPendingId(legacy)) {
        submissionId = legacy; migratedLegacyKey = legacySubmissionKey;
        sessionStorage.setItem(submissionKey, legacy);
        if (sessionStorage.getItem(submissionKey) === legacy) sessionStorage.removeItem(legacySubmissionKey);
      }
    }
  } catch (_) {}
  let pendingRestore = /^[a-zA-Z0-9-]{20,100}$/.test(submissionId || '');
  if (!/^[a-zA-Z0-9-]{20,100}$/.test(submissionId || '')) submissionId=crypto.randomUUID();
  let submissionSnapshot = null;
  let inFlight = false;
  let submissionCompleted = false;
  let submitTimeout = 0;
  window.addEventListener('message', event => {
    const trustedOrigin = /^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/.test(event.origin) || event.origin === 'https://script.google.com' || event.origin === 'https://script.googleusercontent.com';
    if (!trustedOrigin) return;
    const data = event.data || {};
    if (data.source !== 'deliveryin-kurly-direct-form' || data.request_id !== pendingRequestId) return;
    if (data.request_action !== pendingAction) return;
    clearTimeout(submitTimeout);
    inFlight = false;
    if(data.kind==='status_not_found' && data.ok && data.is_test===qaMode && data.submission_id===submissionId){
      pendingRestore=false;pendingRequestId='';button.disabled=false;button.textContent='내 조건 확인 요청하기';return;
    }
    if (!data.ok) {
      if (data.outcome === 'rejected_not_saved') submissionSnapshot=null;
      if (data.outcome === 'existing_request_conflict') { pendingRestore=true;submissionSnapshot=null; }
      showNotice(data.error || '요청을 접수하지 못했어요. 잠시 후 다시 시도해주세요.');
      button.disabled = false;
      button.textContent = '내 조건 확인 요청하기';
      return;
    }
    if (data.is_test !== qaMode || !data.lead_id || !data.persisted || data.submission_id !== submissionId) {
      showNotice('접수 확인값이 일치하지 않아요. 잠시 후 다시 시도해주세요.');
      button.disabled = false;
      return;
    }
    pendingRequestId = '';
    submissionCompleted = true;
    pendingRestore = false;
    button.disabled = true;
    try { sessionStorage.removeItem(submissionKey); if (migratedLegacyKey) sessionStorage.removeItem(migratedLegacyKey); } catch (_) {}
    if (!qaTraffic && data.kind !== 'duplicate' && !data.performance_excluded && data.conversion_eligible) {
      emit('generate_lead', {
        content_id: tracking.content_id,
        lp_variant: variant,
        submission_kind: data.kind || 'new',
        event_id: data.lead_id,
        experiment_id: data.experiment_eligible === true ? experimentId : '',
        experiment_eligible: data.experiment_eligible === true,
        experiment_exclusion_reason: data.experiment_exclusion_reason || ''
      });
      if (window.deliveryinMeta) window.deliveryinMeta.trackLead({
        leadId: data.lead_id,
        isTest: data.is_test,
        kind: data.kind,
        performanceExcluded: data.performance_excluded,
        conversionEligible: data.conversion_eligible,
        contentId: tracking.content_id,
        sourceCode: tracking.source_code,
        variant,
        experimentId: data.experiment_eligible === true ? experimentId : ''
      });
    }
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
    if (inFlight || submissionCompleted) return;
    if(pendingRestore){restoreReceipt();return;}
    if (!submissionSnapshot && !form.reportValidity()) return;
    pendingRequestId = submissionId;
    pendingAction = 'submit';
    requestId.value = pendingRequestId;
    try { boundary.attach(form); } catch (_) {}
    let testField = form.querySelector('input[name="is_test"]');
    if (!testField) { testField = document.createElement('input'); testField.type = 'hidden'; testField.name = 'is_test'; form.append(testField); }
    testField.value = qaMode ? 'true' : 'false';
    let tokenField = form.querySelector('input[name="qa_token"]');
    if (!tokenField) { tokenField = document.createElement('input'); tokenField.type = 'hidden'; tokenField.name = 'qa_token'; form.append(tokenField); }
    tokenField.value = qaToken;
    if (!submissionSnapshot) submissionSnapshot = Array.from(new FormData(form).entries());
    try { sessionStorage.setItem(submissionKey,submissionId); } catch (_) {}
    inFlight = true;
    button.disabled = true;
    button.textContent = '접수 중…';
    form.target = 'submitResultFrame';
    form.method = 'post';
    form.action = endpoint;
    // Freeze the first payload in memory. Retry the SAME endpoint/key/payload; no fallback POST.
    const transport = document.createElement('form');
    transport.hidden=true; transport.target=form.target; transport.method='post'; transport.action=endpoint;
    submissionSnapshot.forEach(([name,value]) => { const field=document.createElement('input');field.type='hidden';field.name=name;field.value=value;transport.append(field); });
    document.body.append(transport);
    try { HTMLFormElement.prototype.submit.call(transport); } catch (_) { inFlight=false;button.disabled=false; }
    transport.remove();
    submitTimeout = window.setTimeout(() => {
      inFlight = false;
      showNotice('응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.');
      button.disabled = false;
      button.textContent = '내 조건 확인 요청하기';
    }, 15000);
  });
  function restoreReceipt(){
    if(!canSubmit || inFlight || submissionCompleted)return;
    inFlight=true;pendingRequestId=submissionId;pendingAction='status';button.disabled=true;button.textContent='접수 중…';
    const probe=document.createElement('form');probe.hidden=true;probe.target='submitResultFrame';probe.method='post';probe.action=endpoint;
    Object.entries({action:'status',response_mode:'iframe',request_id:submissionId,is_test:String(qaMode),qa_requested:String(qaTraffic),qa_token:qaToken}).forEach(([name,value])=>{const f=document.createElement('input');f.type='hidden';f.name=name;f.value=value;probe.append(f);});
    document.body.append(probe);
    try{HTMLFormElement.prototype.submit.call(probe);}catch(_){inFlight=false;button.disabled=false;}
    probe.remove();
    submitTimeout=window.setTimeout(()=>{inFlight=false;button.disabled=false;button.textContent='내 조건 확인 요청하기';},15000);
  }
  if(pendingRestore && canSubmit)restoreReceipt();
})();
