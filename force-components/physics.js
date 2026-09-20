'use strict';
(function(root){
 const clean=x=>Math.abs(x)<1e-10?0:x;
 function components(force,angle){const r=angle*Math.PI/180;return {x:clean(force*Math.cos(r)),y:clean(force*Math.sin(r))};}
 function fromPoint(x,y,max=20){const length=Math.hypot(x,y);return {force:Math.min(max,length),angle:length<1e-10?null:(Math.atan2(y,x)*180/Math.PI+360)%360};}
 function position(force,angle){if(force===0)return 'เวกเตอร์ศูนย์';const {x,y}=components(force,angle);if(y===0)return x>0?'แกน +x':'แกน −x';if(x===0)return y>0?'แกน +y':'แกน −y';return 'ควอดแรนต์ '+(x>0?(y>0?'1':'4'):(y>0?'2':'3'));}
 const api={components,fromPoint,position};if(typeof module!=='undefined')module.exports=api;else root.VectorPhysics=api;
})(typeof window==='undefined'?{}:window);
