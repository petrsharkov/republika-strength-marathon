import {formatSwimTime} from '@/lib/swim-time';
export function OverallResultCell({value,points,swim=false}:{value:number|null|undefined;points:number;swim?:boolean}){
 const recorded=value!==null&&value!==undefined;
 return <><span className="overall-value">{recorded?(swim?formatSwimTime(value):value.toLocaleString('ru-RU')):'—'}</span>{recorded&&<small>{points} балл.</small>}</>;
}
