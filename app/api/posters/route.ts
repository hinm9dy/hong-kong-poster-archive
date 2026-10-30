import {database,json,errorResponse} from '../../lib/server';
import {publicResponse,publicPreflight} from '../../lib/public-access';
export function OPTIONS(request:Request){return publicPreflight(request,'GET');}
export async function GET(request:Request){try{
 const {results}=await database().prepare("SELECT id,title,designer,year FROM posters WHERE status='published' ORDER BY year DESC,published_at DESC").all();
 return publicResponse(request,json({posters:results.map(p=>({...p,image:`/api/images/${p.id}`}))}));
}catch(e){return publicResponse(request,errorResponse(e));}}
