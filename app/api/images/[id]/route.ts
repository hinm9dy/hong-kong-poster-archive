import {database,bucket,adminUser,json,errorResponse} from '../../../lib/server';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params;
 const row=await database().prepare('SELECT object_key,mime,status FROM posters WHERE id=?').bind(id).first<{object_key:string;mime:string;status:string}>();
 if(!row||(row.status!=='published'&&!await adminUser()))return json({error:'找不到圖片。'},404);
 const image=await bucket().get(row.object_key);if(!image)return json({error:'找不到圖片。'},404);
 return new Response(image.body,{headers:{'Content-Type':row.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
}catch(e){return errorResponse(e);}}
