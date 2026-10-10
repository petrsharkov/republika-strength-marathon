'use client';
import {useEffect,useRef,useState} from 'react';
import {ResultInput} from '@/components/result-input';
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
 const [authenticated,setAuthenticated]=useState(false),[editing,setEditing]=useState(false),[loginOpen,setLoginOpen]=useState(false),[loginBusy,setLoginBusy]=useState(false),[pending,setPending]=useState(0),[failed,setFailed]=useState(0),[editingOrder,setEditingOrder]=useState<string[]|null>(null);
 type Edit={id:string;field:ResultField;value:number|null;stamp:number};
 const latest=useRef(new Map<string,Edit>()),failures=useRef(new Map<string,Edit>()),active=useRef(0),counter=useRef(0);
 const ranked=disciplineRows(rows,gender,selected.field),unknown=rows.filter(p=>!p.gender).length;
 const resultRows=editingOrder?ranked.slice().sort((a,b)=>editingOrder.indexOf(a.participant.id)-editingOrder.indexOf(b.participant.id)):ranked;
 async function save(edit:Edit){
  const key=edit.id+':'+edit.field;latest.current.set(key,edit);failures.current.delete(key);active.current++;setPending(active.current);setFailed(failures.current.size);
  try{
   const r=await fetch('/api/participants/'+encodeURIComponent(edit.id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({[edit.field==='swim_seconds'?'swimSeconds':edit.field==='grip_kg'?'gripKg':edit.field]:edit.value,editStamp:edit.stamp}),keepalive:true});
   const b=await r.json() as {error?:string};
   if(!r.ok){if(r.status===401){setAuthenticated(false);setLoginOpen(true);}throw Error(b.error||'Не удалось сохранить результат');}
   if(latest.current.get(key)?.stamp===edit.stamp){latest.current.delete(key);failures.current.delete(key);if(!failures.current.size)setError('');setRows(rows=>rows.map(p=>p.id===edit.id?{...p,[edit.field]:edit.value}:p));}
  }catch(e){if(latest.current.get(key)?.stamp===edit.stamp){latest.current.delete(key);failures.current.set(key,edit);setError(e instanceof Error?e.message:'Не удалось сохранить результат');}}
  finally{active.current--;setPending(active.current);setFailed(failures.current.size);}
 }
 function record(id:string,value:number|null){void save({id,field:selected.field,value,stamp:Date.now()*1000+(counter.current++%1000)});}
 async function login(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setLoginBusy(true);setError('');
  try{const password=String(new FormData(event.currentTarget).get('password'));const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const b=await r.json() as {error?:string};if(!r.ok)throw Error(b.error||'Не удалось войти');setAuthenticated(true);setEditing(true);setLoginOpen(false);for(const edit of failures.current.values())void save(edit);}
  catch(e){setError(e instanceof Error?e.message:'Не удалось войти');}finally{setLoginBusy(false);}
 }
 function toggleEditing(){if(editing){if(active.current||failures.current.size){setError('Дождитесь сохранения или повторите отправку.');return;}setEditing(false);setEditingOrder(null);}else if(authenticated){setEditing(true);}else{setLoginOpen(open=>!open);}}
 useEffect(()=>{void fetch('/api/participants',{cache:'no-store'}).then(r=>{if(r.ok)setAuthenticated(true);}).catch(()=>{});const warn=(e:BeforeUnloadEvent)=>{if(active.current||failures.current.size){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[]);
 async function load(){
  if(active.current||failures.current.size){setLoading(false);return;}
  try{
   const response=await fetch('/api/results',{cache:'no-store'});
   const data=await response.json() as {participants:ResultParticipant[];error?:string};
   if(!response.ok)throw Error(data.error||'Не удалось загрузить результаты');
   if(!active.current&&!failures.current.size){setRows(data.participants);setError('');}
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
 <div className="results-edit-toolbar"><Button variant="outline" onClick={toggleEditing}>{editing?'Завершить ввод':'Внести результаты'}</Button>{editing&&<span className="inline-save-status" role="status">{failed?<button type="button" onClick={()=>{setError('');for(const edit of failures.current.values())void save(edit);}}>Повторить сохранение ({failed})</button>:pending?'Сохраняем…':'Сохранено автоматически'}</span>}</div>
 {loginOpen&&<form className="results-login-form" onSubmit={login}><label htmlFor="results-password">Пароль организатора</label><div><input id="results-password" name="password" type="password" inputMode="numeric" autoComplete="current-password" required autoFocus/><Button disabled={loginBusy}>{loginBusy?'Входим…':'Войти'}</Button></div></form>}
 <div className="results-category" role="group" aria-label="Категория участников">{(['male','female'] as const).map(g=><button type="button" key={g} aria-pressed={gender===g} onClick={()=>{setGender(g);setEditingOrder(null);}}>{g==='male'?'Мужчины':'Женщины'} <span>{rows.filter(p=>p.gender===g).length}</span></button>)}</div>
 <div className="results-disciplines" role="group" aria-label="Дисциплина">{disciplines.map(d=><button type="button" key={d.id} aria-pressed={discipline===d.id} onClick={()=>{setDiscipline(d.id);setEditingOrder(null);}}>{d.title}</button>)}</div>
 <div className="discipline-result-title"><div><h2>{selected.title}</h2><p>{gender==='male'?'Мужчины':'Женщины'}{selected.id==='bench'?gender==='male'?' · собственный вес':' · половина собственного веса':''}</p></div><Button variant="outline" aria-label="Обновить результаты" onClick={()=>{setLoading(true);void load();}} disabled={loading}><RefreshCw size={16}/></Button></div>
 {error&&<p className="error" role="alert">{error}</p>}
 {loading&&rows.length===0?<div className="loading-state" role="status"><LoaderCircle className="spin"/>Загружаем результаты…</div>:<div className="discipline-table-panel"><table className="discipline-results-table" aria-label={`${selected.title}: ${gender==='male'?'мужчины':'женщины'}`}><colgroup><col className="place-column"/><col/><col className="value-column"/></colgroup><thead><tr><th scope="col">№</th><th scope="col">Фамилия и имя</th><th scope="col">Результат<small className="results-unit">{selected.unit}</small></th></tr></thead><tbody>{resultRows.map(({participant:p,value,rank})=><tr key={p.id}><td className="result-place">{rank??'—'}</td><td className="result-name">{[p.last_name,p.first_name].filter(Boolean).join(' ')}</td><td className="result-value">{editing?<ResultInput key={p.id+selected.field} field={selected.field} value={value} name={[p.last_name,p.first_name].join(' ')} onSave={value=>record(p.id,value)} onFocus={()=>setEditingOrder(resultRows.map(r=>r.participant.id))} onBlur={()=>setEditingOrder(null)}/>:value===null?'—':<>{value.toLocaleString('ru-RU',{maximumFractionDigits:2})} <small>{selected.unit}</small></>}</td></tr>)}</tbody></table>{resultRows.length===0&&!error&&<div className="empty-state"><p>В этой категории пока нет участников.</p></div>}</div>}
 <p className="table-hint">Все участники категории включены в каждую таблицу. — результат ещё не внесён. Одинаковые результаты — одинаковое место.</p>
 {unknown>0&&<p className="results-unknown">У {unknown} участников ещё не указана категория. Организатор может выбрать её в кабинете — после этого участники появятся во всех своих таблицах.</p>}
 </main><footer><div className="container footer-inner"><span>Репаблика фитнес · Олимпийская, 15</span><Link href="/">Страница кубка</Link></div></footer></div>;
}
