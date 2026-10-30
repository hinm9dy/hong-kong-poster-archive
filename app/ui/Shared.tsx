'use client';
import {useEffect,useRef} from 'react';
import {Menu,X} from 'lucide-react';
import type {Poster} from '../lib/types';
import {archivePath,apiUrl} from '../lib/urls';
import {useLanguage} from './Language';
export function Brand(){return <a href={archivePath()} className="brand" aria-label="HONG KONG POSTER ARCHIVE 2026"><span>HONG KONG<br/>POSTER ARCHIVE</span></a>;}
export function LanguageSwitch(){const {language,setLanguage}=useLanguage();return <div className="language-switch" aria-label={language==='zh'?'語言':'Language'}><button lang="zh-Hant" aria-pressed={language==='zh'} onClick={()=>setLanguage('zh')}>中</button><span aria-hidden="true">／</span><button lang="en" aria-pressed={language==='en'} onClick={()=>setLanguage('en')}>ENG</button></div>;}
export function Header({onSubmit,onMenu,menuOpen=false}:{onSubmit?:()=>void;onMenu?:()=>void;menuOpen?:boolean}){const {t}=useLanguage();return <header className="site-header"><Brand/>{onSubmit?<button className="header-submit" onClick={onSubmit}>{'{'} {t('提交','Submit')} {'}'}</button>:<a className="header-submit" href={archivePath()}>{'{'} {t('返回','Back')} {'}'}</a>}<div className="header-right"><LanguageSwitch/>{onMenu&&<button className="menu-toggle" aria-label={t(menuOpen?'關閉選單':'開啟選單',menuOpen?'Close menu':'Open menu')} aria-expanded={menuOpen} onClick={onMenu}>{menuOpen?<X aria-hidden="true"/>:<Menu aria-hidden="true" preserveAspectRatio="none"/>}</button>}</div></header>;}
export function Modal({children,onClose,label,wide=false}:{children:React.ReactNode;onClose:()=>void;label:string;wide?:boolean}){
 const ref=useRef<HTMLDialogElement>(null);const {t}=useLanguage();
 useEffect(()=>{const d=ref.current;d?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;d?.close();};},[]);
 return <dialog ref={ref} className={`modal ${wide?'wide':''}`} aria-label={label} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal-inner"><button className="close-button" onClick={onClose} aria-label={t('關閉','Close')}><X aria-hidden="true"/></button>{children}</div></dialog>;
}
export function PosterDetail({poster,onClose}:{poster:Poster;onClose:()=>void}){const {t}=useLanguage();return <Modal onClose={onClose} label={poster.title} wide><div className="poster-detail"><img src={poster.image} alt={poster.title}/><div><h2>{poster.title}</h2><dl><dt>{t('姓名','NAME')}</dt><dd>{poster.demo?t('示範作品','Demo artwork'):poster.designer}</dd><dt>{t('年份','YEAR')}</dt><dd>{poster.year}</dd>{poster.email&&<><dt>{t('電郵（只限管理員）','EMAIL (ADMIN ONLY)')}</dt><dd><a href={`mailto:${poster.email}`}>{poster.email}</a></dd></>}</dl></div></div></Modal>;}
export function Footer(){const {t}=useLanguage();return <footer><span>© 2026 HONG KONG POSTER ARCHIVE</span><a href={apiUrl('/admin')}>{t('管理','Admin')}</a></footer>;}
