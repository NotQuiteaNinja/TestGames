import{r as L,j as Me}from"./index-uEvbEw5g.js";import{b as d}from"./App-Dofw4Ib9.js";import{b as Q}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const qe=24e5,H=4,Le={"top-left":{anchor:[0,-.2],dir:[0,1]},"top-center":{anchor:[.5,-.2],dir:[0,1]},"top-right":{anchor:[1,-.2],dir:[0,1]},left:{anchor:[-.2,.5],dir:[1,0]},right:{anchor:[1.2,.5],dir:[-1,0]},"bottom-left":{anchor:[0,1.2],dir:[0,-1]},"bottom-center":{anchor:[.5,1.2],dir:[0,-1]},"bottom-right":{anchor:[1,1.2],dir:[0,-1]}},Ke=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,We=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uScale;
uniform float uTime;
uniform vec2 uSource;
uniform vec2 uAim;
uniform float uReach;
uniform vec3 uColor;
uniform float uSpread;
uniform float uLength;
uniform float uFade;
uniform float uSaturation;
uniform float uPulsating;
uniform float uNoise;
uniform float uDistortion;
uniform float uDensity;
uniform float uSharpness;
uniform float uGlow;
uniform float uHaze;
uniform float uAtmosphere;
uniform float uIntensity;
uniform vec4 uShadow;
uniform vec4 uPulses[${H}];
uniform vec2 uIntro;
uniform float uLight;
uniform float uOpacity;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);
}

