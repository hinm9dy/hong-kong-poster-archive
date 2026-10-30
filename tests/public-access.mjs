import assert from 'node:assert/strict';
import {publicOriginAllowed,publicResponse,publicPreflight} from '../app/lib/public-access.ts';
const api='https://archive.example/api/submissions';
const request=(origin,headers={})=>new Request(api,{headers:{...(origin?{Origin:origin}:{}),...headers}});
assert.equal(publicOriginAllowed(request('https://hinm9dy.github.io')),true);
assert.equal(publicOriginAllowed(request('https://archive.example')),true);
for(const origin of [null,'null','https://attacker.example','https://hinm9dy.github.io.attacker.example']){
  assert.equal(publicOriginAllowed(request(origin)),false);
  assert.equal(publicResponse(request(origin),new Response('{}')).headers.has('Access-Control-Allow-Origin'),false);
  assert.equal(publicPreflight(request(origin),'POST').status,403);
}
const allowed=publicResponse(request('https://hinm9dy.github.io'),new Response('{}'));
assert.equal(allowed.headers.get('Access-Control-Allow-Origin'),'https://hinm9dy.github.io');
assert.equal(allowed.headers.has('Access-Control-Allow-Credentials'),false);
assert.equal(publicPreflight(request('https://hinm9dy.github.io',{'Access-Control-Request-Method':'POST'}),'POST').status,204);
assert.equal(publicPreflight(request('https://hinm9dy.github.io',{'Access-Control-Request-Method':'DELETE'}),'POST').status,403);
assert.equal(publicPreflight(request('https://hinm9dy.github.io',{'Access-Control-Request-Headers':'Authorization'}),'POST').status,403);
console.log('Public frontend origin and preflight checks passed.');
