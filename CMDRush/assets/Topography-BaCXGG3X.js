import{r as te,j as Lt}from"./index-uEvbEw5g.js";import{b as j}from"./App-Dofw4Ib9.js";import{b as Oe}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const ao=.32,At=9,he=.05,ke=160,Te=1.7,be=.45,uo=2.8,He=4,Dt=4,Re=256,Ue=48,ot=2e5,co=[-.81,.58,-.02],_t={forward:[0,1],backward:[0,-1],left:[-1,0],right:[1,0]},lo=["lift","trace","light"],fo={plus:0,dots:1},so=1.25,Xe=`
precision highp float;
precision highp int;

uniform float uFrequency;
uniform vec2 uMorph;
uniform sampler2D uSculpt;
uniform float uSculptOn;
uniform vec4 uPulses[${He}];
uniform vec3 uEye;
uniform vec3 uForward;
uniform vec3 uNear;

uint lattice(ivec2 p) {
  uvec2 q = uvec2(p + 1073741824);
  uint h = q.x * 2654435761u + q.y * 2246822519u;
  h = (h ^ (h >> 15u)) * 739982445u;
  h = (h ^ (h >> 12u)) * 695872825u;
  return h ^ (h >> 15u);
}

float corner(ivec2 c, vec2 f) {
  uint h = lattice(c);
  vec2 g = vec2(float(h & 65535u), float(h >> 16u)) / 32767.5 - 1.0;
  return dot(g, f);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  ivec2 c = ivec2(i);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = corner(c, f);
  float b = corner(c + ivec2(1, 0), f - vec2(1.0, 0.0));
  float d = corner(c + ivec2(0, 1), f - vec2(0.0, 1.0));
  float e = corner(c + ivec2(1, 1), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(d, e, u.x), u.y);
}

vec2 octave(vec2 p, vec2 shift) {
  return vec2(1.6 * p.x - 1.2 * p.y, 1.2 * p.x + 1.6 * p.y) + shift;
}

float relief(vec2 t) {
  vec2 p = t * uFrequency;
  vec2 w = vec2(noise(p * 0.42 + uMorph), noise(p * 0.42 - uMorph.yx + vec2(5.2, 1.3)));
  p += w * 0.8;
  float n = noise(p) * 0.55;
  p = octave(p, vec2(7.1, 3.7));
  n += noise(p) * 0.15;
  p = octave(p, vec2(1.9, 8.3));
  n += noise(p) * 0.04;
  float s = log(1.0 + exp(7.0 * (3.0 * n + 0.05))) / 7.0;
  return s * s * 1.4 + 0.1 * n;
}

float swell(vec2 t) {
  float lift = 0.0;
  for (int i = 0; i < ${He}; i++) {
    vec4 p = uPulses[i];
    if (p.w <= 0.0) continue;
    float x = (length(t - p.xy) - p.z) / (0.28 + p.z * 0.05);
    lift += exp(-x * x) * p.w;
  }
  return lift;
}

vec4 sculpted(vec2 t) {
  return uSculptOn > 0.5 ? textureLod(uSculpt, t / ${Ue}.0, 0.0) : vec4(0.0);
}

float settle(vec2 world) {
  float depth = dot(vec3(world.x, 0.0, world.y) - uEye, uForward);
  float x = clamp((depth - uNear.x) / max(uNear.y - uNear.x, 1e-3), 0.0, 1.0);
  return mix(uNear.z, 1.0, x * x * x * (x * (x * 6.0 - 15.0) + 10.0));
}
`,mo=`#version 300 es
${Xe}
uniform ivec2 uBase;
uniform float uCell;
uniform float uDetail;
layout(location = 0) out vec4 outField;
layout(location = 1) out vec4 outHeight;

void main() {
  vec2 t = vec2(uBase + ivec2(gl_FragCoord.xy)) * uCell;
  vec4 carved = sculpted(t);
  float ring = swell(t);
  float ground = relief(t) + carved.r + ring * 0.14;
  vec2 dp = t * uFrequency * 5.0 + vec2(13.1, 4.7);
  float fine = noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3;
  outField = vec4(carved.g, ring, ground, carved.r);
  outHeight = vec4(ground + uDetail * 0.1 * fine, 0.0, 0.0, 1.0);
}`,ho=n=>`#version 300 es
#define BAKED ${n?1:0}
${Xe}
uniform sampler2D uField;
uniform ivec2 uOrigin;
uniform ivec2 uCamCell;
uniform vec2 uCamFrac;
uniform float uCell;
uniform int uStride;
uniform float uHeight;
uniform mat4 uViewProj;
out vec2 vTexel;
out vec2 vTerrain;
out float vDepth;
out float vLift;
out vec3 vNormal;

float ground(vec2 t) {
  return relief(t) + swell(t) * 0.14;
}

void main() {
  ivec2 step = ivec2(gl_VertexID >> 1, gl_InstanceID + (gl_VertexID & 1)) * uStride;
  ivec2 local = uOrigin + step;
  vec2 terrain = vec2(local + uCamCell) * uCell;
  vec2 world = vec2(local) * uCell - uCamFrac;
  float k = settle(world);
#if BAKED
  ivec2 texel = step + 2;
  vec4 c = texelFetch(uField, texel, 0);
  vec4 l = texelFetch(uField, texel - ivec2(1, 0), 0);
  vec4 r = texelFetch(uField, texel + ivec2(1, 0), 0);
  vec4 d = texelFetch(uField, texel - ivec2(0, 1), 0);
  vec4 u = texelFetch(uField, texel + ivec2(0, 1), 0);
  float h = (c.b - c.a) * k + c.a;
  float dx = (l.b - l.a - r.b + r.a) * k + l.a - r.a;
  float dz = (d.b - d.a - u.b + u.a) * k + d.a - u.a;
  vNormal = vec3(dx * uHeight / (2.0 * uCell), 1.0, dz * uHeight / (2.0 * uCell));
  vTexel = vec2(texel) + 0.5;
#else
  float h = ground(terrain) * k;
  float hx = ground(terrain + vec2(0.04, 0.0)) * k;
  float hz = ground(terrain + vec2(0.0, 0.04)) * k;
  vNormal = vec3((h - hx) * uHeight / 0.04, 1.0, (h - hz) * uHeight / 0.04);
  vTexel = vec2(0.0);
#endif
  vec4 clip = uViewProj * vec4(world.x, h * uHeight, world.y, 1.0);
  gl_Position = clip;
  vTerrain = terrain;
  vDepth = clip.w;
  vLift = h * uHeight;
}`,vo=n=>`#version 300 es
#define BAKED ${n?1:0}
${Xe}
uniform sampler2D uField;
uniform highp sampler2D uHeightField;
uniform float uDetail;
uniform float uLines;
uniform float uLineWidth;
uniform float uMajor;
uniform vec3 uColor;
uniform float uBrightness;
uniform vec2 uFade;
uniform vec3 uFocus;
uniform vec4 uHeat;
uniform vec4 uLamp;
uniform vec4 uTrace;
uniform vec3 uSun;
uniform float uRefDepth;
uniform float uReveal;
uniform float uLightMode;
uniform float uOpacity;
uniform vec4 uGlitch[3];
uniform float uGlitchSeed;
uniform float uPixel;
in vec2 vTexel;
in vec2 vTerrain;
in float vDepth;
in float vLift;
in vec3 vNormal;
out vec4 outColor;

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

float stroke(float dist, float width, float soft, float density, float crowd) {
  float cover = max(0.0, min(min(width, soft), 0.5 * (width + soft) - dist)) / soft;
  return mix(cover, min(width * density, 1.0) * 0.6, crowd);
}

float sampleHeight(vec2 coord, out vec2 slope) {
  vec2 u = coord - 0.5;
  vec2 i = floor(u + 0.5);
  vec2 f = u - i;
  vec3 wx = vec3(0.5 * (0.5 - f.x) * (0.5 - f.x), 0.75 - f.x * f.x, 0.5 * (0.5 + f.x) * (0.5 + f.x));
  vec3 wy = vec3(0.5 * (0.5 - f.y) * (0.5 - f.y), 0.75 - f.y * f.y, 0.5 * (0.5 + f.y) * (0.5 + f.y));
  vec3 dx = vec3(f.x - 0.5, -2.0 * f.x, 0.5 + f.x);
  vec3 dy = vec3(f.y - 0.5, -2.0 * f.y, 0.5 + f.y);
  ivec2 base = ivec2(i) - 1;
  float total = 0.0;
  slope = vec2(0.0);
  for (int y = 0; y < 3; y++) {
    float a = texelFetch(uHeightField, base + ivec2(0, y), 0).r;
    float b = texelFetch(uHeightField, base + ivec2(1, y), 0).r;
    float c = texelFetch(uHeightField, base + ivec2(2, y), 0).r;
    float row = a * wx.x + b * wx.y + c * wx.z;
    total += row * wy[y];
    slope += vec2((a * dx.x + b * dx.y + c * dx.z) * wy[y], row * dy[y]);
  }
  return total;
}

void main() {
  float py = gl_FragCoord.y / uPixel;
  float shift = 0.0;
  float split = 0.0;
  for (int i = 0; i < 3; i++) {
    if (py >= uGlitch[i].x && py < uGlitch[i].y) {
      shift = uGlitch[i].z * uPixel;
      split = uGlitch[i].w * uPixel;
    }
  }
  vec2 spot = vTerrain - dFdx(vTerrain) * shift;
#if BAKED
  vec2 ex = dFdx(vTexel);
  vec2 ey = dFdy(vTexel);
  vec2 coord = vTexel - ex * shift;
  vec2 slope;
  float h = sampleHeight(coord, slope);
  vec4 field = texture(uField, coord / vec2(textureSize(uField, 0)));
  float trail = field.r;
  float ring = field.g;
  float gx = dot(slope, ex) * uLines;
  float gy = dot(slope, ey) * uLines;
#else
  vec2 dp = spot * uFrequency * 5.0 + vec2(13.1, 4.7);
  float ring = swell(spot);
  float h = relief(spot) + ring * 0.14 + uDetail * 0.1 * (noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3);
  float trail = 0.0;
  float gx = dFdx(h) * uLines;
  float gy = dFdy(h) * uLines;
#endif

  float lc = h * uLines + 0.5;
  float density = max(sqrt(gx * gx + gy * gy), 1e-5);
  float dist = abs(fract(lc + 0.5) - 0.5) / density;
  float major = uMajor * (1.0 - step(0.5, mod(floor(lc + 0.5), 5.0)));

  vec2 hd = spot - uHeat.xy;
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w + trail * 0.6;
  float energy = heat + ring;

  float depth = max(vDepth, 0.01);
  float persp = clamp(sqrt(uRefDepth / depth), 0.6, 1.6);
  float width = uLineWidth * persp * (1.0 + 0.6 * major) * (1.0 + 0.45 * min(energy, 1.5));
  float soft = 1.0 + min(uFocus.y * abs(1.0 - uFocus.x / depth), uFocus.z);
  float crowd = smoothstep(0.3, 0.75, density * max(width, soft));
  float cover = stroke(dist, width, soft, density, crowd);
  vec3 cover3 = vec3(cover);
  if (split > 0.0) {
    float offset = split * density;
    cover3.r = stroke(abs(fract(lc + offset + 0.5) - 0.5) / density, width, soft, density, crowd);
    cover3.b = stroke(abs(fract(lc - offset + 0.5) - 0.5) / density, width, soft, density, crowd);
    vec2 block = floor(vec2(gl_FragCoord.x / (uPixel * 26.0), py / 5.0)) + uGlitchSeed * 71.0;
    float drop = fract(sin(dot(block, vec2(12.9898, 78.233))) * 43758.5453);
    cover3 *= drop > 0.82 ? 0.1 : 1.2;
  }

  vec3 normal = normalize(vNormal);
  float sun = clamp(dot(normal, uSun), 0.0, 1.0);
  vec3 toLamp = uLamp.xyz - vec3(vTerrain.x, vLift, vTerrain.y);
  float lampDistance = length(toLamp);
  float lamp = clamp(dot(normal, toLamp / max(lampDistance, 1e-3)), 0.0, 1.0) * uLamp.w / (1.0 + lampDistance * lampDistance * 0.9);
  float level = mix(0.45, 1.05, smoothstep(0.0, 1.1, h)) * mix(0.35, 1.25, sun * sun) * (1.0 + 0.6 * major);
  level += heat * 1.4 + ring * 3.0 + lamp * 1.2;

  float fade = 1.0 - smoother((depth - uFade.x) / max(uFade.y - uFade.x, 1e-3));
  vec3 light = cover3 * level;

  if (uTrace.y > 0.0) {
    float traceWidth = uLineWidth * persp * 1.8;
    float trace = stroke(abs(h - uTrace.x) * uLines / density, traceWidth, soft, density, crowd);
    vec2 td = spot - uTrace.zw;
    light += trace * uTrace.y * mix(0.35, 1.0, exp(-dot(td, td) / 20.0)) * 2.6;
  }
  light *= fade * uBrightness * uReveal;

  if (uLightMode > 0.5) {
    float ink = (1.0 - exp(-max(max(light.r, light.g), light.b) * 1.8)) * 0.92 * uOpacity;
    outColor = vec4(uColor * ink, ink);
    return;
  }

  vec3 color = 1.0 - exp(-uColor * light * 1.8);
  float top = max(max(color.r, color.g), color.b);
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  color = max(color + dither / 255.0 * step(0.002, top), 0.0);
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;
}`,po=`#version 300 es
${Xe}
uniform ivec2 uOrigin;
uniform ivec2 uCamCell;
uniform vec2 uCamFrac;
uniform float uSpacing;
uniform int uColumns;
uniform float uHeight;
uniform mat4 uViewProj;
uniform vec2 uView;
uniform float uSize;
uniform float uRefDepth;
uniform vec4 uHeat;
uniform float uTime;
uniform vec4 uGlitch[3];
uniform float uPixel;
out vec2 vCorner;
out float vSize;
out float vGlow;
out float vFrame;
out float vDepth;

void main() {
  ivec2 local = uOrigin + ivec2(gl_InstanceID % uColumns, gl_InstanceID / uColumns);
  ivec2 id = local + uCamCell;
  vec2 terrain = vec2(id) * uSpacing;
  vec2 world = vec2(local) * uSpacing - uCamFrac;
  float ring = swell(terrain);
  float h = (relief(terrain) + ring * 0.14) * settle(world) + sculpted(terrain).r;
  vec4 clip = uViewProj * vec4(world.x, h * uHeight + 0.05, world.y, 1.0);
  uint seed = lattice(id + ivec2(911, 377));
  float a = float(seed & 1023u) / 1023.0;
  float b = float((seed >> 10u) & 1023u) / 1023.0;
  vec2 hd = terrain - uHeat.xy;
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w;
  float blink = step(0.92, a) * (0.5 + 0.5 * sin(uTime * (1.4 + b * 2.2) + b * 40.0));
  float size = uSize * clamp(sqrt(uRefDepth / max(clip.w, 0.01)), 0.6, 1.3) * (1.0 + 0.4 * heat + 0.35 * blink);
  float frame = max(smoothstep(0.55, 0.95, blink), smoothstep(0.3, 0.8, heat));
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;
  vec2 offset = corner * (size * (frame > 0.001 ? 2.6 : 1.0) + 1.5);
  float py = (clip.y / clip.w * 0.5 + 0.5) * uView.y / uPixel;
  float shift = 0.0;
  for (int i = 0; i < 3; i++) {
    if (py >= uGlitch[i].x && py < uGlitch[i].y) shift = uGlitch[i].z;
  }
  clip.xy += (offset + vec2(shift * uPixel, 0.0)) / uView * 2.0 * clip.w;
  gl_Position = clip;
  vCorner = offset;
  vSize = size;
  vFrame = frame;
  vGlow = 0.5 + 0.4 * b + blink * 0.9 + heat * 1.8 + ring * 3.0;
  vDepth = clip.w;
}`,xo=`#version 300 es
precision highp float;
uniform vec3 uColor;
uniform vec2 uFade;
uniform float uReveal;
uniform float uBrightness;
uniform float uLightMode;
uniform float uOpacity;
uniform float uStyle;
uniform float uPixel;
in vec2 vCorner;
in float vSize;
in float vGlow;
in float vFrame;
in float vDepth;
out vec4 outColor;

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 a = abs(vCorner);
  float cover;
  if (uStyle < 0.5) {
    float thick = max(0.6 * uPixel, 0.5);
    float across = clamp(vSize - a.x + 0.5, 0.0, 1.0) * clamp(thick - a.y + 0.5, 0.0, 1.0);
    float down = clamp(vSize - a.y + 0.5, 0.0, 1.0) * clamp(thick - a.x + 0.5, 0.0, 1.0);
    cover = max(across, down);
  } else {
    cover = clamp(vSize * 0.42 - length(vCorner) + 0.5, 0.0, 1.0);
  }
  if (vFrame > 0.001) {
    float edge = vSize * 2.3;
    float reach = edge * 0.45;
    float line = max(0.5 * uPixel, 0.5);
    float sides = clamp(line - abs(a.x - edge) + 0.5, 0.0, 1.0) * clamp(a.y - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.y + 0.5, 0.0, 1.0);
    float caps = clamp(line - abs(a.y - edge) + 0.5, 0.0, 1.0) * clamp(a.x - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.x + 0.5, 0.0, 1.0);
    cover = max(cover, max(sides, caps) * vFrame * 0.8);
  }
  float fade = 1.0 - smoother((vDepth - uFade.x) / max(uFade.y - uFade.x, 1e-3));
  float light = cover * vGlow * fade * fade * uReveal * uBrightness;
  if (uLightMode > 0.5) {
    float ink = (1.0 - exp(-light * 1.8)) * 0.92 * uOpacity;
    outColor = vec4(uColor * ink, ink);
    return;
  }
  vec3 color = 1.0 - exp(-uColor * light * 1.8);
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;
}`,Me=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,go=`#version 300 es
precision highp float;
uniform sampler2D uPrevious;
uniform vec4 uSegment;
uniform vec4 uBrush;
uniform vec4 uBurst;
uniform vec2 uDecay;
out vec4 outColor;

vec2 wrapped(vec2 d) {
  return d - ${Ue}.0 * floor(d / ${Ue}.0 + 0.5);
}

void main() {
  vec4 previous = texelFetch(uPrevious, ivec2(gl_FragCoord.xy), 0);
  vec2 t = gl_FragCoord.xy / ${Re}.0 * ${Ue}.0;
  vec2 a = wrapped(t - uSegment.xy);
  vec2 ab = uSegment.zw - uSegment.xy;
  float k = clamp(dot(a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  vec2 d = a - ab * k;
  float g = exp(-dot(d, d) / (uBrush.x * uBrush.x)) * uBrush.w;
  float height = previous.r * uDecay.x;
  height += (uBrush.y - height) * g * uBrush.z;
  float heat = previous.g * uDecay.y;
  heat += (1.0 - heat) * g * uBrush.z;
  vec2 b = wrapped(t - uBurst.xy);
  height += uBurst.w * exp(-dot(b, b) / (uBurst.z * uBurst.z));
  outColor = vec4(height, heat, 0.0, 1.0);
}`,Eo=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uTexel;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 color = texture(uSource, uv - uTexel);
  color += texture(uSource, uv + uTexel);
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y));
  outColor = min(color * 0.25, vec4(1.0));
}`,yo=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uStep;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 color = texture(uSource, uv) * 0.181862;
  color += (texture(uSource, uv + uStep * 1.423135) + texture(uSource, uv - uStep * 1.423135)) * 0.284316;
  color += (texture(uSource, uv + uStep * 3.326702) + texture(uSource, uv - uStep * 3.326702)) * 0.106598;
  color += (texture(uSource, uv + uStep * 5.242989) + texture(uSource, uv - uStep * 5.242989)) * 0.018156;
  outColor = color;
}`,wo=`#version 300 es
precision highp float;
uniform sampler2D uBloom0;
uniform sampler2D uBloom1;
uniform sampler2D uBloom2;
uniform sampler2D uBloom3;
uniform vec2 uView;
uniform float uGlow;
uniform float uLightMode;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uView;
  vec4 halo = texture(uBloom0, uv) * 0.4;
  halo += texture(uBloom1, uv) * 0.3;
  halo += texture(uBloom2, uv) * 0.2;
  halo += texture(uBloom3, uv) * 0.1;
  if (uLightMode > 0.5) {
    outColor = halo * uGlow * 0.35;
    return;
  }
  vec3 color = halo.rgb * uGlow * 1.6;
  color = color / (1.0 + color);
  outColor = vec4(color, max(max(color.r, color.g), color.b));
}`,S=(n,l,u)=>Math.min(u,Math.max(l,n)),ie=n=>{const l=S(n,0,1);return l*l*l*(l*(l*6-15)+10)},Fo=(n,l)=>{let u=Math.imul(n+1073741824,2654435761)+Math.imul(l+1073741824,2246822519)>>>0;return u=Math.imul(u^u>>>15,739982445)>>>0,u=Math.imul(u^u>>>12,695872825)>>>0,(u^u>>>15)>>>0},ze=(n,l,u,c)=>{const m=Fo(n,l);return((m&65535)/32767.5-1)*u+((m>>>16)/32767.5-1)*c},ae=(n,l)=>{const u=Math.floor(n),c=Math.floor(l),m=n-u,g=l-c,_=m*m*m*(m*(m*6-15)+10),$=g*g*g*(g*(g*6-15)+10),K=ze(u,c,m,g),X=ze(u+1,c,m-1,g),B=ze(u,c+1,m,g-1),I=ze(u+1,c+1,m-1,g-1),G=K+(X-K)*_;return G+(B+(I-B)*_-G)*$},Pt=(n,l,u,c,m)=>{let g=n*u,_=l*u;const $=ae(g*.42+c,_*.42+m),K=ae(g*.42-m+5.2,_*.42-c+1.3);g+=$*.8,_+=K*.8;let X=ae(g,_)*.55;const B=1.6*g-1.2*_+7.1,I=1.2*g+1.6*_+3.7;X+=ae(B,I)*.15,X+=ae(1.6*B-1.2*I+1.9,1.2*B+1.6*I+8.3)*.04;const G=Math.log(1+Math.exp(7*(3*X+.05)))/7;return G*G*1.4+.1*X},To=(n,l,u)=>{const c=n*u*5+13.1,m=l*u*5+4.7;return ae(c,m)*.6+ae(1.6*c-1.2*m+2.3,1.2*c+1.6*m+6.1)*.3},Bt=(n,l,u)=>{const c=n.createShader(l);return c?(n.shaderSource(c,u),n.compileShader(c),c):null},ne=(n,l,u)=>{const c=Bt(n,n.VERTEX_SHADER,l),m=Bt(n,n.FRAGMENT_SHADER,u),g=n.createProgram();return!c||!m||!g?null:(n.attachShader(g,c),n.attachShader(g,m),n.linkProgram(g),n.deleteShader(c),n.deleteShader(m),{program:g,uniforms:{}})},Nt=(n,l)=>{if(!n.getProgramParameter(l.program,n.LINK_STATUS))return!1;const u=n.getProgramParameter(l.program,n.ACTIVE_UNIFORMS);for(let c=0;c<u;c++){const m=n.getActiveUniform(l.program,c);m&&(l.uniforms[m.name.replace(/\[0\]$/,"")]=n.getUniformLocation(l.program,m.name))}return!0},bo=n=>{let l=String(n||"#ffffff").replace("#","").trim();(l.length===3||l.length===4)&&(l=l.slice(0,3).split("").map(c=>c+c).join(""));const u=parseInt(l.slice(0,6),16);return Number.isNaN(u)?[1,1,1]:[(u>>16&255)/255,(u>>8&255)/255,(u&255)/255]},Mo=(n,l)=>{const u=Math.cos(l),c=[Math.sin(n)*u,-Math.sin(l),Math.cos(n)*u],m=[Math.cos(n),0,-Math.sin(n)],g=[c[1]*m[2]-c[2]*m[1],c[2]*m[0]-c[0]*m[2],c[0]*m[1]-c[1]*m[0]];return{f:c,r:m,u:g}},rt=n=>S(.4877/n,ao,.6),Ro=({eye:n,f:l,r:u,u:c},m,g)=>{const _=1/rt(m),$=1/(he-ke),K=[u[0],c[0],-l[0],0,u[1],c[1],-l[1],0,u[2],c[2],-l[2],0,-(u[0]*n[0]+u[1]*n[1]+u[2]*n[2]),-(c[0]*n[0]+c[1]*n[1]+c[2]*n[2]),l[0]*n[0]+l[1]*n[1]+l[2]*n[2],1],X=[_/m,0,0,0,0,_,0,0,0,0,(ke+he)*$,-1,0,0,2*ke*he*$,0];for(let B=0;B<4;B++)for(let I=0;I<4;I++){let G=0;for(let ue=0;ue<4;ue++)G+=X[ue*4+I]*K[B*4+ue];g[B*4+I]=G}return g},Do=({color:n="#4f7cff",lineCount:l=22,lineWidth:u=1.2,majorLines:c=!0,elevation:m=1,foreground:g=.2,scale:_=1,detail:$=.35,tilt:K=32,speed:X=.25,direction:B="forward",morph:I=.2,glow:G=.6,depthOfField:ue=.4,fog:It=.35,brightness:Ot=1,opacity:zt=1,mouseInteraction:kt=!0,hoverEffect:it="lift",mouseRadius:Ut=1,mouseStrength:Ht=.6,trail:Xt=.3,parallax:Gt=.5,clickEffect:Vt="pulse",markers:Zt="none",glitch:jt=0,intro:qt=!0,lightMode:$t=!1,dpr:Kt,className:Wt="",style:Yt})=>{const nt=te.useRef(null),at=te.useRef(null),Ge=te.useRef(null),Se=te.useRef(0),[Qt,Jt]=te.useState(0),ut={color:n,lineCount:S(l,2,80),lineWidth:Math.max(.2,u),majorLines:c,elevation:S(m,0,3),foreground:S(g,0,1),scale:S(_,.2,5),detail:S($,0,1),tilt:S(K,12,90),speed:X,direction:_t[B]??_t.forward,morph:Math.max(0,I),glow:Math.max(0,G),depthOfField:S(ue,0,1),fog:S(It,0,1),brightness:Math.max(0,Ot),opacity:S(zt,0,1),mouseInteraction:kt,hoverEffect:lo.includes(it)?it:"lift",mouseRadius:Math.max(.1,Ut),mouseStrength:Math.max(0,Ht),trail:S(Xt,0,1),parallax:S(Gt,0,1),clickEffect:Vt,markers:fo[Zt]??-1,glitch:S(jt,0,1),intro:qt,lightMode:$t,dpr:Kt},U=te.useRef(ut);return U.current=ut,te.useEffect(()=>{const ce=nt.current,L=at.current,eo=Math.min(U.current.dpr||window.devicePixelRatio||1,2),e=L?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:eo<1.5,depth:!0,stencil:!1,powerPreference:"high-performance"});if(!ce||!L||!e)return;cancelAnimationFrame(Se.current),Se.current=0;const Ce=e.getExtension("KHR_parallel_shader_compile"),de=!!e.getExtension("EXT_color_buffer_float"),ve=ne(e,ho(de),vo(de));let W=de?ne(e,Me,mo):null,Y=de?ne(e,Me,go):null;const oe=ne(e,Me,Eo),Q=ne(e,Me,yo),pe=ne(e,Me,wo),xe=ne(e,po,xo);if(!ve||!oe||!Q||!pe||!xe)return;const Ve=()=>[ve,W,Y,oe,Q,pe,xe].filter(Boolean),ct=()=>!Ce||Ve().every(t=>e.getProgramParameter(t.program,Ce.COMPLETION_STATUS_KHR)),lt=t=>!t||Nt(e,t)?t:(e.deleteProgram(t.program),null),ft=()=>(W=lt(W),Y=lt(Y),[ve,oe,Q,pe,xe].every(t=>Nt(e,t)));if(!Ce&&!ft()){Ve().forEach(t=>e.deleteProgram(t.program));return}const st=t=>t.preventDefault(),mt=()=>Jt(t=>t+1);L.addEventListener("webglcontextlost",st),L.addEventListener("webglcontextrestored",mt);const ht=e.createVertexArray(),to=de?e.RGBA16F:e.RGBA8,ge=(t,r,i,f)=>{const a=e.createTexture();return e.bindTexture(e.TEXTURE_2D,a),e.texStorage2D(e.TEXTURE_2D,1,i,t,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,f),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,f),a},Ze=()=>({texture:null,framebuffer:e.createFramebuffer(),depth:null,width:0,height:0}),je=(t,r,i,f)=>{t.texture&&t.width===r&&t.height===i||(t.texture&&e.deleteTexture(t.texture),t.texture=ge(r,i,to,e.CLAMP_TO_EDGE),t.width=r,t.height=i,e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0),f&&(t.depth||(t.depth=e.createRenderbuffer()),e.bindRenderbuffer(e.RENDERBUFFER,t.depth),e.renderbufferStorage(e.RENDERBUFFER,e.DEPTH_COMPONENT24,r,i),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,t.depth)))},Le=Ze(),Ae=Array.from({length:Dt},()=>[Ze(),Ze()]);let P=Y?[0,1].map(()=>{const t=ge(Re,Re,e.RG16F,e.REPEAT),r=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,r),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),{texture:t,framebuffer:r}}):null;const Ee=ge(1,1,e.RGBA8,e.REPEAT),E={texture:null,heights:null,framebuffer:e.createFramebuffer(),width:0,height:0};let le=0;const oo=(t,r)=>{E.texture&&t<=E.width&&r<=E.height||(E.texture&&e.deleteTexture(E.texture),E.heights&&e.deleteTexture(E.heights),E.width=Math.max(t,Math.ceil(E.width*1.25),64),E.height=Math.max(r,Math.ceil(E.height*1.25),64),E.texture=ge(E.width,E.height,e.RGBA16F,e.CLAMP_TO_EDGE),E.heights=ge(E.width,E.height,e.R32F,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,E.heights),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.bindFramebuffer(e.FRAMEBUFFER,E.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,E.texture,0),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT1,e.TEXTURE_2D,E.heights,0),e.drawBuffers([e.COLOR_ATTACHMENT0,e.COLOR_ATTACHMENT1]))},V=(t,r)=>{e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,r)},J=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,qe=new Float32Array(16),ye=new Float32Array(He*4),fe=new Float32Array(12),N={until:0,next:1.5,roll:0,seed:0};let $e=7919;const Z=()=>($e=$e*16807%2147483647,($e-1)/2147483646),q=[],O={x:0,y:0,inside:!1},h={width:1,height:1,ratio:1,cell:.05,cellKey:""},o={intro:U.current.intro&&!J?0:1,rise:1,travelX:0,travelZ:0,morph:0,yaw:0,pitch:0,yawVelocity:0,pitchVelocity:0,presence:0,focus:At,hit:null,brushFrom:null,sculptLife:0,burst:null,level:0,trace:0,clock:0,tilt:U.current.tilt,elevation:U.current.elevation,scale:U.current.scale};o.rise=ie(o.intro);let se=0,De=0,_e=!0,Pe=0,Be=!Ce,dt=!1;const Ke=()=>{const t=Math.min(o.tilt*Math.PI/180+o.pitch,Math.PI/2-1e-4),r=Mo(o.yaw,t),i=o.elevation*Te*o.rise*.18,f=o.elevation*Te*o.rise*1.3+.9,a=Math.max(At,(f-i)/Math.sin(t));return{...r,distance:a,eye:[-r.f[0]*a,i-r.f[1]*a,-r.f[2]*a]}},We=(t,r,i)=>{const f=h.width/h.height,a=rt(f),v=[0,1,2].map(d=>t.f[d]+t.r[d]*r*a*f+t.u[d]*i*a),R=Math.hypot(v[0],v[1],v[2]);return v.map(d=>d/R)},Ye=(t,r)=>r[0]*t.f[0]+r[1]*t.f[1]+r[2]*t.f[2],Qe=(t,r)=>{const i=We(t,0,r);return i[1]>-.001?1/0:t.eye[1]/-i[1]*Ye(t,i)},vt=(t,r)=>[Qe(t,-1)*.9,t.distance,r.foreground],ro=(t,r,i,f)=>{const a=(i-t.eye[0])*t.f[0]-t.eye[1]*t.f[1]+(f-t.eye[2])*t.f[2];return r[2]+(1-r[2])*ie((a-r[0])/Math.max(r[1]-r[0],.001))},pt=(t,r,i,f)=>{const a=We(t,i,f),v=o.elevation*Te*o.rise,R=be/o.scale,d=vt(t,r),w=x=>{const z=t.eye[0]+a[0]*x,M=t.eye[2]+a[2]*x,re=Pt(o.travelX+z,o.travelZ+M,R,o.morph*.37,o.morph*.23);return t.eye[1]+a[1]*x-re*v*ro(t,d,z,M)};let b=he,A=w(b);for(let x=0;x<200&&b<ke*.5;x++){const z=b+Math.max(.02,A*.4),M=w(z);if(M<0){let re=b,k=z;for(let we=0;we<10;we++){const T=(re+k)*.5;w(T)<0?k=T:re=T}return{x:o.travelX+t.eye[0]+a[0]*k,y:t.eye[1]+a[1]*k,z:o.travelZ+t.eye[2]+a[2]*k,depth:k*Ye(t,a)}}b=z,A=M}return null},io=(t,r,i)=>{const f=o.elevation*Te*o.rise*1.7+.2+r.mouseStrength,a={minX:1/0,maxX:-1/0,minZ:1/0,maxZ:-1/0,near:1/0},v=(R,d)=>{const w=t.eye[0]+R[0]*d,b=t.eye[2]+R[2]*d;a.minX=Math.min(a.minX,w),a.maxX=Math.max(a.maxX,w),a.minZ=Math.min(a.minZ,b),a.maxZ=Math.max(a.maxZ,b)};for(const R of[-1.08,0,1.08])for(const d of[-1.08,1.08]){const w=We(t,R,d),b=Math.max(Ye(t,w),.001);let A=he,x=i*1.05/b;w[1]<-1e-4&&(A=Math.max(he,(t.eye[1]-f)/-w[1]),x=Math.min(x,t.eye[1]/-w[1])),A=Math.min(A,x),v(w,A),v(w,x),a.near=Math.min(a.near,A*b)}return a},xt=(t,r)=>{const i=Math.floor(o.travelX/r),f=Math.floor(o.travelZ/r),a=o.travelX-i*r,v=o.travelZ-f*r,R=Math.floor((t.minX+a)/r)-2,d=Math.floor((t.minZ+v)/r)-2,w=S(Math.ceil((t.maxX+a)/r)+2-R,1,4e3),b=S(Math.ceil((t.maxZ+v)/r)+2-d,1,Math.floor(ot*1.5/w));return{cell:r,camX:i,camZ:f,fracX:a,fracZ:v,k0:R,m0:d,columns:w,rows:b}},Je=()=>{if(!Be)return;const t=Oe(U.current),r=Ke();Ro(r,h.width/h.height,qe);const i=Qe(r,-1),f=Math.min(Qe(r,1),r.distance*3.2),a=Math.max(f,i*1.6,r.distance*1.4),v=a+(i*1.8-a)*t.fog,R=v*.7+(i*.7-v*.7)*t.fog,d=io(r,t,v),w=`${h.width}x${h.height}@${h.ratio}|${Math.round(o.tilt/4)}|${Math.round(o.elevation*5)}|${t.fog}`;if(w!==h.cellKey){h.cellKey=w;const y=h.height*h.ratio*.5/rt(h.width/h.height);let C=S(14*Math.max(d.near,.5)/y,.02,.4);const F=(d.maxX-d.minX)*(d.maxZ-d.minZ)/(C*C);F>ot&&(C*=Math.sqrt(F/ot)),h.cell=C}const b=bo(t.color),A=o.elevation*Te*o.rise,x=xt(d,h.cell),z=vt(r,t),M=t.markers>=0?xt(d,so):null,k=(o.hit&&t.mouseInteraction?o.presence:0)*(.35+.5*t.mouseStrength),we=t.depthOfField*h.height*.016,T=ie(o.intro/.35),H=o.hit?o.hit.x:0,me=o.hit?o.hit.z:0;if(ye.fill(0),q.forEach((y,C)=>{ye.set([y.x,y.z,y.age*4.2,Math.exp(-y.age*1.1)*ie(y.age/.08)],C*4)}),e.bindVertexArray(ht),W){const y=x.columns+7,C=x.rows+7;oo(y,C),e.bindFramebuffer(e.FRAMEBUFFER,E.framebuffer),e.viewport(0,0,y,C),e.useProgram(W.program);const F=W.uniforms;V(0,P?P[le].texture:Ee),e.uniform1i(F.uSculpt,0),e.uniform1f(F.uSculptOn,P?1:0),e.uniform1f(F.uFrequency,be/o.scale),e.uniform2f(F.uMorph,o.morph*.37,o.morph*.23),e.uniform4fv(F.uPulses,ye),e.uniform2i(F.uBase,x.k0-2+x.camX,x.m0-2+x.camZ),e.uniform1f(F.uCell,x.cell),e.uniform1f(F.uDetail,t.detail),e.disable(e.DEPTH_TEST),e.disable(e.BLEND),e.drawArrays(e.TRIANGLES,0,3)}const Fe=(y,C,F,D)=>{e.viewport(0,0,C,F),e.useProgram(ve.program);const s=ve.uniforms;if(V(0,W?E.texture:Ee),e.uniform1i(s.uField,0),V(1,W?E.heights:Ee),e.uniform1i(s.uHeightField,1),e.uniform1f(s.uFrequency,be/o.scale),e.uniform2f(s.uMorph,o.morph*.37,o.morph*.23),e.uniform4fv(s.uPulses,ye),e.uniform2i(s.uOrigin,x.k0,x.m0),e.uniform2i(s.uCamCell,x.camX,x.camZ),e.uniform2f(s.uCamFrac,x.fracX,x.fracZ),e.uniform1f(s.uCell,x.cell),e.uniform1i(s.uStride,D),e.uniform1f(s.uHeight,A),e.uniform3fv(s.uEye,r.eye),e.uniform3fv(s.uForward,r.f),e.uniform3fv(s.uNear,z),e.uniform1f(s.uRefDepth,r.distance),e.uniformMatrix4fv(s.uViewProj,!1,qe),e.uniform1f(s.uDetail,t.detail),e.uniform1f(s.uLines,t.lineCount),e.uniform1f(s.uLineWidth,t.lineWidth*y),e.uniform1f(s.uMajor,t.majorLines?1:0),e.uniform3fv(s.uColor,b),e.uniform1f(s.uBrightness,t.brightness),e.uniform2f(s.uFade,R,v),e.uniform3f(s.uFocus,o.focus,we*y,h.height*.03*y),e.uniform4f(s.uHeat,H,me,.9*t.mouseRadius,k),e.uniform4f(s.uLamp,H,o.hit?o.hit.y+1.4:0,me,k),e.uniform4f(s.uTrace,o.level,o.trace,H,me),e.uniform3fv(s.uSun,co),e.uniform1f(s.uReveal,T),e.uniform1f(s.uLightMode,t.lightMode?1:0),e.uniform1f(s.uOpacity,t.opacity),e.uniform4fv(s.uGlitch,fe),e.uniform1f(s.uGlitchSeed,N.seed),e.uniform1f(s.uPixel,y),e.enable(e.DEPTH_TEST),e.depthFunc(e.LESS),e.disable(e.BLEND),e.clearColor(0,0,0,0),e.clearDepth(1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,2*(Math.ceil(x.columns/D)+1),Math.ceil(x.rows/D)),M){e.useProgram(xe.program);const p=xe.uniforms;V(2,P?P[le].texture:Ee),e.uniform1i(p.uSculpt,2),e.uniform1f(p.uSculptOn,P?1:0),e.uniform1f(p.uFrequency,be/o.scale),e.uniform2f(p.uMorph,o.morph*.37,o.morph*.23),e.uniform4fv(p.uPulses,ye),e.uniform3fv(p.uEye,r.eye),e.uniform3fv(p.uForward,r.f),e.uniform3fv(p.uNear,z),e.uniform2i(p.uOrigin,M.k0,M.m0),e.uniform2i(p.uCamCell,M.camX,M.camZ),e.uniform2f(p.uCamFrac,M.fracX,M.fracZ),e.uniform1f(p.uSpacing,M.cell),e.uniform1i(p.uColumns,M.columns+1),e.uniform1f(p.uHeight,A),e.uniformMatrix4fv(p.uViewProj,!1,qe),e.uniform2f(p.uView,C,F),e.uniform1f(p.uSize,4*y),e.uniform1f(p.uRefDepth,r.distance),e.uniform4f(p.uHeat,H,me,1.2*t.mouseRadius,k),e.uniform1f(p.uTime,o.clock),e.uniform4fv(p.uGlitch,fe),e.uniform1f(p.uPixel,y),e.uniform3fv(p.uColor,b),e.uniform2f(p.uFade,R,v),e.uniform1f(p.uReveal,T),e.uniform1f(p.uBrightness,t.brightness),e.uniform1f(p.uLightMode,t.lightMode?1:0),e.uniform1f(p.uOpacity,t.opacity),e.uniform1f(p.uStyle,t.markers),e.depthFunc(e.LEQUAL),e.depthMask(!1),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,(M.columns+1)*(M.rows+1)),e.disable(e.BLEND),e.depthMask(!0)}e.disable(e.DEPTH_TEST)},Ie=t.glow>.001;if(Ie){const y=Math.max(1,Math.round(h.width/2)),C=Math.max(1,Math.round(h.height/2));je(Le,y,C,!0),Ae.forEach((D,s)=>{const p=Math.max(1,Math.round(h.width/2**(s+2))),Ct=Math.max(1,Math.round(h.height/2**(s+2)));je(D[0],p,Ct,!1),je(D[1],p,Ct,!1)}),e.bindFramebuffer(e.FRAMEBUFFER,Le.framebuffer),Fe(.5,y,C,2);let F=Le;Ae.forEach(([D,s])=>{e.bindFramebuffer(e.FRAMEBUFFER,D.framebuffer),e.viewport(0,0,D.width,D.height),e.useProgram(oe.program),V(0,F.texture),e.uniform1i(oe.uniforms.uSource,0),e.uniform2f(oe.uniforms.uTarget,D.width,D.height),e.uniform2f(oe.uniforms.uTexel,1/F.width,1/F.height),e.drawArrays(e.TRIANGLES,0,3),e.useProgram(Q.program),e.uniform1i(Q.uniforms.uSource,0),e.uniform2f(Q.uniforms.uTarget,s.width,s.height),e.bindFramebuffer(e.FRAMEBUFFER,s.framebuffer),V(0,D.texture),e.uniform2f(Q.uniforms.uStep,1/D.width,0),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,D.framebuffer),V(0,s.texture),e.uniform2f(Q.uniforms.uStep,0,1/s.height),e.drawArrays(e.TRIANGLES,0,3),F=D})}if(e.bindFramebuffer(e.FRAMEBUFFER,null),Fe(h.ratio,L.width,L.height,1),Ie){e.viewport(0,0,L.width,L.height),e.useProgram(pe.program);const y=pe.uniforms;Ae.forEach(([C],F)=>{V(F,C.texture),e.uniform1i(y[`uBloom${F}`],F)}),e.uniform2f(y.uView,L.width,L.height),e.uniform1f(y.uGlow,t.glow*T),e.uniform1f(y.uLightMode,t.lightMode?1:0),e.enable(e.BLEND),t.lightMode?e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA):e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,3),e.disable(e.BLEND)}for(let y=Dt;y>=0;y--)V(y,null)},no=(t,r)=>{if(!P||!Y)return!1;const i=t.mouseInteraction&&t.hoverEffect==="lift"&&o.presence>.001?o.hit:null,f=o.burst;if(!i&&!f&&o.sculptLife<=0)return!1;const a=o.brushFrom||i,v=P[le],R=P[1-le];e.bindFramebuffer(e.FRAMEBUFFER,R.framebuffer),e.viewport(0,0,Re,Re),e.useProgram(Y.program);const d=Y.uniforms;if(V(0,v.texture),e.uniform1i(d.uPrevious,0),i&&a?e.uniform4f(d.uSegment,a.x,a.z,i.x,i.z):e.uniform4f(d.uSegment,0,0,0,0),e.uniform4f(d.uBrush,1.1*t.mouseRadius,.9*t.mouseStrength,1-Math.exp(-r*7),i?o.presence:0),f){const b=ie(f.age/.7);f.age+=r;const A=(ie(f.age/.7)-b)*.9*Math.max(t.mouseStrength,.3);e.uniform4f(d.uBurst,f.x,f.z,1.6*t.mouseRadius,A),f.age>=.7&&(o.burst=null)}else e.uniform4f(d.uBurst,0,0,1,0);const w=.25+3*t.trail*t.trail;return e.uniform2f(d.uDecay,Math.exp(-r/w),Math.exp(-r/.7)),e.disable(e.BLEND),e.drawArrays(e.TRIANGLES,0,3),le=1-le,o.brushFrom=i?{x:i.x,z:i.z}:null,i||f?o.sculptLife=w*6:o.sculptLife-=r,!0};let gt=U.current.dpr;const et=()=>{const t=Oe(U.current);gt=t.dpr,h.width=Math.max(1,ce.clientWidth),h.height=Math.max(1,ce.clientHeight),h.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),L.width=Math.max(1,Math.round(h.width*h.ratio)),L.height=Math.max(1,Math.round(h.height*h.ratio)),Je(),ee()},tt=t=>{if(se=0,!_e||document.hidden)return;if(!Be){if(e.isContextLost())return;if(!ct()){se=requestAnimationFrame(tt);return}if(!ft()){St();return}!Y&&P&&(P.forEach(T=>{e.deleteTexture(T.texture),e.deleteFramebuffer(T.framebuffer)}),P=null),Be=!0,Je()}const r=Oe(U.current);r.dpr!==gt&&et();const i=De?S((t-De)/1e3,0,1/20):1/60;De=t,!r.intro||J?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+i/uo)),o.rise=ie(o.intro);const f=J?1:1-Math.exp(-i/.4);o.tilt+=(r.tilt-o.tilt)*f,o.elevation+=(r.elevation-o.elevation)*f,o.scale=r.scale,o.clock+=i;const a=J?0:r.glitch;if(a>0)if(o.clock>=N.next&&o.clock>=N.until&&(N.until=o.clock+.1+Z()*.22*(.5+a),N.next=N.until+(9-7.4*a)*(.45+Z()*1.1),N.roll=0),o.clock<N.until){if(o.clock>=N.roll){fe.fill(0);const T=1+Math.floor(Z()*3);for(let H=0;H<T;H++){const me=3+Z()*Z()*h.height*.14,Fe=Z()*h.height,Ie=(Z()-.5)*2*(10+46*a);fe.set([Fe,Fe+me,Ie,1+Z()*3*a],H*4)}N.seed=Z(),N.roll=o.clock+.04+Z()*.05}}else fe.fill(0);else fe.fill(0);J||(o.travelX+=r.direction[0]*r.speed*.8*i,o.travelZ+=r.direction[1]*r.speed*.8*i,o.morph+=r.morph*.12*i);const v=O.inside&&r.mouseInteraction;o.presence+=((v?1:0)-o.presence)*(1-Math.exp(-i/(v?.18:.45)));const R=O.x/h.width*2-1,d=1-O.y/h.height*2,w=J||!v?0:r.parallax,b=R*w*.09,A=-d*w*.045;o.yawVelocity+=(38*(b-o.yaw)-11*o.yawVelocity)*i,o.pitchVelocity+=(38*(A-o.pitch)-11*o.pitchVelocity)*i,o.yaw+=o.yawVelocity*i,o.pitch+=o.pitchVelocity*i;const x=Ke();v?(o.hit=pt(x,r,R,d),o.hit&&o.brushFrom&&Math.hypot(o.hit.x-o.brushFrom.x,o.hit.z-o.brushFrom.z)>3*r.mouseRadius&&(o.brushFrom=null)):o.presence<.002&&(o.hit=null,o.brushFrom=null);const z=o.hit&&r.mouseInteraction&&r.hoverEffect==="trace"?o.presence:0;if(o.hit){const T=be/o.scale,H=Pt(o.hit.x,o.hit.z,T,o.morph*.37,o.morph*.23)+r.detail*.1*To(o.hit.x,o.hit.z,T);o.level=o.trace<.01?H:o.level+(H-o.level)*(1-Math.exp(-i/.09))}o.trace+=(z-o.trace)*(1-Math.exp(-i/.2));const M=o.hit&&r.depthOfField>0?o.hit.depth:x.distance;o.focus+=(M-o.focus)*(1-Math.exp(-i/.35));for(let T=q.length-1;T>=0;T--)q[T].age+=i,q[T].age>4&&q.splice(T,1);const re=no(r,i);Je();const k=Math.abs(r.tilt-o.tilt)>.01||Math.abs(r.elevation-o.elevation)>1e-4||Math.abs(o.yaw-b)>1e-4||Math.abs(o.pitch-A)>1e-4||Math.abs(o.yawVelocity)>1e-4||Math.abs(o.pitchVelocity)>1e-4||Math.abs(M-o.focus)>.001||Math.abs(z-o.trace)>.001;Pe=!J&&(r.speed!==0||r.morph!==0||r.glitch>0||r.markers>=0)||o.intro<1||q.length>0||re||k||o.presence>.001&&o.presence<.999?0:Pe+i,Pe<.5&&(se=requestAnimationFrame(tt))};function ee(){Pe=0,!se&&_e&&!document.hidden&&(De=0,se=requestAnimationFrame(tt))}const Et=t=>{const r=ce.getBoundingClientRect(),i=t.clientX-r.left,f=t.clientY-r.top;return{x:i,y:f,inside:i>=0&&f>=0&&i<=r.width&&f<=r.height}},yt=t=>{const{x:r,y:i,inside:f}=Et(t),a=O.inside;O.inside=f,f&&(O.x=r,O.y=i),(f||a)&&ee()},wt=t=>{const r=Oe(U.current),{x:i,y:f,inside:a}=Et(t);if(!a||(O.x=i,O.y=f,O.inside=!0,ee(),r.glitch>0&&!J&&(N.until=o.clock+.16,N.roll=0),!r.mouseInteraction||r.clickEffect!=="pulse"&&r.clickEffect!=="peak"))return;const v=pt(Ke(),r,i/h.width*2-1,1-f/h.height*2);v&&(r.clickEffect==="peak"&&P?o.burst={x:v.x,z:v.z,age:0}:r.clickEffect==="pulse"&&(q.length>=He&&q.shift(),q.push({x:v.x,z:v.z,age:0})))},Ne=t=>{t.pointerType==="touch"&&(O.inside=!1,ee())},Ft=()=>{O.inside=!1,ee()},Tt=()=>ee(),bt=new ResizeObserver(et);bt.observe(ce);const Mt=new IntersectionObserver(t=>{_e=t.some(r=>r.isIntersecting),_e&&ee()});Mt.observe(ce),j(window).addEventListener("pointermove",yt,{passive:!0}),j(window).addEventListener("pointerdown",wt,{passive:!0}),j(window).addEventListener("pointerup",Ne,{passive:!0}),j(window).addEventListener("pointercancel",Ne,{passive:!0}),j(document.documentElement).addEventListener("pointerleave",Ft),document.addEventListener("visibilitychange",Tt);const Rt=()=>{if(!e.isContextLost()){if(!Be&&!ct()){requestAnimationFrame(Rt);return}Ve().forEach(t=>e.deleteProgram(t.program))}},St=()=>{dt||(dt=!0,cancelAnimationFrame(se),Ge.current=null,bt.disconnect(),Mt.disconnect(),j(window).removeEventListener("pointermove",yt),j(window).removeEventListener("pointerdown",wt),j(window).removeEventListener("pointerup",Ne),j(window).removeEventListener("pointercancel",Ne),j(document.documentElement).removeEventListener("pointerleave",Ft),document.removeEventListener("visibilitychange",Tt),L.removeEventListener("webglcontextlost",st),L.removeEventListener("webglcontextrestored",mt),[Le,...Ae.flat()].forEach(t=>{t.texture&&e.deleteTexture(t.texture),t.depth&&e.deleteRenderbuffer(t.depth),e.deleteFramebuffer(t.framebuffer)}),P?.forEach(t=>{e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer)}),e.deleteTexture(Ee),e.deleteVertexArray(ht),E.texture&&e.deleteTexture(E.texture),E.heights&&e.deleteTexture(E.heights),e.deleteFramebuffer(E.framebuffer),Rt())};return et(),Ge.current=ee,()=>{St();const t=()=>{Se.current=0,!L.isConnected&&!e.isContextLost()&&e.getExtension("WEBGL_lose_context")?.loseContext()};L.isConnected?Se.current=requestAnimationFrame(t):t()}},[Qt]),te.useEffect(()=>{Ge.current?.()}),Lt.jsx("div",{ref:nt,className:`topography-container ${Wt}`.trim(),style:Yt,children:Lt.jsx("canvas",{ref:at,className:"topography-canvas","aria-hidden":"true"})})};export{Do as default};
