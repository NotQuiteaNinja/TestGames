import{r as M,j as ke}from"./index-uEvbEw5g.js";import{b as p}from"./App-Dofw4Ib9.js";import{b as $}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const le=8,_e=4,ot=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,rt=`#version 300 es
precision highp float;
uniform vec2 uView;
uniform float uZoom;
uniform float uPhase;
uniform float uTwinkleClock;
uniform float uRings;
uniform vec3 uColors[8];
uniform int uColorCount;
uniform int uStreakCount;
uniform int uColumns;
uniform float uWidth;
uniform float uTail;
uniform float uTwinkle;
uniform float uHead;
uniform float uDepth;
uniform vec4 uMouse;
uniform vec3 uLens;
uniform float uLightMode;
uniform float uEncode;
out vec4 outColor;

const vec3 CAMERA = vec3(0.0, -0.8888889, -0.2222222);
const float TAU = 6.28318530718;
const float SPACING = 0.005;
const float REACH = 0.32;

uint scramble(uint x) {
  x ^= x >> 16;
  x *= 0x7feb352du;
  x ^= x >> 15;
  x *= 0x846ca68bu;
  x ^= x >> 16;
  return x;
}

float unit(uint x) {
  return float(x & 0xffffu) / 65535.0;
}

float stroke(float d, float w) {
  float s = max(0.75 * w, 0.55);
  return 0.75 * w / s * exp(-0.5 * d * d / (s * s));
}

float orb(float d, float r) {
  float s = max(0.6 * r, 0.7);
  float e = 0.6 * r / s;
  return e * e * exp(-0.5 * d * d / (s * s));
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 screen = (2.0 * frag - uView) / uView.x;
  vec2 p = screen;
  mat2 warp = mat2(1.0);
  if (uLens.z > 0.0) {
    vec2 o = p - uLens.xy;
    float e = uLens.z * exp(-dot(o, o) / (REACH * REACH));
    p -= o * e;
    warp = mat2(1.0 - e) + outerProduct(o, o) * (2.0 * e / (REACH * REACH));
  }

  vec3 dir = vec3(p, uZoom);
  vec3 exits = (1.0 - CAMERA * sign(dir)) / max(abs(dir), vec3(1e-6));
  float u = min(exits.x, min(exits.y, exits.z));
  for (int i = 0; i < 5; i++) {
    vec3 h = CAMERA + u * dir;
    vec3 h2 = h * h;
    u -= (dot(h2, h2) - 1.0) / (4.0 * dot(dir, h2 * h));
  }
  vec3 hit = CAMERA + u * dir;
  vec3 normal = hit * hit * hit;
  float facing = dot(normal, dir);
  vec3 stepX = u * (vec3(1.0, 0.0, 0.0) - dir * (normal.x / facing));
  vec3 stepY = u * (vec3(0.0, 1.0, 0.0) - dir * (normal.y / facing));
  float ring = hit.y * hit.y + hit.z * hit.z;
  float theta = atan(hit.z, hit.y);
  mat2 jacobian = mat2(
    stepX.x,
    (hit.y * stepX.z - hit.z * stepX.y) / ring,
    stepY.x,
    (hit.y * stepY.z - hit.z * stepY.y) / ring
  ) * warp * (2.0 / uView.x);

  vec2 gradX = vec2(jacobian[0][0], jacobian[1][0]);
  vec2 gradTheta = vec2(jacobian[0][1], jacobian[1][1]);
  float scale = max(length(gradX), 1e-8);
  float det = max(abs(gradX.x * gradTheta.y - gradX.y * gradTheta.x), 1e-12);
  float along = scale / det;
  float skew = dot(gradX, gradTheta) / det;
  float spacing = SPACING / scale;
  float detail = smoothstep(1.6, 3.2, spacing);
  if (detail <= 0.0) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  float halfWidth = min(uWidth / scale, 0.2 * spacing);
  float headRadius = min(2.0 * uWidth / scale, 0.35 * spacing);
  float headReach = 4.0 * max(0.6 * headRadius, 0.7);
  float edge = uColumns > 1 ? 1.0 : 0.5;
  float period = TAU / uRings;
  float fog = exp(-max(u * length(dir) - 0.6, 0.0) * 1.6 * uDepth);

  float boost = 1.0;
  if (uMouse.z > 0.0) {
    vec2 m = screen - uMouse.xy;
    boost += 2.0 * uMouse.z * exp(-dot(m, m) / max(uMouse.w * uMouse.w, 1e-4));
  }

  int count = max(uColorCount, 1);
  vec3 total = vec3(0.0);
  for (int layer = 0; layer < 16; layer++) {
    if (layer >= uStreakCount) break;
    float x = hit.x + float(layer) * SPACING / 8.0;
    float nearest = floor(x / SPACING + 0.5);
    float side = x >= nearest * SPACING ? 1.0 : -1.0;
    for (int k = 0; k < 2; k++) {
      if (k >= uColumns) break;
      float column = nearest + side * float(k);
      float across = (x - column * SPACING) / scale;
      uint seed = scramble(uint(int(column) + 65536) + uint(layer) * 0x9e3779b9u);
      uint next = scramble(seed);
      float hue = unit(seed >> 16);
      float delta = theta - uPhase * (1.0 + floor(unit(seed) * 16.0) / 16.0) - unit(next) * period;
      delta -= period * floor(delta / period + 0.5);
      float ahead = delta * along - across * skew;
      if (abs(ahead) > headReach && (delta > 0.0 || -delta * uTail > 3.2)) continue;
      float behind = max(-delta, 0.0);
      float fall = exp(-uTail * behind) * (1.0 - smoothstep(0.5, 0.95, behind / (0.5 * period)));
      fall *= 1.0 - smoothstep(1.2, 3.2, uTail * behind);
      float reach = length(vec2(across, ahead));
      float trail = stroke(ahead > 0.0 ? reach : abs(across), halfWidth * mix(0.4, 1.0, fall)) * fall;
      float glint = orb(reach, headRadius) * mix(3.0, 1.8, uLightMode);
      float weight = mix(1.5, 1.0 + sin(uTwinkleClock + 7.0 * hue + 4.0), uTwinkle);
      weight *= 1.0 - smoothstep(0.72 * edge, edge, abs(across) / spacing);
      vec3 color = uColors[min(int(hue * float(count)), count - 1)];
      vec3 hot = mix(color, vec3(1.0), uHead * (1.0 - uLightMode));
      total += (trail * color + glint * hot) * weight;
    }
  }

  outColor = vec4(total * fog * boost * detail * uEncode, 1.0);
}`,nt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uTexel;
uniform float uLimit;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec3 color = texture(uSource, uv - uTexel).rgb;
  color += texture(uSource, uv + uTexel).rgb;
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y)).rgb;
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y)).rgb;
  outColor = vec4(min(color * 0.25, vec3(uLimit)), 1.0);
}`,at=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uStep;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec3 color = texture(uSource, uv).rgb * 0.181862;
  color += (texture(uSource, uv + uStep * 1.423135).rgb + texture(uSource, uv - uStep * 1.423135).rgb) * 0.284316;
  color += (texture(uSource, uv + uStep * 3.326702).rgb + texture(uSource, uv - uStep * 3.326702).rgb) * 0.106598;
  color += (texture(uSource, uv + uStep * 5.242989).rgb + texture(uSource, uv - uStep * 5.242989).rgb) * 0.018156;
  outColor = vec4(color, 1.0);
}`,it=`#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uBloom0;
uniform sampler2D uBloom1;
uniform sampler2D uBloom2;
uniform sampler2D uBloom3;
uniform vec2 uView;
uniform float uDecode;
uniform float uGlow;
uniform float uBloom;
uniform float uPresence;
uniform float uOpacity;
uniform float uFade;
uniform float uLightMode;
uniform vec3 uTopColor;
uniform float uTopGlow;
out vec4 outColor;

float smootherstep01(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uView;
  vec3 light = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb;
  if (uBloom > 0.0) {
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;
    halo += texture(uBloom1, uv).rgb * 0.3;
    halo += texture(uBloom2, uv).rgb * 0.18;
    halo += texture(uBloom3, uv).rgb * 0.1;
    light += halo * uBloom * (uLightMode > 0.5 ? 0.2 : 1.0);
  }
  light *= uDecode * uGlow * uPresence;

  if (uLightMode < 0.5 && uTopGlow > 0.0) {
    float aspect = uView.x / uView.y;
    vec2 q = vec2((uv.x - 0.5) * aspect, 1.04 - uv.y);
    float spread = 0.34 * max(aspect, 0.75);
    float core = exp(-q.x * q.x / (spread * spread) - q.y * q.y / 0.06);
    float halo = exp(-q.x * q.x / (3.6 * spread * spread) - q.y * q.y / 0.18);
    light += uTopColor * uTopGlow * (core * 0.85 + halo * 0.3) * uPresence;
  }

  vec3 lit = max(light, 0.0);
  vec3 mapped = sqrt(1.0 - exp(-1.3 * lit * lit / (lit + 0.025)));
  float peak = max(mapped.r, max(mapped.g, mapped.b));

  float mask = uOpacity;
  float edge = uFade * 0.5;
  if (edge > 0.0) {
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);
  }
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;

  if (uLightMode > 0.5) {
    float coverage = clamp(smoothstep(0.0, 0.5, peak) * mask * 0.94 + grain, 0.0, 1.0);
    vec3 chroma = sqrt(clamp(lit / max(max(lit.r, max(lit.g, lit.b)), 1e-6), 0.0, 1.0));
    chroma = pow(chroma, vec3(1.35));
    chroma /= max(max(chroma.r, max(chroma.g, chroma.b)), 1e-4);
    float saturation = 1.0 - min(chroma.r, min(chroma.g, chroma.b));
    chroma = mix(vec3(0.3), chroma, smoothstep(0.08, 0.35, saturation));
    outColor = vec4(chroma * coverage, coverage);
  } else {
    vec3 color = clamp(mapped + grain, 0.0, 1.0) * mask;
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`,ut=2.6,st=9,fe=Math.PI*2,F=(n,E,g)=>Math.min(g,Math.max(E,n)),Fe=(n,E,g)=>{const d=n.createShader(E);return d?(n.shaderSource(d,g),n.compileShader(d),n.getShaderParameter(d,n.COMPILE_STATUS)?d:(n.deleteShader(d),null)):null},Z=(n,E)=>{const g=Fe(n,n.VERTEX_SHADER,ot),d=Fe(n,n.FRAGMENT_SHADER,E),l=n.createProgram();if(!g||!d||!l)return null;if(n.attachShader(l,g),n.attachShader(l,d),n.bindAttribLocation(l,0,"aPosition"),n.linkProgram(l),n.deleteShader(g),n.deleteShader(d),!n.getProgramParameter(l,n.LINK_STATUS))return n.deleteProgram(l),null;const W={},K=n.getProgramParameter(l,n.ACTIVE_UNIFORMS);for(let D=0;D<K;D++){const X=n.getActiveUniform(l,D);X&&(W[X.name.replace(/\[0\]$/,"")]=n.getUniformLocation(l,X.name))}return{program:l,uniforms:W}},dt=({colors:n=["#ffffff"],backgroundColor:E="#94a3b8",speed:g=.3,streakCount:d=2,streakWidth:l=.8,streakLength:W=1,glow:K=1,density:D=.6,twinkle:X=.3,zoom:De=3,backgroundGlow:Xe=.1,headGlow:Ie=.6,depth:Ge=.5,bloom:Ue=.35,opacity:Be=1,mouseInteraction:Ne=!0,mouseStrength:Oe=.4,mouseRadius:We=.45,mouseDampening:Ve=.15,lens:Ye=.5,holdToWarp:ze=!0,intro:He=!0,fade:qe=0,lightMode:je=!1,mixBlendMode:me,paused:$e=!1,dpr:Ze,className:de="",style:Ke})=>{const he=M.useRef(null),xe=M.useRef(null),J=M.useRef(null),T=M.useRef(null),[Je,Qe]=M.useState(0);return T.current={colors:(Array.isArray(n)&&n.length?n:["#ffffff"]).slice(0,le).map(String),backgroundColor:String(E),speed:g,streakCount:Math.round(F(d,1,16)),streakWidth:Math.max(.05,l),streakLength:Math.max(.05,W),glow:Math.max(0,K),density:D,twinkle:F(X,0,1),zoom:Math.max(.1,De),backgroundGlow:Math.max(0,Xe),headGlow:F(Ie,0,1),depth:Math.max(0,Ge),bloom:Math.max(0,Ue),opacity:F(Be,0,1),mouseInteraction:Ne,mouseStrength:Math.max(0,Oe),mouseRadius:Math.max(.01,We),mouseDampening:Math.max(0,Ve),lens:F(Ye,0,1),holdToWarp:ze,intro:He,fade:F(qe,0,1),lightMode:je,paused:$e,dpr:Ze},M.useEffect(()=>{const x=he.current,f=xe.current,e=f?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!x||!f||!e)return;const pe=!!e.getExtension("EXT_color_buffer_float"),Q=Z(e,rt),ee=Z(e,nt),V=Z(e,at),te=Z(e,it);if(!Q||!ee||!V||!te)return;const ge=t=>{t.preventDefault()},ve=()=>Qe(t=>t+1);f.addEventListener("webglcontextlost",ge),f.addEventListener("webglcontextrestored",ve);const we=e.createBuffer(),oe=e.createVertexArray();e.bindVertexArray(oe),e.bindBuffer(e.ARRAY_BUFFER,we),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const et=pe?e.RGBA16F:e.RGBA8,re=pe?1:.25,ne=()=>({texture:null,framebuffer:e.createFramebuffer(),width:0,height:0}),I=ne(),Y=Array.from({length:_e},()=>[ne(),ne()]),ae=(t,o,a)=>{t.texture&&t.width===o&&t.height===a||(t.texture&&e.deleteTexture(t.texture),t.texture=e.createTexture(),t.width=o,t.height=a,e.bindTexture(e.TEXTURE_2D,t.texture),e.texStorage2D(e.TEXTURE_2D,1,et,o,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0))},G=(t,o)=>(e.bindFramebuffer(e.FRAMEBUFFER,t?t.framebuffer:null),e.viewport(0,0,t?t.width:f.width,t?t.height:f.height),e.useProgram(o.program),o.uniforms),S=(t,o)=>{e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,o)},C=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),ie=new Map,tt=t=>{if(ie.has(t))return ie.get(t);let o=[1,1,1];if(C){C.clearRect(0,0,1,1),C.fillStyle="#ffffff",C.fillStyle=t,C.fillRect(0,0,1,1);const[a,m,B]=C.getImageData(0,0,1,1).data;o=[a/255,m/255,B/255]}return ie.set(t,o),o},Ee=t=>tt(t).map(o=>o*o),U=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,ue=new Float32Array(le*3),c={x:0,y:0,inside:!1,held:!1},r={travel:0,intro:T.current.intro&&!U?0:1,mouseX:0,mouseY:0,lensX:0,lensY:0,touch:0,warp:0};let y=0,L=0,z=!0;const se=()=>{const t=$(T.current),o=f.width,a=f.height,m=Math.max(1,x.clientWidth),B=Math.max(1,x.clientHeight);e.bindVertexArray(oe),ae(I,o,a),Y.forEach((i,s)=>{const w=Math.max(1,Math.round(m/2**(s+1))),R=Math.max(1,Math.round(B/2**(s+1)));ae(i[0],w,R),ae(i[1],w,R)});const N=r.intro,q=Math.min(1,N*2.2),P=1+5*Math.pow(1-N,2)+2.5*r.warp,b=Math.max(1,Math.floor(fe*Math.max(t.density,.05)+.5)),k=fe/b,O=9+r.travel,_=t.colors.map(Ee);ue.fill(0);for(let i=0;i<le;i++)ue.set(_[Math.min(i,_.length-1)],i*3);const j=i=>(2*i-o)/o,Pe=i=>(2*i-a)/o,u=G(I,Q);if(e.uniform2f(u.uView,o,a),e.uniform1f(u.uZoom,t.zoom),e.uniform1f(u.uPhase,O%(16*k)),e.uniform1f(u.uTwinkleClock,O%fe),e.uniform1f(u.uRings,b),e.uniform3fv(u.uColors,ue),e.uniform1i(u.uColorCount,_.length),e.uniform1i(u.uStreakCount,t.streakCount),e.uniform1i(u.uColumns,t.streakWidth>1?2:1),e.uniform1f(u.uWidth,5e-4*t.streakWidth),e.uniform1f(u.uTail,19/(t.streakLength*P)),e.uniform1f(u.uTwinkle,t.twinkle),e.uniform1f(u.uHead,t.headGlow),e.uniform1f(u.uDepth,t.depth),e.uniform4f(u.uMouse,j(r.mouseX),Pe(r.mouseY),t.mouseInteraction?t.mouseStrength*r.touch:0,t.mouseRadius),e.uniform3f(u.uLens,j(r.lensX),Pe(r.lensY),t.mouseInteraction?.5*t.lens*r.touch:0),e.uniform1f(u.uLightMode,t.lightMode?1:0),e.uniform1f(u.uEncode,re),e.drawArrays(e.TRIANGLES,0,3),t.bloom>0){let i=I;Y.forEach(([s,w])=>{const R=G(s,ee);S(0,i.texture),e.uniform1i(R.uSource,0),e.uniform2f(R.uTarget,s.width,s.height),e.uniform2f(R.uTexel,1/i.width,1/i.height),e.uniform1f(R.uLimit,4*re),e.drawArrays(e.TRIANGLES,0,3);let A=G(w,V);S(0,s.texture),e.uniform1i(A.uSource,0),e.uniform2f(A.uTarget,w.width,w.height),e.uniform2f(A.uStep,1/s.width,0),e.drawArrays(e.TRIANGLES,0,3),A=G(s,V),S(0,w.texture),e.uniform1i(A.uSource,0),e.uniform2f(A.uTarget,s.width,s.height),e.uniform2f(A.uStep,0,1/w.height),e.drawArrays(e.TRIANGLES,0,3),i=s})}const h=G(null,te);S(0,I.texture),e.uniform1i(h.uScene,0),Y.forEach(([i],s)=>{S(s+1,i.texture),e.uniform1i(h[`uBloom${s}`],s+1)}),e.uniform2f(h.uView,o,a),e.uniform1f(h.uDecode,1/re),e.uniform1f(h.uGlow,t.glow),e.uniform1f(h.uBloom,t.bloom),e.uniform1f(h.uPresence,q),e.uniform1f(h.uOpacity,t.opacity),e.uniform1f(h.uFade,t.fade),e.uniform1f(h.uLightMode,t.lightMode?1:0),e.uniform3fv(h.uTopColor,Ee(t.backgroundColor)),e.uniform1f(h.uTopGlow,t.backgroundGlow),e.drawArrays(e.TRIANGLES,0,3);for(let i=_e;i>=0;i--)S(i,null)},Te=t=>{if(y=0,!z||document.hidden)return;const o=$(T.current),a=L?Math.min(.05,(t-L)/1e3):1/60;L=t,!o.intro||U?r.intro=1:r.intro<1&&(r.intro=Math.min(1,r.intro+a/ut));const m=o.holdToWarp&&c.held&&c.inside&&!U;r.warp+=((m?1:0)-r.warp)*(1-Math.exp(-a*(m?2.2:1.6)));const B=st*Math.pow(1-r.intro,2)+6*r.warp,N=!o.paused&&!U;N&&(r.travel+=a*.1*o.speed*(1+B));const q=f.width/Math.max(1,x.clientWidth),P=c.x*q,b=(x.clientHeight-c.y)*q,k=o.mouseInteraction&&c.inside&&!U;k&&r.touch<.01&&(r.mouseX=P,r.mouseY=b,r.lensX=P,r.lensY=b);const O=o.mouseDampening>0?1-Math.exp(-a/o.mouseDampening):1;r.mouseX+=(P-r.mouseX)*O,r.mouseY+=(b-r.mouseY)*O;const _=1-Math.exp(-a*6);r.lensX+=(P-r.lensX)*_,r.lensY+=(b-r.lensY)*_,r.touch+=((k?1:0)-r.touch)*(1-Math.exp(-a*(k?4:2))),se();const j=r.intro<1||r.warp>.001||Math.abs((k?1:0)-r.touch)>.002;N&&o.speed!==0||j?y=requestAnimationFrame(Te):L=0},v=()=>{!y&&z&&!document.hidden&&(y=requestAnimationFrame(Te))},ce=()=>{const t=$(T.current),o=Math.max(1,x.clientWidth),a=Math.max(1,x.clientHeight),m=Math.min(t.dpr||window.devicePixelRatio||1,2);f.width=Math.max(1,Math.round(o*m)),f.height=Math.max(1,Math.round(a*m)),se(),v()},be=t=>{const o=x.getBoundingClientRect(),a=t.clientX-o.left,m=t.clientY-o.top;return{x:a,y:m,inside:a>=0&&m>=0&&a<=o.width&&m<=o.height}},Re=t=>{const o=be(t);c.x=o.x,c.y=o.y,c.inside=o.inside,v()},Ae=t=>{const o=be(t);o.inside&&(c.x=o.x,c.y=o.y,c.inside=!0,c.held=!0,v())},H=()=>{c.held=!1,v()},Me=()=>{c.inside=!1,c.held=!1,v()},Se=()=>{L=0,v()},Ce=new ResizeObserver(ce);Ce.observe(x);const ye=new IntersectionObserver(t=>{z=t.some(o=>o.isIntersecting),z&&(L=0,v())});ye.observe(x),p(window).addEventListener("pointermove",Re,{passive:!0}),p(window).addEventListener("pointerdown",Ae,{passive:!0}),p(window).addEventListener("pointerup",H,{passive:!0}),p(window).addEventListener("pointercancel",H,{passive:!0}),p(document.documentElement).addEventListener("pointerleave",Me),document.addEventListener("visibilitychange",Se),ce();let Le=T.current.dpr;return J.current=()=>{const t=$(T.current);if(t.dpr!==Le){Le=t.dpr,ce();return}y||se(),v()},()=>{cancelAnimationFrame(y),J.current=null,f.removeEventListener("webglcontextlost",ge),f.removeEventListener("webglcontextrestored",ve),Ce.disconnect(),ye.disconnect(),p(window).removeEventListener("pointermove",Re),p(window).removeEventListener("pointerdown",Ae),p(window).removeEventListener("pointerup",H),p(window).removeEventListener("pointercancel",H),p(document.documentElement).removeEventListener("pointerleave",Me),document.removeEventListener("visibilitychange",Se),[I,...Y.flat()].forEach(t=>{t.texture&&e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer)}),[Q,ee,V,te].forEach(t=>e.deleteProgram(t.program)),e.deleteBuffer(we),e.deleteVertexArray(oe),e.isContextLost()||e.getExtension("WEBGL_lose_context")?.loseContext()}},[Je]),M.useEffect(()=>{J.current?.()}),ke.jsx("div",{ref:he,className:`lightfall-container${de?` ${de}`:""}`,style:{...me?{mixBlendMode:me}:null,...Ke},children:ke.jsx("canvas",{ref:xe,className:"lightfall-canvas","aria-hidden":"true"})})};export{dt as default};
