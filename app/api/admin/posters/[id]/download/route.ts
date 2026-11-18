import {adminUser,database,bucket,json,errorResponse} from '../../../../../lib/server';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{
 if(!await adminUser())return json({error:'只限管理員使用。'},403);
 const {id}=await params;
 const row=await database().prepare("SELECT title,object_key,mime FROM posters WHERE id=? AND deleted_at IS NULL").bind(id).first<{title:string;object_key:string;mime:string}>();
 if(!row)return json({error:'找不到作品。'},404);
 const original=await bucket().get(row.object_key);if(!original)return json({error:'找不到圖片。'},404);
 const ext=row.mime==='image/png'?'png':row.mime==='image/webp'?'webp':'jpg';
 const name=(row.title.replace(/[\\/\r\n]/g,'-').slice(0,100)||'poster')+'.'+ext;
 return new Response(original.body,{headers:{'Content-Type':row.mime,'Content-Length':String(original.size),'Content-Disposition':`attachment; filename="poster.${ext}"; filename*=UTF-8''${encodeURIComponent(name)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}catch(e){return errorResponse(e);}}
