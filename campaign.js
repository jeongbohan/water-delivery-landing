(function(){
  var variant=document.body.dataset.variant||'unknown';
  var creative=document.querySelector('.creative');
  if(creative&&(variant==='601'||variant==='602')) creative.src='../img/creative-'+variant+'.webp';
  var params=new URLSearchParams(location.search);
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
  document.querySelectorAll('a[href="#apply"]').forEach(function(el){el.addEventListener('click',function(){if(window.gtag)gtag('event','cta_click',{creative_id:variant,lead_id:leadId||undefined,cta_location:el.dataset.location||'page'})})});
  if(window.gtag){gtag('event','landing_view',{creative_id:variant,lead_id:leadId||undefined,source_code:source})}
  var form=document.getElementById('apply');
  if(form&&'IntersectionObserver'in window){var seen=false;new IntersectionObserver(function(entries){if(!seen&&entries[0].isIntersecting){seen=true;if(window.gtag)gtag('event','form_view',{creative_id:variant,lead_id:leadId||undefined})}},{threshold:.25}).observe(form)}
})();
