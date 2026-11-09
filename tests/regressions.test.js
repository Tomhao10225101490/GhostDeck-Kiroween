import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDeck,importDeckJson,createInitialSession,applyChoice,MAX_SESSION_LENGTH} from '../dist/js/engine.js';
const raw=()=>({title:'Test',description:'Fictional test fixture',cards:[{id:'a',title:'Start',narrative:'Choose',evidence:[{label:'Log',content:'A fact'}],choices:[{label:'Finish',destination:'b'}],isTerminal:false},{id:'b',title:'End',narrative:'Debrief',evidence:[],choices:[],isTerminal:true}]});
test('arbitrary malformed imports return structured errors without throwing',()=>{
 for(const value of [null,[],{}, {title:'X',description:'',cards:[null]}, {title:'X',description:'',cards:[42]}, {...raw(),cards:[{...raw().cards[0],evidence:[null]}]}, {...raw(),cards:[{...raw().cards[0],choices:[null]}]}]){
  const result=validateDeck(value);assert.equal(result.valid,false);assert.ok(Array.isArray(result.errors));assert.ok(result.errors.length);
 }
});
test('oversized import is rejected before applying state',()=>{const r=importDeckJson(' '.repeat(2*1024*1024));assert.equal(r.success,false);assert.ok(r.errors.some(x=>/size|large|limit|exceed/i.test(x)));});
test('invalid transition is an unchanged session',()=>{const s=createInitialSession(validateDeck(raw()).deckObj);assert.strictEqual(applyChoice(s,'missing'),s);assert.equal(s.history.length,0);});
test('terminal transition is rejected without changing history',()=>{const s=applyChoice(createInitialSession(validateDeck(raw()).deckObj),'b');assert.strictEqual(applyChoice(s,'a'),s);assert.equal(s.history.length,1);});
test('session limit is enforced by engine rather than only presentation',()=>{const d=raw();d.cards[0].choices=[{label:'Loop',destination:'a'},{label:'End',destination:'b'}];let s=createInitialSession(validateDeck(d).deckObj);for(let i=0;i<MAX_SESSION_LENGTH;i++)s=applyChoice(s,'a');assert.strictEqual(applyChoice(s,'a'),s);assert.equal(s.history.length,MAX_SESSION_LENGTH);});
test('history records availability separately from revealed evidence',()=>{const s=applyChoice(createInitialSession(validateDeck(raw()).deckObj),'b');assert.equal(s.history[0].evidenceSnapshot.length,1);assert.equal(s.history[0].evidenceWasRevealed,false);});
