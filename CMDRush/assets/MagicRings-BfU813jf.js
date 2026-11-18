import{r as G,j as Et}from"./index-uEvbEw5g.js";import{b as L}from"./App-Dofw4Ib9.js";import{b as Q}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Ft=12,At=3,xe=Ft+At,Z=128,jt=`
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,qt=`
layout(location = 0) in vec2 aSegment;
uniform mat3 uForward;
uniform vec2 uResolution;
uniform float uUnit;
uniform vec2 uCenter;
uniform vec4 uShape[SLOTS];
uniform vec4 uFrame[SLOTS];
uniform float uReach;
uniform float uSplit;
flat out int vSlot;
out vec2 vPlane;
void main() {
  vec4 shape = uShape[gl_InstanceID];
  vec2 origin = uCenter + uFrame[gl_InstanceID].xy;
  float angle = aSegment.x * 6.2831853;
  vec2 direction = vec2(cos(angle), sin(angle));
  vec3 inner = uForward * vec3(origin + direction * shape.x, 1.0);
  vec3 outer = uForward * vec3(origin + direction * (shape.x + 0.01), 1.0);
  float pixels = length(outer.xy / outer.z - inner.xy / inner.z) * 100.0 * uUnit;
  float band = uReach / max(pixels, 1e-3) + uSplit * shape.x;
  vec2 plane = origin + direction * max(shape.x + aSegment.y * band, 0.0);
  vec3 screen = uForward * vec3(plane, 1.0);
  gl_Position = vec4(screen.xy * (2.0 * uUnit / uResolution), 0.0, screen.z);
  vPlane = plane;
  vSlot = gl_InstanceID;
}`,Yt=`
uniform vec2 uResolution;
uniform vec2 uScale;
uniform float uUnit;
uniform mat3 uInverse;
uniform vec2 uCenter;
uniform int uCount;
uniform vec4 uShape[SLOTS];
uniform vec4 uFrame[SLOTS];
uniform vec4 uTint[SLOTS];
uniform vec4 uHover;
uniform vec2 uBounds;
uniform float uSplit;
uniform float uOpacity;

out vec4 fragColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float angleOf(vec2 v) {
  vec2 a = abs(v);
  float t = min(a.x, a.y) / max(max(a.x, a.y), 1e-6);
  float r = t * (0.5 + 0.1738 * (1.0 - t));
  return a.y > a.x ? 1.0 - r : r;
}

float nearness(vec2 plane) {
  vec2 offset = plane - uHover.xy;
  return uHover.z * exp(-dot(offset, offset) * uHover.w);
}

vec3 prismOf(vec3 tint) {
  return mix(tint, vec3(dot(tint, vec3(0.3333))), 0.65) * 0.85;
}

vec4 toneMap(vec3 light) {
  float peak = max(max(light.r, light.g), light.b);
  if (peak <= 0.0) return vec4(0.0);
  float level = 1.0 - exp(-peak);
  vec3 color = mix(light * (level / peak), vec3(level), smoothstep(1.4, 3.6, peak) * 0.4);
  return vec4(color, level);
}
`,$t=`
uniform vec4 uHalo;
uniform vec3 uRange;

float haloOf(float d) {
  float fall = exp(-d * uHalo.y);
  float tight = fall * fall;
  tight *= tight;
  float window = clamp(1.0 - (d - uRange.x) * uRange.y, 0.0, 1.0);
  return (uHalo.z * tight + uHalo.w * fall) * window * window;
}

void main() {
  vec3 projected = uInverse * vec3((gl_FragCoord.xy * uScale - 0.5 * uResolution) / uUnit, 1.0);
  vec2 plane = projected.xy / projected.z;
  vec2 base = plane - uCenter;
  float reach = length(base);
  if (projected.z <= 0.0 || reach < uBounds.x || reach > uBounds.y) {
    fragColor = vec4(0.0);
    return;
  }
  float boost = 1.0 + 1.6 * nearness(plane);
  float limit = uRange.z + uSplit;
  vec3 light = vec3(0.0);
  float alpha = 0.0;

  for (int i = 0; i < SLOTS; i++) {
    if (i >= uCount) break;
    vec4 shape = uShape[i];
    vec4 frame = uFrame[i];
    vec2 w = base - frame.xy;
    float len = length(w);
    float d = abs(len - shape.x);
    if (d > limit) continue;
    float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));
    if (a > shape.w) continue;
    float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * boost;
    vec3 tint = uTint[i].rgb;
