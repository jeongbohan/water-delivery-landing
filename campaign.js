(function(){
  var variant=document.body.dataset.variant||'unknown';
  var creative=document.querySelector('.creative');
  if(creative&&(variant==='601'||variant==='602')) creative.src='../img/creative-'+variant+'.webp';
  var params=new URLSearchParams(location.search);
  var contentOnly=params.get('content_only')==='1';
  var landingVariant=params.get('lp_variant')||variant;
  if(contentOnly&&landingVariant==='603'){
    document.title='쿠팡 생수배송 수도권 모집 조건 | 배송인그룹';
    var eyebrow603=document.querySelector('.hero .eyebrow'),title603=document.querySelector('.hero h1'),lead603=document.querySelector('.hero .lead');
    if(eyebrow603)eyebrow603.textContent='쿠팡 생수배송 · 수도권 기사 모집';
    if(title603)title603.innerHTML='수도권에서 알아보는<br><em>쿠팡 생수배송</em>';
    if(lead603)lead603.innerHTML='현재 모집 지역과 시작 조건을 먼저 확인하세요.<br>내 거주지 기준으로 가능한 센터를 안내해드려요.';
    if(creative)creative.alt='쿠팡 생수배송 수도권 기사 모집 조건 안내';
  }
  if(contentOnly&&landingVariant==='604'){
    document.title='쿠팡 생수배송 월 평균 매출 750만원대 구조 | 배송인그룹';
    var eyebrow604=document.querySelector('.hero .eyebrow'),title604=document.querySelector('.hero h1'),lead604=document.querySelector('.hero .lead'),stat604=document.querySelector('.hero-stat span');
    if(eyebrow604)eyebrow604.textContent='쿠팡 생수배송 · 수익 구조 확인';
    if(title604)title604.innerHTML='월 평균 매출<br><em>750만원대 구조</em>';
    if(lead604)lead604.innerHTML='비용 차감 전 매출이며 개인별 조건에 따라 달라져요.<br>실제 정산 내역과 수익구조부터 확인하세요.';
    if(stat604)stat604.textContent='월 평균 매출 구조';
    if(creative)creative.alt='월 평균 매출 750만원대 쿠팡 생수배송 구조 안내';
  }
  var leadId=String(params.get('lg')||params.get('leadgenId')||'').replace(/\D/g,'');
  var source='water-k3-2608-'+variant+(leadId?'__'+leadId:'');
  var eid='1FAIpQLSdIsBuKPPsXj1-SQgc18BugTCniRXLIkMT9RycfL0R9TWL4kQ';
  var entry='1144587058';
  var base='https://docs.google.com/forms/d/e/'+eid+'/viewform';
  var encoded=encodeURIComponent(source);
  var iframeUrl=base+'?embedded=true&entry.'+entry+'='+encoded;
  var directUrl=base+'?usp=pp_url&entry.'+entry+'='+encoded;
  document.querySelectorAll('[data-apply-frame]').forEach(function(el){el.src=iframeUrl});
  document.querySelectorAll('[data-apply-link]').forEach(function(el){el.href=directUrl});
  document.querySelectorAll('a[href="#apply"]').forEach(function(el){el.addEventListener('click',function(event){
    if(window.gtag)gtag('event','cta_click',{creative_id:landingVariant,lead_id:leadId||undefined,cta_location:el.dataset.location||'page'});
    if(contentOnly){
      event.preventDefault();
      try{window.parent.document.getElementById('apply').scrollIntoView({behavior:'smooth',block:'start'})}
      catch(error){window.parent.postMessage({source:'deliveryin-lp-content',action:'apply'},location.origin)}
    }
  })});
  if(window.gtag){gtag('event','landing_view',{creative_id:landingVariant,lead_id:leadId||undefined,source_code:params.get('source_code')||source})}
  var form=document.getElementById('apply');
  if(form&&'IntersectionObserver'in window){var seen=false;new IntersectionObserver(function(entries){if(!seen&&entries[0].isIntersecting){seen=true;if(window.gtag)gtag('event','form_view',{creative_id:landingVariant,lead_id:leadId||undefined})}},{threshold:.25}).observe(form)}
  if(contentOnly){
    if(form)form.remove();
    var sticky=document.querySelector('.sticky');if(sticky)sticky.remove();
    document.body.style.paddingBottom='0';
    function reportHeight(){window.parent.postMessage({source:'deliveryin-lp-content',height:Math.ceil(document.documentElement.scrollHeight)},location.origin)}
    window.addEventListener('load',reportHeight);window.addEventListener('resize',reportHeight);
    document.querySelectorAll('img').forEach(function(img){if(!img.complete)img.addEventListener('load',reportHeight,{once:true})});
    if('ResizeObserver'in window)new ResizeObserver(reportHeight).observe(document.body);
    reportHeight();
  }
})();
