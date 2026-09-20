'use strict';
(function(root){const g=9.8;function calculate(m,a,v0,t){if(![m,a,v0,t].every(Number.isFinite)||m<=0||a< -g||t<0)throw new RangeError('Invalid parameters');return {weight:m*g,normal:m*(g+a),reading:m*(g+a)/g,v:v0+a*t,s:v0*t+.5*a*t*t};}const api={g,calculate};if(typeof module!=='undefined')module.exports=api;else root.ElevatorPhysics=api;})(typeof window==='undefined'?{}:window);
