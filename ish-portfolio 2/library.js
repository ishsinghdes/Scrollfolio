/* Scroll Wheel Library — Ish Singh. Native transforms, a recycled 13-sleeve pool,
   and a simple opacity transition. No carousel or 3D dependency. */
'use strict';
const library=$('sleeve-library'),sleeveTrack=library.querySelector('.sleeve-track');
const libraryEntries=[null,...projects],entryCount=libraryEntries.length;
const wrapEntry=n=>((n%entryCount)+entryCount)%entryCount;
let libraryPosition=projectDialog.open?selected+1:0,libraryTarget=libraryPosition,libraryRaf=0,librarySnap=0,libraryDrag=null,libraryOpening=false,libraryInternalSelect=false,libraryEntry=-1;
let libraryEntering=false;
let sleeveWidth=216,sleeveHeight=233,libraryMoved=false,libraryPointerClickUntil=0;
const sleeves=Array.from({length:13},()=>{
 const b=document.createElement('button');b.type='button';b.className='sleeve';b.innerHTML='<span class="sleeve-face"><span class="sleeve-loading-surface" aria-hidden="true"></span><span class="sleeve-label"><span class="sleeve-icon"></span><span class="sleeve-title"></span></span><span class="sleeve-picture"></span><span class="sleeve-greeting"></span></span>';sleeveTrack.append(b);
 b.addEventListener('click',e=>{if(libraryOpening||libraryMoved||(e.detail>0&&performance.now()<libraryPointerClickUntil))return;chooseSleeve(Number(b.dataset.entry));});return b;
});
function chooseSleeve(n){
 if(libraryOpening||libraryEntering)return;
 if(n!==libraryEntry||Math.abs(libraryPosition-Math.round(libraryPosition))>.03||libraryPosition!==libraryTarget){goLibrary(n);return;}
 activateSleeve();
}
function setSleeveArtwork(b,n){
 if(b.dataset.entry===String(n))return;b.dataset.entry=String(n);const p=libraryEntries[n];
 b.classList.toggle('intro-sleeve',!p);
 const colors=p?(themes[p.id]||['#e2e9f1','#25384e',p.accent]):['#eee9df','#191b20','#3063ac'];
 b.style.setProperty('--sleeve-paper',colors[0]);b.style.setProperty('--sleeve-ink',colors[1]);
 b.querySelector('.sleeve-title').textContent=p?p.name:'ish.';
 const icon=b.querySelector('.sleeve-icon'),picture=b.querySelector('.sleeve-picture');icon.replaceChildren();picture.replaceChildren();
 if(p){
  if(p.iconAsset){const im=new Image();im.src=p.iconAsset;im.alt='';im.draggable=false;icon.append(im);}else icon.textContent=p.icon;
  const image=new Image();image.src=window.portfolioImageSource(p.sleeveHero||p.hero,'thumb');image.alt='';image.draggable=false;image.decoding='async';picture.append(image);
 }
 b.querySelector('.sleeve-greeting').replaceChildren();
 if(!p){const sub=document.createElement('span');sub.textContent='Scroll through my projects.';b.querySelector('.sleeve-greeting').append(sub);}
 decorateSleeve(b,p,n);
}
function decorateSleeve(b,project,n){
 b.querySelector('.sleeve-sticker-layer')?.remove();
 const layer=document.createElement('span');layer.className='sleeve-sticker-layer';layer.setAttribute('aria-hidden','true');
 const seed=stickerSeed(project?.id||'ish-intro'),count=!project||n===3||n===8?4:n%4===0?3:2;
 const set=project?PROJECT_STICKER_SETS[project.id]:['F14','F9','P12','P0'];
 const slots=project?[[93,6],[27,25.5],[11,91],[88,84]]:[[93,7],[27,29],[12,88],[83,64]];
 const order=project?[0,1,2,3].sort((a,b)=>(seed+a*53)%101-(seed+b*53)%101):[0,1,2,3];
 for(let i=0;i<count;i++){
  const el=stickerElement(set[i],true),slot=slots[order[i]];el.classList.remove('mac-sticker');el.classList.add('sleeve-sticker');el.style.left=slot[0]+'%';el.style.top=slot[1]+'%';el.style.setProperty('--sticker-rotation',((seed+i*17)%23-11)+'deg');layer.append(el);
 }
 layer.dataset.count=count;b.querySelector('.sleeve-face').append(layer);
}
function commitLibraryEntry(n){
 if(n===libraryEntry)return;libraryEntry=n;document.body.classList.toggle('library-intro',n===0);
 const p=libraryEntries[n];
 if(p){$('open-project').hidden=false;$('project-category').hidden=false;libraryInternalSelect=true;select(projects.indexOf(p),false);libraryInternalSelect=false;}
 else{
  resetProjectSummary();$('project-name').textContent='Hi!';$('open-project').hidden=false;$('project-category').hidden=false;
  $('project-category').replaceChildren(document.createTextNode('I’m Ish Singh, a Product Designer with almost 6 years of experience having worked with '));
  const companies=[['frog design','https://www.frog.co/'],['Capgemini Invent','https://www.capgemini.com/gb-en/about-us/who-we-are/our-brands/capgemini-invent/'],['TCS','https://www.tcs.com/'],['Siemens','https://www.siemens.com/en-us/company/']];
  companies.forEach(([name,url],i)=>{if(i)$('project-category').append(i===1?' / ':i===3?', and ':', ');const link=document.createElement('a');link.textContent=name;link.href=url;link.target='_blank';link.rel='noopener noreferrer';$('project-category').append(link);});$('project-category').append('.');$('project-tags').replaceChildren();$('project-tags').hidden=true;
  whiteHome=true;applyTheme(projects[selected],0);
 }
 $('library-status').textContent=p?`${p.name}. ${n+1} of ${entryCount}.`:`Ish Singh. Introduction. 1 of ${entryCount}.`;
}
function paintLibrary(){
 const center=Math.round(libraryPosition),step=Math.min(sleeveWidth*.8,Math.max(sleeveWidth*.22,innerWidth*.105));
 for(let offset=-6;offset<=6;offset++){
  const absolute=center+offset,b=sleeves[((absolute%sleeves.length)+sleeves.length)%sleeves.length],d=absolute-libraryPosition,a=Math.abs(d),sign=Math.sign(d),n=wrapEntry(absolute);
  setSleeveArtwork(b,n);
  const x=.74*(a<1?d*sleeveWidth*.83:sign*(sleeveWidth*.83+step*Math.pow(a-1,.78)));
  const angle=-sign*Math.min(72,a*52),scale=(1-Math.min(.30,a*.085))*(1-.2*Math.min(1,a)**2*(3-2*Math.min(1,a))),z=-Math.min(110,a*23);
  b.style.transform=`translate(-50%,-50%) translate3d(${x}px,${sleeveHeight*(1-scale)/2}px,${z}px) rotateY(${angle}deg) scale(${scale})`;
  b.style.zIndex=String(10000-Math.round(a*1000)+(absolute===center?1:0));const edge=Math.max(0,Math.min(1,(5.65-a)/.65));b.style.opacity=String(edge*(libraryEntering?Math.max(.24,1-a*.14):1));const grey=Math.round(174+Math.min(5,a)*11);b.style.setProperty('--loading-tone',`rgb(${grey},${grey},${grey})`);
  const active=n===wrapEntry(center);b.classList.toggle('sleeve-selected',active);b.tabIndex=active?0:-1;b.setAttribute('aria-pressed',String(active));b.setAttribute('aria-hidden',String(a>5.65));b.style.pointerEvents=a>5.65?'none':'';
  b.setAttribute('aria-label',libraryEntries[n]?`${active?'Open':'Select'} ${libraryEntries[n].name}`:`${active?'About':'Select'} Ish Singh`);
 }
 if(!libraryEntering)commitLibraryEntry(wrapEntry(center));
}
function animateLibrary(){
 libraryRaf=0;
 const delta=libraryTarget-libraryPosition;
 libraryPosition=reducedMotion.matches||Math.abs(delta)<.01?libraryTarget:libraryPosition+delta*.15;
 
 // Keep values bounded after any number of loops, without changing what is rendered.
 if(Math.abs(libraryPosition)>entryCount*100){const shift=Math.trunc(libraryPosition/entryCount)*entryCount;libraryPosition-=shift;libraryTarget-=shift;}
 paintLibrary();if(libraryTarget!==libraryPosition)libraryRaf=requestAnimationFrame(animateLibrary);else if(libraryEntering){libraryEntering=false;library.classList.remove('library-entering');commitLibraryEntry(wrapEntry(Math.round(libraryPosition)));}
}
function wakeLibrary(){if(!libraryRaf)libraryRaf=requestAnimationFrame(animateLibrary);}
function goLibrary(n){
 if(libraryOpening||libraryEntering)return;clearTimeout(librarySnap);
 const current=Math.round(libraryTarget),offset=((n-wrapEntry(current)+entryCount*1.5)%entryCount)-entryCount/2;
 libraryTarget=current+offset;wakeLibrary();
}
function sizeLibrary(){
 sleeveHeight=innerWidth<600?225:233;sleeveWidth=innerWidth<600?206:216;
 library.style.setProperty('--sleeve-width',sleeveWidth+'px');library.style.setProperty('--sleeve-height',sleeveHeight+'px');paintLibrary();
}
// Static, immediately readable copy replaces the previous typewriter/icon-rail machinery.
startProjectSummary=function(p){
 resetProjectSummary();summaryNeedsRestart=false;const text=document.createTextNode(summaryExcerpt(p)+' '),more=document.createElement('button');more.className='summary-more';more.textContent='Click to know more.';more.onclick=activateSleeve;$('project-category').replaceChildren(text,more);$('project-tags').hidden=false;
};
const selectFromJourney=select;
select=function(index,scroll=true){
 selectFromJourney(index,scroll);
 if(!libraryInternalSelect){const n=selected+1;libraryEntry=-1;goLibrary(n);libraryPosition=libraryTarget;paintLibrary();}
};
function showAbout(){
 if(libraryOpening||libraryEntering)return;dismissWolfSpeech();document.querySelector('#experience').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
}
$('open-project').replaceWith($('open-project').cloneNode(true));$('open-project').onclick=()=>libraryEntry===0?showAbout():activateSleeve();
function activateSleeve(){
 if(libraryOpening||libraryEntering)return;
 if(libraryEntry===0){showAbout();return;}
 libraryTarget=Math.round(libraryPosition);libraryPosition=libraryTarget;paintLibrary();
 if(reducedMotion.matches){openProject();return;}
 fadeIntoProject();
}
function fadeIntoProject(){
 libraryOpening=true;document.body.classList.add('library-opening');dismissWolfSpeech();
 setTimeout(()=>{
  openProject();document.body.classList.remove('library-opening');libraryOpening=false;
  projectDialog.classList.remove('project-arriving');void projectDialog.offsetWidth;projectDialog.classList.add('project-arriving');
 },350);
}
library.addEventListener('wheel',e=>{
 if(e.ctrlKey||libraryOpening||libraryEntering)return;e.preventDefault();dismissWolfSpeech();
 const amount=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
 libraryTarget+=Math.max(-1,Math.min(1,amount*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1)/220));wakeLibrary();
 clearTimeout(librarySnap);librarySnap=setTimeout(()=>{libraryTarget=Math.round(libraryTarget);wakeLibrary();},140);
},{passive:false});
function sleeveAtPointer(e){
 const direct=e.target.closest('.sleeve');if(direct)return direct;
 // Perspective can retarget a click to the track on subpixel boundaries.
 return [...sleeves].sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex)).find(b=>{if(b.getAttribute('aria-hidden')==='true')return false;const r=b.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;});
}
library.addEventListener('pointerdown',e=>{
 if(e.button!==0||libraryOpening||libraryEntering)return;clearTimeout(librarySnap);libraryMoved=false;libraryDrag={id:e.pointerId,x:e.clientX,y:e.clientY,start:libraryTarget,entry:sleeveAtPointer(e)?.dataset.entry};
});
library.addEventListener('pointermove',e=>{
 if(!libraryDrag||libraryDrag.id!==e.pointerId)return;const dx=e.clientX-libraryDrag.x,dy=e.clientY-libraryDrag.y;
 if(!libraryMoved&&Math.abs(dx)<6)return;if(!libraryMoved&&e.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx))return;
 libraryMoved=true;if(!library.hasPointerCapture(e.pointerId))library.setPointerCapture(e.pointerId);library.classList.add('library-dragging');
 libraryTarget=libraryDrag.start-dx/(sleeveWidth*.75);dismissWolfSpeech();wakeLibrary();
});
function endLibraryDrag(e){
 if(!libraryDrag||e.pointerId!==libraryDrag.id)return;
 const drag=libraryDrag,moved=libraryMoved;libraryDrag=null;
 if(library.hasPointerCapture(e.pointerId))library.releasePointerCapture(e.pointerId);library.classList.remove('library-dragging');
 if(moved){libraryTarget=Math.round(libraryTarget);wakeLibrary();}
 else if(e.type==='pointerup'&&drag.entry!==undefined){libraryPointerClickUntil=performance.now()+500;chooseSleeve(Number(drag.entry));}
 setTimeout(()=>libraryMoved=false,0);
}
library.addEventListener('pointerup',endLibraryDrag);library.addEventListener('pointercancel',endLibraryDrag);
library.addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||libraryOpening||libraryEntering)return;e.preventDefault();
 if(e.key==='Home')goLibrary(0);else if(e.key==='End')goLibrary(entryCount-1);else{libraryTarget=Math.round(libraryTarget)+(e.key==='ArrowRight'?1:-1);wakeLibrary();}
 // Preserve keyboard focus on the selected physical sleeve after pool recycling.
 clearTimeout(librarySnap);librarySnap=setTimeout(()=>library.querySelector('.sleeve-selected').focus({preventScroll:true}),reducedMotion.matches?30:500);
});
window.addEventListener('resize',sizeLibrary);
reducedMotion.addEventListener('change',()=>{libraryTarget=Math.round(libraryTarget);wakeLibrary();});
// Keep the chosen sleeve and its palette when leaving any project section.
projectDialog.addEventListener('close',()=>{libraryEntry=-1;paintLibrary();requestAnimationFrame(()=>library.querySelector('.sleeve-selected')?.focus({preventScroll:true}));});
// The mascot keeps its personality, but the homepage playfield is always the lower half.
const libraryPerch=perch;
perch=function(vary=false){if(!projectDialog.open)return {x:Math.max(12,innerWidth-100),y:Math.max(innerHeight*.54,innerHeight-100),onMac:false};return libraryPerch(vary);};
if(!reducedMotion.matches&&!document.documentElement.classList.contains('intro-done')){
 libraryEntering=true;library.classList.add('library-entering');libraryPosition=-6;libraryTarget=0;commitLibraryEntry(0);sizeLibrary();
 const began=performance.now();
 function loadingScroll(now){
  const progress=Math.min(1,(now-began)/1200);libraryPosition=-6*(1-progress)**4;paintLibrary();
  if(progress<1){requestAnimationFrame(loadingScroll);return;}
  libraryPosition=libraryTarget=0;libraryEntering=false;library.classList.remove('library-entering');paintLibrary();
  document.body.classList.remove('library-loading');finishLanding();
 }
 requestAnimationFrame(loadingScroll);
}else sizeLibrary();

