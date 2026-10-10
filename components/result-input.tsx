'use client';
import {useEffect,useRef,useState} from 'react';
import type {ResultField} from '@/lib/results';
import {createHoldToEdit} from '@/lib/hold-to-edit';
export function ResultInput({value,field,name,authorized,onRequestAccess,onSave,onFocus,onBlur}:{value:number|null;field:ResultField;name:string;authorized:boolean;onRequestAccess:()=>void;onSave:(value:number|null)=>void;onFocus:()=>void;onBlur:()=>void}){
 const [draft,setDraft]=useState(value===null?'':String(value)),[invalid,setInvalid]=useState(false),[unlocked,setUnlocked]=useState(value===null),[pressing,setPressing]=useState(false);
 const focused=useRef(false),input=useRef<HTMLInputElement>(null),focusOnUnlock=useRef(false);
 const current=useRef({authorized,onRequestAccess});current.current={authorized,onRequestAccess};
 const hold=useRef<ReturnType<typeof createHoldToEdit>|null>(null);
 if(!hold.current)hold.current=createHoldToEdit(()=>{focusOnUnlock.current=true;setUnlocked(true);if(!current.current.authorized)current.current.onRequestAccess();},setPressing,(callback,delay)=>window.setTimeout(callback,delay),timer=>window.clearTimeout(timer as number));
 useEffect(()=>()=>hold.current?.cancel(),[]);
 useEffect(()=>{if(!focused.current){setDraft(value===null?'':String(value));setUnlocked(value===null);}},[value]);
 useEffect(()=>{if(unlocked&&authorized&&focusOnUnlock.current){focusOnUnlock.current=false;input.current?.focus();input.current?.select();}},[unlocked,authorized]);
 function change(raw:string){
  if(!authorized)return;
  setDraft(raw);const normalized=raw.replace(',','.').trim();
  const n=normalized===''?null:Number(normalized);
  const valid=n===null||(Number.isFinite(n)&&n>=0&&n<=1000&&(field!=='swim_seconds'||n>0)&&(!['bench','pullups','pushups'].includes(field)||Number.isInteger(n)));
  setInvalid(!valid);if(valid)onSave(n);
 }
 if(!unlocked)return <button type="button" className={`locked-result${pressing?' result-holding':''}`} aria-label={`Результат: ${name}. Удерживайте 3 секунды для исправления.`} onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);hold.current?.start(e.clientX,e.clientY);}} onPointerMove={e=>hold.current?.move(e.clientX,e.clientY)} onPointerUp={()=>hold.current?.cancel()} onPointerCancel={()=>hold.current?.cancel()} onPointerLeave={()=>hold.current?.cancel()} onKeyDown={e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();hold.current?.start();}}} onKeyUp={()=>hold.current?.cancel()} onBlur={()=>hold.current?.cancel()}>{draft===''?'—':Number(draft.replace(',','.')).toLocaleString('ru-RU',{maximumFractionDigits:2})}</button>;
 return <input ref={input} className="inline-result-input" type="text" inputMode={['bench','pullups','pushups'].includes(field)?'numeric':'decimal'} value={draft} placeholder="—" readOnly={!authorized} aria-label={`Результат: ${name}`} aria-invalid={invalid} title={invalid?'Повторы — целое число от 0 до 1000; время — больше нуля.':undefined} onFocus={()=>{if(!authorized){focusOnUnlock.current=true;onRequestAccess();return;}focused.current=true;onFocus();}} onBlur={()=>{focused.current=false;onBlur();if(!invalid&&draft.trim()!=='')setUnlocked(false);}} onChange={e=>change(e.target.value)}/>;
}
