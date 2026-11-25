import {build} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';

// Snapshot only the public projection. Never read admin APIs or private uploads.
const origin = 'https://poster-archive-2026-hink.candidgrove16.chatgpt.site';
const response = await fetch(`${origin}/api/posters`, {signal: AbortSignal.timeout(15000)});
if (!response.ok) throw new Error(`Public catalogue returned ${response.status}`);
const {posters} = await response.json();
await build({configFile:'github-pages/vite.config.ts'});
await mkdir('docs/posters',{recursive:true});
const extensions = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
const snapshot = [];
for (const {id,title,designer,year,image,catalog} of posters) {
  if (!/^[a-zA-Z0-9-]+$/.test(id)) throw new Error('Invalid public poster ID');
  const url = new URL(image,origin);
  if (url.origin !== origin) throw new Error('Unexpected poster image origin');
  const preview = await fetch(url,{redirect:'error',signal:AbortSignal.timeout(15000)});
  const extension = extensions[preview.headers.get('content-type')?.split(';')[0]];
  if (!preview.ok || !extension) throw new Error(`Public image unavailable: ${id}`);
  const file = `posters/${id}.${extension}`;
  await writeFile(`docs/${file}`,new Uint8Array(await preview.arrayBuffer()));
  snapshot.push({id,title,designer,year,catalog,image:`./${file}`});
}
await writeFile('docs/archive.json',JSON.stringify({posters:snapshot}));
await writeFile('docs/.nojekyll','');
console.log(`GitHub Pages ready in docs/ (${snapshot.length} published posters).`);
