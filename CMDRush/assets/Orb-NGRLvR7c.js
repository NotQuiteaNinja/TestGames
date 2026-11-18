import{r as O,j as xe}from"./index-uEvbEw5g.js";import{b as x}from"./App-Dofw4Ib9.js";import{b as F}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Fe=1.1,N=3.2,Ie=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,ze=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uRotation;
uniform vec2 uReach;
uniform float uNear;
uniform float uAwake;
uniform vec3 uBackground;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uScale;
uniform float uWobble;
uniform float uGlow;
uniform float uBleed;
uniform float uHighlight;
uniform float uSwirl;
uniform float uOrbit;
uniform vec2 uEcho;
uniform float uReveal;
uniform float uOpacity;
uniform float uTrail;
uniform vec2 uTilt;
out vec4 outColor;

vec3 hash33(vec3 p3) {
  p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yxz + 19.19);
  return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);
}

float snoise3(vec3 p) {
  const float K1 = 0.333333333;
  const float K2 = 0.166666667;
  vec3 i = floor(p + (p.x + p.y + p.z) * K1);
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
  vec3 e = step(vec3(0.0), d0 - d0.yzx);
  vec3 i1 = e * (1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);
  vec3 d1 = d0 - (i1 - K2);
  vec3 d2 = d0 - (i2 - K1);
  vec3 d3 = d0 - 0.5;
  vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
  vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));
  return dot(vec4(31.316), n);
}

float light1(float intensity, float attenuation, float dist) {
  return intensity / (1.0 + dist * attenuation);
}

float light2(float intensity, float attenuation, float dist) {
  return intensity / (1.0 + dist * dist * attenuation);
}

vec4 draw(vec2 uv) {
  float rawLen = length(uv);
  vec2 dir = rawLen > 0.0001 ? uv / rawLen : vec2(1.0, 0.0);
  float reachAmount = length(uReach);
  vec2 reachDir = reachAmount > 0.00001 ? uReach / reachAmount : vec2(1.0, 0.0);
  float facing = exp((dot(dir, reachDir) - 1.0) * 3.2);
  float len = max(rawLen - reachAmount * facing * smoothstep(0.25, 0.65, rawLen), 0.0);
  uv = dir * len;
  float ang = atan(dir.y, dir.x);
  float invLen = len > 0.0 ? 1.0 / len : 0.0;
  float near = facing * uNear;
  float bgLuminance = dot(uBackground, vec3(0.299, 0.587, 0.114));

  float n0 = snoise3(vec3(uv * 0.65, uTime * 0.5)) * 0.5 + 0.5;
  float r0 = mix(0.8 - 0.04 * uWobble, 0.8 + 0.04 * uWobble, n0);
  float d0 = distance(uv, (r0 * invLen) * uv);
  float v0 = light1(1.0, 10.0 / uGlow, d0);
  v0 *= smoothstep(r0 * 1.05, r0, len);
  float reach = max(uBleed, 0.04);
  float innerFade = smoothstep(r0 * (1.0 - 0.2 * reach), r0 * (1.0 - 0.05 * reach), len);
  v0 *= mix(innerFade, 1.0, bgLuminance * 0.7 * min(uBleed, 1.0));
  float body = smoothstep(0.8 - 0.2 * reach, 0.8, len);
  float cl = cos(ang + uSwirl) * 0.5 + 0.5;

  vec2 pos = vec2(cos(uOrbit), sin(uOrbit)) * r0;
  float d = distance(uv, pos);
  vec2 head = vec2(cos(uOrbit), sin(uOrbit));
  float lag = atan(head.x * dir.y - head.y * dir.x, dot(dir, head));
  float trail = uTrail > 0.0 ? smoothstep(0.0, 0.35, lag) * exp(-max(lag, 0.0) * 2.6 / uTrail) : 0.0;
  float v1 = (light2(1.5, 5.0, d) + trail * 0.6) * uHighlight;
  v1 *= light1(1.0, 50.0, d0);
  float band = v0 * smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len) * body;
  float heat = pow(clamp(band / 0.82, 0.0, 1.0), 3.0);
  float bloom = light2(1.0, 160.0 / uGlow, max(len - r0, 0.0)) * smoothstep(0.4, 0.0, len - r0) * step(r0, len);

  float v2 = smoothstep(1.0, mix(0.6, 1.0, n0 * 0.5), len);
  float v3 = body;

  vec3 colBase = mix(uColor1, uColor2, cl);
  float fadeAmount = mix(1.0, 0.1, bgLuminance);

  float echoD = abs(len - r0 - uEcho.x);
  float echo = light1(1.0, 60.0, echoD) * smoothstep(0.12, 0.0, echoD) * uEcho.y;

  vec3 darkCol = mix(uColor3, colBase, v0);
  darkCol = (darkCol + v1) * v2 * v3 * (1.0 + uAwake + near * 0.35) + mix(colBase, vec3(1.0), 0.25) * heat * (0.28 + near * 0.3);
  darkCol = clamp(darkCol + colBase * (bloom * 0.1 + echo), 0.0, 1.0);

  vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);
  lightCol = mix(uBackground, lightCol, clamp(v0 + echo, 0.0, 1.0));
  lightCol = mix(lightCol, colBase, clamp(v0, 0.0, 1.0) * clamp(near * 0.4 + uAwake, 0.0, 0.6));
  lightCol = clamp(mix(lightCol, vec3(1.0), clamp(v1 * 0.35, 0.0, 0.6)), 0.0, 1.0);

  vec3 finalCol = mix(darkCol, lightCol, bgLuminance);
  float alpha = max(max(finalCol.r, finalCol.g), finalCol.b);
  return vec4(finalCol / (alpha + 1e-5), alpha);
}

