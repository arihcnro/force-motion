(function(root){
'use strict';
const EPS=1e-9,G=9.8;
function forces(p,s){
 const rad=p.angle*Math.PI/180,fx=p.direction*p.force*Math.cos(rad),fy=p.force*Math.sin(rad),weight=p.mass*G;
 const contact=s.y<=EPS&&s.vy<=EPS&&fy<=weight;
 const normal=contact?Math.max(0,weight-fy):0,limit=p.muS*normal;
 let friction=0,mode='flight';
 if(contact){
  if(Math.abs(s.vx)<EPS&&Math.abs(fx)<=limit+EPS){friction=-fx;mode='static';}
  else{friction=-Math.sign(Math.abs(s.vx)>EPS?s.vx:fx)*p.muK*normal;mode='kinetic';}
 }
 return {fx,fy,weight,normal,limit,friction,ax:(fx+friction)/p.mass,ay:contact?0:(fy-weight)/p.mass,contact,mode};
}
function horizontal(p,s,dt){
 const f=forces(p,s);
 if(f.mode==='static'){s.vx=0;return;}
 const stop=f.ax*s.vx<0?-s.vx/f.ax:Infinity;
 if(stop>=0&&stop<=dt){
  s.x+=s.vx*stop+0.5*f.ax*stop*stop;s.vx=0;
  const rest=dt-stop,f2=forces(p,s);s.x+=0.5*f2.ax*rest*rest;s.vx=f2.ax*rest;
 }else{s.x+=s.vx*dt+0.5*f.ax*dt*dt;s.vx+=f.ax*dt;}
}
function step(p,s,dt){
 const f=forces(p,s);
 if(f.contact){s.y=0;s.vy=0;horizontal(p,s,dt);}
 else{
  let hit=Infinity;
  if(Math.abs(f.ay)>EPS){
   const d=s.vy*s.vy-2*f.ay*s.y;
   if(d>=0){const roots=[(-s.vy-Math.sqrt(d))/f.ay,(-s.vy+Math.sqrt(d))/f.ay];hit=Math.min(...roots.filter(t=>t>=0&&s.vy+f.ay*t<0));}
  }else if(s.vy<0)hit=-s.y/s.vy;
  if(hit>=0&&hit<=dt){
   s.x+=s.vx*hit+0.5*f.ax*hit*hit;s.vx+=f.ax*hit;s.y=0;s.vy=0;
   const rest=dt-hit,after=forces(p,s);
   if(after.contact)horizontal(p,s,rest);
   else{s.x+=s.vx*rest+0.5*after.ax*rest*rest;s.vx+=after.ax*rest;s.y=0.5*after.ay*rest*rest;s.vy=after.ay*rest;}
  }else{
   s.x+=s.vx*dt+0.5*f.ax*dt*dt;s.vx+=f.ax*dt;s.y+=s.vy*dt+0.5*f.ay*dt*dt;s.vy+=f.ay*dt;
  }
 }
 s.t+=dt;return s;
}
const initial=()=>({x:0,y:0,vx:0,vy:0,t:0});
const api={forces,step,initial,G};root.FrictionPhysics=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
