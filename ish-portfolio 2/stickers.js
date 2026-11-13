/* Original collectible artwork generated for Ish, 2026. Decorative, not valid postage.
   Three transparent 4×4 atlases; existing Wolfie artwork is retained unchanged. */
'use strict';
const STICKER_NAMES={"M":["Tyre","Sports car","Blue car","Car key","Sun","Cloud","Solar panel","Leaf","Wave","Water drop","Sailboat","Globe","Lightning","Wind turbine","Map","Lifebuoy"],"F":["Gold coin","Piggy bank","Payment card","Calculator","Folder","Laptop","Phone","Speech bubble","Brain","Magnifying glass","VR headset","Briefcase","Headphones","Music note","Cursor","Colour palette"],"P":["Lotus stamp","Peacock stamp","Pavilion stamp","Flower stamp","Yellow flowers","Hibiscus","Iris","Daisy","Compass stamp","Postmark","Shimmer star","Fern stamp","Pixel heart","Pencils","Sunflower stamp","Paper plane"]};
function stickerName(key){return key[0]==='W'?'Wolfy':STICKER_NAMES[key[0]]?.[Number(key.slice(1))]||'Sticker';}
const STICKER_ATLASES={M:'assets/stickers/mobility-nature.png',F:'assets/stickers/creative-finance.png',P:'assets/stickers/postage-floral.png'};
const PROJECT_STICKER_SETS={
 'car-analytics':['M0','M2','M3','F3','F9','M14','P1','P8','P4','W0'],
 'maruti-suzuki-arena':['M2','M0','M3','M11','M4','F6','P2','P4','P10','W0'],
 'nexa-enhanced-digital-experience':['M1','M0','M3','F5','F6','P1','P10','P6','P0','W0'],
 'tsunami-history-global-atlas':['M8','M9','M11','M14','M15','P8','P0','P5','M10','W0'],
 'crisis-management-application':['M15','M12','F7','F9','M11','P8','P3','F4','P10','W0'],
 'pito-interview-pre-hire-app':['F7','F5','F9','F11','P12','P13','P6','P3','F14','W0'],
 'aurya-solar-planning':['M4','M5','M6','M7','M13','M12','P11','P14','P4','W0'],
 'good-money-personal-finance':['F1','F0','F2','F3','P14','P5','F6','P12','P0','W0'],
 'bharat-crypto-digital-assets':['F0','F3','F5','F9','P1','P8','P10','P4','M11','W0'],
 'iq-test-a-little-brain-stretch':['F8','F9','P13','P12','P7','P6','F14','P3','F15','W0'],
 'data-app-organiser':['F4','F6','F7','F9','P15','P3','P8','P6','F14','W0'],
 'mr-vr-socio-technical-systems':['F10','F8','M11','F5','P1','P11','F9','P7','P10','W0'],
 'wolfy-daily-focus-companion':['W0','P12','F7','M7','P3','P0','W1','P7','P10','W2'],
 'audio-visualizer-3d-ui-ux':['F12','F13','P10','F6','P1','P5','F15','F5','P12','W0'],
 'bajaj-finserv-billings-payments-dashboard':['F2','F3','F0','F6','M12','P2','P0','P7','P8','W0']
};
function stickerSeed(id){return [...id].reduce((value,char)=>(value*31+char.charCodeAt(0))>>>0,7);}
function stickerElement(key,mini=false){
 const el=document.createElement('span');el.className='project-sticker'+(mini?' mac-sticker':'');el.dataset.sticker=key;if(mini)el.setAttribute('aria-hidden','true');else{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Move sticker; double-click or press Enter to collect it');}
 if(key[0]==='W'){
  const variant=Number(key.slice(1));el.classList.add('sticker-wolf');el.style.backgroundImage=`url("${window.portfolioImageSource('assets/wolfy-spritesheet.png','tile')}")`;el.style.backgroundSize='800% 1100%';el.style.backgroundPosition=variant===1?'0% 50%':variant===2?'28.5714% 30%':'0% 0%';
 }else{
  const index=Number(key.slice(1));el.style.backgroundImage=`url("${window.portfolioImageSource(STICKER_ATLASES[key[0]],'tile')}")`;el.style.backgroundSize='400% 400%';el.style.backgroundPosition=`${index%4/3*100}% ${Math.floor(index/4)/3*100}%`;
 }
 const art=document.createElement('span');art.className='sticker-art';
 el.style.setProperty('--sticker-image',el.style.backgroundImage);el.style.setProperty('--sticker-bg-size',el.style.backgroundSize);el.style.setProperty('--sticker-bg-position',el.style.backgroundPosition);el.style.backgroundImage='none';el.append(art);
 const shine=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;el.classList.remove('is-sticker-shining');void el.offsetWidth;el.classList.add('is-sticker-shining');};
 el.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;el.classList.add('is-sticker-hover');shine();});
 el.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=el.getBoundingClientRect(),x=Math.max(-.5,Math.min(.5,(e.clientX-r.left)/r.width-.5)),y=Math.max(-.5,Math.min(.5,(e.clientY-r.top)/r.height-.5));el.style.setProperty('--sticker-tilt-x',(-y*10)+'deg');el.style.setProperty('--sticker-tilt-y',(x*10)+'deg');});
 el.addEventListener('pointerleave',()=>{el.classList.remove('is-sticker-hover');el.style.removeProperty('--sticker-tilt-x');el.style.removeProperty('--sticker-tilt-y');});
 el.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();shine();});
 if(!mini)enableStickerDrag(el);el.addEventListener('dblclick',event=>{event.preventDefault();event.stopPropagation();openStickerToken(key,el);});
 el.addEventListener('animationend',event=>{if(event.animationName==='sticker-sheen')el.classList.remove('is-sticker-shining');});
 return el;
}
function renderProjectStickers(project,world){
 const set=PROJECT_STICKER_SETS[project.id];if(!set)return;
 const seed=stickerSeed(project.id),tiles=[...world.querySelectorAll('.canvas-tile:not(.canvas-empty)')];
 const layer=document.createElement('div');layer.className='canvas-sticker-layer';layer.setAttribute('aria-label','Moveable project stickers');
 const accents=set.slice(0,Math.min(set.length,tiles.length*2)).map((key,i)=>{
  const el=stickerElement(key);const size=(key[0]==='P'?84+(seed+i*7)%23:80+(seed+i*13)%33)*(Number(world.dataset.mediaScale)||1);
  el.style.width=size+'px';el.style.height=size+'px';el.style.setProperty('--sticker-rotation',`${((seed+i*17)%27)-13}deg`);
  layer.append(el);return {el,size};
 });
 world.append(layer);
 function arrange(){
  accents.forEach(({el,size},i)=>{
   if(el.dataset.moved==='true')return;
   let x,y;
   if(tiles.length){
    const tile=tiles[(i+(seed%tiles.length))%tiles.length];
    const left=parseFloat(tile.style.left),top=parseFloat(tile.style.top),width=parseFloat(tile.style.width),height=parseFloat(tile.style.height);
    // Sparse edge overlaps: keep the center, captions, and image's top-left content clear.
    const mode=(i+seed)%3;
    if(mode===0){x=left+width-size*.32;y=top-size*.64;}
    else if(mode===1){x=left-size*.78;y=top+height*.46-size*.5;}
    else{x=left+width-size*.2;y=top+height-size*.76;}
   }else{x=12;y=14;}
   el.style.left=Math.max(12,Math.min(world.offsetWidth-size-12,x))+'px';el.style.top=Math.max(14,Math.min(world.offsetHeight-size-16,y))+'px';
  });
 }
 tiles.forEach(tile=>{const media=tile.querySelector('img,video');media.addEventListener(media.tagName==='VIDEO'?'loadedmetadata':'load',arrange,{once:true});});
 arrange();
}
function decorateProjectMac(project,mac){
 if(!mac)return;mac.querySelector(':scope > .mac-sticker-layer')?.remove();
 const set=PROJECT_STICKER_SETS[project.id],seed=stickerSeed(project.id);if(!set)return;
 const layer=document.createElement('span');layer.className='mac-sticker-layer';layer.setAttribute('aria-hidden','true');
 // Lower casing only: three paper accents on the left body and two along the base, clear of slot and vents.
 const slots=[[10.4,78.5,8.3,-10],[10.4,87.0,7.6,8],[32.5,82.8,9.6,-7],[39.5,94.8,7.8,6],[60.0,94.8,7.8,-5]];
 const order=[...slots.keys()].sort((a,b)=>((seed+a*53)%101)-((seed+b*53)%101));
 const count=3+seed%3;
 for(let i=0;i<count;i++){
  const slot=slots[order[i]],key=set[(i+(seed%3))%5],el=stickerElement(key,true);
  el.style.left=slot[0]+'%';el.style.top=slot[1]+'%';el.style.width=slot[2]+'%';el.style.setProperty('--sticker-rotation',`${slot[3]+seed%7-3}deg`);layer.append(el);
 }
 mac.append(layer);
}

