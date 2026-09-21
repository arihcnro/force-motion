(()=>{'use strict';
const clamp=z=>Math.max(.5,Math.min(2,z));
document.querySelectorAll('canvas,svg#scene,svg#forceChart').forEach((surface,index)=>{
 if(surface.closest('.sim-zoom'))return;
 const vb=surface.viewBox?.baseVal,b=surface.getBoundingClientRect();
 const ratio=vb?.width?vb.height/vb.width:(Number(surface.getAttribute('height'))/Number(surface.getAttribute('width'))||b.height/b.width||.75);
 const box=document.createElement('div');box.className='sim-zoom';
 const bar=document.createElement('div');bar.className='sim-zoom-tools';bar.setAttribute('role','group');bar.setAttribute('aria-label','ปรับขนาดภาพ '+(index+1));
 const view=document.createElement('div');view.className='sim-zoom-view';view.tabIndex=0;view.id='sim-zoom-view-'+index;view.setAttribute('role','region');view.setAttribute('aria-label','ภาพจำลองที่เลื่อนดูได้ '+(index+1));
 const stage=document.createElement('div');stage.className='sim-zoom-stage';
 const help=document.createElement('p');help.className='sim-zoom-help';help.textContent='ใช้สองนิ้วกางเพื่อขยาย หุบเพื่อย่อ และเลื่อนสองนิ้วเพื่อเลื่อนภาพ • ใช้นิ้วเดียวลากวัตถุได้ตามเดิม • ซูม 50–200% ไม่เปลี่ยนค่าทางฟิสิกส์';
 function button(label){const el=document.createElement('button');el.type='button';el.textContent=label;el.setAttribute('aria-controls',view.id);return el;}
 const minus=button('− ย่อภาพ'),plus=button('+ ขยายภาพ'),reset=button('คืนขนาดภาพ'),output=document.createElement('output');output.setAttribute('aria-live','polite');
 bar.append(minus,output,plus,reset);surface.before(box);box.append(bar,view,help);view.append(stage);stage.append(surface);
 let zoom=1,base=0,boxWidth=0,offsetX=0,offsetY=0;
 const touches=new Map();let gesture=null,gesturing=false,canceling=false;
 function point(e){const r=view.getBoundingClientRect();return{x:e.clientX-r.left-view.clientLeft,y:e.clientY-r.top-view.clientTop};}
 function anchor(p){return{x:(view.scrollLeft+p.x-offsetX)/zoom,y:(view.scrollTop+p.y-offsetY)/zoom};}
 function render(next=zoom,p={x:view.clientWidth/2,y:view.clientHeight/2},a=anchor(p)){
  zoom=clamp(next);if(!base)return;
  const width=base*zoom,height=base*ratio*zoom;
  offsetX=Math.max(0,(base-width)/2);offsetY=Math.max(0,(view.clientHeight-height)/2);
  stage.style.width=Math.max(base,width)+'px';stage.style.height=Math.max(view.clientHeight,height)+'px';
  surface.style.setProperty('width',base+'px','important');surface.style.setProperty('height',base*ratio+'px','important');surface.style.left=offsetX+'px';surface.style.top=offsetY+'px';surface.style.transform='scale('+zoom+')';
  view.scrollLeft=a.x*zoom+offsetX-p.x;view.scrollTop=a.y*zoom+offsetY-p.y;
  if(zoom<=1){view.scrollLeft=0;view.scrollTop=0;}
  output.textContent=Math.round(zoom*100)+'%';minus.disabled=zoom<=.5;plus.disabled=zoom>=2;
 }
 function resize(){const w=box.getBoundingClientRect().width;if(Math.abs(w-boxWidth)<.5)return;boxWidth=w;
  // Both scrollbar gutters remain reserved. Observe the outer box width, never the content we resize.
  base=view.clientWidth;if(!base)return;view.style.height=(Math.ceil(base*ratio)+view.offsetHeight-view.clientHeight)+'px';render();
 }
 minus.onclick=()=>render(zoom-.25);plus.onclick=()=>render(zoom+.25);reset.onclick=()=>{render(1);view.scrollLeft=0;view.scrollTop=0;};
 function metrics(){const [a,b]=[...touches.values()];return{mid:{x:(a.p.x+b.p.x)/2,y:(a.p.y+b.p.y)/2},distance:Math.hypot(a.p.x-b.p.x,a.p.y-b.p.y)};}
 function begin(){const m=metrics();gesture={zoom,distance:Math.max(1,m.distance),anchor:anchor(m.mid)};}
 view.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch')return;touches.set(e.pointerId,{p:point(e),target:e.target});
  if(touches.size>=2){if(!gesturing){gesturing=true;for(const [id,t]of touches){canceling=true;t.target.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:id,pointerType:'touch'}));canceling=false;if(t.target.hasPointerCapture?.(id))t.target.releasePointerCapture(id);}}
   e.preventDefault();e.stopImmediatePropagation();for(const id of touches.keys())view.setPointerCapture(id);begin();
  }
 },true);
 view.addEventListener('pointermove',e=>{
  if(e.pointerType!=='touch'||!touches.has(e.pointerId))return;touches.get(e.pointerId).p=point(e);
  if(!gesturing)return;e.preventDefault();e.stopImmediatePropagation();if(touches.size>=2&&gesture){const m=metrics();render(gesture.zoom*m.distance/gesture.distance,m.mid,gesture.anchor);}
 },true);
 function end(e){if(e.pointerType!=='touch'||canceling)return;const was=gesturing;touches.delete(e.pointerId);if(was){e.preventDefault();e.stopImmediatePropagation();if(view.hasPointerCapture(e.pointerId))view.releasePointerCapture(e.pointerId);if(touches.size>=2)begin();else gesture=null;if(!touches.size)gesturing=false;}}
 view.addEventListener('pointerup',end,true);view.addEventListener('pointercancel',end,true);
 view.addEventListener('lostpointercapture',e=>{if(e.target===view&&touches.has(e.pointerId)){touches.delete(e.pointerId);gesture=null;if(!touches.size)gesturing=false;}});
 // Trackpad pinch is delivered as a control-wheel gesture by Chromium.
 view.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();render(zoom*Math.exp(-e.deltaY*.01),point(e));},{passive:false});
 new ResizeObserver(resize).observe(box);resize();
});})();

