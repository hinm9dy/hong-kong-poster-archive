import {adminUser,database,json,sameOrigin,errorResponse} from '../../../../../lib/server';
import {validateCatalog} from '../../../../../lib/catalog';
export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){try{
 if(!sameOrigin(request)||!await adminUser())return json({error:'只限管理員使用。'},403);
 let catalog;try{catalog=validateCatalog(await request.json());}catch{return json({error:'無效資料。'},400);}
 const {id}=await params;
 const row=await database().prepare('UPDATE posters SET catalog=?,updated_at=? WHERE id=? AND deleted_at IS NULL RETURNING id').bind(JSON.stringify(catalog),new Date().toISOString(),id).first();
 if(!row)return json({error:'找不到作品。'},404);
 return json({catalog});
}catch(e){return errorResponse(e);}}
