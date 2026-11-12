/* Direct project destinations, sourced from the existing project data. */
'use strict';
function installProjectLinkLauncher(dialog){
 const nav=dialog.querySelector('.journey-nav'),dock=document.createElement('div');dock.className='project-dock';
 nav.parentElement.insertBefore(dock,nav);dock.append(nav);
 const launcher=document.createElement('div');launcher.className='project-link-launcher';
 launcher.innerHTML='<button type="button" class="project-link-trigger" aria-label="Project links" aria-expanded="false" aria-controls="project-link-options"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3 11h2V9h2V7h2V5H5V3h8v8h-2V7H9v2H7v2H5v2H3Z"/></svg></button><div id="project-link-options" class="project-link-options" role="region" aria-label="Full project destinations" hidden><div class="project-link-list"></div></div>';
 dock.append(launcher);
 const button=launcher.querySelector('button'),panel=launcher.querySelector('.project-link-options'),list=launcher.querySelector('.project-link-list');
 function close(focus=false){panel.hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus({preventScroll:true});}
 function open(){if(button.disabled)return;panel.hidden=false;button.setAttribute('aria-expanded','true');}
 button.addEventListener('click',()=>panel.hidden?open():close());
 document.addEventListener('pointerdown',event=>{if(!launcher.contains(event.target))close();},{capture:true});
 dialog.addEventListener('keydown',event=>{
  if(!launcher.contains(event.target))return;
  if(event.key==='Escape'&&!panel.hidden){event.preventDefault();event.stopImmediatePropagation();close(true);return;}
  if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
   event.preventDefault();event.stopPropagation();open();const links=[...list.querySelectorAll('a')];if(!links.length)return;
   const current=links.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?links.length-1:current<0?0:(current+(event.key==='ArrowDown'?1:-1)+links.length)%links.length;links[next].focus();
  }
 },{capture:true});
 launcher.addEventListener('focusout',()=>setTimeout(()=>{if(!launcher.contains(document.activeElement))close();},0));
 dialog.addEventListener('close',()=>close());
 return function update(project){
  close();list.replaceChildren();
  const labels={website:'View Website',behance:'View Behance',github:'View GitHub',integration:'View Project'};
  for(const key of ['website','behance','github','integration']){
   const url=project.links?.[key];if(typeof url!=='string'||!/^https?:\/\//.test(url))continue;
   const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=labels[key];link.addEventListener('click',()=>close());list.append(link);
  }
  button.disabled=!list.children.length;launcher.hidden=!list.children.length;
 };
}
