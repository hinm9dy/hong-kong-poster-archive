import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../chatgpt-auth';
export function database(){if(!env.DB)throw new Error('Database unavailable');return env.DB;}
export function bucket(){if(!env.BUCKET)throw new Error('Storage unavailable');return env.BUCKET;}
export async function adminUser(){
 const user=await getChatGPTUser();
 const allowed=(env.ARCHIVE_ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
 return user&&allowed.includes(user.email.toLowerCase())?user:null;
}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin;}
export function errorResponse(error:unknown){console.error('Archive request failed',error instanceof Error?error.message:'Unknown error');return json({error:'暫時未能處理，請稍後再試。'},503);}
export function imageType(bytes:Uint8Array){
 if(bytes.length<12)return null;
 if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return 'image/jpeg';
 if([137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x))return 'image/png';
 if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';
 return null;
}
export async function boundedBody(request:Request,limit:number){
 if(Number(request.headers.get('content-length'))>limit)throw new Error('TOO_LARGE');
 const reader=request.body?.getReader();if(!reader)throw new Error('EMPTY_BODY');
 const chunks:Uint8Array[]=[];let length=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>limit){await reader.cancel();throw new Error('TOO_LARGE');}chunks.push(value);}}finally{reader.releaseLock();}
 const all=new Uint8Array(length);let offset=0;for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.length;}return all;
}
