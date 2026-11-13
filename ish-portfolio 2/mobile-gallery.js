/* Mobile gallery lifecycle by Ish Singh. The desktop renderer keeps its original media.
   Sources are attached only near the camera; one visible muted clip may play at a time. */
'use strict';
window.PortfolioMobileGallery=class {
 constructor(viewport,world,isActive){this.viewport=viewport;this.world=world;this.isActive=isActive;this.entries=[];this.frame=0;this.motion=matchMedia('(prefers-reduced-motion: reduce)');}
 track(){
  this.clear();
  this.entries=[...this.world.querySelectorAll('.canvas-tile')].flatMap(tile=>{
   const media=tile.querySelector('img,video');if(!media?.dataset.mobileSrc)return [];
   const ready=()=>{if(media.isConnected&&media.hasAttribute('src'))tile.dataset.mediaState='ready';};
   const error=()=>{if(media.isConnected&&media.hasAttribute('src'))tile.dataset.mediaState='error';};
   const playing=()=>tile.dataset.playing='true',paused=()=>delete tile.dataset.playing;
   media.addEventListener('load',ready);media.addEventListener('loadeddata',ready);media.addEventListener('error',error);
   media.addEventListener('playing',playing);media.addEventListener('pause',paused);
   return [{tile,media,ready,error,playing,paused}];
  });
  this.schedule();
 }
 schedule(){if(!this.frame)this.frame=requestAnimationFrame(()=>{this.frame=0;this.refresh();});}
 release(entry){
  const {media,tile}=entry;
  if(media.tagName==='VIDEO'){
   media.pause();media.autoplay=false;
   if(media.hasAttribute('src')){media.removeAttribute('src');media.load();}
   delete media.dataset.autoplayAttempted;delete tile.dataset.playing;
  }else media.removeAttribute('src');
  tile.dataset.mediaState='idle';
 }
 clear(){
  cancelAnimationFrame(this.frame);this.frame=0;
  for(const entry of this.entries){
   this.release(entry);const {media,ready,error,playing,paused}=entry;
   media.removeEventListener('load',ready);media.removeEventListener('loadeddata',ready);media.removeEventListener('error',error);
   media.removeEventListener('playing',playing);media.removeEventListener('pause',paused);
  }
  this.entries=[];
 }
 retry(tile){
  const entry=this.entries.find(e=>e.tile===tile);if(!entry)return;
  this.release(entry);this.schedule();
 }
 refresh(){
  if(!this.entries.length)return;
  if(!this.isActive()){for(const e of this.entries)this.release(e);return;}
  // Read geometry before changing any sources. A single refresh serves a whole pan frame.
  const bounds=this.viewport.getBoundingClientRect(),margin=160;
  const camera={left:Math.max(0,bounds.left),top:Math.max(0,bounds.top),right:Math.min(innerWidth,bounds.right),bottom:Math.min(innerHeight,bounds.bottom)};
  camera.width=camera.right-camera.left;camera.height=camera.bottom-camera.top;
  if(camera.width<=0||camera.height<=0){for(const e of this.entries)this.release(e);return;}
  const measured=this.entries.map(entry=>{
   const r=entry.tile.getBoundingClientRect();
   const visible=Math.max(0,Math.min(r.right,camera.right)-Math.max(r.left,camera.left))*Math.max(0,Math.min(r.bottom,camera.bottom)-Math.max(r.top,camera.top));
   const near=r.right>camera.left-margin&&r.left<camera.right+margin&&r.bottom>camera.top-margin&&r.top<camera.bottom+margin;
   const distance=Math.hypot(r.left+r.width/2-camera.left-camera.width/2,r.top+r.height/2-camera.top-camera.height/2);
   return {...entry,visible,near,distance};
  });
  const wanted=new Set(measured.filter(e=>e.near).sort((a,b)=>b.visible-a.visible||a.distance-b.distance).slice(0,6).map(e=>e.media));
  const clip=this.motion.matches?null:measured.filter(e=>e.media.tagName==='VIDEO'&&e.visible>80).sort((a,b)=>b.visible-a.visible)[0]?.media;
  // Release old work before starting the next image/video.
  for(const entry of measured){
   if(!wanted.has(entry.media)||(entry.media.tagName==='VIDEO'&&entry.media!==clip))this.release(entry);
   if(entry.media.tagName==='VIDEO'&&!wanted.has(entry.media))entry.media.removeAttribute('poster');
  }
  for(const entry of measured){
   const {media,tile}=entry;if(!wanted.has(media))continue;
   if(media.tagName==='VIDEO'){
    if(media.dataset.mobilePoster&&!media.hasAttribute('poster'))media.poster=media.dataset.mobilePoster;
    if(media!==clip)continue;
    if(!media.hasAttribute('src')){tile.dataset.mediaState='loading';media.preload='metadata';media.autoplay=true;media.src=media.dataset.mobileSrc;}
    if(!media.dataset.autoplayAttempted){media.dataset.autoplayAttempted='true';media.play().catch(()=>{if(media.isConnected)delete tile.dataset.playing;});}
   }else if(!media.hasAttribute('src')){tile.dataset.mediaState='loading';media.src=media.dataset.mobileSrc;}
  }
 }
};
