'use client';
import {useEffect,useRef,useState} from 'react';
import {Minus,Plus,RotateCcw} from 'lucide-react';
import type {Poster} from '../lib/types';
import {useLanguage} from './Language';
// Authored, irregular positions taken from the reference's spatial rhythm.
// Each published poster has one tile; the world grows as the collection grows.
const composition=[
 [.18,.37,.19,15,1.05],[.16,.48,.13,9,.77],[.42,.46,.105,3,.86],[.81,.36,.23,-16,1.02],
 [.61,.53,.10,-5,.8],[.11,.67,.145,8,.94],[.74,.66,.105,-8,.76],[1.01,.65,.16,-13,.91],
 [.31,.77,.085,5,.76],[.60,.80,.09,-3,.8],[.84,.80,.12,-9,.84],[.26,.89,.15,6,.94],
 [.55,.94,.13,-2,.9],[.78,.85,.12,-7,.81],[-.07,.56,.14,13,.9],[1.18,.30,.13,11,.88],
 [1.31,.82,.17,-12,.95],[.05,1.23,.11,-7,.8],[.93,1.33,.16,10,.94],[.43,1.36,.12,-4,.85],
 [.16,-.14,.13,-12,.82],[.58,-.19,.16,10,.9],[1.17,1.24,.12,5,.85],[-.18,.98,.15,-12,.94],
];
const wrap=(n:number,size:number,min:number)=>((n-min)%size+size)%size+min;
export default function PosterWall({posters,onSelect}:{posters:Poster[];onSelect:(p:Poster)=>void}){
 const {t}=useLanguage();
 const stage=useRef<HTMLDivElement>(null),tiles=useRef<(HTMLButtonElement|null)[]>([]);
 const motion=useRef({x:0,y:0,vx:0,vy:0,zoom:1,drag:false,lastX:0,lastY:0,startX:0,startY:0,moved:false});
 const [dragging,setDragging]=useState(false),[zoom,setZoom]=useState(1);
 const identity=posters.map(p=>p.id).join('|');
 useEffect(()=>{Object.assign(motion.current,{x:0,y:0,vx:0,vy:0});},[identity]);
 const items=posters;
 useEffect(()=>{
  let frame=0,active=true,previous='';let bounds={width:0,height:0};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resize=new ResizeObserver(entries=>{bounds={width:entries[0].contentRect.width,height:entries[0].contentRect.height};previous='';});if(stage.current)resize.observe(stage.current);
  const loop=()=>{
   if(!active)return;const {width:w,height:h}=bounds,m=motion.current;
   if(!m.drag&&!reduced){m.x+=m.vx;m.y+=m.vy;m.vx*=.925;m.vy*=.925;if(Math.abs(m.vx)<.03)m.vx=0;if(Math.abs(m.vy)<.03)m.vy=0;}
   const signature=[w,h,m.x,m.y,m.zoom].join(':');
   if(signature!==previous&&w&&h){previous=signature;
    const extra=Math.max(1,Math.ceil(items.length/composition.length)),columns=Math.ceil(Math.sqrt(extra)),rows=Math.ceil(extra/columns),worldW=w*1.65*columns,worldH=h*1.7*rows;
    tiles.current.forEach((tile,i)=>{if(!tile)return;const seed=composition[i%composition.length];const page=Math.floor(i/composition.length);
     let x=seed[0]*w+(page%columns)*w*1.65-m.x,y=seed[1]*h+Math.floor(page/columns)*h*1.7-m.y;
     if(items.length<=3){x=w/2+(i-(items.length-1)/2)*Math.min(260,w*.3)-m.x;y=h*.56-m.y;}
     else{x=wrap(x,worldW,-.25*w);y=wrap(y,worldH,-.23*h);}
     const visible=x>-.3*w&&x<1.3*w&&y>-.3*h&&y<1.3*h;
     tile.style.visibility=visible?'visible':'hidden';
     const nx=(x-w/2)/(w*.8),ny=(y-h*.58)/(h*.95),r=nx*nx+ny*ny;
     const depth=seed[4],scale=reduced?1:Math.max(.67,1.05-r*.12),base=Math.max(w<600?42:60,Math.min(320,Math.min(w,h*1.12)*seed[2])),width=base*m.zoom;
     const px=w/2+(x-w/2)/(1+r*.035),py=h*.58+(y-h*.58)/(1+r*.035),angle=seed[3];
     tile.style.width=`${width}px`;tile.style.transform=`translate3d(${px}px,${py}px,0) translate(-50%,-50%) perspective(1400px) rotateX(${reduced?0:ny*9}deg) rotateY(${reduced?0:-nx*14}deg) rotate(${angle}deg) scale(${scale*depth})`;
     tile.style.zIndex=String(Math.round(depth*50));
    });
   }frame=requestAnimationFrame(loop);
  };frame=requestAnimationFrame(loop);return()=>{active=false;cancelAnimationFrame(frame);resize.disconnect();};
 },[posters,items.length]);
 function finish(e:React.PointerEvent){const m=motion.current;if(!m.drag)return;m.drag=false;setDragging(false);if(stage.current?.hasPointerCapture(e.pointerId))stage.current.releasePointerCapture(e.pointerId);}
 function changeZoom(value:number){const z=Math.min(1.5,Math.max(.65,value));motion.current.zoom=z;setZoom(z);}
 function reset(){Object.assign(motion.current,{x:0,y:0,vx:0,vy:0,zoom:1});setZoom(1);}
 return <div className={`wall ${dragging?'dragging':''}`} ref={stage} role="region" aria-label={t('拖曳或使用方向鍵探索海報','Drag or use arrow keys to explore posters')} tabIndex={0}
 onKeyDown={e=>{const steps:Record<string,[number,number]>={ArrowLeft:[-90,0],ArrowRight:[90,0],ArrowUp:[0,-90],ArrowDown:[0,90]};if(steps[e.key]){e.preventDefault();motion.current.x+=steps[e.key][0];motion.current.y+=steps[e.key][1];}}}
 onPointerDown={e=>{if(e.button!==0||(e.target as HTMLElement).closest('.wall-controls'))return;Object.assign(motion.current,{drag:true,vx:0,vy:0,lastX:e.clientX,lastY:e.clientY,startX:e.clientX,startY:e.clientY,moved:false});}}
 onPointerMove={e=>{const m=motion.current;if(!m.drag)return;const dx=e.clientX-m.lastX,dy=e.clientY-m.lastY;if(Math.hypot(e.clientX-m.startX,e.clientY-m.startY)>5){m.moved=true;setDragging(true);stage.current?.setPointerCapture(e.pointerId);}if(m.moved){m.x-=dx;m.y-=dy;m.vx=-dx;m.vy=-dy;}m.lastX=e.clientX;m.lastY=e.clientY;}}
 onPointerUp={finish} onPointerCancel={e=>{finish(e);motion.current.vx=0;motion.current.vy=0;}}
 onClickCapture={e=>{if(motion.current.moved){e.preventDefault();e.stopPropagation();motion.current.moved=false;}}}>
 {items.map((p,i)=><button className="wall-poster" key={p.id} ref={el=>{tiles.current[i]=el;}} onClick={()=>onSelect(p)} aria-label={`${t('查看','View')} ${p.title}`}><img src={p.image} alt={p.title} draggable={false} loading="lazy" decoding="async"/></button>)}
 <div className="wall-controls" onPointerDown={e=>e.stopPropagation()}><button aria-label={t('縮小','Zoom out')} onClick={()=>changeZoom(zoom-.15)} disabled={zoom<=.65}><Minus/></button><button aria-label={t('放大','Zoom in')} onClick={()=>changeZoom(zoom+.15)} disabled={zoom>=1.5}><Plus/></button><button onClick={reset} aria-label={t('重設位置','Reset position')}><RotateCcw/></button></div>
 </div>;
}
