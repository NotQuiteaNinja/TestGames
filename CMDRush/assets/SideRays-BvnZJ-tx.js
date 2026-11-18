import{r as b,j as ae}from"./index-uEvbEw5g.js";import{b as g}from"./App-Dofw4Ib9.js";import{b as re}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Fe=24e5,O=Math.PI*2,ie={"top-right":{flipX:0,flipY:0,side:0},"top-left":{flipX:1,flipY:0,side:0},"bottom-right":{flipX:0,flipY:1,side:0},"bottom-left":{flipX:1,flipY:1,side:0},right:{flipX:0,flipY:0,side:1},left:{flipX:1,flipY:0,side:1}},Le=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,Ie=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uBlend;
uniform float uIntensity;
uniform float uSpread;
uniform float uDensity;
uniform float uSharpness;
uniform float uFalloff;
uniform float uGlow;
uniform float uSaturation;
uniform float uDust;
uniform float uOpacity;
uniform float uReveal;
uniform float uLight;
uniform vec3 uFrame;
uniform float uAim;
uniform vec3 uFocus;
uniform float uSway;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

float shafts(float u, float t, float seed, float aa) {
  float sway = (0.4 * sin(t * 0.31 + seed) + 0.24 * sin(t * 0.17 + seed * 2.3)) * uSway;
  float n = 0.7 * noise(vec2(u + sway + seed, t * 0.3)) + 0.3 * noise(vec2(u * 2.4 + sway * 1.5 + seed * 1.7, t * 0.45 + 3.0));
  float width = mix(0.5, 0.1, uSharpness);
  float s = mix(smoothstep(0.5 - width, 0.5 + width, n), 0.5, aa);
  return mix(0.05, 1.0, s);
}

