export const HOLD_TO_EDIT_MS=3000;
export function createHoldToEdit(activate:()=>void,press:(active:boolean)=>void,schedule:(callback:()=>void,delay:number)=>unknown,cancelTimer:(timer:unknown)=>void){
 let timer:unknown=null,origin:{x:number;y:number}|null=null;
 function cancel(){if(timer!==null)cancelTimer(timer);timer=null;origin=null;press(false);}
 function start(x=0,y=0){cancel();origin={x,y};press(true);timer=schedule(()=>{timer=null;origin=null;press(false);activate();},HOLD_TO_EDIT_MS);}
 function move(x:number,y:number){if(origin&&Math.hypot(x-origin.x,y-origin.y)>10)cancel();}
 return {start,move,cancel};
}
