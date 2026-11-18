import{r as B,j as je}from"./index-uEvbEw5g.js";import{b as T}from"./App-Dofw4Ib9.js";import{b as H}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const vt={solid:0,dashed:1},P=12,dt=4,pt=2.2,He=640,Te=64,xt=Te*Math.sqrt(Math.PI/2)/He,ze=16e5,gt=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uView;
uniform float uRatio;
uniform vec2 uAxis;
uniform float uSpacing;
uniform float uStep;
uniform vec2 uStart;
uniform float uAmplitude;
uniform vec2 uFrequency;
uniform vec2 uDrift;
uniform float uTwist;
uniform uint uSeed;
uniform sampler2D uField;
uniform ivec2 uFieldSize;
uniform float uCell;
uniform float uLimit;
uniform float uReach;
uniform float uReveal;
uniform float uBand;
out float vAcross;
out float vAlong;
out float vEnergy;
out float vShow;
out float vPhase;

const vec2 GRADIENTS[12] = vec2[12](
  vec2(1.0, 1.0), vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(-1.0, -1.0),
  vec2(1.0, 0.0), vec2(-1.0, 0.0), vec2(1.0, 0.0), vec2(-1.0, 0.0),
  vec2(0.0, 1.0), vec2(0.0, -1.0), vec2(0.0, 1.0), vec2(0.0, -1.0)
);

vec2 gradient(vec2 cell) {
  uvec2 q = uvec2(ivec2(cell) + 65536) + uvec2(uSeed * 7919u, uSeed * 104729u);
  q = 1103515245u * ((q >> 1u) ^ q.yx);
  uint n = 1103515245u * (q.x ^ (q.y >> 3u));
  return GRADIENTS[(n >> 16u) % 12u];
}

