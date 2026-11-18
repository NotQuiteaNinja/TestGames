import{r as A,j as Lt}from"./index-uEvbEw5g.js";import{b as w}from"./App-Dofw4Ib9.js";import{b as S}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Pt="molten-metal-container",Dt="molten-metal-canvas",D=6,v=16,E=8,Q=.06,ot=.9,rt=1.8,_t=2.4,Nt=.4,Ht={molten:.5,ember:.3,frost:.7},It=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Gt=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uClock;
uniform float uScale;
uniform float uDetail;
uniform float uGlow;
uniform float uThickness;
uniform float uSwirl;
uniform float uFold;
uniform float uBlackPoint;
uniform float uBrightness;
uniform float uBalance;
uniform float uGrain;
uniform float uOpacity;
uniform vec2 uOffset;
uniform vec2 uRotation;
uniform vec2 uDrift;
uniform vec3 uColors[${D}];
uniform int uColorCount;
uniform vec3 uBackground;
uniform float uOpaque;
uniform float uLight;
uniform vec3 uReveal;
uniform vec4 uTrail[${v}];
uniform float uTrailWeight[${v}];
uniform int uTrailCount;
uniform vec4 uFlares[${E}];
uniform int uFlareCount;
uniform vec4 uHeat;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 palette(float g) {
  if (uColorCount <= 1) return uColors[0];
  float t = g < uBalance ? 0.5 * g / uBalance : 0.5 + 0.5 * (g - uBalance) / (1.0 - uBalance);
  float scaled = t * float(uColorCount - 1);
  int index = int(min(floor(scaled), float(uColorCount - 2)));
  return mix(uColors[index], uColors[index + 1], smoothstep(0.0, 1.0, scaled - float(index)));
}

float warmth(float age, float weight, vec2 offset) {
  float life = clamp(age / ${ot.toFixed(2)}, 0.0, 1.0);
  vec2 spread = offset / (uHeat.z * (1.0 + 0.8 * life));
  return weight * (1.0 - life) * (1.0 - life) * exp(-dot(spread, spread));
}

float trailHeat(vec2 q) {
  float heat = 0.0;
  for (int k = 0; k < ${v}; k++) {
    if (k >= uTrailCount) break;
    vec4 a = uTrail[k];
    float weight = uTrailWeight[k];
    heat = max(heat, warmth(a.z, weight, q - a.xy));
    int next = min(k + 1, ${v-1});
    if (next == k || next >= uTrailCount) continue;
    vec4 b = uTrail[next];
    float older = uTrailWeight[next];
    vec2 ab = b.xy - a.xy;
    float span = dot(ab, ab);
    float t = span > 1e-10 ? clamp(dot(q - a.xy, ab) / span, 0.0, 1.0) : 0.0;
    float even = smoothstep(0.0, uHeat.z, sqrt(span));
    float age = mix(min(a.w, b.z), mix(a.w, b.z, t), even);
    float strength = mix(max(weight, older), mix(weight, older, t), even);
    heat = max(heat, warmth(age, strength, q - a.xy - ab * t));
  }
  return heat;
}

float flareHeat(vec2 q) {
  float heat = 0.0;
  for (int k = 0; k < ${E}; k++) {
    if (k >= uFlareCount) break;
    vec4 f = uFlares[k];
    float life = clamp(f.z / ${rt.toFixed(2)}, 0.0, 1.0);
    float rise = 1.0 - exp(-f.z / 0.07);
    float fall = exp(-3.0 * life) * (1.0 - life) * (1.0 - life);
    vec2 offset = (q - f.xy) / (uHeat.z * (0.9 + 1.6 * sqrt(life)));
    heat += rise * fall * exp(-dot(offset, offset));
  }
  return heat;
}

