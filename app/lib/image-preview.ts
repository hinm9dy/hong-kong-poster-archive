// HTMLImageElement also works on phones without createImageBitmap.
export async function makePreview(file:File):Promise<Blob>{
 const url=URL.createObjectURL(file),image=new Image();
 try{
  await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('請上載有效 JPG、PNG 或 WebP 圖片。'));image.src=url;});
  const ratio=Math.min(1,1800/image.naturalWidth,1800/image.naturalHeight);
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('未能處理圖片，請轉成 JPG 再試。');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
  for(const quality of [.85,.7,.5]){const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(blob&&blob.size<=1_000_000)return blob;}
  throw new Error('未能處理圖片，請轉成 JPG 再試。');
 }finally{URL.revokeObjectURL(url);}
}
