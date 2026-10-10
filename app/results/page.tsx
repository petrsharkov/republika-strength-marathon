'use client';
import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import {disciplineRows,type Gender,type ResultField,type ResultParticipant} from '@/lib/results';
import {LoaderCircle,RefreshCw} from 'lucide-react';
import Link from 'next/link';
import {Brand} from '@/app/page';

export default function Results(){
 const [rows,setRows]=useState<ResultParticipant[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [gender,setGender]=useState<Gender>('male'),[discipline,setDiscipline]=useState('bench');
 const disciplines:{id:string;field:ResultField;title:string;unit:string}[]=[{id:'bench',field:'bench',title:'Жим штанги лёжа',unit:'раз'},{id:'body',field:gender==='male'?'pullups':'pushups',title:gender==='male'?'Подтягивания':'Отжимания от пола',unit:'раз'},{id:'swim',field:'swim_seconds',title:'Плавание — 50 м',unit:'с'},{id:'grip',field:'grip_kg',title:'Кистевая сила',unit:'кг'}];
 const selected=disciplines.find(d=>d.id===discipline)!;
 const resultRows=disciplineRows(rows,gender,selected.field),unknown=rows.filter(p=>!p.gender).length;
 async function load(){
  try{
   const response=await fetch('/api/results',{cache:'no-store'});
   const data=await response.json() as {participants:ResultParticipant[];error?:string};
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
 return <div className="admin-page public-results-page"><header className="site-header"><div className="container header-inner"><Brand/><Link className="back-site" href="/">На сайт кубка</Link></div></header>
 <main className="container admin-main"><div className="admin-title"><div><p className="eyebrow">17 · 19 · 20 · 21 ОКТЯБРЯ 2026</p><h1>Результаты участников</h1><p>{rows.length} участников · Репаблика фитнес</p></div></div>
 <div className="results-category" role="group" aria-label="Категория участников">{(['male','female'] as const).map(g=><button type="button" key={g} aria-pressed={gender===g} onClick={()=>setGender(g)}>{g==='male'?'Мужчины':'Женщины'} <span>{rows.filter(p=>p.gender===g).length}</span></button>)}</div>
 <div className="results-disciplines" role="group" aria-label="Дисциплина">{disciplines.map(d=><button type="button" key={d.id} aria-pressed={discipline===d.id} onClick={()=>setDiscipline(d.id)}>{d.title}</button>)}</div>
 <div className="discipline-result-title"><div><h2>{selected.title}</h2><p>{gender==='male'?'Мужчины':'Женщины'}{selected.id==='bench'?gender==='male'?' · собственный вес':' · половина собственного веса':''}</p></div><Button variant="outline" aria-label="Обновить результаты" onClick={()=>{setLoading(true);void load();}} disabled={loading}><RefreshCw size={16}/></Button></div>
 {error&&<p className="error" role="alert">{error}</p>}
 {loading&&rows.length===0?<div className="loading-state" role="status"><LoaderCircle className="spin"/>Загружаем результаты…</div>:<div className="discipline-table-panel"><table className="discipline-results-table" aria-label={`${selected.title}: ${gender==='male'?'мужчины':'женщины'}`}><colgroup><col className="place-column"/><col/><col className="value-column"/></colgroup><thead><tr><th scope="col">№</th><th scope="col">Фамилия и имя</th><th scope="col">Результат</th></tr></thead><tbody>{resultRows.map(({participant:p,value,rank})=><tr key={p.id}><td className="result-place">{rank??'—'}</td><td className="result-name">{[p.last_name,p.first_name].filter(Boolean).join(' ')}</td><td className="result-value">{value===null?'—':<>{value.toLocaleString('ru-RU',{maximumFractionDigits:2})} <small>{selected.unit}</small></>}</td></tr>)}</tbody></table>{resultRows.length===0&&!error&&<div className="empty-state"><p>В этой категории пока нет участников.</p></div>}</div>}
 <p className="table-hint">Все участники категории включены в каждую таблицу. — результат ещё не внесён. Одинаковые результаты — одинаковое место.</p>
 {unknown>0&&<p className="results-unknown">У {unknown} участников ещё не указана категория. Организатор может выбрать её в кабинете — после этого участники появятся во всех своих таблицах.</p>}
 </main><footer><div className="container footer-inner"><span>Репаблика фитнес · Олимпийская, 15</span><Link href="/">Страница кубка</Link></div></footer></div>;
}
