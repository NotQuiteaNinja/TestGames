import{r as C,j as Se}from"./index-uEvbEw5g.js";import{b as z}from"./App-Dofw4Ib9.js";import{b as q}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Me=8,Y=24,oe=4,Ae=1.3,He=.06,Fe=2.6,Ye=1.6,_e=["#120f17","#2a0f0a","#9a3412","#f97316","#fed7aa"],Ke={linear:0,radial:1},re=.2,Je=`#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Qe=`#version 300 es
precision highp float;
precision highp int;
uniform float uAspect;
uniform float uTime;
uniform vec3 uRamp[8];
uniform int uCount;
uniform int uType;
uniform vec2 uDir;
uniform float uExtent;
uniform float uBands;
uniform float uSoftness;
uniform float uFlow;
uniform float uScale;
uniform float uSilk;
uniform vec4 uStir[24];
uniform float uStirWeight[24];
uniform vec4 uTwirl[4];
uniform vec2 uSeed;
uniform float uContrast;
uniform float uSaturation;
uniform float uSettle;
uniform float uReveal;
in vec2 vUv;
out vec4 outColor;

vec2 hash2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash2(i), f);
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec2 drift(vec2 p, float t) {
  vec2 w1 = vec2(
    noise(p * 0.85 + vec2(t * 0.11, t * 0.07)),
    noise(p * 0.85 + vec2(4.1, 1.7) - vec2(t * 0.08, t * 0.12))
  );
  vec2 w2 = vec2(
    noise(p * 1.55 + w1 * 1.8 + vec2(1.3, 7.1) + t * 0.05),
    noise(p * 1.55 + w1 * 1.8 + vec2(6.4, 2.2) - t * 0.06)
  );
  return (w1 - 0.5) * 1.1 + (w2 - 0.5) * 0.55;
}

vec2 warp(vec2 p) {
  vec2 q = p / uScale;
  if (uType == 1) {
    float turn = uTime * 0.35;
    q = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * q;
  } else {
    q += vec2(-uDir.y, uDir.x) * uTime * 0.45;
  }
  return p + drift(q + uSeed, uTime) * uFlow * uScale * uSettle;
}

float coord(vec2 p) {
  vec2 w = warp(p);
  return uType == 1 ? 1.0 - length(w) * 1.1 : dot(w, uDir) / uExtent + 0.5;
}

