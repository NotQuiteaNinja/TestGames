import{r as k,j as de}from"./index-uEvbEw5g.js";import{b as m}from"./App-Dofw4Ib9.js";import{b as L}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const ve=8,$=4,ze=2.2,He=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ue=`#version 300 es
precision highp float;
precision highp int;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uGloss;
uniform float uDepth;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uStarGlow;
uniform float uFlareGain;
uniform float uSquash;
uniform float uSaturation;
uniform float uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationAngle;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform int uLayers;
uniform vec3 uColors[${$}];
uniform int uColorCount;
uniform float uWarp;
uniform float uReveal;
uniform float uMode;
uniform vec3 uBackground;
uniform float uOpacity;
out vec4 outColor;

#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare, vec2 radial, float invReach) {
#ifdef WARP
  float along = dot(uv, radial);
  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));
#else
  float d = length(uv);
#endif
  float m = uStarGlow / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uFlareGain;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uFlareGain;
  m *= smoothstep(1.0, 0.2, d * invReach);
#ifdef WARP
  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));
#endif
  return m;
}

vec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

#ifdef PALETTE
      float pick = Hash21(si + 7.0) * float(uColorCount);
      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];
#else
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));
#endif

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      vec2 shift = vec2(0.0);
      float invReach = 1.0;
#ifdef REPEL
      vec2 away = si + 0.5 + pad - repelAt;
      float dist = length(away);
      float q = dist * spread;
      float cells = pushCells * exp(-q * q);
      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);
      shift = away * (moved / max(dist, 0.0001));
      invReach = 1.0 / (1.0 - moved);
#endif
      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      col += star * twinkle * size * base;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution;
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);

  vec2 repelAt = vec2(0.0);
  float strength = 0.0;
  float push = 0.0;
  if (uAutoCenterRepulsion > 0.0) {
    strength = uAutoCenterRepulsion;
    push = strength * 0.05;
  } else if (uMouseRepulsion > 0.5) {
    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;
    strength = max(uRepulsionStrength, 0.0);
    push = strength * 0.05 * uMouseActiveFactor;
  } else {
    uv += mouseNorm * 0.1 * uMouseActiveFactor;
  }
  float radius = 0.16 + 0.04 * strength;

  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);
  float angle = uRotationAngle;
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;
  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;
  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;
  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;
  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;

  vec3 col = vec3(0.0);
  float layers = float(uLayers);
  for (int k = 0; k < ${ve}; k++) {
    if (k >= uLayers) break;
    float i = float(k) / layers;
    float depth = fract(i + uDepth);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    vec2 offset = vec2(i * 453.32);
    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;
  }
  col *= uReveal;

  if (uMode > 1.5) {
    vec3 lit = col * smoothstep(0.0, 0.3, length(col));
    float energy = max(max(lit.r, lit.g), lit.b);
    vec3 tint = lit / max(energy, 0.0001);
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));
    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;
    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);
  } else if (uMode > 0.5) {
    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;
    outColor = vec4(col * alpha, alpha);
  } else {
    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);
  }
}`,D=(a,l,f)=>Math.min(f,Math.max(l,a)),Be=(a,l,f)=>(a?4:0)+(l?2:0)+(f?1:0),We=(a,l,f,F)=>{const R=`${l?`#define PALETTE
`:""}${f?`#define REPEL
`:""}${F?`#define WARP
`:""}`,c=a.createProgram(),y=a.createShader(a.VERTEX_SHADER),x=a.createShader(a.FRAGMENT_SHADER);return!c||!y||!x?null:(a.shaderSource(y,He),a.shaderSource(x,Ue.replace(`
`,`
${R}`)),a.compileShader(y),a.compileShader(x),a.attachShader(c,y),a.attachShader(c,x),a.bindAttribLocation(c,0,"aPosition"),a.linkProgram(c),a.deleteShader(y),a.deleteShader(x),c)},qe=(a,l)=>{if(!a.getProgramParameter(l,a.LINK_STATUS))return null;const f={},F=a.getProgramParameter(l,a.ACTIVE_UNIFORMS);for(let R=0;R<F;R++){const c=a.getActiveUniform(l,R);c&&(f[c.name.replace("[0]","")]=a.getUniformLocation(l,c.name))}return{program:l,uniforms:f}},Xe=({focal:a=[.5,.5],rotation:l=[1,0],starSpeed:f=.5,density:F=1,hueShift:R=140,disableAnimation:c=!1,speed:y=1,mouseInteraction:x=!0,glowIntensity:pe=.3,saturation:he=0,mouseRepulsion:ge=!0,repulsionStrength:Re=2,twinkleIntensity:ye=.3,rotationSpeed:xe=.1,autoCenterRepulsion:be=0,transparent:Ae=!0,lightMode:we=!1,starColors:X,starSize:Se=1,flareIntensity:Me=1,layers:Ee=4,direction:Ce="forward",clickWarp:Te=!0,intro:ke=!0,backgroundColor:Le,opacity:Fe=1,dpr:Oe,className:j="",style:Pe,..._e})=>{const Y=k.useRef(null),J=k.useRef(null),G=k.useRef(null),Ie=Array.isArray(X)?X.filter(Boolean).slice(0,$):[],Q={focal:Array.isArray(a)?a:[.5,.5],rotation:Array.isArray(l)?l:[1,0],starSpeed:f,density:Math.max(.01,F),hueShift:R,disableAnimation:c,speed:y,mouseInteraction:x,glowIntensity:Math.max(0,pe),saturation:Math.max(0,he),mouseRepulsion:ge,repulsionStrength:Re,twinkleIntensity:D(ye,0,1),rotationSpeed:xe,autoCenterRepulsion:Math.max(0,be),transparent:Ae,lightMode:we,palette:Ie,starSize:Math.max(0,Se),flareIntensity:Math.max(0,Me),layers:D(Math.round(Ee),2,ve),reverse:Ce==="backward",clickWarp:Te,intro:ke,backgroundColor:Le,opacity:D(Fe,0,1),dpr:Oe},d=k.useRef(Q);return d.current=Q,k.useEffect(()=>{const w=Y.current,p=J.current,t=p?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!w||!p||!t)return;const Z=t.getExtension("KHR_parallel_shader_compile"),O=new Map,P=(e,n,i)=>{const s=Be(e,n,i);let u=O.get(s);return u||(u={program:We(t,e,n,i),linked:null,done:!1},O.set(s,u)),u},z=(e,n,i,s)=>{const u=P(e,n,i);if(!u.done&&u.program){if(!s&&Z&&!t.getProgramParameter(u.program,Z.COMPLETION_STATUS_KHR))return null;u.linked=qe(t,u.program),u.done=!0}return u.linked},h=L(d.current);if(!z(h.palette.length>0,!1,!1,!0)){O.forEach(e=>e.program&&t.deleteProgram(e.program));return}const ee=t.createBuffer(),H=t.createVertexArray();t.bindVertexArray(H),t.bindBuffer(t.ARRAY_BUFFER,ee),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0);const S=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),M=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,U=new Map,te=(e,n)=>{if(!e)return n;const i=String(e);if(U.has(i))return U.get(i);let s=n;if(S){S.clearRect(0,0,1,1),S.fillStyle="#000000",S.fillStyle=i,S.fillRect(0,0,1,1);const[u,g,b]=S.getImageData(0,0,1,1).data;s=[u/255,g/255,b/255]}return U.set(i,s),s},oe=new Float32Array($*3),v={x:.5,y:.5,inside:!1},o={time:0,gloss:0,depth:0,angle:0,mx:.5,my:.5,active:0,boost:0,reveal:d.current.intro&&!M?0:1};let E=0,C=0,_=!0;const B=()=>{const e=L(d.current);e.palette.forEach((De,Ge)=>oe.set(te(De,[1,1,1]),Ge*3));const n=e.lightMode?e.transparent?3:2:e.transparent?1:0,i=te(e.backgroundColor,e.lightMode?[1,1,1]:[0,0,0]),s=o.reveal,u=e.palette.length>0,g=e.autoCenterRepulsion>0||e.mouseRepulsion&&e.repulsionStrength>0&&o.active>0,b=o.boost>0,A=z(u,!1,!1,!0);if(!A)return;const N=(g||b?z(u,g,b,!1):null)??A,r=N.uniforms;t.viewport(0,0,p.width,p.height),t.useProgram(N.program),t.bindVertexArray(H),t.uniform1f(r.uTime,o.time),t.uniform2f(r.uResolution,p.width,p.height),t.uniform2f(r.uFocal,e.focal[0],e.focal[1]),t.uniform2f(r.uRotation,e.rotation[0],e.rotation[1]),t.uniform1f(r.uGloss,o.gloss),t.uniform1f(r.uDepth,o.depth),t.uniform1f(r.uDensity,e.density),t.uniform1f(r.uHueShift,e.hueShift),t.uniform1f(r.uSpeed,e.speed),t.uniform2f(r.uMouse,o.mx,o.my);const V=1+o.boost*5;t.uniform1f(r.uStarGlow,.05*e.glowIntensity*e.starSize/Math.pow(V,.6)),t.uniform1f(r.uFlareGain,e.glowIntensity*e.flareIntensity),t.uniform1f(r.uSquash,1-1/(V*V)),t.uniform1f(r.uSaturation,e.saturation),t.uniform1f(r.uMouseRepulsion,e.mouseRepulsion?1:0),t.uniform1f(r.uTwinkleIntensity,e.twinkleIntensity),t.uniform1f(r.uRotationAngle,o.angle),t.uniform1f(r.uRepulsionStrength,e.repulsionStrength),t.uniform1f(r.uMouseActiveFactor,o.active),t.uniform1f(r.uAutoCenterRepulsion,e.autoCenterRepulsion),t.uniform1i(r.uLayers,e.layers),t.uniform3fv(r.uColors,oe),t.uniform1i(r.uColorCount,e.palette.length),t.uniform1f(r.uWarp,o.boost);const K=Math.min(1,s/.35);t.uniform1f(r.uReveal,K*K*(3-2*K)),t.uniform1f(r.uMode,n),t.uniform3fv(r.uBackground,i),t.uniform1f(r.uOpacity,e.opacity),t.drawArrays(t.TRIANGLES,0,3)},ne=e=>{if(E=0,!_||document.hidden)return;const n=L(d.current),i=C?D((e-C)/1e3,5e-4,.05):1/60;C=e;const s=n.disableAnimation||M?0:1;n.intro&&!M&&o.reveal<1?(o.reveal=Math.min(1,o.reveal+i/ze),o.boost=Math.max(o.boost,Math.pow(1-o.reveal,2)*1.4)):(!n.intro||M)&&(o.reveal=1);const u=n.starSpeed/10*(n.reverse?-1:1);o.time+=i*s,o.gloss+=i*u*s,o.depth+=i*u*n.speed*s*(1+o.boost*14),o.angle+=i*n.rotationSpeed*s,o.boost*=Math.exp(-i*1.3),o.boost<.001&&(o.boost=0);const g=1-Math.exp(-i/.325),b=n.mouseInteraction&&v.inside&&!M;b&&(o.mx+=(v.x-o.mx)*g,o.my+=(v.y-o.my)*g);const A=b?1:0;o.active+=(A-o.active)*g,Math.abs(A-o.active)<.001&&(o.active=A),B(),s>0||o.boost>0||o.active!==A||o.reveal<1?E=requestAnimationFrame(ne):C=0},T=()=>{!E&&_&&!document.hidden&&(E=requestAnimationFrame(ne))},W=()=>{const e=L(d.current),n=Math.max(1,w.clientWidth),i=Math.max(1,w.clientHeight),s=Math.min(e.dpr||window.devicePixelRatio||1,2);p.width=Math.max(1,Math.round(n*s)),p.height=Math.max(1,Math.round(i*s)),B(),T()},ae=e=>{const n=w.getBoundingClientRect(),i=e.clientX-n.left,s=e.clientY-n.top;v.inside=i>=0&&s>=0&&i<=n.width&&s<=n.height,v.x=i/Math.max(1,n.width),v.y=1-s/Math.max(1,n.height)},re=e=>{ae(e),T()},ie=e=>{const n=L(d.current);ae(e),!(!v.inside||!n.clickWarp||M)&&(o.boost=Math.min(1.6,o.boost+1),T())},I=e=>{e.pointerType!=="mouse"&&(v.inside=!1)},se=()=>{v.inside=!1},ue=()=>{C=0,T()},le=new ResizeObserver(W);le.observe(w);const ce=new IntersectionObserver(e=>{_=e.some(n=>n.isIntersecting),_&&(C=0,T())});ce.observe(w),m(window).addEventListener("pointermove",re,{passive:!0}),m(window).addEventListener("pointerdown",ie,{passive:!0}),m(window).addEventListener("pointerup",I,{passive:!0}),m(window).addEventListener("pointercancel",I,{passive:!0}),m(document.documentElement).addEventListener("pointerleave",se),document.addEventListener("visibilitychange",ue),W();const fe=h.autoCenterRepulsion>0||h.mouseInteraction&&h.mouseRepulsion,q=h.palette.length>0;(h.clickWarp||h.intro)&&P(q,!1,!0),fe&&P(q,!0,!1),fe&&h.clickWarp&&P(q,!0,!0);let me=d.current.dpr;return G.current=()=>{const e=L(d.current);if(e.dpr!==me){me=e.dpr,W();return}E||B(),T()},()=>{cancelAnimationFrame(E),G.current=null,le.disconnect(),ce.disconnect(),m(window).removeEventListener("pointermove",re),m(window).removeEventListener("pointerdown",ie),m(window).removeEventListener("pointerup",I),m(window).removeEventListener("pointercancel",I),m(document.documentElement).removeEventListener("pointerleave",se),document.removeEventListener("visibilitychange",ue),O.forEach(e=>e.program&&t.deleteProgram(e.program)),t.deleteBuffer(ee),t.deleteVertexArray(H),t.getExtension("WEBGL_lose_context")?.loseContext()}},[]),k.useEffect(()=>{G.current?.()}),de.jsx("div",{ref:Y,className:`galaxy-container${j?` ${j}`:""}`,style:Pe,..._e,children:de.jsx("canvas",{ref:J,className:"galaxy-canvas","aria-hidden":"true"})})};export{Xe as default};
