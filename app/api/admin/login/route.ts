import { getRawDb } from '@/db';
import { hash, sameOrigin, fail } from '@/lib/server';
export async function POST(req: Request) { try {
 if(!sameOrigin(req)) return Response.json({error:'Недопустимый запрос'},{status:403});
 const db=getRawDb(); const key=await hash(req.headers.get('cf-connecting-ip')||req.headers.get('x-real-ip')||'shared'); const now=Date.now();
 const attempt=await db.prepare('SELECT count, reset_at FROM login_attempts WHERE key = ?').bind(key).first<{count:number;reset_at:number}>();
 if(attempt&&attempt.reset_at>now&&attempt.count>=10) return Response.json({error:'Слишком много попыток. Попробуйте через 15 минут.'},{status:429});
 const body=await req.json() as Record<string,unknown>;
 if(await hash(String(body.password||'').replace(/\s/g,'')) !== 'a9e965a1d0b7e35a1eef1f958044b414d79e2d5ef757244e9f38efccf24d417e') {
 await db.prepare('INSERT INTO login_attempts (key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = CASE WHEN reset_at < ? THEN 1 ELSE count + 1 END, reset_at = CASE WHEN reset_at < ? THEN ? ELSE reset_at END').bind(key,now+900000,now,now,now+900000).run();
 return Response.json({error:'Неверный пароль'},{status:401}); }
 const token=crypto.randomUUID()+crypto.randomUUID();
 await db.batch([db.prepare('INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)').bind(await hash(token),now+604800000),db.prepare('DELETE FROM login_attempts WHERE key = ?').bind(key),db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').bind(now)]);
 return Response.json({ok:true},{headers:{'Set-Cookie':`republika_admin=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${new URL(req.url).protocol==='https:'?'; Secure':''}`}});
 }catch(e){return fail(e);} }
