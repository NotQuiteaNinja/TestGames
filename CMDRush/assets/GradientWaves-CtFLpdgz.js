import{r as p,j as Be}from"./index-uEvbEw5g.js";import{b as L}from"./App-Dofw4Ib9.js";import{b as D}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const De="gradient-waves-container",Ne="gradient-waves-canvas",G=4,de=3.2,Ge=2.8,pe=8,Xe=2.6,we=30,ve={low:56,medium:84,high:120},Ye=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ue=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uClock;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uHeight;
uniform float uTilt;
uniform float uZoom;
uniform vec2 uLook;
uniform float uFogDepth;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform vec3 uHorizon;
uniform vec3 uWave;
uniform vec3 uCrest;
uniform vec3 uBackground;
uniform float uOpaque;
uniform float uLight;
uniform vec3 uSun;
uniform float uRelief;
uniform float uSheen;
uniform float uSteps;
uniform float uStride;
uniform vec3 uIntro;
uniform vec3 uSwells[${G}];
uniform float uSwellWidth;
out vec4 outColor;

const float FAR = 4000.0;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 surface(vec2 xy) {
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(uTime / 0.130, uTime / 0.810, uTime / 0.200, uTime / 0.710);
  float a = xy.x + tc.x;
  float swellPhase = (xy.y + a) / 20.0 + tc.y;
  float bend = uSwell * cos(swellPhase) / 20.0;
  float mx = a + uSwell * sin(swellPhase);
  float crossPhase = xy.x / 23.0 + tc.w;
  float my = xy.y - tc.z + uTurbulence * cos(crossPhase);
  float twist = -uTurbulence * sin(crossPhase) / 23.0;
  float cx = cos(mx * freq.x);
  float cy = cos(my * freq.y);
  float rise = 1.0;
  if (uIntro.z > 0.0) rise = mix(1.0, smoothstep(uIntro.y * 0.45, uIntro.y * 1.6, xy.x), uIntro.z);
  float amp = uAmplitude * rise;
  float h = (sin(mx * freq.x) + sin(my * freq.y)) * amp + uHeight;
  float dx = amp * (freq.x * cx * (1.0 + bend) + freq.y * cy * twist);
  float dy = amp * (freq.x * cx * bend + freq.y * cy);
  for (int k = 0; k < ${G}; k++) {
    vec3 sw = uSwells[k];
    if (sw.z <= 0.0) continue;
    float u = (xy.x - sw.x) / uSwellWidth;
    float v = (xy.y - sw.y) / (uSwellWidth * 3.5);
    float bump = sw.z * exp(-u * u - v * v);
    h += bump;
    dx += bump * (-2.0 * u / uSwellWidth);
    dy += bump * (-2.0 * v / (uSwellWidth * 3.5));
  }
  return vec3(h, dx, dy);
}

float march(vec3 origin, vec3 dir) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float gap = origin.z + dist * dir.z - surface(origin.xy + dist * dir.xy).x;
    if (abs(gap) < 0.002 * dist + 0.01) break;
    dist += uStride * gap;
    if (!(abs(dist) < FAR)) return FAR;
  }
  return dist;
}