float ease(float t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlin(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  float n00 = dot(gradient(i), f);
  float n10 = dot(gradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float n01 = dot(gradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float n11 = dot(gradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  vec2 u = vec2(ease(f.x), ease(f.y));
  return mix(mix(n00, n10, u.x), mix(n01, n11, u.x), u.y);
}

vec2 node(ivec2 cell) {
  return texelFetch(uField, clamp(cell, ivec2(0), uFieldSize - 1), 0).xy;
}

void weights(float f, out vec4 w, out vec4 d) {
  float g = 1.0 - f;
  float f2 = f * f;
  float f3 = f2 * f;
  w = vec4(g * g * g, 3.0 * f3 - 6.0 * f2 + 4.0, -3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0, f3) / 6.0;
  d = vec4(-g * g, 3.0 * f2 - 4.0 * f, -3.0 * f2 + 2.0 * f + 1.0, f2) * 0.5;
}

vec2 field(vec2 point, out mat2 slope) {
  vec2 t = point / uCell;
  vec2 base = floor(t);
  vec2 f = t - base;
  vec4 wx;
  vec4 dx;
  vec4 wy;
  vec4 dy;
  weights(f.x, wx, dx);
  weights(f.y, wy, dy);
  ivec2 origin = ivec2(base) - 1;
  vec2 value = vec2(0.0);
  vec2 alongX = vec2(0.0);
  vec2 alongY = vec2(0.0);
  for (int j = 0; j < 4; j++) {
    vec2 row = vec2(0.0);
    vec2 rowSlope = vec2(0.0);
    for (int i = 0; i < 4; i++) {
      vec2 tap = node(origin + ivec2(i, j));
      row += tap * wx[i];
      rowSlope += tap * dx[i];
    }
    value += row * wy[j];
    alongX += rowSlope * wy[j];
    alongY += row * dy[j];
  }
  float size = length(value);
  float scale = size > 0.0001 ? uLimit * tanh(size / uLimit) / size : 1.0;
  slope = mat2(alongX, alongY) * (scale / uCell);
  return value * scale;
}

vec2 wave(vec2 rest) {
  float turn = perlin(rest * uFrequency + uDrift) * 12.0 * uTwist;
  vec2 local = rest + vec2(cos(turn), sin(turn) * 0.5) * uAmplitude;
  return uView * 0.5 + vec2(local.x * uAxis.x - local.y * uAxis.y, local.x * uAxis.y + local.y * uAxis.x);
}

void main() {
  int index = gl_VertexID >> 1;
  float side = float(gl_VertexID & 1) * 2.0 - 1.0;
  float u = uStart.x + float(gl_InstanceID) * uSpacing;
  float v = uStart.y + float(index) * uStep;
  vec2 flowing = wave(vec2(u, v));
  vec2 bend = wave(vec2(u, v + uStep)) - wave(vec2(u, v - uStep));
  mat2 slope;
  vec2 shift = field(flowing, slope);
  vec2 point = flowing + shift;
  float energy = length(shift);
  vec2 tangent = bend + slope * bend;
  float span = max(length(tangent), 0.0001);
  vec2 normal = vec2(-tangent.y, tangent.x) / span;
  vec2 corner = point + normal * side * uReach / uRatio;
  vAcross = side * uReach;
  vAlong = v;
  vEnergy = energy;
  vShow = clamp((uReveal - abs(u)) / uBand, 0.0, 1.0);
  uint line = uint(gl_InstanceID) * 747796405u + uSeed * 2891336453u + 1u;
  line = ((line >> ((line >> 28u) + 4u)) ^ line) * 277803737u;
  vPhase = float((line >> 22u) ^ line) / 4294967295.0;
  vec2 clip = corner / uView * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`,wt=`#version 300 es
precision highp float;
uniform vec2 uView;
uniform float uRatio;
uniform float uHalf;
uniform float uThin;
uniform int uStyle;
uniform float uPeriod;
uniform float uFlow;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uBase;
uniform float uHeat;
uniform float uFade;
uniform float uOpacity;
in float vAcross;
in float vAlong;
in float vEnergy;
in float vShow;
in float vPhase;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  float coverage = clamp(uHalf + 0.5 - abs(vAcross), 0.0, 1.0) * uThin;
  if (uStyle == 1) {
    float phase = (vAlong + uFlow) / uPeriod + vPhase;
    float blur = max(fwidth(phase), 0.0001);
    coverage *= clamp((0.25 - abs(fract(phase) - 0.5)) / blur + 0.5, 0.0, 1.0);
  }
  float heat = smoothstep(0.0, uHeat, vEnergy);
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  float alpha = coverage * mix(uBase, 1.0, heat) * mask * vShow * uOpacity;
  outColor = vec4(mix(uColor, uAccent, heat) * alpha, alpha);
}`,R=(a,f,S)=>Math.min(S,Math.max(f,a)),Me=a=>{const f=R(a,0,1);return f*f*f*(f*(f*6-15)+10)},Be=(a,f,S)=>{const l=a.createShader(f);return l?(a.shaderSource(l,S),a.compileShader(l),a.getShaderParameter(l,a.COMPILE_STATUS)?l:(a.deleteShader(l),null)):null},yt=a=>{const f=Be(a,a.VERTEX_SHADER,gt),S=Be(a,a.FRAGMENT_SHADER,wt),l=a.createProgram();if(!f||!S||!l)return null;if(a.attachShader(l,f),a.attachShader(l,S),a.linkProgram(l),a.deleteShader(f),a.deleteShader(S),!a.getProgramParameter(l,a.LINK_STATUS))return a.deleteProgram(l),null;const oe={},le=a.getProgramParameter(l,a.ACTIVE_UNIFORMS);for(let W=0;W<le;W++){const Y=a.getActiveUniform(l,W);Y&&(oe[Y.name]=a.getUniformLocation(l,Y.name))}return{program:l,uniforms:oe}},St=({lineColor:a="#ffffff",accentColor:f,backgroundColor:S="transparent",lineStyle:l="solid",spacing:oe=10,lineWidth:le=1,rotation:W=0,amplitude:Y=32,scale:We=1,twist:Ye=1,speed:Ke=1,variation:$e=0,mouseInteraction:Je=!0,mouseRadius:Qe=175,mouseStrength:Ze=1,bounce:et=.5,returnDuration:tt=1.4,clickRipple:ot=!0,intro:nt=!0,fade:it=0,opacity:at=1,lightMode:rt=!1,paused:st=!1,dpr:ct,className:Re="",style:ut})=>{const Se=B.useRef(null),be=B.useRef(null),fe=B.useRef(null),Ae={lineColor:String(a),accentColor:f?String(f):"",lineStyle:vt[l]??0,spacing:Math.max(2,oe),lineWidth:Math.max(.25,le),rotation:W,amplitude:Math.max(0,Y),scale:Math.max(.05,We),twist:Math.max(0,Ye),speed:Ke,variation:Math.max(0,Math.round($e)),mouseInteraction:Je,mouseRadius:Math.max(20,Qe),mouseStrength:Math.max(0,Ze),bounce:R(et,0,1),returnDuration:Math.max(.2,tt),clickRipple:ot,intro:nt,fade:R(it,0,1),opacity:R(at,0,1),lightMode:rt,paused:st,dpr:ct},y=B.useRef(Ae);return y.current=Ae,B.useEffect(()=>{const q=Se.current,C=be.current,e=C?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!q||!C||!e)return;const ne=yt(e);if(!ne)return;const r=ne.uniforms,_e=e.createVertexArray(),K=e.createTexture();e.bindTexture(e.TEXTURE_2D,K),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.pixelStorei(e.UNPACK_ALIGNMENT,1);const G=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),L=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,me=new Map,Pe=t=>{if(me.has(t))return me.get(t);let i=[1,1,1];if(G){G.clearRect(0,0,1,1),G.fillStyle="#ffffff",G.fillStyle=t,G.fillRect(0,0,1,1);const[s,u,c]=G.getImageData(0,0,1,1).data;i=[s/255,u/255,c/255]}return me.set(t,i),i},lt=t=>{const i=t.map(c=>Math.pow(c,2.2)),s=.2126*i[0]+.7152*i[1]+.0722*i[2],u=Math.min(1,.045/Math.max(s,1e-4));return i.map(c=>Math.pow(c*u,1/2.2))},d={width:1,height:1,ratio:1},o={cols:0,rows:0,shift:new Float32Array(0),speed:new Float32Array(0),top:0,bottom:-1,left:0,right:-1},n={x:0,y:0,sx:0,sy:0,vx:0,vy:0,inside:!1},U=[],E={flow:0,intro:y.current.intro&&!L?0:1};let k=0,X=0,ie=!0;const ft=t=>Math.max(12,t.mouseRadius*.5),mt=()=>{o.cols=Math.ceil(d.width/P)+2,o.rows=Math.ceil(d.height/P)+2,o.shift=new Float32Array(o.cols*o.rows*2),o.speed=new Float32Array(o.cols*o.rows*2),o.top=0,o.bottom=-1,o.left=0,o.right=-1,e.bindTexture(e.TEXTURE_2D,K),e.texImage2D(e.TEXTURE_2D,0,e.RG32F,o.cols,o.rows,0,e.RG,e.FLOAT,o.shift)},Le=(t,i,s,u)=>{const c=R(Math.floor(t/P),0,o.cols-1),h=R(Math.ceil(s/P),0,o.cols-1),b=R(Math.floor(i/P),0,o.rows-1),x=R(Math.ceil(u/P),0,o.rows-1),v=o.bottom<o.top;o.top=v?b:Math.min(o.top,b),o.bottom=v?x:Math.max(o.bottom,x),o.left=v?c:Math.min(o.left,c),o.right=v?h:Math.max(o.right,h)},ht=t=>{const i=H(y.current),s=1-Math.exp(-t/.045),u=n.sx+(n.x-n.sx)*s,c=n.sy+(n.y-n.sy)*s,h=1-Math.exp(-t/.06);n.vx+=((u-n.sx)/t-n.vx)*h,n.vy+=((c-n.sy)/t-n.vy)*h,n.sx=u,n.sy=c;const b=1-.85*i.bounce,x=4/(b*i.returnDuration),v=i.mouseRadius,A=Math.hypot(n.vx,n.vy),I=i.mouseInteraction&&n.inside&&!L?26e3*Math.tanh(A/1400)*i.mouseStrength:0;I>1&&Le(n.sx-v,n.sy-v,n.sx+v,n.sy+v);const F=[];for(let m=U.length-1;m>=0;m--){const g=U[m];g.age+=t;const D=g.age*He,z=1-D/g.range;if(z<=0){U.splice(m,1);continue}const p=D+Te*3;Le(g.x-p,g.y-p,g.x+p,g.y+p),F.push({x:g.x,y:g.y,front:D,power:150*x*z*Math.sqrt(z)/xt})}if(o.bottom<o.top)return!1;const $=x*x,J=2*b*x,se=Math.min(16,Math.max(1,Math.ceil(t/Math.min(1/120,.6/x)))),O=t/se,ve=A>.001?n.vx/A:0,de=A>.001?n.vy/A:0,{cols:w,shift:_,speed:V,left:j,right:pe}=o;let xe=0;for(let m=o.top;m<=o.bottom;m++){const g=m*P;for(let D=j;D<=pe;D++){const z=D*P,p=(m*w+D)*2;let we=0,ye=0;if(I>1){const M=Math.hypot(z-n.sx,g-n.sy);if(M<v){const ee=Me(1-M/v)*I;we+=ve*ee,ye+=de*ee}}for(const M of F){const ee=z-M.x,Ge=g-M.y,te=Math.hypot(ee,Ge),Ee=(te-M.front)/Te;if(te>.001&&Math.abs(Ee)<3){const ke=M.power*Math.exp(-Ee*Ee*2)*Me(te/56);we+=ee/te*ke,ye+=Ge/te*ke}}let ce=_[p],ue=_[p+1],Q=V[p],Z=V[p+1];for(let M=0;M<se;M++)Q+=(we-$*ce-J*Q)*O,Z+=(ye-$*ue-J*Z)*O,ce+=Q*O,ue+=Z*O;_[p]=ce,_[p+1]=ue,V[p]=Q,V[p+1]=Z,xe=Math.max(xe,Math.abs(ce)+Math.abs(ue)+(Math.abs(Q)+Math.abs(Z))*.05)}}const ge=o.top,qe=o.bottom-o.top+1;if(xe<.02&&I<=1&&!F.length){for(let m=o.top;m<=o.bottom;m++)_.fill(0,(m*w+j)*2,(m*w+pe+1)*2),V.fill(0,(m*w+j)*2,(m*w+pe+1)*2);o.top=0,o.bottom=-1}return e.bindTexture(e.TEXTURE_2D,K),e.texSubImage2D(e.TEXTURE_2D,0,0,ge,w,qe,e.RG,e.FLOAT,_.subarray(ge*w*2,(ge+qe)*w*2)),o.bottom>=o.top},ae=()=>{const t=H(y.current),i=t.rotation*Math.PI/180,s=Math.cos(i),u=Math.sin(i),c=ft(t),h=t.amplitude*1.1+c+t.spacing*2+8,b=(d.width*Math.abs(s)+d.height*Math.abs(u))/2+h,x=(d.width*Math.abs(u)+d.height*Math.abs(s))/2+h,v=Math.ceil(b/t.spacing),A=v*2+1;let I=dt,F=Math.ceil(x*2/I)+1;A*F*2>ze&&(F=Math.max(16,Math.floor(ze/(A*2))),I=x*2/(F-1));const $=t.lineWidth*d.ratio,J=Math.max(.5,$/2),se=J+1,O=E.intro,ve=t.intro&&!L?(1-Math.pow(1-R(O/.7,0,1),3))*b*1.3:1e6,de=t.intro&&!L?Me((O-.1)/.9):1,w=Pe(t.lineColor),_=t.lightMode?lt(w):w,V=t.accentColor?Pe(t.accentColor):_,j=E.flow+t.variation*37.1;e.viewport(0,0,C.width,C.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.useProgram(ne.program),e.bindVertexArray(_e),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,K),e.uniform1i(r.uField,0),e.uniform2f(r.uView,d.width,d.height),e.uniform1f(r.uRatio,d.ratio),e.uniform2f(r.uAxis,s,u),e.uniform1f(r.uSpacing,t.spacing),e.uniform1f(r.uStep,I),e.uniform2f(r.uStart,-v*t.spacing,-x),e.uniform1f(r.uAmplitude,t.amplitude*de),e.uniform2f(r.uFrequency,.002/t.scale,.0015/t.scale),e.uniform2f(r.uDrift,j*.025,j*.0075),e.uniform1f(r.uTwist,t.twist),e.uniform1ui(r.uSeed,t.variation),e.uniform2i(r.uFieldSize,o.cols,o.rows),e.uniform1f(r.uCell,P),e.uniform1f(r.uLimit,c),e.uniform1f(r.uReach,se),e.uniform1f(r.uReveal,ve),e.uniform1f(r.uBand,Math.max(1,b*.3)),e.uniform1f(r.uHalf,J),e.uniform1f(r.uThin,Math.min(1,$)),e.uniform1i(r.uStyle,t.lineStyle),e.uniform1f(r.uPeriod,t.spacing*2.6),e.uniform1f(r.uFlow,E.flow*16%(t.spacing*2.6)),e.uniform3fv(r.uColor,_),e.uniform3fv(r.uAccent,V),e.uniform1f(r.uBase,.62),e.uniform1f(r.uHeat,c*.55),e.uniform1f(r.uFade,t.fade),e.uniform1f(r.uOpacity,t.opacity),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,F*2,A)},Ie=t=>{if(k=0,!ie||document.hidden)return;const i=H(y.current),s=X?R((t-X)/1e3,5e-4,.05):1/60;if(X=t,i.paused){E.intro=1,ae(),X=0;return}L||(E.flow+=s*i.speed),!i.intro||L?E.intro=1:E.intro<1&&(E.intro=Math.min(1,E.intro+s/pt));const u=ht(s);ae();const c=n.inside&&i.mouseInteraction&&Math.hypot(n.vx,n.vy)>1;!L||u||c||U.length||E.intro<1?k=requestAnimationFrame(Ie):X=0},N=()=>{!k&&ie&&!document.hidden&&(k=requestAnimationFrame(Ie))},he=()=>{const t=H(y.current),i=Math.max(1,q.clientWidth),s=Math.max(1,q.clientHeight),u=Math.min(t.dpr||window.devicePixelRatio||1,2);d.width=i,d.height=s,C.width=Math.max(1,Math.round(i*u)),C.height=Math.max(1,Math.round(s*u)),d.ratio=C.width/i,mt(),ae(),N()},Fe=(t,i)=>{const s=q.getBoundingClientRect(),u=t.clientX-s.left,c=t.clientY-s.top,h=u>=0&&c>=0&&u<=s.width&&c<=s.height;return(i||h&&!n.inside)&&(n.sx=u,n.sy=c,n.vx=0,n.vy=0),n.inside=h,n.x=u,n.y=c,{x:u,y:c,rect:s,inside:h}},De=t=>{Fe(t,!1),y.current.paused||N()},Ce=t=>{const i=H(y.current),{x:s,y:u,rect:c,inside:h}=Fe(t,t.pointerType!=="mouse");h&&i.clickRipple&&!i.paused&&!L&&(U.push({x:s,y:u,age:0,range:Math.max(360,Math.hypot(c.width,c.height)*.55)}),U.length>6&&U.shift()),N()},re=t=>{t.pointerType!=="mouse"&&(n.inside=!1)},Ue=()=>{n.inside=!1,N()},Xe=()=>{X=0,N()},Ne=new ResizeObserver(he);Ne.observe(q);const Oe=new IntersectionObserver(t=>{ie=t.some(i=>i.isIntersecting),ie&&(X=0,N())});Oe.observe(q),T(window).addEventListener("pointermove",De,{passive:!0}),T(window).addEventListener("pointerdown",Ce,{passive:!0}),T(window).addEventListener("pointerup",re,{passive:!0}),T(window).addEventListener("pointercancel",re,{passive:!0}),T(document.documentElement).addEventListener("pointerleave",Ue),document.addEventListener("visibilitychange",Xe),he();let Ve=y.current.dpr;return fe.current=()=>{const t=H(y.current);if(t.dpr!==Ve){Ve=t.dpr,he();return}k||ae(),N()},()=>{cancelAnimationFrame(k),fe.current=null,Ne.disconnect(),Oe.disconnect(),T(window).removeEventListener("pointermove",De),T(window).removeEventListener("pointerdown",Ce),T(window).removeEventListener("pointerup",re),T(window).removeEventListener("pointercancel",re),T(document.documentElement).removeEventListener("pointerleave",Ue),document.removeEventListener("visibilitychange",Xe),e.deleteProgram(ne.program),e.deleteVertexArray(_e),e.deleteTexture(K),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),B.useEffect(()=>{fe.current?.()}),je.jsx("div",{ref:Se,className:`waves${Re?` ${Re}`:""}`,style:{backgroundColor:S,...ut},children:je.jsx("canvas",{ref:be,className:"waves__canvas","aria-hidden":"true"})})};export{St as default};
