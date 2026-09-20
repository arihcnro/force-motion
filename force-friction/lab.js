'use strict';
const $=id=>document.getElementById(id),engine=FrictionPhysics;
const defaults={force:8,angle:0,mass:2,muS:.5,muK:.3,direction:1};
let params={...defaults},state=engine.initial(),playing=false,lastTime=null,history=[{t:0,v:0}],sample=0;
const names=['force','angle','mass','muS','muK'],units={force:' N',angle:'°',mass:' kg',muS:'',muK:''};
function sync(){for(const name of names){$(name).value=params[name];$(name+'Number').value=params[name];$(name+'Out').value=params[name].toFixed(name.startsWith('mu')?2:name==='angle'?0:1)+units[name];}$('direction').value=params.direction;}
function reset(){state=engine.initial();playing=false;history=[{t:0,v:0}];sample=0;lastTime=null;$('play').textContent='เริ่มการทดลอง';render();}
for(const name of names){
 for(const id of [name,name+'Number'])$(id).addEventListener('input',()=>{
  const node=$(id);if(node.value===''||!Number.isFinite(node.valueAsNumber))return;
  params[name]=Math.min(Number(node.max),Math.max(Number(node.min),node.valueAsNumber));
  let message='แบบจำลองนี้กำหนด 0 ≤ μₖ ≤ μₛ ≤ 1 และ g = 9.8 m/s²';
  if(params.muK>params.muS){if(name==='muK')params.muS=params.muK;else params.muK=params.muS;message='ปรับสัมประสิทธิ์อีกค่าให้สอดคล้องกับเงื่อนไข μₖ ≤ μₛ แล้ว';}
  $('constraint').textContent=message;sync();if(name==='mass')reset();else render();
 });
 $(name+'Number').addEventListener('change',sync);
}
$('direction').addEventListener('change',()=>{params.direction=Number($('direction').value);render();});
$('play').addEventListener('click',()=>{playing=!playing;lastTime=null;$('play').textContent=playing?'หยุดชั่วคราว':'ทดลองต่อ';render();});
$('reset').addEventListener('click',reset);
$('defaults').addEventListener('click',()=>{params={...defaults};sync();$('speed').value='1';$('constraint').textContent='แบบจำลองนี้กำหนด 0 ≤ μₖ ≤ μₛ ≤ 1 และ g = 9.8 m/s²';reset();});
const presets={hold:{force:8,angle:0},slide:{force:12,angle:0},angled:{force:12,angle:30},lift:{force:30,angle:60}};
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{params={...defaults,...presets[b.dataset.preset]};sync();reset();}));
for(const id of ['vectors','components','resultant'])$(id).addEventListener('change',render);
const scene=$('scene'),ctx=scene.getContext('2d'),graph=$('graph'),gc=graph.getContext('2d');
const colors={pull:'#b93d32',weight:'#2272b9',normal:'#26835b',friction:'#b67511',sum:'#793faa'};
function arrow(x,y,dx,dy,color,label,dash=false){
 if(Math.hypot(dx,dy)<.1)return;
 ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3;ctx.setLineDash(dash?[7,5]:[]);
 ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();ctx.setLineDash([]);
 const angle=Math.atan2(dy,dx);ctx.beginPath();ctx.moveTo(x+dx,y+dy);ctx.lineTo(x+dx-10*Math.cos(angle-.4),y+dy-10*Math.sin(angle-.4));ctx.lineTo(x+dx-10*Math.cos(angle+.4),y+dy-10*Math.sin(angle+.4));ctx.closePath();ctx.fill();
 ctx.font='17px Sarabun';ctx.textAlign=dx< -5?'right':'left';ctx.fillText(label,x+dx+(dx< -5?-9:9),y+dy+(dy>5?20:-9));ctx.restore();
}
const format=x=>(Math.abs(x)<.0005?0:x).toLocaleString('en-US',{maximumFractionDigits:2,minimumFractionDigits:2});
function draw(f){
 ctx.clearRect(0,0,900,500);const floor=355,worldScale=Math.min(48,180/(state.y+.01)),cx=380,cy=floor-28-state.y*worldScale;
 ctx.fillStyle='#e4edf2';ctx.fillRect(0,floor,900,100);ctx.fillStyle='#809cab';ctx.fillRect(0,floor,900,3);
 const start=Math.floor(state.x-9);ctx.font='13px Sarabun';ctx.textAlign='center';ctx.fillStyle='#64818f';
 for(let i=start;i<=start+20;i++){const x=cx+(i-state.x)*48;ctx.fillRect(x,floor+4,1,8);ctx.fillText(i+' m',x,floor+30);}
 ctx.fillStyle='#f2ca86';ctx.strokeStyle='#956629';ctx.lineWidth=2;ctx.fillRect(cx-32,cy-28,64,56);ctx.strokeRect(cx-32,cy-28,64,56);ctx.fillStyle='#553d22';ctx.font='18px Sarabun';ctx.fillText(params.mass+' kg',cx,cy+6);
 const scale=135/Math.max(f.weight,params.force,f.normal,Math.abs(f.friction),1);
 if($('vectors').checked){arrow(cx,cy,0,f.weight*scale,colors.weight,'mg');arrow(cx,cy,0,-f.normal*scale,colors.normal,'N');arrow(cx,cy,f.friction*scale,0,colors.friction,f.mode==='static'?'fₛ':'fₖ');arrow(cx,cy,f.fx*scale,-f.fy*scale,colors.pull,'F');}
 if($('components').checked&&params.angle>0){arrow(cx,cy+12,f.fx*scale,0,'#bc7971','Fₓ',true);arrow(cx-16,cy,0,-f.fy*scale,'#bc7971','Fᵧ',true);}
 ctx.fillStyle='#315d70';ctx.textAlign='left';ctx.font='16px Sarabun';ctx.fillText('+x →',765,390);ctx.fillText('↑ +y',795,40);ctx.fillText('กล้องติดตามกล่อง · พื้นราบอยู่นิ่ง',22,30);
 if($('resultant').checked){ctx.fillStyle='#f1edf8';ctx.fillRect(600,60,275,225);ctx.fillStyle=colors.sum;ctx.font='17px Sarabun';ctx.fillText('แรงลัพธ์ (ผลรวมของแรง)',618,89);ctx.font='13px Sarabun';ctx.fillText('แสดงแยก ไม่ใช่แรงเพิ่มใน FBD',618,111);const sx=f.ax*params.mass,sy=f.ay*params.mass,l=Math.max(1,Math.hypot(sx,sy));arrow(710,200,sx/l*80,-sy/l*80,colors.sum,'ΣF',true);if(l===1&&sx===0&&sy===0){ctx.font='23px Sarabun';ctx.fillText('ΣF = 0',675,205);}}
 ctx.font='15px Sarabun';ctx.fillStyle='#315d70';ctx.fillText('h = '+format(state.y)+' m',22,445);ctx.fillText('vᵧ = '+format(state.vy)+' m/s',230,445);ctx.fillText('aᵧ = '+format(f.ay)+' m/s²',460,445);
}
function chart(){
 gc.clearRect(0,0,900,190);const start=Math.max(0,state.t-20),end=Math.max(20,state.t),max=Math.max(1,...history.map(s=>Math.abs(s.v)))*1.15;
 const X=t=>60+(t-start)/(end-start)*810,Y=v=>90-v/max*65;
 gc.strokeStyle='#cbdbe4';gc.lineWidth=1;gc.beginPath();gc.moveTo(60,15);gc.lineTo(60,160);gc.lineTo(880,160);gc.moveTo(60,Y(0));gc.lineTo(880,Y(0));gc.stroke();gc.fillStyle='#4b697b';gc.font='13px Sarabun';gc.fillText('vₓ (m/s)',6,12);
 for(const value of [-max,0,max])gc.fillText(format(value),4,Y(value)+4);
 for(let i=0;i<=4;i++){const t=start+(end-start)*i/4;gc.fillText(t.toFixed(1),X(t)-8,179);}gc.fillText('t (s)',858,190);
 gc.strokeStyle='#147b87';gc.lineWidth=2.5;gc.beginPath();history.forEach((s,i)=>i?gc.lineTo(X(s.t),Y(s.v)):gc.moveTo(X(s.t),Y(s.v)));gc.stroke();
}
function render(){
 const f=engine.forces(params,state);let status,explanation;
 if(f.mode==='static'){status='สมดุลสถิต';explanation=`แรงดึงแนวราบมีขนาด ${format(Math.abs(f.fx))} N ไม่เกิน μₛN = ${format(f.limit)} N แรงเสียดทานสถิตจึงสมดุลกับแรงดึงแนวราบ กล่องไม่มีความเร่ง`;}
 else if(f.mode==='kinetic'){status=Math.abs(state.vx)<1e-9?'เกินขีดจำกัดสถิต · พร้อมไถล':'กำลังไถล · แรงเสียดทานจลน์';explanation=`แรงเสียดทานจลน์มีขนาด ${format(Math.abs(f.friction))} N ผลรวมแรงแนวราบเป็น ${format(f.fx+f.friction)} N จึงมี aₓ = ${format(f.ax)} m/s²`;
 }else{status=state.y<1e-9?'แรงดึงทำให้ยกพ้นพื้น':'ยกพ้นพื้น · ไม่มีแรงเสียดทาน';explanation='วัตถุไม่มีแรงสัมผัสจากพื้น จึงมี N = 0 และ f = 0 ใช้กฎข้อที่ 2 แยกตามแกน x และ y';}
 $('status').textContent=status+(playing?'':' · หยุดภาพ');$('explanation').textContent=explanation;$('time').textContent='t = '+format(state.t)+' s';
 for(const [id,value]of [['x',state.x],['vx',state.vx],['ax',f.ax],['height',state.y]])$(id).textContent=format(value);
 const values=[['แรงดึงแนวราบ Fₓ',f.fx,'N'],['แรงดึงแนวดิ่ง Fᵧ',f.fy,'N'],['น้ำหนัก mg',f.weight,'N'],['แรงปฏิกิริยาตั้งฉาก N',f.normal,'N'],['ขีดจำกัดแรงเสียดทานสถิต μₛN',f.limit,'N'],['องค์ประกอบแรงเสียดทาน fₓ',f.friction,'N'],['แรงลัพธ์แนวราบ ΣFₓ',f.ax*params.mass,'N'],['แรงลัพธ์แนวดิ่ง ΣFᵧ',f.ay*params.mass,'N']];
 $('values').replaceChildren(...values.flatMap(([label,value,unit])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=format(value)+' '+unit;return [dt,dd];}));draw(f);chart();
}
function frame(now){
 if(lastTime!==null&&playing){let remaining=Math.min((now-lastTime)/1000,.1)*Number($('speed').value);while(remaining>1e-10){const dt=Math.min(remaining,1/240);engine.step(params,state,dt);remaining-=dt;}if(state.t-sample>=.05){history.push({t:state.t,v:state.vx});history=history.filter(s=>s.t>=state.t-20);sample=state.t;}render();}
 lastTime=now;requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange',()=>{lastTime=null;});sync();render();document.fonts.ready.then(render);requestAnimationFrame(frame);
