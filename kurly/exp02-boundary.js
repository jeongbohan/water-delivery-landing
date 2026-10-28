/* Measurement transport only. Business acceptance never depends on ready(). */
const PM10Boundary = (() => {
  const trusted = origin => origin === 'https://script.google.com' || origin === 'https://script.googleusercontent.com' || /^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/.test(origin);
  function create(config) {
    let receipt='', attempts=0, timer=0, listening=false, state=config.enabled?'idle':'disabled';
    const requestId=config.tracking.exposure_id;
    const key=`kurly-exposure-v5:${config.tracking.assignment_version}:${config.tracking.browser_id}:${config.tracking.landing_revision}:${config.qaTraffic}:${config.tracking.lp_variant}`;
    let fields={...config.tracking,action:'exposure',stage:'landing_view',is_test:String(config.qaTraffic),response_mode:'iframe',request_id:requestId};
    // Revisit preserves the original visit payload. No credentials or PII in localStorage.
    try {
      const saved=JSON.parse(localStorage.getItem(key));
      if(saved && saved.exposure_id===fields.exposure_id && saved.assignment_id===fields.assignment_id && saved.first_landing_at===fields.first_landing_at) fields=saved;
      else localStorage.setItem(key,JSON.stringify(fields));
    } catch (_) {}
    const attachField=(form,name,value)=>{let field=form.querySelector(`input[name="${name}"]`);if(!field){field=document.createElement('input');field.type='hidden';field.name=name;form.append(field);}field.value=value;};
    let transport=null;
    const api={
      ready:()=>Boolean(receipt),
      status:()=>({state,attempts}),
      attach(form){attachField(form,'exposure_receipt',receipt);attachField(form,'measurement_client_status',state);attachField(form,'qa_requested',String(config.qaTraffic));},
      start(onReady=()=>{}) {
        if(!config.enabled || !config.endpoint || (config.qaTraffic&&!config.qaMode) || receipt || attempts>=3 || timer) return;
        if(!transport){
          const frame=document.createElement('iframe');frame.hidden=true;frame.name=`exp02-exposure-${requestId}`;
          transport=document.createElement('form');transport.hidden=true;transport.method='post';transport.action=config.endpoint;transport.target=frame.name;
          Object.entries(fields).forEach(([k,v])=>attachField(transport,k,v));
          if(config.qaMode)attachField(transport,'qa_token',config.qaToken);
          document.body.append(frame,transport);
        }
        if(!listening){
          listening=true;
          const listener=event=>{
            const d=event.data||{};
            if(!trusted(event.origin)||d.source!=='deliveryin-kurly-direct-form'||d.request_id!==requestId) return;
            if(!d.ok||!d.persisted||d.stage!=='landing_view'||d.is_test!==config.qaTraffic||d.exposure_id!==fields.exposure_id||!d.exposure_receipt) return;
            receipt=d.exposure_receipt;state='persisted';clearTimeout(timer);timer=0;window.removeEventListener('message',listener);onReady();
          };
          window.addEventListener('message',listener);
        }
        attempts++;state='pending';
        // Timer is armed BEFORE submit so even a synchronous test ACK cancels it.
        timer=window.setTimeout(()=>{timer=0;if(!receipt){state=attempts>=3?'exhausted':'retrying';api.start(onReady);}},4000);
        try{HTMLFormElement.prototype.submit.call(transport);}catch(_){state='transport_error';}
      }
    };
    return api;
  }
  return {create};
})();
