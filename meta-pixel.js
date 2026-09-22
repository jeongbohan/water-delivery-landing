(() => {
  'use strict';

  const script = document.currentScript;
  const pixelId = script && script.dataset.pixelId || '';
  const query = new URLSearchParams(location.search);
  const fragment = new URLSearchParams(location.hash.slice(1));
  const qaMode = query.get('qa') === '1' && (fragment.get('qa_token') || '').length >= 32;

  const result = (sent, reason) => ({sent, reason});
  if (!/^\d{10,20}$/.test(pixelId)) {
    window.deliveryinMeta = Object.freeze({trackLead: () => result(false, 'pixel_not_configured')});
    return;
  }
  if (qaMode) {
    window.deliveryinMeta = Object.freeze({trackLead: () => result(false, 'qa_mode')});
    return;
  }

  if (!window.fbq) {
    const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    const loader = document.createElement('script');
    loader.async = true;
    loader.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(loader);
  }
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  function trackLead(input = {}) {
    const leadId = String(input.leadId || '').trim();
    if (!leadId) return result(false, 'missing_lead_id');
    if (input.isTest || input.kind === 'duplicate' || input.performanceExcluded || input.conversionEligible !== true) {
      return result(false, 'ineligible');
    }
    const eventKey = `meta_lead_event_${leadId}`;
    if (storageGet(eventKey) === '1') return result(false, 'duplicate_event');

    const customData = {
      content_name: String(input.contentId || '').slice(0, 100),
      content_category: String(input.sourceCode || '').slice(0, 100),
      content_type: 'product'
    };
    if (input.variant) customData.content_ids = [String(input.variant).slice(0, 30)];
    window.fbq('track', 'Lead', customData, {eventID: leadId});
    storageSet(eventKey, '1');
    return result(true, 'sent');
  }

  window.deliveryinMeta = Object.freeze({pixelId, trackLead});
})();
