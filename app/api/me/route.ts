import {adminUser,json,errorResponse} from '../../lib/server';
export async function GET(){try{return json({admin:Boolean(await adminUser())});}catch(e){return errorResponse(e);}}
