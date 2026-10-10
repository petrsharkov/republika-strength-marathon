import {getRawDb} from '@/db';
import {fail,sameOrigin} from '@/lib/server';
export async function POST(req:Request){try{
 if(!sameOrigin(req))return new Response(null,{status:403});
 const b=await req.json() as Record<string,unknown>;const lastName=String(b.lastName||'').trim(),firstName=String(b.firstName||'').trim(),phone=String(b.phone||'').trim();let digits=phone.replace(/\D/g,'');if(digits.length===11&&digits.startsWith('8'))digits='7'+digits.slice(1);
 if(!lastName||!firstName||lastName.length>80||firstName.length>80||digits.length<10||digits.length>15)return Response.json({error:'Укажите фамилию, имя и корректный мобильный телефон.'},{status:400});
 const gender=b.gender;if(gender!=='male'&&gender!=='female')return Response.json({error:'Выберите мужскую или женскую категорию.'},{status:400});
 const key=[lastName.toLowerCase(),firstName.toLowerCase(),digits].join('|');const now=new Date().toISOString();
 await getRawDb().prepare('INSERT INTO participants (id,last_name,first_name,phone,registration_key,source,gender,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(registration_key) DO NOTHING').bind(crypto.randomUUID(),lastName,firstName,phone,key,'registration',gender,now,now).run();
 return Response.json({ok:true});
 }catch(e){return fail(e);}}
