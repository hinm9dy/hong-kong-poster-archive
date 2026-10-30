import type {Metadata} from 'next';
import './globals.css';
import {LanguageProvider} from './ui/Language';
export const metadata:Metadata={title:'HONG KONG POSTER ARCHIVE 2026',description:'用海報，記錄香港。A living collection of poster design from Hong Kong.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant-HK"><body><LanguageProvider>{children}</LanguageProvider></body></html>;}
