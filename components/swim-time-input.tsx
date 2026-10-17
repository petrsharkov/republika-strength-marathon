'use client';
import {useEffect,useRef,useState,type RefObject} from 'react';
import {formatSwimTime,parseSwimTime} from '@/lib/swim-time';
export function SwimTimeInput({draft,onChange,name,invalid=false,readOnly=false,disabled=false,onFocus,onBlur,firstInputRef}:{draft:string;onChange:(draft:string)=>void;name:string;invalid?:boolean;readOnly?:boolean;disabled?:boolean;onFocus:()=>void;onBlur:()=>void;firstInputRef?:RefObject<HTMLInputElement|null>}){
 const [minutes='',seconds='']=draft.split(':');
 return <span className="swim-time-input" role="group" onPaste={e=>{const text=e.clipboardData.getData('text').trim();if(text.includes(':')&&parseSwimTime(text)!==undefined){e.preventDefault();onChange(text);}}} aria-label={`Время плавания: ${name}`} onFocus={e=>{if(!e.currentTarget.contains(e.relatedTarget))onFocus();}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))onBlur();}}>
  <input ref={firstInputRef} className="swim-minutes" type="text" inputMode="numeric" aria-label={`Минуты: ${name}`} aria-invalid={invalid} placeholder="мин" value={minutes} readOnly={readOnly} disabled={disabled} onChange={e=>onChange(`${e.target.value}:${seconds}`)}/><span aria-hidden="true">:</span>
  <input className="swim-seconds" type="text" inputMode="decimal" aria-label={`Секунды: ${name}`} aria-invalid={invalid} placeholder="сек" value={seconds} readOnly={readOnly} disabled={disabled} onChange={e=>onChange(`${minutes||'0'}:${e.target.value}`)}/>
 </span>;
}
export function AdminSwimTimeInput({value,onSave,disabled,name}:{value:number|null;onSave:(seconds:number|null)=>void;disabled:boolean;name:string}){
 const [draft,setDraft]=useState(formatSwimTime(value)),[invalid,setInvalid]=useState(false);const focused=useRef(false);
 useEffect(()=>{if(!focused.current)setDraft(formatSwimTime(value));},[value]);
 return <SwimTimeInput draft={draft} name={name} disabled={disabled} invalid={invalid} onFocus={()=>{focused.current=true;}} onBlur={()=>{focused.current=false;const seconds=parseSwimTime(draft);setInvalid(seconds===undefined);if(seconds!==undefined)setDraft(formatSwimTime(seconds));}} onChange={raw=>{setDraft(raw);const seconds=parseSwimTime(raw);setInvalid(seconds===undefined&&!raw.endsWith(':'));if(seconds!==undefined)onSave(seconds);}}/>;
}
