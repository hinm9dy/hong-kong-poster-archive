'use client';
import {createContext,useContext,useEffect,useState} from 'react';
export type Language='zh'|'en';
const LanguageContext=createContext<{language:Language;setLanguage:(l:Language)=>void;t:(zh:string,en:string)=>string}>({language:'zh',setLanguage:()=>{},t:zh=>zh});
export function LanguageProvider({children}:{children:React.ReactNode}){
 const [language,setLanguage]=useState<Language>('zh');
 useEffect(()=>{const saved=new URLSearchParams(location.search).get('lang')||localStorage.getItem('hkpa-language');if(saved==='zh'||saved==='en')setLanguage(saved);},[]);
 useEffect(()=>{document.documentElement.lang=language==='zh'?'zh-Hant-HK':'en';},[language]);
 function change(l:Language){setLanguage(l);localStorage.setItem('hkpa-language',l);}
 return <LanguageContext.Provider value={{language,setLanguage:change,t:(zh,en)=>language==='zh'?zh:en}}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){return useContext(LanguageContext);}
const messages:Record<string,string>={
 '請上載 JPG、PNG 或 WebP；HEIC 請先轉成 JPG。':'Upload JPG, PNG or WebP. Convert HEIC to JPG first.',
 '未能處理圖片，請轉成 JPG 再試。':'Unable to prepare this image. Try exporting it as JPG.',
 '連線未能完成，請重新開啟投稿頁再試。':'Connection failed. Reopen the submission page and try again.',
 '暫時未能處理，請稍後再試。':'Something went wrong. Please try again.',
 '無效來源，請重新載入頁面。':'Please reload the page and try again.',
 '請用投稿表格提交作品。':'Please use the submission form.',
 '請填寫作品名稱及設計師姓名。':'Enter a poster title and your name.',
 '請輸入有效 email。':'Enter a valid email address.',
 '請輸入有效製作年份（1900 至今年）。':'Enter a year between 1900 and the current year.',
 '請確認你有權提交作品及同意入選後展示。':'Confirm your right to submit and consent to display the work.',
 '未能接受此投稿。':'This submission could not be accepted.',
 '海報檔案必須為 5MB 或以下。':'The poster file must be 5MB or smaller.',
 '請上載有效 JPG、PNG 或 WebP 圖片。':'Upload a valid JPG, PNG or WebP image.',
 '本小時投稿次數已達上限，請稍後再試。':'The hourly submission limit has been reached. Try again later.',
 '只限管理員使用。':'Administrator access is required.',
 '無效資料。':'Invalid request.',
 '無效操作；作品須先入選，再發佈。':'Select the poster before publishing it.',
 '作品狀態已改變，請重新載入。':'This poster has changed. Please refresh.',
};
export function localizedError(value:string|undefined,language:Language){if(language==='en')return messages[value||'']||'Something went wrong. Please try again.';return value||'暫時未能處理，請稍後再試。';}
