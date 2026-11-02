export type Status = 'pending' | 'selected' | 'published' | 'rejected';
export type Poster = { id:string; title:string; designer:string; year:number; image:string; status?:Status; email?:string; createdAt?:string; size?:number; demo?:boolean };
export const STATUS_LABEL:Record<Status,string> = {pending:'待審核',selected:'已入選',published:'已發佈',rejected:'未入選'};
export const MAX_FILE_SIZE = 5_000_000;