// Sticker positions live only in this visit. Re-rendering a project recreates its original layout.
function enableStickerDrag(el){
 let drag=null,lastTouchTap=0;
 const move=(x,y)=>{const world=el.closest('.canvas-world');el.style.left=Math.max(0,Math.min(world.offsetWidth-el.offsetWidth,x))+'px';el.style.top=Math.max(0,Math.min(world.offsetHeight-el.offsetHeight,y))+'px';el.dataset.moved='true';};
 el.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:parseFloat(el.style.left),top:parseFloat(el.style.top),moved:false};el.setPointerCapture(e.pointerId);});
 el.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.stopPropagation();const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<4)return;drag.moved=true;el.classList.add('sticker-dragging');const world=el.closest('.canvas-world'),scale=world.getBoundingClientRect().width/world.offsetWidth;move(drag.left+dx/scale,drag.top+dy/scale);});
 const release=e=>{if(!drag||drag.id!==e.pointerId)return;e.stopPropagation();if(e.type==='pointerup'&&e.pointerType==='touch'&&!drag.moved){const now=performance.now();if(now-lastTouchTap<350){lastTouchTap=0;openStickerToken(el.dataset.sticker,el);}else lastTouchTap=now;}drag=null;el.classList.remove('sticker-dragging');if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);};
 el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();openStickerToken(el.dataset.sticker,el);}else if(e.key.startsWith('Arrow')){e.preventDefault();e.stopPropagation();const step=e.shiftKey?30:10;move(parseFloat(el.style.left)+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),parseFloat(el.style.top)+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0));}});
}
let stickerTokenDialog,stickerTokenURL,stickerTokenOrigin,stickerTokenVersion=0;
const stickerImageCache=new Map();
function loadStickerAtlas(src){if(!stickerImageCache.has(src))stickerImageCache.set(src,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;}));return stickerImageCache.get(src);}
async function stickerPNG(key){
 const wolf=key[0]==='W',im=await loadStickerAtlas(wolf?'assets/wolfy-spritesheet.png':STICKER_ATLASES[key[0]]),cols=wolf?8:4,rows=wolf?11:4;
 const n=Number(key.slice(1)),col=wolf?(n===2?2:0):n%4,row=wolf?(n===1?5:n===2?3:0):Math.floor(n/4),sw=im.naturalWidth/cols,sh=im.naturalHeight/rows;
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=Math.round(512*sh/sw);const ctx=canvas.getContext('2d');ctx.drawImage(im,col*sw,row*sh,sw,sh,0,0,canvas.width,canvas.height);
 if(key==='F9')ctx.clearRect(canvas.width*.93,0,canvas.width*.07,canvas.height);
 return new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
}
async function openStickerToken(key,origin){
 if(!stickerTokenDialog){
  stickerTokenDialog=document.createElement('dialog');stickerTokenDialog.className='sticker-token-dialog';stickerTokenDialog.setAttribute('aria-labelledby','sticker-token-title');
  stickerTokenDialog.innerHTML='<button class="sticker-token-close" aria-label="Close sticker">×</button><h2 id="sticker-token-title">A little token from Ish.</h2><div class="sticker-token-picture"><img alt="Collectible sticker" hidden></div><p>Hi, you visited my website. Here’s a little token to keep, save or share.</p><div class="sticker-token-actions"><a class="sticker-download" hidden>Download sticker</a><button class="sticker-share" hidden>Share</button></div><p class="sticker-token-status" role="status">Preparing your sticker…</p>';
  document.body.append(stickerTokenDialog);stickerTokenDialog.querySelector('.sticker-token-close').onclick=()=>stickerTokenDialog.close();
  stickerTokenDialog.addEventListener('click',e=>{if(e.target!==stickerTokenDialog)return;const r=stickerTokenDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)stickerTokenDialog.close();});
  stickerTokenDialog.addEventListener('close',()=>{stickerTokenVersion++;if(stickerTokenURL)URL.revokeObjectURL(stickerTokenURL);stickerTokenURL=null;stickerTokenOrigin?.focus({preventScroll:true});});
 }
 const version=++stickerTokenVersion;stickerTokenOrigin=origin;const picture=stickerTokenDialog.querySelector('img'),download=stickerTokenDialog.querySelector('.sticker-download'),share=stickerTokenDialog.querySelector('.sticker-share'),status=stickerTokenDialog.querySelector('.sticker-token-status');
 picture.hidden=download.hidden=share.hidden=true;status.textContent='Preparing your sticker…';if(!stickerTokenDialog.open)stickerTokenDialog.showModal();
 try{
  const blob=await stickerPNG(key);if(version!==stickerTokenVersion||!blob)return;if(stickerTokenURL)URL.revokeObjectURL(stickerTokenURL);stickerTokenURL=URL.createObjectURL(blob);
  picture.src=stickerTokenURL;picture.hidden=false;const project=typeof currentProject!=='undefined'&&currentProject?currentProject.id:'portfolio',filename=`ish-${project}-sticker-${key}.png`;download.href=stickerTokenURL;download.download=filename;download.hidden=false;picture.alt=stickerName(key);status.textContent=stickerName(key)+' · Transparent PNG';
  const file=new File([blob],filename,{type:'image/png'});
  if(navigator.canShare?.({files:[file]})){share.hidden=false;share.onclick=async()=>{try{await navigator.share({files:[file],title:'A little token from Ish',text:'A sticker from Ish’s portfolio.'});}catch(e){if(e.name!=='AbortError')status.textContent='Download the sticker to share it.';}};}
 }catch{status.textContent='Couldn’t prepare this sticker. Please close and try again.';}
}
