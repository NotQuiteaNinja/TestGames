import{r as L,j as Be}from"./index-uEvbEw5g.js";import{b as X}from"./App-Dofw4Ib9.js";import{b as ee}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const A=10,xt=1.8,gt={square:0,circle:1,triangle:2,diamond:3,cross:4,ring:5},Rt={none:0,grow:1,reveal:2},pe=(a,r)=>(Math.floor(a)/2+Math.floor(r)*Math.floor(r)*.75)%1,yt=(a,r)=>(pe(a/4,r/4)*.25+pe(a/2,r/2))*.25+pe(a,r),Et=Array.from({length:64},(a,r)=>yt(r%8,Math.floor(r/8)).toFixed(6)).join(", "),Mt=-6,Tt=10,wt=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Ve=`
const float RANGE_MIN = ${Mt.toFixed(1)};
const float RANGE_MAX = ${Tt.toFixed(1)};

vec2 pack16(float value) {
  float x = floor(clamp((value - RANGE_MIN) / (RANGE_MAX - RANGE_MIN), 0.0, 1.0) * 65535.0 + 0.5);
  float hi = floor(x / 256.0);
  return vec2(hi, x - hi * 256.0) / 255.0;
}

float unpack16(vec2 c) {
  float x = floor(c.x * 255.0 + 0.5) * 256.0 + floor(c.y * 255.0 + 0.5);
  return RANGE_MIN + x / 65535.0 * (RANGE_MAX - RANGE_MIN);
}
`,bt=`#version 300 es
precision highp float;
precision highp int;

uniform vec2 uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform int uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform vec2 uClickPos[${A}];
uniform float uClickAge[${A}];
uniform ivec2 uOrigin;
uniform vec2 uDrift;
uniform int uHover;
uniform vec2 uMouse;
uniform float uMouseRadius;
uniform float uMousePresence;
uniform float uIntro;
uniform sampler2D uPrev;
uniform float uDecay;
uniform float uFresh;

out vec4 outCell;
${Ve}
float hash11(float n) { return fract(sin(n) * 43758.5453); }

float vnoise(vec3 p) {
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n100 = hash11(dot(ip + vec3(1.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n010 = hash11(dot(ip + vec3(0.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n110 = hash11(dot(ip + vec3(1.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n001 = hash11(dot(ip + vec3(0.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));
  float n101 = hash11(dot(ip + vec3(1.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));
  float n011 = hash11(dot(ip + vec3(0.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));
  float n111 = hash11(dot(ip + vec3(1.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));
  vec3 w = fp * fp * fp * (fp * (fp * 6.0 - 15.0) + 10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0 = mix(x00, x10, w.y);
  float y1 = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t) {
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < 5; ++i) {
    sum += amp * vnoise(p * freq);
    freq *= 1.25;
    amp *= 1.0;
  }
  return sum * 0.5 + 0.5;
}

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  float aspectRatio = uResolution.x / uResolution.y;
  float cellPixelSize = 8.0 * uPixelSize;
  vec2 cellId = vec2(texel + uOrigin);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv + uDrift, uTime * 0.05);
  base = base * 0.5 - 0.65;
  float feed = base + (uDensity - 0.5) * 0.3;
  if (uEnableRipples == 1) {
    for (int i = 0; i < ${A}; ++i) {
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      vec2 cuv = (((pos - uResolution * 0.5 - cellPixelSize * 0.5) / uResolution)) * vec2(aspectRatio, 1.0);
      float t = max(uClickAge[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = uRippleSpeed * t;
      float ring = exp(-pow((r - waveR) / uRippleThickness, 2.0));
      float atten = exp(-1.0 * t) * exp(-10.0 * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  if (uIntro < 1.0) {
    vec2 center = (-cellPixelSize * 0.5 / uResolution) * vec2(aspectRatio, 1.0);
    float reach = length(vec2(aspectRatio, 1.0)) * 0.5 + 0.2;
    float eased = 1.0 - pow(1.0 - uIntro, 2.4);
    float front = eased * reach;
    float r = distance(uv, center);
    float shown = smoothstep(front + 0.04, front - 0.06, r);
    float ring = exp(-pow((r - front) / 0.07, 2.0)) * (1.0 - uIntro);
    feed = mix(-1.0, feed, shown);
    feed = max(feed, ring * 1.4);
  }

  float brush = 0.0;
  if (uHover > 0) {
    vec2 d = (cellCoord + cellPixelSize * 0.5 + uResolution * 0.5 - uMouse) / max(uMouseRadius, 1.0);
    brush = exp(-dot(d, d)) * uMousePresence;
  }
  vec4 prev = texelFetch(uPrev, texel, 0) * (1.0 - uFresh);
  float trail = max(brush, max(prev.a * uDecay - 1.0 / 255.0, 0.0));
  if (uHover == 2) feed += trail * 0.9;

  outCell = vec4(pack16(feed), clamp((feed + 0.5) * 0.5, 0.0, 1.0), trail);
}`,St=`#version 300 es
precision highp float;
precision highp int;

uniform vec3 uColor;
uniform vec3 uAccent;
uniform vec2 uResolution;
uniform float uTime;
uniform float uClock;
uniform float uPixelSize;
uniform float uPixelJitter;
uniform float uEdgeFade;
uniform int uShapeType;
uniform sampler2D uCells;
uniform ivec2 uOrigin;
uniform ivec2 uCellCount;
uniform float uSoftness;
uniform float uSmoothing;
uniform float uGlow;
uniform float uTwinkle;
uniform float uLightMode;
uniform float uTransparent;
uniform float uNoise;
uniform int uHover;
uniform mat3 uPlane;
uniform float uTilted;

out vec4 fragColor;
${Ve}
const float BAYER[64] = float[64](${Et});

vec2 gDx;
vec2 gDy;

float aaFrom(vec2 grad) {
  return abs(dot(grad, gDx)) + abs(dot(grad, gDy));
}

float maskSquare(vec2 p, float cov, float soft) {
  if (soft <= 0.0) return cov;
  float side = 0.5 * sqrt(clamp(cov, 0.0, 1.0));
  vec2 c = p - 0.5;
  vec2 q = abs(c) - side;
  float d = max(q.x, q.y);
  vec2 grad = q.x > q.y ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));
  float aa = max(aaFrom(grad), 1e-4);
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);
}

float maskCircle(vec2 p, float cov) {
  float r = sqrt(cov) * 0.25;
  vec2 c = p - 0.5;
  float len = length(c);
  float d = len - r;
  float aa = 0.5 * aaFrom(c / max(len, 1e-5));
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov) {
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d = p.y - r * (1.0 - p.x);
  float aa = max(aaFrom(vec2(flip ? -r : r, 1.0)), 1e-4);
  return cov * clamp(0.5 - d / aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov) {
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

float maskCross(vec2 p, float cov) {
  float s = sqrt(clamp(cov, 0.0, 1.0));
  vec2 c = p - 0.5;
  vec2 q = abs(c);
  float arm = 0.42 * s;
  float bar = 0.13 * s + 0.02;
  float a1 = max(q.x - arm, q.y - bar);
  float a2 = max(q.x - bar, q.y - arm);
  float d = min(a1, a2);
  bool horizontal = a1 < a2 ? q.x - arm > q.y - bar : q.x - bar > q.y - arm;
  vec2 grad = horizontal ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y));
  float aa = max(aaFrom(grad), 1e-4);
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);
}

float maskRing(vec2 p, float cov) {
  float s = sqrt(clamp(cov, 0.0, 1.0));
  vec2 c = p - 0.5;
  float len = length(c);
  float d = abs(len - 0.3 * s) - 0.09 * s;
  vec2 grad = sign(len - 0.3 * s) * c / max(len, 1e-5);
  float aa = max(aaFrom(grad), 1e-4);
  return 1.0 - smoothstep(-aa * 0.5, aa * 0.5, d);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float pixelSize = uPixelSize;
  vec2 screen = gl_FragCoord.xy;
  vec4 empty = uTransparent < 0.5 ? vec4(vec3(uLightMode > 0.5 ? 1.0 : 0.0), 1.0) : vec4(0.0);

  float lod = 0.0;
  float depthFade = 1.0;
  if (uTilted > 0.5) {
    vec3 plane = uPlane * vec3(screen.x, uResolution.y - screen.y, 1.0);
    screen = vec2(plane.x, uResolution.y * plane.z - plane.y) / max(plane.z, 1e-4);
    float footprint = length(fwidth(screen));
    lod = smoothstep(0.3, 0.85, footprint / pixelSize);
    depthFade = (1.0 - smoothstep(0.45, 1.0, footprint / (8.0 * pixelSize))) * step(0.0, plane.z);
  }

  vec2 fragCoord = screen - uResolution * 0.5;
  gDx = dFdx(fragCoord) / pixelSize;
  gDy = dFdy(fragCoord) / pixelSize;
  if (depthFade <= 0.0) {
    fragColor = empty;
    return;
  }

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  ivec2 texel = clamp(ivec2(cellId) - uOrigin, ivec2(0), uCellCount - 1);
  vec2 smoothAt = (fragCoord / cellPixelSize - vec2(uOrigin)) / vec2(uCellCount);
  vec4 blended = texture(uCells, smoothAt);
  float smoothFeed = blended.b * 2.0 - 0.5;
  float feed = smoothFeed;
  float trail = uHover == 1 ? blended.a : 0.0;
  if (uSmoothing < 1.0) {
    vec4 cell = texelFetch(uCells, texel, 0);
    feed = mix(unpack16(cell.rg), smoothFeed, uSmoothing);
    if (uHover == 1) trail = mix(cell.a, blended.a, uSmoothing);
  }

  if (feed < -0.12 * uSoftness && smoothFeed < 0.2 && (lod <= 0.0 || smoothFeed <= 0.0)) {
    fragColor = empty;
    return;
  }

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fragCoord / pixelSize - pixelId;
  ivec2 cellBits = ivec2(mod(pixelId, 8.0));
  float bayer = BAYER[cellBits.y * 8 + cellBits.x] - 0.5;
  float margin = feed + bayer - 0.5;
  float bw = uSoftness > 0.0 ? smoothstep(-0.12 * uSoftness, 0.12 * uSoftness, margin) : step(0.0, margin);

  float h = uPixelJitter > 0.0 || uTwinkle > 0.0 ? fract(sin(dot(pixelId, vec2(127.1, 311.7))) * 43758.5453) : 0.5;
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float heat = max(trail, clamp((feed - 1.0) * 2.5, 0.0, 1.0) * min(uGlow * 2.0, 1.0));
  float coverage = bw * jitterScale * (1.0 + heat * 0.35);
  float M;
  float area;
  if (uShapeType == 1) {
    M = maskCircle(pixelUV, coverage);
    area = 0.196;
  } else if (uShapeType == 2) {
    M = maskTriangle(pixelUV, pixelId, coverage);
    area = 0.5;
  } else if (uShapeType == 3) {
    M = maskDiamond(pixelUV, coverage);
    area = 0.62;
  } else if (uShapeType == 4) {
    M = maskCross(pixelUV, coverage);
    area = 0.41;
  } else if (uShapeType == 5) {
    M = maskRing(pixelUV, coverage);
    area = 0.41;
  } else {
    M = maskSquare(pixelUV, coverage, uSoftness);
    area = 1.0;
  }
  if (lod > 0.0) {
    float average = clamp(smoothFeed, 0.0, 1.0) * area * (1.0 + heat * 0.35);
    M = mix(M, average, lod);
  }

  if (uTwinkle > 0.0) {
    float rate = 1.5 + 3.0 * fract(h * 7.31);
    float wave = 0.5 + 0.5 * sin(uClock * rate + h * 37.0);
    M *= 1.0 - uTwinkle * 0.55 * wave * wave;
  }

  float density = clamp(smoothFeed, 0.0, 1.0);
  float glow = 0.0;
  if (uGlow > 0.0) {
    float bloom = smoothstep(0.2, 1.0, density);
    glow = bloom * bloom * uGlow * (uLightMode > 0.5 ? 0.12 : 0.22) * depthFade;
  }

  float fade = depthFade;
  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    vec2 edgeA = clamp(norm / uEdgeFade, 0.0, 1.0);
    vec2 edgeB = clamp((1.0 - norm) / uEdgeFade, 0.0, 1.0);
    vec2 sa = edgeA * edgeA * edgeA * (edgeA * (edgeA * 6.0 - 15.0) + 10.0);
    vec2 sb = edgeB * edgeB * edgeB * (edgeB * (edgeB * 6.0 - 15.0) + 10.0);
    fade *= sa.x * sa.y * sb.x * sb.y;
  }
  M = clamp(M, 0.0, 1.0) * fade;
  glow *= fade;

  float hot = clamp(heat, 0.0, 1.0);
  float tone = smoothstep(0.3, 1.0, density) * 0.85;
  vec3 color = mix(uColor, uAccent, max(tone, hot));
  vec3 lit = uLightMode > 0.5 ? color * (1.0 - 0.35 * hot) : mix(color, vec3(1.0), 0.45 * hot);
  if (uNoise > 0.0) {
    float n = hash(floor(gl_FragCoord.xy) + floor(uTime * 60.0));
    lit = clamp(lit + (n - 0.5) * uNoise, 0.0, 1.0);
  }

  vec3 haze = uLightMode > 0.5 ? mix(color, vec3(1.0), 0.35) : color;
  float alpha = M + glow * (1.0 - M);
  vec3 premul = lit * M + haze * glow * (1.0 - M);
  if (uTransparent < 0.5) {
    vec3 paper = vec3(uLightMode > 0.5 ? 1.0 : 0.0);
    fragColor = vec4(premul + paper * (1.0 - alpha), 1.0);
    return;
  }
  fragColor = vec4(premul, alpha);
}`,k=(a,r,l)=>Math.min(l,Math.max(r,a)),qe=(a,r,l)=>{const n=a.createShader(r);return n?(a.shaderSource(n,l),a.compileShader(n),a.getShaderParameter(n,a.COMPILE_STATUS)?n:(a.deleteShader(n),null)):null},Ge=(a,r)=>{const l=qe(a,a.VERTEX_SHADER,wt),n=qe(a,a.FRAGMENT_SHADER,r),c=a.createProgram();if(!l||!n||!c)return null;if(a.attachShader(c,l),a.attachShader(c,n),a.linkProgram(c),a.deleteShader(l),a.deleteShader(n),!a.getProgramParameter(c,a.LINK_STATUS))return a.deleteProgram(c),null;const R={},w=a.getProgramParameter(c,a.ACTIVE_UNIFORMS);for(let y=0;y<w;y++){const M=a.getActiveUniform(c,y);if(!M)continue;const b=M.name.replace(/\[0\]$/,"");R[b]=a.getUniformLocation(c,b)}return{program:c,uniforms:R}},te=new Map,Oe=a=>{const r=String(a),l=te.get(r);if(l)return l;const n=At(a);return te.size>64&&te.clear(),te.set(r,n),n},At=a=>{let r=String(a||"#ffffff").replace("#","").trim();(r.length===3||r.length===4)&&(r=r.slice(0,3).split("").map(n=>n+n).join(""));const l=parseInt(r.slice(0,6),16);return Number.isNaN(l)?[1,1,1]:[(l>>16&255)/255,(l>>8&255)/255,(l&255)/255]},Ft=()=>{if(typeof window<"u"&&window.crypto?.getRandomValues){const a=new Uint32Array(1);return window.crypto.getRandomValues(a),a[0]/4294967295}return Math.random()},Ct=a=>{const[r,l,n,c,R,w,y,M,b]=a,D=R*b-w*M,V=-(c*b-w*y),H=c*M-R*y,S=r*D+l*V+n*H||1;return[D/S,-(l*b-n*M)/S,(l*w-n*R)/S,V/S,(r*b-n*y)/S,-(r*w-n*c)/S,H/S,-(r*M-l*y)/S,(r*R-l*c)/S]},$e=(a,r)=>{const l=new Array(9);for(let n=0;n<3;n++)for(let c=0;c<3;c++)l[n*3+c]=a[n*3]*r[c]+a[n*3+1]*r[3+c]+a[n*3+2]*r[6+c];return l},Pt=(a,r,l,n)=>{const c=a*Math.PI/180,R=r*Math.PI/180,w=Math.max(l,n)*1.25,y=l/2,M=n/2,b=[Math.cos(R),0,0,Math.sin(c)*Math.sin(R),Math.cos(c),0,Math.sin(R)*Math.cos(c)/w,-Math.sin(c)/w,1],D=$e($e([1,0,y,0,1,M,0,0,1],b),[1,0,-y,0,1,-M,0,0,1]);return Ct(D)},Nt=({variant:a="square",pixelSize:r=3,color:l="#B497CF",accentColor:n,className:c,style:R,patternScale:w=2,patternDensity:y=1,pixelSizeJitter:M=0,enableRipples:b=!0,rippleIntensityScale:D=1,rippleThickness:V=.1,rippleSpeed:H=.3,autoPauseOffscreen:S=!0,speed:He=.5,transparent:Ye=!0,edgeFade:je=.5,noiseAmount:Ke=0,softness:Je=.6,smoothing:We=1,glow:Qe=.4,twinkle:Ze=.25,drift:et=.2,driftAngle:tt=30,hoverEffect:ot="reveal",hoverRadius:at=140,autoRipple:rt=0,tiltX:it=0,tiltY:nt=0,intro:lt=!0,variation:ct,lightMode:st=!1,dpr:ft})=>{const he=L.useRef(null),ve=L.useRef(null),oe=L.useRef(null),xe={variant:gt[a]??0,pixelSize:Math.max(.5,r),color:l,accentColor:n||l,patternScale:w,patternDensity:y,pixelSizeJitter:M,enableRipples:b,rippleIntensityScale:D,rippleThickness:Math.max(.001,V),rippleSpeed:H,autoPauseOffscreen:S,speed:He,transparent:Ye,edgeFade:k(je,0,1),noiseAmount:Ke,softness:k(Je,0,1),smoothing:k(We,0,1),glow:k(Qe,0,2),twinkle:k(Ze,0,1),drift:et,driftAngle:tt,hoverEffect:Rt[ot]??0,hoverRadius:Math.max(10,at),autoRipple:Math.max(0,rt),tiltX:k(it,-70,70),tiltY:k(nt,-70,70),intro:lt,variation:ct,lightMode:st,dpr:ft},P=L.useRef(xe);return P.current=xe,L.useEffect(()=>{const N=he.current,d=ve.current,e=d?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!N||!d||!e)return;const Y=Ge(e,bt),j=Ge(e,St);if(!Y||!j)return;const p=Y.uniforms,m=j.uniforms,ae=e.createVertexArray(),ut=t=>{const o=e.createTexture();return e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null),o},B=[0,1].map(()=>{const t=ut(e.LINEAR),o=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,o),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0),{texture:t,framebuffer:o}});e.bindFramebuffer(e.FRAMEBUFFER,null);const _=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,s={width:1,height:1,ratio:1,plane:null,tiltKey:""},g={x:0,y:0,w:1,h:1,key:""},F={x:0,y:0,inside:!1},T={x:0,y:0,ready:!1},z=new Float32Array(A*2).fill(-1),ge=new Float32Array(A),re=new Float32Array(A);let q=0,G=0,ie=!0;const Re=P.current.variation,mt=typeof Re=="number"?Re*37:Ft()*1e3;let ye=0,K=0,J=0,Ee=0,Me=0,U=P.current.intro&&!_?0:1,ne=1.2,O=0,W=0,Q=!0,Z=0;const Te=t=>mt+ye*t.speed,we=t=>{const i=8*(t.pixelSize*s.ratio),f=d.width,u=d.height;let x=-f/2,v=f/2,C=-u/2,E=u/2;if(s.plane){const me=[[0,0],[f,0],[0,u],[f,u],[f/2,0],[f/2,u],[0,u/2],[f,u/2]];x=1/0,v=-1/0,C=1/0,E=-1/0;for(const[ht,vt]of me){const[de,Xe]=le(ht,vt);de<-1e5||(x=Math.min(x,de-f/2),v=Math.max(v,de-f/2),C=Math.min(C,Xe-u/2),E=Math.max(E,Xe-u/2))}Number.isFinite(x)||(x=-f/2,v=f/2,C=-u/2,E=u/2)}const h=i,ce=Math.floor((x-h)/i),dt=Math.floor((v+h)/i),se=Math.floor((C-h)/i),pt=Math.floor((E+h)/i),fe=Math.max(1,Math.min(2048,dt-ce+1)),ue=Math.max(1,Math.min(2048,pt-se+1)),Le=`${ce}:${se}:${fe}:${ue}`;if(Le!==g.key){g.key=Le,g.x=ce,g.y=se,g.w=fe,g.h=ue;for(const me of B)e.bindTexture(e.TEXTURE_2D,me.texture),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,fe,ue,0,e.RGBA,e.UNSIGNED_BYTE,null);ie=!0}},$=new Float32Array(A*2),be=(t,o)=>{for(let v=0;v<A;v++){if(z[v*2]<0){$[v*2]=-1,$[v*2+1]=-1;continue}const[C,E]=le(z[v*2],z[v*2+1]);$[v*2]=Math.max(C,0),$[v*2+1]=E}const[i,f]=le(T.x,T.y),u=B[G],x=B[1-G];e.bindFramebuffer(e.FRAMEBUFFER,x.framebuffer),e.viewport(0,0,g.w,g.h),e.disable(e.BLEND),e.useProgram(Y.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,u.texture),e.uniform1i(p.uPrev,0),e.uniform2f(p.uResolution,d.width,d.height),e.uniform1f(p.uTime,Te(t)),e.uniform1f(p.uPixelSize,t.pixelSize*s.ratio),e.uniform1f(p.uScale,t.patternScale),e.uniform1f(p.uDensity,t.patternDensity),e.uniform1i(p.uEnableRipples,t.enableRipples?1:0),e.uniform1f(p.uRippleSpeed,t.rippleSpeed),e.uniform1f(p.uRippleThickness,t.rippleThickness),e.uniform1f(p.uRippleIntensity,t.rippleIntensityScale),e.uniform2fv(p.uClickPos,$),e.uniform1fv(p.uClickAge,re),e.uniform2i(p.uOrigin,g.x,g.y),e.uniform2f(p.uDrift,Ee,Me),e.uniform1i(p.uHover,t.hoverEffect),e.uniform2f(p.uMouse,i,f),e.uniform1f(p.uMouseRadius,t.hoverRadius*s.ratio),e.uniform1f(p.uMousePresence,J),e.uniform1f(p.uIntro,U),e.uniform1f(p.uDecay,o),e.uniform1f(p.uFresh,ie?1:0),e.bindVertexArray(ae),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),G=1-G,ie=!1},Se=()=>{const t=ee(P.current);if(e.viewport(0,0,d.width,d.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(j.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,B[G].texture),e.uniform1i(m.uCells,0),e.uniform3fv(m.uColor,Oe(t.color)),e.uniform3fv(m.uAccent,Oe(t.accentColor)),e.uniform2f(m.uResolution,d.width,d.height),e.uniform1f(m.uTime,Te(t)),e.uniform1f(m.uClock,K),e.uniform1f(m.uPixelSize,t.pixelSize*s.ratio),e.uniform1f(m.uPixelJitter,t.pixelSizeJitter),e.uniform1f(m.uEdgeFade,t.edgeFade),e.uniform1i(m.uShapeType,t.variant),e.uniform2i(m.uOrigin,g.x,g.y),e.uniform2i(m.uCellCount,g.w,g.h),e.uniform1f(m.uSoftness,t.softness),e.uniform1f(m.uSmoothing,t.smoothing),e.uniform1f(m.uGlow,t.glow),e.uniform1f(m.uTwinkle,_?0:t.twinkle),e.uniform1f(m.uLightMode,t.lightMode?1:0),e.uniform1f(m.uTransparent,t.transparent?1:0),e.uniform1f(m.uNoise,t.noiseAmount),e.uniform1i(m.uHover,t.hoverEffect),e.uniform1f(m.uTilted,s.plane?1:0),s.plane){const o=s.plane;e.uniformMatrix3fv(m.uPlane,!1,[o[0],o[3],o[6],o[1],o[4],o[7],o[2],o[5],o[8]])}e.bindVertexArray(ae),e.drawArrays(e.TRIANGLES,0,3),e.bindVertexArray(null)},le=(t,o)=>{const i=s.plane;if(!i)return[t,o];const f=d.height,u=f-o,x=i[6]*t+i[7]*u+i[8];return x<=1e-4?[-1e6,-1e6]:[(i[0]*t+i[1]*u+i[2])/x,f-(i[3]*t+i[4]*u+i[5])/x]},Ae=t=>{s.plane=t.tiltX||t.tiltY?Pt(t.tiltX,t.tiltY,d.width,d.height):null,s.tiltKey=`${t.tiltX}:${t.tiltY}:${d.width}:${d.height}`},Fe=()=>{const t=ee(P.current);s.width=Math.max(1,N.clientWidth),s.height=Math.max(1,N.clientHeight),s.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),d.width=Math.max(1,Math.round(s.width*s.ratio)),d.height=Math.max(1,Math.round(s.height*s.ratio)),T.ready||(T.ready=!0,T.x=d.width/2,T.y=d.height/2),Ae(t),we(t),be(t,0),Se(),I()},Ce=t=>{O=0;const o=ee(P.current);if(!Q&&o.autoPauseOffscreen||document.hidden)return;const i=W?k((t-W)/1e3,0,1/20):0;if(W=t,_||(ye+=i),K+=i,!_&&o.drift){const h=o.driftAngle*Math.PI/180;Ee+=Math.cos(h)*o.drift*i*.05,Me+=Math.sin(h)*o.drift*i*.05}!_&&o.enableRipples&&o.autoRipple>0&&U>=1&&(ne-=i,ne<=0&&(ne=o.autoRipple*(.7+Math.random()*.6),_e((.15+Math.random()*.7)*s.width,(.15+Math.random()*.7)*s.height)));for(let h=0;h<A;h++)re[h]=(K-ge[h])*.5;const f=F.x*s.ratio,u=(s.height-F.y)*s.ratio,x=1-Math.exp(-i/.08);F.inside&&(T.x+=(f-T.x)*x,T.y+=(u-T.y)*x),J+=((F.inside?1:0)-J)*(1-Math.exp(-i/.25)),`${o.tiltX}:${o.tiltY}:${d.width}:${d.height}`!==s.tiltKey&&Ae(o),we(o);const C=o.hoverEffect?Math.exp(-i/.45):0;be(o,C),Se(),U<1&&(U=Math.min(1,U+i/xt));let E=!_&&(o.speed!==0||o.drift!==0||o.twinkle>0||o.autoRipple>0&&o.enableRipples);E=E||U<1||J>.001;for(let h=0;h<A;h++)E=E||z[h*2]>=0&&re[h]<8;Z=E?0:Z+i,Z<1.5&&(O=requestAnimationFrame(Ce))};function I(){Z=0,!O&&(Q||!P.current.autoPauseOffscreen)&&!document.hidden&&(W=0,O=requestAnimationFrame(Ce))}const Pe=t=>{const o=N.getBoundingClientRect(),i=t.clientX-o.left,f=t.clientY-o.top;return{x:i,y:f,inside:i>=0&&f>=0&&i<=o.width&&f<=o.height}},ke=t=>{const{x:o,y:i,inside:f}=Pe(t),u=F.inside;F.inside=f,f&&(F.x=o,F.y=i,u||(T.x=o*s.ratio,T.y=(s.height-i)*s.ratio)),(f||u)&&I()};function _e(t,o){z[q*2]=t*s.ratio,z[q*2+1]=(s.height-o)*s.ratio,ge[q]=K,q=(q+1)%A,I()}const Ie=t=>{const o=ee(P.current),{x:i,y:f,inside:u}=Pe(t);!u||_||!o.enableRipples||_e(i,f)},De=()=>{F.inside=!1,I()},Ne=()=>I(),ze=new ResizeObserver(Fe);ze.observe(N);const Ue=new IntersectionObserver(t=>{Q=t.some(o=>o.isIntersecting),Q&&I()});return Ue.observe(N),X(window).addEventListener("pointermove",ke,{passive:!0}),X(window).addEventListener("pointerdown",Ie,{passive:!0}),X(document.documentElement).addEventListener("pointerleave",De),document.addEventListener("visibilitychange",Ne),Fe(),oe.current=I,()=>{cancelAnimationFrame(O),oe.current=null,ze.disconnect(),Ue.disconnect(),X(window).removeEventListener("pointermove",ke),X(window).removeEventListener("pointerdown",Ie),X(document.documentElement).removeEventListener("pointerleave",De),document.removeEventListener("visibilitychange",Ne);for(const t of B)e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer);e.deleteVertexArray(ae),e.deleteProgram(Y.program),e.deleteProgram(j.program),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),L.useEffect(()=>{oe.current?.()}),Be.jsx("div",{ref:he,className:`pixel-blast-container${c?` ${c}`:""}`,style:R,"aria-label":"PixelBlast interactive background",children:Be.jsx("canvas",{ref:ve,className:"pixel-blast-canvas","aria-hidden":"true"})})};export{Nt as default};
