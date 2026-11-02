import {database,bucket,json,errorResponse,imageType,boundedBody} from '../../lib/server';
import {publicOriginAllowed,publicResponse,publicPreflight} from '../../lib/public-access';
import {MAX_FILE_SIZE} from '../../lib/types';
export function OPTIONS(request:Request){return publicPreflight(request,'POST');}
export async function POST(request:Request){
 if(!publicOriginAllowed(request))return json({error:'無效來源，請重新載入頁面。'},403);
 return publicResponse(request,await submit(request));
}
async function submit(request:Request){
 try{
  const raw=await boundedBody(request,MAX_FILE_SIZE+1_000_000+65536);
  let form:FormData;try{form=await new Response(raw,{headers:{'content-type':request.headers.get('content-type')||''}}).formData();}catch{return json({error:'請用投稿表格提交作品。'},400);}
  const field=(key:string)=>typeof form.get(key)==='string'?String(form.get(key)).trim():'';
  const title=field('title'),designer=field('designer'),email=field('email').toLowerCase(),year=Number(field('year'));
  if(!title||title.length>150||!designer||designer.length>100)return json({error:'請填寫作品名稱及設計師姓名。'},400);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return json({error:'請輸入有效 email。'},400);
  if(!Number.isInteger(year)||year<1900||year>new Date().getUTCFullYear())return json({error:'請輸入有效製作年份（1900 至今年）。'},400);
  if(field('consent')!=='yes')return json({error:'請確認你有權提交作品及同意入選後展示。'},400);
  if(field('website'))return json({error:'未能接受此投稿。'},400);
  const file=form.get('file');
  if(!file||typeof file==='string'||!file.size||file.size>MAX_FILE_SIZE)return json({error:'海報檔案必須為 5MB 或以下。'},400);
  const bytes=new Uint8Array(await file.arrayBuffer()),mime=imageType(bytes);
  if(!mime||mime!==file.type)return json({error:'請上載有效 JPG、PNG 或 WebP 圖片。'},400);
  const preview=form.get('preview');let previewBytes:Uint8Array|undefined;
  if(preview&&typeof preview!=='string'){if(!preview.size||preview.size>1_000_000)return json({error:'無效資料。'},400);previewBytes=new Uint8Array(await preview.arrayBuffer());if(imageType(previewBytes)!=='image/jpeg')return json({error:'無效資料。'},400);}
  const now=new Date(),hour=Math.floor(now.getTime()/3600000),identity=request.headers.get('cf-connecting-ip')||email;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${hour}:${identity}`));
  const rateKey=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const rate=await database().prepare('INSERT INTO upload_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(rateKey,(hour+1)*3600000).first<{count:number}>();
  if(rate&&rate.count>20)return json({error:'本小時投稿次數已達上限，請稍後再試。'},429);
  await database().prepare('DELETE FROM upload_limits WHERE expires_at < ?').bind(now.getTime()-86400000).run();
  const id=crypto.randomUUID(),objectKey=`posters/${id}`,timestamp=now.toISOString();
  await bucket().put(objectKey,bytes,{httpMetadata:{contentType:mime}});
  try{if(previewBytes)await bucket().put(`${objectKey}/preview`,previewBytes,{httpMetadata:{contentType:'image/jpeg'}});await database().prepare("INSERT INTO posters (id,title,designer,year,email,object_key,mime,size,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'pending',?,?)").bind(id,title,designer,year,email,objectKey,mime,file.size,timestamp,timestamp).run();}catch(e){await bucket().delete([objectKey,`${objectKey}/preview`]);throw e;}
  return json({id,status:'pending'},201);
 }catch(e){if(e instanceof Error&&e.message==='TOO_LARGE')return json({error:'海報檔案必須為 5MB 或以下。'},413);return errorResponse(e);}
}
