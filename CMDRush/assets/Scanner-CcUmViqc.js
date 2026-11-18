import{r as S,j as ae}from"./index-uEvbEw5g.js";import{b as R}from"./App-Dofw4Ib9.js";import{b as O}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const b=6,_e=2,ke={vertical:0,horizontal:1,diagonal:2},De=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Ne=`#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uWave;
uniform float uSweep;
uniform float uSweepWidth;
uniform float uTrail;
uniform float uScale;
uniform float uFrequency;
uniform float uRipple;
uniform float uDensity;
uniform float uLineWidth;
uniform float uGlow;
uniform float uDirection;
uniform float uSpread;
uniform float uBrightness;
uniform float uVignette;
uniform float uOpacity;
uniform float uScanline;
uniform float uRatio;
uniform float uGrain;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPresence;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uAttract;
uniform vec3 uPings[${b}];
uniform float uIntro;
uniform float uLightMode;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float signal(vec2 p, float t) {
  float w = sin(p.x * 1.3 + t * 0.7);
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;
  return w * 0.35;
}

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

vec2 axes(vec2 p) {
  if (uDirection < 0.5) return vec2(p.y, p.x);
  if (uDirection < 1.5) return vec2(p.x, -p.y);
  return vec2((p.x + p.y) * 0.70710678, (p.x - p.y) * 0.70710678);
}

float coverage(float lc, float width) {
  float fw = max(fwidth(lc), 1e-5);
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;
  float crowd = smoothstep(0.2, 0.55, fw);
  float cover = clamp(width * 0.5 + 0.5 - dist, 0.0, 1.0) * min(width, 1.0);
  return mix(cover, min(width * fw, 1.0), crowd);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;
  vec2 p = uv / max(uScale, 0.001);
  vec2 ax = axes(p);

  float sig = signal(p * uFrequency, uWave);
  float coord = ax.x + sig * uRipple;

  vec2 mp = uMouse / max(uScale, 0.001);
  vec2 md = p - mp;
  float radius = max(uMouseRadius / max(uScale, 0.001), 0.01);
  float lens = exp(-dot(md, md) / (radius * radius)) * uPresence;
  float mouseAxis = axes(mp).x + signal(mp * uFrequency, uWave) * uRipple;
  coord -= (coord - mouseAxis) * lens * uMouseStrength * mix(0.55, -0.9, uAttract);

  float pingLight = 0.0;
  for (int i = 0; i < ${b}; i++) {
    vec3 ping = uPings[i];
    if (ping.z < 0.0) continue;
    float d = length(uv - ping.xy);
    float age = ping.z;
    float r = age * 1.1;
    float w = 0.12 + age * 0.1;
    float band = exp(-((d - r) * (d - r)) / (w * w));
    float fade = exp(-age * 0.9) * smoothstep(0.0, 0.12, age);
    coord += band * fade * 0.018 / max(uScale, 0.001);
    pingLight += band * fade;
  }

  float u = fract(uSweep - coord / max(uSweepWidth, 0.05));
  float tail = mix(11.0, 1.8, clamp(uTrail, 0.0, 1.0));
  float lead = smoothstep(0.84, 1.0, u);
  lead *= lead;
  float sweep = max(exp(-u * tail), lead);
  float head = max(exp(-u * 26.0), lead * lead * lead);

  float introFront = mix(-1.6, 1.6, smoother(uIntro)) / max(uScale, 0.001);
  float reveal = 1.0 - smoothstep(introFront - 0.05, introFront + 0.3, coord);
  float introHead = exp(-abs(coord - introFront) * 14.0) * (1.0 - uIntro) * step(0.0001, 1.0 - uIntro);
  reveal = mix(reveal, 1.0, step(0.9999, uIntro));

  float lit = clamp(sweep * 0.86 + lens * uMouseStrength * 0.7 + pingLight * 0.9 + introHead, 0.0, 1.6);
  float hot = clamp(head + introHead + pingLight * 0.35, 0.0, 1.0);

  float lc = coord * uDensity;
  float width = uLineWidth * (1.0 + lit * 1.4 + hot * 0.9);
  float thread = 0.62 + 0.38 * hash(vec2(floor(lc + 0.5), 3.7));
  float split = uSpread * (0.5 + lit * 1.3) * max(fwidth(lc), 1e-5);
  float cg = coverage(lc, width);
  float cr = coverage(lc + split, width);
  float cb = coverage(lc - split, width);

  float fw = max(fwidth(lc), 1e-5);
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;
  float crowd = smoothstep(0.2, 0.55, fw);
  float halo = exp(-dist / (3.0 + uGlow * 9.0)) * (1.0 - crowd) * uGlow * lit * 1.15;

  float base = 0.11 * reveal;
  float level = (base + lit * (1.0 - base)) * thread * uBrightness;

  vec3 tone = mix(uColor1, uColor2, smoothstep(0.05, 0.75, lit));
  tone = mix(tone, uColor3, hot);
  vec3 haloTone = mix(uColor1, uColor2, 0.65);

  float vx = smoother((1.0 - abs(uv.x / (uResolution.x / uResolution.y))) / 0.6);
  float vy = smoother((1.0 - abs(uv.y)) / 0.6);
  float vignette = mix(1.0, vx * vy, uVignette);

  vec3 cover3 = vec3(cr, cg, cb);
  float alphaLine = max(max(cr, cg), cb) * level;
  vec3 colLine = tone * cover3 * level;

  float grain = (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * uGrain;
  float scan = 1.0 - uScanline * 0.55 * (0.5 + 0.5 * cos(gl_FragCoord.y * 6.2831853 / (3.0 * uRatio)));

  if (uLightMode > 0.5) {
    float ink = clamp(alphaLine * vignette * scan, 0.0, 1.0);
    float wash = clamp(halo * 0.28 * vignette, 0.0, 1.0);
    float alpha = clamp(ink + wash * (1.0 - ink) + grain * 0.5 * ink, 0.0, 1.0) * uOpacity;
    vec3 col = (tone * ink + haloTone * wash * (1.0 - ink)) / max(ink + wash * (1.0 - ink), 1e-4);
    fragColor = vec4(col * alpha, alpha);
    return;
  }

  vec3 col = (colLine + haloTone * halo) * vignette * scan;
  float alpha = clamp(max(alphaLine, halo) * vignette * scan + grain * max(alphaLine, 0.04), 0.0, 1.0);
  col = clamp(col + grain * 0.6 * alpha, 0.0, 1.0);
  col = min(col, vec3(alpha));
  fragColor = vec4(col * uOpacity, alpha * uOpacity);
}`,M=(n,l,u)=>Math.min(u,Math.max(l,n)),le=(n,l,u)=>{const i=n.createShader(l);return i?(n.shaderSource(i,u),n.compileShader(i),n.getShaderParameter(i,n.COMPILE_STATUS)?i:(n.deleteShader(i),null)):null},Oe=n=>{const l=le(n,n.VERTEX_SHADER,De),u=le(n,n.FRAGMENT_SHADER,Ne),i=n.createProgram();if(!l||!u||!i)return null;if(n.attachShader(i,l),n.attachShader(i,u),n.linkProgram(i),n.deleteShader(l),n.deleteShader(u),!n.getProgramParameter(i,n.LINK_STATUS))return n.deleteProgram(i),null;const E={},W=n.getProgramParameter(i,n.ACTIVE_UNIFORMS);for(let F=0;F<W;F++){const L=n.getActiveUniform(i,F);L&&(E[L.name.replace(/\[0\]$/,"")]=n.getUniformLocation(i,L.name))}return{program:i,uniforms:E}},B=n=>{let l=String(n||"#ffffff").replace("#","").trim();(l.length===3||l.length===4)&&(l=l.slice(0,3).split("").map(i=>i+i).join(""));const u=parseInt(l.slice(0,6),16);return Number.isNaN(u)?[1,1,1]:[(u>>16&255)/255,(u>>8&255)/255,(u&255)/255]},Be=({color1:n="#5227FF",color2:l="#FF9FFC",color3:u="#FFFFFF",speed:i=.5,sweepSpeed:E=.25,sweepWidth:W=1.6,trail:F=.5,reverse:L=!1,scale:ue=1.5,frequency:se=2,ripple:ce=.22,bandDensity:fe=11,lineWidth:me=1.2,glow:de=.6,scanDirection:he="vertical",colorSpread:pe=.7,brightness:ve=1,vignette:xe=.3,scanline:ge=!0,scanlineIntensity:we=.5,grain:ye=!0,grainIntensity:Se=.04,opacity:Re=1,mouseInteraction:Me=!0,mouseRadius:be=.5,mouseStrength:Ee=.7,mouseMode:Fe="repel",clickEffect:Le="ping",intro:Ce=!0,lightMode:Ae=!1,dpr:Ie,className:Pe="",style:Te})=>{const U=S.useRef(null),z=S.useRef(null),G=S.useRef(null),H={color1:n,color2:l,color3:u,speed:i,sweepSpeed:L?-E:E,sweepWidth:Math.max(.05,W),trail:M(F,0,1),scale:Math.max(.05,ue),frequency:se,ripple:ce,bandDensity:Math.max(.5,fe),lineWidth:Math.max(.2,me),glow:Math.max(0,de),direction:ke[he]??0,colorSpread:M(pe,0,1),brightness:Math.max(0,ve),vignette:M(xe,0,1),scanline:ge?M(we,0,1):0,grain:ye?Math.max(0,Se):0,opacity:M(Re,0,1),mouseInteraction:Me,mouseRadius:Math.max(.05,be),mouseStrength:Math.max(0,Ee),attract:Fe==="attract",clickEffect:Le,intro:Ce,lightMode:Ae,dpr:Ie},v=S.useRef(H);return v.current=H,S.useEffect(()=>{const w=U.current,h=z.current,e=h?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!w||!h||!e)return;const P=Oe(e);if(!P)return;const o=P.uniforms,j=e.createVertexArray(),T=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,s={width:1,height:1,ratio:1},p={x:0,y:0,inside:!1},f={x:0,y:0,ready:!1},d=new Float32Array(b*3);for(let t=0;t<b;t++)d[t*3+2]=-1;let C=0,_=0,X=0,$=-.39,K=0,A=v.current.intro&&!T?0:1,I=0,k=0,D=!0,N=0;const V=(t,r)=>[(t*2-s.width)/s.height,(s.height-r*2)/s.height],Y=()=>{const t=O(v.current);e.viewport(0,0,h.width,h.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(P.program),e.uniform2f(o.uResolution,h.width,h.height),e.uniform1f(o.uWave,X),e.uniform1f(o.uSweep,$),e.uniform1f(o.uSweepWidth,t.sweepWidth),e.uniform1f(o.uTrail,t.trail),e.uniform1f(o.uScale,t.scale),e.uniform1f(o.uFrequency,t.frequency),e.uniform1f(o.uRipple,t.ripple),e.uniform1f(o.uDensity,t.bandDensity),e.uniform1f(o.uLineWidth,t.lineWidth*s.ratio),e.uniform1f(o.uGlow,t.glow),e.uniform1f(o.uDirection,t.direction),e.uniform1f(o.uSpread,t.colorSpread),e.uniform1f(o.uBrightness,t.brightness),e.uniform1f(o.uVignette,t.vignette),e.uniform1f(o.uOpacity,t.opacity),e.uniform1f(o.uScanline,t.scanline),e.uniform1f(o.uRatio,s.ratio),e.uniform1f(o.uGrain,t.grain),e.uniform1f(o.uTime,K),e.uniform2f(o.uMouse,f.x,f.y),e.uniform1f(o.uPresence,t.mouseInteraction?_:0),e.uniform1f(o.uMouseRadius,t.mouseRadius),e.uniform1f(o.uMouseStrength,t.mouseStrength),e.uniform1f(o.uAttract,t.attract?1:0),e.uniform3fv(o.uPings,d),e.uniform1f(o.uIntro,A),e.uniform1f(o.uLightMode,t.lightMode?1:0),e.uniform3fv(o.uColor1,B(t.color1)),e.uniform3fv(o.uColor2,B(t.color2)),e.uniform3fv(o.uColor3,B(t.color3)),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.bindVertexArray(j),e.drawArrays(e.TRIANGLES,0,3)};let J=v.current.dpr;const q=()=>{const t=O(v.current);J=t.dpr,s.width=Math.max(1,w.clientWidth),s.height=Math.max(1,w.clientHeight),s.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),h.width=Math.max(1,Math.round(s.width*s.ratio)),h.height=Math.max(1,Math.round(s.height*s.ratio)),Y(),x()},Q=t=>{if(I=0,!D||document.hidden)return;const r=O(v.current);r.dpr!==J&&q();const a=k?M((t-k)/1e3,0,1/20):1/60;k=t,K+=a,T||(X+=a*r.speed,$+=a*r.sweepSpeed),A<1&&(A=Math.min(1,A+a/_e));const c=V(p.x,p.y),g=1-Math.exp(-a/.09);f.x+=(c[0]-f.x)*g,f.y+=(c[1]-f.y)*g,_+=((p.inside&&r.mouseInteraction?1:0)-_)*(1-Math.exp(-a/.3));let y=!T&&(r.speed!==0||r.sweepSpeed!==0)||A<1||_>.001;for(let m=0;m<b;m++)d[m*3+2]<0||(d[m*3+2]+=a,d[m*3+2]>4?d[m*3+2]=-1:y=!0);Y(),N=y?0:N+a,N<.5&&(I=requestAnimationFrame(Q))};function x(){N=0,!I&&D&&!document.hidden&&(k=0,I=requestAnimationFrame(Q))}const Z=t=>{const r=w.getBoundingClientRect(),a=t.clientX-r.left,c=t.clientY-r.top;return{x:a,y:c,inside:a>=0&&c>=0&&a<=r.width&&c<=r.height}},ee=t=>{const{x:r,y:a,inside:c}=Z(t),g=p.inside;if(p.inside=c,c&&(p.x=r,p.y=a,!g||!f.ready)){const[y,m]=V(r,a);f.x=y,f.y=m,f.ready=!0}(c||g)&&x()},te=t=>{if(O(v.current).clickEffect!=="ping"||T)return;const{x:a,y:c,inside:g}=Z(t);if(!g)return;const[y,m]=V(a,c);d[C*3]=y,d[C*3+1]=m,d[C*3+2]=0,C=(C+1)%b,x()},oe=()=>{p.inside=!1,x()},ne=()=>x(),ie=new ResizeObserver(q);ie.observe(w);const re=new IntersectionObserver(t=>{D=t.some(r=>r.isIntersecting),D&&x()});return re.observe(w),R(window).addEventListener("pointermove",ee,{passive:!0}),R(window).addEventListener("pointerdown",te,{passive:!0}),R(document.documentElement).addEventListener("pointerleave",oe),document.addEventListener("visibilitychange",ne),q(),G.current=x,()=>{cancelAnimationFrame(I),G.current=null,ie.disconnect(),re.disconnect(),R(window).removeEventListener("pointermove",ee),R(window).removeEventListener("pointerdown",te),R(document.documentElement).removeEventListener("pointerleave",oe),document.removeEventListener("visibilitychange",ne),e.deleteVertexArray(j),e.deleteProgram(P.program),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),S.useEffect(()=>{G.current?.()}),ae.jsx("div",{ref:U,className:`scanner-container ${Pe}`.trim(),style:Te,children:ae.jsx("canvas",{ref:z,className:"scanner-canvas","aria-hidden":"true"})})};export{Be as default};