#ifdef PRISM
    float offset = uSplit * shape.x;
    vec3 halo = vec3(haloOf(abs(len - shape.x - offset)), haloOf(d), haloOf(abs(len - shape.x + offset)));
#else
    vec3 halo = vec3(haloOf(d));
#endif
#ifdef LIGHT
    float layer = clamp(energy * dot(halo, vec3(0.3333)), 0.0, 1.0);
    light = tint * layer + light * (1.0 - layer);
    alpha = layer + alpha * (1.0 - layer);
#else
#ifdef PRISM
    tint = prismOf(tint);
#endif
    light += tint * energy * halo;
#endif
  }
#ifdef LIGHT
  fragColor = vec4(light, alpha);
#elif defined(PACKED)
  fragColor = vec4(1.0 - exp(-light), 1.0);
#else
  fragColor = vec4(light, 1.0);
#endif
}`,Kt=`
uniform sampler2D uGlow;
uniform float uGrain;
uniform float uTime;

void main() {
  vec4 glow = texture(uGlow, gl_FragCoord.xy / uResolution);
  float grain = 1.0;
  if (uGrain > 0.0) grain += uGrain * (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 413.0) - 0.5) * 1.8;
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
#ifdef LIGHT
  float alpha = clamp(glow.a * grain, 0.0, 1.0);
  if (alpha <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }
  vec3 ink = glow.rgb * grain;
  alpha = clamp(alpha + dither, 0.0, 1.0);
  fragColor = vec4(min(ink, vec3(alpha)), alpha) * uOpacity;
#else
#ifdef PACKED
  vec3 light = -log(1.0 - min(glow.rgb, vec3(0.9995))) * grain;
#else
  vec3 light = glow.rgb * grain;
#endif
  vec4 color = toneMap(light);
  if (color.a <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }
  float alpha = clamp(color.a + dither, 0.0, 1.0);
  fragColor = vec4(min(color.rgb, vec3(alpha)), alpha) * uOpacity;
#endif
}`,Jt=`
flat in int vSlot;
in vec2 vPlane;
uniform float uWidth;

float coverage(float pixels, float halfWidth) {
  return clamp(max(halfWidth, 0.5) - pixels + 0.5, 0.0, 1.0) * min(halfWidth * 2.0, 1.0);
}

