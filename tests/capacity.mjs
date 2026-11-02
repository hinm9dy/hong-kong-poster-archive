import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5173';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))throw new Error('Capacity fixtures may only be created in local preview.');
const run=Date.now().toString(36),ids=[];
// A valid PNG with a padded ancillary text chunk exercises the exact byte limit.
const base=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
const payload=Buffer.alloc(5_000_000-base.length-12,120);payload.write('Comment\0');
const chunk=Buffer.concat([Buffer.from('tEXt'),payload]);let crc=0xffffffff;
for(const byte of chunk){crc^=byte;for(let b=0;b<8;b++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
const length=Buffer.alloc(4),checksum=Buffer.alloc(4);length.writeUInt32BE(payload.length);checksum.writeUInt32BE((crc^0xffffffff)>>>0);
const png=Buffer.concat([base.subarray(0,-12),length,chunk,checksum,base.subarray(-12)]);assert.equal(png.length,5_000_000);
await mkdir('outputs',{recursive:true});
const login=await fetch(origin+'/signin-with-chatgpt?return_to=/admin',{redirect:'manual'});
const cookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');assert.ok(cookie);
const auth={Cookie:cookie,Origin:origin,'Content-Type':'application/json'};
const catalogue=async()=>{const r=await fetch(origin+'/api/posters');assert.equal(r.status,200);return (await r.json()).posters;};
const before=(await catalogue()).length;
for(let i=0;i<101;i++){
 const f=new FormData();f.set('title',`Capacity ${run} — ${String(i+1).padStart(3,'0')}`);f.set('designer','Local capacity test');f.set('email',`capacity-${run}-${i}@example.test`);f.set('year','2026');f.set('consent','yes');f.set('file',new Blob([png],{type:'image/png'}),'capacity.png');
 const r=await fetch(origin+'/api/submissions',{method:'POST',headers:{Origin:origin,'CF-Connecting-IP':`198.51.100.${i+1}`},body:f});const d=await r.json();assert.equal(r.status,201,JSON.stringify(d));assert.equal(d.status,'pending');ids.push(d.id);
 if((i+1)%20===0)console.log(`Stored ${i+1} full-size posters`);
}
assert.equal((await catalogue()).length,before,'Pending uploads must not create public placeholders');
let r=await fetch(origin+'/api/admin/posters',{headers:auth});assert.equal(r.status,200);const stored=(await r.json()).posters.filter(p=>ids.includes(p.id));assert.equal(stored.length,101);assert.equal(stored.reduce((n,p)=>n+p.size,0),505_000_000);
console.log('PASS 101 unique records and 505 MB stored; pending posters stay private');
for(let i=0;i<ids.length;i++){
 for(const [status,previousStatus] of [['selected','pending'],['published','selected']]){const r=await fetch(origin+'/api/admin/posters/'+ids[i],{method:'PATCH',headers:auth,body:JSON.stringify({status,previousStatus})});assert.equal(r.status,200);}
 if([1,12,13,100,101].includes(i+1)){const listing=await catalogue();assert.equal(listing.length,before+i+1);assert.equal(new Set(listing.map(p=>p.id)).size,listing.length);assert.ok(listing.every(p=>!('email' in p)));console.log(`PASS ${i+1} published posters = exactly ${i+1} added public entries`);}
 const image=await fetch(origin+'/api/images/'+ids[i]);assert.equal(image.status,200);const saved=Buffer.from(await image.arrayBuffer());assert.ok(saved.equals(png),'Stored image must match original bytes');
}
await writeFile('outputs/capacity-result.json',JSON.stringify({run,ids,posterCount:101,totalBytes:505_000_000,passed:true}));
console.log('PASS all 101 originals retrieved byte-for-byte; 505 MB; moderation and email privacy verified');
