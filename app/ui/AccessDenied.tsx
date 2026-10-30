'use client';
import {Header} from './Shared';
import {useLanguage} from './Language';
export default function AccessDenied(){const {t}=useLanguage();return <><Header/><main className="access-denied"><h1>{t('只限管理員使用','Administrator access required')}</h1><p>{t('這個帳戶未獲授權。','This account is not authorized.')}</p><a href="/">{t('返回首頁','Back to home')}</a><a href="/signout-with-chatgpt?return_to=/admin" target="_top">{t('切換帳戶','Switch account')}</a></main></>;}
