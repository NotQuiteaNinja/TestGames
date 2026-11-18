import{r as M,j as ue}from"./index-uEvbEw5g.js";import{b as p}from"./App-Dofw4Ib9.js";import{b as U}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Te=24e5,z=4,_e=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,Fe=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uPixel;
uniform float uTime;
uniform float uLines;
uniform float uWidth;
uniform float uGlow;
uniform float uBrightness;
uniform float uHighlight;
uniform float uHighlightWidth;
uniform float uWarp;
uniform float uScale;
uniform float uRotation;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uCycle;
uniform float uEdge;
uniform vec4 uMouse;
uniform vec4 uRipples[${z}];
uniform float uReveal;
uniform float uLight;
uniform float uOpacity;
out vec4 fragColor;

vec2 rotate(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);
}

float smootherstep(float edge0, float edge1, float x) {
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float bend(vec2 p, float t) {
  vec2 q = p * 2.0 / uScale;
  float w = 0.6 * sin(q.x * 0.55 + t * 0.4 + 0.6 * sin(q.y * 0.9 - t * 0.28));
  w += 0.21 * sin(q.x * 1.3 - t * 0.33 + q.y * 0.8 + 1.3);
  w += 0.12 * sin(q.y * 2.3 + q.x * 0.9 - t * 0.37 + 0.4);
  return w * uWarp * uScale * 0.46;
}

float river(vec2 p, float y, float t) {
  float drift = 0.7 * (0.18 * sin(p.x * 1.6 - t * 0.33 + 0.7) + 0.1 * sin(p.x * 3.1 + t * 0.21));
  float center = 0.5 * (0.2 * sin(t * 0.17) + 0.08 * sin(t * 0.29 + 1.3));
  float width = 0.13 * uHighlightWidth;
  float near = (y - center - drift) / width;
  float far = (y + 0.22 * sin(t * 0.13 + 2.0) - drift * 0.6 + 0.3) / (width * 0.55);
  return max(exp(-near * near), exp(-far * far) * 0.7);
}

vec3 palette(float x) {
  x = fract(x) * 3.0;
  if (x < 1.0) return mix(uColor1, uColor2, smoothstep(0.0, 1.0, x));
  if (x < 2.0) return mix(uColor2, uColor3, smoothstep(1.0, 2.0, x));
  return mix(uColor3, uColor1, smoothstep(2.0, 3.0, x));
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = rotate((gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y, uRotation);
  float t = uTime;

  vec2 mouse = rotate(uMouse.xy, uRotation);
  vec2 toMouse = p - mouse;
  float lens = exp(-dot(toMouse, toMouse) / (uMouse.w * uMouse.w));
  p.y -= (p.y - mouse.y) * lens * uMouse.z;

  float ring = 0.0;
  for (int i = 0; i < ${z}; i++) {
    vec4 ripple = uRipples[i];
    if (ripple.w <= 0.0) continue;
    float x = (length(p - rotate(ripple.xy, uRotation)) - ripple.z * 0.6) / 0.08;
    float fade = exp(-ripple.z * 1.3) * smoothstep(0.0, 0.12, ripple.z);
    float bump = exp(-x * x);
    p.y -= x * bump * 0.07 * fade;
    ring += bump * fade;
  }

  float w = bend(p, t);
  float y = p.y + w;
  float phi = y * uLines;
  float fw = max(fwidth(phi), 1e-5);
  float crowd = smoothstep(0.18, 0.5, fw);

  float fold = smoothstep(1.3, 2.2, fw * uResolution.y / uLines);
  float shimmer = mix(1.0, smoothstep(0.15, 0.85, noise(vec2(y * 1.6 + t * 0.07, p.x * 0.55 - t * 0.22))), 0.5);
  float lit = max(river(p, y, t), fold * 0.9) * shimmer;
  float light = mix(1.0, 0.07 + 0.93 * lit, uHighlight);
  light += (1.0 - light) * min(lens * step(0.0001, uMouse.z) * 0.9 + ring * 0.6, 1.0);

  float dist = abs(fract(phi + 0.5) - 0.5) / fw;
  float width = uWidth * uPixel * (1.0 + mix(1.5, 0.6, uLight) * lit * uHighlight);
  float cover = clamp(min(dist + width * 0.5, 0.5) - max(dist - width * 0.5, -0.5), 0.0, 1.0);
  cover = mix(cover, min(width * fw, 1.0), crowd);
  float halo = exp(-dist / (2.2 * uPixel)) * (1.0 - crowd) * uGlow;
  float thread = mix(1.0, 0.55 + 0.45 * hash(vec2(floor(phi + 0.5), 7.3)), 0.45 * (1.0 - crowd));

  float span = 0.5 * sqrt(aspect * aspect + 1.0);
  float sweep = -span + (2.0 * span + 0.6) * uReveal;
  float reveal = 1.0 - smoothstep(sweep - 0.6, sweep, p.x);

  float edge = 1.0;
  if (uEdge > 0.0) {
    float ex = min(uv.x, 1.0 - uv.x) * aspect;
    float ey = min(uv.y, 1.0 - uv.y);
    edge = smootherstep(0.0, uEdge * 0.5, ex) * smootherstep(0.0, uEdge * 0.5, ey);
  }

  vec3 tint = palette(y * 0.3 + p.x * 0.2 + uCycle);
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;

  if (uLight > 0.5) {
    float low = min(tint.r, min(tint.g, tint.b));
    float chroma = max(tint.r, max(tint.g, tint.b)) - low;
    vec3 hue = (tint - low) / max(chroma, 1e-3);
    vec3 ink = mix(vec3(0.08), hue * 0.56 + 0.06, smoothstep(0.04, 0.2, chroma));
    float alpha = (cover + halo * 0.35) * thread * light * uBrightness * reveal * edge * 0.78 * uOpacity;
    alpha = clamp(alpha + grain, 0.0, 1.0);
    fragColor = vec4(ink * alpha, alpha);
    return;
  }

  float strength = (cover + halo) * thread * light * uBrightness * reveal * edge;
  vec3 color = clamp(tint * strength * uOpacity, 0.0, 1.0);
  float alpha = max(color.r, max(color.g, color.b));
  color = clamp(color + grain, 0.0, 1.0);
  fragColor = vec4(min(color, vec3(alpha)), alpha);
}`,h=(t,l,a)=>Math.min(a,Math.max(l,t)),X=t=>{const l=String(t||"").trim(),a=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(l);if(a){const x=a[1].length===3?a[1].replace(/./g,d=>d+d):a[1];return[0,2,4].map(d=>parseInt(x.slice(d,d+2),16)/255)}const r=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(l);return r?[r[1],r[2],r[3]].map(x=>h(parseFloat(x)/255,0,1)):[1,1,1]},he=(t,l,a)=>{const r=t.createShader(l);return r?(t.shaderSource(r,a),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS)?r:(console.error(t.getShaderInfoLog(r)),t.deleteShader(r),null)):null},We=t=>{const l=he(t,t.VERTEX_SHADER,_e),a=he(t,t.FRAGMENT_SHADER,Fe),r=l&&a?t.createProgram():null;if(!l||!a||!r)return l&&t.deleteShader(l),a&&t.deleteShader(a),null;if(t.attachShader(r,l),t.attachShader(r,a),t.linkProgram(r),t.deleteShader(l),t.deleteShader(a),!t.getProgramParameter(r,t.LINK_STATUS))return console.error(t.getProgramInfoLog(r)),t.deleteProgram(r),null;const x={},d=t.getProgramParameter(r,t.ACTIVE_UNIFORMS);for(let C=0;C<d;C++){const P=t.getActiveUniform(r,C);P&&(x[P.name.replace(/\[0\]$/,"")]=t.getUniformLocation(r,P.name))}return{program:r,uniforms:x}},Ve=({color1:t="#ffffff",color2:l="#ffffff",color3:a="#ffffff",colorCycleSpeed:r=1,speed:x=.3,lineCount:d=72,lineWidth:C=1.3,glow:P=.6,brightness:me=1,highlight:pe=1,highlightWidth:de=1,warpIntensity:ge=1,warpScale:ve=1,rotation:xe=-33,edgeFade:we=0,enableMouseInteraction:ye=!0,mouseInfluence:Re=2,clickRipple:Ee=!0,intro:be=!0,lightMode:Me=!1,opacity:Le=1,maxDevicePixelRatio:Se=2,className:N="",style:Ce})=>{const $=M.useRef(null),j=M.useRef(null),H=M.useRef(null),[Y,Pe]=M.useState(0),K={color1:X(t),color2:X(l),color3:X(a),cycleSpeed:r,speed:Math.max(0,x),lines:h(d,2,400),width:h(C,.25,12),glow:Math.max(0,P),brightness:Math.max(0,me),highlight:h(pe,0,1),highlightWidth:h(de,.2,5),warp:h(ge,0,3),scale:h(ve,.2,4),rotation:xe*Math.PI/180,edge:h(we,0,1),mouse:ye,influence:h(Re,0,3),clickRipple:Ee,intro:be,light:Me,opacity:h(Le,0,1),maxRatio:h(Se,.5,3)},A=M.useRef(K);return A.current=K,M.useEffect(()=>{H.current?.()}),M.useEffect(()=>{const I=$.current,f=j.current;if(!I||!f)return;const o=f.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"}),F=o?We(o):null;if(!o||!F)return;const T=window.matchMedia("(prefers-reduced-motion: reduce)").matches,J=o.createVertexArray(),w={width:1,height:1,ratio:1},y={x:0,y:0,inside:!1},s={x:0,y:0,presence:0,ready:!1},g=[],L=new Float32Array(z*4);let Q=Math.random()*60,Z=0,_=A.current.intro&&!T&&Y===0?0:1,R=0,W=0,k=!0,O=document.visibilityState!=="hidden",V=!1,G=!1;const Ae=()=>{const i=U(A.current),e=I.getBoundingClientRect(),c=Math.max(1,e.width),m=Math.max(1,e.height),E=Math.min(window.devicePixelRatio||1,i.maxRatio,Math.sqrt(Te/(c*m))),S=Math.max(1,Math.round(c*E)),n=Math.max(1,Math.round(m*E));(f.width!==S||f.height!==n)&&(f.width=S,f.height=n),w.width=c,w.height=m,w.ratio=S/c},B=()=>{G=!0,v()},ee=(i,e)=>[(i-w.width/2)/w.height,(w.height/2-e)/w.height],te=i=>{if(R=0,G&&(G=!1,Ae()),V)return;const e=U(A.current),c=h((i-W)/1e3||0,0,.05);W=Math.max(W,i),Q+=c*e.speed*2.5*(T?.25:1),Z+=c*e.speed*e.cycleSpeed*.05,_<1&&(_=Math.min(1,_+c/1.8));const m=e.mouse&&y.inside&&!T;if(m){const[u,b]=ee(y.x,y.y);s.ready||(s.x=u,s.y=b,s.ready=!0);const fe=1-Math.exp(-c*10);s.x+=(u-s.x)*fe,s.y+=(b-s.y)*fe}const E=m?1:0;s.presence+=(E-s.presence)*(1-Math.exp(-c*5)),s.presence<.002&&!m&&(s.ready=!1);for(let u=g.length-1;u>=0;u--)g[u].age+=c,g[u].age>2.6&&g.splice(u,1);L.fill(0),g.forEach((u,b)=>{L[b*4]=u.x,L[b*4+1]=u.y,L[b*4+2]=u.age,L[b*4+3]=1});const S=1-Math.pow(1-_,3);o.viewport(0,0,f.width,f.height),o.useProgram(F.program),o.bindVertexArray(J);const n=F.uniforms;o.uniform2f(n.uResolution,f.width,f.height),o.uniform1f(n.uPixel,w.ratio),o.uniform1f(n.uTime,Q),o.uniform1f(n.uLines,e.lines),o.uniform1f(n.uWidth,e.width),o.uniform1f(n.uGlow,e.glow),o.uniform1f(n.uBrightness,e.brightness),o.uniform1f(n.uHighlight,e.highlight),o.uniform1f(n.uHighlightWidth,e.highlightWidth),o.uniform1f(n.uWarp,e.warp*(.25+.75*S)),o.uniform1f(n.uScale,e.scale),o.uniform1f(n.uRotation,e.rotation),o.uniform3f(n.uColor1,e.color1[0],e.color1[1],e.color1[2]),o.uniform3f(n.uColor2,e.color2[0],e.color2[1],e.color2[2]),o.uniform3f(n.uColor3,e.color3[0],e.color3[1],e.color3[2]),o.uniform1f(n.uCycle,Z),o.uniform1f(n.uEdge,e.edge),o.uniform4f(n.uMouse,s.x,s.y,s.presence*e.influence*.16,.2),o.uniform4fv(n.uRipples,L),o.uniform1f(n.uReveal,S),o.uniform1f(n.uLight,e.light?1:0),o.uniform1f(n.uOpacity,e.opacity),o.drawArrays(o.TRIANGLES,0,3);const Ie=Math.abs(E-s.presence)>.002;(e.speed>0&&!T||_<1||Ie||g.length>0||m)&&k&&O&&(R=requestAnimationFrame(te))},v=()=>{R||V||!k||!O||(W=performance.now(),R=requestAnimationFrame(te))};H.current=()=>{B(),v()};const oe=i=>{const e=I.getBoundingClientRect();return{x:i.clientX-e.left,y:i.clientY-e.top,inside:i.clientX>=e.left&&i.clientX<=e.right&&i.clientY>=e.top&&i.clientY<=e.bottom}},re=i=>{const e=oe(i);y.x=e.x,y.y=e.y,y.inside=e.inside,v()},ie=i=>{const e=U(A.current),c=oe(i);if(!c.inside||!e.clickRipple||T)return;const[m,E]=ee(c.x,c.y);g.push({x:m,y:E,age:0}),g.length>z&&g.shift(),v()},D=()=>{y.inside=!1,v()},q=i=>{i.pointerType!=="mouse"&&D()};p(window).addEventListener("pointermove",re,{passive:!0}),p(window).addEventListener("pointerdown",ie,{passive:!0}),p(window).addEventListener("pointerup",q,{passive:!0}),p(window).addEventListener("pointercancel",q,{passive:!0}),p(document.documentElement).addEventListener("pointerleave",D);const ne=i=>{i.preventDefault(),V=!0,cancelAnimationFrame(R),R=0},ae=()=>Pe(i=>i+1);f.addEventListener("webglcontextlost",ne),f.addEventListener("webglcontextrestored",ae);const se=new ResizeObserver(()=>{B(),v()});se.observe(I);const le=new IntersectionObserver(i=>{k=i.some(e=>e.isIntersecting),v()});le.observe(I);const ce=()=>{O=document.visibilityState!=="hidden",v()};return document.addEventListener("visibilitychange",ce),B(),v(),()=>{cancelAnimationFrame(R),H.current=null,se.disconnect(),le.disconnect(),p(window).removeEventListener("pointermove",re),p(window).removeEventListener("pointerdown",ie),p(window).removeEventListener("pointerup",q),p(window).removeEventListener("pointercancel",q),p(document.documentElement).removeEventListener("pointerleave",D),document.removeEventListener("visibilitychange",ce),f.removeEventListener("webglcontextlost",ne),f.removeEventListener("webglcontextrestored",ae),o.isContextLost()||(o.deleteVertexArray(J),o.deleteProgram(F.program))}},[Y]),ue.jsx("div",{ref:$,className:`line-waves${N?` ${N}`:""}`,style:Ce,children:ue.jsx("canvas",{ref:j,className:"line-waves__canvas","aria-hidden":"true"})})};export{Ve as default};
