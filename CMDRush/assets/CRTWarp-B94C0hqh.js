import{r as _,j as We}from"./index-uEvbEw5g.js";import{b as S}from"./App-Dofw4Ib9.js";import{b as q}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Ye="crt-warp-container",je="crt-warp-canvas",He={none:0,aperture:1,shadow:2,slot:3},Ke=.56,U=1.6,ce=.8,de=Math.PI*2,Je=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Qe=`#version 300 es
precision highp float;
uniform vec2 uGrid;
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uLevels;
uniform float uDecay;
uniform float uReveal;
uniform float uRise;
uniform vec4 uSeed;
uniform sampler2D uPrevious;
out vec4 outColor;

float field(vec2 uv, float t) {
  uv = (uv - 0.5) * uFrequency + 0.5;
  float f = 0.0;
  f += 0.7 * sin(0.5 * uv.x + t / 5.0 + uSeed.x);
  f += 3.0 * sin(1.6 * uv.y + t / 5.0 + uSeed.y);
  f += sin(10.0 * (uv.y * sin(t / 2.0 + uSeed.z) + uv.x * cos(t / 5.0)) + t / 2.0);
  float cx = uv.x + 0.5 * sin(t / 2.0 + uSeed.w);
  float cy = uv.y + 0.5 * cos(t / 4.0 + uSeed.x * 0.7);
  f += 0.4 * sin(sqrt(100.0 * cx * cx + 100.0 * cy * cy + 1.0) + t);
  f += 0.9 * sin(sqrt(75.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  f -= 1.4 * sin(sqrt(256.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  f += 0.3 * sin(0.5 * uv.y + uv.x + sin(t));
  return f;
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 uv = (cell + 0.5) / uGrid;
  float s = (0.5 + 0.499 * sin(field(uv, uTime) * uAmplitude)) * mix(1.0 / uLevels, 1.0, uReveal);
  float level = floor(s * uLevels) / max(uLevels - 1.0, 1.0);
  float previous = texelFetch(uPrevious, ivec2(cell), 0).r;
  float lifted = min(level, previous + uRise);
  outColor = vec4(max(lifted, previous * uDecay - 0.004), level, 0.0, 1.0);
}`,Ze=`#version 300 es
precision highp float;
uniform sampler2D uContent;
uniform vec2 uSize;
out vec4 outColor;

void main() {
  float v = texture(uContent, gl_FragCoord.xy / uSize).r;
  outColor = vec4(v * v, 0.0, 0.0, 1.0);
}`,$e=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uSize;
uniform vec2 uDirection;
uniform float uSigma;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uSize;
  float stride = max(uSigma * 0.55, 0.5);
  float total = 0.0;
  float sum = 0.0;
  for (int i = -7; i <= 7; i++) {
    float x = float(i) * stride;
    float w = exp(-0.5 * x * x / (uSigma * uSigma));
    sum += texture(uSource, uv + uDirection * x / uSize).r * w;
    total += w;
  }
  outColor = vec4(sum / total, 0.0, 0.0, 1.0);
}`,et=`#version 300 es
precision highp float;
uniform sampler2D uContent;
uniform sampler2D uGlow;
uniform vec2 uGrid;
uniform vec2 uResolution;
uniform float uPixel;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uBackground;
uniform float uOpaque;
uniform float uLight;
uniform float uLines;
uniform float uScanline;
uniform float uCurve;
uniform float uCorners;
uniform int uMaskType;
uniform float uMask;
uniform float uBloom;
uniform float uBrightness;
uniform float uNoise;
uniform float uFlicker;
uniform float uInterference;
uniform float uVignette;
uniform float uShift;
uniform float uWarm;
uniform float uFocus;
uniform float uStatic;
uniform float uRoll;
uniform float uTear;
uniform float uGain;
uniform vec4 uMagnet;
uniform float uPurity;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 curve(vec2 uv) {
  if (uCurve <= 0.0) return uv;
  vec2 p = (uv - 0.5) * 2.0;
  float corner = uCurve / sqrt(max(uCurve * uCurve - 2.0, 0.001));
  p = uCurve * p / sqrt(max(uCurve * uCurve - dot(p, p), 0.001));
  p /= corner;
  return p * 0.5 + 0.5;
}

