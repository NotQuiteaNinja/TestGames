import{r as M,j as me}from"./index-uEvbEw5g.js";import{b as R}from"./App-Dofw4Ib9.js";import{b as V}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const F=8,j=4,Ve=1.8,K=1.6,We=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,qe=`#version 300 es
precision highp float;
precision highp int;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3 uColors[8];
uniform int uColorCount;
uniform float uLightMode;
uniform float uShine;
uniform float uRelief;
uniform float uGlow;
uniform float uSway;
uniform float uSwayTime;
uniform float uHover;
uniform vec4 uWaves[4];
uniform float uIntro;
uniform float uGrainTime;
uniform vec3 uLightColor;
uniform float uPerspective;
uniform float uGradientShift;

out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

vec2 rotate2D(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec2 blindSpace(vec2 uv0) {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv0 * 2.0 - 1.0;
  p.x *= aspect;
  vec2 pr = rotate2D(p, uAngle);
  pr.x /= aspect;
  vec2 uv = pr * 0.5 + 0.5;
  if (abs(uPerspective) > 0.001) {
    float k = uPerspective * 2.2;
    uv.x = (exp(k * uv.x) - 1.0) / (exp(k) - 1.0);
  }
  if (uDistort > 0.0) {
    float a = uv.y * 6.0;
    float b = uv.x * 6.0;
    float w = 0.01 * uDistort;
    uv.x += sin(a) * w;
    uv.y += cos(b) * w;
  }
  return uv;
}

vec3 gradientColor(float t) {
  float tt = clamp(t, 0.0, 1.0);
  int count = max(uColorCount, 2);
  float scaled = tt * float(count - 1);
  int seg = min(int(floor(scaled)), count - 2);
  float f = scaled - float(seg);
  if (tt >= 1.0) return uColors[count - 1];
  return mix(uColors[seg], uColors[seg + 1], f);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv0 = frag / uResolution;
  vec2 uvMod = blindSpace(uv0);

  float count = max(uBlindCount, 1.0);
  float stripePhase = uvMod.x * count;
  float pixel = max(fwidth(stripePhase), 1e-5);

  float t = uvMod.x;
  if (uGradientShift != 0.0) {
    t = 1.0 - abs(1.0 - fract((t + uGradientShift) * 0.5) * 2.0);
  }
  if (uMirror > 0.5) {
    t = 1.0 - abs(1.0 - 2.0 * fract(t));
  }
  vec3 base = gradientColor(t);

  vec2 offset = uMouse / uResolution;
  float d = length(uv0 - offset);
  float r = max(uSpotlightRadius, 1e-4);
  float spot = (1.0 - 2.0 * pow(d / r, uSpotlightSoftness)) * uSpotlightOpacity;

  float slat = floor(stripePhase);
  float s = stripePhase - slat;
  float stripeAA = clamp(count * 1.25 / min(uResolution.x, uResolution.y), 0.001, 0.12);
  float edgeBlend = 1.0 - smoothstep(0.0, stripeAA, min(s, 1.0 - s));
  float across = mix(s, 0.5, edgeBlend);
  float ramp = uShineFlip > 0.5 ? 1.0 - across : across;

  float unit = min(uResolution.x, uResolution.y);
  float reach = max(uSpotlightRadius, 0.05) * unit;
  vec2 toLight = uMouse - frag;
  float nearLight = exp(-dot(toLight, toLight) / (reach * reach));

  float tilt = 0.0;
  float pulse = 0.0;
  if (uSway > 0.0) {
    tilt += uSway * 0.5 * sin(uSwayTime * 0.9 + slat * 0.55) * (0.6 + 0.4 * sin(uSwayTime * 0.37 + slat * 0.21));
  }
  tilt += uHover * nearLight * 0.7;
  float aspect = uResolution.x / uResolution.y;
  for (int i = 0; i < 4; i++) {
    vec4 wave = uWaves[i];
    if (wave.w <= 0.0) continue;
    float age = uTime - wave.z;
    if (age < 0.0 || age > ${K.toFixed(2)}) continue;
    float life = age / ${K.toFixed(2)};
    vec2 origin = blindSpace(wave.xy / uResolution);
    float slats = abs(slat + 0.5 - origin.x * count);
    float front = age * max(count, 4.0) * 0.95;
    float k = (slats - front) / (0.8 + life * 1.2);
    float along = (uvMod.y - origin.y) / max(0.42 + life * 0.5, 0.01);
    float fade = (1.0 - life) * (1.0 - life);
    float ring = exp(-k * k) * exp(-along * along) * fade * smoothstep(0.0, 0.2, age);
    tilt += ring * 0.9;
    pulse += ring;
  }
  if (uIntro < 1.0) {
    float settle = smoothstep(0.0, 1.0, clamp(uIntro * 1.5 - uv0.x * 0.5, 0.0, 1.0));
    tilt -= (1.0 - settle) * 1.2;
  }

  float edge = ramp;
  float calm = 1.0 - 0.6 * clamp(spot, 0.0, 1.0);
  ramp = pow(clamp(ramp, 0.0, 1.0), exp(tilt * 0.9));
  ramp *= 1.0 - 0.3 * min(pulse, 1.0) * calm;
  float crease = uRelief * 0.38 * smoothstep(0.62, 1.0, ramp);
  float sheen = uShine * exp(-pow((edge - 0.035) / 0.07, 2.0)) * (0.3 + 0.7 * nearLight) * (1.0 - edgeBlend);

  vec3 lit = spot > 0.0 ? uLightColor * spot : vec3(spot);
  lit += uLightColor * min(pulse, 1.0) * 0.35 * calm;
  vec3 revealSignal = lit + base - vec3(ramp + crease);

  vec3 col;
  if (uLightMode > 0.5) {
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);
    float peak = max(base.r, max(base.g, base.b));
    float low = min(base.r, min(base.g, base.b));
    float chroma = (peak - low) / max(peak, 0.0001);
    vec3 hue = base / max(peak, 0.0001);
    hue = clamp(mix(vec3(dot(hue, luma)), hue, 1.3), 0.0, 1.0);
    hue *= mix(1.0, 0.82, smoothstep(0.55, 0.9, dot(hue, luma)));
    vec3 tint = mix(base, hue, smoothstep(0.06, 0.28, chroma));
    vec3 revealed = clamp(revealSignal, 0.0, 1.0);
    float coverage = max(revealed.r, max(revealed.g, revealed.b));
    float stroke = 1.0 - smoothstep(pixel, pixel * 2.2, edge);
    col = mix(vec3(1.0), tint, 0.72 * smoothstep(0.0, 1.0, coverage));
    col = mix(col, tint * 0.85, stroke * clamp(coverage * 1.5, 0.0, 1.0) * 0.7);
    col = mix(col, vec3(1.0), clamp(sheen, 0.0, 1.0) * 0.5);
    float grain = max(0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5, 0.0);
    col = clamp(col - vec3(grain * uNoise * 0.12 * coverage), 0.0, 1.0);
  } else {
    vec3 haze = base * uGlow * 0.4 * smoothstep(0.0, 1.0, spot) * (0.4 + 0.6 * ramp);
    col = revealSignal + haze + mix(base, uLightColor, 0.45) * sheen * 0.7;
    vec3 over = max(col - 0.8, 0.0);
    col = min(col, vec3(0.8)) + 0.2 * (1.0 - exp(-over / 0.2));
    float luma = dot(clamp(col, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722));
    float grain = 0.5 * (hash(frag + uGrainTime) + hash(frag.yx + uGrainTime * 1.7)) - 0.5;
    col += grain * uNoise * (0.45 + 0.55 * smoothstep(0.0, 0.5, luma));
  }

  float presence = smoothstep(0.0, 0.65, uIntro);
  col = uLightMode > 0.5 ? mix(vec3(1.0), col, presence) : col * presence;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`,v=(i,s,f)=>Math.min(f,Math.max(s,i)),he=(i,s,f)=>{const r=i.createShader(s);return r?(i.shaderSource(r,f),i.compileShader(r),i.getShaderParameter(r,i.COMPILE_STATUS)?r:(i.deleteShader(r),null)):null},Be=i=>{const s=he(i,i.VERTEX_SHADER,We),f=he(i,i.FRAGMENT_SHADER,qe),r=i.createProgram();if(!s||!f||!r)return null;if(i.attachShader(r,s),i.attachShader(r,f),i.linkProgram(r),i.deleteShader(s),i.deleteShader(f),!i.getProgramParameter(r,i.LINK_STATUS))return i.deleteProgram(r),null;const m={},W=i.getProgramParameter(r,i.ACTIVE_UNIFORMS);for(let C=0;C<W;C++){const I=i.getActiveUniform(r,C);if(!I)continue;const k=I.name.replace(/\[0\]$/,"");m[k]=i.getUniformLocation(r,k)}return{program:r,uniforms:m}},pe=i=>{const s=String(i||"").replace("#","").padEnd(6,"0"),f=parseInt(s.slice(0,2),16)/255,r=parseInt(s.slice(2,4),16)/255,m=parseInt(s.slice(4,6),16)/255;return[f||0,r||0,m||0]},de=i=>{const s=(i&&i.length?i:["#FF9FFC","#5227FF"]).slice(0,F);for(s.length===1&&s.push(s[0]);s.length<F;)s.push(s[s.length-1]);const f=new Float32Array(F*3);for(let m=0;m<F;m++)f.set(pe(s[m]),m*3);const r=Math.max(2,Math.min(F,i?.length??2));return{flat:f,count:r}},Ue=({className:i="",style:s,dpr:f,paused:r=!1,gradientColors:m,angle:W=0,noise:C=.3,blindCount:I=16,blindMinWidth:k=60,mouseDampening:ve=.15,mirrorGradient:ge=!1,spotlightRadius:xe=.5,spotlightSoftness:ye=1,spotlightOpacity:we=1,distortAmount:Se=0,shineDirection:be="left",lightColor:Me="#ffffff",perspective:Re=0,gradientSpeed:Ce=0,shine:Ee=.4,relief:Ae=.5,glow:Le=.4,sway:Te=.35,speed:Pe=1,hoverTilt:Fe=.6,clickEffect:Ie="ripple",idle:ke="drift",intro:Ge=!0,mixBlendMode:U="lighten",lightMode:X=!1})=>{const $=M.useRef(null),Y=M.useRef(null),q=M.useRef(null),De=(m&&m.length?m:["#FF9FFC","#5227FF"]).join(","),J={paused:r,colorKey:De,gradientColors:m,angle:W,noise:v(C,0,2),blindCount:Math.max(1,I||1),blindMinWidth:k,mouseDampening:Math.max(0,ve),mirrorGradient:ge,spotlightRadius:xe,spotlightSoftness:ye,spotlightOpacity:we,distortAmount:Se,shineDirection:be,lightColor:Me,perspective:v(Re,-1,1),gradientSpeed:Ce,shine:v(Ee,0,2),relief:v(Ae,0,1),glow:v(Le,0,2),sway:v(Te,0,1),speed:v(Pe,0,4),hoverTilt:v(Fe,0,1.5),clickEffect:Ie,idle:ke,intro:Ge,lightMode:X,dpr:f},x=M.useRef(J);return x.current=J,M.useEffect(()=>{const w=$.current,g=Y.current,t=g?.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!1});if(!w||!g||!t)return;const G=Be(t);if(!G)return;const n=G.uniforms,Q=t.createVertexArray(),S=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,l={width:1,height:1,ratio:1},d={x:0,y:0,inside:!1},o={x:0,y:0,vx:0,vy:0,tx:0,ty:0,ready:!1},p=new Float32Array(j*4);let B=0,D=0,E=0,b=0,z=0,Z=0,A=x.current.intro&&!S?0:1,ee="",H=de(x.current.gradientColors),L=0,T=0,_=!0;const _e=e=>{if(e.blindMinWidth&&e.blindMinWidth>0){const a=Math.max(1,Math.floor(l.width/e.blindMinWidth));return Math.max(1,e.blindCount?Math.min(e.blindCount,a):a)}return Math.max(1,e.blindCount)},te=()=>{const e=V(x.current);ee!==e.colorKey&&(H=de(e.gradientColors),ee=e.colorKey),t.viewport(0,0,g.width,g.height),t.useProgram(G.program),t.bindVertexArray(Q),t.uniform2f(n.uResolution,g.width,g.height),t.uniform1f(n.uTime,E),t.uniform2f(n.uMouse,o.x*l.ratio,(l.height-o.y)*l.ratio),t.uniform1f(n.uAngle,e.angle*Math.PI/180),t.uniform1f(n.uNoise,e.noise),t.uniform1f(n.uBlindCount,_e(e)),t.uniform1f(n.uSpotlightRadius,e.spotlightRadius),t.uniform1f(n.uSpotlightSoftness,e.spotlightSoftness),t.uniform1f(n.uSpotlightOpacity,e.spotlightOpacity),t.uniform1f(n.uMirror,e.mirrorGradient?1:0),t.uniform1f(n.uDistort,e.distortAmount),t.uniform1f(n.uShineFlip,e.shineDirection==="right"?1:0),t.uniform3fv(n.uColors,H.flat),t.uniform1i(n.uColorCount,H.count),t.uniform1f(n.uLightMode,e.lightMode?1:0),t.uniform1f(n.uShine,e.shine),t.uniform1f(n.uRelief,e.relief),t.uniform1f(n.uGlow,e.glow),t.uniform1f(n.uSway,S?0:e.sway),t.uniform1f(n.uSwayTime,b),t.uniform1f(n.uHover,D*e.hoverTilt),t.uniform4fv(n.uWaves,p),t.uniform1f(n.uIntro,A),t.uniform1f(n.uGrainTime,Z),t.uniform3fv(n.uLightColor,pe(e.lightColor||"#ffffff")),t.uniform1f(n.uPerspective,e.perspective),t.uniform1f(n.uGradientShift,z),t.drawArrays(t.TRIANGLES,0,3),t.bindVertexArray(null)},Oe=e=>{d.inside?(o.tx=d.x,o.ty=d.y):e.idle==="center"?(o.tx=l.width/2,o.ty=l.height/2):e.idle==="drift"&&!S&&(o.tx=l.width*(.5+.22*Math.sin(b*.23)+.05*Math.sin(b*.61+1.3)),o.ty=l.height*(.5+.16*Math.sin(b*.31+.7)+.04*Math.sin(b*.83)))},Ne=(e,a)=>{const u=e.mouseDampening;if(u<=0){o.x=o.tx,o.y=o.ty,o.vx=0,o.vy=0;return}const h=2.4/u,P=h*h,c=2*h,O=Math.max(1,Math.ceil(a/.008)),N=a/O;for(let fe=0;fe<O;fe++)o.vx+=(P*(o.tx-o.x)-c*o.vx)*N,o.vy+=(P*(o.ty-o.y)-c*o.vy)*N,o.x+=o.vx*N,o.y+=o.vy*N},oe=()=>{const e=V(x.current);l.width=Math.max(1,w.clientWidth),l.height=Math.max(1,w.clientHeight),l.ratio=Math.min(e.dpr||window.devicePixelRatio||1,2),g.width=Math.max(1,Math.round(l.width*l.ratio)),g.height=Math.max(1,Math.round(l.height*l.ratio)),o.ready||(o.ready=!0,o.x=o.tx=l.width/2,o.y=o.ty=l.height/2),te(),y()},ie=e=>{if(L=0,!_||document.hidden)return;const a=V(x.current),u=T?v((e-T)/1e3,.001,1/20):1/60;if(T=e,a.paused)return;E+=u,S||(b+=u*a.speed,z=(z+u*a.gradientSpeed*.06)%2),Z=Math.floor(E*24)*17.13,A<1&&(A=Math.min(1,A+u/Ve)),D+=((d.inside?1:0)-D)*(1-Math.exp(-u/.35)),Oe(a),Ne(a,u);for(let c=0;c<j;c++)p[c*4+3]>0&&E-p[c*4+2]>K&&(p[c*4+3]=0);te(),(Math.abs(o.tx-o.x)>.05||Math.abs(o.ty-o.y)>.05||Math.abs(o.vx)+Math.abs(o.vy)>.05||Math.abs((d.inside?1:0)-D)>.002||A<1||p.some((c,O)=>O%4===3&&c>0)||!S&&(a.noise>0||a.gradientSpeed!==0||a.sway>0&&a.speed>0||a.idle==="drift"&&!d.inside))&&(L=requestAnimationFrame(ie))};function y(){!L&&_&&!document.hidden&&(T=0,L=requestAnimationFrame(ie))}const ne=e=>{const a=w.getBoundingClientRect(),u=e.clientX-a.left,h=e.clientY-a.top;return{x:u,y:h,inside:u>=0&&h>=0&&u<=a.width&&h<=a.height}},ae=e=>{const{x:a,y:u,inside:h}=ne(e);d.x=a,d.y=u,d.inside=h,h&&y()},re=e=>{const a=V(x.current),{x:u,y:h,inside:P}=ne(e);if(!P||S||a.clickEffect!=="ripple")return;const c=B*4;p[c]=u*l.ratio,p[c+1]=(l.height-h)*l.ratio,p[c+2]=E,p[c+3]=1,B=(B+1)%j,y()},se=()=>{d.inside=!1,y()},le=()=>{T=0,y()},ue=new ResizeObserver(oe);ue.observe(w);const ce=new IntersectionObserver(e=>{_=e.some(a=>a.isIntersecting),_&&y()});return ce.observe(w),R(window).addEventListener("pointermove",ae,{passive:!0}),R(window).addEventListener("pointerdown",re,{passive:!0}),R(document.documentElement).addEventListener("pointerleave",se),document.addEventListener("visibilitychange",le),oe(),q.current=y,()=>{cancelAnimationFrame(L),q.current=null,ue.disconnect(),ce.disconnect(),R(window).removeEventListener("pointermove",ae),R(window).removeEventListener("pointerdown",re),R(document.documentElement).removeEventListener("pointerleave",se),document.removeEventListener("visibilitychange",le),t.deleteVertexArray(Q),t.deleteProgram(G.program),t.getExtension("WEBGL_lose_context")?.loseContext()}},[]),M.useEffect(()=>{q.current?.()}),me.jsx("div",{ref:$,className:`gradient-blinds-container${i?` ${i}`:""}`,style:{...!X&&U?{mixBlendMode:U}:null,...s},children:me.jsx("canvas",{ref:Y,className:"gradient-blinds-canvas","aria-hidden":"true"})})};export{Ue as default};
