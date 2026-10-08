'use client';
import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from '@/components/ui/table';
import {LoaderCircle,RefreshCw} from 'lucide-react';
import Link from 'next/link';
import {Brand} from '@/app/page';

type Participant={id:string;last_name:string;first_name:string;body_weight:number|null;bar_weight:number|null;bench:number|null;pullups:number|null;swim_seconds:number|null};
export default function Results(){
 const [rows,setRows]=useState<Participant[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(){
  try{
   const response=await fetch('/api/results',{cache:'no-store'});
   const data=await response.json() as {participants:Participant[];error?:string};
   if(!response.ok)throw Error(data.error||'Не удалось загрузить результаты');
   setRows(data.participants);setError('');
  }catch(e){setError(e instanceof Error?e.message:'Не удалось загрузить результаты');}
  finally{setLoading(false);}
 }
 useEffect(()=>{
  void load();
  const refresh=()=>{if(!document.hidden)void load();};
  const timer=window.setInterval(refresh,15000);
  document.addEventListener('visibilitychange',refresh);
  return()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',refresh);};
 },[]);
 return <div className="admin-page"><header className="site-header"><div className="container header-inner"><Brand/><Link className="back-site" href="/">На сайт марафона</Link></div></header><main className="container admin-main"><div className="admin-title"><div><p className="eyebrow">17 · 19 · 20 · 21 ОКТЯБРЯ 2026</p><h1>Результаты участников</h1><p>{rows.length} участников · Республика фитнес</p></div></div><div className="result-top"><p>Жим лёжа · Подтягивания · Бассейн — 50 м вольным стилем</p><Button variant="outline" onClick={()=>{setLoading(true);void load();}} disabled={loading}><RefreshCw size={16}/>Обновить</Button></div>{error&&<p className="error" role="alert">{error}</p>}{loading&&rows.length===0?<div className="loading-state" role="status"><LoaderCircle className="spin"/>Загружаем результаты…</div>:<div className="table-panel"><Table className="results-table public-results-table"><TableHeader><TableRow><TableHead className="number-head">№</TableHead><TableHead>Фамилия</TableHead><TableHead>Имя</TableHead><TableHead>Вес участника<small>кг</small></TableHead><TableHead>Вес штанги<small>кг</small></TableHead><TableHead>Жим лёжа<small>повторы</small></TableHead><TableHead>Подтягивания<small>повторы</small></TableHead><TableHead>Бассейн · 50 м<small>вольный стиль · секунды</small></TableHead></TableRow></TableHeader><TableBody>{rows.map((p,i)=><TableRow key={p.id}><TableCell className="row-number">{i+1}</TableCell><TableCell>{p.last_name}</TableCell><TableCell>{p.first_name}</TableCell>{[p.body_weight,p.bar_weight,p.bench,p.pullups,p.swim_seconds].map((value,index)=><TableCell key={index} className="public-result-value">{value===null?'—':value.toLocaleString('ru-RU')}</TableCell>)}</TableRow>)}</TableBody></Table>{rows.length===0&&!error&&<div className="empty-state"><h3>Участников пока нет</h3><p>После регистрации участники появятся в таблице. Результаты добавит организатор.</p></div>}</div>}<p className="table-hint">— дисциплина ещё не пройдена или вес не указан. 0 — выполнено ноль повторений.</p></main><footer><div className="container footer-inner"><span>Республика фитнес · Олимпийская, 15</span><Link href="/">Страница марафона</Link></div></footer></div>;
}
