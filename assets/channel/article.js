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
 const money=n=>n===null?'无有效结果':'¥'+n.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
 function render(){let v={};for(const key of Object.keys(defaults)){const field=form.elements[key];if(!field.checkValidity()||field.value===''){document.querySelector('#model-error').textContent='请为所有参数填写有效数值；任务数须大于 0，比率须在 0 到 100% 之间。';return;}v[key]=Number(field.value)/(field.dataset.percent?'100':1);}
 document.querySelector('#model-error').textContent='';const o=calculate(v);document.querySelector('#result-cost').textContent=money(o.costPerAccepted);document.querySelector('#result-manual').textContent=money(o.manualCostPerAccepted);document.querySelector('#result-total').textContent=money(o.totalCost);document.querySelector('#result-accepted').textContent=o.accepted.toLocaleString('zh-CN',{maximumFractionDigits:2})+' 单';let comparison=o.savingsFraction===null?'当前参数无法进行有效成本比较。':o.savingsFraction>=0?'相对人工对照低 '+(o.savingsFraction*100).toFixed(1)+'%（成本口径，非现金节约）':'相对人工对照高 '+(-o.savingsFraction*100).toFixed(1)+'%（成本口径）';document.querySelector('#result-comparison').textContent=comparison;document.querySelector('#result-threshold').textContent=o.nBreakEven===null?'当前参数下，增加业务量不能达到严格成本优势。':o.nBreakEven===0?'当前参数下无固定成本门槛；仍需验证质量与服务约束。':'其余假设不变，月任务数需大于 '+o.nBreakEven.toLocaleString('zh-CN',{maximumFractionDigits:1})+' 单才有成本优势。';}
 form.addEventListener('input',render);form.addEventListener('submit',e=>e.preventDefault());document.querySelector('#reset-model').addEventListener('click',()=>{for(const [key,val]of Object.entries(defaults)){const field=form.elements[key];field.value=field.dataset.percent?val*100:val;}render();});render();
 }
}
