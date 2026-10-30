import {build} from 'vite';
import {writeFile} from 'node:fs/promises';

// Snapshot only the public projection. Never read admin APIs or private uploads.
const origin = 'https://poster-archive-2026-hink.candidgrove16.chatgpt.site';
const response = await fetch(`${origin}/api/posters`, {signal: AbortSignal.timeout(15000)});
if (!response.ok) throw new Error(`Public catalogue returned ${response.status}`);
const {posters} = await response.json();
const snapshot = posters.map(({id,title,designer,year,image}) => ({
  id,title,designer,year,image:new URL(image,origin).href,
}));
await build({configFile:'github-pages/vite.config.ts'});
await writeFile('docs/archive.json',JSON.stringify({posters:snapshot}));
await writeFile('docs/.nojekyll','');
console.log(`GitHub Pages ready in docs/ (${snapshot.length} published posters).`);
