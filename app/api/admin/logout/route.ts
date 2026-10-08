import { getRawDb } from '@/db';
import { hash, sameOrigin, fail } from '@/lib/server';
export async function POST(req:Request){try{if(!sameOrigin(req))return new Response(null,{status:403});const token=req.headers.get('cookie')?.match(/(?:^|;\s*)republika_admin=([^;]+)/)?.[1];if(token)await getRawDb().prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await hash(token)).run();return Response.json({ok:true},{headers:{'Set-Cookie':'republika_admin=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0'}});}catch(e){return fail(e);}}
