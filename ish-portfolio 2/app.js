/* No dependencies. Native dialog supplies focus containment and Escape behavior. */
'use strict';
document.documentElement.classList.add('js');
const $ = id => document.getElementById(id);
const projects=window.PROJECTS;
let selected = 0, previousFocus, savedOverflow;
let menuReturnHash="#home",menuClosing=false,menuSavedOverflow="";
let summaryFrame=0,summaryTimer,summaryVersion=0,summaryNeedsRestart=false;
const projectDialog = $('project-dialog'), menuDialog = $('menu-dialog');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const imageCache = new Map();
function select(index,scroll=true){
  selected=(index+projects.length)%projects.length; const p=projects[selected];
  document.documentElement.style.setProperty('--accent',p.accent);document.documentElement.style.setProperty('--halo-color',p.halo||p.accent);
  $('project-name').textContent=p.name;
  $('project-tags').replaceChildren(...p.tags.map(tag=>{const span=document.createElement('span');span.textContent=tag;return span;}));
  startProjectSummary(p);
  $('computer').setAttribute('aria-label',`Open ${p.name} project`);
  drawPreview(p);
}


function resetProjectSummary(){
 summaryVersion++;cancelAnimationFrame(summaryFrame);clearTimeout(summaryTimer);summaryNeedsRestart=true;
 $('project-category').replaceChildren();$('project-tags').hidden=true;
}
function summaryExcerpt(project){
 const full=[project.aim||project.description,project.direction].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
 const sentences=full.match(/[^.!?]+[.!?]?/g)||[full];
 const candidate=sentences.slice(0,2).join(' ').trim()+(sentences[2]?' '+sentences[2].trim().split(/\s+/).slice(0,Math.ceil(sentences[2].trim().split(/\s+/).length/2)).join(' '):'');
 const target=$('project-category'),style=getComputedStyle(target),ctx=document.createElement('canvas').getContext('2d');ctx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
 const width=Math.max(160,target.clientWidth),words=candidate.split(/\s+/);
 function fits(text){let lines=1,line='';for(const word of (text+' … Click to know more.').split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width>width){lines++;line=word;}else line=next;}return lines<=3;}
 while(words.length>1&&!fits(words.join(' ')))words.pop();
 return words.join(' ').replace(/[.,;:!?]$/,'')+'…';
}
function startProjectSummary(project){
 resetProjectSummary();summaryNeedsRestart=false;const version=summaryVersion;
 summaryTimer=setTimeout(()=>{
  if(version!==summaryVersion)return;
  const text=summaryExcerpt(project),target=$('project-category'),accessible=document.createElement('span'),visual=document.createElement('span');
  accessible.className='sr-only';accessible.textContent=text;visual.setAttribute('aria-hidden','true');target.append(accessible,visual);
  let start;function tick(now){
   if(version!==summaryVersion)return;if(!start)start=now;
   const length=reducedMotion.matches?text.length:Math.min(text.length,Math.floor((now-start)/18)+1);visual.textContent=text.slice(0,length);
   if(length<text.length){summaryFrame=requestAnimationFrame(tick);return;}
   const more=document.createElement('button');more.className='summary-more';more.textContent='Click to know more.';more.addEventListener('click',()=>openProject());target.append(' ',more);$('project-tags').hidden=false;
  }summaryFrame=requestAnimationFrame(tick);
 },document.documentElement.classList.contains('intro-done')?120:2250);
}
function drawPreview(p){
  const canvas=$('preview'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,88,66);
  if(!p.hero)return;
  const previewSource=window.portfolioImageSource(p.hero,'thumb');
  const paint=img=>{if(projects[selected]!==p)return;ctx.clearRect(0,0,88,66);const ratio=Math.max(88/img.width,66/img.height);ctx.drawImage(img,(88-img.width*ratio)/2,(66-img.height*ratio)/2,img.width*ratio,img.height*ratio);};
  if(imageCache.has(previewSource)){paint(imageCache.get(previewSource));return;}
  const img=new Image();img.decoding='async';img.onload=()=>{imageCache.set(previewSource,img);while(imageCache.size>3)imageCache.delete(imageCache.keys().next().value);paint(img);};img.src=previewSource;
}
function infoRow(label,value){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);return row;}
function openProject(pushRoute=true){
  const p=projects[selected];if(!projectDialog.open)previousFocus=document.activeElement;
  projectDialog.querySelectorAll('.project-information details').forEach((d,index)=>d.open=index===0);
  $('breadcrumb').textContent=`▱ / projects / ${p.id}`;$('detail-title').textContent=p.name;$('detail-description').textContent=p.description;
  $('project-narrative').replaceChildren(...[p.aim,p.direction].filter(Boolean).map(text=>{const paragraph=document.createElement('p');paragraph.textContent=text;return paragraph;}));
  $('project-info').replaceChildren(infoRow('Discipline',p.tags.join(', ')),infoRow('Tools',p.tools||'To be added'));
  $('project-highlights').replaceChildren(...[p.aim,p.direction].filter(Boolean).map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
  const collage=$('collage');collage.replaceChildren();
  [p.hero,...p.screenshots].slice(0,p.imageLimit||8).forEach((src,i)=>{const f=document.createElement('figure');f.className='shot';f.dataset.layout=String(p.layout%3);if(i>2)f.style.gridColumn=`span ${((p.layout*5+i*7)%5<2)?3:2}`;f.style.setProperty('--tilt',`${((p.layout*7+i*3)%7-3)*.65}deg`);
    if(src){const img=document.createElement('img');img.src=src;img.alt=`${p.name} — ${i===0?'project overview':`screenshot ${i}`}`;img.decoding='async';f.append(img);f.classList.add('has-image');addImageMotion(f);addPixelSparks(f);}else{const span=document.createElement('span');span.className='empty';span.textContent=String(i).padStart(2,'0');f.setAttribute('aria-label',`Empty screenshot slot ${i}`);span.setAttribute('aria-hidden','true');f.append(span);}collage.append(f);});
  $('project-links').replaceChildren(...Object.entries({github:'GitHub (Code)',website:'Live website',behance:'Behance (Case Study)',integration:'Purchase / Integrate Code'}).sort(([a],[b])=>Number(Boolean(p.links[b]))-Number(Boolean(p.links[a]))).map(([key,label])=>{const url=p.links[key];const row=document.createElement(url?'a':'div');row.className='link-row'+(url?'':' link-unavailable');if(!url)row.setAttribute('aria-disabled','true');const text=document.createElement('span');text.textContent=label;row.append(text);if(url){row.href=url;row.target='_blank';row.rel='noopener noreferrer';row.append('↗');addPixelSparks(row);}else{const small=document.createElement('small');small.textContent='Coming soon';row.append(small);}return row;}));
  if(pushRoute)history.pushState({project:p.id,portfolio:true},'',`#project/${p.id}`); if(!projectDialog.open){savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';document.body.classList.add('project-open');projectDialog.showModal();}projectDialog.append($('wolfy'));relocateWolfy(650);projectDialog.scrollTop=0;$('detail-title').focus({preventScroll:true});
}
function closeProject(){
  history.pushState(null,'','#home');
  if(projectDialog.open)projectDialog.close();
  window.scrollTo({top:0,behavior:'instant'});
}

function syncRoute(){
  if(location.hash==='#menu'){openMenu(false);return;}
  if(menuDialog.open)closeMenuUI();
  const id=location.hash.startsWith('#project/')?decodeURIComponent(location.hash.slice(9)):null;
  const index=projects.findIndex(p=>p.id===id);
  if(index>=0){if(!projectDialog.open||selected!==index){select(index);openProject(false);}}
  else if(projectDialog.open)projectDialog.close();
}
window.addEventListener('popstate',syncRoute);
window.addEventListener('hashchange',syncRoute);
projectDialog.addEventListener('cancel',e=>{e.preventDefault();closeProject();});
projectDialog.addEventListener('close',()=>{document.body.append($('wolfy'));document.body.classList.remove('project-open');document.body.style.overflow=savedOverflow||'';previousFocus?.focus({preventScroll:true});relocateWolfy(650);});
$('open-project').addEventListener('click',()=>openProject());$('computer').addEventListener('click',()=>openProject());$('close-project').addEventListener('click',closeProject);$('detail-home').addEventListener('click',e=>{e.preventDefault();closeProject();});

// Menu panels reuse the source content, rather than navigating away.
['experience','education','contact'].forEach(id=>{
 const source=document.querySelector(`#${id} .section-body`).cloneNode(true);
 source.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
 if(id==='contact')source.querySelectorAll('[download]').forEach(node=>node.remove());
 $(`menu-${id}`).append(source);
});
function openMenu(push=true){
 if(typeof stopWolfPlay==='function')stopWolfPlay();
 if(menuDialog.open)return;menuClosing=false;menuDialog.classList.remove('menu-closing');
 if(push){menuReturnHash=location.hash||'#home';history.pushState({portfolioMenu:true,returnHash:menuReturnHash},'','#menu');}
 $('menu-button').setAttribute('aria-expanded','true');menuSavedOverflow=document.body.style.overflow;menuDialog.showModal();document.body.classList.add('menu-open');document.body.style.overflow='hidden';
}
function closeMenuUI(){
 if(!menuDialog.open||menuClosing)return;menuClosing=true;menuDialog.classList.add('menu-closing');
 setTimeout(()=>{menuDialog.close();menuDialog.classList.remove('menu-closing');menuClosing=false;},reducedMotion.matches?0:260);
}
function requestCloseMenu(){
 if(location.hash==='#menu'&&history.state?.portfolioMenu)history.back();
 else {if(location.hash==='#menu')history.replaceState(null,'',menuReturnHash);closeMenuUI();}
}
$('menu-button').addEventListener('click',()=>openMenu());$('close-menu').addEventListener('click',requestCloseMenu);
menuDialog.addEventListener('cancel',event=>{event.preventDefault();requestCloseMenu();});
menuDialog.addEventListener('click',event=>{const box=menuDialog.getBoundingClientRect();if(event.target===menuDialog&&(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom))requestCloseMenu();});
menuDialog.addEventListener('close',()=>{$('menu-button').setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');document.body.style.overflow=menuSavedOverflow;});
$('menu-brand').addEventListener('click',event=>{event.preventDefault();menuDialog.addEventListener('close',()=>{history.replaceState(null,'','#home');window.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'});},{once:true});requestCloseMenu();});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}});},{threshold:.12});document.querySelectorAll('.reveal').forEach(s=>observer.observe(s));}else{document.querySelectorAll('.reveal').forEach(s=>s.classList.add('visible'));}
select(0,false);
const brand=document.querySelector('.brand');
function finishLanding(){
 document.documentElement.classList.add('intro-done');
 setTimeout(()=>{startWolfy();settleWolfy();},80);
}
if(reducedMotion.matches||location.hash.startsWith('#project/'))finishLanding();
else document.body.classList.add('library-loading');
// Reveal text once as it enters view; retain complete text for assistive technology.
if(!reducedMotion.matches && !window.PORTFOLIO_MOBILE_QUERY.matches && 'IntersectionObserver' in window){
 const pending=new Map();
 const typingObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   typingObserver.unobserve(entry.target);
   const letters=pending.get(entry.target);pending.delete(entry.target);
   let start,index=0;const duration=Math.min(1750,Math.max(225,letters.length*8));
   function tick(now){
    if(!start)start=now;
    const end=reducedMotion.matches?letters.length:Math.min(letters.length,Math.floor((now-start)/duration*letters.length)+1);
    while(index<end)letters[index++].classList.add('is-typed');
    if(index<letters.length)requestAnimationFrame(tick);
   }
   requestAnimationFrame(tick);
  }
 },{threshold:.3});
 const targets=document.querySelectorAll('.bio');
 for(const target of targets){
  const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT),nodes=[];let node;
  while((node=walker.nextNode()))if(node.textContent.trim())nodes.push(node);
  const letters=[];
  for(const textNode of nodes){
   const fragment=document.createDocumentFragment(),accessible=document.createElement('span');
   accessible.className='sr-only';accessible.textContent=textNode.textContent;fragment.append(accessible);
   const visual=document.createElement('span');visual.setAttribute('aria-hidden','true');
   for(const character of textNode.textContent){const span=document.createElement('span');span.className='type-char';span.textContent=character;letters.push(span);visual.append(span);}
   fragment.append(visual);textNode.replaceWith(fragment);
  }
  pending.set(target,letters);typingObserver.observe(target);
 }
 reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){document.querySelectorAll('.type-char').forEach(char=>char.classList.add('is-typed'));typingObserver.disconnect();pending.clear();}});
}
function addPixelSparks(target){
 target.classList.add('pixel-hover');
 let sparks=target.querySelector(':scope > .sparks'),lastSpark=0;
 if(!sparks){sparks=document.createElement('span');sparks.className='sparks';sparks.setAttribute('aria-hidden','true');target.append(sparks);}
 target.addEventListener('pointermove',e=>{
  if(reducedMotion.matches||e.pointerType==='touch'||performance.now()-lastSpark<55)return;
  lastSpark=performance.now();const box=target.getBoundingClientRect();
  for(let i=0;i<3;i++){
   const dot=document.createElement('i');dot.style.left=`${e.clientX-box.left}px`;dot.style.top=`${e.clientY-box.top}px`;
   dot.style.setProperty('--dx',`${(Math.random()-.5)*45}px`);dot.style.setProperty('--dy',`${(Math.random()-.5)*45}px`);
   sparks.append(dot);dot.addEventListener('animationend',()=>dot.remove(),{once:true});
  }
 });
 target.addEventListener('pointerleave',()=>sparks.replaceChildren());
}
document.querySelectorAll('.bio,.resume .section-heading h2,#experience summary,#education .education>div,#contact a').forEach(addPixelSparks);

function addImageMotion(figure){
 let frame;
 figure.addEventListener('pointermove',e=>{
  if(reducedMotion.matches||e.pointerType==='touch')return;
  const {clientX,clientY}=e;
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{
   const rect=figure.getBoundingClientRect(),x=Math.max(-.5,Math.min(.5,(clientX-rect.left)/rect.width-.5)),y=Math.max(-.5,Math.min(.5,(clientY-rect.top)/rect.height-.5));
   figure.style.setProperty('--rx',`${-y*9}deg`);figure.style.setProperty('--ry',`${x*9}deg`);
   figure.style.setProperty('--mx',`${x*5}px`);figure.style.setProperty('--my',`${y*5}px`);
  });
 });
 figure.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);['--rx','--ry','--mx','--my'].forEach(key=>figure.style.removeProperty(key));});
}

