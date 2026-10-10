export type Gender = 'male' | 'female';
export type ResultParticipant = {id:string;last_name:string;first_name:string;gender:Gender|null;bench:number|null;pullups:number|null;pushups:number|null;swim_seconds:number|null;grip_kg:number|null};
export type ResultField = 'bench'|'pullups'|'pushups'|'swim_seconds'|'grip_kg';
export function disciplineRows(participants:ResultParticipant[], gender:Gender, field:ResultField){
 const rows=participants.filter(p=>p.gender===gender).slice().sort((a,b)=>{
  const av=a[field],bv=b[field];
  if(av===null||av===undefined)return bv===null||bv===undefined?compareNames(a,b):1;
  if(bv===null||bv===undefined)return -1;
  return (field==='swim_seconds'?av-bv:bv-av)||compareNames(a,b);
 });
 let rank:number|null=null,previous:number|null=null;
 return rows.map((participant,index)=>{
  const value=participant[field]??null;
  if(value!==null){if(previous!==value)rank=index+1;previous=value;}
  return {participant,value,rank:value===null?null:rank};
 });
}
function compareNames(a:ResultParticipant,b:ResultParticipant){return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`,'ru')||a.id.localeCompare(b.id);}