vec3 labToRgb(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  for (int i = 0; i < 24; i++) {
    float w = uStirWeight[i];
    if (w <= 0.0) continue;
    vec2 d = p - uStir[i].xy;
    p -= uStir[i].zw * w * exp(-dot(d, d) / 0.045);
  }
  for (int i = 0; i < 4; i++) {
    float angle = uTwirl[i].z;
    if (angle == 0.0) continue;
    vec2 d = p - uTwirl[i].xy;
    float a = angle * exp(-dot(d, d) / (uTwirl[i].w * uTwirl[i].w));
    float c = cos(a);
    float s = sin(a);
    p = uTwirl[i].xy + mat2(c, -s, s, c) * d;
  }
  float raw = coord(p);
  float s = raw;
  if (uBands > 1.0) {
    s *= uBands;
    float cycle = floor(s);
    s = fract(s);
    if (mod(cycle, 2.0) > 0.5) s = 1.0 - s;
  }
  s = clamp(s, 0.0, 1.0);
  float scaled = s * float(uCount - 1);
  int index = int(min(floor(scaled), float(uCount - 2)));
  float f = scaled - float(index);
  float edge = max(uSoftness * 0.5, fwidth(scaled) * 0.75);
  float shaped = smoothstep(0.5 - edge, 0.5 + edge, f);
  vec3 from = uRamp[0];
  vec3 to = uRamp[1];
  for (int i = 0; i < 7; i++) {
    if (i == index) {
      from = uRamp[i];
      to = uRamp[i + 1];
    }
  }
  vec3 lab = mix(from, to, shaped);
  if (uSilk > 0.0) {
    vec2 grad = vec2(coord(p + vec2(0.004, 0.0)) - raw, coord(p + vec2(0.0, 0.004)) - raw) / 0.004;
    vec2 slope = grad * sin(3.14159265 * clamp(raw, 0.0, 1.0) * uBands) * uSilk * 4.0;
    vec3 normal = normalize(vec3(-slope, 1.0));
    vec3 light = normalize(vec3(-uDir.y, uDir.x, 1.2));
    float diffuse = dot(normal, light) - light.z;
    lab = uRamp[0] + (lab - uRamp[0]) * (1.0 + (diffuse * 0.35 + max(diffuse, 0.0) * diffuse * 0.6) * uSilk);
  }
  lab = mix(uRamp[0], lab, smoothstep(0.0, 1.0, uReveal * 1.5 - length(vUv - 0.5) * 0.6));
  lab.x = (lab.x - 0.55) * uContrast + 0.55;
  lab.yz *= uSaturation;
  outColor = vec4(encode(labToRgb(lab)), 1.0);
}`,Ze=`#version 300 es
precision highp float;
uniform sampler2D uField;
uniform float uGrain;
uniform float uGrainSize;
uniform float uFrame;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float clump(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec3 color = texture(uField, vUv).rgb;
  vec2 pixel = gl_FragCoord.xy + uFrame * vec2(17.0, 59.0);
  float fine = hash(pixel) + hash(pixel + 7.13) - 1.0;
  float coarse = (clump(pixel / max(uGrainSize, 1.0)) - 0.5) * 2.0;
  float grain = mix(fine, coarse, clamp(uGrainSize - 1.0, 0.0, 1.0) * 0.8);
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color += grain * uGrain * (0.45 + 2.2 * luma * (1.0 - luma));
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,v=(n,g,h)=>Math.min(h,Math.max(g,n)),ie=n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4,et=([n,g,h])=>{const l=ie(n),f=ie(g),w=ie(h),S=Math.cbrt(.4122214708*l+.5363325363*f+.0514459929*w),E=Math.cbrt(.2119034982*l+.6806995451*f+.1073969566*w),T=Math.cbrt(.0883024619*l+.2817188376*f+.6299787005*w);return[.2104542553*S+.793617785*E-.0040720468*T,1.9779984951*S-2.428592205*E+.4505937099*T,.0259040371*S+.7827717662*E-.808675766*T]},Le=(n,g,h)=>{const l=n.createShader(g);return l?(n.shaderSource(l,h),n.compileShader(l),n.getShaderParameter(l,n.COMPILE_STATUS)?l:(n.deleteShader(l),null)):null},Ue=(n,g)=>{const h=Le(n,n.VERTEX_SHADER,Je),l=Le(n,n.FRAGMENT_SHADER,g),f=n.createProgram();if(!h||!l||!f)return null;if(n.attachShader(f,h),n.attachShader(f,l),n.linkProgram(f),n.deleteShader(h),n.deleteShader(l),!n.getProgramParameter(f,n.LINK_STATUS))return n.deleteProgram(f),null;const w={},S=n.getProgramParameter(f,n.ACTIVE_UNIFORMS);for(let E=0;E<S;E++){const T=n.getActiveUniform(f,E);if(!T)continue;const B=T.name.replace(/\[0\]$/,"");w[B]=n.getUniformLocation(f,B)}return{program:f,uniforms:w}},it=({colors:n=_e,type:g="linear",angle:h=55,bands:l=1,speed:f=1,flow:w=.8,scale:S=1,softness:E=1,silk:T=.35,grainAmount:B=.08,grainSize:De=1.2,grainAnimated:Ie=!0,contrast:Pe=1,saturation:Ce=1,variation:ze=0,interactive:qe=!0,stir:Xe=1,clickSwirl:ke=!0,intro:Ge=!0,lightMode:Oe=!1,dpr:Be,className:ae="",style:Ne,...We})=>{const se=C.useRef(null),ce=C.useRef(null),K=C.useRef(null),N=(Array.isArray(n)&&n.length?n:_e).slice(0,Me),ue={colors:N.length>1?N:[N[0],N[0]],type:Ke[g]??0,angle:h,bands:v(l,1,8),speed:Math.max(0,f),flow:v(w,0,3),scale:v(S,.25,3),softness:v(E,0,1),silk:v(T,0,1),grainAmount:v(B,0,.5),grainSize:v(De,.5,4),grainAnimated:Ie,contrast:v(Pe,.2,2),saturation:v(Ce,0,2),variation:Math.max(0,ze),interactive:qe,stir:v(Xe,0,2),clickSwirl:ke,intro:Ge,lightMode:Oe,dpr:Be},R=C.useRef(ue);return R.current=ue,C.useEffect(()=>{const F=se.current,b=ce.current,e=b?.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!F||!b||!e)return;const W=Ue(e,Qe),V=Ue(e,Ze);if(!W||!V)return;const s=W.uniforms,j=V.uniforms,le=e.createVertexArray(),X=e.createTexture();e.bindTexture(e.TEXTURE_2D,X),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const J=e.createFramebuffer(),_={width:0,height:0},L=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),fe=new Map,Ve=t=>{const o=String(t),r=fe.get(o);if(r)return r;let c=[0,0,0];if(L){L.clearRect(0,0,1,1),L.fillStyle="#000000",L.fillStyle=o,L.fillRect(0,0,1,1);const[M,A,x]=L.getImageData(0,0,1,1).data;c=[M/255,A/255,x/255]}return fe.set(o,c),c},U=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,m={width:1,height:1,ratio:1},Q=new Float32Array(Me*3),me=new Float32Array(Y*4),Z=new Float32Array(Y),ee=new Float32Array(oe*4),d=[],p=[],i={x:.5,y:.5,sx:.5,sy:.5,vx:0,inside:!1,fresh:!0};let de="",he=0,y=R.current.intro&&!U?0:1,te=0,ne=0,k=0,D=0,$=!0;const je=()=>{const t=q(R.current),o=`${t.colors.join(",")}|${t.lightMode}`;if(o===de)return;de=o;const r=t.colors.map(c=>et(Ve(c)));if(!t.lightMode)r.forEach((c,M)=>Q.set(c,M*3));else{const c=r.map(([A])=>Math.abs(A-r[0][0])<.1),M=r.filter((A,x)=>!c[x]).reverse();r.forEach((A,x)=>{const[G,P,a]=c[x]?[1,0,0]:M.shift();Q.set([G+(1-G)*re,P*(1-re),a*(1-re)],x*3)})}},ve=()=>{const t=q(R.current),o=m.width/m.height;je(),e.bindVertexArray(le),e.disable(e.BLEND),e.bindFramebuffer(e.FRAMEBUFFER,J),e.viewport(0,0,_.width,_.height),e.useProgram(W.program),e.uniform1f(s.uAspect,o),e.uniform1f(s.uTime,he),e.uniform3fv(s.uRamp,Q),e.uniform1i(s.uCount,t.colors.length);const r=t.angle*Math.PI/180;e.uniform1i(s.uType,t.type),e.uniform2f(s.uDir,Math.sin(r),Math.cos(r)),e.uniform1f(s.uExtent,o*Math.abs(Math.sin(r))+Math.abs(Math.cos(r))),e.uniform1f(s.uBands,t.bands),e.uniform1f(s.uSoftness,t.softness),e.uniform1f(s.uFlow,t.flow),e.uniform1f(s.uScale,t.scale),e.uniform1f(s.uSilk,t.silk),e.uniform4fv(s.uStir,me),e.uniform1fv(s.uStirWeight,Z),e.uniform4fv(s.uTwirl,ee),e.uniform2f(s.uSeed,t.variation*3.17,t.variation*1.91),e.uniform1f(s.uContrast,t.contrast),e.uniform1f(s.uSaturation,t.saturation),e.uniform1f(s.uSettle,y*y*(3-2*y)),e.uniform1f(s.uReveal,y),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,b.width,b.height),e.useProgram(V.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,X),e.uniform1i(j.uField,0),e.uniform1f(j.uGrain,t.grainAmount),e.uniform1f(j.uGrainSize,t.grainSize*m.ratio),e.uniform1f(j.uFrame,te),e.drawArrays(e.TRIANGLES,0,3)},pe=()=>{const t=q(R.current);m.width=Math.max(1,F.clientWidth),m.height=Math.max(1,F.clientHeight),m.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),b.width=Math.max(1,Math.round(m.width*m.ratio)),b.height=Math.max(1,Math.round(m.height*m.ratio));const o=Math.max(1,Math.round(b.width/2)),r=Math.max(1,Math.round(b.height/2));(o!==_.width||r!==_.height)&&(_.width=o,_.height=r,e.bindTexture(e.TEXTURE_2D,X),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,o,r,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,J),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,X,0),e.bindFramebuffer(e.FRAMEBUFFER,null)),ve(),I()},$e=(t,o)=>{const r=q(R.current),c=1-Math.exp(-t/.06),M=i.sx,A=i.sy;i.sx+=(i.x-i.sx)*c,i.sy+=(i.y-i.sy)*c;const x=(i.sx-M)/t*o,G=(i.sy-A)/t;i.vx=x;const P=d[0];if(d.forEach(a=>{a.done&&(a.age+=t)}),r.interactive&&i.inside&&Math.hypot(x,G)>.02&&!U){(!P||P.done)&&(d.unshift({x:0,y:0,vx:0,vy:0,age:0,grow:0,done:!1}),d.length>Y&&d.pop());const a=d[0];a.x=(i.sx-.5)*o,a.y=i.sy-.5,a.vx=x,a.vy=G,a.grow=Math.min(1,a.grow+t/He),a.done=a.grow>=1}else P&&(P.done=!0);for(;d.length&&d[d.length-1].age>Ae;)d.pop();for(let a=0;a<Y;a++){const u=d[a];if(!u){Z[a]=0;continue}const O=1-u.age/Ae,H=Math.min(1,2.2/Math.max(Math.hypot(u.vx,u.vy),.001));me.set([u.x,u.y,u.vx*H,u.vy*H],a*4),Z[a]=O*O*u.grow*r.stir*.05}for(p.forEach(a=>{a.age+=t});p.length&&p[p.length-1].age>Fe;)p.pop();for(let a=0;a<oe;a++){const u=p[a];if(!u){ee[a*4+2]=0;continue}const O=u.age/Fe,H=Math.min(1,u.age/.18)*(1-O)*(1-O);ee.set([u.x,u.y,u.direction*2.4*H,.16+.1*Math.min(1,u.age/.5)],a*4)}},xe=t=>{if(k=0,!$||document.hidden)return;const o=q(R.current),r=D?v((t-D)/1e3,.001,.05):1/60;D=t,U||(he+=r*o.speed*.16),y<1&&(y=Math.min(1,y+r/Ye)),ne+=r,o.grainAnimated&&!U&&ne>1/24&&(ne=0,te=(te+1)%97),$e(r,m.width/m.height),ve(),!U&&(o.speed>0||o.grainAnimated)||y<1||d.length>0||p.length>0?k=requestAnimationFrame(xe):D=0};function I(){!k&&$&&!document.hidden&&(k=requestAnimationFrame(xe))}const ge=t=>{const o=F.getBoundingClientRect(),r=(t.clientX-o.left)/Math.max(1,o.width),c=1-(t.clientY-o.top)/Math.max(1,o.height);i.inside=r>=0&&r<=1&&c>=0&&c<=1,i.x=r,i.y=c,(i.fresh||!i.inside)&&(i.sx=r,i.sy=c,i.fresh=!1)},Ee=t=>{ge(t),(i.inside||d.length)&&I()},we=t=>{ge(t);const o=q(R.current);!i.inside||!o.clickSwirl||U||(p.unshift({x:(i.x-.5)*(m.width/m.height),y:i.y-.5,age:0,direction:i.vx<0?1:-1}),p.length>oe&&p.pop(),I())},Te=()=>{i.inside=!1},Re=()=>{D=0,I()},be=new ResizeObserver(pe);be.observe(F);const ye=new IntersectionObserver(t=>{$=t.some(o=>o.isIntersecting),$&&(D=0,I())});return ye.observe(F),z(window).addEventListener("pointermove",Ee,{passive:!0}),z(window).addEventListener("pointerdown",we,{passive:!0}),z(document.documentElement).addEventListener("pointerleave",Te),document.addEventListener("visibilitychange",Re),pe(),K.current=I,()=>{cancelAnimationFrame(k),K.current=null,be.disconnect(),ye.disconnect(),z(window).removeEventListener("pointermove",Ee),z(window).removeEventListener("pointerdown",we),z(document.documentElement).removeEventListener("pointerleave",Te),document.removeEventListener("visibilitychange",Re),e.deleteTexture(X),e.deleteFramebuffer(J),e.deleteVertexArray(le),e.deleteProgram(W.program),e.deleteProgram(V.program),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),C.useEffect(()=>{K.current?.()}),Se.jsx("div",{ref:se,className:`grainient-container${ae?` ${ae}`:""}`,style:Ne,...We,children:Se.jsx("canvas",{ref:ce,className:"grainient-canvas","aria-hidden":"true"})})};export{it as default};