// Wolfy greets beside the tooltip, then rests on the Mac. Following is opt-in.
const wolfy=$('wolfy'),wolfSprite=wolfy.querySelector('.wolfy-sprite');
let wolfStarted=false,wolfPaused=false,wolfFollow=false,wolfGreeting=true,wolfPerched=false,wolfX=0,wolfY=0,wolfTargetX=0,wolfTargetY=0,wolfFrame=0,wolfRaf=0,wolfMoving=false,wolfFacing=1,wolfRestTimer,wolfScrollTimer,wolfClickTimer,lastWolfPointer=0,wolfChasing=false,wolfPlayTimers=[];
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
let wolfRestEpoch=0;
function perch(vary=false){
 // Begin on the Mac for five seconds, then favour the bottom-right corner.
 const elapsed=wolfRestEpoch?(performance.now()-wolfRestEpoch)/1000:0;
 const cycle=elapsed%60;
 if(elapsed>=5&&cycle>=5&&cycle<45)return {x:Math.max(12,innerWidth-110),y:Math.max(12,innerHeight-98),onMac:false};
 if(projectDialog.open){
  const shots=[...document.querySelectorAll('.has-image')].map(e=>e.getBoundingClientRect()).filter(r=>r.bottom>100&&r.top<innerHeight-80);
  const picture=shots.length?shots[vary?Math.floor(Math.random()*shots.length):0]:null;
  if(picture)return {x:clamp(picture.left+picture.width*.65-28,12,innerWidth-70),y:clamp(picture.top-55,65,innerHeight-85),onMac:true};
 }
 const mac=$('computer').getBoundingClientRect();
 if(!projectDialog.open&&mac.top>65&&mac.bottom<innerHeight-50)return {x:mac.left+mac.width/2-28,y:mac.top-56,onMac:true};
 const bio=document.querySelector('#experience').getBoundingClientRect();
 return {x:clamp(bio.left,12,innerWidth-70),y:clamp(bio.top-66,70,Math.min(135,innerHeight-85)),onMac:false};
}
function relocateWolfy(delay=0){
 stopWolfPlay();
 if($('wolfy').hidden)return;const speech=$('wolf-speech');if(speech&&speech.parentElement!==wolfy.parentElement)wolfy.parentElement.append(speech);wolfGreeting=false;wolfFollow=false;wolfy.classList.add('wolf-travel');
 clearTimeout(wolfScrollTimer);wolfScrollTimer=setTimeout(()=>{
  const rest=perch();wolfPerched=rest.onMac;wolfX=wolfTargetX=rest.x;wolfY=wolfTargetY=rest.y;wolfMoving=false;
  placeWolf();drawWolf();wolfy.classList.remove('wolf-travel','wolf-appear');requestAnimationFrame(()=>wolfy.classList.add('wolf-appear'));
 },delay);
}

