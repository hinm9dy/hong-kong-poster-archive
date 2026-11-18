import {readCatalog} from '../../../lib/catalog';
import {adminUser,database,json,errorResponse} from '../../../lib/server';
export async function GET(){try{
 if(!await adminUser())return json({error:'只限管理員使用。'},403);
 const {results}=await database().prepare('SELECT id,title,designer,year,catalog,email,size,status,created_at AS createdAt FROM posters ORDER BY created_at DESC').all();
 return json({posters:results.map(p=>({...p,catalog:readCatalog(p.catalog),image:`/api/images/${p.id}`}))});
}catch(e){return errorResponse(e);}}
