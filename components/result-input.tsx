'use client';
import {useEffect,useRef,useState} from 'react';
import type {ResultField} from '@/lib/results';
export function ResultInput({value,field,name,onSave,onFocus,onBlur}:{value:number|null;field:ResultField;name:string;onSave:(value:number|null)=>void;onFocus:()=>void;onBlur:()=>void}){
 const [draft,setDraft]=useState(value===null?'':String(value)),[invalid,setInvalid]=useState(false);
 const focused=useRef(false);
 useEffect(()=>{if(!focused.current)setDraft(value===null?'':String(value));},[value]);
 function change(raw:string){
  setDraft(raw);const normalized=raw.replace(',','.').trim();
  const n=normalized===''?null:Number(normalized);
  const valid=n===null||(Number.isFinite(n)&&n>=0&&n<=1000&&(field!=='swim_seconds'||n>0)&&(!['bench','pullups','pushups'].includes(field)||Number.isInteger(n)));
  setInvalid(!valid);if(valid)onSave(n);
 }
 return <input className="inline-result-input" type="text" inputMode={['bench','pullups','pushups'].includes(field)?'numeric':'decimal'} value={draft} placeholder="—" aria-label={`Результат: ${name}`} aria-invalid={invalid} title={invalid?'Повторы — целое число от 0 до 1000; время — больше нуля.':undefined} onFocus={()=>{focused.current=true;onFocus();}} onBlur={()=>{focused.current=false;onBlur();}} onChange={e=>change(e.target.value)}/>;
}
