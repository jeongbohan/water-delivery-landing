/* Fixed before T0. Same observation before assignment in both arms. No behavior/PII. */
const PM10Automation=(()=>{
 const rule='webdriver-observed-v1-20261028';
 function observe(nav){
  const out={automation_rule_version:rule,automation_evaluated_at:new Date().toISOString(),automation_signal_status:'unsupported',automation_webdriver:''};
  try{if(nav&&'webdriver' in nav){const value=nav.webdriver;if(typeof value==='boolean'){out.automation_signal_status='observed';out.automation_webdriver=String(value);}else out.automation_signal_status='unknown';}}catch(_){out.automation_signal_status='error';}
  return out;
 }
 return {observe};
})();
if(typeof module!=='undefined')module.exports=PM10Automation;
