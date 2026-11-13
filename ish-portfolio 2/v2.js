/* Project journeys and ambient field by Ish Singh. Media keeps stable world coordinates. */
'use strict';
const themes={
 'nexa-enhanced-digital-experience':['#090c12','#f0f4fa','#ffffff'],
 'good-money-personal-finance':['#f3bd76','#342314','#f37518'],
 'bharat-crypto-digital-assets':['#ffffff','#28251d','#c99b29'],
 'maruti-suzuki-arena':['#0c2443','#f2f6fb','#68a7ed'],
 'car-analytics':['#124b8d','#f3f8ff','#9fdcff'],
 'tsunami-history-global-atlas':['#082f38','#e5f3f4','#5bbfca'],
 'crisis-management-application':['#301f27','#fff1ef','#db8c87'],
 'pito-interview-pre-hire-app':['#ddd5f2','#29213f','#315dd5'],
 'aurya-solar-planning':['#1b542d','#f5faeb','#f6e556'],
 'iq-test-a-little-brain-stretch':['#f3c4d9','#442a3b','#238857'],
 'data-app-organiser':['#e2e9f1','#25384e','#304a99'],
 'mr-vr-socio-technical-systems':['#092c2e','#edf6f4','#62c9bd'],
 'wolfy-daily-focus-companion':['#15437a','#f4f8ff','#ff8acb'],
 'audio-visualizer-3d-ui-ux':['#a81723','#fff8f8','#ffffff'],
 'bajaj-finserv-billings-payments-dashboard':['#0b4e91','#f2f8ff','#ffffff']
};
const mobileExperience=window.PORTFOLIO_MOBILE_QUERY;
let whiteHome=true,homeScrollFrame=0,themeFrame=0,colorFrame=0;
const ambient=$('atmosphere'),matrix=$('matrix'),matrixContext=matrix.getContext('2d');
let themeColors=['#ffffff','#17191c','#91b5db'];
const rgb=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16));
const mix=(a,b,t)=>{t=Math.max(0,Math.min(1,t));a=rgb(a);b=rgb(b);return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0')).join('');};
const luminance=hex=>rgb(hex).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
function applyTheme(p,amount=1){
 const t=themes[p.id]||['#e8edf2','#202a35',p.accent];
 const target=[mix('#ffffff',t[0],amount),t[1],t[2]],from=[...themeColors],start=performance.now();
 cancelAnimationFrame(colorFrame);
 document.body.classList.toggle('white-home',amount<.03);
 const root=document.documentElement;root.style.setProperty('--world-strength',amount);
 function paint(now){
  const progress=reducedMotion.matches||amount===0?1:Math.max(0,Math.min(1,(now-start)/1100));
  const ease=1-(1-progress)**3;
  const bg=mix(from[0],target[0],ease),lum=luminance(bg);
  let ink=amount===0?'#17191c':target[1];
  const inkLum=luminance(ink),ratio=(Math.max(lum,inkLum)+.05)/(Math.min(lum,inkLum)+.05);
  if(ratio<4.5)ink=lum>.179?'#000000':'#ffffff';
  themeColors=[bg,ink,mix(from[2],target[2],ease)];
  root.style.setProperty('--world-wash',mix(bg,'#ffffff',.035));root.style.setProperty('--world-bg',bg);root.style.setProperty('--world-ink',ink);root.style.setProperty('--world-accent',themeColors[2]);
  document.querySelector('meta[name="theme-color"]').content=bg;
  if(progress<1)colorFrame=requestAnimationFrame(paint);
  else if(reducedMotion.matches)renderMatrix(now,true);
 }
 paint(start);
}
// Homepage project selection is controlled by the sleeve library, independent of page scroll.
const originalSelect=select;let lastSelectionAt=performance.now();
select=function(index,scroll=true){
 whiteHome=false;lastSelectionAt=performance.now();originalSelect(index,scroll);$('project-name').dataset.project=projects[selected].id;applyTheme(projects[selected]);
};

// Sparse cosmos adapted from Ish's earlier spring/magnetism interaction; no orbit or galaxy geometry.
let dots=[],matrixWidth=0,matrixHeight=0,lastMatrix=0,shootingStars=[],nextShootingAt=0;
const fieldPointer={x:0,y:0,tx:0,ty:0,vx:0,vy:0,inside:false};
window.addEventListener('pointermove',e=>{
 if(e.pointerType==='touch')return;
 fieldPointer.vx=Math.max(-24,Math.min(24,e.clientX-fieldPointer.tx));fieldPointer.vy=Math.max(-24,Math.min(24,e.clientY-fieldPointer.ty));
 fieldPointer.tx=e.clientX;fieldPointer.ty=e.clientY;fieldPointer.inside=true;
},{passive:true});
document.addEventListener('pointerleave',()=>fieldPointer.inside=false);
function sizeMatrix(){
 if(mobileExperience.matches&&(projectDialog.open||window.PORTFOLIO_PHONE_CHECK?.flat)){matrix.hidden=true;matrix.width=matrix.height=1;dots=[];shootingStars=[];return;}
 matrix.hidden=false;
 const scale=Math.min(devicePixelRatio||1,2,3840/innerWidth);matrixWidth=innerWidth;matrixHeight=innerHeight;
 matrix.width=Math.round(innerWidth*scale);matrix.height=Math.round(innerHeight*scale);matrixContext.setTransform(scale,0,0,scale,0,0);
 const count=Math.max(150,Math.min(1800,Math.round(innerWidth*innerHeight/1700)));
 dots=Array.from({length:count},()=>({x:Math.random()*matrixWidth,y:Math.random()*matrixHeight,
  vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,ox:0,oy:0,svx:0,svy:0,
  size:.45+Math.random()*1.2,phase:Math.random()*Math.PI*2,rate:.3+Math.random()*.8,alpha:.18+Math.random()*.42,light:0}));
 shootingStars=[];renderMatrix(performance.now(),true);
}
function renderMatrix(now,once=false){
 if(document.hidden||(mobileExperience.matches&&(projectDialog.open||window.PORTFOLIO_PHONE_CHECK?.flat))){themeFrame=0;return;}
 if(now-lastMatrix<28&&!once){themeFrame=requestAnimationFrame(renderMatrix);return;}
 const dt=Math.min(2,(now-lastMatrix)/28||1);lastMatrix=now;
 const ctx=matrixContext,time=now/1000,reduced=reducedMotion.matches;
 ctx.clearRect(0,0,matrixWidth,matrixHeight);
 fieldPointer.x+=(fieldPointer.tx-fieldPointer.x)*.15;fieldPointer.y+=(fieldPointer.ty-fieldPointer.y)*.15;
 fieldPointer.vx*=.86;fieldPointer.vy*=.86;
 const strength=document.body.classList.contains('white-home')?.38:1;
 for(const d of dots){
  const dx=fieldPointer.x-d.x,dy=fieldPointer.y-d.y,distance=Math.hypot(dx,dy);
  const influence=fieldPointer.inside&&!reduced?Math.pow(Math.max(0,1-distance/245),1.5):0;
  d.light=Math.max(influence,d.light*.95);
  if(!reduced&&!once){
   d.vx=(d.vx+(Math.random()-.5)*.014)*.996;d.vy=(d.vy+(Math.random()-.5)*.014)*.996;
   d.x=(d.x+d.vx*dt+matrixWidth)%matrixWidth;d.y=(d.y+d.vy*dt+matrixHeight)%matrixHeight;
   const tx=dx*influence*.6-fieldPointer.vy*influence*.025,ty=dy*influence*.6+fieldPointer.vx*influence*.025;
   d.svx=(d.svx+(tx-d.ox)*.026)*.9;d.svy=(d.svy+(ty-d.oy)*.026)*.9;d.ox+=d.svx;d.oy+=d.svy;
  }
  const shimmer=reduced?1:.68+.32*Math.sin(time*d.rate+d.phase);
  ctx.globalAlpha=Math.min(.95,(d.alpha*shimmer+d.light*.5)*strength);ctx.fillStyle=themeColors[2];
  const glow=d.light>.05||d.size>1.45;ctx.shadowColor=themeColors[2];ctx.shadowBlur=glow?5+d.light*12:0;
  ctx.beginPath();ctx.arc(d.x+d.ox,d.y+d.oy,d.size*(1+d.light*.45),0,Math.PI*2);ctx.fill();
 }
 ctx.shadowBlur=0;
 if(!reduced&&!once&&now>nextShootingAt){
  nextShootingAt=now+2800+Math.random()*4000;
  if(strength>.2)shootingStars.push({x:Math.random()*matrixWidth,y:Math.random()*matrixHeight*.75,born:now,life:950+Math.random()*400});
 }
 shootingStars=shootingStars.filter(star=>now-star.born<star.life);
 for(const star of shootingStars){
  const progress=(now-star.born)/star.life,x=star.x+progress*330,y=star.y+progress*100;
  ctx.globalAlpha=Math.sin(progress*Math.PI)*.55*strength;
  const trail=ctx.createLinearGradient(x-75,y-23,x,y);trail.addColorStop(0,'transparent');trail.addColorStop(1,themeColors[2]);ctx.strokeStyle=trail;ctx.lineWidth=.9;
  ctx.beginPath();ctx.moveTo(x-75,y-23);ctx.lineTo(x,y);ctx.stroke();
 }
 ctx.globalAlpha=1;
 if(!once&&!reduced&&!document.hidden)themeFrame=requestAnimationFrame(renderMatrix);
}
let matrixResizeTimer=0;window.addEventListener('resize',()=>{clearTimeout(matrixResizeTimer);matrixResizeTimer=setTimeout(sizeMatrix,150);});
function syncMatrixState(){cancelAnimationFrame(themeFrame);themeFrame=0;sizeMatrix();if(!document.hidden&&!reducedMotion.matches)renderMatrix(performance.now());}
document.addEventListener('visibilitychange',syncMatrixState);
reducedMotion.addEventListener('change',syncMatrixState);

// Full-height vertical project journey inside the original native modal.
projectDialog.classList.add('v2-project');
projectDialog.innerHTML=`<div class="v2-top"><a href="#home" id="v2-home" class="wordmark" aria-label="Return to homepage">ish.</a><span id="v2-project-name"></span><button id="v2-close" aria-label="Back to homepage">←</button></div>
<div class="v2-journey">
<section id="gallery" class="v2-gallery" aria-labelledby="gallery-title"><h2 id="gallery-title" class="sr-only">Project gallery</h2><div class="canvas-viewport" tabindex="0" role="region" aria-label="Project canvas. Scroll or drag in any direction to explore. Use the navigation dots for Info and Reach out."><div class="canvas-world"></div></div><p class="canvas-hint">Scroll or drag to explore</p></section>
<section id="info" class="v2-section" aria-labelledby="detail-title"><div class="v2-copy"><h2 id="detail-title" tabindex="-1"></h2><p id="detail-description"></p><div id="project-narrative"></div><dl id="project-info"></dl><div id="project-links"></div></div></section>
<section id="reach" class="v2-section" aria-labelledby="reach-title"><div class="v2-copy reach-card"><h2 id="reach-title">Like this project?</h2><p>Have something in mind?<br>Let’s make it happen.</p><a class="email-cta" href="mailto:ishnishansingh@gmail.com">Email me</a></div></section>
<section id="return" class="v2-section" aria-labelledby="return-title"><div class="v2-copy return-copy"><h2 id="return-title" class="sr-only">Other projects</h2><div id="return-mac"></div><button id="return-caption">Click the Mac to view other projects</button></div></section></div>
<nav class="journey-nav" aria-label="Project sections">${[['gallery','Gallery','grid'],['info','Info','dot'],['reach','Reach out','dot'],['return','Return','home']].map(([id,label,icon])=>`<button data-section="${id}" aria-label="${label}" aria-controls="${id}"><i class="nav-${icon}" aria-hidden="true">${icon==='home'?'<svg viewBox="0 0 16 16"><path d="M2 7h2V5h2V3h4v2h2v2h2v7H9v-4H7v4H2Z"/></svg>':''}</i><span>${label}</span></button>`).join('')}</nav>`;
const updateProjectLinkLauncher=installProjectLinkLauncher(projectDialog);
const focusDialog=document.createElement('dialog');focusDialog.id='media-focus';focusDialog.setAttribute('aria-label','Focused project media');focusDialog.innerHTML='<button id="focus-close" aria-label="Close focused media">×</button><div class="focus-media"></div>';document.body.append(focusDialog);
const viewport=projectDialog.querySelector('.canvas-viewport'),world=projectDialog.querySelector('.canvas-world');
const mobileGallery=new window.PortfolioMobileGallery(viewport,world,()=>mobileExperience.matches&&projectDialog.open&&!document.hidden&&!focusDialog.open&&projectDialog.querySelector('.journey-nav .active')?.dataset.section==='gallery');
let restoringFocus=false,worldPlacementFrame=0,mobileGalleryWidth=viewport.clientWidth;
let pan={x:0,y:0},panDrag=null,wasDragged=false,panMemory=new Map(),currentProject=null,focusOrigin=null,loopsPaused=reducedMotion.matches;
const positions=[
 [180,160,520,310],[780,95,400,330],[1280,160,310,420],
 [90,630,370,440],[570,590,570,320],[1280,680,410,300],
 [180,1190,500,330],[800,1090,360,430],[1280,1130,470,320],
 [180,1620,450,330],[760,1700,520,290],[1380,1600,340,420]
];
const worldSize={width:1850,height:2180};
function placeWorld(){if(mobileExperience.matches){cancelAnimationFrame(worldPlacementFrame);worldPlacementFrame=requestAnimationFrame(paintWorld);}else paintWorld();}
function paintWorld(){worldPlacementFrame=0;const centerX=(viewport.clientWidth-worldSize.width)/2,centerY=(viewport.clientHeight-worldSize.height)/2;pan.x=centerX>0?centerX:Math.min(40,Math.max(viewport.clientWidth-worldSize.width-40,pan.x));pan.y=centerY>0?centerY:Math.min(40,Math.max(viewport.clientHeight-worldSize.height-40,pan.y));world.style.transform=mobileExperience.matches?`translate(${pan.x}px,${pan.y}px)`:`translate3d(${pan.x}px,${pan.y}px,0)`;if(currentProject)panMemory.set(currentProject.id,{...pan,scale:Number(world.dataset.mediaScale)||1});mobileGallery.schedule();}
let canvasBoundsFrame=0;
function updateCanvasBounds(){
 cancelAnimationFrame(canvasBoundsFrame);canvasBoundsFrame=requestAnimationFrame(()=>{
  const tiles=[...world.querySelectorAll('.canvas-tile')];
  worldSize.height=Math.ceil(Math.max(0,...tiles.map(tile=>tile.offsetTop+tile.offsetHeight+(tile.querySelector('.tile-caption')?.offsetHeight||0)))+80);
  world.style.height=worldSize.height+'px';placeWorld();
 });
}
function galleryScale(){return mobileExperience.matches?Math.max(.4,Math.min(1,(viewport.clientWidth-48)/520)):1;}
function recenter(){const scale=galleryScale();pan={x:Math.min(0,(viewport.clientWidth-520*scale)/2-180*scale),y:Math.min(0,(viewport.clientHeight-310*scale)/2-160*scale)};placeWorld();}
function createMedia(src,project,index,focused=false){
 const video=/\.(mp4|webm|mov)$/i.test(src),el=document.createElement(video?'video':'img');
 const mobile=mobileExperience.matches,details=window.PORTFOLIO_MEDIA_DETAILS?.[src],dimensions=window.PORTFOLIO_VARIANTS[src];
 if(dimensions){el.width=dimensions.width;el.height=dimensions.height;}
 if(video){
  if(details?.poster){const poster=mobile?window.portfolioImageSource(details.poster,'tile'):details.poster;if(mobile&&!focused)el.dataset.mobilePoster=poster;else el.poster=poster;}
  el.muted=true;el.defaultMuted=true;el.loop=true;el.playsInline=true;el.controls=mobile&&focused;
  el.preload=mobile&&!focused?'none':'metadata';el.autoplay=!loopsPaused&&(!mobile||focused);
  el.setAttribute('aria-label',`${project.name}, motion study ${index+1}`);
 }else{el.alt=`${project.name} — ${src.split('/').pop().replace(/^\d+[-_]?/,'').replace(/[-_]/g,' ').replace(/\.[^.]+$/,'')}`;el.decoding='async';el.draggable=false;}
 if(mobile&&!focused)el.dataset.mobileSrc=video?src:window.portfolioImageSource(src,'tile');
 else{el.src=src;if(video&&!loopsPaused)el.play().catch(()=>{});}
 return el;
}
let fitExpandedMedia=null;
window.addEventListener('resize',()=>{if(focusDialog.open)fitExpandedMedia?.();});
function openFocus(src,index,origin){
 focusOrigin=origin;
 const media=createMedia(src,currentProject,index,true),figure=document.createElement('figure'),frame=document.createElement('div'),caption=document.createElement('figcaption');
 figure.className='focused-figure';frame.className='focused-frame';caption.className='focused-caption';caption.id='expanded-caption';caption.textContent=origin.querySelector('.tile-caption strong')?.textContent||(index===0?'Project Overview':'Visualization');
 frame.append(media);figure.append(frame,caption);focusDialog.querySelector('.focus-media').replaceChildren(figure);focusDialog.setAttribute('aria-describedby','expanded-caption');focusDialog.showModal();focusDialog.append(wolfy);$('focus-close').focus();mobileGallery.schedule();
 const source=origin.querySelector('img,video');
 fitExpandedMedia=()=>{const dimensions=window.PORTFOLIO_VARIANTS[src],iw=media.naturalWidth||media.videoWidth||source?.naturalWidth||source?.videoWidth||dimensions?.width,ih=media.naturalHeight||media.videoHeight||source?.naturalHeight||source?.videoHeight||dimensions?.height;if(!iw||!ih)return;const bounds=focusDialog.querySelector('.focus-media').getBoundingClientRect(),scale=Math.min(bounds.width/iw,Math.max(100,bounds.height-40)/ih);frame.style.width=(iw*scale)+'px';frame.style.height=(ih*scale)+'px';};
 media.addEventListener(media.tagName==='VIDEO'?'loadedmetadata':'load',()=>fitExpandedMedia?.(),{once:true});fitExpandedMedia();
 media.addEventListener('error',()=>{if(!media.isConnected)return;frame.querySelector('.media-retry')?.remove();const retry=document.createElement('button');retry.className='media-retry';retry.textContent='Couldn’t load. Tap to retry';retry.onclick=()=>{retry.remove();if(media.tagName==='VIDEO'){media.load();media.play().catch(()=>{});}else{media.removeAttribute('src');media.src=src;}};frame.append(retry);});
}
function closeFocus(){if(focusDialog.open)focusDialog.close();}
$('focus-close').onclick=closeFocus;focusDialog.addEventListener('click',e=>{if(e.target===focusDialog)closeFocus();});
focusDialog.addEventListener('close',()=>{if(projectDialog.open)projectDialog.append(wolfy);else document.body.append(wolfy);focusDialog.querySelectorAll('video').forEach(v=>{v.pause();v.removeAttribute('src');v.load();});focusDialog.querySelector('.focus-media').replaceChildren();fitExpandedMedia=null;restoringFocus=true;if(focusOrigin?.isConnected)focusOrigin.focus({preventScroll:true});focusOrigin=null;restoringFocus=false;mobileGallery.schedule();});
function renderCanvas(p){
 disposeGallery();mobileGalleryWidth=viewport.clientWidth;const assets=window.PORTFOLIO_MEDIA[p.id]||[],scale=galleryScale();world.dataset.mediaScale=scale;worldSize.width=1850*scale;world.style.width=worldSize.width+'px';world.replaceChildren();worldSize.height=2180+Math.max(0,Math.ceil(assets.length/positions.length)-1)*2100;world.style.height=worldSize.height+'px';
 for(let i=0;i<assets.length;i++){
  const pos=positions[i%positions.length].map(value=>value*scale),tile=document.createElement(assets[i]?'button':'div');
  const y=pos[1]+Math.floor(i/positions.length)*2100*scale;
  tile.className=assets[i]?'canvas-tile':'canvas-tile canvas-empty';tile.style.cssText=`left:${pos[0]}px;top:${y}px;width:${pos[2]}px;height:${pos[3]}px`;
  if(assets[i]){tile.type='button';tile.setAttribute('aria-label',`Focus ${p.name} media ${i+1}`);const media=createMedia(assets[i],p,i);tile.append(media);
   const fitMedia=()=>{const dimensions=window.PORTFOLIO_VARIANTS[assets[i]],iw=media.naturalWidth||media.videoWidth||dimensions?.width,ih=media.naturalHeight||media.videoHeight||dimensions?.height;if(!iw||!ih)return;const scale=Math.min(pos[2]/iw,pos[3]/ih),w=iw*scale,h=ih*scale;tile.style.width=w+'px';tile.style.height=h+'px';tile.style.left=(pos[0]+(pos[2]-w)/2)+'px';tile.style.top=(y+(pos[3]-h)/2)+'px';if(tile.isConnected)updateCanvasBounds();};
   media.addEventListener(media.tagName==='VIDEO'?'loadedmetadata':'load',()=>{if(tile.isConnected)fitMedia();},{once:true});if(mobileExperience.matches||media.complete||media.readyState>=1)fitMedia();
   const caption=document.createElement('span');caption.className='tile-caption';
   const heading=document.createElement('strong');
   const labels=['Detail UI/UX','Elements','Typography','Visualization','Key UI/UX'];
   heading.textContent=window.PORTFOLIO_MEDIA_DETAILS?.[assets[i]]?.caption||(i===0?'Project Overview':labels[(i-1)%labels.length]);
   caption.append(heading);const surface=document.createElement('span');surface.className='tile-surface';surface.append(media,caption);tile.append(surface);
   if(mobileExperience.matches){tile.dataset.mediaState='idle';const state=document.createElement('span');state.className='mobile-media-state';state.setAttribute('aria-hidden','true');tile.append(state);if(media.tagName==='VIDEO'){tile.classList.add('mobile-video-tile');const cue=document.createElement('span');cue.className='mobile-play-cue';cue.textContent='▶';cue.setAttribute('aria-hidden','true');tile.append(cue);}}
   tile.onclick=()=>{if(wasDragged)return;if(tile.dataset.mediaState==='error'){mobileGallery.retry(tile);return;}openFocus(assets[i],i,tile);};tile.addEventListener('focus',()=>{if(!panDrag&&!restoringFocus&&tile.matches(':focus-visible')){pan.x=viewport.clientWidth/2-pos[0]-pos[2]/2;pan.y=viewport.clientHeight/2-y-pos[3]/2;placeWorld();}});}
  else{tile.setAttribute('aria-label','Reserved for future work');tile.replaceChildren();}
  if(assets[i]){
   tile.addEventListener('pointermove',e=>{if(reducedMotion.matches||e.pointerType==='touch'||panDrag)return;const r=tile.getBoundingClientRect(),x=Math.max(-.5,Math.min(.5,(e.clientX-r.left)/r.width-.5)),y=Math.max(-.5,Math.min(.5,(e.clientY-r.top)/r.height-.5));tile.style.setProperty('--hover-rx',(-y*9)+'deg');tile.style.setProperty('--hover-ry',(x*9)+'deg');tile.style.setProperty('--hover-x',(x*18)+'px');tile.style.setProperty('--hover-y',(y*18)+'px');});
   tile.addEventListener('pointerleave',()=>{['--hover-rx','--hover-ry','--hover-x','--hover-y'].forEach(k=>tile.style.removeProperty(k));});
  }
  world.append(tile);
 }
 if(mobileExperience.matches)mobileGallery.track();
 updateCanvasBounds();
 renderProjectStickers(p,world);
 if(panMemory.has(p.id)){const saved=panMemory.get(p.id),ratio=scale/(saved.scale||1);pan={x:saved.x*ratio,y:saved.y*ratio};placeWorld();}else recenter();
}
function disposeGallery(){
 mobileGallery.clear();cancelAnimationFrame(canvasBoundsFrame);cancelAnimationFrame(worldPlacementFrame);worldPlacementFrame=0;
 for(const video of world.querySelectorAll('video')){video.pause();video.removeAttribute('src');video.querySelectorAll('source').forEach(source=>source.removeAttribute('src'));video.load();}
 world.querySelectorAll('img').forEach(image=>image.removeAttribute('src'));world.replaceChildren();panDrag=null;viewport.classList.remove('panning');
}
viewport.addEventListener('pointerdown',e=>{if(e.button!==0)return;wasDragged=false;panDrag={id:e.pointerId,x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};});
viewport.addEventListener('pointermove',e=>{
 if(!panDrag||e.pointerId!==panDrag.id)return;
 const dx=e.clientX-panDrag.x,dy=e.clientY-panDrag.y;
 if(Math.hypot(dx,dy)>6){wasDragged=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('panning');}
 if(wasDragged){pan={x:panDrag.px+dx,y:panDrag.py+dy};placeWorld();}
});
function finishPan(e){if(!panDrag||e.pointerId!==panDrag.id)return;panDrag=null;if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);viewport.classList.remove('panning');setTimeout(()=>wasDragged=false,0);}
viewport.addEventListener('pointerup',finishPan);viewport.addEventListener('pointercancel',finishPan);viewport.addEventListener('lostpointercapture',finishPan);
viewport.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home')recenter();else{pan.x+=e.key==='ArrowLeft'?80:e.key==='ArrowRight'?-80:0;pan.y+=e.key==='ArrowUp'?80:e.key==='ArrowDown'?-80:0;placeWorld();}});
// Gallery is a contained world. All wheel axes stay in the camera until a section dot is selected.
let galleryLocked=true,sectionTravel=false,sectionTravelTimer=0,sectionDestination='gallery';
function lockGallery(locked){
 galleryLocked=locked;projectDialog.classList.toggle('gallery-locked',locked);
 for(const section of projectDialog.querySelectorAll('.v2-section'))section.inert=locked;
}
projectDialog.addEventListener('wheel',e=>{
 if(!galleryLocked)return;e.preventDefault();
 const unit=e.deltaMode===1?16:e.deltaMode===2?viewport.clientHeight:1;
 pan.x-=(e.shiftKey&&!e.deltaX?e.deltaY:e.deltaX)*unit;pan.y-=(e.shiftKey?0:e.deltaY)*unit;placeWorld();
},{capture:true,passive:false});
projectDialog.addEventListener('keydown',e=>{
 if(e.target.closest('.project-link-launcher,.project-sticker')||!galleryLocked||e.key==='Tab'||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown',' ','Home'].includes(e.key))return;
 e.preventDefault();e.stopPropagation();if(e.key==='Home'){recenter();return;}
 pan.x+=e.key==='ArrowLeft'?80:e.key==='ArrowRight'?-80:0;
 pan.y+=['ArrowUp','PageUp'].includes(e.key)?100:['ArrowDown','PageDown',' '].includes(e.key)?-100:0;placeWorld();
},{capture:true});
function applyLoops(){if(mobileExperience.matches){mobileGallery.schedule();if(loopsPaused)focusDialog.querySelectorAll('video').forEach(v=>v.pause());return;}for(const v of projectDialog.querySelectorAll('video')){if(loopsPaused)v.pause();else v.play().catch(()=>{});}}
reducedMotion.addEventListener('change',()=>{loopsPaused=reducedMotion.matches;applyLoops();});
window.addEventListener('resize',()=>{if(currentProject&&projectDialog.open)placeWorld();});
function setActiveSection(id){
 mobileGallery.schedule();
 projectDialog.querySelector('.canvas-hint').hidden=id!=='gallery'||projectDialog.scrollTop>2;
 for(const b of projectDialog.querySelectorAll('.journey-nav button')){const active=b.dataset.section===id;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');}
}
function updateReturnMotion(){
 const r=$('return').getBoundingClientRect(),p=reducedMotion.matches?1:Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight*.85)));
 const eased=1-(1-p)**3;
 $('return-mac').style.transform=`perspective(800px) translate3d(${(1-eased)*-140}px,${(1-eased)*65}px,0) rotateY(${(1-eased)*-65}deg)`;
 $('return-mac').style.opacity=String(Math.min(1,p*2));
 $('return-caption').style.opacity=String(Math.max(0,Math.min(1,(p-.65)/.35)));
}
function settleSectionTravel(id){
 sectionTravel=false;clearTimeout(sectionTravelTimer);if(projectDialog.scrollTop<=2)id='gallery';if(id==='gallery'){projectDialog.scrollTo({top:0,behavior:'instant'});lockGallery(true);}setActiveSection(id);updateReturnMotion();
}
function goSection(id){
 const section=$(id);clearTimeout(sectionTravelTimer);sectionDestination=id;sectionTravel=true;lockGallery(false);setActiveSection(id);
 projectDialog.scrollTo({top:id==='gallery'?0:section.offsetTop,behavior:reducedMotion.matches?'instant':'smooth'});
 sectionTravelTimer=setTimeout(()=>settleSectionTravel(id),reducedMotion.matches?0:1600);
}
projectDialog.addEventListener('scrollend',()=>{if(sectionTravel)settleSectionTravel(sectionDestination);});
projectDialog.querySelectorAll('.journey-nav button').forEach(b=>b.onclick=()=>goSection(b.dataset.section));
projectDialog.querySelector('[data-section="return"]').addEventListener('dblclick',e=>{e.preventDefault();clearTimeout(sectionTravelTimer);sectionTravel=false;closeProject();});
projectDialog.addEventListener('scroll',()=>{
 updateReturnMotion();if(sectionTravel)return;
 if(projectDialog.scrollTop<=2){lockGallery(true);setActiveSection('gallery');return;}
 if(galleryLocked){projectDialog.scrollTop=0;return;}
 const sections=[...projectDialog.querySelectorAll('.v2-journey>section')];let id='gallery';
 for(const section of sections)if(section.offsetTop<=projectDialog.scrollTop+projectDialog.clientHeight*.4)id=section.id;
 setActiveSection(id);
},{passive:true});
const returnMac=$('computer').cloneNode(true);returnMac.id='return-computer';returnMac.setAttribute('aria-label','Return to the project sleeve library');returnMac.tabIndex=0;returnMac.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));$('return-mac').append(returnMac);
openProject=function(pushRoute=true){
 closeFocus();const p=projects[selected];currentProject=p;whiteHome=false;applyTheme(p);
 if(!projectDialog.open){previousFocus=document.activeElement;savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';document.body.classList.add('project-open');projectDialog.showModal();}
 syncMatrixState();updateProjectLinkLauncher(p);$('v2-project-name').textContent=p.name;$('detail-title').textContent=p.name;$('detail-description').textContent=p.description;
 $('project-narrative').replaceChildren(...[p.aim,p.direction].filter(Boolean).map(t=>{const el=document.createElement('p');el.textContent=t;return el;}));
 $('project-info').replaceChildren(infoRow('Discipline',p.tags.join(' · ')),infoRow('Tools',p.tools||'Not specified in source'));
 $('project-links').replaceChildren(...Object.entries(p.links).filter(([,url])=>url).map(([key,url])=>{const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=({website:'Visit website',github:'View code',behance:'View case study',integration:'Explore project'})[key]+' ↗';return a;}));
 const returnCanvas=returnMac.querySelector('canvas'),returnImage=new Image();returnImage.onload=()=>{if(currentProject!==p||!projectDialog.open)return;const c=returnCanvas.getContext('2d');c.drawImage(returnImage,0,0,returnCanvas.width,returnCanvas.height);};returnImage.src=window.portfolioImageSource(p.hero,'thumb');
 clearTimeout(sectionTravelTimer);sectionTravel=false;lockGallery(false);renderCanvas(p);applyLoops();projectDialog.scrollTo({top:0,behavior:'instant'});lockGallery(true);setActiveSection('gallery');updateReturnMotion();
 projectDialog.prepend(ambient);projectDialog.append(wolfy);relocateWolfy(100);
 if(pushRoute)history.pushState({project:p.id,portfolio:true},'',`#project/${p.id}`);
 $('gallery-title').textContent=`${p.name} gallery`;
 // Focus the viewport without moving the canvas or the vertical journey.
 $('gallery-title').tabIndex=-1;$('gallery-title').focus({preventScroll:true});
};
closeProject=function(){
 clearTimeout(sectionTravelTimer);sectionTravel=false;lockGallery(false);lastSelectionAt=performance.now();closeFocus();projectDialog.querySelectorAll('video').forEach(v=>v.pause());
 history.pushState(null,'','#home');if(projectDialog.open)projectDialog.close();
 whiteHome=false;window.scrollTo({top:0,behavior:'instant'});applyTheme(projects[selected]);
 requestAnimationFrame(()=>{applyTheme(projects[selected]);relocateWolfy(80);});
};
$('v2-home').onclick=e=>{e.preventDefault();closeProject();};$('v2-close').onclick=closeProject;returnMac.onclick=closeProject;$('return-caption').onclick=closeProject;
projectDialog.addEventListener('close',()=>{closeFocus();disposeGallery();document.body.prepend(ambient);whiteHome=false;applyTheme(projects[selected]);syncMatrixState();});
// Existing syncRoute resolves project URLs using these V2 open/close functions.
const oldSyncRoute=syncRoute;
syncRoute=function(){oldSyncRoute();if(!projectDialog.open&&!menuDialog.open&&location.hash==='#home'){whiteHome=false;window.scrollTo({top:0,behavior:'instant'});applyTheme(projects[selected]);}};

// A sparse, short-lived glitter trail follows Wolfie, never the media.
const originalPlaceWolf=placeWolf;let lastWolfGlitter=0;
placeWolf=function(){originalPlaceWolf();if(reducedMotion.matches||performance.now()-lastWolfGlitter<120||!wolfMoving)return;lastWolfGlitter=performance.now();const glitter=document.createElement('i');glitter.className='wolf-glitter';glitter.style.left=(wolfX+28)+'px';glitter.style.top=(wolfY+50)+'px';wolfy.parentElement.append(glitter);glitter.addEventListener('animationend',()=>glitter.remove(),{once:true});};
// Wolfie follows the story: contact invitation, return Mac, and a fresh homepage welcome.
const baseWolfPerch=perch,baseWolfScroll=scrollWolf,baseCloseProject=closeProject;
let wolfScene='home',wolfArrivalMessage='',wolfArrivalScene='',wolfSceneTimer=0,wolfHomeTimer=0,wolfLastScrollAt=0;
let wolfReachTurn=0,wolfReturnTurn=0,wolfHomeTurn=0;
const wolfInvitations=[
 'You should definitely collaborate with Ish. I have excellent taste.',
 'Good ideas deserve good company. Email Ish — I’ll supervise.',
 'Your next great project could start with one hello.'
];
const wolfReturnLines=['Another world is one Mac away.','That was a good adventure. Shall we find another?','All paths lead back to the Mac. I checked.'];
const wolfHomeLines=['That was beautiful. Let’s check out more.','Fresh pixels, new possibilities. Pick another sleeve.','Back in the library. Where should we wander next?'];
function activeWolfScene(){return projectDialog.open?projectDialog.querySelector('.journey-nav .active')?.dataset.section||'gallery':'home';}
function dismissWolfSpeech(){
 clearTimeout(wolfSpeechTimer);clearTimeout(wolfClickTimer);wolfArrivalMessage='';
 wolfSpeech.classList.remove('speaking');wolfGreeting=false;
}
function anchorWolf(rect,heading=false){return {x:clamp(heading?rect.left:rect.left+rect.width*.5-28,12,innerWidth-70),y:clamp(rect.top-56,70,innerHeight-85),onMac:true};}
perch=function(vary=false){
 const scene=activeWolfScene();
 if(scene==='reach'){const heading=$('reach-title').getBoundingClientRect();if(heading.top>90&&heading.top<innerHeight-70)return anchorWolf(heading,true);}
 if(scene==='return'){const mac=returnMac.getBoundingClientRect();if(mac.top>75&&mac.top<innerHeight-70)return anchorWolf(mac);}
 if(scene==='home'){return {x:Math.max(12,innerWidth-100),y:Math.max(innerHeight*.54,innerHeight-100),onMac:false};}
 return baseWolfPerch(vary);
};
function speakArrival(){
 const message=wolfArrivalMessage;wolfArrivalMessage='';
 if(message&&activeWolfScene()===wolfArrivalScene){speakWolfie(message);wolfGreeting=false;wolfPerched=true;drawWolf();}
}
moveWolf=function(){
 wolfRaf=0;if(wolfPaused||wolfDrag||document.hidden)return;
 if(['reach','return'].includes(activeWolfScene())){const anchor=perch();wolfTargetX=anchor.x;wolfTargetY=anchor.y;}
 const dx=wolfTargetX-wolfX,dy=wolfTargetY-wolfY,distance=Math.hypot(dx,dy);
 wolfMoving=distance>1.5;wolfFacing=dx>=0?1:-1;
 if(wolfMoving&&!reducedMotion.matches){wolfX+=dx*.085;wolfY+=dy*.085;placeWolf();drawWolf();wolfRaf=requestAnimationFrame(moveWolf);}
 else{wolfX=wolfTargetX;wolfY=wolfTargetY;wolfMoving=false;wolfPerched=perch().onMac;placeWolf();drawWolf();speakArrival();}
};
function travelWolf(message=''){
 if(!wolfStarted||wolfPaused||wolfDrag)return;
 stopWolfPlay();clearTimeout(wolfScrollTimer);cancelAnimationFrame(wolfRaf);wolfRaf=0;
 if(wolfSpeech.parentElement!==wolfy.parentElement)wolfy.parentElement.append(wolfSpeech);
 const rest=perch();wolfGreeting=false;wolfFollow=false;wolfPerched=rest.onMac;wolfTargetX=rest.x;wolfTargetY=rest.y;
 wolfArrivalMessage=message;wolfArrivalScene=activeWolfScene();wolfy.classList.remove('wolf-travel');wolfy.classList.add('wolf-appear');
 if(reducedMotion.matches){wolfX=rest.x;wolfY=rest.y;placeWolf();drawWolf();speakArrival();}else wakeWolf();
}
function syncWolfScene(id=activeWolfScene()){
 if(sectionTravel||wolfDrag)return;
 const anchor=id==='reach'?$('reach-title'):id==='return'?returnMac:null;
 if(anchor){const rect=anchor.getBoundingClientRect();if(rect.top<90||rect.top>innerHeight-70)return;}
 if(id===wolfScene)return;wolfScene=id;dismissWolfSpeech();
 if(id==='reach')travelWolf(wolfInvitations[wolfReachTurn++%wolfInvitations.length]);
 else if(id==='return')travelWolf(wolfReturnLines[wolfReturnTurn++%wolfReturnLines.length]);
 else travelWolf();
}
window.removeEventListener('scroll',baseWolfScroll);projectDialog.removeEventListener('scroll',baseWolfScroll);window.removeEventListener('resize',baseWolfScroll);
scrollWolf=function(){
 wolfLastScrollAt=performance.now();dismissWolfSpeech();stopWolfPlay();clearTimeout(wolfSceneTimer);
 wolfSceneTimer=setTimeout(()=>{const scene=activeWolfScene();if(scene!==wolfScene)syncWolfScene(scene);else travelWolf();},180);
};
window.addEventListener('scroll',scrollWolf,{passive:true});projectDialog.addEventListener('scroll',scrollWolf,{passive:true});window.addEventListener('resize',scrollWolf);
window.addEventListener('wheel',()=>{dismissWolfSpeech();},{capture:true,passive:true});
viewport.addEventListener('pointerdown',dismissWolfSpeech,{capture:true});
wolfy.addEventListener('pointerdown',()=>{clearTimeout(wolfSceneTimer);clearTimeout(wolfHomeTimer);dismissWolfSpeech();},{capture:true});
relocateWolfy=function(delay=0){
 dismissWolfSpeech();clearTimeout(wolfScrollTimer);wolfScrollTimer=setTimeout(()=>travelWolf(),Math.min(delay,180));
};
const baseActiveSection=setActiveSection;
setActiveSection=function(id){baseActiveSection(id);if(!sectionTravel&&performance.now()-wolfLastScrollAt>150)syncWolfScene(id);};
closeProject=function(){
 dismissWolfSpeech();clearTimeout(wolfSceneTimer);clearTimeout(wolfHomeTimer);baseCloseProject();wolfScene='home';
 wolfHomeTimer=setTimeout(()=>{if(!projectDialog.open)travelWolf(wolfHomeLines[wolfHomeTurn++%wolfHomeLines.length]);},720);
};
returnMac.onclick=()=>closeProject();$('return-caption').onclick=()=>closeProject();$('v2-close').onclick=()=>closeProject();

// Project-specific miniature casing stickers also follow selector changes.
const selectWithoutMacStickers=select;
select=function(index,scroll=true){selectWithoutMacStickers(index,scroll);decorateProjectMac(projects[selected],returnMac);};
decorateProjectMac(projects[selected],returnMac);
for(const p of projects){const media=window.PORTFOLIO_MEDIA[p.id];if(media?.[0])p.hero=media[0];}
$('project-name').dataset.project=projects[selected].id;
drawPreview(projects[selected]);
applyTheme(projects[selected],0);sizeMatrix();if(!reducedMotion.matches)renderMatrix(performance.now());syncRoute();

// Mobile lifecycle also follows backgrounding, orientation and input-mode changes.
document.addEventListener('visibilitychange',()=>{mobileGallery.schedule();if(mobileExperience.matches&&document.hidden)focusDialog.querySelectorAll('video').forEach(video=>video.pause());});
mobileExperience.addEventListener('change',()=>{
 imageCache.clear();syncMatrixState();if(projectDialog.open&&currentProject){closeFocus();renderCanvas(currentProject);setActiveSection(projectDialog.querySelector('.journey-nav .active')?.dataset.section||'gallery');}
 drawPreview(projects[selected]);decorateProjectMac(projects[selected],returnMac);window.dispatchEvent(new Event('portfolio:media-mode'));
});
let galleryResizeTimer=0;window.addEventListener('resize',()=>{
 clearTimeout(galleryResizeTimer);galleryResizeTimer=setTimeout(()=>{if(mobileExperience.matches&&projectDialog.open&&Math.abs(viewport.clientWidth-mobileGalleryWidth)>2){mobileGalleryWidth=viewport.clientWidth;closeFocus();renderCanvas(currentProject);}},200);
});