function drawWolf(){
 let row=wolfMoving?(wolfFacing>0?1:2):wolfGreeting?3:wolfPerched?5:0;
 let frame=wolfMoving?wolfFrame%8:wolfGreeting?wolfFrame%4:wolfPerched?1:wolfFrame%6;
 const inward=wolfX>innerWidth*.65&&!wolfMoving;
 wolfSprite.style.transform=inward||(wolfPerched&&!wolfMoving&&!wolfGreeting&&Math.floor(wolfFrame/24)%3===1)?'scaleX(-1)':'none';
 wolfSprite.style.backgroundPosition=`${frame/7*100}% ${row/10*100}%`;
}
function placeWolf(){if(!projectDialog.open){wolfX=clamp(wolfX,12,innerWidth-70);wolfTargetX=clamp(wolfTargetX,12,innerWidth-70);wolfY=clamp(wolfY,innerHeight*.54,innerHeight-85);wolfTargetY=clamp(wolfTargetY,innerHeight*.54,innerHeight-85);}wolfy.style.transform=`translate3d(${wolfX}px,${wolfY}px,0)`;positionWolfSpeech();}
function wakeWolf(){if(!wolfRaf&&!wolfPaused&&!reducedMotion.matches)wolfRaf=requestAnimationFrame(moveWolf);}
function moveWolf(){
 wolfRaf=0;if(wolfPaused||reducedMotion.matches||document.hidden)return;
 const dx=wolfTargetX-wolfX,dy=wolfTargetY-wolfY,distance=Math.hypot(dx,dy);
 wolfMoving=distance>1.5;wolfFacing=dx>=0?1:-1;
 if(wolfMoving){wolfX+=dx*(wolfChasing?.09:.018);wolfY+=dy*(wolfChasing?.09:.018);placeWolf();wolfRaf=requestAnimationFrame(moveWolf);}else{wolfX=wolfTargetX;wolfY=wolfTargetY;placeWolf();drawWolf();}
}
function settleWolfy(){
 wolfGreeting=false;const rest=perch();wolfPerched=rest.onMac;wolfTargetX=rest.x;wolfTargetY=rest.y;
 if(reducedMotion.matches){wolfX=rest.x;wolfY=rest.y;placeWolf();drawWolf();}else wakeWolf();
}
function startWolfy(){
 if(wolfStarted)return;wolfStarted=true;wolfRestEpoch=performance.now();
 const origin={right:innerWidth-110,bottom:innerHeight-37};
 wolfX=clamp(origin.right+7,12,innerWidth-70);wolfY=clamp(origin.bottom-61,65,innerHeight-85);
 if(projectDialog.open){const rest=perch();wolfGreeting=false;wolfPerched=true;wolfX=rest.x;wolfY=rest.y;}
 wolfTargetX=wolfX;wolfTargetY=wolfY;wolfy.hidden=false;wolfy.classList.add('wolf-appear');placeWolf();drawWolf();
 wolfy.title='Click to chat; double-click to follow the pointer';wolfy.setAttribute('aria-label','Talk to Wolfie');wolfy.setAttribute('aria-keyshortcuts','Shift+Enter Shift+Space');
 setInterval(()=>{if(!wolfPaused&&!reducedMotion.matches&&!document.hidden){wolfFrame++;drawWolf();}},150);
 setInterval(()=>{
  if(wolfPaused||wolfFollow||wolfGreeting||wolfChasing||menuDialog.open||reducedMotion.matches||document.hidden)return;
  const rest=perch(true);if(rest.onMac&&!projectDialog.open&&Math.random()<.6){playWithBug();return;}wolfPerched=rest.onMac;wolfTargetX=clamp(rest.x+(Math.random()-.5)*42,12,innerWidth-70);wolfTargetY=rest.y;wakeWolf();
 },14000);
}
window.addEventListener('pointermove',e=>{
 if(!wolfStarted||!wolfFollow||wolfGreeting||wolfPaused||reducedMotion.matches||e.pointerType==='touch'||menuDialog.open||performance.now()-lastWolfPointer<160)return;
 lastWolfPointer=performance.now();wolfPerched=false;
 const dx=wolfX+28-e.clientX,dy=wolfY+30-e.clientY,d=Math.hypot(dx,dy)||1;
 wolfTargetX=clamp(e.clientX+dx/d*140-28,12,innerWidth-70);wolfTargetY=clamp(e.clientY+dy/d*140-30,75,innerHeight-85);
 wakeWolf();clearTimeout(wolfRestTimer);wolfRestTimer=setTimeout(()=>{if(!wolfPaused)settleWolfy();},5000);
},{passive:true});
function scrollWolf(){
 stopWolfPlay();
 if(!wolfStarted||wolfPaused)return;
 wolfGreeting=false;wolfy.classList.remove('wolf-appear');wolfy.classList.add('wolf-travel');clearTimeout(wolfScrollTimer);
 wolfScrollTimer=setTimeout(()=>{const rest=perch();wolfPerched=rest.onMac;wolfX=wolfTargetX=rest.x;wolfY=wolfTargetY=rest.y;wolfMoving=false;placeWolf();drawWolf();wolfy.classList.remove('wolf-travel');wolfy.classList.add('wolf-appear');},180);
}
window.addEventListener('scroll',scrollWolf,{passive:true});projectDialog.addEventListener('scroll',scrollWolf,{passive:true});window.addEventListener('resize',scrollWolf);
function toggleWolfFollowing(){clearTimeout(wolfClickTimer);wolfFollow=!wolfFollow;wolfPaused=false;wolfy.setAttribute('aria-label','Talk to Wolfie');wolfy.title=wolfFollow?'Following enabled — double-click to stop':'Double-click to follow the pointer';if(!wolfFollow)settleWolfy();}
wolfy.addEventListener('dblclick',toggleWolfFollowing);
wolfy.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.shiftKey){e.preventDefault();toggleWolfFollowing();}});
wolfy.addEventListener('click',()=>{clearTimeout(wolfClickTimer);wolfClickTimer=setTimeout(speakWolfie,240);});
wolfy.addEventListener('keydown',event=>{if(event.code==='Space'&&event.shiftKey){event.preventDefault();wolfPaused=!wolfPaused;if(wolfPaused){cancelAnimationFrame(wolfRaf);wolfRaf=0;}else wakeWolf();}});
reducedMotion.addEventListener('change',()=>{cancelAnimationFrame(wolfRaf);wolfRaf=0;wolfMoving=false;settleWolfy();});

