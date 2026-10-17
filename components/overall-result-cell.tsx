export function OverallResultCell({value,points}:{value:number|null|undefined;points:number}){
 const recorded=value!==null&&value!==undefined;
 return <><span className="overall-value">{recorded?value.toLocaleString('ru-RU'):'—'}</span>{recorded&&<small>{points} балл.</small>}</>;
}
