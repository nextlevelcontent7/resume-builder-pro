const assert = require('assert');
const cases = [];
function describe(name, fn){
  cases.push({name, fn, type:'suite'});
}
function it(name, fn){
  cases.push({name, fn, type:'case'});
}
async function run(){
  for(const c of cases){
    try{
      await c.fn();
      console.log(`\u2714 ${c.name}`);
    }catch(err){
      console.error(`\u2716 ${c.name}`, err);
      process.exitCode = 1;
    }
  }
}
module.exports = { describe, it, run, expect: assert };
