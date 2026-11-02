import {adminUser,database,bucket,boundedBody,imageType,json,errorResponse,sameOrigin} from '../../../../../lib/server';
export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){try{
 if(!await adminUser())return json({error:'只限管理員使用。'},403);
 if(!sameOrigin(request))return json({error:'無效來源，請重新載入頁面。'},403);
 const {id}=await params;
 const row=await database().prepare('SELECT object_key FROM posters WHERE id=?').bind(id).first<{object_key:string}>();
 if(!row)return json({error:'找不到圖片。'},404);
 const bytes=await boundedBody(request,1_000_000);if(imageType(bytes)!=='image/jpeg')return json({error:'無效資料。'},400);
 await bucket().put(`${row.object_key}/preview`,bytes,{httpMetadata:{contentType:'image/jpeg'}});
 return json({ok:true});
}catch(e){if(e instanceof Error&&e.message==='TOO_LARGE')return json({error:'無效資料。'},413);return errorResponse(e);}}
