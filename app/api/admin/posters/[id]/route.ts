import {adminUser,database,json,sameOrigin,errorResponse} from '../../../../lib/server';
const transitions:Record<string,string[]>={pending:['selected','rejected'],selected:['published','pending','rejected'],published:['selected'],rejected:['pending','selected']};
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{
 if(!sameOrigin(request)||!await adminUser())return json({error:'只限管理員使用。'},403);
 let input:{status?:string;previousStatus?:string};try{input=await request.json();}catch{return json({error:'無效資料。'},400);}
 const {status,previousStatus}=input;
 if(!status||!previousStatus||!transitions[previousStatus]?.includes(status))return json({error:'無效操作；作品須先入選，再發佈。'},400);
 const {id}=await params,now=new Date().toISOString();
 const row=await database().prepare('UPDATE posters SET status=?,updated_at=?,published_at=? WHERE id=? AND status=? RETURNING id').bind(status,now,status==='published'?now:null,id,previousStatus).first();
 if(!row)return json({error:'作品狀態已改變，請重新載入。'},409);
 return json({id,status});
}catch(e){return errorResponse(e);}}
