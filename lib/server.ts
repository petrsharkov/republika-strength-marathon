import { getRawDb } from '@/db';
export async function hash(value: string) { const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)); return Array.from(new Uint8Array(bytes), b=>b.toString(16).padStart(2,'0')).join(''); }
export function sameOrigin(req: Request) { const origin=req.headers.get('origin'); return !origin || origin===new URL(req.url).origin; }
export async function isAdmin(req: Request) { const token=req.headers.get('cookie')?.match(/(?:^|;\s*)republika_admin=([^;]+)/)?.[1]; if (!token) return false; const row=await getRawDb().prepare('SELECT expires_at FROM admin_sessions WHERE token_hash = ? AND expires_at > ?').bind(await hash(token), Date.now()).first(); return !!row; }
export function fail(error: unknown) { console.error('Marathon storage error', error); return Response.json({error:'Не удалось сохранить или загрузить данные. Попробуйте ещё раз.'},{status:503}); }
export const fields: Record<string,string> = {lastName:'last_name',firstName:'first_name',phone:'phone',bodyWeight:'body_weight',barWeight:'bar_weight',bench:'bench',pullups:'pullups',swimSeconds:'swim_seconds'};