float motes(vec2 p, float cell, float t, float seed) {
  p += vec2(t * 0.021, -t * 0.013) + seed * 7.31;
  vec2 grid = p / cell;
  vec2 id = floor(grid);
  vec2 f = grid - id;
  float h = hash(id + seed);
  if (h > 0.5) return 0.0;
  vec2 center = 0.25 + 0.5 * vec2(hash(id + 1.7 + seed), hash(id + 3.1 + seed));
  center += 0.1 * vec2(sin(t * 0.7 + h * 31.0), cos(t * 0.6 + h * 23.0));
  float size = mix(0.035, 0.09, hash(id + 5.3 + seed));
  float edge = length(fwidth(grid)) * 0.7;
  float twinkle = 0.55 + 0.45 * sin(t * 1.9 + h * 41.0);
  return (1.0 - smoothstep(size - edge, size + edge, length(f - center))) * twinkle;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 q = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  if (uFrame.x > 0.5) q.x = -q.x;
  if (uFrame.y > 0.5) q.y = -q.y;
  vec2 source = uFrame.z > 0.5 ? vec2(aspect * 0.5 + 0.42, 0.3) : vec2(aspect * 0.5 + 0.1, 0.62);
  float heading = (uFrame.z > 0.5 ? 3.42 : -2.48) + uAim + 0.035 * sin(uTime * 0.21) * uSway;
  vec2 v = q - source;
  float r = length(v);
  float angle = mod(atan(v.y, v.x) - heading + 3.14159265, 6.28318531) - 3.14159265;
  float t = uTime;
  float u = angle * uDensity;
  float aa = smoothstep(0.12, 0.45, fwidth(u));
  float offset = uSpread * 0.22;
  float fanA = exp(-pow((angle + offset) / uSpread, 2.0) * 1.4);
  float fanB = exp(-pow((angle - offset) / (uSpread * 1.15), 2.0) * 1.4);
  float focus = 1.0 + uFocus.z * exp(-pow((angle - uFocus.x) / uFocus.y, 2.0));
  float lightA = fanA * shafts(u, t, 0.0, aa) * focus;
  float lightB = fanB * shafts(u * 0.83, t * 0.6, 17.0, aa) * focus;
  float reach = 1.0 / (1.0 + pow(r / 0.4, uFalloff));
  vec3 glowColor = mix(uColorA, uColorB, uBlend);
  vec3 light = (uColorA * lightA * (1.0 - uBlend) + uColorB * lightB * uBlend) * 2.0 * reach;
  light += glowColor * uGlow * exp(-pow(r / 0.4, 2.0));
  if (uDust > 0.0) {
    float sparkle = motes(q, 0.06, t, 0.0) + 0.7 * motes(q, 0.038, t * 0.8, 9.0);
    light += mix(glowColor, vec3(1.0), 0.6) * sparkle * (lightA + lightB) * reach * uDust * 2.5;
  }
  light *= uIntensity * (1.0 - smoothstep(uReveal * 2.6 - 0.45, uReveal * 2.6, r)) * smoothstep(0.0, 0.35, uReveal);
  float gray = dot(light, vec3(0.2126, 0.7152, 0.0722));
  light = max(mix(vec3(gray), light, uSaturation), 0.0);
  float peak = max(light.r, max(light.g, light.b));
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  if (uLight > 0.5) {
    vec3 ink = pow(light / max(peak, 1e-4), vec3(2.0)) * 0.75;
    float alpha = clamp(pow(1.0 - exp(-peak * 2.6), 2.5) * 0.9 * uOpacity + grain, 0.0, 1.0);
    fragColor = vec4(pow(ink, vec3(1.0 / 2.2)) * alpha, alpha);
    return;
  }
  float mapped = 1.0 - exp(-peak);
  vec3 tone = light * (mapped / max(peak, 1e-4));
  tone = mix(tone, vec3(mapped), smoothstep(0.7, 1.0, mapped) * 0.55);
  vec3 shown = clamp(tone * uOpacity, 0.0, 1.0);
  float alpha = max(shown.r, max(shown.g, shown.b));
  vec3 color = clamp(shown * alpha + grain, 0.0, 1.0);
  fragColor = vec4(min(color, vec3(alpha)), alpha);
}`,c=(t,i,s)=>Math.min(s,Math.max(i,t)),Ce=t=>((t+Math.PI)%O+O)%O-Math.PI,se=t=>{const i=String(t||"").trim(),s=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(i);if(s){const d=s[1].length===3?s[1].replace(/./g,h=>h+h):s[1];return[0,2,4].map(h=>parseInt(d.slice(h,h+2),16)/255)}const n=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(i);return n?[n[1],n[2],n[3]].map(d=>c(parseFloat(d)/255,0,1)):[1,1,1]},Pe=(t,i)=>({source:t.side?[i*.5+.42,.3]:[i*.5+.1,.62],heading:t.side?3.42:-2.48}),le=(t,i,s)=>{const n=t.createShader(i);return n?(t.shaderSource(n,s),t.compileShader(n),t.getShaderParameter(n,t.COMPILE_STATUS)?n:(console.error(t.getShaderInfoLog(n)),t.deleteShader(n),null)):null},Be=t=>{const i=le(t,t.VERTEX_SHADER,Le),s=le(t,t.FRAGMENT_SHADER,Ie),n=i&&s?t.createProgram():null;if(!i||!s||!n)return i&&t.deleteShader(i),s&&t.deleteShader(s),null;if(t.attachShader(n,i),t.attachShader(n,s),t.linkProgram(n),t.deleteShader(i),t.deleteShader(s),!t.getProgramParameter(n,t.LINK_STATUS))return console.error(t.getProgramInfoLog(n)),t.deleteProgram(n),null;const d={},h=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let R=0;R<h;R++){const A=t.getActiveUniform(n,R);A&&(d[A.name]=t.getUniformLocation(n,A.name))}return{program:n,uniforms:d}},De=({rayColor1:t="#FFC46B",rayColor2:i="#96c8ff",blend:s=.6,origin:n="top-right",speed:d=2.5,intensity:h=2,spread:R=2,density:A=5,sharpness:ce=.5,tilt:fe=0,falloff:ue=1.6,glow:he=1,saturation:me=1,dust:de=0,followMouse:pe=!0,mouseInfluence:ve=.5,intro:ge=!0,lightMode:we=!1,opacity:xe=1,maxDevicePixelRatio:ye=2,className:G="",style:Se})=>{const V=b.useRef(null),U=b.useRef(null),k=b.useRef(null),[N,be]=b.useState(0),j={colorA:se(t),colorB:se(i),blend:c(s,0,1),frame:ie[n]??ie["top-right"],speed:Math.max(0,d)*.4,intensity:Math.max(0,h)*.75,spread:c(R,.1,8)*.225,density:c(A,1,40),sharpness:c(ce,0,1),tilt:c(fe,-180,180)*Math.PI/180,falloff:c(ue,.2,6),glow:Math.max(0,he)*1.2,saturation:Math.max(0,me),dust:c(de,0,1),followMouse:pe,mouseInfluence:c(ve,0,1),intro:ge,light:we,opacity:c(xe,0,1),maxRatio:c(ye,.5,3)},C=b.useRef(j);return C.current=j,b.useEffect(()=>{k.current?.()}),b.useEffect(()=>{const M=V.current,l=U.current;if(!M||!l)return;const o=l.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"}),P=o?Be(o):null;if(!o||!P)return;const E=window.matchMedia("(prefers-reduced-motion: reduce)").matches,H=o.createVertexArray(),p={width:1,height:1},w={x:0,y:0,inside:!1},m={value:0,velocity:0},x={angle:0,strength:0};let $=Math.random()*100,F=C.current.intro&&!E&&N===0?0:1,y=0,B=0,X=!0,q=document.visibilityState!=="hidden",z=!1,D=!1;const Re=()=>{const a=re(C.current),e=M.getBoundingClientRect(),f=Math.max(1,e.width),u=Math.max(1,e.height),S=Math.min(window.devicePixelRatio||1,a.maxRatio,Math.sqrt(Fe/(f*u))),L=Math.max(1,Math.round(f*S)),I=Math.max(1,Math.round(u*S));(l.width!==L||l.height!==I)&&(l.width=L,l.height=I),p.width=f,p.height=u},_=()=>{D=!0,v()},Ae=a=>{let e=(w.x-p.width/2)/p.height,f=(p.height/2-w.y)/p.height;a.frame.flipX&&(e=-e),a.frame.flipY&&(f=-f);const{source:u,heading:S}=Pe(a.frame,p.width/p.height);return Ce(Math.atan2(f-u[1],e-u[0])-S-a.tilt)},K=a=>{if(y=0,D&&(D=!1,Re()),z)return;const e=re(C.current),f=c((a-B)/1e3||0,0,.05);B=Math.max(B,a),$+=f*e.speed*(E?.3:1),F<1&&(F=Math.min(1,F+f/1.6));const u=e.followMouse&&w.inside&&!E,S=u?Ae(e):0,L=u?c(S,-e.spread,e.spread)*e.mouseInfluence:0,I=u?e.mouseInfluence:0,oe=1-Math.exp(-f*6);u&&(x.angle+=(c(S-m.value,-e.spread*1.5,e.spread*1.5)-x.angle)*oe),x.strength+=(I-x.strength)*oe;const ne=18,Me=2*Math.sqrt(ne);m.velocity+=((L-m.value)*ne-m.velocity*Me)*f,m.value+=m.velocity*f,o.viewport(0,0,l.width,l.height),o.useProgram(P.program),o.bindVertexArray(H);const r=P.uniforms;o.uniform2f(r.uResolution,l.width,l.height),o.uniform1f(r.uTime,$),o.uniform3f(r.uColorA,e.colorA[0],e.colorA[1],e.colorA[2]),o.uniform3f(r.uColorB,e.colorB[0],e.colorB[1],e.colorB[2]),o.uniform1f(r.uBlend,e.blend),o.uniform1f(r.uIntensity,e.intensity),o.uniform1f(r.uSpread,e.spread),o.uniform1f(r.uDensity,e.density),o.uniform1f(r.uSharpness,e.sharpness),o.uniform1f(r.uFalloff,e.falloff),o.uniform1f(r.uGlow,e.glow),o.uniform1f(r.uSaturation,e.saturation),o.uniform1f(r.uDust,e.dust),o.uniform1f(r.uOpacity,e.opacity),o.uniform1f(r.uReveal,1-Math.pow(1-F,3)),o.uniform1f(r.uLight,e.light?1:0),o.uniform3f(r.uFrame,e.frame.flipX,e.frame.flipY,e.frame.side),o.uniform1f(r.uAim,e.tilt+m.value),o.uniform3f(r.uFocus,x.angle,Math.max(.06,e.spread*.25),x.strength*1.4),o.uniform1f(r.uSway,E?0:1),o.drawArrays(o.TRIANGLES,0,3);const Ee=Math.abs(L-m.value)>1e-4||Math.abs(m.velocity)>1e-4||Math.abs(I-x.strength)>.001;(e.speed>0&&!E||F<1||Ee)&&X&&q&&(y=requestAnimationFrame(K))},v=()=>{y||z||!X||!q||(B=performance.now(),y=requestAnimationFrame(K))};k.current=()=>{_(),v()};const W=a=>{const e=M.getBoundingClientRect();w.x=a.clientX-e.left,w.y=a.clientY-e.top,w.inside=a.clientX>=e.left&&a.clientX<=e.right&&a.clientY>=e.top&&a.clientY<=e.bottom,v()},Y=()=>{w.inside=!1,v()},T=a=>{a.pointerType!=="mouse"&&Y()};g(window).addEventListener("pointermove",W,{passive:!0}),g(window).addEventListener("pointerup",T,{passive:!0}),g(window).addEventListener("pointercancel",T,{passive:!0}),g(document.documentElement).addEventListener("pointerleave",Y);const J=a=>{a.preventDefault(),z=!0,cancelAnimationFrame(y),y=0},Q=()=>be(a=>a+1);l.addEventListener("webglcontextlost",J),l.addEventListener("webglcontextrestored",Q);const Z=new ResizeObserver(()=>{_(),v()});Z.observe(M);const ee=new IntersectionObserver(a=>{X=a.some(e=>e.isIntersecting),v()});ee.observe(M);const te=()=>{q=document.visibilityState!=="hidden",v()};return document.addEventListener("visibilitychange",te),_(),v(),()=>{cancelAnimationFrame(y),k.current=null,Z.disconnect(),ee.disconnect(),g(window).removeEventListener("pointermove",W),g(window).removeEventListener("pointerup",T),g(window).removeEventListener("pointercancel",T),g(document.documentElement).removeEventListener("pointerleave",Y),document.removeEventListener("visibilitychange",te),l.removeEventListener("webglcontextlost",J),l.removeEventListener("webglcontextrestored",Q),o.isContextLost()||(o.deleteVertexArray(H),o.deleteProgram(P.program))}},[N]),ae.jsx("div",{ref:V,className:`side-rays${G?` ${G}`:""}`,style:Se,children:ae.jsx("canvas",{ref:U,className:"side-rays__canvas","aria-hidden":"true"})})};export{De as default};