void main() {
  float time = uTime;
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec2 q = uv - uOffset;
  vec2 view = vec2(q.x * uRotation.x - q.y * uRotation.y, q.x * uRotation.y + q.y * uRotation.x);
  vec2 p = uScale * view - 0.5;
  p += uDrift;

  float heat = 0.0;
  float flare = 0.0;
  if (uHeat.w > 0.5) {
    heat = trailHeat(uv) * uHeat.x;
    flare = flareHeat(uv) * uHeat.y;
  }
  float power = uThickness * (1.0 + (heat + flare) * 0.45);

  vec2 i = p;
  float c = 0.0;
  float blurred = 0.0;
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);
  float d = length(p);
  float rot = d + time + p.x * uSwirl;
  float cosRot = cos(rot);
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;
  float layers = ceil(uDetail);

  for (float n = 0.0; n < 8.0; n++) {
    if (n >= layers) break;
    p *= warp;
    float t = r - time / (n + 3.0);
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);
    float l = length(vec2(sin(i.x + t), cos(i.y + t)));
    float footprint = 0.5 * length(vec2(dFdx(l), dFdy(l)));
    l = sqrt(l * l + footprint * footprint);
    float weight = clamp(uDetail - n, 0.0, 1.0);
    c += weight * uGlow / (power == 1.0 ? l : pow(max(l, 1e-6), power));
    if (uReveal.y > 0.5) blurred += weight * uGlow / sqrt(l * l + 0.0025);
  }

  c /= 6.0;
  c *= 1.0 + heat * 0.25 + flare * 0.6;

  float reveal = 1.0;
  float front = 0.0;
  if (uReveal.y > 0.5) {
    float level = log(max(blurred / 6.0, 1e-5)) - uReveal.x;
    reveal = smoothstep(-1.0, 1.0, level) * smoothstep(0.0, 0.08, uReveal.z);
    front = 0.2 * exp(-level * level * 1.5) * smoothstep(-2.6, -0.6, uReveal.x);
  }

  float g = clamp(max(c - uBlackPoint, 0.0) * uBrightness + front, 0.0, 1.0);
  vec3 col = palette(g);
  float noise = hash(gl_FragCoord.xy + fract(uClock) * 97.0) - 0.5;
  float a;
  if (uLight < 0.5) {
    a = g + noise * uGrain;
  } else {
    float lift = max(g - 0.03, 0.0) / 0.97;
    a = (1.0 - exp(-6.0 * lift)) / (1.0 - exp(-6.0)) + noise * uGrain * g;
  }
  a = clamp(a + noise / 255.0, 0.0, 1.0) * reveal * uOpacity;

  if (uOpaque > 0.5) {
    outColor = vec4(mix(uBackground, col, a), 1.0);
  } else {
    outColor = vec4(col * a, a);
  }
}`,R=(f,h,c)=>Math.min(c,Math.max(h,f));let b=null;const Z=(f,h)=>{if(f==="transparent")return null;if(typeof document>"u"||(b||(b=document.createElement("canvas").getContext("2d")),!b))return h;b.fillStyle="#000000",b.fillStyle=f;const c=b.fillStyle;if(c.startsWith("#")){const k=parseInt(c.slice(1),16);return[(k>>16&255)/255,(k>>8&255)/255,(k&255)/255]}const l=/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(c);return l?l[4]!==void 0&&Number(l[4])===0?null:[Number(l[1])/255,Number(l[2])/255,Number(l[3])/255]:h},tt=(f,h,c)=>{const l=f.createShader(h);return l?(f.shaderSource(l,c),f.compileShader(l),f.getShaderParameter(l,f.COMPILE_STATUS)?l:(f.deleteShader(l),null)):null},et=()=>typeof window<"u"&&(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1);function Xt({colors:f=["#5227FF","#FF9FFC"],coreColor:h="#FFFFFF",backgroundColor:c="transparent",lightMode:l=!1,speed:k=.35,scale:at=4,detail:it=3,glow:nt=1.6,thickness:lt=1,swirl:st=1,turbulence:ut=.2,haze:ft=.75,brightness:ct=1.3,colorMode:mt="molten",rotation:ht=0,offsetX:dt=0,offsetY:pt=0,drift:gt=.3,grain:T=.05,opacity:vt=1,intro:xt=!0,mouseInteraction:wt=!0,mouseStrength:Rt=.5,flareOnClick:bt=!0,paused:kt=!1,dpr:Ct=2,className:yt="",style:Ft}){const _=A.useRef(null),N=[...f.slice(0,D-1),h].join("|"),At=A.useMemo(()=>N.split("|").map(d=>Z(d,[1,1,1])??[1,1,1]),[N]),St=A.useMemo(()=>Z(c,null),[c]),H={palette:At,paper:St,lightMode:l,speed:k,scale:Math.max(.1,at),detail:R(it,1,8),glow:Math.max(0,nt),thickness:R(lt,.2,3),swirl:st,fold:-ut,blackPoint:.2*(1-R(ft,0,1)),brightness:Math.max(0,ct),balance:Ht[mt]??.5,rotation:ht*Math.PI/180,offset:[dt,pt],drift:Math.max(0,gt),grain:typeof T=="number"?Math.max(0,T):T?.05:0,opacity:R(vt,0,1),intro:xt,mouseInteraction:wt,mouseStrength:R(Rt,0,1),flareOnClick:bt,paused:kt,dpr:Math.max(.5,Ct)},C=A.useRef(H);return C.current=H,A.useEffect(()=>{const d=_.current;if(!d)return;const p=document.createElement("canvas");p.className=Dt,d.appendChild(p);const e=p.getContext("webgl2",{alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:"high-performance"});if(!e){p.remove();return}const M=tt(e,e.VERTEX_SHADER,It),B=tt(e,e.FRAGMENT_SHADER,Gt),m=e.createProgram();if(!M||!B||!m){p.remove();return}if(e.attachShader(m,M),e.attachShader(m,B),e.bindAttribLocation(m,0,"aPosition"),e.linkProgram(m),e.deleteShader(M),e.deleteShader(B),!e.getProgramParameter(m,e.LINK_STATUS)){e.deleteProgram(m),p.remove();return}const Et=["uResolution","uTime","uClock","uScale","uDetail","uGlow","uThickness","uSwirl","uFold","uBlackPoint","uBrightness","uBalance","uGrain","uOpacity","uOffset","uRotation","uDrift","uColors","uColorCount","uBackground","uOpaque","uLight","uReveal","uTrail","uTrailWeight","uTrailCount","uFlares","uFlareCount","uHeat"],a={};Et.forEach(r=>{a[r]=e.getUniformLocation(m,r)});const I=e.createVertexArray();e.bindVertexArray(I);const G=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,G),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.useProgram(m);const O=new Float32Array(D*3),q=new Float32Array(v*4),L=new Float32Array(v),P=new Float32Array(E*4),t={width:1,height:1,time:Nt,clock:0,last:0,raf:0,visible:!1,introAt:-1,pointer:[.5,.5],inside:!1,presence:0,drift:[0,0],trail:[],flares:[],quiet:0,seen:null},z=()=>{const r=S(C.current),o=Math.min(window.devicePixelRatio||1,r.dpr),n=Math.max(1,Math.round(d.clientWidth*o)),i=Math.max(1,Math.round(d.clientHeight*o));n===t.width&&i===t.height||(t.quiet=0,t.width=n,t.height=i,p.width=n,p.height=i)},W=r=>[(r[0]-.5)*(t.width/Math.max(t.height,1)),.5-r[1]],$=(r,o)=>!r.intro||o||t.introAt<0?1:R((t.clock-t.introAt)/_t,0,1),Tt=r=>{const o=S(C.current),n=$(o,r),i=t.width/Math.max(t.height,1);e.viewport(0,0,t.width,t.height),e.uniform2f(a.uResolution,t.width,t.height),e.uniform1f(a.uTime,t.time),e.uniform1f(a.uClock,t.clock),e.uniform1f(a.uScale,o.scale),e.uniform1f(a.uDetail,o.detail),e.uniform1f(a.uGlow,o.glow*.1),e.uniform1f(a.uThickness,o.thickness),e.uniform1f(a.uSwirl,o.swirl),e.uniform1f(a.uFold,o.fold),e.uniform1f(a.uBlackPoint,o.blackPoint),e.uniform1f(a.uBrightness,o.brightness),e.uniform1f(a.uBalance,o.balance),e.uniform1f(a.uGrain,o.grain),e.uniform1f(a.uOpacity,o.opacity),e.uniform2f(a.uOffset,o.offset[0]*i,-o.offset[1]),e.uniform2f(a.uRotation,Math.cos(o.rotation),Math.sin(o.rotation)),e.uniform2f(a.uDrift,t.drift[0],t.drift[1]),O.fill(0),o.palette.forEach((u,g)=>O.set(u,g*3)),e.uniform3fv(a.uColors,O),e.uniform1i(a.uColorCount,o.palette.length);const s=o.paper??[0,0,0];e.uniform3f(a.uBackground,s[0],s[1],s[2]),e.uniform1f(a.uOpaque,o.paper?1:0),e.uniform1f(a.uLight,o.lightMode?1:0),e.uniform3f(a.uReveal,Math.log(1.6)+Math.log(.01/1.6)*n,n<1?1:0,n),q.fill(0),L.fill(0),t.trail.forEach((u,g)=>{const[y,F]=W(u.at);q.set([y,F,t.clock-u.time,t.clock-u.arrive],g*4),L[g]=u.weight}),e.uniform4fv(a.uTrail,q),e.uniform1fv(a.uTrailWeight,L),e.uniform1i(a.uTrailCount,t.trail.length),P.fill(0),t.flares.forEach((u,g)=>{const[y,F]=W(u.at);P.set([y,F,t.clock-u.time,1],g*4)}),e.uniform4fv(a.uFlares,P),e.uniform1i(a.uFlareCount,t.flares.length);const x=t.trail.length>0||t.flares.length>0;e.uniform4f(a.uHeat,o.mouseStrength*2,3.2,.2,x?1:0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)},Mt=(r,o)=>{const n=r.mouseInteraction&&t.inside&&r.mouseStrength>0;t.presence+=((n?1:0)-t.presence)*(1-Math.exp(-o/.25)),t.trail=t.trail.filter(s=>s.live||t.clock-s.time<ot);const i=t.trail[0];if(!n)return i?.live&&(i.live=!1),t.trail.length>0;if(!i?.live)t.trail.unshift({at:[...t.pointer],time:t.clock,arrive:t.clock,weight:t.presence,live:!0});else{if(i.at[0]!==t.pointer[0]||i.at[1]!==t.pointer[1]){const s=t.trail[1],x=s?Math.hypot(s.at[0]-i.at[0],s.at[1]-i.at[1]):1/0,u=t.clock-i.arrive>Q;x>.004&&(!s||u||t.clock-s.time>=Q)&&t.trail.splice(1,0,{...i,at:[...i.at],time:t.clock,live:!1}),i.at=[...t.pointer],i.arrive=t.clock}i.time=t.clock,i.weight=t.presence}return t.trail.length>v&&(t.trail.length=v),t.trail.length>0},V=r=>{if(t.raf=requestAnimationFrame(V),!t.visible||document.hidden){t.last=r;return}const o=S(C.current),n=t.last?Math.min((r-t.last)/1e3,.1):0;t.last=r;const i=et();t.clock+=n,t.introAt<0&&(t.introAt=t.clock),!o.paused&&!i&&(t.time+=n*o.speed);const s=o.mouseInteraction&&t.inside&&!i,x=s?(t.pointer[0]-.5)*o.drift*2:0,u=s?(.5-t.pointer[1])*o.drift*2:0,g=1-Math.exp(-n/.33);t.drift[0]+=(x-t.drift[0])*g,t.drift[1]+=(u-t.drift[1])*g;const y=Math.abs(x-t.drift[0])+Math.abs(u-t.drift[1])>5e-4,F=Mt(o,n);t.flares=t.flares.filter(qt=>t.clock-qt.time<rt);const Bt=o.paused||i,Ot=F||y||t.flares.length>0||$(o,i)<1;t.seen!==o||Ot||!Bt?t.quiet=0:t.quiet+=1,t.seen=o,!(t.quiet>3)&&(z(),Tt(i))},X=r=>{const o=d.getBoundingClientRect();return{x:(r.clientX-o.left)/Math.max(o.width,1),y:(r.clientY-o.top)/Math.max(o.height,1),inside:r.clientX>=o.left&&r.clientX<=o.right&&r.clientY>=o.top&&r.clientY<=o.bottom}},U=r=>{const o=X(r);t.inside=o.inside,o.inside&&(t.pointer=[o.x,o.y])},Y=()=>{t.inside=!1},j=r=>{if(!S(C.current).flareOnClick||r.button!==0||et()||r.target instanceof Element&&r.target.closest('a, button, input, textarea, select, label, [role="button"]'))return;const n=X(r);n.inside&&(t.flares.push({at:[n.x,n.y],time:t.clock}),t.flares.length>E&&t.flares.shift())},K=new IntersectionObserver(r=>{t.visible=r.some(o=>o.isIntersecting)});K.observe(d);const J=new ResizeObserver(()=>{t.quiet=0});return J.observe(d),z(),w(window).addEventListener("pointermove",U,{passive:!0}),w(window).addEventListener("pointerdown",j),w(document.documentElement).addEventListener("pointerleave",Y),t.raf=requestAnimationFrame(V),()=>{cancelAnimationFrame(t.raf),K.disconnect(),J.disconnect(),w(window).removeEventListener("pointermove",U),w(window).removeEventListener("pointerdown",j),w(document.documentElement).removeEventListener("pointerleave",Y),e.deleteProgram(m),e.deleteBuffer(G),e.deleteVertexArray(I),e.getExtension("WEBGL_lose_context")?.loseContext(),p.remove()}},[]),Lt.jsx("div",{ref:_,className:[Pt,yt].filter(Boolean).join(" "),style:Ft})}export{Xt as default};
