import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5173';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))throw new Error('This test creates fixtures and is restricted to local preview.');
const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64'));
let checks=0;function eq(actual,expected,label){assert.deepEqual(actual,expected,label);checks++;console.log('PASS',label);}
function form(bytes=png,type='image/png'){const f=new FormData();f.set('title','QA — Local workflow fixture');f.set('designer','QA Test');f.set('email','archive-qa@example.test');f.set('year','2026');f.set('consent','yes');f.set('file',new Blob([bytes],{type}),'fixture.png');return f;}
async function upload(f=form(),extra={}){return fetch(origin+'/api/submissions',{method:'POST',headers:{Origin:origin,...extra},body:f});}
let r=await fetch(origin+'/api/admin/posters');eq(r.status,403,'Anonymous visitors cannot read admin email list');
r=await upload(form(),{Origin:'https://untrusted.example'});eq(r.status,403,'Cross-origin uploads rejected');
r=await upload(form(new Uint8Array(5_000_001)));eq(r.status,400,'Files above 5MB rejected');
r=await upload(form(new TextEncoder().encode('not an actual image')));eq(r.status,400,'Spoofed image files rejected');
let bad=form();bad.set('email','not-email');r=await upload(bad);eq(r.status,400,'Invalid email rejected');
bad=form();bad.delete('consent');r=await upload(bad);eq(r.status,400,'Missing contributor consent rejected');
const maximum=new Uint8Array(5_000_000);maximum.set(png);
r=await upload(form(maximum));const created=await r.json();eq(r.status,201,'Valid poster at exact 5MB limit persisted');const id=created.id;
eq(created.status,'pending','New submissions always start pending');
r=await fetch(origin+'/api/posters');let listing=await r.json();eq(listing.posters.some(p=>p.id===id),false,'Pending poster excluded from public listing');
r=await fetch(origin+'/api/images/'+id);eq(r.status,404,'Pending original image is private');
r=await fetch(origin+'/signin-with-chatgpt?return_to=/admin',{redirect:'manual'});const cookie=r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');assert.ok(cookie,'Local mock login cookie');
const auth={Cookie:cookie,Origin:origin,'Content-Type':'application/json'};
r=await fetch(origin+'/api/admin/posters',{headers:auth});let admin=await r.json();eq(r.status,200,'Authorized curator can read submissions');eq(admin.posters.find(p=>p.id===id).email,'archive-qa@example.test','Email available to curator');
const patch=(status,previousStatus,headers=auth)=>fetch(origin+'/api/admin/posters/'+id,{method:'PATCH',headers,body:JSON.stringify({status,previousStatus})});
r=await patch('selected','pending',{Origin:origin,'Content-Type':'application/json'});eq(r.status,403,'Anonymous visitors cannot curate');
r=await patch('published','pending');eq(r.status,400,'Publication requires selection first');
r=await patch('selected','pending');eq(r.status,200,'Curator can select a poster');
r=await fetch(origin+'/api/posters');listing=await r.json();eq(listing.posters.some(p=>p.id===id),false,'Selected draft remains private until publication');
r=await patch('published','selected');eq(r.status,200,'Curator can publish a selected poster');
r=await fetch(origin+'/api/posters');listing=await r.json();const publicPoster=listing.posters.find(p=>p.id===id);eq(Boolean(publicPoster),true,'Published poster appears in archive');eq(Object.keys(publicPoster).sort(),['designer','id','image','title','year'],'Public API excludes email and private fields');
r=await fetch(origin+'/api/images/'+id);eq(r.status,200,'Published image is available');eq(r.headers.get('content-type'),'image/png','Image served with correct MIME');
r=await patch('published','selected');eq(r.status,409,'Stale moderation action does not overwrite state');
r=await patch('selected','published');eq(r.status,200,'Curator can unpublish without deleting');
r=await fetch(origin+'/api/images/'+id);eq(r.status,404,'Unpublished image becomes private immediately');
r=await patch('rejected','selected');eq(r.status,200,'Curator can move selected draft to not selected');
r=await patch('pending','rejected');eq(r.status,200,'Not selected decision is reversible');
console.log(`\n${checks} integration checks passed. Fixture ID: ${id}`);