float lineValue(float x, float y) {
  if (x < 0.0 || x > 1.0 || y < 0.0 || y > 1.0) return 0.0;
  float cx = x * uGrid.x - 0.5;
  float c0 = floor(cx);
  int row = int(clamp(floor(y * uGrid.y), 0.0, uGrid.y - 1.0));
  float a = texelFetch(uContent, ivec2(int(clamp(c0, 0.0, uGrid.x - 1.0)), row), 0).r;
  float b = texelFetch(uContent, ivec2(int(clamp(c0 + 1.0, 0.0, uGrid.x - 1.0)), row), 0).r;
  float soft = mix(0.5, 0.14, uFocus);
  return pow(mix(a, b, smoothstep(0.5 - soft, 0.5 + soft, cx - c0)), 1.25);
}

float beam(vec2 uv) {
  float ly = uv.y * uLines - 0.5;
  float r0 = floor(ly);
  float f = ly - r0;
  float a = lineValue(uv.x, (r0 + 0.5) / uLines);
  float b = lineValue(uv.x, (r0 + 1.5) / uLines);
  float nearest = f < 0.5 ? a : b;
  float sa = mix(0.16, 0.34, sqrt(a));
  float sb = mix(0.16, 0.34, sqrt(b));
  float lit = a * exp(-0.5 * f * f / (sa * sa)) + b * exp(-0.5 * (1.0 - f) * (1.0 - f) / (sb * sb));
  return mix(nearest, lit * 1.18, uScanline * mix(0.3, 1.0, uFocus));
}

vec3 maskAt(vec2 px) {
  if (uMaskType == 0 || uMask <= 0.0) return vec3(1.0);
  float size = max(1.0, floor(uPixel + 0.5));
  vec2 q = floor(px / size);
  float low = 1.0 - uMask;
  vec3 m = vec3(low);
  float column = q.x;
  if (uMaskType == 2) column += mod(floor(q.y / 2.0), 2.0) * 1.5;
  int stripe = int(mod(floor(column), 3.0));
  if (stripe == 0) m.r = 1.0;
  else if (stripe == 1) m.g = 1.0;
  else m.b = 1.0;
  if (uMaskType == 2 && mod(q.y, 2.0) > 0.5) m *= mix(1.0, 0.72, uMask);
  if (uMaskType == 3) {
    float slot = mod(q.y + mod(floor(q.x / 3.0), 2.0) * 2.0, 4.0);
    if (slot < 1.0) m *= mix(1.0, 0.45, uMask);
  }
  return m / sqrt((1.0 + 2.0 * low) / 3.0);
}

vec3 phosphor(vec3 cov) {
  float peak = max(max(uColor.r, uColor.g), max(uColor.b, 0.001));
  vec3 weight = 1.0 - uColor / peak;
  return uColor * cov * pow(max(cov, vec3(0.0001)), 0.7 * weight);
}