float shape(float strength, float width) {
  float edge = max(mix(0.5, 0.08, uSharpness), width);
  return mix(strength, smoothstep(0.62 - edge, 0.62 + edge, strength), uSharpness);
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uScale;
  vec2 delta = coord - uSource;
  float distance = length(delta);
  vec2 dir = delta / max(distance, 1e-4);
  float cosAngle = dot(dir, uAim);
  float angle = cosAngle + uDistortion * sin(uTime * 2.0 + distance * 0.02) * 0.2;
  float slope = fwidth(angle);
  float depth = distance / uReach;

  float source = exp(-depth * depth * 9.0) * 0.9 + exp(-depth * 3.2) * 0.25;
  float glowLight = uGlow * source * smoothstep(-0.2, 0.6, cosAngle);
  float spread = pow(max(angle, 0.0), 1.0 / uSpread);
  float lengthFalloff = clamp(1.0 - distance / (uReach * uLength), 0.0, 1.0);
  float fadeFalloff = clamp(1.0 - distance / (uReach * uFade), 0.5, 1.0);
  float envelope = spread * lengthFalloff * fadeFalloff;
  float reveal = uIntensity * uIntro.y * (1.0 - smoothstep(uIntro.x - 0.35, uIntro.x, depth));
  if ((envelope * 1.6 + glowLight) * reveal < 0.0015) {
    fragColor = vec4(0.0);
    return;
  }

  float phaseA = angle * 36.2214 * uDensity + uTime * 1.5;
  float phaseB = -angle * 21.11349 * uDensity + uTime * 1.5;
  float phaseC = angle * 22.3991 * uDensity + uTime * 1.1;
  float phaseD = -angle * 18.0234 * uDensity + uTime * 1.1;
  float strengthA = clamp(0.75 + 0.15 * sin(phaseA) + 0.2 * cos(phaseB), 0.0, 1.0);
  float strengthB = clamp(0.75 + 0.15 * sin(phaseC) + 0.2 * cos(phaseD), 0.0, 1.0);
  float widthA = abs(0.15 * 36.2214 * cos(phaseA) + 0.2 * 21.11349 * sin(phaseB)) * uDensity * slope;
  float widthB = abs(0.15 * 22.3991 * cos(phaseC) + 0.2 * 18.0234 * sin(phaseD)) * uDensity * slope;
  float pulseA = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 4.5) : 1.0;
  float pulseB = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 3.3) : 1.0;
  float rayLight = envelope * (0.5 * shape(strengthA, widthA) * pulseA + 0.4 * shape(strengthB, widthB) * pulseB);

  if (uHaze > 0.0) {
    float around = atan(uAim.x * dir.y - uAim.y * dir.x, cosAngle);
    vec2 drift = vec2(around * 2.2 + uTime * 0.035, depth * 2.6 - uTime * 0.11);
    float fog = 0.65 * valueNoise(drift * vec2(3.0, 1.0)) + 0.35 * valueNoise(drift * vec2(7.0, 2.3) + 4.1);
    rayLight *= mix(1.0, 0.25 + 1.2 * fog, uHaze);
  }

  if (uShadow.z > 0.0) {
    vec2 toCursor = uShadow.xy - uSource;
    float cursorDistance = length(toCursor);
    float along = dot(delta, toCursor) / max(cursorDistance * cursorDistance, 1e-4);
    float side = abs(delta.x * toCursor.y - delta.y * toCursor.x) / max(cursorDistance, 1e-4);
    float trail = max(along - 1.0, 0.0);
    float width = uShadow.w * along + 0.22 * trail * cursorDistance;
    float behind = smoothstep(0.97, 1.25, along) * exp(-trail * 1.1);
    float shade = (1.0 - smoothstep(width * 0.3, width * 1.6, side)) * behind;
    rayLight *= 1.0 - uShadow.z * 0.62 * shade;
  }

  float boost = 0.0;
  for (int i = 0; i < ${H}; i++) {
    vec4 wave = uPulses[i];
    if (wave.z <= 0.0) continue;
    float x = (depth - wave.x) / wave.y;
    boost += wave.z * exp(-x * x);
  }
  float light = (rayLight * (1.0 + boost) + glowLight) * reveal;

  if (uNoise > 0.0) {
    float n = fract(sin(dot(coord * 0.02 + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453123);
    light *= 1.0 - uNoise + uNoise * n;
  }

  float near = clamp(1.2 - distance / (uResolution.y / uScale), 0.0, 1.0);
  vec3 tint = mix(vec3(0.9), vec3(0.1, 0.3, 0.5) + near * vec3(0.8, 0.6, 0.5), uAtmosphere);
  float gray = dot(tint, vec3(0.299, 0.587, 0.114));
  vec3 hue = max(mix(vec3(gray), tint, uSaturation), 0.0) * uColor;

  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  if (uLight > 0.5) {
    vec3 color = hue * light;
    float energy = max(color.r, max(color.g, color.b));
    vec3 tone = clamp(1.0 - (1.0 - hue / max(max(hue.r, max(hue.g, hue.b)), 1e-4)) * 1.8, 0.0, 1.0);
    float warm = clamp((min(tone.r, tone.g) - tone.b) * 2.0, 0.0, 1.0);
    vec3 ink = tone * (mix(0.66, 0.94, warm) - 0.1 * smoothstep(0.4, 1.2, energy));
    float density = clamp(0.82 * (1.0 - exp(-1.5 * energy * energy)) * uOpacity + grain, 0.0, 1.0);
    fragColor = vec4(ink * density, density);
    return;
  }
  float level = light < 0.75 ? light : 0.75 + 0.25 * (1.0 - exp(-(light - 0.75) / 0.25));
  float top = max(hue.r, max(hue.g, hue.b));
  hue = mix(hue, vec3(top), smoothstep(0.8, 1.0, level) * 0.45);
  vec3 shown = clamp(hue * level, 0.0, 1.0) * level;
  fragColor = vec4(clamp(shown + grain, 0.0, level) * uOpacity, level * uOpacity);
}`,f=(o,a,s)=>Math.min(s,Math.max(a,o)),Je=o=>{const a=String(o||"").trim(),s=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(a);if(s){const x=s[1].length===3?s[1].replace(/./g,p=>p+p):s[1];return[0,2,4].map(p=>parseInt(x.slice(p,p+2),16)/255)}const n=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(a);return n?[n[1],n[2],n[3]].map(x=>f(parseFloat(x)/255,0,1)):null},Ae=(o,a,s)=>{const n=o.createShader(a);return n?(o.shaderSource(n,s),o.compileShader(n),o.getShaderParameter(n,o.COMPILE_STATUS)?n:(console.error(o.getShaderInfoLog(n)),o.deleteShader(n),null)):null},Qe=o=>{const a=Ae(o,o.VERTEX_SHADER,Ke),s=Ae(o,o.FRAGMENT_SHADER,We),n=a&&s?o.createProgram():null;if(!a||!s||!n)return a&&o.deleteShader(a),s&&o.deleteShader(s),null;if(o.attachShader(n,a),o.attachShader(n,s),o.linkProgram(n),o.deleteShader(a),o.deleteShader(s),!o.getProgramParameter(n,o.LINK_STATUS))return console.error(o.getProgramInfoLog(n)),o.deleteProgram(n),null;const x={},p=o.getProgramParameter(n,o.ACTIVE_UNIFORMS);for(let C=0;C<p;C++){const D=o.getActiveUniform(n,C);D&&(x[D.name.replace(/\[0\]$/,"")]=o.getUniformLocation(n,D.name))}return{program:n,uniforms:x}},Z=o=>{const a=f(o,0,1);return a*a*a*(a*(a*6-15)+10)},rt=({raysOrigin:o="top-center",raysColor:a="#ffffff",raysSpeed:s=1,lightSpread:n=.5,rayLength:x=3,rayDensity:p=1,tilt:C=0,raySharpness:D=.35,glow:Ee=.6,haze:Re=.25,atmosphere:Pe=1,intensity:Ce=1,pulsating:De=!1,fadeDistance:Ie=1,saturation:Te=1,followMouse:Fe=!0,mouseInfluence:ze=.1,cursorShadow:_e=!0,clickPulse:Ne=!0,noiseAmount:Be=0,distortion:Oe=0,intro:Xe=!0,lightMode:Ge=!1,opacity:Ue=1,maxDevicePixelRatio:Ve=2,className:ee="",style:ke})=>{const te=L.useRef(null),oe=L.useRef(null),Y=L.useRef(null),[ne,He]=L.useState(0),re={origin:Le[o]||Le["top-center"],color:Je(a)||[1,1,1],speed:Math.max(0,s),spread:Math.max(.001,n),length:Math.max(.01,x),density:f(p,.1,6),tilt:f(C,-90,90)*Math.PI/180,sharpness:f(D,0,1),glow:Math.max(0,Ee),haze:f(Re,0,1),atmosphere:f(Pe,0,1),intensity:Math.max(0,Ce),pulsating:De,fade:Math.max(.01,Ie),saturation:Math.max(0,Te),follow:Fe,influence:f(ze,0,1),cursorShadow:_e,clickPulse:Ne,noise:f(Be,0,1),distortion:Oe,intro:Xe,light:Ge,opacity:f(Ue,0,1),maxRatio:f(Ve,.5,3)},I=L.useRef(re);return I.current=re,L.useEffect(()=>{Y.current?.()}),L.useEffect(()=>{const T=te.current,u=oe.current;if(!T||!u)return;const t=u.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"}),_=t?Qe(t):null;if(!t||!_)return;const N=window.matchMedia("(prefers-reduced-motion: reduce)").matches,ie=t.createVertexArray(),A={width:1,height:1,ratio:1},c={x:.5,y:.5,inside:!1,seen:!1},w={x:.5,y:.5},l={x:.5,y:.5,presence:0},g=[],F=new Float32Array(H*4);let ae=0,E=I.current.intro&&!N&&ne===0?0:1,y=0,B=0,$=!0,j=document.visibilityState!=="hidden",q=!1,K=!1;const Ye=()=>{const r=Q(I.current),e=T.getBoundingClientRect(),h=Math.max(1,e.width),R=Math.max(1,e.height),X=r.density*(.35+.65*r.sharpness),G=Math.max(f(.35+.3*X,.5,2),r.noise>0?1:0),z=Math.min(window.devicePixelRatio||1,r.maxRatio,G,Math.sqrt(qe/(h*R))),S=Math.max(1,Math.round(h*z)),b=Math.max(1,Math.round(R*z));(u.width!==S||u.height!==b)&&(u.width=S,u.height=b),A.width=h,A.height=R,A.ratio=S/h},W=()=>{K=!0,v()},se=r=>{if(y=0,K&&(K=!1,Ye()),q)return;const e=Q(I.current),h=f((r-B)/1e3||0,0,.05);B=Math.max(B,r),ae+=h*e.speed*(N?.35:1),E<1&&(E=Math.min(1,E+h/1.8));const R=1-Math.exp(-h/.2),X=e.follow&&c.seen?c.x:.5,G=e.follow&&c.seen?c.y:.5;w.x+=(X-w.x)*R,w.y+=(G-w.y)*R;const z=1-Math.exp(-h/.08);l.x+=(c.x-l.x)*z,l.y+=(c.y-l.y)*z;const S=c.inside&&e.cursorShadow&&!N;l.presence+=((S?1:0)-l.presence)*(1-Math.exp(-h/(S?.25:.5)));for(let m=g.length-1;m>=0;m--)g[m].age+=h,g[m].age>=2&&g.splice(m,1);F.fill(0),g.forEach((m,P)=>{const M=m.age;F[P*4]=.05+M*1.05,F[P*4+1]=.14+M*.14,F[P*4+2]=.9*Z(M/.15)*(1-Z(M/2))});const b=A.width,U=A.height,ge=e.origin.anchor[0]*b,ve=e.origin.anchor[1]*U,xe=Math.cos(e.tilt),we=Math.sin(e.tilt);let V=e.origin.dir[0]*xe-e.origin.dir[1]*we,k=e.origin.dir[0]*we+e.origin.dir[1]*xe;if(e.follow&&e.influence>0){const m=w.x*b-ge,P=w.y*U-ve,M=Math.hypot(m,P)||1,ye=V+(m/M-V)*e.influence,Se=k+(P/M-k)*e.influence,be=Math.hypot(ye,Se)||1;V=ye/be,k=Se/be}const $e=1-Math.pow(1-E,3);t.viewport(0,0,u.width,u.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(_.program),t.bindVertexArray(ie);const i=_.uniforms;t.uniform2f(i.uResolution,u.width,u.height),t.uniform1f(i.uScale,A.ratio),t.uniform1f(i.uTime,ae),t.uniform2f(i.uSource,ge,ve),t.uniform2f(i.uAim,V,k),t.uniform1f(i.uReach,Math.max(b,U)),t.uniform3f(i.uColor,e.color[0],e.color[1],e.color[2]),t.uniform1f(i.uSpread,e.spread),t.uniform1f(i.uLength,e.length),t.uniform1f(i.uFade,e.fade),t.uniform1f(i.uSaturation,e.saturation),t.uniform1f(i.uPulsating,e.pulsating?1:0),t.uniform1f(i.uNoise,e.noise),t.uniform1f(i.uDistortion,e.distortion),t.uniform1f(i.uDensity,e.density),t.uniform1f(i.uSharpness,e.sharpness),t.uniform1f(i.uGlow,e.glow),t.uniform1f(i.uHaze,e.haze),t.uniform1f(i.uAtmosphere,e.atmosphere),t.uniform1f(i.uIntensity,e.intensity),t.uniform4f(i.uShadow,l.x*b,l.y*U,l.presence,16),t.uniform4fv(i.uPulses,F),t.uniform2f(i.uIntro,$e*2.6,Z(E/.5)),t.uniform1f(i.uLight,e.light?1:0),t.uniform1f(i.uOpacity,e.opacity),t.drawArrays(t.TRIANGLES,0,3);const je=Math.abs(w.x-X)>1e-4||Math.abs(w.y-G)>1e-4||l.presence>.001&&Math.abs(l.x-c.x)+Math.abs(l.y-c.y)>1e-4||Math.abs((S?1:0)-l.presence)>.001||g.length>0;(e.speed>0||E<1||je)&&$&&j&&(y=requestAnimationFrame(se))},v=()=>{y||q||!$||!j||(B=performance.now(),y=requestAnimationFrame(se))};Y.current=()=>{W(),v()};const ce=r=>{const e=T.getBoundingClientRect();return{x:(r.clientX-e.left)/Math.max(1,e.width),y:(r.clientY-e.top)/Math.max(1,e.height),inside:r.clientX>=e.left&&r.clientX<=e.right&&r.clientY>=e.top&&r.clientY<=e.bottom}},le=r=>{const e=ce(r);!c.inside&&e.inside&&(l.x=e.x,l.y=e.y),c.x=e.x,c.y=e.y,c.inside=e.inside,c.seen=!0,v()},ue=r=>{const e=Q(I.current);!ce(r).inside||!e.clickPulse||N||(g.push({age:0}),g.length>H&&g.shift(),v())},J=()=>{c.inside=!1,v()},O=r=>{r.pointerType!=="mouse"&&J()};d(window).addEventListener("pointermove",le,{passive:!0}),d(window).addEventListener("pointerdown",ue,{passive:!0}),d(window).addEventListener("pointerup",O,{passive:!0}),d(window).addEventListener("pointercancel",O,{passive:!0}),d(document.documentElement).addEventListener("pointerleave",J);const fe=r=>{r.preventDefault(),q=!0,cancelAnimationFrame(y),y=0},he=()=>He(r=>r+1);u.addEventListener("webglcontextlost",fe),u.addEventListener("webglcontextrestored",he);const me=new ResizeObserver(()=>{W(),v()});me.observe(T);const de=new IntersectionObserver(r=>{$=r.some(e=>e.isIntersecting),v()});de.observe(T);const pe=()=>{j=document.visibilityState!=="hidden",v()};return document.addEventListener("visibilitychange",pe),W(),v(),()=>{cancelAnimationFrame(y),Y.current=null,me.disconnect(),de.disconnect(),d(window).removeEventListener("pointermove",le),d(window).removeEventListener("pointerdown",ue),d(window).removeEventListener("pointerup",O),d(window).removeEventListener("pointercancel",O),d(document.documentElement).removeEventListener("pointerleave",J),document.removeEventListener("visibilitychange",pe),u.removeEventListener("webglcontextlost",fe),u.removeEventListener("webglcontextrestored",he),t.isContextLost()||(t.deleteVertexArray(ie),t.deleteProgram(_.program))}},[ne]),Me.jsx("div",{ref:te,className:`light-rays${ee?` ${ee}`:""}`,style:ke,children:Me.jsx("canvas",{ref:oe,className:"light-rays__canvas","aria-hidden":"true"})})};export{rt as default};
