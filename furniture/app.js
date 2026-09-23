(() => {
  'use strict';
  const qs = new URLSearchParams(location.search);
  const fragment = new URLSearchParams(location.hash.slice(1));
  const qaToken = fragment.get('qa_token') || '';
  const qaMode = qs.get('qa') === '1' && qaToken.length >= 32;
  if (qaToken) history.replaceState(null, '', location.pathname + location.search);
  const variant = 'a';
  document.documentElement.dataset.variant = variant;

  const form = document.querySelector('#leadForm');
  const button = document.querySelector('#submitButton');
  const notice = document.querySelector('#notice');
  const frame = document.querySelector('#submitResultFrame');
  const configured = document.body.dataset.submitEndpoint || '';
  const endpoint = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(configured) ? configured : '';
  const customerOpen = document.body.dataset.customerSubmitEnabled === 'true';
  const canSubmit = Boolean(endpoint && (customerOpen || qaMode));
  const trackingKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','campaign_id','adset_id','ad_id','campaign_name','adset_name','ad_name','fbclid','lead_id'];
  const tracking = {content_id:'AD-20260916-002-701',source_code:`furniture-k3-2609-701-${variant}`,lp_variant:variant};
  for (const key of trackingKeys) tracking[key] = qs.get(key) || '';
  const fields = document.querySelector('#trackingFields');
  for (const [name, value] of Object.entries({...tracking,is_test:qaMode ? 'true' : 'false',qa_token:qaToken})) {
    const input = document.createElement('input'); input.type = 'hidden'; input.name = name; input.value = value; fields.append(input);
  }
  function analytics(name, extra = {}) {
    if (!customerOpen || qaMode || typeof window.gtag !== 'function') return;
    window.gtag('event', name, {content_id:tracking.content_id,source_code:tracking.source_code,lp_variant:variant,...extra});
  }
  analytics('landing_view');
  document.querySelectorAll('[data-track]').forEach(el => el.addEventListener('click', () => analytics('landing_click',{element_id:el.dataset.track})));
  const videoModal = document.querySelector('#videoModal');
  const videoFrame = document.querySelector('#videoFrame');
  const videoTitle = document.querySelector('#videoModalTitle');
  const closeVideoButton = document.querySelector('#closeVideo');
  let videoReturnFocus = null;
  function openVideo(trigger) {
    if (!videoModal || !videoFrame || !closeVideoButton) return;
    const id = trigger.dataset.videoId || '';
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    videoReturnFocus = trigger;
    if (videoTitle) videoTitle.textContent = trigger.dataset.videoTitle || '기사님 유튜브 후기';
    videoFrame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    videoModal.hidden = false;
    document.body.classList.add('video-open');
    closeVideoButton.focus();
  }
  function closeVideo() {
    if (!videoModal || videoModal.hidden) return;
    videoModal.hidden = true;
    if (videoFrame) videoFrame.src = '';
    document.body.classList.remove('video-open');
    if (videoReturnFocus) videoReturnFocus.focus();
  }
  document.querySelectorAll('.video-trigger').forEach(trigger => trigger.addEventListener('click', () => openVideo(trigger)));
  if (closeVideoButton) closeVideoButton.addEventListener('click', closeVideo);
  if (videoModal) videoModal.addEventListener('click', event => { if (event.target === videoModal) closeVideo(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && videoModal && !videoModal.hidden) closeVideo(); });
  const sticky = document.querySelector('.sticky-cta');
  new IntersectionObserver(entries => { sticky.hidden = entries.some(entry => entry.isIntersecting); }, {threshold:0}).observe(document.querySelector('#apply'));

  const phone = document.querySelector('#phone');
  const age = document.querySelector('#age');
  phone.addEventListener('input', () => {
    const n = phone.value.replace(/\D/g,'').slice(0,11);
    phone.value = n.length > 7 ? `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7)}` : n.length > 3 ? `${n.slice(0,3)}-${n.slice(3)}` : n;
  });
  age.addEventListener('input', () => { age.value = age.value.replace(/\D/g,'').slice(0,3); });

  const region = document.querySelector('#region');
  const addressDisplay = document.querySelector('#addressDisplay');
  const addressLayer = document.querySelector('#addressLayer');
  const addressSearch = document.querySelector('#addressSearch');
  const addressResults = document.querySelector('#addressResults');
  const searchTip = document.querySelector('#searchTip');
  const regionGroups = {
    '서울특별시':['종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구','노원구','은평구','서대문구','마포구','양천구','강서구','구로구','금천구','영등포구','동작구','관악구','서초구','강남구','송파구','강동구'],
    '부산광역시':['중구','서구','동구','영도구','부산진구','동래구','남구','북구','해운대구','사하구','금정구','강서구','연제구','수영구','사상구','기장군'],
    '대구광역시':['중구','동구','서구','남구','북구','수성구','달서구','달성군','군위군'],
    '인천광역시':['강화군','옹진군','중구','동구','미추홀구','연수구','남동구','부평구','계양구','서구'],
    '광주광역시':['동구','서구','남구','북구','광산구'],'대전광역시':['동구','중구','서구','유성구','대덕구'],'울산광역시':['중구','남구','동구','북구','울주군'],'세종특별자치시':[],
    '경기도':['수원시 장안구','수원시 권선구','수원시 팔달구','수원시 영통구','고양시 덕양구','고양시 일산동구','고양시 일산서구','용인시 처인구','용인시 기흥구','용인시 수지구','성남시 수정구','성남시 중원구','성남시 분당구','부천시 원미구','부천시 소사구','부천시 오정구','화성시','안산시 상록구','안산시 단원구','남양주시','안양시 만안구','안양시 동안구','평택시','시흥시','파주시','의정부시','김포시','광주시','광명시','군포시','하남시','오산시','양주시','이천시','구리시','안성시','포천시','의왕시','여주시','동두천시','과천시','양평군','가평군','연천군'],
    '강원특별자치도':['춘천시','원주시','강릉시','동해시','태백시','속초시','삼척시','홍천군','횡성군','영월군','평창군','정선군','철원군','화천군','양구군','인제군','고성군','양양군'],
    '충청북도':['청주시 상당구','청주시 서원구','청주시 흥덕구','청주시 청원구','충주시','제천시','보은군','옥천군','영동군','증평군','진천군','괴산군','음성군','단양군'],
    '충청남도':['천안시 동남구','천안시 서북구','공주시','보령시','아산시','서산시','논산시','계룡시','당진시','금산군','부여군','서천군','청양군','홍성군','예산군','태안군'],
    '전북특별자치도':['전주시 완산구','전주시 덕진구','군산시','익산시','정읍시','남원시','김제시','완주군','진안군','무주군','장수군','임실군','순창군','고창군','부안군'],
    '전라남도':['목포시','여수시','순천시','나주시','광양시','담양군','곡성군','구례군','고흥군','보성군','화순군','장흥군','강진군','해남군','영암군','무안군','함평군','영광군','장성군','완도군','진도군','신안군'],
    '경상북도':['포항시 남구','포항시 북구','경주시','김천시','안동시','구미시','영주시','영천시','상주시','문경시','경산시','의성군','청송군','영양군','영덕군','청도군','고령군','성주군','칠곡군','예천군','봉화군','울진군','울릉군'],
    '경상남도':['창원시 의창구','창원시 성산구','창원시 마산합포구','창원시 마산회원구','창원시 진해구','진주시','통영시','사천시','김해시','밀양시','거제시','양산시','의령군','함안군','창녕군','고성군','남해군','하동군','산청군','함양군','거창군','합천군'],
    '제주특별자치도':['제주시','서귀포시']
  };
  const regions = Object.entries(regionGroups).flatMap(([sido,areas]) => areas.length ? areas.map(area => `${sido} ${area}`) : [sido]);
  const aliases = [['서울','서울특별시'],['부산','부산광역시'],['대구','대구광역시'],['인천','인천광역시'],['광주','광주광역시'],['대전','대전광역시'],['울산','울산광역시'],['세종','세종특별자치시'],['경기','경기도'],['강원','강원특별자치도'],['충북','충청북도'],['충남','충청남도'],['전북','전북특별자치도'],['전남','전라남도'],['경북','경상북도'],['경남','경상남도'],['제주','제주특별자치도']];
  const normalize = value => { const raw=value.trim(); const alias=aliases.find(([short])=>raw===short||raw.startsWith(short+' ')); return (alias?alias[1]+raw.slice(alias[0].length):raw).toLowerCase().replace(/\s/g,''); };
  function syncAddressViewport(){const viewport=window.visualViewport;if(!viewport)return;document.documentElement.style.setProperty('--address-vvh',`${Math.round(viewport.height)}px`);document.documentElement.style.setProperty('--address-vv-top',`${Math.round(viewport.offsetTop)}px`)}
  function renderRegions(query){const q=query.trim();if(!q){searchTip.hidden=false;addressResults.innerHTML='';return}searchTip.hidden=true;const nq=normalize(q);const matched=regions.filter(item=>item.toLowerCase().replace(/\s/g,'').includes(nq));addressResults.innerHTML=matched.length?matched.map(item=>`<button class="result-button" type="button" data-region="${item}"><span>${item}</span></button>`).join(''):'<p class="empty-result">일치하는 시·군·구가 없어요.<br>“용인시”, “양산시”처럼 다시 검색해주세요.</p>';}
  function openSheet(){syncAddressViewport();addressLayer.classList.add('is-open');document.body.classList.add('sheet-open');addressSearch.value='';renderRegions('');setTimeout(()=>addressSearch.focus(),180)}
  function closeSheet(){addressLayer.classList.remove('is-open');document.body.classList.remove('sheet-open');document.documentElement.style.setProperty('--address-vvh','100dvh');document.documentElement.style.setProperty('--address-vv-top','0px');document.querySelector('#openAddress').focus()}
  function selectRegion(value){region.value=value;addressDisplay.querySelector('span').textContent=value;addressDisplay.classList.add('is-selected');closeSheet()}
  document.querySelector('#openAddress').addEventListener('click',openSheet);addressDisplay.addEventListener('click',openSheet);document.querySelector('#closeAddress').addEventListener('click',closeSheet);addressLayer.addEventListener('click',e=>{if(e.target===addressLayer)closeSheet()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&addressLayer.classList.contains('is-open'))closeSheet()});addressSearch.addEventListener('input',e=>renderRegions(e.target.value));addressResults.addEventListener('click',e=>{const target=e.target.closest('[data-region]');if(target)selectRegion(target.dataset.region)});if(window.visualViewport){visualViewport.addEventListener('resize',()=>{if(addressLayer.classList.contains('is-open'))syncAddressViewport()});visualViewport.addEventListener('scroll',()=>{if(addressLayer.classList.contains('is-open'))syncAddressViewport()})}

  const allConsent=document.querySelector('#allConsent'),privacyConsent=document.querySelector('#privacyConsent'),marketingConsent=document.querySelector('#marketingConsent');
  function syncAllConsent(){allConsent.checked=privacyConsent.checked&&marketingConsent.checked;allConsent.indeterminate=privacyConsent.checked!==marketingConsent.checked}
  allConsent.addEventListener('change',()=>{privacyConsent.checked=allConsent.checked;marketingConsent.checked=allConsent.checked;allConsent.indeterminate=false});privacyConsent.addEventListener('change',syncAllConsent);marketingConsent.addEventListener('change',syncAllConsent);
  document.querySelector('#privacyToggle').addEventListener('click',e=>{e.preventDefault();const detail=document.querySelector('#privacyDetail'),open=detail.classList.toggle('is-open');e.currentTarget.setAttribute('aria-expanded',String(open));e.currentTarget.textContent=open?'닫기':'내용보기'});

  let started=false;form.addEventListener('input',()=>{if(!started){started=true;analytics('form_start')}});
  function show(message,success=false){notice.textContent=message;notice.hidden=false;notice.classList.toggle('success',success)}
  const idleCopy=qaMode?'검수용 제출하기 · 성과 제외':'가구조립배송 1차 지원하기';
  const draftBanner=document.querySelector('#draftBanner');
  if(canSubmit){button.disabled=false;button.textContent=idleCopy;if(!qaMode)draftBanner.hidden=true}
  if(qaMode){draftBanner.hidden=false;draftBanner.textContent='검수 모드 · 제출 시 성과에서 제외됩니다'};
  let pending='',request='',lastBody='',timeout=0,done=false;
  function retry(message){pending='';button.disabled=false;button.textContent=idleCopy;show(message)}
  window.addEventListener('message',event=>{const trustedOrigin=event.origin==='null'||/^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/.test(event.origin)||event.origin==='https://script.google.com'||event.origin==='https://script.googleusercontent.com';if(!trustedOrigin)return;const data=event.data;if(!pending||!data||data.source!=='deliveryin-furniture-direct-form'||data.request_id!==pending)return;clearTimeout(timeout);if(!data.ok){retry(data.error||'접수 확인이 지연되고 있어요. 다시 시도해주세요.');return}if(!data.lead_id||data.ignored||data.is_test!==qaMode){retry('접수 확인값이 일치하지 않아요. 잠시 후 다시 시도해주세요.');return}pending='';done=true;if(!qaMode&&data.kind!=='duplicate'&&!data.performance_excluded&&data.conversion_eligible){const eventKey=`furniture_lead_event_${data.lead_id}`;if(localStorage.getItem(eventKey)!=='1'){analytics('generate_lead',{submission_kind:'new',event_id:data.lead_id});if(window.deliveryinMeta)window.deliveryinMeta.trackLead({leadId:data.lead_id,isTest:data.is_test,kind:data.kind,performanceExcluded:data.performance_excluded,conversionEligible:data.conversion_eligible,contentId:tracking.content_id,sourceCode:tracking.source_code,variant});localStorage.setItem(eventKey,'1')}}show(qaMode?'검수 제출을 기록했어요. 성과 집계에서 제외됩니다.':'1차 지원이 접수됐어요. 담당자가 순차적으로 연락드릴게요.',true);for(const el of form.querySelectorAll('input:not([type=hidden])')){if(el.type==='checkbox'||el.type==='radio')el.checked=false;else el.value=''}region.value='';addressDisplay.querySelector('span').textContent='거주지역을 선택해주세요';addressDisplay.classList.remove('is-selected');button.disabled=true;button.textContent='접수 완료';notice.dataset.leadId=data.lead_id;notice.dataset.downstreamStatus=data.downstream_status||'pending'});
  form.addEventListener('submit',event=>{event.preventDefault();if(!canSubmit){show('현재 고객 접수는 잠겨 있어요. 개인정보는 제출되지 않았어요.');return}if(pending||done||!form.reportValidity())return;if(!region.value){openSheet();return}const body=JSON.stringify([...new FormData(form)].filter(([key])=>key!=='request_id'));if(!request||body!==lastBody){request='FURNITURE-'+crypto.randomUUID();lastBody=body}document.querySelector('#requestId').value=request;pending=request;button.disabled=true;button.textContent='접수 중…';form.method='post';form.target='submitResultFrame';form.action=endpoint;HTMLFormElement.prototype.submit.call(form);timeout=setTimeout(()=>retry('응답이 지연되고 있어요. 다시 시도하면 같은 요청으로 확인해요.'),30000)});
})();
