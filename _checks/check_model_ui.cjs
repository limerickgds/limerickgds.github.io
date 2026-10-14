'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../assets/channel/article.js'),'utf8');
const defaults=require('../downloads/model.json').defaults;
for(const lang of ['zh-CN','en']){
 const nodes={};
 for(const id of ['model-error','result-cost','result-manual','result-total','result-accepted','result-comparison','result-threshold'])nodes['#'+id]={textContent:''};
 const handlers={};
 const fields=Object.fromEntries(Object.entries(defaults).map(([name,n])=>{
  const percent=['p','r','q'].includes(name);
  return [name,{value:String(percent?n*100:n),dataset:percent?{percent:'true'}:{},checkValidity(){const v=Number(this.value);return Number.isFinite(v)&&v>=0&&(name!=='N'||v>0)&&(!percent||v<=100);}}];
 }));
 nodes['.reading-progress']={style:{}};
 nodes['#model-defaults']={textContent:JSON.stringify(defaults)};
 nodes['#model-form']={elements:fields,addEventListener(event,fn){handlers[event]=fn;}};
 nodes['#reset-model']={addEventListener(event,fn){handlers.reset=fn;}};
 vm.runInNewContext(source,{document:{documentElement:{lang,scrollHeight:500},querySelector:s=>nodes[s],querySelectorAll:()=>[]},innerHeight:500,scrollY:0,addEventListener(){},requestAnimationFrame:fn=>fn()});
 const text=id=>nodes['#'+id].textContent;
 assert.equal(text('result-cost'),lang==='en'?'CNY 5.45':'¥5.45');
 assert.equal(text('result-accepted'),lang==='en'?'9,900 tasks':'9,900 单');
 assert.ok(text('result-threshold').includes('7,692.3'));
 fields.p.value='60';handlers.input();
 assert.equal(text('result-cost'),lang==='en'?'CNY 7.14':'¥7.14');
 assert.ok(text('result-comparison').includes('17.9%'));
 fields.p.value='101';handlers.input();
 assert.ok(text('model-error').includes(lang==='en'?'Enter valid':'有效数值'));
 handlers.reset();
 assert.equal(text('model-error'),'');
 assert.equal(text('result-cost'),lang==='en'?'CNY 5.45':'¥5.45');
 fields.p.value='0';fields.r.value='0';handlers.input();
 assert.equal(text('result-cost'),lang==='en'?'No valid result':'无有效结果');
 assert.ok(text('result-comparison').includes(lang==='en'?'valid cost comparison':'有效成本比较'));
 handlers.reset();fields.F.value='0';handlers.input();
 assert.ok(text('result-threshold').includes(lang==='en'?'no fixed-cost threshold':'无固定成本门槛'));
}
console.log('PASS: both model languages, baseline, changed rate, invalid input, reset, zero success and fixed-cost boundary.');
