import {adminUser,database,json,errorResponse} from '../../../lib/server';
export async function GET(){try{
 if(!await adminUser())return json({error:'只限管理員使用。'},403);
 const {results}=await database().prepare('SELECT id,title,designer,year,email,size,status,created_at AS createdAt FROM posters ORDER BY created_at DESC').all();
 return json({posters:results.map(p=>({...p,image:`/api/images/${p.id}`}))});
}catch(e){return errorResponse(e);}}
