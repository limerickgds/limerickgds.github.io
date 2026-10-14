'use strict';
const assert=require('node:assert/strict');
const {calculate}=require('../assets/channel/article.js');
const model=require('../downloads/model.json');
const d=model.defaults;
function near(a,b){assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);}
for(const [key,value] of Object.entries(model.baseline))near(calculate(d)[key],value);
near(calculate({...d,p:0.6}).costPerAccepted,model.sensitivity[0].costPerAccepted);
near(calculate({...d,c:0.3}).costPerAccepted,model.sensitivity[1].costPerAccepted);
assert.equal(calculate({...d,p:0,r:0}).costPerAccepted,null);
assert.equal(calculate({...d,q:0}).manualCostPerAccepted,null);
assert.equal(calculate({...d,q:0}).savingsFraction,null);
assert.equal(calculate({...d,h:0}).savingsFraction,null);
assert.equal(calculate({...d,e:1000,p:0}).nBreakEven,null);
assert.equal(calculate({...d,F:0}).nBreakEven,0);
near(calculate({...d,p:1}).accepted,d.N);
near(calculate({...d,N:calculate(d).nBreakEven}).costPerAccepted,d.h/d.q);
near(calculate({...d,p:calculate(d).pBreakEven}).costPerAccepted,d.h/d.q);
console.log('PASS: baseline, sensitivity, break-even identities, zero success/manual rate, no contribution and fixed-cost boundaries.');