// First fold: a stationary cursor gets a small burst; movement clears it immediately.
const cursorSparks=document.createElement('span');cursorSparks.className='sparks cursor-sparks';cursorSparks.setAttribute('aria-hidden','true');document.body.append(cursorSparks);
let cursorPauseTimer,cursorBurstTimer;
function clearCursorSparks(){clearTimeout(cursorPauseTimer);clearTimeout(cursorBurstTimer);cursorSparks.replaceChildren();}
function canSparkAt(x,y){
 if(reducedMotion.matches||document.hidden||projectDialog.open||menuDialog.open||!document.documentElement.classList.contains('intro-done'))return false;
 const hero=$('work').getBoundingClientRect();return x>=hero.left&&x<=hero.right&&y>=Math.max(0,hero.top)&&y<=Math.min(innerHeight,hero.bottom);
}
window.addEventListener('pointermove',event=>{
 clearCursorSparks();if(event.pointerType!=='mouse')return;
 const x=event.clientX,y=event.clientY;if(!canSparkAt(x,y))return;
 cursorPauseTimer=setTimeout(()=>{
  let waves=0;
  function sparkle(){
   if(!canSparkAt(x,y)){clearCursorSparks();return;}
   for(let i=0;i<4;i++){
    const dot=document.createElement('i');dot.style.left=`${x+(Math.random()-.5)*8}px`;dot.style.top=`${y+(Math.random()-.5)*8}px`;
    dot.style.setProperty('--dx',`${(Math.random()-.5)*44}px`);dot.style.setProperty('--dy',`${(Math.random()-.5)*44}px`);
    cursorSparks.append(dot);dot.addEventListener('animationend',()=>dot.remove(),{once:true});
   }
   if(++waves<5)cursorBurstTimer=setTimeout(sparkle,140);
  }
  sparkle();
 },220);
},{passive:true});
window.addEventListener('scroll',clearCursorSparks,{passive:true});window.addEventListener('blur',clearCursorSparks);document.addEventListener('pointerleave',clearCursorSparks);document.addEventListener('visibilitychange',clearCursorSparks);reducedMotion.addEventListener('change',clearCursorSparks);

