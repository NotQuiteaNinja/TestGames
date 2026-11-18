import{r as O,j as Ue}from"./index-uEvbEw5g.js";import{b as N}from"./App-Dofw4Ib9.js";import{b as Q}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const ke=2400,de=5,Z=2.6,j=7.5,Ve=.56,ve=24,mt={focus:0,part:1,none:2},ht={dots:0,dashes:.45,lines:1},dt={depth:0,along:1,across:2},pt=[0,.75,.35],Ie=[[0,0,0,0],[1.9,-4.6,-.08,2.4],[-1.05,2,.12,4.1]],vt=[1,.5,.55],xt=Math.PI/180,gt=1/(2*Math.tan(Ve/2)),P=`#version 300 es
precision highp float;
`,wt=`
uniform float uTime;
uniform float uTwist;
uniform float uRoll;
uniform float uWaves;
uniform float uWidth;
uniform float uRibbon;
uniform mat3 uOrient;
uniform float uScale;
uniform vec4 uPlace;
uniform float uVolume;

float hash11(float n) {
  return fract(sin(n * 91.3458) * 47453.5453);
}

vec3 centerLocal(float s) {
  float t = uTime;
  float ph = uPlace.w;
  float x = s * ${ve.toFixed(1)};
  float y = uWaves * (0.52 * sin(x * 0.43 + t * 0.31 + ph) + 0.26 * sin(x * 0.79 - t * 0.23 + 1.3 + ph * 0.7)) + uPlace.x + x * uPlace.z;
  float z = uWaves * 0.65 * sin(x * 0.33 + t * 0.19 + 0.7 + ph * 1.3) + uPlace.y;
  return vec3(x, y, z);
}

float twistAt(float s, float layer) {
  float x = s * ${ve.toFixed(1)};
  return uTwist * 0.483 * x + uRoll + uPlace.w * 0.6 + layer * uVolume * 0.42 + 0.5 * sin(x * 0.26 + uTime * 0.27 + uPlace.w);
}

vec3 ribbonPoint(float s, float v, float n, float layer, out vec3 normal) {
  vec3 c0 = centerLocal(s);
  vec3 c1 = centerLocal(s + 0.004);
  vec3 tangent = normalize(c1 - c0);
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 n0 = normalize(up - tangent * dot(up, tangent));
  vec3 b0 = cross(tangent, n0);
  float th = twistAt(s, layer);
  vec3 across = cos(th) * n0 + sin(th) * b0;
  vec3 sheet = -sin(th) * n0 + cos(th) * b0;
  float halfWidth = uWidth * (0.78 + 0.22 * cos(s * 3.14159));
  vec3 local = c0 + across * v * halfWidth + sheet * (n + layer * uVolume * 0.16) * halfWidth;
  normal = uOrient * sheet;
  return uOrient * (local * uScale);
}
`,bt=`${P}
${wt}
uniform mat4 uViewProj;
uniform vec3 uEye;
uniform vec2 uViewport;
uniform float uDpr;
uniform float uFibers;
uniform float uDots;
uniform float uFlow;
uniform float uSize;
uniform float uFocus;
uniform float uDof;
uniform float uMaxCoc;
uniform float uFocal;
uniform float uIntro;
uniform vec4 uPulse;
uniform vec4 uHover;
uniform float uPart;
uniform float uDotLength;
uniform float uSparkle;
uniform float uDepthSpread;
uniform float uGain;
uniform float uTips;
uniform float uTint;
uniform float uGradient;
uniform float uFold;

out vec2 vLocal;
out float vRadius;
out float vSegment;
out vec3 vLight;
out float vTint;

vec3 project(vec3 world, out float depth) {
  vec4 clip = uViewProj * vec4(world, 1.0);
  depth = clip.w;
  vec2 ndc = clip.xy / clip.w;
  return vec3((ndc * 0.5 + 0.5) * uViewport, clip.w);
}

vec2 part(vec2 px) {
  if (uPart <= 0.0 || uHover.w <= 0.0) return px;
  vec2 away = px - uHover.xy;
  float dist = length(away);
  float radius = uHover.z;
  float push = uPart * uHover.w * radius * 0.55 * exp(-dist * dist / (radius * radius));
  return px + away / max(dist, 1e-3) * push * smoothstep(0.0, radius * 0.25, dist);
}

void main() {
  int perFiber = int(uDots);
  int fiber = gl_InstanceID / perFiber;
  int bead = gl_InstanceID - fiber * perFiber;
  float fi = float(fiber);
  float fk = float(bead);

  float seed = hash11(fi * 1.731 + uRibbon * 17.0);
  float s = fract((fk + uFlow + seed * uDots) / uDots) - 0.5;
  float sNext = s + 1.0 / uDots;
  float layer = mod(fi, 3.0) - 1.0;
  float slot = floor(fi / 3.0);
  float perLayer = max(floor(uFibers / 3.0), 1.0);
  float v = ((slot + 0.5) / perLayer) * 2.0 - 1.0 + (hash11(fi * 3.113 + 4.0) - 0.5) * (1.6 / perLayer) + layer * 0.12 / perLayer;
  float depthOffset = (hash11(fi * 7.919 + 2.0) - 0.5) * uDepthSpread * (0.35 + 6.0 * s * s);

  vec3 normal;
  vec3 world = ribbonPoint(s, v, depthOffset, layer, normal);
  vec3 nextNormal;
  vec3 nextWorld = ribbonPoint(sNext, v, depthOffset, layer, nextNormal);

  float depth;
  vec3 p0 = project(world, depth);
  float nextDepth;
  vec3 p1 = project(nextWorld, nextDepth);
  vec2 px = part(p0.xy);
  vec2 pxNext = part(p1.xy);

  float baseRadius = max(0.5 * uSize * uDpr * uFocal / max(depth, 0.1), 0.45);
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr);
  float radius = baseRadius + coc;
  float spill = max(10.0 * uDpr, baseRadius);
  float energy = pow(baseRadius / min(radius, spill), 1.25) * pow(min(1.0, spill / radius), 2.0);

  vec3 toEye = normalize(uEye - world);
  float facing = abs(dot(normalize(normal), toEye));
  float focalPx = uViewport.y * ${gt.toFixed(5)} / max(depth, 0.1);
  float widthPx = 2.0 * uWidth * uScale * focalPx;
  float stack = (widthPx * facing + 2.0 * baseRadius) / (widthPx + 2.0 * baseRadius);
  float spacingFace = length(nextWorld - world) * focalPx;
  float trail = (length(p1.xy - p0.xy) + 2.0 * baseRadius) / (spacingFace + 2.0 * baseRadius);
  float crowd = sqrt(clamp(stack * trail, 0.002, 1.0));
  float fold = pow(1.0 - facing, 6.0) * uFold;
  float endFade = smoothstep(0.5, 0.4, abs(s)) * smoothstep(1.6, 4.2, depth);
  float tipEnd = mix(0.6, 0.06 + 0.26 * hash11(fi * 9.137 + uPlace.w * 3.0), uTips);
  float tip = exp(-pow((s - tipEnd) / 0.0065, 2.0)) * uTips;
  endFade *= smoothstep(tipEnd + 0.003, tipEnd - 0.001, s);
  float appear = smoothstep(0.0, 0.12, uIntro * 1.3 - (s + 0.5) - seed * 0.12);
  float twinklePhase = hash11(fi * 13.7 + fk * 0.917 + uRibbon * 3.0);
  float twinkle = pow(max(sin(uTime * (1.2 + 2.6 * twinklePhase) * 3.0 + twinklePhase * 61.0), 0.0), 36.0) * uSparkle * (1.0 - 0.85 * uDotLength);
  float pulseGap = abs(s - uPulse.x) - uPulse.y * 0.42;
  float pulse = uPulse.z * exp(-pulseGap * pulseGap / 0.0018) * (abs(uPulse.w - uRibbon) < 0.5 ? 1.0 : 0.35);
  float strength = mix(0.45, 1.0, hash11(fi * 5.37 + 1.0)) * mix(1.0, 0.72, abs(layer) * uVolume);
  float intensity = energy * crowd * strength * endFade * appear * 0.8 * uGain * (1.0 + fold * 7.0 + twinkle * 5.0 + pulse * 4.0 + tip * 7.0);
  float highlight = clamp(fold * 0.55 + twinkle + pulse + tip, 0.0, 1.0);

  vec2 segment = (pxNext - px) * uDotLength;
  float segmentLength = length(segment);
  intensity *= mix(1.0, (2.0 * radius) / (segmentLength + 2.0 * radius) * 1.6, uDotLength);
  vec2 axis = segmentLength > 1e-3 ? segment / segmentLength : vec2(1.0, 0.0);
  vec2 perp = vec2(-axis.y, axis.x);
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0);
  float along = mix(-radius, segmentLength + radius, corner.x);
  float across = mix(-radius, radius, corner.y);
  vec2 position = px + axis * along + perp * across;

  vLocal = vec2(along, across);
  vRadius = radius;
  vSegment = segmentLength;
  vLight = vec3(intensity, highlight, coc / max(radius, 1e-3));
  float depthTint = clamp(uTint + smoothstep(uFocus, uFocus + 5.0, depth) * 0.5, 0.0, 1.0);
  vTint = uGradient < 0.5 ? depthTint : uGradient < 1.5 ? smoothstep(-0.42, 0.42, s) : clamp(v * 0.5 + 0.5, 0.0, 1.0);
  if (intensity < 0.0005) position = vec2(-1e4);
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);
}`,yt=`${P}
uniform mat4 uViewProj;
uniform vec2 uViewport;
uniform float uDpr;
uniform float uTime;
uniform float uSize;
uniform float uFocus;
uniform float uDof;
uniform float uMaxCoc;
uniform float uFocal;
uniform float uIntro;
uniform float uSparkle;
uniform float uScale;
uniform float uGradient;
uniform float uGain;

out vec2 vLocal;
out float vRadius;
out float vSegment;
out vec3 vLight;
out float vTint;

float hash11(float n) {
  return fract(sin(n * 91.3458) * 47453.5453);
}

void main() {
  float id = float(gl_InstanceID);
  vec3 seed = vec3(hash11(id * 1.37 + 0.3), hash11(id * 2.91 + 1.7), hash11(id * 4.17 + 2.9));
  vec3 box = vec3(9.0, 5.4, 6.0);
  vec3 p = (seed - 0.5) * box;
  p.z -= 0.6;
  p += 0.18 * vec3(sin(uTime * 0.21 + seed.x * 40.0), sin(uTime * 0.17 + seed.y * 40.0), sin(uTime * 0.13 + seed.z * 40.0));
  p *= mix(1.0, uScale, 0.5);
  vec4 clip = uViewProj * vec4(p, 1.0);
  float depth = clip.w;
  vec2 px = (clip.xy / clip.w * 0.5 + 0.5) * uViewport;
  float size = uSize * mix(0.5, 1.4, hash11(id * 7.7));
  float baseRadius = max(0.5 * size * uDpr * uFocal / max(depth, 0.1), 0.45);
  float coc = min(uDof * abs(1.0 - uFocus / max(depth, 0.1)) * uViewport.y * 0.035, uMaxCoc * uDpr * 1.6);
  float radius = baseRadius + coc;
  float spill = max(10.0 * uDpr, baseRadius);
  float energy = pow(baseRadius / min(radius, spill), 0.9) * pow(min(1.0, spill / radius), 2.0);
  float twinkle = pow(max(sin(uTime * (0.8 + 1.6 * seed.y) * 2.0 + seed.z * 50.0), 0.0), 8.0);
  float intensity = energy * (0.35 + 0.65 * twinkle) * mix(0.4, 1.0, seed.x) * smoothstep(0.3, 1.0, uIntro) * (depth > 0.2 ? 1.0 : 0.0);
  vec2 corner = vec2(gl_VertexID == 1 || gl_VertexID == 3 ? 1.0 : 0.0, gl_VertexID >= 2 ? 1.0 : 0.0) * 2.0 - 1.0;
  vec2 position = px + corner * radius;
  vLocal = corner * radius;
  vRadius = radius;
  vSegment = 0.0;
  vLight = vec3(intensity * 0.8 * uGain, 0.3 + 0.6 * twinkle * uSparkle, coc / max(radius, 1e-3));
  vTint = uGradient < 0.5 ? 0.45 + 0.55 * seed.y : seed.y;
  gl_Position = vec4(position / uViewport * 2.0 - 1.0, 0.0, 1.0);
}`,Ae=`${P}
uniform vec3 uGlowColor;
uniform vec3 uLineColor;
uniform vec3 uSecondaryColor;
in vec2 vLocal;
in float vRadius;
in float vSegment;
in vec3 vLight;
in float vTint;
out vec4 outColor;
void main() {
  float along = clamp(vLocal.x, 0.0, vSegment);
  float d = length(vec2(vLocal.x - along, vLocal.y));
  float rho = d / max(vRadius, 1e-3);
  if (rho > 1.0) discard;
  float soft = clamp(2.6 / max(vRadius, 1e-3), 0.14, 1.0);
  float disk = 1.0 - smoothstep(1.0 - soft, 1.0, rho);
  float bokeh = disk * (0.94 + 0.08 * smoothstep(0.55, 0.95, rho));
  float core = exp(-rho * rho * 3.2);
  float shape = mix(core, bokeh, smoothstep(0.25, 0.7, vLight.z));
  vec3 color = mix(mix(uGlowColor, uSecondaryColor, vTint), uLineColor, vLight.y);
  outColor = vec4(color * shape * vLight.x, shape * vLight.x);
}`,ee=`${P}
out vec2 vUv;
void main() {
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`,Tt=`${P}
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 outColor;
vec3 pick(vec2 uv) {
  vec3 c = texture(uSource, uv).rgb;
  float peak = max(max(c.r, c.g), c.b);
  return c * smoothstep(0.35, 1.2, peak);
}
void main() {
  vec2 o = uTexel;
  vec3 c = pick(vUv + vec2(-o.x, -o.y)) + pick(vUv + vec2(o.x, -o.y)) + pick(vUv + vec2(-o.x, o.y)) + pick(vUv + vec2(o.x, o.y));
  outColor = vec4(c * 0.25, 1.0);
}`,Et=`${P}
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec2 o = uTexel;
  vec3 c = texture(uSource, vUv).rgb * 4.0;
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb;
  outColor = vec4(c / 8.0, 1.0);
}`,Rt=`${P}
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec2 o = uTexel;
  vec3 c = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;
  c += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;
  c += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;
  c += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;
  c += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;
  c += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;
  c += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;
  c += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;
  outColor = vec4(c / 12.0, 1.0);
}`,St=`${P}
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uGlow;
uniform float uBrightness;
uniform float uLightMode;
uniform float uGrain;
uniform float uVignette;
uniform float uFrame;
uniform vec2 uView;
uniform float uDpr;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

void main() {
  vec4 scene = texture(uScene, vUv);
  vec3 bloom = texture(uBloom, vUv).rgb;
  vec3 light = (scene.rgb + bloom * uGlow) * uBrightness;
  float reach = max(uVignette * 0.3, 1e-4);
  float mask = uVignette > 0.0 ? smoother(vUv.x / reach) * smoother((1.0 - vUv.x) / reach) * smoother(vUv.y / reach) * smoother((1.0 - vUv.y) / reach) : 1.0;
  vec2 cell = floor(vUv * uView / max(uDpr, 1.0));
  float grain = hash(cell + uFrame * 17.31) + hash(cell * 1.31 + uFrame * 3.7 + 9.1) - 1.0;
  if (uLightMode > 0.5) {
    float amount = scene.a * uBrightness;
    float ink = (1.0 - exp(-amount * 1.5)) * mask;
    ink = clamp(ink * (1.0 + grain * uGrain * 2.0), 0.0, 1.0);
    vec3 hue = clamp(scene.rgb / max(scene.a, 1e-4), 0.0, 1.0);
    vec3 tone = hue * mix(1.0, 0.72, clamp(amount * 0.35, 0.0, 1.0));
    outColor = vec4(tone * ink, ink);
    return;
  }
  vec3 color = (1.0 - exp(-light * 1.25)) * mask;
  float peak = max(color.r, max(color.g, color.b));
  color = max(color + grain * uGrain * (0.25 + 0.75 * sqrt(peak)), 0.0);
  outColor = vec4(color, max(color.r, max(color.g, color.b)));
}`,Mt=["uTime","uTwist","uRoll","uWaves","uWidth","uRibbon","uOrient","uScale","uPlace","uVolume"],Ft=[...Mt,"uViewProj","uEye","uViewport","uDpr","uFibers","uDots","uFlow","uSize","uFocus","uDof","uMaxCoc","uFocal","uIntro","uPulse","uHover","uPart","uDotLength","uSparkle","uDepthSpread","uGain","uTips","uTint","uGradient","uFold","uGlowColor","uLineColor","uSecondaryColor"],Dt=["uViewProj","uViewport","uDpr","uTime","uSize","uFocus","uDof","uMaxCoc","uFocal","uIntro","uSparkle","uScale","uGradient","uGain","uGlowColor","uLineColor","uSecondaryColor"],pe=["uSource","uTexel"],Lt=["uScene","uBloom","uGlow","uBrightness","uLightMode","uGrain","uVignette","uFrame","uView","uDpr"],g=(a,f,x)=>Math.min(x,Math.max(f,a)),Ge=(a,f,x)=>{const h=a.createShader(f);return h?(a.shaderSource(h,x),a.compileShader(h),a.getShaderParameter(h,a.COMPILE_STATUS)?h:(a.deleteShader(h),null)):null},B=(a,f,x,h)=>{const v=Ge(a,a.VERTEX_SHADER,f),E=Ge(a,a.FRAGMENT_SHADER,x),b=a.createProgram();if(!v||!E||!b)return null;if(a.attachShader(b,v),a.attachShader(b,E),a.linkProgram(b),a.deleteShader(v),a.deleteShader(E),!a.getProgramParameter(b,a.LINK_STATUS))return a.deleteProgram(b),null;const _={};for(const C of h)_[C]=a.getUniformLocation(b,C);return{program:b,uniforms:_}},Pt=(a,f,x,h)=>{const v=1/Math.tan(a/2),E=1/(x-h);return[v/f,0,0,0,0,v,0,0,0,0,(h+x)*E,-1,0,0,2*h*x*E,0]},_t=(a,f)=>{const x=new Array(16);for(let h=0;h<4;h+=1)for(let v=0;v<4;v+=1)x[h*4+v]=a[v]*f[h*4]+a[4+v]*f[h*4+1]+a[8+v]*f[h*4+2]+a[12+v]*f[h*4+3];return x},Ct=(a,f,x)=>{const h=Math.cos(a),v=Math.sin(a),E=Math.cos(f),b=Math.sin(f),_=Math.cos(x),C=Math.sin(x),te=[h,0,-v,0,1,0,v,0,h],oe=[1,0,0,0,E,b,0,-b,E],re=[_,C,0,-C,_,0,0,0,1],$=(z,X)=>{const H=new Array(9);for(let F=0;F<3;F+=1)for(let D=0;D<3;D+=1)H[F*3+D]=z[D]*X[F*3]+z[3+D]*X[F*3+1]+z[6+D]*X[F*3+2];return H};return $(re,$(oe,te))},Ut=(a,f)=>[a[0]*f[0]+a[3]*f[1]+a[6]*f[2],a[1]*f[0]+a[4]*f[1]+a[7]*f[2],a[2]*f[0]+a[5]*f[1]+a[8]*f[2]],Vt=({glowColor:a="#8b5cf6",lineColor:f,secondaryColor:x,gradient:h="depth",speed:v=.5,scale:E=1,rotation:b=18,rollSpeed:_=.15,layers:C=3,waves:te=1,twist:oe=1.2,threads:re=72,volume:$=.7,spread:z=1,density:X=1,thickness:H=1,flow:F=.4,fiberStyle:D="dots",tips:Oe=0,foldGlow:Ne=1,perspective:Be=.65,depthOfField:ze=.85,focusDepth:Xe=0,particles:We=.5,sparkle:je=.5,glow:$e=.8,brightness:He=1,vignette:qe=.3,grain:Ke=.06,mouseInteraction:Ye=!0,hoverEffect:Je="focus",mouseStrength:Qe=1,pulseOnClick:Ze=!0,intro:et=!0,lightMode:tt=!1,paused:ot=!1,dpr:rt,...nt})=>{const xe=O.useRef(null),ge=O.useRef(null),ne=O.useRef(null),we={glowColor:String(a),lineColor:f?String(f):"",secondaryColor:x?String(x):"",gradient:dt[h]??0,speed:Math.max(0,v),scale:g(E,.3,3),rotation:b*xt,rollSpeed:_,layers:g(Math.round(C),1,3),waves:Math.max(0,te),twist:Math.max(0,oe),threads:g(Math.round(re),6,180),volume:g($,0,2),spread:g(z,.2,3),density:g(X,.2,3),thickness:g(H,.2,4),flow:F,dotLength:ht[D]??0,tips:g(Oe,0,1),foldGlow:g(Ne,0,3),perspective:g(Be,0,1),depthOfField:g(ze,0,2),focusDepth:g(Xe,-1,1),particles:g(We,0,2),sparkle:g(je,0,2),glow:Math.max(0,$e),brightness:Math.max(0,He),vignette:g(qe,0,1),grain:Math.max(0,Ke),mouseInteraction:Ye,hover:mt[Je]??0,mouseStrength:Math.max(0,Qe),pulseOnClick:Ze,intro:et,lightMode:tt,paused:ot,dpr:rt},U=O.useRef(we);U.current=we,O.useEffect(()=>{const k=xe.current,p=ge.current,e=p?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!k||!p||!e)return;const at=!!e.getExtension("EXT_color_buffer_float"),q=B(e,bt,Ae,Ft),K=B(e,yt,Ae,Dt),ie=B(e,ee,Tt,pe),ae=B(e,ee,Et,pe),ue=B(e,ee,Rt,pe),Y=B(e,ee,St,Lt);if(!q||!K||!ie||!ae||!ue||!Y)return;const ut=at?e.RGBA16F:e.RGBA8,ye=()=>({texture:null,framebuffer:e.createFramebuffer(),width:0,height:0}),Te=(t,r,n)=>{if(t.texture&&t.width===r&&t.height===n)return;t.texture&&e.deleteTexture(t.texture);const i=e.createTexture();e.bindTexture(e.TEXTURE_2D,i),e.texStorage2D(e.TEXTURE_2D,1,ut,r,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0),t.texture=i,t.width=r,t.height=n},L=ye(),y=Array.from({length:de},ye),se=e.createVertexArray(),ce=document.createElement("canvas");ce.width=1,ce.height=1;const A=ce.getContext("2d",{willReadFrequently:!0}),W=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,o={time:0,roll:0,flow:0,frame:0,intro:U.current.intro&&!W?0:Z,width:1,height:1,fit:1,colorKey:"",glow:[.55,.36,.96],line:[1,.85,.98],secondary:[.44,.29,.77],pointer:{x:0,y:0,inside:!1},hover:{x:0,y:0,presence:0,placed:!1},look:{x:0,y:0,vx:0,vy:0},focus:j+U.current.focusDepth*3,pulse:{s:0,age:9,strength:0,ribbon:0},camera:null};let G=0,V=0,J=!0,le=!0;const fe=(t,r)=>{if(!A||!t)return r;const n=/^[0-9a-f]{3,8}$/i.test(t)?`#${t}`:t;A.clearRect(0,0,1,1),A.fillStyle="#000000",A.fillStyle=n,A.fillRect(0,0,1,1);const[i,m,c]=A.getImageData(0,0,1,1).data;return[i/255,m/255,c/255]},st=t=>{const r=`${t.glowColor}|${t.lineColor}|${t.secondaryColor}|${t.lightMode}`;r!==o.colorKey&&(o.colorKey=r,o.glow=fe(t.glowColor,[.55,.36,.96]),o.secondary=t.secondaryColor?fe(t.secondaryColor,o.glow):o.glow.map(n=>n*.8),t.lineColor?o.line=fe(t.lineColor,o.glow):o.line=t.lightMode?o.glow:o.glow.map(n=>n+(1-n)*.72))},ct=(t,r,n,i)=>{const m=Ie[n],c=m[3],l=t*ve,d=i*(.52*Math.sin(l*.43+r*.31+c)+.26*Math.sin(l*.79-r*.23+1.3+c*.7))+m[0]+l*m[2],T=i*.65*Math.sin(l*.33+r*.19+.7+c*1.3)+m[1];return[l,d,T]},lt=t=>{const r=o.width/Math.max(o.height,1),n=[0,0,j],i=Pt(Ve,r,.1,60),m=[1,0,0,0,0,1,0,0,0,0,1,0,-n[0],-n[1],-n[2],1],c=Ct(t.perspective*.85+o.look.x*.22,.12-o.look.y*.14,t.rotation);return{eye:n,viewProj:_t(i,m),orient:c}},ft=(t,r)=>{const n=t.viewProj,i=n[0]*r[0]+n[4]*r[1]+n[8]*r[2]+n[12],m=n[1]*r[0]+n[5]*r[1]+n[9]*r[2]+n[13],c=n[3]*r[0]+n[7]*r[1]+n[11]*r[2]+n[15];return{x:(i/c*.5+.5)*o.width,y:(.5-m/c*.5)*o.height,depth:c}},Ee=(t,r,n)=>{const i=o.camera;if(!i)return null;let m=null;for(let c=0;c<t.layers;c+=1)for(let l=0;l<=96;l+=1){const d=l/96-.5,T=ct(d,o.time,c,t.waves).map(w=>w*t.scale*o.fit),s=Ut(i.orient,T),R=ft(i,s),S=Math.hypot(R.x-r,R.y-n);(!m||S<m.gap)&&(m={gap:S,s:d,ribbon:c,depth:R.depth})}return m},Re=()=>{const t=Q(U.current),r=Math.max(1,k.clientWidth),n=Math.max(1,k.clientHeight),i=Math.min(t.dpr||window.devicePixelRatio||1,2),m=Math.max(r,n)*i,c=m>ke?i*ke/m:i,l=Math.max(1,Math.round(r*c)),d=Math.max(1,Math.round(n*c));(p.width!==l||p.height!==d)&&(p.width=l,p.height=d),o.width=r,o.height=n,o.fit=g(r/n/1.5,.6,1),he()},me=(t,r,n,i)=>{e.bindFramebuffer(e.FRAMEBUFFER,r.framebuffer),e.viewport(0,0,r.width,r.height),e.useProgram(t.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,n.texture),e.uniform1i(t.uniforms.uSource,0),e.uniform2f(t.uniforms.uTexel,i[0],i[1]),e.drawArrays(e.TRIANGLES,0,3)},he=()=>{const t=Q(U.current);st(t);const r=lt(t);o.camera=r;const n=p.height/Math.max(o.height,1),i=t.paused||W?1:g(o.intro/Z,0,1),m=1-(1-i)*(1-i)*(1-i);Te(L,p.width,p.height),e.bindVertexArray(se),e.bindFramebuffer(e.FRAMEBUFFER,L.framebuffer),e.viewport(0,0,p.width,p.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE);const c=Math.round(260*t.density),l=22*g(Math.sqrt(56e3/(t.threads*c*t.layers)),.45,1),d=Math.max(.8*t.thickness,.45)**2/.64,T=Math.pow(t.threads/72*t.density*d,-.75);e.useProgram(q.program);const s=q.uniforms;e.uniform1f(s.uTime,o.time),e.uniform1f(s.uTwist,t.twist),e.uniform1f(s.uRoll,o.roll),e.uniform1f(s.uWaves,t.waves),e.uniform1f(s.uWidth,.62*t.spread),e.uniformMatrix3fv(s.uOrient,!1,r.orient),e.uniform1f(s.uScale,t.scale*o.fit),e.uniformMatrix4fv(s.uViewProj,!1,r.viewProj),e.uniform3f(s.uEye,r.eye[0],r.eye[1],r.eye[2]),e.uniform2f(s.uViewport,p.width,p.height),e.uniform1f(s.uDpr,n),e.uniform1f(s.uFibers,t.threads),e.uniform1f(s.uDots,c),e.uniform1f(s.uFlow,o.flow),e.uniform1f(s.uSize,1.6*t.thickness),e.uniform1f(s.uFocus,o.focus),e.uniform1f(s.uDof,t.depthOfField),e.uniform1f(s.uMaxCoc,l),e.uniform1f(s.uFocal,j),e.uniform1f(s.uIntro,m),e.uniform4f(s.uPulse,o.pulse.s,o.pulse.age,o.pulse.strength,o.pulse.ribbon),e.uniform4f(s.uHover,o.hover.x*n,(o.height-o.hover.y)*n,140*n,o.hover.presence*t.mouseStrength),e.uniform1f(s.uPart,t.hover===1?1:0),e.uniform1f(s.uDotLength,t.dotLength),e.uniform1f(s.uSparkle,t.sparkle),e.uniform1f(s.uDepthSpread,.12),e.uniform1f(s.uVolume,t.volume),e.uniform3f(s.uGlowColor,o.glow[0],o.glow[1],o.glow[2]),e.uniform3f(s.uLineColor,o.line[0],o.line[1],o.line[2]),e.uniform3f(s.uSecondaryColor,o.secondary[0],o.secondary[1],o.secondary[2]),e.uniform1f(s.uTips,t.tips),e.uniform1f(s.uGradient,t.gradient),e.uniform1f(s.uFold,t.foldGlow);for(let u=0;u<t.layers;u+=1){const M=Ie[u];e.uniform1f(s.uRibbon,u),e.uniform4f(s.uPlace,M[0],M[1],M[2],M[3]),e.uniform1f(s.uGain,vt[u]*T),e.uniform1f(s.uTint,pt[u]),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,t.threads*c)}const R=Math.round(420*t.particles);if(R>0){e.useProgram(K.program);const u=K.uniforms;e.uniformMatrix4fv(u.uViewProj,!1,r.viewProj),e.uniform2f(u.uViewport,p.width,p.height),e.uniform1f(u.uDpr,n),e.uniform1f(u.uTime,o.time),e.uniform1f(u.uSize,2.2*t.thickness),e.uniform1f(u.uFocus,o.focus),e.uniform1f(u.uDof,t.depthOfField),e.uniform1f(u.uMaxCoc,22),e.uniform1f(u.uFocal,j),e.uniform1f(u.uIntro,m),e.uniform1f(u.uSparkle,t.sparkle),e.uniform1f(u.uScale,t.scale*o.fit),e.uniform1f(u.uGradient,t.gradient),e.uniform1f(u.uGain,1/t.thickness),e.uniform3f(u.uGlowColor,o.glow[0],o.glow[1],o.glow[2]),e.uniform3f(u.uLineColor,o.line[0],o.line[1],o.line[2]),e.uniform3f(u.uSecondaryColor,o.secondary[0],o.secondary[1],o.secondary[2]),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,R)}e.disable(e.BLEND);const S=t.glow>.001&&!t.lightMode;if(e.bindVertexArray(se),S){y.forEach((u,M)=>{Te(u,Math.max(1,Math.round(p.width/2**(M+1))),Math.max(1,Math.round(p.height/2**(M+1))))}),me(ie,y[0],L,[.5/L.width,.5/L.height]);for(let u=1;u<de;u+=1)me(ae,y[u],y[u-1],[1/y[u-1].width,1/y[u-1].height]);e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE);for(let u=de-1;u>0;u-=1)me(ue,y[u-1],y[u],[.5/y[u].width,.5/y[u].height]);e.disable(e.BLEND)}e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,p.width,p.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(Y.program);const w=Y.uniforms;e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,L.texture),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,S?y[0].texture:L.texture),e.uniform1i(w.uScene,0),e.uniform1i(w.uBloom,1),e.uniform1f(w.uGlow,S?t.glow:0),e.uniform1f(w.uBrightness,t.brightness),e.uniform1f(w.uLightMode,t.lightMode?1:0),e.uniform1f(w.uGrain,t.grain),e.uniform1f(w.uVignette,t.vignette),e.uniform1f(w.uFrame,o.frame%977),e.uniform2f(w.uView,p.width,p.height),e.uniform1f(w.uDpr,n),e.drawArrays(e.TRIANGLES,0,3),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,null),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,null),e.bindVertexArray(null)},Se=t=>{if(G=0,!le||!J||document.hidden)return;const r=Q(U.current),n=V?(t-V)/1e3:1/60,i=Math.min(.05,n);V=t;const m=!r.paused&&!W;m?(o.frame+=1,o.time+=i*r.speed,o.roll+=i*r.speed*r.rollSpeed,o.flow+=i*r.flow*12,o.intro+=Math.min(n,1)):o.intro<Z&&(o.intro=Z),o.pulse.age+=i,o.pulse.strength=Math.max(0,1-o.pulse.age/1.8)**2;const{pointer:c,hover:l,look:d}=o,T=r.mouseInteraction&&c.inside&&!W;T&&!l.placed&&(l.x=c.x,l.y=c.y,l.placed=!0),l.x+=(c.x-l.x)*(1-Math.exp(-i/.08)),l.y+=(c.y-l.y)*(1-Math.exp(-i/.08));const s=T?1:0;l.presence+=(s-l.presence)*(1-Math.exp(-i/(s>l.presence?.3:.6))),!T&&l.presence<.001&&(l.placed=!1);const R=T?(c.x/o.width-.5)*.5:0,S=T?(.5-c.y/o.height)*.5:0;d.vx+=(30*(R-d.x)-11*d.vx)*i,d.vy+=(30*(S-d.y)-11*d.vy)*i,d.x+=d.vx*i,d.y+=d.vy*i;const w=j+r.focusDepth*3;let u=w;if(T&&r.hover===0){const Ce=Ee(r,l.x,l.y);Ce&&(u=w+(Ce.depth-w)*l.presence*Math.min(1,r.mouseStrength))}o.focus+=(u-o.focus)*(1-Math.exp(-i/.35)),he();const M=Math.abs(s-l.presence)>.002||Math.abs(R-d.x)>2e-4||Math.abs(S-d.y)>2e-4||Math.abs(u-o.focus)>.001||o.pulse.strength>.001;m||M?G=requestAnimationFrame(Se):V=0},I=()=>{!G&&le&&J&&!document.hidden&&(G=requestAnimationFrame(Se))},Me=t=>{const r=k.getBoundingClientRect(),n=t.clientX-r.left,i=t.clientY-r.top;o.pointer.x=n,o.pointer.y=i,o.pointer.inside=n>=0&&i>=0&&n<=r.width&&i<=r.height,I()},Fe=t=>{const r=Q(U.current);if(!r.mouseInteraction||!r.pulseOnClick||t.button!==0||W||t.target instanceof Element&&t.target.closest('a, button, input, textarea, select, label, [role="button"]'))return;const n=k.getBoundingClientRect(),i=t.clientX-n.left,m=t.clientY-n.top;if(i<0||m<0||i>n.width||m>n.height)return;const c=Ee(r,i,m);c&&(o.pulse={s:c.s,age:0,strength:1,ribbon:c.ribbon}),I()},De=()=>{o.pointer.inside=!1,I()},Le=()=>{V=0,I()},Pe=new ResizeObserver(Re);Pe.observe(k);const _e=new IntersectionObserver(t=>{J=t.some(r=>r.isIntersecting),J&&(V=0,I())});return _e.observe(k),N(window).addEventListener("pointermove",Me,{passive:!0}),N(window).addEventListener("pointerdown",Fe),N(document.documentElement).addEventListener("pointerleave",De),document.addEventListener("visibilitychange",Le),Re(),I(),ne.current=()=>{G||he(),I()},()=>{le=!1,cancelAnimationFrame(G),ne.current=null,Pe.disconnect(),_e.disconnect(),N(window).removeEventListener("pointermove",Me),N(window).removeEventListener("pointerdown",Fe),N(document.documentElement).removeEventListener("pointerleave",De),document.removeEventListener("visibilitychange",Le),e.deleteVertexArray(se),[L,...y].forEach(t=>{t.texture&&e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer)}),[q,K,ie,ae,ue,Y].forEach(t=>e.deleteProgram(t.program))}},[]),O.useEffect(()=>{ne.current?.()});const{className:be="",...it}=nt;return Ue.jsx("div",{ref:xe,className:`ghost-fibers-container${be?` ${be}`:""}`,...it,children:Ue.jsx("canvas",{ref:ge,className:"ghost-fibers-canvas","aria-hidden":"true"})})};export{Vt as default};
