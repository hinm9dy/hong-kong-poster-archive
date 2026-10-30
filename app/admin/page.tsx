import AccessDenied from '../ui/AccessDenied';
import {requireChatGPTUser} from '../chatgpt-auth';
import {adminUser} from '../lib/server';
import Admin from '../ui/Admin';
export const dynamic='force-dynamic';
export default async function AdminPage(){await requireChatGPTUser('/admin');const user=await adminUser();if(!user)return <AccessDenied/>;return <Admin name={user.displayName}/>;}