const bioPixels=document.createElement('span');bioPixels.className='bio-tail-pixels';bioPixels.setAttribute('aria-hidden','true');
for(let i=0;i<10;i++){const pixel=document.createElement('i');pixel.style.setProperty('--pixel-x',`${(i-4.5)*7}px`);pixel.style.setProperty('--pixel-delay',`${i*.055}s`);bioPixels.append(pixel);}document.querySelector('.bio')?.append(bioPixels);

// Original, lightweight Wolfie one-liners. The greeting repeats every seventh click.
const wolfSpeech=document.createElement('span');wolfSpeech.id='wolf-speech';wolfSpeech.className='wolf-speech';wolfSpeech.setAttribute('role','status');wolfSpeech.setAttribute('aria-live','polite');document.body.append(wolfSpeech);
const wolfLines=[
 'I chase bugs so Ish can design the buttons.',
 'Humans invented meetings. Dogs invented naps. Just saying.',
 'Good UX is when even a wolf knows where to click.',
 'AI can fetch answers. I can fetch absolutely nothing.',
 'Your code has bugs? I call that a snack menu.',
 'Take a breath. Even good ideas need a little whitespace.',
 'I tried responsive design. Now I fit on every screen.',
 'Tired of work? Take a tiny break and look at a cool design.',
 'My design process: sniff, explore, nap, iterate.',
 'The best button is the one you do not have to hunt for.',
 'This portfolio has more layers than my winter coat.',
 'I am not a chatbot. I am a very small creative director.'
];
let wolfSpeechTimer,wolfSpeechCount=0;
function positionWolfSpeech(){
 const speech=$('wolf-speech');if(!speech||!speech.classList.contains('speaking'))return;
 speech.style.left=`${clamp(wolfX-18,12,innerWidth-Math.min(240,innerWidth-24)-12)}px`;
 speech.style.top=`${wolfY<125?wolfY+68:wolfY-85}px`;
}
function speakWolfie(message){
 stopWolfPlay();
 const speech=$('wolf-speech');if(speech.parentElement!==wolfy.parentElement)wolfy.parentElement.append(speech);
 wolfSpeechCount++;speech.replaceChildren();
 if(!message&&wolfSpeechCount%7===0){
  const pick=projects[Math.floor(Math.random()*projects.length)];
  speech.append('Have you checked out ');
  const link=document.createElement('button');link.className='wolf-project-link';link.textContent=pick.name;
  link.addEventListener('click',()=>{select(projects.indexOf(pick));openProject();speech.classList.remove('speaking');});
  speech.append(link,'? So cool. Give it a look!');
 }else speech.textContent=message||((wolfSpeechCount-1)%7===0?"Hi, I'm Wolfie. I'm Ish's friend.":wolfLines[(wolfSpeechCount-2)%wolfLines.length]);
 clearTimeout(wolfSpeechTimer);speech.classList.add('speaking');positionWolfSpeech();cancelAnimationFrame(wolfRaf);wolfRaf=0;wolfMoving=false;wolfGreeting=true;drawWolf();
 wolfSpeechTimer=setTimeout(()=>{speech.classList.remove('speaking');wolfGreeting=false;drawWolf();if(!wolfPaused)settleWolfy();},3200);
}

