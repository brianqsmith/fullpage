const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};
function element(id){return elements[id]??={textContent:'',title:'',classList:{toggle(){}},addEventListener(){}};}
let delays=[],closed=0;
const context={document:{visibilityState:'hidden',querySelector:element,addEventListener(){},body:{classList:{toggle(){}}}},browser:{runtime:{onMessage:{addListener(){}},sendMessage(){throw Error('Hidden popup must not capture');}}},window:{close(){closed++}},setTimeout(fn,ms){delays.push(ms);return 1},clearTimeout(){}};
vm.createContext(context);vm.runInContext(fs.readFileSync('outputs/fullpage/progress.js','utf8'),context);
for(const phase of ['scanning','saving']){
 context.render({phase,title:'Page scanning',detail:'Capturing the page',autoClose:'immediately',percent:50});assert.deepEqual(delays,[]);assert.equal(elements['#title'].textContent,'Page scanning');
}
context.render({phase:'complete',title:'Complete',detail:'Image saved to downloads',autoClose:'immediately',percent:100});assert.deepEqual(delays,[0]);
context.render({phase:'scanning',title:'Page scanning',detail:'Capturing the page',autoClose:'never'});
context.render({phase:'complete',title:'Complete',detail:'Image saved to downloads',autoClose:'after-2s'});assert.deepEqual(delays,[0,2000]);
context.render({phase:'error',title:'Error',detail:'Failure',autoClose:'immediately'});assert.deepEqual(delays,[0,2000]);
context.render({phase:'complete',title:'Complete',detail:'Image saved to downloads',autoClose:'never'});assert.deepEqual(delays,[0,2000]);
console.log('Hidden preload, progress wording, immediate/2-second timing, never, and errors passed.');
