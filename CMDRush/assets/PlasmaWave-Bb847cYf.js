import{r as M,j as xe}from"./index-uEvbEw5g.js";import{b as z}from"./App-Dofw4Ib9.js";import{b as N}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Ue=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,k=`#version 300 es
precision highp float;
const float PI = 3.14159265;
const float TAU = 6.28318531;
const float HALF_PI = 1.5707963;
`,Te=`
uniform vec2 uView;
uniform vec2 uOffset;
uniform float uRotation;
uniform float uFocalLength;
uniform float uTime;
uniform float uSpeed1;
uniform float uSpeed2;
uniform float uDir2;
uniform float uBend1;
uniform float uBend2;
uniform float uThickness;
uniform vec3 uHeat;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uCore;
uniform float uRange;

vec4 traceLight(vec2 pixel) {
  vec2 coord = pixel + uOffset - 0.5 * uView;
  float c = cos(uRotation);
  float sn = sin(uRotation);
  coord = mat2(c, -sn, sn, c) * coord;
  vec3 u = normalize(vec3(coord / uView.y, uFocalLength));
  vec3 o = vec3(0.0, 0.0, -7.0);
  float t = uTime * PI;
  float t1 = t * 0.7;
  float t2 = t * 0.9;
  float tSpeed1 = t * uSpeed1;
  float tSpeed2 = t * uSpeed2 * uDir2;
  float s = 1.0;
  float d = 0.0;
  vec2 k = vec2(0.0);
  for (int i = 0; i < 14; ++i) {
    vec3 p = o + u * d;
    p.x -= 15.0;
    float px = p.x;
    float swell = uHeat.y * exp(-pow((px - uHeat.x) / uHeat.z, 2.0));
    float wob1 = uBend1 + swell * (0.16 + 0.2 * uBend1) + sin(t1 + px * 0.8) * 0.1;
    float wob2 = uBend2 + swell * (0.16 + 0.2 * uBend2) + cos(t2 + px * 1.1) * 0.1;
    vec2 a = sin(vec2(px, px + HALF_PI) + tSpeed1) * wob1;
    vec2 b = cos(vec2(px, px + HALF_PI) + tSpeed2) * wob2;
    float cut = px + uThickness;
    k.x = max(cut, length(p.yz - a) - uThickness);
    k.y = max(cut, length(p.yz - b) - uThickness);
    s = min(s, min(k.x, k.y));
    if (s < 0.001 || d > 300.0) break;
    d += s * 0.7;
  }
  vec3 raw = max(cos(d * TAU) - s * sqrt(d) - vec3(k, 0.0), 0.0);
  float field = max(raw.r, max(raw.g, raw.b));
  raw.gb += 0.1;
  raw = raw * 0.4 + raw.brg * 0.6 + raw * raw;
  float lum = dot(raw, vec3(0.299, 0.587, 0.114));
  float w1 = max(0.0, 1.0 - k.x * 2.0) + 0.0001;
  float w2 = max(0.0, 1.0 - k.y * 2.0) + 0.0001;
  vec3 base = (uColor1 * w1 + uColor2 * w2) / (w1 + w2);
  float soft = smoothstep(0.03, 0.36, field);
  float hot = smoothstep(0.32, 0.8, field);
  vec3 light = base * lum * 2.6 * soft + mix(base, vec3(1.0), 0.55) * hot * uCore * 2.0;
  return vec4(light * uRange, field);
}
`,Xe=`${k}
${Te}
uniform vec2 uScale;
out vec4 outColor;
void main() {
  outColor = traceLight(gl_FragCoord.xy * uScale);
}`,He=`${k}
${Te}
uniform vec2 uScale;
uniform sampler2D uCoarse;
uniform vec2 uCoarseSize;
uniform vec2 uFineSize;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uFineSize;
  vec2 pos = uv * uCoarseSize - 0.5;
  ivec2 cell = ivec2(floor(pos));
  ivec2 last = ivec2(uCoarseSize) - 1;
  float a = texelFetch(uCoarse, clamp(cell, ivec2(0), last), 0).a;
  float b = texelFetch(uCoarse, clamp(cell + ivec2(1, 0), ivec2(0), last), 0).a;
  float c = texelFetch(uCoarse, clamp(cell + ivec2(0, 1), ivec2(0), last), 0).a;
  float d = texelFetch(uCoarse, clamp(cell + ivec2(1, 1), ivec2(0), last), 0).a;
  float high = max(max(a, b), max(c, d));
  float low = min(min(a, b), min(c, d));
  if (high > 0.02 && low < 0.4) outColor = traceLight(gl_FragCoord.xy * uScale);
  else outColor = texture(uCoarse, uv);
}`,We=`${k}
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 sum = texture(uSource, uv) * 4.0;
  sum += texture(uSource, uv - uTexel);
  sum += texture(uSource, uv + uTexel);
  sum += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));
  sum += texture(uSource, uv - vec2(uTexel.x, -uTexel.y));
  outColor = sum / 8.0;
}`,Ge=`${k}
uniform sampler2D uSource;
uniform sampler2D uBase;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec2 h = uTexel * 0.5;
  vec4 sum = texture(uSource, uv + vec2(-h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(0.0, -h.y * 2.0));
  sum += texture(uSource, uv + vec2(0.0, h.y * 2.0));
  sum += texture(uSource, uv + vec2(-h.x, h.y)) * 2.0;
  sum += texture(uSource, uv + h) * 2.0;
  sum += texture(uSource, uv + vec2(h.x, -h.y)) * 2.0;
  sum += texture(uSource, uv - h) * 2.0;
  outColor = sum / 12.0 + texture(uBase, uv);
}`,Ve=`${k}
uniform sampler2D uLight;
uniform sampler2D uBloom;
uniform vec2 uResolution;
uniform float uExposure;
uniform float uGlow;
uniform float uCore;
uniform float uPresence;
uniform float uGrain;
uniform float uFade;
uniform float uOpacity;
uniform float uTime;
uniform float uLightMode;
uniform vec3 uLens;
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
  vec2 offset = gl_FragCoord.xy - uLens.xy;
  float lens = uLens.z * exp(-dot(offset, offset) / (uResolution.y * uResolution.y * 0.045));
  vec4 source = texture(uLight, uv);
  vec3 hdr = source.rgb * uExposure * uPresence * (1.0 + lens * 0.35);
  hdr += texture(uBloom, uv).rgb * uExposure * uPresence * uGlow * (0.18 + lens * 0.08);
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;
  float peak = max(hdr.r, max(hdr.g, hdr.b));
  if (uLightMode > 0.5) {
    vec3 hue = hdr / max(peak, 0.0001);
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));
    vec3 ink = pow(clamp(hue * min(1.0, 0.6 / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));
    float feather = max(fwidth(source.a) * 1.25, 0.02);
    float body = smoothstep(0.15 - feather, 0.15 + feather, source.a) * uPresence;
    vec3 color = mix(ink, vec3(1.0), smoothstep(12.0, 26.0, peak) * uCore);
    float halo = (1.0 - exp(-peak * 0.5)) * 0.3 * min(uGlow, 1.5);
    float alpha = clamp(body * 0.92 + (1.0 - body) * halo, 0.0, 1.0) * mask * uOpacity;
    color = mix(ink, color, body);
    outColor = vec4(clamp(color + grain, 0.0, 1.0) * alpha, alpha);
  } else {
    vec3 mapped = 1.0 - exp(-hdr);
    float level = max(mapped.r, max(mapped.g, mapped.b));
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask * uOpacity;
    outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));
  }
}`,F=4,pe=3,ze=1.8,ve=24e5,D=(i,w,v)=>Math.min(v,Math.max(w,i)),ge=(i,w,v)=>{const d=i.createShader(w);return d?(i.shaderSource(d,v),i.compileShader(d),i.getShaderParameter(d,i.COMPILE_STATUS)?d:(i.deleteShader(d),null)):null},B=(i,w)=>{const v=ge(i,i.VERTEX_SHADER,Ue),d=ge(i,i.FRAGMENT_SHADER,w),m=i.createProgram();if(!v||!d||!m)return null;if(i.attachShader(m,v),i.attachShader(m,d),i.bindAttribLocation(m,0,"aPosition"),i.linkProgram(m),i.deleteShader(v),i.deleteShader(d),!i.getProgramParameter(m,i.LINK_STATUS))return i.deleteProgram(m),null;const I={},q=i.getProgramParameter(m,i.ACTIVE_UNIFORMS);for(let _=0;_<q;_++){const L=i.getActiveUniform(m,_);L&&(I[L.name]=i.getUniformLocation(m,L.name))}return{program:m,uniforms:I}};function je({colors:i=["#A855F7","#06B6D4"],speed:w=1,speed1:v=.05,speed2:d=.05,dir2:m=1,bend1:I=1,bend2:q=.5,thickness:_=.3,focalLength:L=1.25,rotationDeg:we=0,xOffset:Ee=0,yOffset:Re=0,brightness:be=1,glow:Se=1,core:ye=.6,grain:Ae=.03,quality:Ce=1,mouseInteraction:Me=!0,intro:Fe=!0,fade:_e=0,opacity:Le=1,lightMode:Pe=!1,paused:Oe=!1,dpr:De,className:J="",...Be}){const Z=M.useRef(null),ee=M.useRef(null),$=M.useRef(null),te={color1:String(i?.[0]??"#A855F7"),color2:String(i?.[1]??i?.[0]??"#06B6D4"),speed:w,speed1:v,speed2:d,dir2:m,bend1:I,bend2:q,thickness:Math.max(.02,_),focalLength:Math.max(.05,L),rotation:we*Math.PI/180,xOffset:Ee,yOffset:Re,brightness:Math.max(0,be),glow:Math.max(0,Se),core:D(ye,0,1),grain:Math.max(0,Ae),quality:D(Ce,.25,1),mouseInteraction:Me,intro:Fe,fade:D(_e,0,1),opacity:D(Le,0,1),lightMode:Pe,paused:Oe,dpr:De},g=M.useRef(te);return g.current=te,M.useEffect(()=>{const E=Z.current,p=ee.current,e=p?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!E||!p||!e)return;const oe=!!e.getExtension("EXT_color_buffer_float"),re=oe?1:.25,s={coarse:B(e,Xe),fine:B(e,He),down:B(e,We),up:B(e,Ge),composite:B(e,Ve)};if(Object.values(s).some(t=>!t))return;const ae=e.createBuffer(),Y=e.createVertexArray();e.bindVertexArray(Y),e.bindBuffer(e.ARRAY_BUFFER,ae),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const U=()=>({texture:e.createTexture(),framebuffer:e.createFramebuffer(),width:0,height:0}),X=(t,o,a)=>{t.width===o&&t.height===a||(t.width=o,t.height=a,e.bindTexture(e.TEXTURE_2D,t.texture),oe?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,o,a,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,o,a,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0))},H=U(),P=U(),R=Array.from({length:F+1},U),W=Array.from({length:F},U),b=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),G=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,j=new Map,ne=t=>{if(j.has(t))return j.get(t);let o=[1,1,1];if(b){b.clearRect(0,0,1,1),b.fillStyle="#000000",b.fillStyle=t,b.fillRect(0,0,1,1);const[a,n,c]=b.getImageData(0,0,1,1).data;o=[a,n,c].map(f=>Math.pow(f/255,2.2))}return j.set(t,o),o},r={width:1,height:1,fineWidth:1,fineHeight:1,coarseWidth:1,coarseHeight:1},h={x:0,y:0,inside:!1},u={time:0,intro:g.current.intro&&!G?0:1,heat:0,heatVelocity:0,heatX:0,lensX:0,lensY:0};let S=0,y=0,V=!0;const O=(t,o,a,n)=>{e.bindFramebuffer(e.FRAMEBUFFER,o?o.framebuffer:null),e.viewport(0,0,a,n),e.useProgram(t.program),e.drawArrays(e.TRIANGLES,0,3)},A=(t,o,a,n)=>{e.activeTexture(e.TEXTURE0+a),e.bindTexture(e.TEXTURE_2D,n),e.uniform1i(t.uniforms[o],a)},ie=(t,o,a)=>{const n=t.uniforms;e.useProgram(t.program),e.uniform2f(n.uView,r.width,r.height),e.uniform2f(n.uOffset,o.xOffset,o.yOffset),e.uniform1f(n.uRotation,o.rotation),e.uniform1f(n.uFocalLength,o.focalLength),e.uniform1f(n.uTime,u.time),e.uniform1f(n.uSpeed1,o.speed1),e.uniform1f(n.uSpeed2,o.speed2),e.uniform1f(n.uDir2,o.dir2),e.uniform1f(n.uBend1,o.bend1*(.3+.7*a)),e.uniform1f(n.uBend2,o.bend2*(.3+.7*a)),e.uniform1f(n.uThickness,o.thickness),e.uniform3f(n.uHeat,u.heatX,u.heat,1.4),e.uniform3fv(n.uColor1,ne(o.color1)),e.uniform3fv(n.uColor2,ne(o.color2)),e.uniform1f(n.uCore,o.core),e.uniform1f(n.uRange,re)},Q=()=>{const t=N(g.current),o=u.intro*u.intro*(3-2*u.intro);e.bindVertexArray(Y),X(H,r.coarseWidth,r.coarseHeight),X(P,r.fineWidth,r.fineHeight),ie(s.coarse,t,o),e.uniform2f(s.coarse.uniforms.uScale,r.width/r.coarseWidth,r.height/r.coarseHeight),O(s.coarse,H,r.coarseWidth,r.coarseHeight);const a=s.fine;ie(a,t,o),e.uniform2f(a.uniforms.uScale,r.width/r.fineWidth,r.height/r.fineHeight),e.uniform2f(a.uniforms.uCoarseSize,r.coarseWidth,r.coarseHeight),e.uniform2f(a.uniforms.uFineSize,r.fineWidth,r.fineHeight),A(a,"uCoarse",0,H.texture),O(a,P,r.fineWidth,r.fineHeight);let n=P;for(let l=0;l<=F;l++){const x=R[l],T=l===0?Math.round(r.width/2):n.width>>1,Ie=l===0?Math.round(r.height/2):n.height>>1;X(x,Math.max(1,T),Math.max(1,Ie)),e.useProgram(s.down.program),e.uniform2f(s.down.uniforms.uTexel,1/n.width,1/n.height),e.uniform2f(s.down.uniforms.uTarget,x.width,x.height),A(s.down,"uSource",0,n.texture),O(s.down,x,x.width,x.height),n=x}for(let l=F-1;l>=1;l--){const x=l===F-1?R[F]:W[l+1],T=W[l];X(T,R[l].width,R[l].height),e.useProgram(s.up.program),e.uniform2f(s.up.uniforms.uTexel,1/x.width,1/x.height),e.uniform2f(s.up.uniforms.uTarget,T.width,T.height),A(s.up,"uSource",0,x.texture),A(s.up,"uBase",1,R[l].texture),O(s.up,T,T.width,T.height)}const c=s.composite,f=c.uniforms;e.useProgram(c.program),e.uniform2f(f.uResolution,p.width,p.height),e.uniform1f(f.uExposure,2.4*t.brightness/re),e.uniform1f(f.uGlow,t.glow),e.uniform1f(f.uCore,t.core),e.uniform1f(f.uPresence,o*o),e.uniform1f(f.uGrain,t.grain),e.uniform1f(f.uFade,t.fade),e.uniform1f(f.uOpacity,t.opacity),e.uniform1f(f.uTime,u.time),e.uniform1f(f.uLightMode,t.lightMode?1:0),e.uniform3f(f.uLens,u.lensX*p.width/r.width,(r.height-u.lensY)*p.height/r.height,u.heat),A(c,"uLight",0,P.texture),A(c,"uBloom",1,W[1].texture),O(c,null,p.width,p.height)},ke=t=>{if(!(t.mouseInteraction&&h.inside)||G)return null;const o=h.x+t.xOffset-r.width/2,a=r.height-h.y+t.yOffset-r.height/2,n=Math.cos(t.rotation),c=Math.sin(t.rotation);return 7*(n*o+c*a)/r.height/t.focalLength-15},ue=t=>{if(S=0,!V||document.hidden)return;const o=N(g.current),a=y?Math.min(.05,(t-y)/1e3):1/60;y=t;const n=!o.paused&&!G;n&&(u.time+=a*o.speed),!o.intro||G?u.intro=1:u.intro<1&&(u.intro=Math.min(1,u.intro+a/ze));const c=ke(o);c!==null&&(u.heatX+=(c-u.heatX)*(1-Math.exp(-a*6))),u.heatVelocity+=(120*((c===null?0:1)-u.heat)-19*u.heatVelocity)*a,u.heat=D(u.heat+u.heatVelocity*a,0,1.15),u.lensX+=(h.x-u.lensX)*(1-Math.exp(-a*8)),u.lensY+=(h.y-u.lensY)*(1-Math.exp(-a*8)),Q();const f=u.intro<1||u.heat>.001||Math.abs(u.heatVelocity)>.001;n||f?S=requestAnimationFrame(ue):y=0},C=()=>{!S&&V&&!document.hidden&&(S=requestAnimationFrame(ue))},K=()=>{const t=N(g.current),o=Math.max(1,E.clientWidth),a=Math.max(1,E.clientHeight),n=Math.min(t.dpr||window.devicePixelRatio||1,2);r.width=o,r.height=a,p.width=Math.max(1,Math.round(o*n)),p.height=Math.max(1,Math.round(a*n));let c=t.quality;o*a*c*c>ve&&(c=Math.sqrt(ve/(o*a))),r.fineWidth=Math.max(1,Math.round(o*c)),r.fineHeight=Math.max(1,Math.round(a*c)),r.coarseWidth=Math.max(1,Math.round(r.fineWidth/pe)),r.coarseHeight=Math.max(1,Math.round(r.fineHeight/pe)),Q(),C()},ce=t=>{const o=E.getBoundingClientRect();h.x=t.clientX-o.left,h.y=t.clientY-o.top,h.inside=h.x>=0&&h.y>=0&&h.x<=o.width&&h.y<=o.height,C()},se=()=>{h.inside=!1,C()},fe=()=>{y=0,C()},le=new ResizeObserver(K);le.observe(E);const me=new IntersectionObserver(t=>{V=t.some(o=>o.isIntersecting),V&&(y=0,C())});me.observe(E),z(window).addEventListener("pointermove",ce,{passive:!0}),z(document.documentElement).addEventListener("pointerleave",se),document.addEventListener("visibilitychange",fe),K();let he=g.current.quality,de=g.current.dpr;return $.current=()=>{const t=N(g.current);if(t.quality!==he||t.dpr!==de){he=t.quality,de=t.dpr,K();return}S||Q(),C()},()=>{cancelAnimationFrame(S),$.current=null,le.disconnect(),me.disconnect(),z(window).removeEventListener("pointermove",ce),z(document.documentElement).removeEventListener("pointerleave",se),document.removeEventListener("visibilitychange",fe);for(const t of[H,P,...R,...W])e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer);for(const t of Object.values(s))e.deleteProgram(t.program);e.deleteBuffer(ae),e.deleteVertexArray(Y),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),M.useEffect(()=>{$.current?.()}),xe.jsx("div",{ref:Z,className:`plasma-wave-container${J?` ${J}`:""}`,...Be,children:xe.jsx("canvas",{ref:ee,className:"plasma-wave-canvas","aria-hidden":"true"})})}export{je as default};