// A tiny occasional visitor gives Wolfie something to investigate on the Mac.
const wolfBug=document.createElement('span');wolfBug.className='wolf-bug';wolfBug.hidden=true;wolfBug.setAttribute('aria-hidden','true');document.body.append(wolfBug);
function stopWolfPlay(){
 const bug=document.querySelector('.wolf-bug');if(!bug)return;
 wolfPlayTimers.forEach(clearTimeout);wolfPlayTimers=[];wolfChasing=false;
 bug.hidden=true;
}
function playWithBug(){
 stopWolfPlay();if(reducedMotion.matches||menuDialog.open||projectDialog.open)return;
 const rest=perch();if(!rest.onMac)return;
 wolfChasing=true;wolfBug.hidden=false;
 const steps=[24,-24,18,-10];
 steps.forEach((offset,index)=>wolfPlayTimers.push(setTimeout(()=>{
  wolfBug.style.transform=`translate3d(${rest.x+28+offset}px,${rest.y+42-(index%2)*9}px,0)`;
  wolfTargetX=rest.x+offset*.7;wolfTargetY=rest.y;wolfPerched=true;wakeWolf();
 },index*720)));
 wolfPlayTimers.push(setTimeout(()=>{stopWolfPlay();settleWolfy();},3300));
}

// Pointer capture keeps pickup and release reliable for mouse, pen, and touch.
let wolfDrag=null,wolfSuppressClickUntil=0,wolfDropCount=0,lastDragSpark=0;
const dropLines=["Whoa, thanks. That was fun.","First-class travel. Five paws out of five.","New perspective unlocked. Same excellent fur.","You handle the dragging. I handle the wagging."];
const dragSparks=document.createElement('span');dragSparks.className='sparks wolf-drag-sparks';dragSparks.setAttribute('aria-hidden','true');document.body.append(dragSparks);
wolfy.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 stopWolfPlay();clearTimeout(wolfRestTimer);clearTimeout(wolfSpeechTimer);clearTimeout(wolfClickTimer);
 cancelAnimationFrame(wolfRaf);wolfRaf=0;wolfFollow=false;wolfGreeting=true;
 wolfDrag={id:e.pointerId,x:e.clientX,y:e.clientY,ox:e.clientX-wolfX,oy:e.clientY-wolfY,moved:false};
 wolfy.setPointerCapture(e.pointerId);
});
wolfy.addEventListener('pointermove',e=>{
 if(!wolfDrag||wolfDrag.id!==e.pointerId)return;
 e.stopPropagation();
 if(!wolfDrag.moved&&Math.hypot(e.clientX-wolfDrag.x,e.clientY-wolfDrag.y)<5)return;
 wolfDrag.moved=true;wolfGreeting=true;wolfMoving=false;wolfPerched=false;wolfy.classList.add('wolf-dragging');$('wolf-speech').classList.remove('speaking');
 wolfX=wolfTargetX=clamp(e.clientX-wolfDrag.ox,0,innerWidth-56);wolfY=wolfTargetY=clamp(e.clientY-wolfDrag.oy,0,innerHeight-61);placeWolf();drawWolf();
 if(!reducedMotion.matches&&performance.now()-lastDragSpark>45){
  lastDragSpark=performance.now();if(dragSparks.parentElement!==wolfy.parentElement)wolfy.parentElement.append(dragSparks);
  for(let i=0;i<3;i++){const dot=document.createElement('i');dot.style.left=`${e.clientX+(Math.random()-.5)*16}px`;dot.style.top=`${e.clientY+(Math.random()-.5)*16}px`;dot.style.setProperty('--dx',`${(Math.random()-.5)*35}px`);dot.style.setProperty('--dy',`${(Math.random()-.5)*35}px`);dragSparks.append(dot);dot.addEventListener('animationend',()=>dot.remove(),{once:true});}
 }
});
function releaseWolf(e){
 if(!wolfDrag||wolfDrag.id!==e.pointerId)return;
 const moved=wolfDrag.moved;wolfDrag=null;wolfy.classList.remove('wolf-dragging');
 if(wolfy.hasPointerCapture(e.pointerId))wolfy.releasePointerCapture(e.pointerId);
 if(moved){wolfSuppressClickUntil=performance.now()+450;clearTimeout(wolfClickTimer);speakWolfie(dropLines[wolfDropCount++%dropLines.length]);}
}
wolfy.addEventListener('pointerup',releaseWolf);wolfy.addEventListener('pointercancel',releaseWolf);wolfy.addEventListener('lostpointercapture',releaseWolf);
wolfy.addEventListener('click',e=>{if(performance.now()<wolfSuppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
wolfy.addEventListener('dragstart',e=>e.preventDefault());

// Detail navigation wraps through the same order as the home carousel.
for(const [id,step] of [['detail-previous',-1],['detail-next',1]]){
 $(id).addEventListener('click',()=>{select(selected+step);openProject();$(id).focus({preventScroll:true});});
}

// Re-evaluate the preferred resting spot without interrupting play or conversation.
setInterval(()=>{
 if(!wolfStarted||wolfDrag||wolfMoving||wolfGreeting||wolfChasing||wolfFollow||wolfPaused||menuDialog.open||document.hidden)return;
 const rest=perch();
 if(performance.now()<wolfStrollUntil&&!rest.onMac)return;
 if(Math.abs(wolfTargetX-rest.x)>12||Math.abs(wolfTargetY-rest.y)>25){wolfPerched=rest.onMac;wolfTargetX=rest.x;wolfTargetY=rest.y;wakeWolf();}
},1000);
wolfy.addEventListener('pointerenter',()=>{if(!wolfDrag&&!wolfMoving&&!wolfGreeting){wolfFrame+=24;drawWolf();}});

// A quiet corner personality: a little pacing, then an occasional thought.
const cornerLines=[
 'May the source be with you.',
 'To infinity… and one more tiny revision.',
 'Houston, we have a padding problem.',
 'My favourite plot twist? A button exactly where you expected it.',
 'Good design leaves room for a small wolf.',
 'I came for the pixels. I stayed for the thoughtful details.',
 'A little less friction. A little more tail wagging.',
 'The sequel is called: It Works on Mobile Too.',
 'Some chase deadlines. I prefer chasing bugs.',
 'Today’s creative direction: curious ears, clear hierarchy.'
];
let cornerTurn=0,wolfStrollUntil=0;
setInterval(()=>{
 if(!wolfStarted||wolfDrag||wolfMoving||wolfGreeting||wolfChasing||wolfFollow||wolfPaused||menuDialog.open||document.hidden||reducedMotion.matches)return;
 const rest=perch();if(rest.onMac||rest.x<innerWidth*.65)return;
 if(++cornerTurn%3===0){speakWolfie(cornerLines[Math.floor(Math.random()*cornerLines.length)]);return;}
 wolfStrollUntil=performance.now()+6500;wolfPerched=false;wolfTargetX=clamp(innerWidth*.48+Math.random()*(rest.x-innerWidth*.48),12,rest.x);wolfTargetY=rest.y;wakeWolf();
},11000);
