/** Storage and ranking use seconds; the UI uses minutes:seconds. */
export function formatSwimTime(value:number|null|undefined):string{
 if(value===null||value===undefined)return '';
 const hundredths=Math.round(value*100),minutes=Math.floor(hundredths/6000),rest=hundredths%6000;
 const seconds=String(Math.floor(rest/100)).padStart(2,'0'),fraction=rest%100;
 return `${minutes}:${seconds}${fraction?','+String(fraction).padStart(2,'0').replace(/0$/,''):''}`;
}
/** undefined = incomplete or invalid, null = clear result. */
export function parseSwimTime(raw:string):number|null|undefined{
 const text=raw.trim().replace(',','.');
 if(!text||text===':')return null;
 const match=/^(\d+):(\d{1,2}(?:\.\d{1,2})?)$/.exec(text);
 if(!match)return undefined;
 const minutes=Number(match[1]),seconds=Number(match[2]),total=Math.round((minutes*60+seconds)*100)/100;
 return seconds<60&&total>0&&total<=1000?total:undefined;
}
