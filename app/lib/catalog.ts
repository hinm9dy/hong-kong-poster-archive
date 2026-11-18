export const TOPICS=[['music','音樂','Music'],['art','藝術','Art'],['community','社區','Community'],['lifestyle','生活','Lifestyle'],['subculture','次文化','Subculture']] as const;
export const SCRIPTS=[['chinese','中文','Chinese'],['english','英文','English'],['japanese','日文','Japanese'],['korean','韓文','Korean'],['thai','泰文','Thai'],['vietnamese','越南文','Vietnamese'],['other','其他','Other']] as const;
export type Catalog={date?:string;media?:string;typography?:string;topics?:string[];languages?:string[];description?:string;rights?:string};
export function validateCatalog(value:unknown):Catalog{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('無效資料。');
 const v=value as Record<string,unknown>,out:Catalog={};
 for(const [key,max] of [['date',10],['media',150],['typography',200],['description',3000],['rights',500]] as const){if(v[key]!==undefined){if(typeof v[key]!=='string'||v[key].length>max)throw new Error('無效資料。');out[key]=v[key].trim();}}
 if(out.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(out.date)||Number.isNaN(Date.parse(out.date))||new Date(out.date).toISOString().slice(0,10)!==out.date))throw new Error('無效資料。');
 for(const [key,choices] of [['topics',TOPICS],['languages',SCRIPTS]] as const){const list=v[key]??[];if(!Array.isArray(list)||list.length>choices.length||list.some(x=>typeof x!=='string'||!choices.some(c=>c[0]===x)))throw new Error('無效資料。');out[key]=[...new Set(list)] as string[];}
 return out;
}
export function catalogFromForm(form:FormData):Catalog{return validateCatalog(Object.fromEntries([...['date','media','typography','description','rights'].map(key=>[key,String(form.get(key)||'')]),['topics',form.getAll('topics')],['languages',form.getAll('languages')]]));}
export function readCatalog(raw:unknown):Catalog{try{return validateCatalog(typeof raw==='string'?JSON.parse(raw):raw||{});}catch{return {};}}
export function matchesCatalog(catalog:Catalog|undefined,topic:string,language:string){return (topic==='all'||!!catalog?.topics?.includes(topic))&&(language==='all'||!!catalog?.languages?.includes(language));}