void main() {
  vec2 frag = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = curve(frag);
  float shape = 1.0;
  if (uCorners > 0.0) {
    float margin = uCorners * 0.035;
    float radius = uCorners * 0.1;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 box = (0.5 - margin) * vec2(aspect, 1.0);
    vec2 q = abs(p) - box + radius;
    float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    float aa = max(fwidth(sd), 0.0005);
    shape = (1.0 - smoothstep(-aa, aa, sd)) * mix(1.0, smoothstep(0.0, 0.06, -sd), 0.35);
    uv = (uv - 0.5) / (1.0 - 2.0 * margin) + 0.5;
  }
  float rolling = step(0.0001, abs(uRoll));
  uv.y += uRoll;
  float wrapped = fract(uv.y);
  uv.y = mix(uv.y, wrapped, rolling);
  float offset = fract(uRoll);
  float reach = smoothstep(0.0, 0.08, min(offset, 1.0 - offset));
  float blank = mix(1.0, smoothstep(0.0, 0.05, wrapped) * smoothstep(1.0, 0.95, wrapped), rolling * reach);

  float line = floor(uv.y * uLines);
  float tick = floor(uTime * 30.0);
  uv.x += uTear * (sin(uv.y * 21.0 + uTime * 37.0) * 0.6 + hash(vec2(line, tick)) - 0.5) * 0.05;
  uv.x += uInterference * 0.003 * (hash(vec2(line * 0.37, floor(uTime * 24.0))) - 0.5);

  vec2 dp = (frag - uMagnet.xy) * vec2(aspect, 1.0);
  float fall = exp(-dot(dp, dp) / max(uMagnet.w * uMagnet.w, 0.0001));
  vec2 swirl = vec2(-dp.y, dp.x) / vec2(aspect, 1.0) * fall * uMagnet.z * 0.5;
  vec3 spread = mix(vec3(0.85), vec3(1.0, 0.6, 0.2), uPurity);

  vec3 level = vec3(
    beam(uv + swirl * spread.r + vec2(uShift, 0.0)),
    beam(uv + swirl * spread.g),
    beam(uv + swirl * spread.b - vec2(uShift, 0.0))
  );

  float turn = uTime * 0.35;
  vec2 axis = vec2(cos(turn), sin(turn));
  float lobe = dot(dp, axis) / max(uMagnet.w, 0.0001);
  float side = dot(dp, vec2(-axis.y, axis.x)) / max(uMagnet.w, 0.0001);
  vec3 purity = vec3(lobe, -0.35 * lobe + 0.6 * side, -lobe);
  level *= 1.0 + uPurity * fall * uMagnet.z * 0.9 * purity;

  float glow = texture(uGlow, uv).r * uBloom;
  float hum = 1.0 - uInterference * 0.24 * smoothstep(0.2, 1.0, 0.5 + 0.5 * sin((frag.y - uTime * 0.09) * 6.2831853));
  float flick = 1.0 + uFlicker * 0.1 * (hash(vec2(floor(uTime * 60.0), 7.3)) - 0.5);
  float grain = hash(gl_FragCoord.xy + fract(uTime) * 173.0) - 0.5;
  vec2 v = frag - 0.5;
  float vignette = mix(1.0, smoothstep(0.0, 1.0, clamp(1.0 - dot(v, v) * 2.0, 0.0, 1.0)), uVignette);
  float gain = uBrightness * hum * flick * vignette * blank * uGain * uWarm;

  float noise = hash(floor(gl_FragCoord.xy / (uPixel * 1.5)) + fract(uTime * 13.7) * 91.0);
  level = mix(level, vec3(noise * noise * 1.15), uStatic);
  level *= gain * (1.0 + grain * uNoise * 2.0);
  level *= maskAt(gl_FragCoord.xy);
  glow *= gain * shape * (1.0 + 0.6 * (1.0 - uFocus));
  level *= shape;

  vec3 color;
  float alpha;
  if (uLight < 0.5) {
    vec3 cov = clamp(level, 0.0, 1.0);
    vec3 light = phosphor(cov) + uColor * glow * 0.5 * (1.0 - cov);
    vec3 excess = max(level - 1.1, 0.0);
    light += (1.0 - light) * (1.0 - exp(-excess * 0.6));
    light = clamp(light, 0.0, 1.0);
    color = uBackground + light * (1.0 - uBackground);
    alpha = max(max(light.r, light.g), light.b);
    if (uOpaque < 0.5) color = light;
  } else {
    vec3 cov = clamp(level * 0.86, 0.0, 0.88);
    cov += clamp(glow * 0.12, 0.0, 0.2) * (1.0 - cov);
    color = mix(uBackground, uColor, cov);
    alpha = max(max(cov.r, cov.g), cov.b);
    if (uOpaque < 0.5) color = uColor * cov;
  }
  outColor = uOpaque > 0.5 ? vec4(color, 1.0) : vec4(color, alpha);
}`,d=(t,s,f)=>Math.min(f,Math.max(s,t)),W=t=>t*t*(3-2*t),tt=t=>t<.5?4*t*t*t:1-(-2*t+2)**3/2;let C=null;const me=(t,s)=>{if(t==="transparent")return null;if(typeof document>"u"||(C||(C=document.createElement("canvas").getContext("2d")),!C))return s;C.fillStyle="#000000",C.fillStyle=t;const f=C.fillStyle;if(f.startsWith("#")){const p=parseInt(f.slice(1),16);return[(p>>16&255)/255,(p>>8&255)/255,(p&255)/255]}const a=/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(f);return a?a[4]!==void 0&&Number(a[4])===0?null:[Number(a[1])/255,Number(a[2])/255,Number(a[3])/255]:s},ot=t=>{const s=Math.sin(t*12.9898+1.7)*43758.5453,f=Math.sin(t*78.233+4.1)*24634.6345,a=Math.sin(t*37.719+2.9)*17431.7731,p=Math.sin(t*91.113+.3)*31337.1337,m=b=>(b-Math.floor(b))*de;return t===0?[0,0,0,0]:[m(s),m(f),m(a),m(p)]},rt=t=>{if(t>=U)return[1,1,1];const s=W(d(t/U,0,1)),f=W(d(t/.6,0,1)),a=W(d((t-.15)/(U-.15),0,1));return[s,f,a]},ve=(t,s,f)=>{const a=t.createShader(s);return a?(t.shaderSource(a,f),t.compileShader(a),t.getShaderParameter(a,t.COMPILE_STATUS)?a:(t.deleteShader(a),null)):null},I=(t,s,f)=>{const a=ve(t,t.VERTEX_SHADER,Je),p=ve(t,t.FRAGMENT_SHADER,s);if(!a||!p)return null;const m=t.createProgram();if(!m)return null;if(t.attachShader(m,a),t.attachShader(m,p),t.bindAttribLocation(m,0,"aPosition"),t.linkProgram(m),t.deleteShader(a),t.deleteShader(p),!t.getProgramParameter(m,t.LINK_STATUS))return t.deleteProgram(m),null;const b={};return f.forEach(D=>{b[D]=t.getUniformLocation(m,D)}),{program:m,uniforms:b}},N=(t,s,f)=>{const a=t.createTexture();t.bindTexture(t.TEXTURE_2D,a),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,s,f,0,t.RGBA,t.UNSIGNED_BYTE,null),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE);const p=t.createFramebuffer();return t.bindFramebuffer(t.FRAMEBUFFER,p),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,a,0),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),{texture:a,framebuffer:p,width:s,height:f}},O=(t,s)=>{s&&(t.deleteTexture(s.texture),t.deleteFramebuffer(s.framebuffer))},pe=()=>typeof window<"u"&&(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1);function st({color:t="#c755f7",backgroundColor:s="#120f17",lightMode:f=!1,speed:a=.5,variation:p=0,waveAmplitude:m=.3,waveFrequency:b=2.5,levels:D=3,columns:he=80,persistence:xe=.4,curvature:Y=.25,corners:ge=0,scanlineStrength:we=.6,scanlineFrequency:Te=200,mask:Me="aperture",maskStrength:be=.3,bloom:ye=1.5,bloomRadius:Ee=1,rgbShift:Re=.003,noise:Se=.1,flicker:Ce=.15,interference:Ae=.2,vignette:ke=.3,brightness:Fe=1,intro:Pe=!0,mouseReact:Le=!0,mouseStrength:_e=.5,changeOnClick:qe=!0,dpr:De=2,fps:Ge=60,paused:Be=!1,className:Ie="",style:Ne}){const j=_.useRef(null),Oe=_.useMemo(()=>me(t,[.78,.33,.97])??[.78,.33,.97],[t]),Ue=_.useMemo(()=>me(s,[.07,.06,.09]),[s]),H={ink:Oe,paper:Ue,lightMode:f,speed:a,variation:p,amplitude:Math.max(0,m)/.28,frequency:Math.max(.01,b)/2.2,levels:d(Math.round(D),2,12),columns:d(Math.round(he),8,400),persistence:d(xe,0,.98),curve:Y>.001?1.1+.42/Y:0,corners:d(ge,0,1),scanline:d(we,0,1),lines:d(Te,20,1200),mask:He[Me]??0,maskStrength:d(be,0,1),bloom:Math.max(0,ye),bloomRadius:Math.max(.05,Ee),rgbShift:Re,noise:Math.max(0,Se),flicker:Math.max(0,Ce),interference:Math.max(0,Ae),vignette:d(ke,0,1),brightness:Math.max(0,Fe),intro:Pe,mouseReact:Le,mouseStrength:Math.max(0,_e),changeOnClick:qe,dpr:Math.max(.5,De),fps:Math.max(1,Ge),paused:Be},E=_.useRef(H);return E.current=H,_.useEffect(()=>{const y=j.current;if(!y)return;const w=document.createElement("canvas");w.className=je,y.appendChild(w);const o=w.getContext("webgl2",{alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:"high-performance"});if(!o){w.remove();return}const h=I(o,Qe,["uGrid","uTime","uAmplitude","uFrequency","uLevels","uDecay","uReveal","uRise","uSeed","uPrevious"]),A=I(o,Ze,["uContent","uSize"]),T=I(o,$e,["uSource","uSize","uDirection","uSigma"]),G=I(o,et,["uContent","uGlow","uGrid","uResolution","uPixel","uTime","uColor","uBackground","uOpaque","uLight","uLines","uScanline","uCurve","uCorners","uMaskType","uMask","uBloom","uBrightness","uNoise","uFlicker","uInterference","uVignette","uShift","uWarm","uFocus","uStatic","uRoll","uTear","uGain","uMagnet","uPurity"]);if(!h||!A||!T||!G){w.remove();return}const K=o.createVertexArray();o.bindVertexArray(K);const J=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,J),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0);const e={width:1,height:1,pixel:1,grid:[0,0],cells:[null,null],glows:[null,null],flip:0,time:0,clock:0,last:0,raf:0,visible:!1,introAt:-1,flipAt:-1,flipped:!0,channel:0,pointer:[.5,.5],magnet:[.5,.5,0,0,0],magnetGoal:0,lost:!1,quiet:0,seen:null},Xe=()=>{const r=q(E.current).columns,i=d(Math.round(r*Ke*e.height/Math.max(e.width,1)),4,300);(r!==e.grid[0]||i!==e.grid[1])&&(e.cells.forEach(M=>O(o,M)),e.cells=[N(o,r,i),N(o,r,i)],e.grid=[r,i]);const c=Math.max(1,Math.round(e.width/4)),x=Math.max(1,Math.round(e.height/4)),l=e.glows[0];(!l||l.width!==c||l.height!==x)&&(e.glows.forEach(M=>O(o,M)),e.glows=[N(o,c,x),N(o,c,x)])},Q=()=>{const n=q(E.current),r=Math.min(window.devicePixelRatio||1,n.dpr),i=Math.max(1,Math.round(y.clientWidth*r)),c=Math.max(1,Math.round(y.clientHeight*r));e.pixel=r,!(i===e.width&&c===e.height)&&(e.quiet=0,e.width=i,e.height=c,w.width=i,w.height=c)},k=(n,r,i)=>{o.bindFramebuffer(o.FRAMEBUFFER,n?n.framebuffer:null),o.viewport(0,0,r,i),o.drawArrays(o.TRIANGLES,0,3)},R=(n,r,i)=>{o.activeTexture(o.TEXTURE0+n),o.bindTexture(o.TEXTURE_2D,r),o.uniform1i(i,n)},ze=(n,r)=>{const i=q(E.current);Xe();const[c,x]=e.grid,l=ot(i.variation+e.channel),M=e.introAt<0?0:e.clock-e.introAt,[F,X,z]=i.intro&&!r?rt(M):[1,1,1],B=e.cells[e.flip],g=e.cells[1-e.flip],[v,P]=e.glows;if(!B||!g||!v||!P)return;o.useProgram(h.program),o.uniform2f(h.uniforms.uGrid,c,x),o.uniform1f(h.uniforms.uTime,e.time),o.uniform1f(h.uniforms.uAmplitude,i.amplitude),o.uniform1f(h.uniforms.uFrequency,i.frequency),o.uniform1f(h.uniforms.uLevels,i.levels),o.uniform1f(h.uniforms.uDecay,r?0:i.persistence**(n*60)),o.uniform1f(h.uniforms.uReveal,F),o.uniform1f(h.uniforms.uRise,F<1?n/.22:1),o.uniform4f(h.uniforms.uSeed,l[0],l[1],l[2],l[3]),R(0,B.texture,h.uniforms.uPrevious),k(g,c,x),e.flip=1-e.flip,o.useProgram(A.program),o.uniform2f(A.uniforms.uSize,v.width,v.height),R(0,g.texture,A.uniforms.uContent),k(v,v.width,v.height);const Ve=Math.max(.6,v.height/48*i.bloomRadius);o.useProgram(T.program),o.uniform2f(T.uniforms.uSize,v.width,v.height),o.uniform1f(T.uniforms.uSigma,Ve),o.uniform2f(T.uniforms.uDirection,1,0),R(0,v.texture,T.uniforms.uSource),k(P,P.width,P.height),o.uniform2f(T.uniforms.uDirection,0,1),R(0,P.texture,T.uniforms.uSource),k(v,v.width,v.height);let ue=0,ae=0,se=0,le=1;if(e.flipAt>=0){const L=e.clock-e.flipAt;if(!e.flipped&&L>=.22&&(e.flipped=!0,e.channel+=1),L>=ce)e.flipAt=-1;else{const fe=L/ce;ue=tt(fe),ae=Math.sin(Math.PI*d(L/.5,0,1))*.6,se=Math.sin(Math.PI*d(L/.55,0,1))*.75,le=1-.3*Math.sin(Math.PI*fe)}}o.useProgram(G.program);const u=G.uniforms;R(0,g.texture,u.uContent),R(1,v.texture,u.uGlow),o.uniform2f(u.uGrid,c,x),o.uniform2f(u.uResolution,e.width,e.height),o.uniform1f(u.uPixel,e.pixel),o.uniform1f(u.uTime,r?0:e.clock),o.uniform3f(u.uColor,i.ink[0],i.ink[1],i.ink[2]);const V=i.paper??[0,0,0];o.uniform3f(u.uBackground,V[0],V[1],V[2]),o.uniform1f(u.uOpaque,i.paper?1:0),o.uniform1f(u.uLight,i.lightMode?1:0),o.uniform1f(u.uLines,i.lines),o.uniform1f(u.uScanline,i.scanline),o.uniform1f(u.uCurve,i.curve),o.uniform1f(u.uCorners,i.corners),o.uniform1i(u.uMaskType,i.mask),o.uniform1f(u.uMask,i.maskStrength),o.uniform1f(u.uBloom,i.bloom),o.uniform1f(u.uBrightness,i.brightness),o.uniform1f(u.uNoise,i.noise),o.uniform1f(u.uFlicker,r?0:i.flicker),o.uniform1f(u.uInterference,i.interference),o.uniform1f(u.uVignette,i.vignette),o.uniform1f(u.uShift,i.rgbShift),o.uniform1f(u.uWarm,X),o.uniform1f(u.uFocus,z),o.uniform1f(u.uStatic,se),o.uniform1f(u.uRoll,ue),o.uniform1f(u.uTear,ae),o.uniform1f(u.uGain,le),o.uniform4f(u.uMagnet,e.magnet[0],1-e.magnet[1],e.magnet[4]*i.mouseStrength*2,.24),o.uniform1f(u.uPurity,i.mask>0?1:0),k(null,e.width,e.height)},Z=n=>{if(e.raf=requestAnimationFrame(Z),!e.visible||document.hidden||e.lost){e.last=n;return}const r=q(E.current),i=1e3/r.fps;if(e.last&&n-e.last<i-1)return;const c=e.last?Math.min((n-e.last)/1e3,.1):1/60;e.last=n;const x=pe();e.clock+=c,e.introAt<0&&(e.introAt=e.clock),!r.paused&&!x&&(e.time+=c*r.speed);const l=e.magnet,M=de/.3;for(let g=0;g<2;g++){const v=-M*M*(l[g]-e.pointer[g])-2*M*l[2+g];l[2+g]+=v*c,l[g]+=l[2+g]*c}const F=r.mouseReact&&!x?e.magnetGoal:0;l[4]+=(F-l[4])*(1-Math.exp(-c/.18));const X=r.paused||x,z=Math.abs(l[4]-F)>.002||l[4]>.002&&(Math.abs(l[2])+Math.abs(l[3])>5e-4||Math.abs(l[0]-e.pointer[0])>5e-4),B=e.flipAt>=0||r.intro&&!x&&e.clock-e.introAt<U||z;e.seen!==r||B||!X?e.quiet=0:e.quiet+=1,e.seen=r,!(e.quiet>90)&&(Q(),ze(c,x))},$=n=>{const r=y.getBoundingClientRect();return{x:(n.clientX-r.left)/Math.max(r.width,1),y:(n.clientY-r.top)/Math.max(r.height,1),inside:n.clientX>=r.left&&n.clientX<=r.right&&n.clientY>=r.top&&n.clientY<=r.bottom}},ee=n=>{const r=$(n);r.inside&&(e.magnetGoal===0&&e.magnet[4]<.02&&(e.magnet[0]=r.x,e.magnet[1]=r.y,e.magnet[2]=0,e.magnet[3]=0),e.pointer=[r.x,r.y]),e.magnetGoal=r.inside?1:0},te=()=>{e.magnetGoal=0},oe=n=>{if(!(!q(E.current).changeOnClick||n.button!==0||n.target instanceof Element&&n.target.closest('a, button, input, textarea, select, label, [role="button"]')||!$(n).inside)){if(pe()){e.channel+=1;return}e.flipAt>=0||(e.flipAt=e.clock,e.flipped=!1)}},re=n=>{n.preventDefault(),e.lost=!0},ie=new IntersectionObserver(n=>{e.visible=n.some(r=>r.isIntersecting)});ie.observe(y);const ne=new ResizeObserver(()=>{e.quiet=0});return ne.observe(y),Q(),S(window).addEventListener("pointermove",ee,{passive:!0}),S(window).addEventListener("pointerdown",oe),S(document.documentElement).addEventListener("pointerleave",te),w.addEventListener("webglcontextlost",re),e.raf=requestAnimationFrame(Z),()=>{cancelAnimationFrame(e.raf),ie.disconnect(),ne.disconnect(),S(window).removeEventListener("pointermove",ee),S(window).removeEventListener("pointerdown",oe),S(document.documentElement).removeEventListener("pointerleave",te),w.removeEventListener("webglcontextlost",re),e.cells.forEach(n=>O(o,n)),e.glows.forEach(n=>O(o,n)),[h,A,T,G].forEach(n=>o.deleteProgram(n.program)),o.deleteBuffer(J),o.deleteVertexArray(K),o.getExtension("WEBGL_lose_context")?.loseContext(),w.remove()}},[]),We.jsx("div",{ref:j,className:[Ye,Ie].filter(Boolean).join(" "),style:Ne})}export{st as default};
