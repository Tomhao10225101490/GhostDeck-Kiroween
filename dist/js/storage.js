/** Durable browser state. Maps and Sets are serialized explicitly and replayed on load. */
import {validateDeck, exportDeckJson, createInitialSession, applyChoice, toggleEvidence, MAX_SESSION_LENGTH} from './engine.js';
const KEY='ghostdeck_session_v1';
export function serializeSession(session){return JSON.stringify({version:1,deckId:session.deckId,deck:exportDeckJson(session.deck),history:session.history,currentCardId:session.currentCardId,evidenceRevealed:[...session.evidenceRevealed]});}
export function deserializeSession(text){
 try {
  if(typeof text!=='string'||new TextEncoder().encode(text).length>2*1024*1024)throw Error('Invalid saved size');
  const data=JSON.parse(text); const valid=validateDeck(data.deck);
  if(data.version!==1||!valid.valid||!Array.isArray(data.history)||data.history.length>MAX_SESSION_LENGTH||!Array.isArray(data.evidenceRevealed)||data.evidenceRevealed.some(id=>!valid.deckObj.cards.has(id)))throw Error('Invalid saved rehearsal');
  let session=createInitialSession(valid.deckObj,typeof data.deckId==='string'?data.deckId:'saved');
  for(const record of data.history){
   if(!record||record.cardId!==session.currentCardId||typeof record.evidenceWasRevealed!=='boolean')throw Error('Invalid saved path');
   if(session.evidenceRevealed.has(record.cardId)!==record.evidenceWasRevealed)session=toggleEvidence(session,record.cardId);
   const next=applyChoice(session,record.destinationId,record.choiceIndex);
   if(next===session||next.history.at(-1).choiceLabel!==record.choiceLabel)throw Error('Invalid saved choice');
   session=next;
  }
  if(session.currentCardId!==data.currentCardId)throw Error('Invalid final card');
  session.evidenceRevealed=new Set(data.evidenceRevealed);
  return {success:true,session};
 }catch(error){return {success:false,session:null,error:error.message};}
}
export function saveSession(session){try{if(typeof window==='undefined')throw Error('Browser storage unavailable');window.localStorage.setItem(KEY,serializeSession(session));return {success:true};}catch(error){return {success:false,error:error.message};}}
export function loadSession(){try{if(typeof window==='undefined')return {success:false,session:null};const text=window.localStorage.getItem(KEY);return text?deserializeSession(text):{success:false,session:null};}catch(error){return {success:false,session:null,error:error.message};}}
export function clearAllData(){try{if(typeof window!=='undefined')window.localStorage.removeItem(KEY);return {success:true};}catch(error){return {success:false,error:error.message};}}