// A quiet, occasional collectible hint. Never interrupt browsing, conversation or a modal.
let stickerHintScene=projectDialog.open?'gallery':'home',stickerHintAfter=performance.now()+35000,stickerHintActivity=performance.now(),stickerHintTurn=0;
for(const event of ['pointerdown','pointermove','wheel','keydown'])document.addEventListener(event,()=>{stickerHintActivity=performance.now();},{passive:true});
function maybeMentionStickers(now=performance.now()){
 const scene=projectDialog.open?activeWolfScene():'home';
 if(scene!==stickerHintScene){stickerHintScene=scene;stickerHintAfter=now+(scene==='gallery'?12000:35000);}
 if(!['home','gallery'].includes(scene)||now<stickerHintAfter||now-stickerHintActivity<4500||!document.documentElement.classList.contains('intro-done')||document.hidden||menuDialog.open||document.querySelector('.sticker-token-dialog[open],#media-focus[open]')||wolfDrag||wolfMoving||wolfGreeting||wolfPaused||wolfFollow||wolfSpeech.classList.contains('speaking'))return false;
 const lines=scene==='gallery'?['Psst… these stickers are little souvenirs. Double-tap one to download it.','You can move the stickers around. Double-tap a favourite to keep it.']:['There are collectible stickers inside the projects. Double-tap one to take it home.','A little souvenir hunt? The project stickers are yours to download.'];
 speakWolfie(lines[stickerHintTurn++%lines.length]);stickerHintAfter=now+75000;return true;
}
setInterval(()=>maybeMentionStickers(),6000);

// Refresh sources when a device changes between desktop and mobile presentation.
window.addEventListener('portfolio:media-mode',()=>{sleeves.forEach(b=>delete b.dataset.entry);paintLibrary();});
