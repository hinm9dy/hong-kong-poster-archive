'use client';
import {useEffect,useState} from 'react';
import {ArrowLeft,Search,Plus,Minus} from 'lucide-react';
import type {Poster} from '../lib/types';
import {archivePath,apiUrl,fallbackCatalogUrl} from '../lib/urls';
import {Header} from './Shared';
import {useLanguage,localizedError} from './Language';
import PosterWall from './PosterWall';
import Submission from './Submission';
const titles=['City Type','After Hours','Blue Hour','Every Letter Has a Place','Common Ground','North Point','Intervals','Up / Down','Resonance','Here / Now','Crossings','Next Stop'];
const demos:Poster[]=titles.map((title,i)=>({id:`demo-${i}`,title,designer:'HKPA',year:i%4===3?2025:2026,image:archivePath(`examples/${String(i+1).padStart(2,'0')}.svg`),demo:true}));
type View='wall'|'list'|'about';
export default function Archive(){
 const {language,t}=useLanguage();
 const [posters,setPosters]=useState<Poster[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[view,setView]=useState<View>('wall'),[menu,setMenu]=useState(false),[query,setQuery]=useState(''),[year,setYear]=useState('all'),[expanded,setExpanded]=useState<string|null>(null),[submission,setSubmission]=useState(false);
 async function load(){
  setLoading(true);setError('');
  try{
   let r:Response;
   try{r=await fetch(apiUrl('/api/posters'),{signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('Catalogue unavailable');}
   catch(e){const fallback=fallbackCatalogUrl();if(!fallback)throw e;r=await fetch(fallback);}
   const d=await r.json() as {error?:string;posters:Poster[]};if(!r.ok)throw new Error(d.error);
   setPosters(d.posters.map(p=>({...p,image:p.image.startsWith('/')?apiUrl(p.image):p.image})));
  }catch(e){setError(e instanceof Error?e.message:'暫時未能處理，請稍後再試。');}finally{setLoading(false);}
 }
 useEffect(()=>{void load();const sync=()=>{const v=new URLSearchParams(location.search).get('view');setView(v==='list'||v==='index'?'list':v==='about'?'about':'wall');};sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[]);
 useEffect(()=>{if(!menu)return;const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false);};window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc);},[menu]);
 function navigate(next:View){setView(next);setMenu(false);history.pushState(null,'',next==='wall'?archivePath():`${archivePath()}?view=${next}`);window.scrollTo(0,0);}
 const isDemo=!loading&&!error&&posters.length===0,collection=isDemo?demos:posters;
 const filtered=collection.filter(p=>(year==='all'||String(p.year)===year)&&`${p.title} ${p.designer}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 function openPoster(p:Poster){setExpanded(p.id);navigate('list');requestAnimationFrame(()=>document.getElementById(`poster-${p.id}`)?.scrollIntoView({block:'start',behavior:'smooth'}));}
 const number=(p:Poster)=>String(collection.findIndex(x=>x.id===p.id)+1).padStart(2,'0');
 return <div className={`archive-app view-${view}`}><a className="skip-link" href="#main">{t('跳至內容','Skip to content')}</a><Header onSubmit={()=>{setMenu(false);setSubmission(true);}} onMenu={()=>setMenu(v=>!v)} menuOpen={menu}/>
 {menu&&<div className="menu-backdrop" onClick={()=>setMenu(false)}><nav className="site-menu" aria-label={t('選單','Menu')} onClick={e=>e.stopPropagation()}><button onClick={()=>navigate(view==='wall'?'list':'wall')}>{view==='wall'?t('列表','List'):t('探索','Explore')}</button><button onClick={()=>navigate('about')}>{t('關於','About')}</button><a href={apiUrl('/admin')}>{t('管理後台','Admin')}</a><div className="menu-filters"><label><Search aria-hidden="true"/><input placeholder={t('搜尋','Search')} aria-label={t('搜尋作品或姓名','Search posters or names')} value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label={t('年份','Year')} value={year} onChange={e=>setYear(e.target.value)}><option value="all">{t('所有年份','All years')}</option>{Array.from(new Set(collection.map(p=>p.year))).sort((a,b)=>b-a).map(y=><option key={y}>{y}</option>)}</select><button className="apply-search" onClick={()=>{setMenu(false);if(view==='about')navigate('wall');}}>{t('查看','View')}</button></div></nav></div>}
 <main id="main" inert={menu}>{view==='about'?<section className="about"><h1>{t('關於','About')}</h1><p>{t('HONG KONG POSTER ARCHIVE 收集香港海報設計。作品經團隊審核及發佈後公開展示，版權屬原創作者。','HONG KONG POSTER ARCHIVE collects poster design from Hong Kong. Submissions are reviewed before publication. Copyright remains with the original creators.')}</p></section>:loading?<div className="empty" role="status">{t('載入中…','Loading…')}</div>:error?<div className="empty" role="alert"><p>{localizedError(error,language)}</p><button onClick={()=>void load()}>{t('重試','Retry')}</button></div>:!filtered.length?<div className="empty"><p>{t('沒有符合條件的作品。','No matching posters.')}</p><button onClick={()=>{setQuery('');setYear('all');}}>{t('清除篩選','Clear filters')}</button></div>:view==='wall'?<PosterWall posters={filtered} onSelect={openPoster}/>:<section className="poster-list" aria-label={t('作品列表','Poster list')}>{filtered.map(p=><article id={`poster-${p.id}`} className={`poster-row ${expanded===p.id?'expanded':''}`} key={p.id}><button className="poster-row-toggle" aria-expanded={expanded===p.id} aria-controls={`details-${p.id}`} onClick={()=>setExpanded(expanded===p.id?null:p.id)}><h2>{t('海報','POSTER')} {number(p)}</h2>{expanded!==p.id&&<div className="row-metadata"><div><span>{t('姓名','NAME')}</span><p>{p.demo?t('示範作品','Demo artwork'):p.designer}</p></div><div><span>{t('年份','YEAR')}</span><p>{p.year}</p></div></div>}<span className="row-disclosure">{expanded===p.id?<Minus/>:<Plus/>}</span></button>{expanded===p.id&&<div id={`details-${p.id}`} className="poster-expanded"><img src={p.image} alt={p.title}/><div className="expanded-metadata"><div><span>{t('姓名','NAME')}</span><p>{p.demo?t('示範作品','Demo artwork'):p.designer}</p></div><div><span>{t('年份','YEAR')}</span><p>{p.year}</p></div></div></div>}</article>)}</section>}</main>
 {!loading&&!error&&isDemo&&view!=='about'&&<span className="demo-note">{t('示範作品','Demo artworks')}</span>}
 {view==='list'&&<button className="return-wall" onClick={()=>navigate('wall')} aria-label={t('返回探索','Back to explore')}><ArrowLeft size={18}/></button>}
 {submission&&<Submission onClose={()=>setSubmission(false)}/>}</div>;
}