void main() {
  vec4 shape = uShape[vSlot];
  vec4 frame = uFrame[vSlot];
  vec4 tint = uTint[vSlot];
  vec2 w = vPlane - uCenter - frame.xy;
  float len = length(w);
  float stretch = 1.0 / max(length(vec2(dFdx(len), dFdy(len))), 1e-6);
  float a = angleOf(vec2(dot(w, frame.zw), frame.z * w.y - frame.w * w.x));
  float near = nearness(vPlane);
  float energy = shape.y * max(exp(-shape.z * a * a * a) - 0.002, 0.0) * (1.0 + 1.6 * near) * step(a, shape.w);
  float halfWidth = uWidth * (1.0 + 0.45 * near) * max(1.0 - a, 0.5) * tint.w;
  float pixels = abs(len - shape.x) * stretch;
#ifdef PRISM
  float offset = uSplit * shape.x;
  vec3 core = vec3(
    coverage(abs(len - shape.x - offset) * stretch, halfWidth),
    coverage(pixels, halfWidth),
    coverage(abs(len - shape.x + offset) * stretch, halfWidth)
  );
#else
  vec3 core = vec3(coverage(pixels, halfWidth));
#endif
#ifdef LIGHT
  float hot = core.g * clamp(1.0 - pixels / max(halfWidth * 0.35, 0.3), 0.0, 1.0);
  float layer = energy * max(max(core.r, core.g), core.b);
  if (layer <= 0.0) discard;
#ifdef PRISM
  vec3 color = clamp(1.0 - (1.0 - tint.rgb) * core * 1.4, 0.0, 1.0);
#else
  vec3 color = tint.rgb;
#endif
  color = mix(color, vec3(1.0), hot * 0.7);
  fragColor = vec4(color * layer, layer) * uOpacity;
#else
#ifdef PRISM
  vec4 color = toneMap(prismOf(tint.rgb) * energy * core * 1.7);
#else
  vec4 color = toneMap(tint.rgb * energy * core * 1.7);
#endif
  if (color.a <= 0.0) discard;
  fragColor = color * uOpacity;
#endif
}`,St=(n,s)=>["#version 300 es","precision highp float;",`#define SLOTS ${xe}`,...s.map(i=>`#define ${i}`),n].join(`
`),Qt={glow:$t,compose:Kt,line:Jt},Zt=["glow","compose","line"],en=["pulse","ripple","breathe"],z=3.45,Rt=.5,Mt=2.6,ge=1.1,yt=.9,A=(n,s,i)=>Math.min(i,Math.max(s,n)),j=(n,s,i)=>{const r=A((i-n)/(s-n),0,1);return r*r*(3-2*r)},tn=n=>Math.min(j(0,.7,n),1-j(.5,3.25,n)),bt=n=>n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4),Pe=n=>{const s=String(n||"").trim(),i=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);if(i){const l=i[1].length===3?i[1].replace(/./g,f=>f+f):i[1];return[0,2,4].map(f=>parseInt(l.slice(f,f+2),16)/255)}const r=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(s);if(r)return[r[1],r[2],r[3]].map(l=>A(parseFloat(l)/255,0,1));if(typeof document<"u"){const l=document.createElement("canvas").getContext("2d");if(l){l.fillStyle="#000000",l.fillStyle=s;const f=String(l.fillStyle);if(f!=="#000000"||/^(#0{3}|#0{6}|black)$/i.test(s))return Pe(f)}}return[.66,.33,.97]},Tt=(n,s,i)=>{const r=n.createShader(s);return r?(n.shaderSource(r,i),n.compileShader(r),r):null},nn=(n,s,i)=>{const r=Tt(n,n.VERTEX_SHADER,s),l=Tt(n,n.FRAGMENT_SHADER,i),f=r&&l?n.createProgram():null;return!r||!l||!f?(r&&n.deleteShader(r),l&&n.deleteShader(l),null):(n.attachShader(f,r),n.attachShader(f,l),n.linkProgram(f),{program:f,vertex:r,fragment:l})},on=(n,s)=>{const{program:i,vertex:r,fragment:l}=s,f=n.getProgramParameter(i,n.LINK_STATUS);if(!f&&!n.isContextLost()){const x=[r,l].filter(E=>!n.getShaderParameter(E,n.COMPILE_STATUS));x.length?x.forEach(E=>console.error(n.getShaderInfoLog(E))):console.error(n.getProgramInfoLog(i))}if(n.deleteShader(r),n.deleteShader(l),!f)return n.deleteProgram(i),null;const T={},F=n.getProgramParameter(i,n.ACTIVE_UNIFORMS);for(let x=0;x<F;x++){const E=n.getActiveUniform(i,x);E&&(T[E.name.replace(/\[0\]$/,"")]=n.getUniformLocation(i,E.name))}return{program:i,uniforms:T}},rn=n=>{const[s,i,r,l,f,T,F,x,E]=n,ee=f*E-T*x,te=T*F-l*E,ne=l*x-f*F,we=s*ee+i*te+r*ne;return[ee,r*x-i*E,i*T-r*f,te,s*E-r*F,r*l-s*T,ne,i*F-s*x,s*f-i*l].map(Ee=>Ee/we)},an=(n,s)=>{const i=n*Math.PI/180,r=s*Math.PI/180,l=Math.cos(i),f=Math.sin(i),T=Math.cos(r),F=Math.sin(r),x=[T,F*f,0,0,l,0,F*l/Mt,-f/Mt,1];return{forward:x,inverse:rn(x)}},sn=(n,s,i)=>{const r=n[6]*s+n[7]*i+n[8];return[(n[0]*s+n[1]*i+n[2])/r,(n[3]*s+n[4]*i+n[5])/r,r]},hn=({color:n="#A855F7",colorTwo:s="#6366F1",ringCount:i=6,motion:r="pulse",speed:l=1,lineThickness:f=2,glow:T=1,baseRadius:F=.35,radiusStep:x=.1,expansion:E=.1,taper:ee=1.5,rotation:te=0,spin:ne=0,tilt:we=0,dispersion:Ee=0,grain:Lt=0,opacity:_t=1,followMouse:It=!1,mouseInfluence:Ct=.2,hoverScale:Pt=1.2,hoverIntensity:Ot=1,parallax:Ut=.05,clickBurst:Bt=!0,intro:Dt=!0,theme:Gt="dark",maxDevicePixelRatio:Nt=2,className:Oe="",style:kt})=>{const Ue=G.useRef(null),Be=G.useRef(null),Se=G.useRef(null),oe=G.useRef(0),[De,Ht]=G.useState(0),Re=Gt==="light",Ge=Pe(n),Ne=Pe(s),ke={color:Re?Ge:Ge.map(bt),colorTwo:Re?Ne:Ne.map(bt),ringCount:A(Math.round(i),1,Ft),motion:en.includes(r)?r:"pulse",speed:Math.max(0,l),lineThickness:Math.max(.25,f),glow:A(T,0,3),baseRadius:Math.max(.01,F),radiusStep:Math.max(0,x),expansion:E,taper:Math.max(.5,ee),rotation:te*Math.PI/180,spin:ne,tilt:A(we,-80,80),dispersion:A(Ee,0,1),grain:A(Lt,0,1),opacity:A(_t,0,1),followMouse:It,mouseInfluence:Ct,hoverScale:Math.max(.5,Pt),hoverIntensity:Math.max(0,Ot),parallax:Ut,clickBurst:Bt,intro:Dt,light:Re,maxRatio:A(Nt,.5,3)},C=G.useRef(ke);return C.current=ke,G.useEffect(()=>{Se.current?.()}),G.useEffect(()=>{const q=Ue.current,m=Be.current;if(!q||!m)return;cancelAnimationFrame(oe.current),oe.current=0;const e=m.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"default"});if(!e)return;const re=e.getExtension("KHR_parallel_shader_compile"),Y=new Map,He=t=>!re||t.jobs.every(o=>!o||e.getProgramParameter(o.program,re.COMPLETION_STATUS_KHR)),ze=t=>{t.programs=t.jobs.map(o=>o&&on(e,o)),t.jobs=[],t.pending=!1},Xe=t=>{const o=t.join(",");let a=Y.get(o);return a||(a={jobs:Zt.map(u=>nn(e,St(u==="line"?qt:jt,t),St(`${Yt}${Qt[u]}`,t))),programs:[],pending:!0},Y.set(o,a),re||ze(a)),a};if(!re&&Xe([]).programs.includes(null))return;const $=window.matchMedia("(prefers-reduced-motion: reduce)").matches,Ve=e.createVertexArray(),Me=e.createVertexArray(),We=e.createBuffer(),je=new Float32Array((Z+1)*4);for(let t=0;t<=Z;t++)je.set([t/Z,-1,t/Z,1],t*4);e.bindVertexArray(Me),e.bindBuffer(e.ARRAY_BUFFER,We),e.bufferData(e.ARRAY_BUFFER,je,e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindVertexArray(null);const ae=e.createTexture(),ye=e.createFramebuffer(),N={width:0,height:0};let be=!!e.getExtension("EXT_color_buffer_float");const qe=new Float32Array(xe*4),Ye=new Float32Array(xe*4),$e=new Float32Array(xe*4),k={width:1,height:1,ratio:1,unit:1},p={x:0,y:0,inside:!1,touch:!1},d={x:0,y:0,vx:0,vy:0,hover:0,hoverVelocity:0},_=[];let P=C.current.intro&&C.current.speed>0&&!$&&De===0,O=P?0:1.6,X=0,U=0,V=0,ie=!0,se=document.visibilityState!=="hidden",ce=!1,le=null,Ke=Q(C.current);const Te=t=>{const o=Q(C.current),a=[];o.light&&a.push("LIGHT"),o.dispersion>0&&a.push("PRISM"),be||a.push("PACKED");const c=Xe(a);return t&&c.pending&&He(c)&&ze(c),c.pending||(le=c,Ke=o),c.pending},Je=()=>{const t=Q(C.current),o=q.getBoundingClientRect(),a=Math.min(window.devicePixelRatio||1,t.maxRatio),c=Math.max(1,Math.round(o.width*a)),u=Math.max(1,Math.round(o.height*a));(m.width!==c||m.height!==u)&&(m.width=c,m.height=u),Object.assign(k,{width:c,height:u,ratio:a,unit:Math.max(1,Math.min(c,u))});const M=Math.max(1,Math.ceil(c/2)),S=Math.max(1,Math.ceil(u/2));if(N.width===M&&N.height===S)return;Object.assign(N,{width:M,height:S});const y=b=>{e.bindTexture(e.TEXTURE_2D,ae),e.texImage2D(e.TEXTURE_2D,0,b?e.RGBA16F:e.RGBA8,M,S,0,e.RGBA,b?e.HALF_FLOAT:e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,ye),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,ae,0);const w=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindFramebuffer(e.FRAMEBUFFER,null),w};y(be)||(be=!1,y(!1))},zt=(t,o,a)=>{const c=a>1?o/(a-1):0;if(t.motion==="ripple"){const y=a*t.radiusStep+t.expansion,b=z*Math.max(1,a)*.32,w=O/b+o/a,R=w-Math.floor(w),g=O-R*b>=-1e-4||!P?j(0,.12,R)*(1-j(.62,1,R)):0,H=R*Math.max(1,a-1);return{radius:t.baseRadius+R*y,life:g,virtual:H,mix:R,opening:1}}if(t.motion==="breathe"){const y=Math.sin(O/4*Math.PI*2-o*.55),b=P?j(o*.12,o*.12+.9,O):1;return{radius:t.baseRadius+o*t.radiusStep+t.expansion*.5*(1+y),life:(.78+.22*y)*b,virtual:o,mix:c,opening:1}}const u=O-o*Rt,M=(u%z+z)%z,S=P&&u<0?0:tn(M);return{radius:t.baseRadius+o*t.radiusStep+(1-Math.pow(1-M/z,2))*t.expansion,life:S,virtual:o,mix:c,opening:P&&u<z?j(0,.9,u):1}},Qe=()=>{if(!le)return;const t=Ke,o=t.ringCount,a=d.hover,c=$?0:1,u=1+(t.hoverScale-1)*a*c,M=d.x*c,S=d.y*c,y=t.tilt-S*t.parallax*260,b=M*t.parallax*260,w=an(y,b),R=t.followMouse?[M*t.mouseInfluence,S*t.mouseInfluence]:[0,0],Ae=t.spin*O*.6;let g=0,H=1/0,ue=0,Le=0;const lt=(v,h,I,D,de,me,W,pe)=>{if(h<=.002)return;const J=10*v*I*I*I;qe.set([v,h,J,J>6.2?Math.cbrt(6.2/J):2],g*4),Ye.set([de,me,Math.cos(D),Math.sin(D)],g*4),$e.set([t.color[0]+(t.colorTwo[0]-t.color[0])*W,t.color[1]+(t.colorTwo[1]-t.color[1])*W,t.color[2]+(t.colorTwo[2]-t.color[2])*W,pe],g*4),H=Math.min(H,v),ue=Math.max(ue,v),Le=Math.max(Le,Math.hypot(de,me)),g++};for(let v=0;v<o;v++){const h=zt(t,v,o);let I=h.radius*u,D=h.life;for(const W of _){const pe=X-W.start,J=(W.radius+pe*yt)*u,wt=Math.pow(Math.max(0,1-pe/ge),1.5),ve=(J-I)/.08;I+=.04*Math.exp(-ve*ve)*wt,D=Math.min(1.6,D+.9*Math.exp(-ve*ve*1.6)*wt)}const de=Math.pow(t.taper,h.virtual)/Math.max(.08,h.opening),me=t.rotation+Ae*(v%2?-1:1)*(1+v*.15);lt(I,D,de,me,v*t.parallax*M,v*t.parallax*S,h.mix,1)}for(const v of _){const h=X-v.start,I=Math.pow(Math.max(0,1-h/ge),1.5),D=(v.radius+h*yt)*u;lt(D,1.5*I,.85,t.rotation,0,0,A(h/ge,0,1),1.15)}if(e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,m.width,m.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),!g)return;const[ft,ut,ht]=le.programs;if(!ft||!ut||!ht)return;const dt=(t.light?.3:1)*(1-t.dispersion*.45),mt=.012+.033*t.glow,Xt=.5*Math.min(1,t.glow)*dt,Vt=.9*t.glow*dt,he=mt*4.5+.008,pt=t.dispersion*.03,vt=he+pt*ue+Le+.01,gt=t.lineThickness*k.ratio,Wt=gt*(1+.45*t.hoverIntensity)*1.15+1.5,xt=sn(w.inverse,p.x,p.y),_e=v=>{const h=v.uniforms;return e.useProgram(v.program),e.uniform2f(h.uResolution,m.width,m.height),e.uniform1f(h.uUnit,k.unit),e.uniform2f(h.uCenter,R[0],R[1]),e.uniform1i(h.uCount,g),e.uniform4fv(h.uShape,qe),e.uniform4fv(h.uFrame,Ye),e.uniform4fv(h.uTint,$e),e.uniform4f(h.uHover,xt[0]-R[0],xt[1]-R[1],a*t.hoverIntensity,1/.03),e.uniform1f(h.uSplit,pt),e.uniform1f(h.uOpacity,t.opacity),h};e.bindVertexArray(Ve),e.bindFramebuffer(e.FRAMEBUFFER,ye),e.viewport(0,0,N.width,N.height),e.clear(e.COLOR_BUFFER_BIT);const K=_e(ft);e.uniform2f(K.uScale,m.width/N.width,m.height/N.height),e.uniformMatrix3fv(K.uInverse,!0,w.inverse),e.uniform2f(K.uBounds,Math.max(0,H-vt),ue+vt),e.uniform4f(K.uHalo,0,1/mt,Xt,Vt),e.uniform3f(K.uRange,he*.45,1/(he*.55),he),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,m.width,m.height);const Ie=_e(ut);e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,ae),e.uniform1i(Ie.uGlow,0),e.uniform1f(Ie.uGrain,t.grain),e.uniform1f(Ie.uTime,X),e.drawArrays(e.TRIANGLES,0,3);const Ce=_e(ht);e.uniformMatrix3fv(Ce.uForward,!0,w.forward),e.uniform1f(Ce.uReach,Wt),e.uniform1f(Ce.uWidth,gt),e.enable(e.BLEND),t.light?e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA):e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_COLOR,e.ONE,e.ONE_MINUS_SRC_ALPHA),e.bindVertexArray(Me),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,(Z+1)*2,g),e.disable(e.BLEND),e.bindVertexArray(null)},Fe=t=>{if(U=0,ce)return;const o=Te(!0);if(!le){V=Math.max(V,t),ie&&se&&(U=requestAnimationFrame(Fe));return}const a=Q(C.current),c=A((t-V)/1e3||0,0,.05);V=Math.max(V,t),X+=c,$||(O+=c*a.speed);const u=p.inside?p.x/Math.max(1e-6,k.width/k.unit):0,M=p.inside?p.y/Math.max(1e-6,k.height/k.unit):0,S=70,y=2*Math.sqrt(S)*.9,b=Math.max(1,Math.ceil(c/(1/240))),w=c/b;for(let g=0;g<b;g++){d.vx+=(S*(u-d.x)-y*d.vx)*w,d.vy+=(S*(M-d.y)-y*d.vy)*w,d.x+=d.vx*w,d.y+=d.vy*w;const H=p.inside?1:0;d.hoverVelocity+=(40*(H-d.hover)-2*Math.sqrt(40)*d.hoverVelocity)*w,d.hover+=d.hoverVelocity*w}for(let g=_.length-1;g>=0;g--)X-_[g].start>ge&&_.splice(g,1);P&&O>(a.ringCount+2)*Rt+z&&(P=!1),Qe();const R=Math.abs(d.vx)+Math.abs(d.vy)+Math.abs(d.hoverVelocity)>1e-4||Math.abs((p.inside?1:0)-d.hover)>.001;(a.speed>0&&!$||R||_.length>0||P||o)&&ie&&se&&(U=requestAnimationFrame(Fe))},B=()=>{U||ce||!ie||!se||(V=performance.now(),U=requestAnimationFrame(Fe))},Ze=()=>{Je(),Te(!1),Qe(),B()};Se.current=Ze;const et=t=>{const o=q.getBoundingClientRect(),a=t.clientX>=o.left&&t.clientX<=o.right&&t.clientY>=o.top&&t.clientY<=o.bottom,c=Math.max(1,Math.min(o.width,o.height));return{x:(t.clientX-o.left-o.width/2)/c,y:(o.top+o.height/2-t.clientY)/c,inside:a}},tt=t=>{if(t.pointerType==="touch"&&!p.touch)return;const o=et(t);p.x=o.x,p.y=o.y,p.inside=o.inside,B()},nt=t=>{const o=et(t);if(!o.inside)return;p.x=o.x,p.y=o.y,p.inside=!0,p.touch=t.pointerType==="touch";const a=Q(C.current);a.clickBurst&&!$&&(_.push({start:X,radius:Math.max(.04,a.baseRadius*.45)}),_.length>At&&_.shift()),B()},fe=t=>{t.pointerType==="touch"&&(p.touch=!1,p.inside=!1,B())},ot=()=>{p.inside=!1,B()};L(window).addEventListener("pointermove",tt,{passive:!0}),L(window).addEventListener("pointerdown",nt,{passive:!0}),L(window).addEventListener("pointerup",fe,{passive:!0}),L(window).addEventListener("pointercancel",fe,{passive:!0}),L(document.documentElement).addEventListener("pointerleave",ot);const rt=t=>{t.preventDefault(),ce=!0,cancelAnimationFrame(U),U=0},at=()=>Ht(t=>t+1);m.addEventListener("webglcontextlost",rt),m.addEventListener("webglcontextrestored",at);const it=new ResizeObserver(Ze);it.observe(q);const st=new IntersectionObserver(t=>{ie=t.some(o=>o.isIntersecting),B()});st.observe(q);const ct=()=>{se=document.visibilityState!=="hidden",B()};return document.addEventListener("visibilitychange",ct),Je(),Te(!1),B(),()=>{if(cancelAnimationFrame(U),Se.current=null,it.disconnect(),st.disconnect(),L(window).removeEventListener("pointermove",tt),L(window).removeEventListener("pointerdown",nt),L(window).removeEventListener("pointerup",fe),L(window).removeEventListener("pointercancel",fe),L(document.documentElement).removeEventListener("pointerleave",ot),document.removeEventListener("visibilitychange",ct),m.removeEventListener("webglcontextlost",rt),m.removeEventListener("webglcontextrestored",at),!e.isContextLost()){e.deleteVertexArray(Ve),e.deleteTexture(ae),e.deleteFramebuffer(ye),e.deleteVertexArray(Me),e.deleteBuffer(We);const o=()=>{ce||e.isContextLost()||(Y.forEach((a,c)=>{a.pending&&!He(a)||(a.jobs.forEach(u=>{u&&(e.deleteShader(u.vertex),e.deleteShader(u.fragment),e.deleteProgram(u.program))}),a.programs.forEach(u=>u&&e.deleteProgram(u.program)),Y.delete(c))}),Y.size&&requestAnimationFrame(o))};o()}const t=()=>{oe.current=0,!m.isConnected&&!e.isContextLost()&&e.getExtension("WEBGL_lose_context")?.loseContext()};m.isConnected?oe.current=requestAnimationFrame(t):t()}},[De]),Et.jsx("div",{ref:Ue,className:`magic-rings${Oe?` ${Oe}`:""}`,style:kt,children:Et.jsx("canvas",{ref:Be,className:"magic-rings__canvas","aria-hidden":"true"})})};export{hn as default};
