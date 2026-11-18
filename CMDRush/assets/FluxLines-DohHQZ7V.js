import{r as E,j as ae}from"./index-uEvbEw5g.js";import{b as c}from"./App-Dofw4Ib9.js";import{b as O}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const U=8,Ae=1.8,ie={up:[0,1],down:[0,-1],left:[-1,0],right:[1,0]},Le=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ce=`
float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * 3.14159265 - 3.14159265 / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}
`,Fe=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uFlow;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uFluidity;
uniform float uRimWidth;
uniform float uSharpness;
uniform float uShimmer;
uniform float uGlow;
uniform float uLine;
uniform float uMaxHalf;
uniform vec3 uColors[${U}];
uniform int uColorCount;
uniform vec4 uMagnet;
uniform vec4 uSwirl;
uniform float uReveal;
uniform float uLight;
uniform float uOpaque;
uniform vec3 uBackground;
uniform float uOpacity;
out vec4 outColor;
${Ce}

vec3 palette(float h) {
  float x = clamp(h, 0.0, 1.0) * float(uColorCount - 1);
  int i = int(floor(x));
  int j = min(i + 1, uColorCount - 1);
  return mix(uColors[i], uColors[j], smoothstep(0.0, 1.0, x - float(i)));
}

void main() {
  float ref = 700.0 / max(uScale, 0.05);
  vec2 frag = gl_FragCoord.xy;
  vec2 toMagnet = (frag - uMagnet.xy) / uResolution.y;
  float pull = uMagnet.z * exp(-dot(toMagnet, toMagnet) / (uMagnet.w * uMagnet.w));
  if (pull > 0.001) {
    float angle = pull * 0.55;
    float c = cos(angle);
    float s = sin(angle);
    frag = uMagnet.xy + mat2(c, s, -s, c) * (frag - uMagnet.xy);
  }
  if (uSwirl.w > 0.0) {
    vec2 d = frag - uSwirl.xy;
    float reach = uSwirl.z;
    float angle = uSwirl.w * exp(-dot(d, d) / (reach * reach));
    float c = cos(angle);
    float s = sin(angle);
    frag = uSwirl.xy + mat2(c, s, -s, c) * d;
  }
  vec2 p = frag / uResolution.y * ref;

  float spd = 200.0 * uSpeed;
  float t = uTime;
  vec2 dir = uFlow;
  vec2 perp = vec2(-dir.y, dir.x);
  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;
  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);
  float field = smin(peaks, peaks2, max(uFluidity, 0.001));

  float slope = length(vec2(dFdx(field), dFdy(field)));
  float gap = abs(field - 0.4);
  float pixels = gap / max(slope, 1e-6);
  float halfBand = max(uRimWidth, 0.001) * 0.5;
  float across = max(gap / halfBand, pixels / uMaxHalf);
  float band = 5.0 * uRimWidth * (1.0 - across);
  float reveal = smoothstep(0.2, 0.85, pull);
  float shimmer = vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer * (1.0 - reveal * 0.75);
  float lit = clamp(band - shimmer, 0.0, 1.0);
  float glow = pow(lit, uSharpness) * uGlow * (1.0 + reveal * 0.25);
  float core = uLine > 0.0 ? smoothstep(uLine + 0.75, uLine - 0.75, pixels) * max(smoothstep(0.08, 0.6, glow), reveal) : 0.0;
  float shine = clamp(glow, 0.0, 1.0);
  float energy = max(shine * shine, core * 0.85) * uReveal;

  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 tint = palette(h);

  if (uLight > 0.5) {
    float chroma = max(tint.r, max(tint.g, tint.b)) - min(tint.r, min(tint.g, tint.b));
    vec3 ink = mix(vec3(0.07, 0.07, 0.08), tint * 0.55, clamp(chroma * 1.6, 0.0, 1.0));
    float cover = energy * uOpacity;
    outColor = uOpaque > 0.5 ? vec4(mix(uBackground, ink, cover), 1.0) : vec4(ink * cover, cover);
    return;
  }

  vec3 light = tint * energy * uOpacity;
  outColor = uOpaque > 0.5 ? vec4(uBackground + light, 1.0) : vec4(light, max(light.r, max(light.g, light.b)));
}`,se=(n,m,d)=>Math.min(d,Math.max(m,n)),le=(n,m,d)=>{const a=n.createShader(m);return a?(n.shaderSource(a,d),n.compileShader(a),n.getShaderParameter(a,n.COMPILE_STATUS)?a:(n.deleteShader(a),null)):null},ke=n=>{const m=le(n,n.VERTEX_SHADER,Le),d=le(n,n.FRAGMENT_SHADER,Fe),a=n.createProgram();if(!m||!d||!a)return null;if(n.attachShader(a,m),n.attachShader(a,d),n.bindAttribLocation(a,0,"aPosition"),n.linkProgram(a),n.deleteShader(m),n.deleteShader(d),!n.getProgramParameter(a,n.LINK_STATUS))return n.deleteProgram(a),null;const F={},I=n.getProgramParameter(a,n.ACTIVE_UNIFORMS);for(let A=0;A<I;A++){const L=n.getActiveUniform(a,A);L&&(F[L.name.replace("[0]","")]=n.getUniformLocation(a,L.name))}return{program:a,uniforms:F}},We=({colors:n=["#ffffff","#ffffff","#ffffff"],speed:m=.5,scale:d=1.6,turbulence:a=1,fluidity:F=.1,rimWidth:I=.2,sharpness:A=2.5,shimmer:L=1.5,glow:ue=2,lineWidth:fe=1,flowDirection:ce="down",opacity:me=1,mouseInteraction:de=!0,mouseStrength:pe=1,mouseRadius:he=.35,mouseDampening:ve=.15,clickSwirl:ge=!0,intro:xe=!0,lightMode:we=!1,transparent:ye=!0,backgroundColor:Me,paused:be=!1,dpr:Se,mixBlendMode:q,className:z="",style:G,...Re})=>{const j=E.useRef(null),H=E.useRef(null),_=E.useRef(null),X={colors:Array.isArray(n)&&n.length?n.slice(0,U):["#ffffff"],speed:m,scale:Math.max(.05,d),turbulence:a,fluidity:Math.max(.001,F),rimWidth:Math.max(.001,I),sharpness:Math.max(.1,A),shimmer:Math.max(0,L),glow:Math.max(0,ue),lineWidth:Math.max(0,fe),flow:ie[ce]??ie.down,opacity:se(me,0,1),mouseInteraction:de,mouseStrength:Math.max(0,pe),mouseRadius:Math.max(.01,he),mouseDampening:Math.max(0,ve),clickSwirl:ge,intro:xe,lightMode:we,transparent:ye,backgroundColor:Me,paused:be,dpr:Se},h=E.useRef(X);return h.current=X,E.useEffect(()=>{const x=j.current,f=H.current,e=f?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!x||!f||!e)return;const k=ke(e);if(!k)return;const r=k.uniforms,$=e.createBuffer(),W=e.createVertexArray();e.bindVertexArray(W),e.bindBuffer(e.ARRAY_BUFFER,$),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const w=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),B=new Map,Y=(t,o)=>{if(!t)return o;const i=String(t);if(B.has(i))return B.get(i);let s=o;if(w){w.clearRect(0,0,1,1),w.fillStyle="#000000",w.fillStyle=i,w.fillRect(0,0,1,1);const[p,R,g]=w.getImageData(0,0,1,1).data;s=[p/255,R/255,g/255]}return B.set(i,s),s},K=new Float32Array(U*3),C=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,l={x:0,y:0,inside:!1},u={x:0,y:0,active:0},v={x:0,y:0,age:10};let J=0,y=h.current.intro&&!C?0:1,M=0,b=0,T=!0;const D=()=>{const t=O(h.current),o=f.width/Math.max(1,x.clientWidth);t.colors.forEach((R,g)=>K.set(Y(R,[1,1,1]),g*3));const i=Math.min(1,y);e.viewport(0,0,f.width,f.height),e.useProgram(k.program),e.bindVertexArray(W),e.uniform2f(r.uResolution,f.width,f.height),e.uniform1f(r.uTime,J),e.uniform2f(r.uFlow,t.flow[0],t.flow[1]),e.uniform1f(r.uSpeed,t.speed),e.uniform1f(r.uScale,t.scale),e.uniform1f(r.uTurbulence,t.turbulence),e.uniform1f(r.uFluidity,t.fluidity),e.uniform1f(r.uRimWidth,t.rimWidth),e.uniform1f(r.uSharpness,t.sharpness),e.uniform1f(r.uShimmer,t.shimmer),e.uniform1f(r.uGlow,t.glow),e.uniform1f(r.uLine,t.lineWidth*o*.5),e.uniform1f(r.uMaxHalf,28*o),e.uniform3fv(r.uColors,K),e.uniform1i(r.uColorCount,t.colors.length),e.uniform4f(r.uMagnet,u.x,u.y,u.active*t.mouseStrength,t.mouseRadius);const s=v.age,p=1.9*Math.min(1,s/.23)*Math.exp(-Math.max(0,s-.23)*1.1);e.uniform4f(r.uSwirl,v.x,v.y,f.height*.22*(1+s*.5),s<6?p:0),e.uniform1f(r.uReveal,i*i*(3-2*i)),e.uniform1f(r.uLight,t.lightMode?1:0),e.uniform1f(r.uOpaque,t.transparent?0:1),e.uniform3fv(r.uBackground,Y(t.backgroundColor,t.lightMode?[1,1,1]:[.0706,.0588,.0902])),e.uniform1f(r.uOpacity,t.opacity),e.drawArrays(e.TRIANGLES,0,3)},Q=t=>{if(M=0,!T||document.hidden)return;const o=O(h.current),i=b?se((t-b)/1e3,5e-4,.05):1/60;b=t;const s=o.paused||C?0:1;J+=i*s,v.age+=i,o.intro&&!C&&y<1?y=Math.min(1,y+i/Ae):(!o.intro||C)&&(y=1);const p=o.mouseInteraction&&l.inside,R=o.mouseDampening>0?1-Math.exp(-i/o.mouseDampening):1;p&&(u.x+=(l.x-u.x)*R,u.y+=(l.y-u.y)*R);const g=p?1:0;u.active+=(g-u.active)*(1-Math.exp(-i/.3)),Math.abs(g-u.active)<.001&&(u.active=g),D(),s>0||u.active!==g||y<1||v.age<6?M=requestAnimationFrame(Q):b=0},S=()=>{!M&&T&&!document.hidden&&(M=requestAnimationFrame(Q))},V=()=>{const t=O(h.current),o=Math.max(1,x.clientWidth),i=Math.max(1,x.clientHeight),s=Math.min(t.dpr||window.devicePixelRatio||1,2);f.width=Math.max(1,Math.round(o*s)),f.height=Math.max(1,Math.round(i*s)),D(),S()},Ee=t=>{const o=x.getBoundingClientRect(),i=t.clientX-o.left,s=t.clientY-o.top,p=f.width/Math.max(1,o.width);l.inside=i>=0&&s>=0&&i<=o.width&&s<=o.height,l.x=i*p,l.y=(o.height-s)*p},N=t=>{const o=l.inside;Ee(t),l.inside&&!o&&u.active<.05&&(u.x=l.x,u.y=l.y),S()},Z=t=>{N(t),!(!l.inside||!h.current.clickSwirl||C)&&(v.x=l.x,v.y=l.y,v.age=0,S())},P=t=>{t.pointerType!=="mouse"&&(l.inside=!1)},ee=()=>{l.inside=!1},te=()=>{b=0,S()},ne=new ResizeObserver(V);ne.observe(x);const oe=new IntersectionObserver(t=>{T=t.some(o=>o.isIntersecting),T&&(b=0,S())});oe.observe(x),c(window).addEventListener("pointermove",N,{passive:!0}),c(window).addEventListener("pointerdown",Z,{passive:!0}),c(window).addEventListener("pointerup",P,{passive:!0}),c(window).addEventListener("pointercancel",P,{passive:!0}),c(document.documentElement).addEventListener("pointerleave",ee),document.addEventListener("visibilitychange",te),V();let re=h.current.dpr;return _.current=()=>{const t=O(h.current);if(t.dpr!==re){re=t.dpr,V();return}M||D(),S()},()=>{cancelAnimationFrame(M),_.current=null,ne.disconnect(),oe.disconnect(),c(window).removeEventListener("pointermove",N),c(window).removeEventListener("pointerdown",Z),c(window).removeEventListener("pointerup",P),c(window).removeEventListener("pointercancel",P),c(document.documentElement).removeEventListener("pointerleave",ee),document.removeEventListener("visibilitychange",te),e.deleteProgram(k.program),e.deleteBuffer($),e.deleteVertexArray(W),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),E.useEffect(()=>{_.current?.()}),ae.jsx("div",{ref:j,className:`flux-lines-container${z?` ${z}`:""}`,style:q?{...G,mixBlendMode:q}:G,...Re,children:ae.jsx("canvas",{ref:H,className:"flux-lines-canvas","aria-hidden":"true"})})};export{We as default};
