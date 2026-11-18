import{r as w,j as ae}from"./index-uEvbEw5g.js";import{b as C}from"./App-Dofw4Ib9.js";import{b as V}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Ae=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,_e=`#version 300 es
precision highp float;
uniform vec2 uView;
uniform vec2 uScale;
uniform float uZoom;
uniform float uTime;
uniform float uTwist;
uniform float uWave;
uniform float uSharpness;
uniform vec2 uOrbit;
uniform float uDither;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 c = (gl_FragCoord.xy * uScale - 0.5 * uView) / uZoom;
  vec3 rd = normalize(vec3(c, uView.y));
  vec3 ro = vec3(0.0, 0.0, -4.0);
  float cy = cos(uOrbit.x);
  float sy = sin(uOrbit.x);
  float cx = cos(uOrbit.y);
  float sx = sin(uOrbit.y);
  mat3 orbit = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy) * mat3(1.0, 0.0, 0.0, 0.0, cx, sx, 0.0, -sx, cx);
  ro = orbit * ro;
  rd = orbit * rd;
  float z = 0.0;
  float density = 0.0;
  float band = 0.0;
  for (int i = 0; i < 60; i++) {
    vec3 p = ro + rd * z;
    vec3 s = p;
    float d = p.y - uTime;
    p.x += uWave * (1.0 + p.y) * sin(d + p.x * 0.1) * cos(0.34 * d + p.x * 0.05);
    vec2 q = p.xz *= mat2(cos(p.y * uTwist + vec4(0.0, 11.0, 33.0, 0.0) - uTime));
    float shell = abs(sqrt(length(q * q)) - 0.25 * (5.0 + s.y)) / 3.0;
    float stepLength = shell + 0.0008;
    z += stepLength;
    float phase = s.y + p.z * 0.5 + s.z - length(s - p);
    float weight = (1.0 + sin(phase + 8.0)) * exp(-shell * uSharpness) * stepLength;
    density += weight;
    band += weight * (0.5 + 0.5 * sin(phase * 0.5 + 1.0));
  }
  vec2 encoded = sqrt(vec2(density, band) / (1.0 + vec2(density, band)));
  encoded += (vec2(hash(gl_FragCoord.xy), hash(gl_FragCoord.yx + 17.0)) - 0.5) * uDither;
  outColor = vec4(encoded, 0.0, 1.0);
}`,Fe=`#version 300 es
precision highp float;
uniform sampler2D uVolume;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform vec3 uHighlight;
uniform vec3 uInk;
uniform float uGain;
uniform float uShine;
uniform float uPresence;
uniform float uGrain;
uniform float uFade;
uniform float uOpacity;
uniform float uTime;
uniform float uLightMode;
uniform vec3 uHeat;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 encoded = clamp(texture(uVolume, uv).rg, 0.0, 0.9995);
  encoded *= encoded;
  vec2 volume = encoded / (1.0 - encoded);
  vec2 offset = (gl_FragCoord.xy - uHeat.xy) / uResolution.y;
  float heat = uHeat.z * exp(-dot(offset, offset) / 0.05);
  float density = volume.r * uGain * uPresence * (1.0 + heat * 0.35);
  float band = clamp(volume.g / max(volume.r, 0.00001), 0.0, 1.0);
  vec3 tint = mix(uColor, uHighlight, band * 0.35);
  vec3 hdr = tint * density + uHighlight * density * density * uShine;
  float peak = max(hdr.r, max(hdr.g, hdr.b));
  float level = 1.0 - exp(-peak);
  float hot = smoothstep(1.0, 3.0, peak);
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  mask *= uOpacity;
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;
  if (uLightMode > 0.5) {
    vec3 color = mix(uInk, vec3(1.0), hot * 0.75);
    float alpha = clamp(pow(level, 0.8) * 0.9 * (1.0 + grain), 0.0, 1.0) * mask;
    outColor = vec4(color * alpha, alpha);
  } else {
    vec3 hue = hdr / max(peak, 0.0001);
    vec3 color = mix(hue * level, vec3(level), hot * 0.6);
    color = pow(color, vec3(1.0 / 2.2));
    color = clamp(color + grain * level, 0.0, 1.0) * mask;
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`,Pe=1.6,se=16e5,D=(i,x,d)=>Math.min(d,Math.max(x,i)),ce=(i,x,d)=>{const m=i.createShader(x);return m?(i.shaderSource(m,d),i.compileShader(m),i.getShaderParameter(m,i.COMPILE_STATUS)?m:(i.deleteShader(m),null)):null},ue=(i,x)=>{const d=ce(i,i.VERTEX_SHADER,Ae),m=ce(i,i.FRAGMENT_SHADER,x),l=i.createProgram();if(!d||!m||!l)return null;if(i.attachShader(l,d),i.attachShader(l,m),i.bindAttribLocation(l,0,"aPosition"),i.linkProgram(l),i.deleteShader(d),i.deleteShader(m),!i.getProgramParameter(l,i.LINK_STATUS))return i.deleteProgram(l),null;const _={},O=i.getProgramParameter(l,i.ACTIVE_UNIFORMS);for(let M=0;M<O;M++){const A=i.getActiveUniform(l,M);A&&(_[A.name]=i.getUniformLocation(l,A.name))}return{program:l,uniforms:_}},Ve=({color:i="#a6a3b8",speed:x=1,direction:d="forward",scale:m=1,twist:l=1,wave:_=1,softness:O=.5,shine:M=1,brightness:A=1,grain:le=.04,quality:fe=.75,mouseInteractive:me=!0,intro:he=!0,fade:de=0,opacity:pe=1,lightMode:ve=!1,paused:ge=!1,dpr:xe,className:N="",...ye})=>{const z=w.useRef(null),W=w.useRef(null),I=w.useRef(null),Y={color:String(i),speed:x,direction:d,scale:Math.max(.1,m),twist:l,wave:Math.max(0,_),softness:D(O,0,1),shine:Math.max(0,M),brightness:Math.max(0,A),grain:Math.max(0,le),quality:D(fe,.25,1),mouseInteractive:me,intro:he,fade:D(de,0,1),opacity:D(pe,0,1),lightMode:ve,paused:ge,dpr:xe},v=w.useRef(Y);return v.current=Y,w.useEffect(()=>{const y=z.current,h=W.current,e=h?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!y||!h||!e)return;const j=!!e.getExtension("EXT_color_buffer_float"),Z=ue(e,_e),Q=ue(e,Fe);if(!Z||!Q)return;const F={volume:Z,composite:Q},$=e.createBuffer(),X=e.createVertexArray();e.bindVertexArray(X),e.bindBuffer(e.ARRAY_BUFFER,$),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const P=e.createTexture(),k=e.createFramebuffer(),g={width:0,height:0},Ee=(t,r)=>{g.width===t&&g.height===r||(g.width=t,g.height=r,e.bindTexture(e.TEXTURE_2D,P),j?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,t,r,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,r,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,k),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,P,0))},E=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),S=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,G=new Map,Te=t=>{if(G.has(t))return G.get(t);let r=[1,1,1];if(E){E.clearRect(0,0,1,1),E.fillStyle="#ffffff",E.fillStyle=t,E.fillRect(0,0,1,1);const[n,a,s]=E.getImageData(0,0,1,1).data;r=[n,a,s].map(c=>Math.pow(c/255,2.2))}return G.set(t,r),r},u={width:1,height:1,volumeWidth:1,volumeHeight:1},f={x:0,y:0,inside:!1},o={clock:0,intro:v.current.intro&&!S?0:1,yaw:0,pitch:0,yawVelocity:0,pitchVelocity:0,heat:0,heatX:0,heatY:0};let T=0,R=0,L=!0;const Re=t=>{const r=o.clock*.4;if(t.direction==="reverse")return-r;if(t.direction!=="pingpong")return r;const n=10,a=o.clock%n/n,s=a*a*(3-2*a);return(Math.floor(o.clock/n)%2===0?s:1-s)*n*.4},B=()=>{const t=V(v.current),r=o.intro*o.intro*(3-2*o.intro);e.bindVertexArray(X),Ee(u.volumeWidth,u.volumeHeight);const n=F.volume,a=n.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,k),e.viewport(0,0,g.width,g.height),e.useProgram(n.program),e.uniform2f(a.uView,u.width,u.height),e.uniform2f(a.uScale,u.width/g.width,u.height/g.height),e.uniform1f(a.uZoom,t.scale),e.uniform1f(a.uTime,Re(t)+(1-r)*1.4),e.uniform1f(a.uTwist,t.twist),e.uniform1f(a.uWave,.4*t.wave),e.uniform1f(a.uSharpness,100-t.softness*90),e.uniform2f(a.uOrbit,o.yaw,o.pitch),e.uniform1f(a.uDither,j?0:1/255),e.drawArrays(e.TRIANGLES,0,3);const s=F.composite,c=s.uniforms,p=Te(t.color),q=p.map(U=>U+(1-U)*.85),be=.2126*p[0]+.7152*p[1]+.0722*p[2],we=Math.min(1,.16/Math.max(be,.001)),Me=p.map(U=>Math.pow(Math.min(1,U*we),1/2.2));e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,h.width,h.height),e.useProgram(s.program),e.uniform2f(c.uResolution,h.width,h.height),e.uniform3fv(c.uColor,p),e.uniform3fv(c.uHighlight,q),e.uniform3fv(c.uInk,Me),e.uniform1f(c.uGain,4.8*t.brightness),e.uniform1f(c.uShine,.025*t.shine),e.uniform1f(c.uPresence,r),e.uniform1f(c.uGrain,t.grain),e.uniform1f(c.uFade,t.fade),e.uniform1f(c.uOpacity,t.opacity),e.uniform1f(c.uTime,o.clock%1e3),e.uniform1f(c.uLightMode,t.lightMode?1:0),e.uniform3f(c.uHeat,o.heatX*h.width/u.width,(u.height-o.heatY)*h.height/u.height,o.heat),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,P),e.uniform1i(c.uVolume,0),e.drawArrays(e.TRIANGLES,0,3)},K=t=>{if(T=0,!L||document.hidden)return;const r=V(v.current),n=R?Math.min(.05,(t-R)/1e3):1/60;R=t;const a=!r.paused&&!S;a&&(o.clock+=n*r.speed),!r.intro||S?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+n/Pe));const s=r.mouseInteractive&&f.inside&&!S,c=s?(f.x/u.width-.5)*.9:0,p=s?(f.y/u.height-.5)*.18:0;o.yawVelocity+=(40*(c-o.yaw)-11*o.yawVelocity)*n,o.pitchVelocity+=(40*(p-o.pitch)-11*o.pitchVelocity)*n,o.yaw+=o.yawVelocity*n,o.pitch+=o.pitchVelocity*n,o.heat+=((s?1:0)-o.heat)*(1-Math.exp(-n*(s?4:2))),o.heatX+=(f.x-o.heatX)*(1-Math.exp(-n*8)),o.heatY+=(f.y-o.heatY)*(1-Math.exp(-n*8)),B();const q=o.intro<1||Math.abs(c-o.yaw)>5e-4||Math.abs(o.yawVelocity)>5e-4||Math.abs(p-o.pitch)>5e-4||Math.abs(o.pitchVelocity)>5e-4||Math.abs((s?1:0)-o.heat)>.002;a||q?T=requestAnimationFrame(K):R=0},b=()=>{!T&&L&&!document.hidden&&(T=requestAnimationFrame(K))},H=()=>{const t=V(v.current),r=Math.max(1,y.clientWidth),n=Math.max(1,y.clientHeight),a=Math.min(t.dpr||window.devicePixelRatio||1,2);u.width=r,u.height=n,h.width=Math.max(1,Math.round(r*a)),h.height=Math.max(1,Math.round(n*a));let s=t.quality;r*n*s*s>se&&(s=Math.sqrt(se/(r*n))),u.volumeWidth=Math.max(1,Math.round(r*s)),u.volumeHeight=Math.max(1,Math.round(n*s)),B(),b()},J=t=>{const r=y.getBoundingClientRect();f.x=t.clientX-r.left,f.y=t.clientY-r.top,f.inside=f.x>=0&&f.y>=0&&f.x<=r.width&&f.y<=r.height,b()},ee=()=>{f.inside=!1,b()},te=()=>{R=0,b()},oe=new ResizeObserver(H);oe.observe(y);const re=new IntersectionObserver(t=>{L=t.some(r=>r.isIntersecting),L&&(R=0,b())});re.observe(y),C(window).addEventListener("pointermove",J,{passive:!0}),C(document.documentElement).addEventListener("pointerleave",ee),document.addEventListener("visibilitychange",te),H();let ie=v.current.quality,ne=v.current.dpr;return I.current=()=>{const t=V(v.current);if(t.quality!==ie||t.dpr!==ne){ie=t.quality,ne=t.dpr,H();return}T||B(),b()},()=>{cancelAnimationFrame(T),I.current=null,oe.disconnect(),re.disconnect(),C(window).removeEventListener("pointermove",J),C(document.documentElement).removeEventListener("pointerleave",ee),document.removeEventListener("visibilitychange",te),e.deleteTexture(P),e.deleteFramebuffer(k),e.deleteProgram(F.volume.program),e.deleteProgram(F.composite.program),e.deleteBuffer($),e.deleteVertexArray(X),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),w.useEffect(()=>{I.current?.()}),ae.jsx("div",{ref:z,className:`plasma-container${N?` ${N}`:""}`,...ye,children:ae.jsx("canvas",{ref:W,className:"plasma-canvas","aria-hidden":"true"})})};export{Ve as Plasma,Ve as default};
