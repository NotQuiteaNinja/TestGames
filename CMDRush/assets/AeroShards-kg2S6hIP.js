import{r as oo,j as ra}from"./index-uEvbEw5g.js";import{b as ge}from"./App-Dofw4Ib9.js";import{b as ko}from"./_cmdrushBeat-CLoDPAAd.js";import{i as aa,s as na,a as sa,t as Qe,u as xe,d as oe,b as yr,f as ia}from"./index-DZzSo1_V.js";import"./react-vendor-DHz4kLit.js";const ca="aero-shards",la="aero-shards-canvas",Ao=["full","left","right","center"],Ro={glass:[0,0,0,0],chrome:[1,0,0,0]},et=24,$=160,Y=4,ro=3.1,fa=2.75,pa=[1,.5],br=1,le=[2.7,3.9,5.6,8.1,11.6],ha=[.26,.23,.2,.17,.14],da=[1,1.3,1.8,2.6,3.6],wr=[1,.8,.52,.32,.2],U=le.length,Eo=3.4,ma={plus:0,dots:1},Lo=8,ua=[[.37,.61],[.83,.12],[.21,.88],[.66,.44],[.05,.27]],va=4,Mr=2.6,ga=4,xa=[[.2,-.78],[-.72,.02],[.58,-.06],[-.24,.62],[.8,.3]],ya=[.84,.62,.44,.28,.14],ba=[[.98,.78],[.9,.7],[.84,.64],[.8,.6],[.76,.56]],O=Math.PI*2,zr=`
struct Frame {
  view: vec4f,
  eye: vec4f,
  forward: vec4f,
  right: vec4f,
  up: vec4f,
  shard: vec4f,
  accent: vec4f,
  marker: vec4f,
  surface: vec4f,
}

struct Layer {
  view: vec4f,
  look: vec4f,
}

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) @interpolate(flat, first) center: vec4f,
  @location(1) @interpolate(flat, first) axis: vec4f,
  @location(2) @interpolate(flat, first) normal: vec4f,
  @location(3) @interpolate(flat, first) p01: vec4f,
  @location(4) @interpolate(flat, first) p23: vec4f,
  @location(5) @interpolate(flat, first) p4: vec4f,
  @location(6) @interpolate(flat, first) topA: vec4f,
  @location(7) @interpolate(flat, first) topB: vec4f,
  @location(8) @interpolate(flat, first) topC: vec4f,
  @location(9) @interpolate(flat, first) bottomA: vec4f,
  @location(10) @interpolate(flat, first) bottomB: vec4f,
  @location(11) @interpolate(flat, first) bottomC: vec4f,
}

struct FragmentOut {
  @location(0) color: vec4f,
  @builtin(frag_depth) depth: f32,
}

@group(0) @binding(0) var<uniform> scene: Frame;
@group(0) @binding(1) var<storage, read> shards: array<vec4f>;
@group(0) @binding(2) var<uniform> layerInfo: Layer;

fn project(world: vec3f) -> vec3f {
  let offset = world - scene.eye.xyz;
  let depth = max(dot(offset, scene.forward.xyz), 0.05);
  let x = dot(offset, scene.right.xyz);
  let y = dot(offset, scene.up.xyz);
  return vec3f(layerInfo.view.x * 0.5 + x * layerInfo.view.z / depth, layerInfo.view.y * 0.5 - y * layerInfo.view.z / depth, depth);
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> VertexOut {
  let index = instance * 6u;
  let a = shards[index];
  let b = shards[index + 1u];
  let c = shards[index + 2u];
  let d = shards[index + 3u];
  let e = shards[index + 4u];
  let f = shards[index + 5u];
  let center = a.xyz;
  let size = a.w;
  let axis = normalize(b.xyz);
  let normal = normalize(c.xyz);
  let side = normalize(cross(normal, axis));

  var out: VertexOut;
  let middle = project(center);
  if (middle.z < 0.35 || size <= 0.0) {
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);
    return out;
  }

  let count = i32(f.z);
  let points = array<vec2f, 5>(d.xy, d.zw, e.xy, e.zw, f.xy);
  var low = vec2f(1e9);
  var high = vec2f(-1e9);
  var tops = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));
  var bottoms = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));
  for (var i = 0; i < 5; i += 1) {
    let corner = points[min(i, count - 1)];
    let onPlate = center + (axis * corner.x + side * corner.y) * size;
    let top = project(onPlate + normal * b.w * size);
    let bottom = project(onPlate - normal * b.w * size);
    tops[i] = top.xy;
    bottoms[i] = bottom.xy;
    low = min(low, min(top.xy, bottom.xy));
    high = max(high, max(top.xy, bottom.xy));
  }
  low -= vec2f(2.0);
  high += vec2f(2.0);
  let corners = array<vec2f, 6>(vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0), vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0));
  let pixel = mix(low, high, corners[vertexIndex]);
  out.position = vec4f(pixel.x / layerInfo.view.x * 2.0 - 1.0, 1.0 - pixel.y / layerInfo.view.y * 2.0, 0.5, 1.0);
  out.center = a;
  out.axis = vec4f(axis, b.w);
  out.normal = vec4f(normal, c.w);
  out.p01 = d;
  out.p23 = e;
  out.p4 = f;
  out.topA = vec4f(tops[0], tops[1]);
  out.topB = vec4f(tops[2], tops[3]);
  out.topC = vec4f(tops[4], 0.0, 0.0);
  out.bottomA = vec4f(bottoms[0], bottoms[1]);
  out.bottomB = vec4f(bottoms[2], bottoms[3]);
  out.bottomC = vec4f(bottoms[4], 0.0, 0.0);
  return out;
}

fn cross2(a: vec2f, b: vec2f) -> f32 {
  return a.x * b.y - a.y * b.x;
}

fn outlineCoverage(p: vec2f, points: array<vec2f, 5>, count: i32) -> f32 {
  var area = 0.0;
  for (var i = 0; i < 5; i += 1) {
    if (i < count) {
      area += cross2(points[i], points[(i + 1) % count]);
    }
  }
  let orient = select(-1.0, 1.0, area > 0.0);
  var distance = -1e9;
  for (var i = 0; i < 5; i += 1) {
    if (i < count) {
      let a = points[i];
      let edge = points[(i + 1) % count] - a;
      let span = length(edge);
      if (span > 1e-4) {
        let n = vec2f(edge.y, -edge.x) * (orient / span);
        distance = max(distance, dot(p - a, n));
      }
    }
  }
  return clamp(0.5 - distance, 0.0, 1.0);
}

struct Prism {
  points: array<vec2f, 5>,
  count: i32,
  half: f32,
}

struct Hit {
  near: f32,
  far: f32,
  normal: vec3f,
}

fn plane(prism: Prism, k: i32) -> vec4f {
  if (k == 0) { return vec4f(0.0, 0.0, 1.0, prism.half); }
  if (k == 1) { return vec4f(0.0, 0.0, -1.0, prism.half); }
  let a = prism.points[k - 2];
  let b = prism.points[(k - 1) % prism.count];
  let edge = b - a;
  let n = normalize(vec2f(edge.y, -edge.x));
  return vec4f(n, 0.0, dot(n, a));
}

fn trace(prism: Prism, ro: vec3f, rd: vec3f) -> Hit {
  var hit: Hit;
  hit.near = -1e9;
  hit.far = 1e9;
  hit.normal = vec3f(0.0, 0.0, 1.0);
  for (var k = 0; k < 7; k += 1) {
    if (k < prism.count + 2) {
      let p = plane(prism, k);
      let denom = dot(p.xyz, rd);
      let gap = p.w - dot(p.xyz, ro);
      if (abs(denom) < 1e-7) {
        if (gap < 0.0) { hit.far = -1e9; }
      } else {
        let t = gap / denom;
        if (denom < 0.0) {
          if (t > hit.near) {
            hit.near = t;
            hit.normal = p.xyz;
          }
        } else if (t < hit.far) {
          hit.far = t;
        }
      }
    }
  }
  return hit;
}

fn exitFrom(prism: Prism, ro: vec3f, rd: vec3f) -> vec4f {
  var best = 1e9;
  var normal = vec3f(0.0, 0.0, -1.0);
  for (var k = 0; k < 7; k += 1) {
    if (k < prism.count + 2) {
      let p = plane(prism, k);
      let denom = dot(p.xyz, rd);
      if (denom > 1e-6) {
        let t = (p.w - dot(p.xyz, ro)) / denom;
        if (t < best) {
          best = t;
          normal = p.xyz;
        }
      }
    }
  }
  return vec4f(normal, max(best, 0.0));
}

fn rectLight(r: vec3f, dir: vec3f, across: vec3f, extent: vec2f, soft: f32) -> f32 {
  let facing = dot(r, dir);
  if (facing <= 0.0) { return 0.0; }
  let up = cross(dir, across);
  let u = dot(r, across) / facing;
  let v = dot(r, up) / facing;
  let a = 1.0 - smoothstep(extent.x - soft, extent.x + soft, abs(u));
  let b = 1.0 - smoothstep(extent.y - soft, extent.y + soft, abs(v));
  return a * b;
}

const KEY_DIR = vec3f(-0.28, 0.72, 0.64) / length(vec3f(-0.28, 0.72, 0.64));
const KEY_ACROSS = vec3f(0.92, 0.0, 0.4) / length(vec3f(0.92, 0.0, 0.4));
const LEFT_DIR = vec3f(-0.86, 0.12, 0.5) / length(vec3f(-0.86, 0.12, 0.5));
const LEFT_ACROSS = vec3f(0.5, 0.0, 0.86) / length(vec3f(0.5, 0.0, 0.86));
const RIM_DIR = vec3f(0.78, 0.22, -0.58) / length(vec3f(0.78, 0.22, -0.58));
const RIM_ACROSS = vec3f(0.6, 0.0, 0.8) / length(vec3f(0.6, 0.0, 0.8));
const TOP_DIR = vec3f(0.05, 0.94, -0.33) / length(vec3f(0.05, 0.94, -0.33));
const TOP_ACROSS = vec3f(1.0, 0.0, 0.0);

fn lobe(r: vec3f, dir: vec3f, width: f32) -> f32 {
  return exp((dot(r, dir) - 1.0) / (width * width));
}

fn studio(r: vec3f, soft: f32, accent: vec3f, ink: vec3f) -> vec3f {
  let sky = clamp(r.y * 0.5 + 0.5, 0.0, 1.0);
  var col = mix(ink * 0.03, ink * 0.12 + accent * 0.03, smoothstep(0.25, 0.95, sky));
  col += mix(ink, vec3f(1.0), 0.6) * lobe(r, KEY_DIR, 0.38) * 3.6;
  col += mix(accent, vec3f(1.0), 0.2) * lobe(r, RIM_DIR, 0.34) * 3.4;
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.12, 0.8), 0.08 + soft) * 3.2;
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, TOP_DIR, TOP_ACROSS, vec2f(0.9, 0.1), 0.08 + soft) * 2.6;
  return col;
}

fn studioLight(r: vec3f, soft: f32, accent: vec3f) -> vec3f {
  let ground = vec3f(0.2, 0.2, 0.23);
  let skyTone = vec3f(0.97, 0.97, 0.99);
  var col = mix(ground, skyTone, smoothstep(-0.08 - soft, 0.16 + soft, r.y));
  col = mix(col, vec3f(0.55, 0.55, 0.6), lobe(r, vec3f(0.0, -1.0, 0.0), 0.5) * 0.4);
  col += vec3f(0.4) * rectLight(r, KEY_DIR, KEY_ACROSS, vec2f(0.46, 0.3), 0.07 + soft);
  col -= vec3f(0.55) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.1, 0.85), 0.05 + soft);
  col -= vec3f(0.45) * rectLight(r, RIM_DIR, RIM_ACROSS, vec2f(0.12, 0.9), 0.05 + soft);
  return clamp(col, vec3f(0.05), vec3f(1.2));
}

fn schlick(cosine: f32, f0: f32) -> f32 {
  return f0 + (1.0 - f0) * pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);
}

fn rayFor(pixel: vec2f) -> vec3f {
  let x = pixel.x - layerInfo.view.x * 0.5;
  let y = layerInfo.view.y * 0.5 - pixel.y;
  return normalize(scene.forward.xyz * layerInfo.view.z + scene.right.xyz * x + scene.up.xyz * y);
}

struct Surface {
  coverage: f32,
  color: vec3f,
  alpha: f32,
  depth: f32,
}

fn shade(pixel: vec2f, in: VertexOut) -> Surface {
  let center = in.center.xyz;
  let size = in.center.w;
  let axis = in.axis.xyz;
  let plateNormal = in.normal.xyz;
  let side = normalize(cross(plateNormal, axis));
  var prism: Prism;
  prism.points = array<vec2f, 5>(in.p01.xy, in.p01.zw, in.p23.xy, in.p23.zw, in.p4.xy);
  prism.count = i32(in.p4.z);
  prism.half = in.axis.w;

  let eye = scene.eye.xyz;
  let toLocal = mat3x3f(axis.x, side.x, plateNormal.x, axis.y, side.y, plateNormal.y, axis.z, side.z, plateNormal.z);
  let fromLocal = mat3x3f(axis, side, plateNormal);
  let origin = toLocal * (eye - center) / size;

  let rd = rayFor(pixel);
  let ray = toLocal * rd;
  let denom = dot(ray, vec3f(0.0, 0.0, 1.0));
  let flatT = -origin.z / select(denom, 1e-4, abs(denom) < 1e-4);
  let flatPoint = origin.xy + ray.xy * flatT;
  let footprint = max(length(fwidth(flatPoint)) * 0.7, 1e-4);
  let softBase = clamp(length(fwidth(reflect(rd, plateNormal))) * 0.5, 0.0, 0.5);

  let primary = trace(prism, origin, ray);
  let tops = array<vec2f, 5>(in.topA.xy, in.topA.zw, in.topB.xy, in.topB.zw, in.topC.xy);
  let bottoms = array<vec2f, 5>(in.bottomA.xy, in.bottomA.zw, in.bottomB.xy, in.bottomB.zw, in.bottomC.xy);
  let coverage = max(outlineCoverage(pixel, tops, prism.count), outlineCoverage(pixel, bottoms, prism.count));

  var surface: Surface;
  let facing = select(-1.0, 1.0, origin.z > 0.0);
  let capT = (facing * prism.half - origin.z) / select(ray.z, -1e-4 * facing, abs(ray.z) < 1e-4);
  let missed = primary.near > primary.far;
  let hitT = select(primary.near, capT, missed);
  let hitNormal = select(primary.normal, vec3f(0.0, 0.0, facing), missed);
  surface.coverage = select(0.0, coverage, hitT > 0.0);
  surface.color = vec3f(0.0);
  surface.alpha = 0.0;
  surface.depth = 1.0;
  if (surface.coverage <= 0.0) { return surface; }
  let mainRay = ray;

  let local = origin + mainRay * hitT;
  let worldRay = fromLocal * mainRay;
  let viewDepth = max(hitT * size * dot(worldRay, scene.forward.xyz), 0.05);
  surface.depth = clamp(1.0 - 0.3 / viewDepth, 0.0, 1.0);

  let radius = max(prism.half * 1.15, footprint * 2.5);
  var n = hitNormal;
  var bevel = 0.0;
  if (abs(n.z) > 0.5) {
    var gap = 1e9;
    for (var k = 2; k < 7; k += 1) {
      if (k < prism.count + 2) {
        let p = plane(prism, k);
        gap = min(gap, p.w - dot(p.xy, local.xy));
      }
    }
    var toward = vec2f(0.0);
    for (var k = 2; k < 7; k += 1) {
      if (k < prism.count + 2) {
        let p = plane(prism, k);
        let g = p.w - dot(p.xy, local.xy);
        toward += p.xy * exp(-(g - gap) / (radius * 0.35));
      }
    }
    toward = normalize(toward);
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);
    let angle = bevel * bevel * 0.7853982;
    n = normalize(n * cos(angle) + vec3f(toward, 0.0) * sin(angle));
  } else {
    let gap = prism.half - abs(local.z);
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);
    let angle = bevel * bevel * 0.7853982;
    n = normalize(n * cos(angle) + vec3f(0.0, 0.0, sign(local.z)) * sin(angle));
  }
  let bendRate = 1.8 / max(radius / footprint, 1.0);
  let normal = normalize(fromLocal * n);
  let view = -worldRay;
  let reflected = reflect(worldRay, normal);
  let soft = softBase + bendRate * smoothstep(0.0, 0.25, bevel) * 1.2 + clamp(footprint * 0.6, 0.0, 0.5);
  let ndv = clamp(dot(normal, view), 0.0, 1.0);

  let accent = scene.accent.rgb;
  let base = scene.shard.rgb;
  let world = center + fromLocal * local * size;
  let height = clamp(0.5 + world.y * 0.45, 0.0, 1.0);
  let tone = mix(accent, base, height);
  let body = mix(tone, mix(base, accent, 0.5), in.normal.w * 0.3);
  let mode = scene.surface.x;
  let lightMode = scene.up.w > 0.5;
  let wrap = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);

  var color = vec3f(0.0);
  var alpha = 1.0;
  let chrome = mode > 0.5;
  if (lightMode) {
    let env = studioLight(reflected, soft, accent);
    if (chrome) {
      color = env * mix(body, vec3f(1.0), 0.6);
    } else {
      let fresnel = schlick(ndv, 0.05);
      let diffuse = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);
      alpha = clamp(0.32 + fresnel * 0.5 + (1.0 - abs(n.z)) * 0.5, 0.0, 1.0);
      color = mix(body, vec3f(1.0), 0.15) * (0.5 + 0.4 * diffuse) * alpha + (env - vec3f(0.78)) * fresnel * 0.8;
    }
  } else if (chrome) {
    let env = studio(reflected, soft, accent, body);
    color = env * mix(body, vec3f(1.0), 0.55) * 0.9 + body * 0.02;
  } else {
    let fresnel = schlick(ndv, 0.04);
    let env = studio(reflected, soft, accent, body);
    var light = vec3f(0.0);
    var cursor = local;
    var direction = toLocal * refract(worldRay, normal, 1.0 / 1.5);
    var travelled = 0.0;
    var carry = 1.0 - fresnel;
    var through = 0.0;
    for (var bounce = 0; bounce < 3; bounce += 1) {
      let outlet = exitFrom(prism, cursor, direction);
      travelled += outlet.w;
      cursor = cursor + direction * outlet.w;
      let outward = outlet.xyz;
      let escaped = refract(direction, -outward, 1.5);
      if (dot(escaped, escaped) > 0.0) {
        let leave = schlick(dot(direction, outward), 0.04);
        let worldOut = normalize(fromLocal * escaped);
        let absorb = exp(-(vec3f(1.0) - body) * travelled * size * 22.0);
        let straight = smoothstep(0.97, 0.999, dot(worldOut, worldRay));
        let energy = carry * (1.0 - leave);
        light += studio(worldOut, soft * 2.0 + 0.04, accent, body) * absorb * energy * (1.0 - straight) * 2.0;
        through += energy * straight * (absorb.r + absorb.g + absorb.b) / 3.0;
        carry *= leave;
      }
      direction = reflect(direction, outward);
    }
    let edge = max(pow(1.0 - abs(n.z), 1.2), bevel * bevel * 0.85);
    let glow = mix(mix(body, accent, 0.35), vec3f(1.0), 0.28) * edge * (0.35 + 0.45 * wrap);
    color = env * fresnel * 0.85 + light * (1.0 - smoothstep(0.0, 0.6, bevel)) + body * 0.02 + glow;
    alpha = clamp(1.0 - through + edge * 0.25, 0.0, 1.0);
  }

  color *= select(1.3, 1.0, lightMode);
  let haze = smoothstep(3.5, 12.0, viewDepth) * layerInfo.look.x;
  let hazeColor = select(mix(base, accent, 0.5) * 0.3, mix(base, vec3f(1.0), 0.72), lightMode);
  color = mix(color, hazeColor * alpha + color * 0.3, haze);
  let flash = in.p4.w;
  color += mix(accent, vec3f(1.0), 0.35) * flash * select(0.5, 0.0, lightMode) * max(alpha, 0.35);
  alpha = max(alpha, flash * 0.45 * select(1.0, 0.0, lightMode));
  surface.color = color;
  surface.alpha = alpha;
  return surface;
}

@fragment
fn fs_solid(in: VertexOut) -> FragmentOut {
  let surface = shade(in.position.xy, in);
  if (surface.coverage < 0.999 || surface.alpha < 0.6) { discard; }
  var out: FragmentOut;
  out.color = vec4f(surface.color, surface.alpha);
  out.depth = surface.depth;
  return out;
}

@fragment
fn fs_edge(in: VertexOut) -> FragmentOut {
  let surface = shade(in.position.xy, in);
  if (surface.coverage <= 0.001 || (surface.coverage >= 0.9996 && surface.alpha >= 0.62)) { discard; }
  var out: FragmentOut;
  out.color = vec4f(surface.color, surface.alpha) * surface.coverage;
  out.depth = surface.depth;
  return out;
}
`,ot=`
struct ScreenOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs_screen(@builtin(vertex_index) index: u32) -> ScreenOut {
  var corners = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  var coords = array<vec2f, 3>(vec2f(0.0, 1.0), vec2f(2.0, 1.0), vec2f(0.0, -1.0));
  var out: ScreenOut;
  out.position = vec4f(corners[index], 0.0, 1.0);
  out.uv = coords[index];
  return out;
}
`,Sr=`${ot}
struct Spread { texel: vec4f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> spreadInfo: Spread;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let sigma = max(spreadInfo.texel.z, 0.3);
  let reach = min(i32(ceil(sigma * 2.6)), 20);
  var total = textureSampleLevel(source, linearSampler, uv, 0.0);
  var weight = 1.0;
  for (var i = 1; i <= reach; i += 1) {
    let w = exp(-f32(i * i) / (2.0 * sigma * sigma));
    let o = spreadInfo.texel.xy * f32(i);
    total += (textureSampleLevel(source, linearSampler, uv + o, 0.0) + textureSampleLevel(source, linearSampler, uv - o, 0.0)) * w;
    weight += 2.0 * w;
  }
  return total / weight;
}
`,wa=`${ot}
struct Shade {
  info: vec4f,
  more: vec4f,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var depthMap: texture_depth_2d;
@group(0) @binding(2) var<uniform> shadeInfo: Shade;

@fragment
fn fs_main(@builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let bounds = vec2i(textureDimensions(source)) - vec2i(1);
  let here = vec2i(pixel.xy);
  let color = textureLoad(source, here, 0);
  if (color.a <= 0.002 || shadeInfo.info.z <= 0.0) { return color; }
  let depth = textureLoad(depthMap, here, 0);
  let east = textureLoad(depthMap, clamp(here + vec2i(1, 0), vec2i(0), bounds), 0);
  let west = textureLoad(depthMap, clamp(here - vec2i(1, 0), vec2i(0), bounds), 0);
  let south = textureLoad(depthMap, clamp(here + vec2i(0, 1), vec2i(0), bounds), 0);
  let north = textureLoad(depthMap, clamp(here - vec2i(0, 1), vec2i(0), bounds), 0);
  let limit = shadeInfo.more.x * 0.5;
  let slopeX = clamp(select(east - depth, depth - west, abs(depth - west) < abs(east - depth)), -limit, limit);
  let slopeY = clamp(select(south - depth, depth - north, abs(depth - north) < abs(south - depth)), -limit, limit);
  var occlusion = 0.0;
  for (var i = 1; i <= 12; i += 1) {
    let offset = -shadeInfo.info.xy * f32(i);
    let probe = clamp(vec2i(pixel.xy + offset), vec2i(0), bounds);
    let other = textureLoad(depthMap, probe, 0);
    let expected = depth + slopeX * offset.x + slopeY * offset.y;
    let closer = smoothstep(shadeInfo.more.x * 0.6, shadeInfo.more.x * 2.4, expected - other);
    let reach = 1.0 - f32(i - 1) / 12.0;
    occlusion = max(occlusion, closer * reach * reach);
  }
  return vec4f(color.rgb * (1.0 - occlusion * shadeInfo.info.z), color.a);
}
`,kr=`${ot}
struct Blend { info: vec4f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> mixInfo: Blend;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  return textureSampleLevel(source, linearSampler, uv, 0.0) * mixInfo.info.x;
}
`,Ma=`
struct Frame {
  view: vec4f,
  eye: vec4f,
  forward: vec4f,
  right: vec4f,
  up: vec4f,
  shard: vec4f,
  accent: vec4f,
  marker: vec4f,
  surface: vec4f,
}

struct MarkerOut {
  @builtin(position) position: vec4f,
  @location(0) local: vec2f,
  @location(1) @interpolate(flat, first) shape: vec4f,
  @location(2) @interpolate(flat, first) light: vec4f,
}

@group(0) @binding(0) var<uniform> scene: Frame;
@group(0) @binding(1) var<storage, read> markers: array<vec4f>;

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> MarkerOut {
  let a = markers[instance * 2u];
  let b = markers[instance * 2u + 1u];
  let offset = a.xyz - scene.eye.xyz;
  let depth = max(dot(offset, scene.forward.xyz), 0.05);
  let center = vec2f(
    scene.view.x * 0.5 + dot(offset, scene.right.xyz) * scene.view.z / depth,
    scene.view.y * 0.5 - dot(offset, scene.up.xyz) * scene.view.z / depth,
  );
  let pixel = scene.marker.y;
  let size = scene.marker.z * clamp(sqrt(scene.marker.w / depth), 0.6, 1.3) * b.z;
  let blur = min(scene.forward.w * abs(1.0 - scene.eye.w / depth), scene.right.w) * 0.18;
  let frame = b.y;
  let reach = select(size, size * 2.6, frame > 0.001) + blur + 1.5 * pixel;
  let corners = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0));
  let corner = corners[vertexIndex % 6u] * reach;
  var out: MarkerOut;
  if (depth < 0.35 || a.w <= 0.002) {
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);
    return out;
  }
  let at = center + corner;
  out.position = vec4f(at.x / scene.view.x * 2.0 - 1.0, 1.0 - at.y / scene.view.y * 2.0, 0.5, 1.0);
  out.local = corner;
  out.shape = vec4f(size, blur, frame, pixel);
  out.light = vec4f(b.x, a.w, 0.0, 0.0);
  return out;
}

fn bar(value: f32, edge: f32, soft: f32) -> f32 {
  return clamp((edge - value) / soft + 0.5, 0.0, 1.0);
}

@fragment
fn fs_main(in: MarkerOut) -> @location(0) vec4f {
  let size = in.shape.x;
  let blur = in.shape.y;
  let frame = in.shape.z;
  let pixel = in.shape.w;
  let q = abs(in.local);
  let soft = 1.0 + blur;
  let thick = 0.6 * pixel + blur * 0.5;
  let energy = (0.6 * pixel) / thick;
  var cover = 0.0;
  if (scene.marker.x < 0.5) {
    let across = bar(q.x, size, soft) * bar(q.y, thick, soft);
    let down = bar(q.y, size, soft) * bar(q.x, thick, soft);
    cover = max(across, down) * energy;
  } else {
    cover = bar(length(in.local), size * 0.42 + blur * 0.3, soft) * mix(1.0, energy, 0.6);
  }
  if (frame > 0.001) {
    let edge = size * 2.3;
    let span = edge * 0.45;
    let line = 0.5 * pixel;
    let sides = bar(abs(q.x - edge), line, 1.0) * bar(edge - span - q.y, 0.0, 1.0) * bar(q.y - edge - line, 0.0, 1.0);
    let caps = bar(abs(q.y - edge), line, 1.0) * bar(edge - span - q.x, 0.0, 1.0) * bar(q.x - edge - line, 0.0, 1.0);
    cover = max(cover, max(sides, caps) * frame * 0.85);
  }
  let glow = in.light.x;
  let fade = in.light.y;
  let tint = mix(scene.shard.rgb, scene.accent.rgb, 0.4);
  if (scene.up.w > 0.5) {
    let ink = (1.0 - exp(-glow * 1.6)) * 0.85 * cover * fade;
    return vec4f(mix(tint, scene.accent.rgb, 0.5) * 0.55 * ink, ink);
  }
  let light = cover * glow * fade;
  let color = (1.0 - exp(-mix(tint, vec3f(1.0), 0.35) * light * 1.6)) * 1.4;
  return vec4f(color, max(max(color.r, color.g), color.b) * 0.8);
}
`,za=`${ot}
struct Bloom { texel: vec4f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> bloom: Bloom;

fn bright(uv: vec2f) -> vec3f {
  let color = textureSampleLevel(source, linearSampler, uv, 0.0).rgb;
  let peak = max(max(color.r, color.g), color.b);
  return color * smoothstep(bloom.texel.z, bloom.texel.z + bloom.texel.w, peak);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let o = bloom.texel.xy;
  let total = bright(uv + vec2f(o.x, o.y)) + bright(uv + vec2f(-o.x, o.y)) + bright(uv + vec2f(o.x, -o.y)) + bright(uv - o);
  return vec4f(total * 0.25, 0.0);
}
`,Sa=`${ot}
struct Bloom { texel: vec4f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> bloom: Bloom;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let o = bloom.texel.xy;
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.25;
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, o.y), 0.0) * 0.1875;
  color += textureSampleLevel(source, linearSampler, uv + vec2f(-o.x, o.y), 0.0) * 0.1875;
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, -o.y), 0.0) * 0.1875;
  color += textureSampleLevel(source, linearSampler, uv - o, 0.0) * 0.1875;
  return color;
}
`,Ar=`${ot}
struct Bloom { texel: vec4f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> bloom: Bloom;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let delta = bloom.texel.xy;
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.181862;
  color += (textureSampleLevel(source, linearSampler, uv + delta * 1.423135, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 1.423135, 0.0)) * 0.284316;
  color += (textureSampleLevel(source, linearSampler, uv + delta * 3.326702, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 3.326702, 0.0)) * 0.106598;
  color += (textureSampleLevel(source, linearSampler, uv + delta * 5.242989, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 5.242989, 0.0)) * 0.018156;
  return color;
}
`,ka=`${ot}
struct Finish {
  info: vec4f,
  paper: vec4f,
  mode: vec4f,
}
@group(0) @binding(0) var sceneTexture: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var bloom0: texture_2d<f32>;
@group(0) @binding(3) var bloom1: texture_2d<f32>;
@group(0) @binding(4) var bloom2: texture_2d<f32>;
@group(0) @binding(5) var bloom3: texture_2d<f32>;
@group(0) @binding(6) var<uniform> finish: Finish;

fn hash12(value: vec2f) -> f32 {
  let p = fract(value * vec2f(0.1031, 0.1030));
  let mixed = p + dot(p, p.yx + 33.33);
  return fract((mixed.x + mixed.y) * mixed.x);
}

fn smootherstep(x: f32) -> f32 {
  let t = clamp(x, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

@fragment
fn fs_main(@location(0) uv: vec2f, @builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let scene = textureLoad(sceneTexture, vec2i(pixel.xy), 0);
  let alpha = clamp(scene.a, 0.0, 1.0);
  let noise = hash12(floor(pixel.xy) + vec2f(finish.info.y, finish.info.y * 1.618)) - 0.5;
  let grain = 1.0 + noise * finish.info.x;
  var rgb = vec3f(0.0);
  var a = alpha;
  if (finish.mode.x > 0.5) {
    rgb = clamp(scene.rgb, vec3f(0.0), vec3f(alpha)) * grain;
  } else {
    var halo = textureSampleLevel(bloom0, linearSampler, uv, 0.0).rgb * 0.4;
    halo += textureSampleLevel(bloom1, linearSampler, uv, 0.0).rgb * 0.3;
    halo += textureSampleLevel(bloom2, linearSampler, uv, 0.0).rgb * 0.2;
    halo += textureSampleLevel(bloom3, linearSampler, uv, 0.0).rgb * 0.1;
    halo = halo * finish.info.z;
    rgb = (1.0 - exp(-max(scene.rgb, vec3f(0.0)) * finish.info.w)) * grain + halo / (1.0 + halo);
    a = max(alpha, max(max(rgb.r, rgb.g), rgb.b));
  }
  let vignette = finish.mode.y;
  if (vignette > 0.0) {
    let size = vec2f(textureDimensions(sceneTexture));
    let reach = max(vignette * 0.5 * min(size.x, size.y), 1.0);
    let fromEdge = min(pixel.xy, size - pixel.xy);
    let mask = smootherstep(fromEdge.x / reach) * smootherstep(fromEdge.y / reach);
    rgb *= mask;
    a *= mask;
  }
  rgb = clamp(rgb, vec3f(0.0), vec3f(max(a, 0.0)));
  if (finish.paper.a > 0.5) {
    return vec4f(finish.paper.rgb * (1.0 - a) + rgb, 1.0);
  }
  return vec4f(rgb, a);
}
`,H=(M,m,n)=>Math.min(n,Math.max(m,M)),tt=M=>{const m=H(M,0,1);return m*m*m*(m*(m*6-15)+10)};let mt=null;const _o=(M,m)=>{if(M==="transparent")return null;if(typeof document>"u"||(mt||(mt=document.createElement("canvas").getContext("2d")),!mt))return m;mt.fillStyle="#000000",mt.fillStyle=M;const n=mt.fillStyle;if(n.startsWith("#")){const z=parseInt(n.slice(1),16);return[(z>>16&255)/255,(z>>8&255)/255,(z&255)/255]}const q=/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(n);return q?q[4]!==void 0&&Number(q[4])===0?null:[Number(q[1])/255,Number(q[2])/255,Number(q[3])/255]:m},Rr=()=>typeof window<"u"&&(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1),Io=(M,m,n,q)=>{let z=Math.imul(M+2654435769,2246822507)^Math.imul(m+1663821227,3266489909);return z^=Math.imul(n+668265263,374761393)^Math.imul(q+2135587861,2654435761),z=Math.imul(z^z>>>15,739982445),z=Math.imul(z^z>>>12,695872825),((z^z>>>15)>>>0)/4294967296},Aa=M=>()=>{M=M+1831565813|0;let m=Math.imul(M^M>>>15,1|M);return m=m+Math.imul(m^m>>>7,61|m)^m,((m^m>>>14)>>>0)/4294967296},Ra=(M,m,n,q,z)=>{let Z,fe,J;if(M===0){Z=-1.32+2.64*n;const K=xa[m];fe=K[0]+(K[1]-K[0])*n+.1*Math.sin(n*O*.7+m*2.3)+.045*Math.sin(n*O*1.9+m),J=le[m]+.35*Math.sin(n*Math.PI*1.4+m*1.9)}else if(M===3){const K=n*O+m*.9+Math.PI*.5,Ce=ba[m];Z=Math.cos(K)*Ce[0],fe=Math.sin(K)*Ce[1]-.02,J=le[m]*1.1-Math.sin(K)*(.5+m*.25)}else{const K=M===1?-1:1;fe=1.32-2.64*n,Z=K*(ya[m]+.1*Math.sin(n*O*.6+m*1.3)+.03*Math.sin(n*O*2.1+m)-.08*(1-n)),J=le[m]+.3*Math.sin(n*Math.PI*1.2+m)}return z[0]=Z*q*J/Y,z[1]=fe*J/Y,z[2]=Y-J,z},Er=(M,m)=>{const n=Aa(m),q=[];let z=0;for(let Z=0;Z<U;Z+=1){const fe=Z===U-1?M-z:Math.round(M*ha[Z]);z+=fe;for(let J=0;J<fe;J+=1){const K=n()*2-1,Ce=n(),W=[];if(Ce<.55){const C=.17+n()*.15;W.push([1,(n()-.5)*.08]),W.push([-.5-n()*.25,C*(.8+n()*.4)]),W.push([-.5-n()*.25,-C*(.8+n()*.4)])}else if(Ce<.8){const C=.2+n()*.14;W.push([1,0]),W.push([(n()-.3)*.5,C]),W.push([-.55-n()*.2,(n()-.5)*.1]),W.push([(n()-.3)*.5,-C*(.8+n()*.4)])}else{const C=n()<.5?4:5,at=.4+n()*.3,ao=n()*O;for(let ut=0;ut<C;ut+=1){const Pt=ao+(ut+(n()-.5)*.6)*O/C;W.push([Math.cos(Pt),Math.sin(Pt)*at])}}const rt=W.length;let It=0,Ot=0;for(const C of W)It+=C[0]/rt,Ot+=C[1]/rt;const Ft=[];for(let C=0;C<5;C+=1){const at=W[Math.min(C,rt-1)];Ft.push(at[0]-It,at[1]-Ot)}q.push({level:Z,phase:(J+n())/Math.max(fe,1),lane:Math.sign(K)*Math.pow(Math.abs(K),.85),layer:Math.sqrt(-2*Math.log(Math.max(n(),1e-6)))*Math.cos(O*n()),size:.6+n()*n()*1.25,shape:Ft,sides:rt,thickness:.06+n()*.04,yaw:(n()-.5)*.36,bank:(n()-.5)*.5,pitch:(n()-.5)*.24,tint:n(),drift:[n()*O,n()*O,n()*O],rate:[.3+n()*.35,.25+n()*.35,.3+n()*.3],flutter:[n()*O,.5+n()*.5],arrive:n(),sign:n()<.5?-1:1,slot:[n()*O,.06+.3*Math.sqrt(n()),n()-.5,n()<.85?1:-1],offset:[0,0,0],velocity:[0,0,0],tilt:0,tiltVelocity:0,flash:0,gather:0,joined:!1,position:[0,0,0],s:0})}}return q};function Pa({shardColor:M="#896ABD",accentColor:m="#A855F7",backgroundColor:n="transparent",lightMode:q=!1,placement:z="full",material:Z="glass",count:fe=1300,shardSize:J=1,spread:K=1,twist:Ce=1,billow:W=1,speed:rt=1,scale:It=1,depthOfField:Ot=.75,glow:Ft=.35,grain:C=.06,vignette:at=.3,intro:ao=!0,mouseInteraction:ut=!0,mouseStrength:Pt=.6,markers:Lr="plus",pulseOnClick:_r=!0,holdToGather:Ir=!0,parallax:Or=.5,paused:Fr=!1,dpr:Pr=2,className:Tr="",style:Cr,onError:Oo}){const Fo=oo.useRef(null),Po=oo.useRef(Oo);Po.current=Oo;const To={shard:_o(M,[.54,.42,.74])??[.54,.42,.74],accent:_o(m,[.66,.33,.97])??[.66,.33,.97],paper:_o(n,null),lightMode:q,placement:Math.max(0,Ao.indexOf(z)),material:Ro[Z]??Ro.glass,count:Math.round(H(fe,100,6e3)),shardSize:H(J,.2,4),spread:H(K,0,3),twist:H(Ce,0,3),billow:H(W,0,3),speed:H(rt,0,4),scale:H(It,.4,2.5),depthOfField:H(Ot,0,1),glow:H(Ft,0,2),grain:H(C,0,.5),vignette:H(at,0,1),intro:ao,mouseInteraction:ut,mouseStrength:H(Pt,0,1),markers:ma[Lr]??-1,pulseOnClick:_r,holdToGather:Ir,parallax:H(Or,0,1),paused:Fr,dpr:Math.max(.5,Pr)},_e=oo.useRef(To);return _e.current=To,oo.useEffect(()=>{const re=Fo.current;if(!re)return;const Tt=document.createElement("canvas");Tt.className=la,re.appendChild(Tt);let ye=!1,Ct=null,Dt=0;const nt=[],Co=h=>{ye||(ye=!0,cancelAnimationFrame(Dt),Ct?.dispose(),Ct=null,Po.current?.(h instanceof Error?h:new Error(String(h))))};return(async()=>{if(typeof navigator>"u"||!("gpu"in navigator))throw new Error("WebGPU is not available");const h=await aa({powerPreference:"high-performance"});if(Ct=h,ye){h.dispose();return}nt.push(h.onError(Co));const Do=navigator.gpu.getPreferredCanvasFormat(),Vo=()=>{const t=Math.min(window.devicePixelRatio||1,_e.current.dpr);return[Math.max(1,Math.round(re.clientWidth*t)),Math.max(1,Math.round(re.clientHeight*t))]},g=na(h,Tt,{autoResize:!1,size:Vo(),format:Do,alphaMode:"premultiplied"}),Ie=sa(h,{minFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}),De=Qe(h,{size:g.size,format:"rgba16float"}),Vt=t=>[Math.max(1,Math.round(g.size[0]/2**(t+1))),Math.max(1,Math.round(g.size[1]/2**(t+1)))],Oe=Array.from({length:ga},(t,o)=>({main:Qe(h,{size:Vt(o),format:"rgba16float"}),spare:Qe(h,{size:Vt(o),format:"rgba16float"})})),Bt=xe(h,{view:[1,1,1,0],eye:[0,0,Y,ro],forward:[0,0,-1,0],right:[1,0,0,0],up:[0,1,0,0],shard:[.54,.42,.74,.5],accent:[.66,.33,.97,0],marker:[0,1,4,Y],surface:[7,0,0,2.4]}),Ht=new MessageChannel;nt.push(()=>Ht.port1.close());const Nt=()=>new Promise(t=>{Ht.port1.onmessage=t,Ht.port2.postMessage(0)}),Bo=[],Q=(t,o)=>{const c=t.compile(o);return c.catch(()=>{}),Bo.push(c),t},pe=t=>[Math.max(1,Math.round(g.size[0]*t)),Math.max(1,Math.round(g.size[1]*t))],be=pa.map((t,o)=>({scale:t,layer:Qe(h,{size:pe(t),format:"rgba16float",depth:"depth32float"}),shaded:Qe(h,{size:pe(t),format:"rgba16float"}),temp:Qe(h,{size:o===0?[1,1]:pe(t),format:"rgba16float"}),blurred:Qe(h,{size:o===0?[1,1]:pe(t),format:"rgba16float"}),softReady:o!==0})),no=be.map(()=>xe(h,{view:[1,1,1,0],look:[.7,0,0,0]})),Ho=be.map(()=>xe(h,{info:[0,0,0,0],more:[0,0,0,0]})),so=[],io=[],co=[];for(let t=0;t<be.length;t+=1){const o=be[t];if(so.push(Q(oe(h,{shader:zr,entry:{fragment:"fs_solid"},vertices:6,cull:"none",depth:{write:!0,compare:"less"},label:`aero-shards-solid-${t}`}),o.layer)),await Nt(),ye||(io.push(Q(oe(h,{shader:zr,entry:{fragment:"fs_edge"},vertices:6,cull:"none",depth:{write:!1,compare:"less"},blend:"premultiplied",label:`aero-shards-edge-${t}`}),o.layer)),await Nt(),ye))return;co.push(Q(oe(h,{shader:wa,label:`aero-shards-shadow-${t}`,set:{source:o.layer,depthMap:o.layer.depth,shadeInfo:Ho[t]}}),o.shaded))}let vt=0,$t=null,ae=new Float32Array(0);const No=Q(oe(h,{shader:Ma,vertices:6,cull:"none",depth:!1,blend:"premultiplied",label:"aero-shards-markers"}),De),$o=t=>{t<=vt&&$t||(vt=Math.max(t,512),ae=new Float32Array(vt*Lo),$t=yr(h,ae.byteLength,"read"),No.set({scene:Bt,markers:$t}))};$o(512);let gt=0,xt=null,qt=new Float32Array(0),D=new Float32Array(0),yt=new Float32Array(0);const qo=t=>{t<=gt&&xt||(gt=Math.max(t,256),qt=new Float32Array(gt*et),D=new Float32Array(gt*et),yt=new Float32Array(gt),xt=yr(h,qt.byteLength,"read"),be.forEach((o,c)=>{so[c].set({scene:Bt,shards:xt,layerInfo:no[c]}),io[c].set({scene:Bt,shards:xt,layerInfo:no[c]})}))};qo(_e.current.count);const jo=Oe.map((t,o)=>{const c=o===0?De:Oe[o-1].main,v=xe(h,{texel:[0,0,0,0]}),p=xe(h,{texel:[0,0,0,0]}),y=xe(h,{texel:[0,0,0,0]});return{source:c,level:t,downParams:v,horizontalParams:p,verticalParams:y,down:Q(oe(h,{shader:o===0?za:Sa,label:`aero-shards-down-${o}`,set:{source:c,linearSampler:Ie,bloom:v}}),t.main),horizontal:Q(oe(h,{shader:Ar,label:`aero-shards-blur-x-${o}`,set:{source:t.main,linearSampler:Ie,bloom:p}}),t.spare),vertical:Q(oe(h,{shader:Ar,label:`aero-shards-blur-y-${o}`,set:{source:t.spare,linearSampler:Ie,bloom:y}}),t.main)}}),Yo=xe(h,{info:[0,0,0,1],paper:[0,0,0,0],mode:[0,0,0,0]}),Dr=Q(oe(h,{shader:ka,label:"aero-shards-finish",set:{sceneTexture:De,linearSampler:Ie,bloom0:Oe[0].main,bloom1:Oe[1].main,bloom2:Oe[2].main,bloom3:Oe[3].main,finish:Yo}}),{colors:[Do]});if(await Nt(),ye)return;const Ko=le.map(()=>xe(h,{texel:[0,0,0,0]})),Xo=le.map(()=>xe(h,{texel:[0,0,0,0]})),lo=le.map(()=>xe(h,{info:[1,0,0,0]})),Uo=[];for(let t=0;t<U;t+=1)if(Uo.push(be.map((o,c)=>({blurX:Q(oe(h,{shader:Sr,label:`aero-shards-depth-x-${t}-${c}`,set:{source:o.shaded,linearSampler:Ie,spreadInfo:Ko[t]}}),o.temp),blurY:Q(oe(h,{shader:Sr,label:`aero-shards-depth-y-${t}-${c}`,set:{source:o.temp,linearSampler:Ie,spreadInfo:Xo[t]}}),o.blurred),sharp:Q(oe(h,{shader:kr,label:`aero-shards-sharp-${t}-${c}`,blend:"premultiplied",set:{source:o.shaded,linearSampler:Ie,mixInfo:lo[t]}}),De),soft:Q(oe(h,{shader:kr,label:`aero-shards-soft-${t}-${c}`,blend:"premultiplied",set:{source:o.blurred,linearSampler:Ie,mixInfo:lo[t]}}),De)}))),await Nt(),ye)return;if(await Promise.all(Bo),ye)return;Ht.port1.close();const jt=Array.from({length:U},()=>({position:new Float32Array($*3),tangent:new Float32Array($*3),across:new Float32Array($*3),lift:new Float32Array($*3),length:1})),Yt=[0,0,0,0,0],fo=[0,0,0,0,0],we=new Float32Array(($+1)*3),bt=new Float32Array($+1),Kt=[0,0,0];let Wo="";const e={visible:!1,clock:0,last:0,travel:new Float64Array(U),roll:0,twist:0,drift:0,introAt:-1,weights:Ao.map((t,o)=>o===_e.current.placement?1:0),weightVelocity:[0,0,0,0],shards:Er(_e.current.count,1337),order:[],pointer:[.5,.5],inside:!1,presence:0,yaw:0,pitch:0,yawVelocity:0,pitchVelocity:0,pressAt:-1,pressPoint:null,holding:!1,hold:0,reach:0,gatherCenter:[0,0,0],rings:[],markerDrift:0,markerTarget:"",markerTotal:0,targets:new Map,quiet:0,seen:null},Vr=t=>{const o=e.weights[3]>.999,c=`${t.toFixed(4)}|${e.weights.map(v=>v.toFixed(4)).join(",")}`;if(c===Wo)return o;Wo=c;for(let v=0;v<U;v+=1){const p=jt[v];let y=0;for(let u=0;u<=$;u+=1){const N=u/$;let S=0,l=0,i=0;for(let s=0;s<4;s+=1){const f=e.weights[s];f<1e-4||(Ra(s,v,N,t,Kt),S+=Kt[0]*f,l+=Kt[1]*f,i+=Kt[2]*f)}we[u*3]=S,we[u*3+1]=l,we[u*3+2]=i,u>0&&(y+=Math.hypot(S-we[u*3-3],l-we[u*3-2],i-we[u*3-1])),bt[u]=y}p.length=Math.max(y,.001);let A=0;for(let u=0;u<$;u+=1){const N=u/($-1)*y;for(;A<$-1&&bt[A+1]<N;)A+=1;const S=Math.max(bt[A+1]-bt[A],1e-6),l=H((N-bt[A])/S,0,1);for(let i=0;i<3;i+=1)p.position[u*3+i]=we[A*3+i]+(we[A*3+3+i]-we[A*3+i])*l}let L=0,_=1,F=0;for(let u=0;u<$;u+=1){const N=Math.max(0,u-1),S=Math.min($-1,u+1);let l=p.position[S*3]-p.position[N*3],i=p.position[S*3+1]-p.position[N*3+1],s=p.position[S*3+2]-p.position[N*3+2];const f=Math.hypot(l,i,s)||1;l/=f,i/=f,s/=f,u===0&&(L=-i,_=l,F=0);const d=L*l+_*i+F*s;L-=l*d,_-=i*d,F-=s*d;const V=Math.hypot(L,_,F)||1;L/=V,_/=V,F/=V,p.tangent[u*3]=l,p.tangent[u*3+1]=i,p.tangent[u*3+2]=s,p.across[u*3]=L,p.across[u*3+1]=_,p.across[u*3+2]=F,p.lift[u*3]=i*F-s*_,p.lift[u*3+1]=s*L-l*F,p.lift[u*3+2]=l*_-i*L}}return o},Go=()=>{const t=Vo();t[0]===g.size[0]&&t[1]===g.size[1]||(g.resize(t),De.resize(t),be.forEach(o=>{o.layer.resize(pe(o.scale)),o.shaded.resize(pe(o.scale)),o.softReady&&(o.temp.resize(pe(o.scale)),o.blurred.resize(pe(o.scale)))}),Oe.forEach((o,c)=>{o.main.resize(Vt(c)),o.spare.resize(Vt(c))}),be.forEach((o,c)=>co[c].set({depthMap:o.layer.depth})),e.quiet=0)},Zo=new ResizeObserver(Go);Zo.observe(re),nt.push(()=>Zo.disconnect());const r={eye:[0,0,Y],forward:[0,0,-1],right:[1,0,0],up:[0,1,0],focal:1},Jo=t=>{const o=Math.cos(e.yaw),c=Math.sin(e.yaw),v=Math.cos(e.pitch),p=Math.sin(e.pitch);r.eye[0]=c*v*Y,r.eye[1]=p*Y,r.eye[2]=o*v*Y,r.forward[0]=-c*v,r.forward[1]=-p,r.forward[2]=-o*v;const y=Math.hypot(r.forward[2],r.forward[0])||1;r.right[0]=-r.forward[2]/y,r.right[1]=0,r.right[2]=r.forward[0]/y,r.up[0]=r.right[1]*r.forward[2]-r.right[2]*r.forward[1],r.up[1]=r.right[2]*r.forward[0]-r.right[0]*r.forward[2],r.up[2]=r.right[0]*r.forward[1]-r.right[1]*r.forward[0],r.focal=g.size[1]*.5*Y*t.scale},E=[0,0,1],Qo=(t,o)=>{const c=(t-.5)*g.size[0],v=(.5-o)*g.size[1];E[0]=r.forward[0]*r.focal+r.right[0]*c+r.up[0]*v,E[1]=r.forward[1]*r.focal+r.right[1]*c+r.up[1]*v,E[2]=r.forward[2]*r.focal+r.right[2]*c+r.up[2]*v;const p=Math.hypot(E[0],E[1],E[2])||1;return E[0]/=p,E[1]/=p,E[2]/=p,E},Br=(t,o,c)=>{const v=g.size[0]/Math.max(g.size[1],1),p=Vr(v),y=t.intro&&!c,A=e.introAt<0?0:e.clock-e.introAt,L=t.mouseInteraction&&!c?e.presence*t.mouseStrength:0;let _=0,F=0,u=0;L>.001&&(Qo(e.pointer[0],e.pointer[1]),_=E[0],F=E[1],u=E[2]);const N=Math.max(1,Math.ceil(o/(1/120))),S=o/Math.max(N,1),l=g.size[1]*.5,i=e.rings.map(b=>{const a=b.age/Mr;return{x:b.x,y:b.y,age:b.age,strength:(1-Math.exp(-b.age/.06))*(1-a)*(1-a)}}),s=(b,a,I,k)=>{const w=b-r.eye[0],ee=a-r.eye[1],ne=I-r.eye[2],Me=Math.max(w*r.forward[0]+ee*r.forward[1]+ne*r.forward[2],.05);return k[0]=(w*r.right[0]+ee*r.right[1]+ne*r.right[2])*r.focal/Me/l,k[1]=(w*r.up[0]+ee*r.up[1]+ne*r.up[2])*r.focal/Me/l,Me},f=(b,a,I)=>{let k=0;for(const w of i){const ee=Math.max(0,w.age-I*.07)*2.3,ne=Math.hypot(b-w.x,a-w.y);k+=Math.exp(-((ne-ee)*(ne-ee))/.012)*w.strength}return k},d=[0,0],V=e.shards,R=Math.min(1,t.twist);for(let b=0;b<V.length;b+=1){const a=V[b],I=a.level,k=jt[I];let w=(a.phase+e.travel[I])%1,ee=1,ne=0;if(y){const x=I*.22+Math.max(0,w-.1)*(Eo-1-(U-1)*.22)+a.arrive*.15,P=H((A-x)/.9,0,1);ee=tt(P);const T=(1-P)*(1-P);w=p?w-T*.06:Math.max(0,w-T*.06),ne=T*.9*a.sign}a.s=w;const Me=(w%1+1)%1*($-1),Ve=Math.floor(Me),B=Math.min(Ve+1,$-1),Be=Me-Ve,X=(x,P)=>x[Ve*3+P]+(x[B*3+P]-x[Ve*3+P])*Be,he=X(k.position,0),Ut=X(k.position,1),Wt=X(k.position,2),He=X(k.tangent,0),de=X(k.tangent,1),wt=X(k.tangent,2),Ne=X(k.across,0),$e=X(k.across,1),qe=X(k.across,2),st=X(k.lift,0),je=X(k.lift,1),se=X(k.lift,2),ie=t.twist*(w*O*.6+e.twist+I*1.7),Ye=Math.cos(ie),me=Math.sin(ie),Mt=Ne*Ye+st*me,zt=$e*Ye+je*me,po=qe*Ye+se*me,St=st*Ye-Ne*me,Gt=je*Ye-$e*me,ho=se*Ye-qe*me,ue=le[I]/Y,kt=t.spread*(.15+.035*le[I])*(.8+.3*Math.sin(w*O*1.3+I*.8)),Ke=a.lane*kt,Pe=a.layer*.012*ue,Zt=p?1:tt(w/.12)*tt((1-w)/.12),it=t.billow*.16*ue*Math.sin(w*O*1.3-e.drift*.5+I*1.1)*(.4+.6*Zt),ze=t.billow*.06*ue*Math.sin(w*O*.8-e.drift*.35+I*2.4),At=.009*ue,ct=e.drift,Rt=he+st*it+Ne*ze+Mt*Ke+St*Pe+Math.sin(ct*a.rate[0]+a.drift[0])*At,Et=Ut+je*it+$e*ze+zt*Ke+Gt*Pe+Math.sin(ct*a.rate[1]+a.drift[1])*At,ce=Wt+se*it+qe*ze+po*Ke+ho*Pe+Math.sin(ct*a.rate[2]+a.drift[2])*At;let te=0,Se=0,Xe=0,Ue=0;const lt=Rt+a.offset[0],mo=Et+a.offset[1],uo=ce+a.offset[2];if(L>.001){const x=lt-r.eye[0],P=mo-r.eye[1],T=uo-r.eye[2],G=x*_+P*F+T*u,Ee=x-_*G,Le=P-F*G,ve=T-u*G,Te=Math.hypot(Ee,Le,ve),to=.24*ue/t.scale,_t=Math.exp(-(Te*Te)/(to*to));if(_t>.002&&Te>1e-5){const Je=Ee/Te,wo=Le/Te,Mo=ve/Te,zo=(Je*He+wo*de+Mo*wt)*.7,So=L*_t*9*ue;te+=(Je-He*zo)*So,Se+=(wo-de*zo)*So,Xe+=(Mo-wt*zo)*So,Ue+=L*_t*1.1*(Je*Ne+wo*$e+Mo*qe)}}if(e.hold>.001&&a.joined){const x=a.slot,P=x[0]+e.clock*(.8/(.12+x[1]))*x[3],T=x[1]/t.scale,G=e.gatherCenter[0]+Math.cos(P)*T,Ee=e.gatherCenter[1]+Math.sin(P)*T*.75,Le=e.gatherCenter[2]+Math.sin(P)*T*.45+x[2]*.3;a.gather+=(e.hold-a.gather)*(1-Math.exp(-o/.3));const ve=a.gather*30;te+=(G-lt)*ve,Se+=(Ee-mo)*ve,Xe+=(Le-uo)*ve,Ue+=a.gather*.6*Math.sin(P)}else a.gather+=(0-a.gather)*(1-Math.exp(-o/.2));if(i.length){s(lt,mo,uo,d);for(const x of i){const P=Math.max(0,x.age-I*.07)*2.3,T=d[0]-x.x,G=d[1]-x.y,Ee=Math.hypot(T,G),Le=Math.exp(-((Ee-P)*(Ee-P))/.012)*x.strength;if(Le>.01){a.flash=Math.max(a.flash,Le*.75);const ve=Math.max(Ee,.05),Te=(r.right[0]*T+r.up[0]*G)/ve,to=(r.right[1]*T+r.up[1]*G)/ve,_t=(r.right[2]*T+r.up[2]*G)/ve;Ue+=Le*1.4*(Te*Ne+to*$e+_t*qe);const Je=Le*2.2*ue/Math.max(Ee,.05);te+=(r.right[0]*T+r.up[0]*G)*Je,Se+=(r.right[1]*T+r.up[1]*G)*Je,Xe+=(r.right[2]*T+r.up[2]*G)*Je}}}const vo=24*(1-a.gather*.95);for(let x=0;x<N;x+=1)a.velocity[0]+=(te-vo*a.offset[0]-7.5*a.velocity[0])*S,a.velocity[1]+=(Se-vo*a.offset[1]-7.5*a.velocity[1])*S,a.velocity[2]+=(Xe-vo*a.offset[2]-7.5*a.velocity[2])*S,a.offset[0]+=a.velocity[0]*S,a.offset[1]+=a.velocity[1]*S,a.offset[2]+=a.velocity[2]*S,a.tiltVelocity+=(90*(Ue-a.tilt)-15*a.tiltVelocity)*S,a.tilt+=a.tiltVelocity*S;a.flash*=Math.exp(-o/.45);const Jt=Rt+a.offset[0],Qt=Et+a.offset[1],eo=ce+a.offset[2];a.position[0]=Jt,a.position[1]=Qt,a.position[2]=eo;let We=r.eye[0]-Jt,Ge=r.eye[1]-Qt,Ze=r.eye[2]-eo;const go=Math.hypot(We,Ge,Ze)||1;We/=go,Ge/=go,Ze/=go;let ke=He+a.velocity[0]*.05,Ae=de+a.velocity[1]*.05,Re=wt+a.velocity[2]*.05;const xo=ke*We+Ae*Ge+Re*Ze;ke-=We*xo,Ae-=Ge*xo,Re-=Ze*xo;let Lt=Math.hypot(ke,Ae,Re);Lt<1e-4&&(ke=r.right[0],Ae=r.right[1],Re=r.right[2],Lt=1),ke/=Lt,Ae/=Lt,Re/=Lt;const sr=Ge*Re-Ze*Ae,ir=Ze*ke-We*Re,cr=We*Ae-Ge*ke,lr=a.yaw+.05*Math.sin(e.clock*a.flutter[1]*.7+a.flutter[0]),ft=Math.cos(lr),pt=Math.sin(lr),fr=ke*ft+sr*pt,pr=Ae*ft+ir*pt,hr=Re*ft+cr*pt,Nr=sr*ft-ke*pt,$r=ir*ft-Ae*pt,qr=cr*ft-Re*pt,jr=.8*R*Math.sin(ie)+.3*Math.sin(w*O*1.6-e.roll*.55+I*.9+a.lane*.7),Yr=.06*Math.sin(e.clock*a.flutter[1]+a.flutter[0]),dr=br*Math.tanh((jr+a.bank+Yr+a.tilt+ne)/br),yo=Math.cos(dr),bo=Math.sin(dr),mr=We*yo+Nr*bo,ur=Ge*yo+$r*bo,vr=Ze*yo+qr*bo,gr=a.pitch+.2*Math.sin(w*O*1.1-e.roll*.4+I*2.1),ht=Math.cos(gr),dt=Math.sin(gr),Kr=fr*ht+mr*dt,Xr=pr*ht+ur*dt,Ur=hr*ht+vr*dt,Wr=mr*ht-fr*dt,Gr=ur*ht-pr*dt,Zr=vr*ht-hr*dt,Jr=Jt-r.eye[0],Qr=Qt-r.eye[1],ea=eo-r.eye[2],ta=Jr*r.forward[0]+Qr*r.forward[1]+ea*r.forward[2];yt[b]=ta;const oa=1-.45*a.lane*a.lane,xr=.062*t.shardSize*a.size*da[I]*ee*Math.sqrt(Zt)*oa,j=b*et;D[j]=Jt,D[j+1]=Qt,D[j+2]=eo,D[j+3]=xr>1e-5?xr:0,D[j+4]=Kr,D[j+5]=Xr,D[j+6]=Ur,D[j+7]=a.thickness,D[j+8]=Wr,D[j+9]=Gr,D[j+10]=Zr,D[j+11]=a.tint;for(let x=0;x<10;x+=1)D[j+12+x]=a.shape[x];D[j+22]=a.sides,D[j+23]=a.flash}let Fe=0;for(let b=0;b<U;b+=1)Yt[b]=0,fo[b]=0;if(t.markers>=0){const b=g.size[1]/Math.max(re.clientHeight,1),a=(e.pointer[0]-.5)*2*v,I=(.5-e.pointer[1])*2,k=t.mouseInteraction&&!c?e.presence:0,w=e.targets,ee=new Map,ne=1-Math.exp(-o/.12);let Me="",Ve=72;for(let B=U-1;B>=0;B-=1){fo[B]=Fe;const Be=le[B],X=Be/Y,he=.42*Math.pow(X,.55),Ut=v*Be/(Y*t.scale)*1.12+he,Wt=Be/(Y*t.scale)*1.12+he,He=e.markerDrift,de=ua[B],wt=Math.floor((He-Ut)/he-de[0]),Ne=Math.ceil((He+Ut)/he-de[0]),$e=Math.floor(-Wt/he-de[1]),qe=Math.ceil(Wt/he-de[1]),st=t.spread*(.15+.035*Be)*1.4,je=jt[B].position;for(let se=wt;se<=Ne;se+=1)for(let ie=$e;ie<=qe;ie+=1){if(Io(B,se,ie,11)>.5)continue;const me=(se+de[0])*he-He,Mt=(ie+de[1])*he,zt=Y-Be,po=s(me,Mt,zt,d);if(Math.abs(d[0])>v*1.05||Math.abs(d[1])>1.05)continue;let St=1/0;for(let te=0;te<$;te+=2){const Se=me-je[te*3],Xe=Mt-je[te*3+1],Ue=zt-je[te*3+2],lt=Se*Se+Xe*Xe+Ue*Ue;lt<St&&(St=lt)}const Gt=Math.exp(-St/(st*st)),ho=Io(B,se,ie,23),ue=Io(B,se,ie,37),kt=ho<.07?.5+.5*Math.sin(e.clock*(1.4+ue*2.2)+ue*40):0,Ke=Math.hypot(d[0]-a,d[1]-I)*l/b,Pe=`${B}:${se}:${ie}`;B<=2&&k>.01&&Ke<Ve&&(Ve=Ke,Me=Pe);const Zt=Pe===e.markerTarget?k*(1-tt((Ke-30)/42)):0,it=w.get(Pe)??0,ze=it+(Zt-it)*ne;ze>.002&&ee.set(Pe,ze);const At=Math.max(tt((kt-.55)/.4),ze);let ct=0;i.length&&(ct=f(d[0],d[1],B));let Rt=1;if(y){const te=H((d[0]/v+1)*.5,0,1),Se=B*.22+.35+te*(Eo-1.3-(U-1)*.22);Rt=tt((A-Se)/.5)}const Et=wr[B]*(1-tt((po-3)/10)*.45)*Rt;if(Et<.002)continue;Fe>=vt&&$o(vt*2);const ce=Fe*Lo;ae[ce]=me,ae[ce+1]=Mt,ae[ce+2]=zt,ae[ce+3]=Et,ae[ce+4]=.42+.5*Gt+kt*.9+ze*1.3+ct*2.5,ae[ce+5]=At,ae[ce+6]=1+.15*Gt+.3*kt+.2*ze,ae[ce+7]=0,Fe+=1,Yt[B]+=1}}e.targets=ee,e.markerTarget=Me}e.markerTotal=Fe},Hr=(t,o,c)=>{Jo(t);const v=e.shards;qo(v.length),Br(t,o,c),e.order.length!==v.length&&(e.order=v.map((l,i)=>i));const p=e.order;for(let l=0;l<v.length;l+=1)yt[l]+=v[l].level*100;for(let l=1;l<p.length;l+=1){const i=p[l],s=yt[i];let f=l-1;for(;f>=0&&yt[p[f]]<s;)p[f+1]=p[f],f-=1;p[f+1]=i}const y=[0,0,0,0,0];for(let l=0;l<p.length;l+=1){const i=p[l]*et,s=l*et;y[v[p[l]].level]+=1;for(let f=0;f<et;f+=1)qt[s+f]=D[i+f]}xt?.write(qt.subarray(0,v.length*et)),e.markerTotal>0&&$t?.write(ae.subarray(0,e.markerTotal*Lo));const A=[0,0,0,0,0];let L=0;for(let l=U-1;l>=0;l-=1)A[l]=L,L+=y[l];Bt.set({view:[g.size[0],g.size[1],r.focal,e.clock],eye:[r.eye[0],r.eye[1],r.eye[2],ro],forward:[r.forward[0],r.forward[1],r.forward[2],t.depthOfField*g.size[1]*.03],right:[r.right[0],r.right[1],r.right[2],g.size[1]*.05],up:[r.up[0],r.up[1],r.up[2],t.lightMode?1:0],shard:[...t.shard,0],accent:[...t.accent,0],surface:t.material,marker:[t.markers,g.size[1]/Math.max(re.clientHeight,1),4*(g.size[1]/Math.max(re.clientHeight,1)),ro]}),jo.forEach(({downParams:l,horizontalParams:i,verticalParams:s,source:f,level:d})=>{l.set({texel:[.5/f.size[0],.5/f.size[1],.75,.5]}),i.set({texel:[1/d.main.size[0],0,0,0]}),s.set({texel:[0,1/d.main.size[1],0,0]})});const _=t.paper??[0,0,0],F=t.glow>.001&&!t.lightMode;Yo.set({info:[t.grain,Math.floor(e.clock*24),F?t.glow:0,1.3],paper:[_[0],_[1],_[2],t.paper?1:0],mode:[t.lightMode?1:0,t.vignette,0,0]});const u=t.depthOfField*g.size[1]*.012,N=g.size[1]*.02,S=le.map((l,i)=>{const s=Math.min(u*Math.abs(1-fa/l),N),f=s>=2.2?1:0,d=be[f],V=s>=.45;V&&!d.softReady&&(d.softReady=!0,d.temp.resize(pe(d.scale)),d.blurred.resize(pe(d.scale)));const R=d.layer.size;no[f].set({view:[R[0],R[1],r.focal*(R[0]/g.size[0]),0],look:[t.lightMode?.5:.7,0,0,0]});const Fe=s*d.scale;Ko[i].set({texel:[1/R[0],0,Fe,0]}),Xo[i].set({texel:[0,1/R[1],Fe,0]}),lo[i].set({info:[wr[i],0,0,0]});const b=Math.max(.6,1.4*(R[0]/Math.max(re.clientWidth,1))),a=t.material===Ro.glass?0:t.lightMode?.32:.62;return Ho[f].set({info:[b*.55,b*.85,a,0],more:[45e-5,0,0,0]}),{group:d,groupIndex:f,soft:V}});ia(h,l=>{for(let i=U-1;i>=0;i-=1){const{group:s,groupIndex:f,soft:d}=S[i],V=Uo[i][f];y[i]>0&&(l.pass({target:s.layer,clear:[0,0,0,0],clearDepth:1},R=>{R.draw(so[f],{instances:y[i],firstInstance:A[i]}),R.draw(io[f],{instances:y[i],firstInstance:A[i]})}),l.pass({target:s.shaded,clear:[0,0,0,0]},R=>R.draw(co[f])),d&&(l.pass({target:s.temp,clear:[0,0,0,0]},R=>R.draw(V.blurX)),l.pass({target:s.blurred,clear:[0,0,0,0]},R=>R.draw(V.blurY)))),l.pass({target:De,clear:i===U-1?[0,0,0,0]:!1},R=>{Yt[i]>0&&R.draw(No,{instances:Yt[i],firstInstance:fo[i]}),y[i]>0&&R.draw(d?V.soft:V.sharp)})}jo.forEach((i,s)=>{const f=Oe[s];if(!F){l.pass({target:f.main,clear:[0,0,0,0]},()=>{});return}l.pass({target:f.main,clear:[0,0,0,0]},d=>d.draw(i.down)),l.pass({target:f.spare,clear:[0,0,0,0]},d=>d.draw(i.horizontal)),l.pass({target:f.main,clear:[0,0,0,0]},d=>d.draw(i.vertical))}),l.pass({target:g,clear:[0,0,0,0]},i=>i.draw(Dr))})},er=t=>{if(Dt=requestAnimationFrame(er),!e.visible||document.hidden){e.last=t;return}const o=ko(_e.current),c=e.last?Math.min((t-e.last)/1e3,.05):0;e.last=t;const v=Rr();e.clock+=c,e.introAt<0&&(e.introAt=e.clock),e.shards.length!==o.count&&(e.shards=Er(o.count,1337),e.order=[]);const p=!o.paused&&!v;if(p){for(let s=0;s<U;s+=1)e.travel[s]=(e.travel[s]+c*o.speed*.09/jt[s].length)%1;e.roll+=c*o.speed*1,e.twist+=c*o.speed*.08,e.drift+=c*o.speed}const y=Ao.map((s,f)=>f===o.placement?1:0);let A=!1;const L=Math.exp(-4*c);for(let s=0;s<4;s+=1){const f=e.weights[s]-y[s],d=e.weightVelocity[s]+4*f;e.weights[s]=y[s]+(f+d*c)*L,e.weightVelocity[s]=(e.weightVelocity[s]-4*d*c)*L,Math.abs(e.weights[s]-y[s])>5e-4&&(A=!0)}A||(e.weights=y,e.weightVelocity=[0,0,0,0]);const _=o.mouseInteraction&&e.inside&&!v;e.presence+=((_?1:0)-e.presence)*(1-Math.exp(-c/.25));const F=_?o.parallax:0,u=(e.pointer[0]-.5)*F*.14,N=(e.pointer[1]-.5)*F*.08;e.yawVelocity+=(38*(u-e.yaw)-11*e.yawVelocity)*c,e.pitchVelocity+=(38*(N-e.pitch)-11*e.pitchVelocity)*c,e.yaw+=e.yawVelocity*c,e.pitch+=e.pitchVelocity*c;const S=Math.abs(u-e.yaw)+Math.abs(N-e.pitch)>1e-4||Math.abs(e.yawVelocity)+Math.abs(e.pitchVelocity)>1e-4;if(e.pressAt>=0&&e.pressPoint&&o.holdToGather&&!v&&e.clock-e.pressAt>.18){if(!e.holding){e.holding=!0,Jo(o),Qo(e.pressPoint[0],e.pressPoint[1]);const f=ro/Math.max(E[0]*r.forward[0]+E[1]*r.forward[1]+E[2]*r.forward[2],.2);e.gatherCenter=[r.eye[0]+E[0]*f,r.eye[1]+E[1]*f,r.eye[2]+E[2]*f],e.reach=0}e.hold=Math.min(1,e.hold+c/.5),e.reach=Math.min(e.reach+c*.5,.55);const s=(.22+e.reach)/o.scale;for(const f of e.shards){if(f.joined||f.level>2)continue;const d=f.position[0]-e.gatherCenter[0],V=f.position[1]-e.gatherCenter[1];d*d+V*V<s*s&&(f.joined=!0)}}else if(e.hold>0&&(e.hold=Math.max(0,e.hold-c/.3),e.hold===0))for(const s of e.shards)s.joined=!1;for(const s of e.rings)s.age+=c;e.rings=e.rings.filter(s=>s.age<Mr),p&&(e.markerDrift+=c*o.speed*.045);const l=e.shards.some(s=>s.flash>.01||Math.abs(s.tiltVelocity)>.01||Math.abs(s.tilt)>.01),i=A||S||l||e.presence>.002||e.rings.length>0||e.hold>0||o.intro&&!v&&e.clock-e.introAt<Eo+.5;e.seen!==o||i||p?e.quiet=0:e.quiet+=1,e.seen=o,!(e.quiet>30)&&(Go(),Hr(o,c,v))},tr=t=>{const o=re.getBoundingClientRect();return{point:[(t.clientX-o.left)/Math.max(o.width,1),(t.clientY-o.top)/Math.max(o.height,1)],inside:t.clientX>=o.left&&t.clientX<=o.right&&t.clientY>=o.top&&t.clientY<=o.bottom}},or=t=>{const o=tr(t);e.inside=o.inside,o.inside&&(e.pointer=o.point)},rr=()=>{e.inside=!1},ar=t=>{const o=ko(_e.current);if(t.button!==0||Rr()||!o.mouseInteraction||t.target instanceof Element&&t.target.closest('a, button, input, textarea, select, label, [role="button"]'))return;const c=tr(t);c.inside&&(e.pointer=c.point,e.pressAt=e.clock,e.pressPoint=c.point)},Xt=()=>{const t=ko(_e.current);if(!(e.pressAt<0)){if(!e.holding&&t.pulseOnClick&&e.pressPoint){const o=g.size[0]/Math.max(g.size[1],1);e.rings.push({x:(e.pressPoint[0]*2-1)*o,y:1-e.pressPoint[1]*2,age:0}),e.rings.length>va&&e.rings.shift()}if(e.holding)for(const o of e.shards)o.joined&&(o.tiltVelocity+=9*o.sign);e.pressAt=-1,e.holding=!1}};ge(window).addEventListener("pointermove",or,{passive:!0}),ge(window).addEventListener("pointerdown",ar),ge(window).addEventListener("pointerup",Xt),ge(window).addEventListener("pointercancel",Xt),ge(document.documentElement).addEventListener("pointerleave",rr),nt.push(()=>{ge(window).removeEventListener("pointermove",or),ge(window).removeEventListener("pointerdown",ar),ge(window).removeEventListener("pointerup",Xt),ge(window).removeEventListener("pointercancel",Xt),ge(document.documentElement).removeEventListener("pointerleave",rr)});const nr=new IntersectionObserver(t=>{e.visible=t.some(o=>o.isIntersecting)});nr.observe(re),nt.push(()=>nr.disconnect()),Dt=requestAnimationFrame(er)})().catch(Co),()=>{ye=!0,cancelAnimationFrame(Dt),nt.forEach(h=>h()),Ct?.dispose(),Tt.remove()}},[]),ra.jsx("div",{ref:Fo,className:[ca,Tr].filter(Boolean).join(" "),style:Cr})}export{Pa as default};