vec2 toPlane(vec2 p, out float hit) {
  float cx = cos(uTilt.x);
  float sx = sin(uTilt.x);
  float cy = cos(uTilt.y);
  float sy = sin(uTilt.y);
  vec3 ex = vec3(cy, 0.0, -sy);
  vec3 ey = vec3(sy * sx, cx, cy * sx);
  vec3 normal = vec3(sy * cx, -sx, cy * cx);
  vec3 origin = vec3(0.0, 0.0, ${N.toFixed(1)});
  vec3 ray = vec3(p, -${N.toFixed(1)});
  float denom = dot(normal, ray);
  float t = -dot(normal, origin) / (abs(denom) > 0.00001 ? denom : -0.00001);
  hit = t > 0.0 ? 1.0 : 0.0;
  vec3 q = origin + ray * t;
  return vec2(dot(q, ex), dot(q, ey));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y) * 2.0;
  uv *= uScale;
  float hit = 1.0;
  if (abs(uTilt.x) + abs(uTilt.y) > 0.0001) uv = toPlane(uv, hit);

  float s = sin(uRotation);
  float c = cos(uRotation);
  uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

  vec4 col = draw(uv);
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  float alpha = clamp(col.a * hit * uReveal * uOpacity + dither, 0.0, 1.0);
  outColor = vec4(col.rgb * alpha * alpha, alpha);
}`,M=(a,g,y)=>Math.min(y,Math.max(g,a)),ge=(a,g,y)=>{const c=a.createShader(g);return c?(a.shaderSource(c,y),a.compileShader(c),a.getShaderParameter(c,a.COMPILE_STATUS)?c:(a.deleteShader(c),null)):null},Xe=a=>{const g=ge(a,a.VERTEX_SHADER,Ie),y=ge(a,a.FRAGMENT_SHADER,ze),c=a.createProgram();if(!g||!y||!c)return null;if(a.attachShader(c,g),a.attachShader(c,y),a.bindAttribLocation(c,0,"aPosition"),a.linkProgram(c),a.deleteShader(g),a.deleteShader(y),!a.getProgramParameter(c,a.LINK_STATUS))return a.deleteProgram(c),null;const q={},$=a.getProgramParameter(c,a.ACTIVE_UNIFORMS);for(let I=0;I<$;I++){const z=a.getActiveUniform(c,I);z&&(q[z.name]=a.getUniformLocation(c,z.name))}return{program:c,uniforms:q}},qe=({colors:a=["#9c43fe","#4cc2e9","#101499"],hue:g=0,backgroundColor:y="#000000",size:c=1,glow:q=1,bleed:$=1,wobble:I=1,highlight:z=1,trail:ye=1,tiltX:be=0,tiltY:we=0,speed:Me=1,hoverIntensity:Re=1,rotateOnHover:Se=!0,forceHoverState:Ce=!1,followCursor:Ae=!0,clickPulse:Ee=!0,intro:Le=!0,opacity:ke=1,paused:Te=!1,dpr:Pe,className:te="",style:Be})=>{const oe=O.useRef(null),ne=O.useRef(null),J=O.useRef(null),H=Array.isArray(a)?a:[],re={colors:[H[0]??"#9c43fe",H[1]??H[0]??"#4cc2e9",H[2]??"#101499"].map(String),hue:g,backgroundColor:String(y),size:M(c,.1,3),glow:M(q,.1,5),bleed:M($,0,4),wobble:Math.max(0,I),highlight:Math.max(0,z),trail:Math.max(0,ye),tiltX:M(be,-70,70),tiltY:M(we,-70,70),speed:Me,hoverIntensity:Math.max(0,Re),rotateOnHover:Se,forceHoverState:Ce,followCursor:Ae,clickPulse:Ee,intro:Le,opacity:M(ke,0,1),paused:Te,dpr:Pe},m=O.useRef(re);return m.current=re,O.useEffect(()=>{const E=oe.current,R=ne.current,t=R?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!E||!R||!t)return;const V=Xe(t);if(!V)return;const i=V.uniforms,ae=t.createBuffer(),Q=t.createVertexArray();t.bindVertexArray(Q),t.bindBuffer(t.ARRAY_BUFFER,ae),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0);const L=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),X=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,Z=new Map,ie=o=>{if(Z.has(o))return Z.get(o);let n=[0,0,0];if(L){L.clearRect(0,0,1,1),L.fillStyle="#000000",L.fillStyle=o,L.fillRect(0,0,1,1);const[r,l,h,s]=L.getImageData(0,0,1,1).data;n=s?[r/255,l/255,h/255]:[0,0,0]}return Z.set(o,n),n},Oe=(o,n)=>{if(!n)return o;const r=n*Math.PI/180,l=Math.cos(r),h=Math.sin(r),[s,u,d]=o,v=.299*s+.587*u+.114*d,S=.596*s-.274*u-.322*d,A=.211*s-.523*u+.312*d,b=S*l-A*h,p=S*h+A*l;return[v+.956*b+.621*p,v-.272*b-.647*p,v-1.106*b+1.703*p]},k={width:1,height:1},f={x:0,y:0,inside:!1},e={time:0,swirl:0,orbit:0,echo:1,rotation:0,hover:0,near:0,reachX:0,reachY:0,reachSpeedX:0,reachSpeedY:0,pulse:0,pulseSpeed:0,kick:m.current.intro&&!X?2.5:0,reveal:m.current.intro&&!X?0:1};let T=0,P=0,G=!0;const ce=(o,n)=>{const r=F(m.current),l=Math.min(k.width,k.height),h=1/(r.size*(1+e.pulse));let s=(o-k.width/2)/l*2*h,u=(k.height/2-n)/l*2*h;if(r.tiltX||r.tiltY){const S=-r.tiltX*Math.PI/180,A=r.tiltY*Math.PI/180,[b,p,Y,_]=[Math.cos(S),Math.sin(S),Math.cos(A),Math.sin(A)],C=[_*b,-p,Y*b],w=[s,u,-N],W=C[0]*w[0]+C[1]*w[1]+C[2]*w[2],j=-(C[2]*N)/(Math.abs(W)>1e-5?W:-1e-5);if(j<=0)return[99,99];const D=[w[0]*j,w[1]*j,N+w[2]*j];s=D[0]*Y-D[2]*_,u=D[0]*_*p+D[1]*b+D[2]*Y*p}const d=Math.sin(e.rotation),v=Math.cos(e.rotation);return[v*s-d*u,d*s+v*u]},U=()=>{const o=F(m.current),[n,r,l]=o.colors.map(d=>Oe(ie(d),o.hue)),h=e.reveal,s=h-1,u=1+2.2*s*s*s+1.2*s*s;t.viewport(0,0,R.width,R.height),t.useProgram(V.program),t.bindVertexArray(Q),t.uniform2f(i.uResolution,R.width,R.height),t.uniform1f(i.uTime,e.time),t.uniform2f(i.uReach,e.reachX,e.reachY),t.uniform1f(i.uNear,e.near),t.uniform1f(i.uAwake,e.hover*o.hoverIntensity*.18),t.uniform1f(i.uRotation,e.rotation),t.uniform3fv(i.uBackground,ie(o.backgroundColor)),t.uniform3fv(i.uColor1,n),t.uniform3fv(i.uColor2,r),t.uniform3fv(i.uColor3,l),t.uniform1f(i.uScale,1/(o.size*(1+e.pulse)*(.62+.38*u))),t.uniform1f(i.uWobble,o.wobble),t.uniform1f(i.uGlow,o.glow),t.uniform1f(i.uBleed,o.bleed),t.uniform1f(i.uHighlight,o.highlight),t.uniform2f(i.uEcho,e.echo*.55,e.echo<1?(1-e.echo)*(1-e.echo):0),t.uniform1f(i.uSwirl,e.swirl),t.uniform1f(i.uOrbit,e.orbit),t.uniform1f(i.uReveal,Math.min(1,h/.55)*Math.min(1,h/.55)*(3-2*Math.min(1,h/.55))),t.uniform1f(i.uOpacity,o.opacity),t.uniform1f(i.uTrail,o.trail),t.uniform2f(i.uTilt,-o.tiltX*Math.PI/180,o.tiltY*Math.PI/180),t.drawArrays(t.TRIANGLES,0,3)},se=o=>{if(T=0,!G||document.hidden)return;const n=F(m.current),r=P?M((o-P)/1e3,5e-4,.05):1/60;if(P=o,n.paused){e.reveal=1,U(),P=0;return}const l=X?0:1,[h,s]=ce(f.x,f.y),u=Math.hypot(h,s),d=f.inside&&l?M((1.45-u)/.4,0,1):0,v=d*d*(3-2*d),S=v*M((u-.15)/.45,0,1),A=v>.5,b=n.forceHoverState?1:v;e.hover+=(b-e.hover)*(1-Math.exp(-r/.16));const p=.075*n.hoverIntensity*S,Y=u>1e-4?h/u*p:0,_=u>1e-4?s/u*p:0;e.reachSpeedX+=(70*(Y-e.reachX)-7*e.reachSpeedX)*r,e.reachSpeedY+=(70*(_-e.reachY)-7*e.reachSpeedY)*r,e.reachX+=e.reachSpeedX*r,e.reachY+=e.reachSpeedY*r,e.near+=(S*n.hoverIntensity-e.near)*(1-Math.exp(-r/.12));const C=r*n.speed*l;e.time+=C,e.swirl+=C*2*(1+e.kick),e.echo=Math.min(1,e.echo+r/1.2),n.rotateOnHover&&(e.rotation+=r*.3*e.hover*l);const w=Math.atan2(s,h);if(n.followCursor&&A&&l){const W=Math.atan2(Math.sin(w-e.orbit),Math.cos(w-e.orbit));e.orbit+=W*(1-Math.exp(-r*6))}else e.orbit-=C;e.orbit=Math.atan2(Math.sin(e.orbit),Math.cos(e.orbit)),e.pulseSpeed+=(-170*e.pulse-11*e.pulseSpeed)*r,e.pulse+=e.pulseSpeed*r,e.kick*=Math.exp(-r*2.5),!n.intro||X?e.reveal=1:e.reveal<1&&(e.reveal=Math.min(1,e.reveal+r/Fe)),U(),T=requestAnimationFrame(se)},B=()=>{!T&&G&&!document.hidden&&(T=requestAnimationFrame(se))},ee=()=>{const o=F(m.current),n=Math.max(1,E.clientWidth),r=Math.max(1,E.clientHeight),l=Math.min(o.dpr||window.devicePixelRatio||1,2);k.width=n,k.height=r,R.width=Math.max(1,Math.round(n*l)),R.height=Math.max(1,Math.round(r*l)),U(),B()},le=o=>{const n=E.getBoundingClientRect();f.x=o.clientX-n.left,f.y=o.clientY-n.top,f.inside=f.x>=0&&f.y>=0&&f.x<=n.width&&f.y<=n.height},ue=o=>{le(o),m.current.paused||B()},he=o=>{const n=F(m.current);if(le(o),!f.inside||!n.clickPulse||n.paused||X)return;const[r,l]=ce(f.x,f.y);Math.hypot(r,l)>1||(e.pulseSpeed+=.9,e.kick=2.2,e.echo=0,B())},K=o=>{o.pointerType!=="mouse"&&(f.inside=!1)},fe=()=>{f.inside=!1},de=()=>{P=0,B()},me=new ResizeObserver(ee);me.observe(E);const ve=new IntersectionObserver(o=>{G=o.some(n=>n.isIntersecting),G&&(P=0,B())});ve.observe(E),x(window).addEventListener("pointermove",ue,{passive:!0}),x(window).addEventListener("pointerdown",he,{passive:!0}),x(window).addEventListener("pointerup",K,{passive:!0}),x(window).addEventListener("pointercancel",K,{passive:!0}),x(document.documentElement).addEventListener("pointerleave",fe),document.addEventListener("visibilitychange",de),ee();let pe=m.current.dpr;return J.current=()=>{const o=F(m.current);if(o.dpr!==pe){pe=o.dpr,ee();return}T||U(),B()},()=>{cancelAnimationFrame(T),J.current=null,me.disconnect(),ve.disconnect(),x(window).removeEventListener("pointermove",ue),x(window).removeEventListener("pointerdown",he),x(window).removeEventListener("pointerup",K),x(window).removeEventListener("pointercancel",K),x(document.documentElement).removeEventListener("pointerleave",fe),document.removeEventListener("visibilitychange",de),t.deleteProgram(V.program),t.deleteBuffer(ae),t.deleteVertexArray(Q),t.getExtension("WEBGL_lose_context")?.loseContext()}},[]),O.useEffect(()=>{J.current?.()}),xe.jsx("div",{ref:oe,className:`orb-container${te?` ${te}`:""}`,style:Be,children:xe.jsx("canvas",{ref:ne,className:"orb-canvas","aria-hidden":"true"})})};export{qe as default};
