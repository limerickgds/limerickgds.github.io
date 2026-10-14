'use strict';
function calculate(v){
 const {N,p,r,c,a,e,F,h,q}=v;
 const success=p+(1-p)*r;
 const accepted=N*success;
 const totalCost=N*(c+a+(1-p)*e)+F;
 const costPerAccepted=accepted>0?totalCost/accepted:null;
 const manualCostPerAccepted=q>0?h/q:null;
 const unitContribution=manualCostPerAccepted===null?null:manualCostPerAccepted*success-c-a-(1-p)*e;
 const pDenominator=manualCostPerAccepted===null?null:e+manualCostPerAccepted*(1-r);
 return {accepted,totalCost,costPerAccepted,manualCostPerAccepted,savingsFraction:manualCostPerAccepted>0&&costPerAccepted!==null?1-costPerAccepted/manualCostPerAccepted:null,pBreakEven:pDenominator>0?(c+a+e+F/N-manualCostPerAccepted*r)/pDenominator:null,nBreakEven:unitContribution>0?F/unitContribution:null};
}
if(typeof module!=='undefined')module.exports={calculate};
if(typeof document!=='undefined'){
 const progress=document.querySelector('.reading-progress');
 const sections=[...document.querySelectorAll('.article-body h2[id]')];
 const links=[...document.querySelectorAll('.toc a')];
 let scheduled=false;
 function updateReading(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%';let current=sections[0]?.id;sections.forEach(s=>{if(s.getBoundingClientRect().top<160)current=s.id;});links.forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});scheduled=false;}
 addEventListener('scroll',()=>{if(!scheduled){requestAnimationFrame(updateReading);scheduled=true;}},{passive:true});addEventListener('resize',updateReading);updateReading();
 const form=document.querySelector('#model-form');
 if(form){
 const defaults=JSON.parse(document.querySelector('#model-defaults').textContent);
 const english=document.documentElement.lang==='en';
 const locale=english?'en-US':'zh-CN';
 const number=(n,digits)=>n.toLocaleString(locale,{maximumFractionDigits:digits});
 const money=n=>n===null?(english?'No valid result':'无有效结果'):(english?'CNY ':'¥')+n.toLocaleString(locale,{minimumFractionDigits:2,maximumFractionDigits:2});
 function render(){
  let v={};
  for(const key of Object.keys(defaults)){
   const field=form.elements[key];
   if(!field.checkValidity()||field.value===''){
    document.querySelector('#model-error').textContent=english?'Enter valid values for every parameter. Task count must be greater than 0 and rates must be between 0 and 100%.':'请为所有参数填写有效数值；任务数须大于 0，比率须在 0 到 100% 之间。';
    return;
   }
   v[key]=Number(field.value)/(field.dataset.percent?'100':1);
  }
  document.querySelector('#model-error').textContent='';
  const o=calculate(v);
  document.querySelector('#result-cost').textContent=money(o.costPerAccepted);
  document.querySelector('#result-manual').textContent=money(o.manualCostPerAccepted);
  document.querySelector('#result-total').textContent=money(o.totalCost);
  document.querySelector('#result-accepted').textContent=number(o.accepted,2)+(english?' tasks':' 单');
  let comparison;
  if(o.savingsFraction===null)comparison=english?'The current parameters do not allow a valid cost comparison.':'当前参数无法进行有效成本比较。';
  else if(o.savingsFraction>=0)comparison=english?(o.savingsFraction*100).toFixed(1)+'% lower than manual (cost comparison, not cash savings)':'相对人工对照低 '+(o.savingsFraction*100).toFixed(1)+'%（成本口径，非现金节约）';
  else comparison=english?(-o.savingsFraction*100).toFixed(1)+'% higher than manual (cost comparison)':'相对人工对照高 '+(-o.savingsFraction*100).toFixed(1)+'%（成本口径）';
  document.querySelector('#result-comparison').textContent=comparison;
  document.querySelector('#result-threshold').textContent=o.nBreakEven===null?(english?'More volume cannot produce a strict cost advantage with these parameters.':'当前参数下，增加业务量不能达到严格成本优势。'):o.nBreakEven===0?(english?'There is no fixed-cost threshold with these parameters. Quality and service constraints still need verification.':'当前参数下无固定成本门槛；仍需验证质量与服务约束。'):(english?'With other assumptions unchanged, monthly volume must exceed '+number(o.nBreakEven,1)+' tasks for a cost advantage.':'其余假设不变，月任务数需大于 '+number(o.nBreakEven,1)+' 单才有成本优势。');
 }
 form.addEventListener('input',render);form.addEventListener('submit',e=>e.preventDefault());document.querySelector('#reset-model').addEventListener('click',()=>{for(const [key,val]of Object.entries(defaults)){const field=form.elements[key];field.value=field.dataset.percent?val*100:val;}render();});render();
 }
}
