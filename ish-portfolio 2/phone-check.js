/* Opt-in phone diagnostics. Nothing is uploaded; reports stay on this device.
   Normal visitors receive no panel and no diagnostic event collection. */
'use strict';
(function(){
 const query=new URLSearchParams(location.search),enabled=query.get('phone-check')==='1';
 const mode=window.PORTFOLIO_PHONE_CHECK={enabled,flat:enabled&&query.get('render')==='flat',single:enabled&&query.get('media')==='single'};
 if(mode.flat)document.documentElement.classList.add('phone-check-flat');
 if(!enabled)return;
 const events=[],limit=35,key='ish-phone-check-v2';
 let previous=null;try{previous=JSON.parse(sessionStorage.getItem(key)||'null');}catch{}
 function record(type,detail=''){
  events.push({at:new Date().toISOString(),type,detail:String(detail).slice(0,220)});if(events.length>limit)events.shift();
  try{sessionStorage.setItem(key,JSON.stringify({build:'mobile-2',last:events}));}catch{}
 }
 record('start',performance.getEntriesByType('navigation')[0]?.type||'unknown');
 window.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement||e.target instanceof HTMLVideoElement)record('media-error',e.target.getAttribute('src')?.split('/').pop()||'poster');else record('script-error',e.message+' '+(e.filename||'').split('/').pop()+':'+e.lineno);},true);
 window.addEventListener('unhandledrejection',e=>record('promise-error',String(e.reason)));
 window.addEventListener('pagehide',()=>record('pagehide'));
 document.addEventListener('visibilitychange',()=>record('visibility',document.visibilityState));
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>record('resize',innerWidth+'×'+innerHeight),200);});
 document.addEventListener('DOMContentLoaded',()=>{
  const panel=document.createElement('details');panel.id='phone-check';panel.innerHTML='<summary>Phone check · v2</summary><p>This panel stays on your device. Choose one test, then try the gallery.</p><nav></nav><pre></pre><button type="button">Copy report</button><span role="status"></span>';
  const style=document.createElement('style');style.textContent='#phone-check{position:fixed;top:70px;right:8px;z-index:2147483647;width:min(340px,calc(100vw - 16px));max-height:65vh;overflow:auto;background:#fff;color:#111;border:2px solid #111;border-radius:8px;padding:10px;font:12px/1.4 system-ui;box-sizing:border-box}#phone-check:not([open]){width:auto}#phone-check summary{cursor:pointer;font-weight:700}#phone-check nav{display:flex;gap:8px;flex-wrap:wrap}#phone-check a,#phone-check button{display:inline-block;padding:9px;background:#eee;color:#111;border-radius:4px}#phone-check pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}';document.head.append(style);document.body.append(panel);
  for(const [label,param,value] of [['Normal','',''],['Flat graphics','render','flat'],['Single image','media','single']]){
   const a=document.createElement('a'),url=new URL(location.href);url.hash='#home';url.searchParams.delete('render');url.searchParams.delete('media');if(param)url.searchParams.set(param,value);a.href=url.href;a.textContent=label;panel.querySelector('nav').append(a);
  }
  function placePanel(){const focus=document.getElementById('media-focus'),project=document.getElementById('project-dialog'),host=focus?.open?focus:project?.open?project:document.body;if(panel.parentElement!==host)host.append(panel);}
  placePanel();let sourceChanges=0;const observer=new MutationObserver(records=>{sourceChanges+=records.filter(r=>r.attributeName==='src'&&r.target.matches('img,video')).length;placePanel();});observer.observe(document.documentElement,{attributes:true,attributeFilter:['src','open'],subtree:true});
  function snapshot(){
   const gallery=document.querySelector('.canvas-world'),images=[...(gallery?.querySelectorAll('img')||[])],videos=[...(gallery?.querySelectorAll('video')||[])],matrix=document.getElementById('matrix');
   return {build:'mobile-2',mode:mode.flat?'flat graphics':mode.single?'single image':'normal',viewport:innerWidth+'×'+innerHeight,dpr:devicePixelRatio,navigation:performance.getEntriesByType('navigation')[0]?.type,projectOpen:!!document.getElementById('project-dialog')?.open,images:{attached:images.filter(i=>i.hasAttribute('src')).length,ready:images.filter(i=>i.hasAttribute('src')&&i.complete&&i.naturalWidth>0).length,loading:images.filter(i=>i.closest('.canvas-tile')?.dataset.mediaState==='loading').length,waiting:images.filter(i=>i.closest('.canvas-tile')?.dataset.mediaState==='waiting').length,error:images.filter(i=>i.closest('.canvas-tile')?.dataset.mediaState==='error').length},videos:{attached:videos.filter(v=>v.hasAttribute('src')).length,playing:videos.filter(v=>!v.paused).length},sourceChanges,matrix:matrix?matrix.width+'×'+matrix.height:'none',homeDisplay:document.querySelector('main')?getComputedStyle(document.querySelector('main')).display:'none',events:[...events],previousVisit:previous};
  }
  function paint(){if(panel.open)panel.querySelector('pre').textContent=JSON.stringify(snapshot(),null,2);}
  panel.addEventListener('toggle',paint);setInterval(paint,1000);
  panel.querySelector('button').onclick=async()=>{try{await navigator.clipboard.writeText(JSON.stringify(snapshot(),null,2));panel.querySelector('[role="status"]').textContent='Copied';}catch{panel.querySelector('pre').textContent=JSON.stringify(snapshot(),null,2);panel.querySelector('[role="status"]').textContent='Select the report above to copy';}};
 });
})();
