import {getRawDb} from '@/db';
import {fail} from '@/lib/server';

export async function GET(){
 try{
  const rows=await getRawDb().prepare("SELECT id,last_name,first_name,body_weight,bar_weight,bench,pullups,swim_seconds FROM participants WHERE last_name != '' OR first_name != '' ORDER BY created_at ASC,id ASC").all();
  return Response.json({participants:rows.results},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return fail(e);}
}