void main() {
  float c;
  float s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, ${we.toFixed(1)});
  vec2 uv = gl_FragCoord.xy / uResolution - 0.5;
  uv.x *= uResolution.x / uResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot);
  s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  dir = mat3(nuv.x, -nuv.y, 0.0, nuv.y, nuv.x, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt + uLook.y);
  s = sin(uTilt + uLook.y);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
  c = cos(uLook.x);
  s = sin(uLook.x);
  dir = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * dir;

  float dist = march(cam, dir);
  vec3 pos = cam + dist * dir;
  vec3 field = surface(pos.xy);
  vec3 view = -dir;

  float crest = clamp((field.x - uHeight) / max(2.0 * uAmplitude, 0.001) * 0.5 + 0.5, 0.0, 1.0);
  vec3 body = mix(uWave, uCrest, smoothstep(0.45, 1.0, crest) * 0.5);
  vec3 normal = normalize(vec3(-field.yz * (1.0 + 1.5 * uRelief), 1.0));
  float diffuse = clamp(dot(normal, uSun) * 0.5 + 0.5, 0.0, 1.0);
  float lightness = mix(1.0, diffuse * diffuse * (3.0 - 2.0 * diffuse), uRelief);
  float sheen = pow(clamp(dot(normal, normalize(uSun + view)), 0.0, 1.0), 14.0) * uSheen * (0.4 + 0.6 * uRelief);
  float rim = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 3.0);

  vec3 col;
  float alpha;
  float haze = 1.0 - exp(-dist / (uFogDepth * 5.0));
  float fade = 1.0 - smoothstep(0.35, 1.0, haze);
  if (uLight < 0.5) {
    vec3 lit = mix(uHorizon * 0.18, body, lightness) + uCrest * sheen;
    lit = mix(lit, uHorizon, rim * 0.15 * uRelief);
    col = mix(lit, uHorizon, smoothstep(0.0, 1.0, haze)) * 0.85 * uBrightness;
    alpha = fade;
  } else {
    vec3 hue = mix(uHorizon, body, 0.35 + 0.65 * lightness);
    float density = mix(0.16, 0.9, 1.0 - lightness);
    density *= 1.0 - clamp(sheen, 0.0, 1.0) * 0.85;
    density *= 1.0 - 0.5 * smoothstep(0.0, 1.0, haze);
    col = hue;
    alpha = fade * clamp(density * uBrightness, 0.0, 1.0);
  }

  float reveal = uIntro.x;
  col = clamp(col, 0.0, 1.0);
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 64.0) - 0.5) * uGrain;
  alpha = clamp(alpha * (1.0 + grain), 0.0, 1.0) * reveal * uOpacity;
  if (uOpaque > 0.5) {
    outColor = vec4(mix(uBackground, col, alpha), 1.0);
  } else {
    outColor = vec4(col * alpha, alpha);
  }
}`,F=(r,f,l)=>Math.min(l,Math.max(f,r)),Ve=r=>r<.5?2*r*r:1-Math.pow(-2*r+2,2)/2;let T=null;const N=(r,f)=>{if(r==="transparent")return null;if(typeof document>"u"||(T||(T=document.createElement("canvas").getContext("2d")),!T))return f;T.fillStyle="#000000",T.fillStyle=r;const l=T.fillStyle;if(l.startsWith("#")){const m=parseInt(l.slice(1),16);return[(m>>16&255)/255,(m>>8&255)/255,(m&255)/255]}const a=/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(l);return a?a[4]!==void 0&&Number(a[4])===0?null:[Number(a[1])/255,Number(a[2])/255,Number(a[3])/255]:f},xe=(r,f,l)=>{const a=r.createShader(f);return a?(r.shaderSource(a,l),r.compileShader(a),r.getShaderParameter(a,r.COMPILE_STATUS)?a:(console.error(r.getShaderInfoLog(a)),r.deleteShader(a),null)):null},je=(r,f,l,a)=>{const m=(r[0]-.5)*f,x=r[1]-.5,X=Math.PI/2.3/Math.max(l.zoom,.05),g=Math.hypot(m,x),z=X*g;let s=[0,-Math.sin(z),-Math.cos(z)];const I=g>1e-5?m/g:1,C=g>1e-5?x/g:0;s=[I*s[0]+C*s[1],-C*s[0]+I*s[1],s[2]];const P=l.tilt+a[1],q=Math.cos(P),H=Math.sin(P);s=[q*s[0]-H*s[2],s[1],H*s[0]+q*s[2]];const O=Math.cos(a[0]),_=Math.sin(a[0]);return s=[O*s[0]-_*s[1],_*s[0]+O*s[1],s[2]],s},Ze=(r,f,l,a)=>{const m=je(r,f,l,a);if(m[2]>-.02)return null;const x=(we-l.height)/-m[2];return[m[0]*x,m[1]*x]},ge=()=>typeof window<"u"&&(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1);function et({horizonColor:r="#5227FF",waveColor:f="#FF9FFC",crestColor:l="#FFFFFF",backgroundColor:a="transparent",lightMode:m=!1,speed:x=.4,amplitude:X=2.5,waveScale:g=.6,waveRatio:z=.9,swell:s=35,turbulence:I=20,tilt:C=64,zoom:P=1,height:q=5.5,fogDepth:H=15,relief:O=1,lightAngle:_=120,sheen:ye=0,brightness:Se=1,opacity:Me=1,grain:Y=.2,quality:be="medium",intro:Ae=!0,mouseInteraction:Re=!0,parallaxStrength:Ee=.5,mouseStrength:ke=.6,swellOnClick:Le=!0,paused:Fe=!1,dpr:Te=2,className:We="",style:ze}){const te=p.useRef(null),Ie=p.useMemo(()=>N(r,[.32,.15,1])??[.32,.15,1],[r]),Ce=p.useMemo(()=>N(f,[1,.62,.99])??[1,.62,.99],[f]),Pe=p.useMemo(()=>N(l,[1,1,1])??[1,1,1],[l]),qe=p.useMemo(()=>N(a,null),[a]),oe={horizon:Ie,wave:Ce,crest:Pe,paper:qe,lightMode:m,speed:x,amplitude:Math.max(0,X),waveScale:Math.max(.01,g),waveRatio:Math.max(.01,z),swell:s,turbulence:I,tilt:F(C,10,85)*Math.PI/180,zoom:Math.max(.05,P),height:q,fogDepth:Math.max(.5,H),relief:F(O,0,1),lightAngle:_*Math.PI/180,sheen:Math.max(0,ye),brightness:Math.max(0,Se),opacity:F(Me,0,1),grain:typeof Y=="number"?Math.max(0,Y):Y?.05:0,steps:ve[be]??ve.medium,intro:Ae,mouseInteraction:Re,parallaxStrength:Math.max(0,Ee),mouseStrength:F(ke,0,1),swellOnClick:Le,paused:Fe,dpr:Math.max(.5,Te)},y=p.useRef(oe);y.current=oe;const U=p.useRef(null);return p.useEffect(()=>{U.current?.()}),p.useEffect(()=>{const w=te.current;if(!w)return;const d=document.createElement("canvas");d.className=Ne,w.appendChild(d);const t=d.getContext("webgl2",{alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:"high-performance"});if(!t){d.remove();return}const V=xe(t,t.VERTEX_SHADER,Ye),j=xe(t,t.FRAGMENT_SHADER,Ue),h=t.createProgram();if(!V||!j||!h){d.remove();return}if(t.attachShader(h,V),t.attachShader(h,j),t.bindAttribLocation(h,0,"aPosition"),t.linkProgram(h),t.deleteShader(V),t.deleteShader(j),!t.getProgramParameter(h,t.LINK_STATUS)){t.deleteProgram(h),d.remove();return}const He=["uResolution","uTime","uClock","uAmplitude","uWaveScale","uWaveRatio","uSwell","uTurbulence","uHeight","uTilt","uZoom","uLook","uFogDepth","uBrightness","uOpacity","uGrain","uHorizon","uWave","uCrest","uBackground","uOpaque","uLight","uSun","uRelief","uSheen","uSteps","uStride","uIntro","uSwells","uSwellWidth"],n={};He.forEach(i=>{n[i]=t.getUniformLocation(h,i)});const ne=t.createVertexArray();t.bindVertexArray(ne);const ie=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,ie),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0),t.useProgram(h);const Z=new Float32Array(G*3),e={width:1,height:1,cssWidth:0,cssHeight:0,time:0,clock:0,last:0,raf:0,visible:!1,introAt:-1,pointer:[.5,.5],inside:!1,look:[0,0],steer:[0,0],swells:[],quiet:0,seen:null},Oe=()=>{const i=D(y.current),o=Math.min(window.devicePixelRatio||1,i.dpr),u=Math.max(1,Math.round(e.cssWidth*o)),c=Math.max(1,Math.round(e.cssHeight*o));u===e.width&&c===e.height||(e.quiet=0,e.width=u,e.height=c,d.width=u,d.height=c)},re=()=>{e.cssWidth=w.clientWidth,e.cssHeight=w.clientHeight,e.quiet=0,v()},ae=(i,o)=>!i.intro||o||e.introAt<0?1:F((e.clock-e.introAt)/Xe,0,1),_e=i=>{const o=D(y.current);t.viewport(0,0,e.width,e.height),t.uniform2f(n.uResolution,e.width,e.height),t.uniform1f(n.uTime,e.time),t.uniform1f(n.uClock,e.clock),t.uniform1f(n.uAmplitude,o.amplitude),t.uniform1f(n.uWaveScale,o.waveScale),t.uniform1f(n.uWaveRatio,o.waveRatio),t.uniform1f(n.uSwell,o.swell),t.uniform1f(n.uTurbulence,o.turbulence),t.uniform1f(n.uHeight,o.height),t.uniform1f(n.uTilt,o.tilt),t.uniform1f(n.uZoom,o.zoom),t.uniform2f(n.uLook,e.look[0],e.look[1]),t.uniform1f(n.uFogDepth,o.fogDepth),t.uniform1f(n.uBrightness,o.brightness),t.uniform1f(n.uOpacity,o.opacity),t.uniform1f(n.uGrain,o.grain),t.uniform3fv(n.uHorizon,o.horizon),t.uniform3fv(n.uWave,o.wave),t.uniform3fv(n.uCrest,o.crest);const u=o.paper??[0,0,0];t.uniform3f(n.uBackground,u[0],u[1],u[2]),t.uniform1f(n.uOpaque,o.paper?1:0),t.uniform1f(n.uLight,o.lightMode?1:0);const c=.52,S=o.lightAngle+e.steer[0]*o.mouseStrength*2,M=c-e.steer[1]*o.mouseStrength*.7;t.uniform3f(n.uSun,Math.cos(M)*Math.cos(S),Math.cos(M)*Math.sin(S),Math.sin(M)),t.uniform1f(n.uRelief,o.relief),t.uniform1f(n.uSheen,o.sheen),t.uniform1f(n.uSteps,o.steps);const B=o.amplitude*(o.waveScale/7*(1+Math.abs(o.swell)/20)+o.waveScale*o.waveRatio/3*(1+Math.abs(o.turbulence)/23)),b=ae(o,i),A=Math.min(1,b/.22),K=160*Math.pow(3/160,Ve(Math.max(0,(b-.1)/.9))),R=F((b-.75)/.25,0,1);t.uniform3f(n.uIntro,A*A*(3-2*A),K,1-R*R*(3-2*R)),Z.fill(0);let E=0;e.swells.forEach((k,Q)=>{const W=e.clock-k.at,J=W/de,ee=(1-Math.exp(-W/.25))*Math.pow(1-J,1.6),he=o.amplitude*Ge*ee;Z.set([k.x-W*12,k.y,he],Q*3),E=Math.max(E,he)}),t.uniform3fv(n.uSwells,Z),t.uniform1f(n.uSwellWidth,pe),t.uniform1f(n.uStride,.9/Math.max(1,(B+E*.86/pe)/1.5)),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.drawArrays(t.TRIANGLES,0,3)},$=i=>{if(e.raf=0,!e.visible||document.hidden)return;const o=D(y.current),u=e.last?Math.min((i-e.last)/1e3,.1):0;e.last=i;const c=ge();e.clock+=u,e.introAt<0&&(e.introAt=e.clock),!o.paused&&!c&&(e.time+=u*o.speed);const S=o.mouseInteraction&&e.inside&&!c,M=S?e.pointer:[.5,.5],B=1-Math.exp(-u/.45),b=(M[0]-.5)*o.parallaxStrength*.35,A=(M[1]-.5)*o.parallaxStrength*.18;e.look[0]+=(b-e.look[0])*B,e.look[1]+=(A-e.look[1])*B;const K=Math.abs(b-e.look[0])+Math.abs(A-e.look[1])>2e-4,R=1-Math.exp(-u/.6),E=S?e.pointer[0]-.5:0,k=S?.5-e.pointer[1]:0;e.steer[0]+=(E-e.steer[0])*R,e.steer[1]+=(k-e.steer[1])*R;const Q=Math.abs(E-e.steer[0])+Math.abs(k-e.steer[1])>5e-4;e.swells=e.swells.filter(ee=>e.clock-ee.at<de);const W=o.paused||c,J=K||Q||e.swells.length>0||ae(o,c)<1;e.seen!==o||J||!W?e.quiet=0:e.quiet+=1,e.seen=o,!(e.quiet>3)&&(e.raf=requestAnimationFrame($),Oe(),_e(c))},v=()=>{e.raf||!e.visible||document.hidden||(e.last=0,e.raf=requestAnimationFrame($))};U.current=v;const se=i=>{const o=w.getBoundingClientRect();return{x:(i.clientX-o.left)/Math.max(o.width,1),y:(i.clientY-o.top)/Math.max(o.height,1),inside:i.clientX>=o.left&&i.clientX<=o.right&&i.clientY>=o.top&&i.clientY<=o.bottom}},ue=i=>{const o=se(i),u=e.inside;e.inside=o.inside,o.inside&&(e.pointer=[o.x,o.y]),(o.inside||u)&&y.current.mouseInteraction&&v()},le=()=>{e.inside=!1,v()},ce=i=>{const o=D(y.current);if(!o.swellOnClick||i.button!==0||ge()||i.target instanceof Element&&i.target.closest('a, button, input, textarea, select, label, [role="button"]'))return;const u=se(i);if(!u.inside)return;const c=Ze([u.x,u.y],e.width/Math.max(e.height,1),o,e.look);c&&(e.swells.push({x:c[0],y:c[1],at:e.clock}),e.swells.length>G&&e.swells.shift(),v())},fe=new IntersectionObserver(i=>{e.visible=i.some(o=>o.isIntersecting),v()});fe.observe(w);const me=new ResizeObserver(re);return me.observe(w),re(),document.addEventListener("visibilitychange",v),L(window).addEventListener("pointermove",ue,{passive:!0}),L(window).addEventListener("pointerdown",ce),L(document.documentElement).addEventListener("pointerleave",le),e.raf=requestAnimationFrame($),()=>{cancelAnimationFrame(e.raf),U.current=null,document.removeEventListener("visibilitychange",v),fe.disconnect(),me.disconnect(),L(window).removeEventListener("pointermove",ue),L(window).removeEventListener("pointerdown",ce),L(document.documentElement).removeEventListener("pointerleave",le),t.deleteProgram(h),t.deleteBuffer(ie),t.deleteVertexArray(ne),t.getExtension("WEBGL_lose_context")?.loseContext(),d.remove()}},[]),Be.jsx("div",{ref:te,className:[De,We].filter(Boolean).join(" "),style:ze})}export{et as default};
