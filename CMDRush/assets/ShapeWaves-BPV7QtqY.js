import{r as w,j as xt}from"./index-uEvbEw5g.js";import{b as ht}from"./App-Dofw4Ib9.js";import{b as U}from"./_cmdrushBeat-CLoDPAAd.js";import{c as Ot,l as qt,r as Dt,e as Ft,I as Bt,g as Ct,h as Wt,F as yt,j as $t,i as Ht,s as Nt,u as ke,a as Vt,b as wt,t as $e,f as jt}from"./index-DZzSo1_V.js";import"./react-vendor-DHz4kLit.js";function _e(c,r,b={}){if("geometry"in b)throw Ot("effect","effect() never accepts vertex buffers; use draw(gpu, { shader, geometry: geometry(gpu, descriptor) }).");const g=qt(c,"effect"),l=Dt(g);return new Gt(g.device,Ft(r),b,l.binds,void 0,l.pipelines,l.shaderModules,l.pipelineLayouts,d=>g.reportError(d),d=>{g.trackDelivery(d)})}const zt=new WeakMap;class Gt{get gpu(){return X(this).gpu}constructor(r,b,g={},l,d,ce,le,fe,Z,ue){const K=Ut(b),ge=new Bt(r,K,{shader:K,set:g.set,label:g.label??"effect",blend:g.blend,writeMask:g.writeMask},l,d,ce,le,fe,Z,ue);zt.set(this,ge)}set(r){return X(this).set(r),this}draw(r={}){X(this).draw(Ct(r)?{target:r}:r)}compile(r){return X(this).compile(r).then(()=>this)}compileSync(r){return X(this).compileSync(r),this}encode(r,b,g={},l){Wt(X(this),r,b,g,l)}get[yt](){return X(this)[yt]}}function X(c){const r=zt.get(c);if(!r)throw new TypeError("Invalid Effect instance");return r}function Ut(c){return Xt(c)?c:`
struct VgpuFullscreenVertexOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};
@vertex fn vgpu_fullscreen_vs(@builtin(vertex_index) vi: u32) -> VgpuFullscreenVertexOut {
  var pos = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  var uv = array<vec2f, 3>(vec2f(0.0, 1.0), vec2f(2.0, 1.0), vec2f(0.0, -1.0));
  var out: VgpuFullscreenVertexOut;
  out.position = vec4f(pos[vi], 0.0, 1.0);
  out.uv = uv[vi];
  return out;
}
${c}`}function Xt(c){return $t(c,"effect.wgsl").entryPoints.some(r=>r.stage==="vertex")}const Yt={mixed:0,squares:1,circles:2,triangles:3},Jt=2,Zt=1024,Kt=32,Qt=.1,He=1/60,er=.42,tr=.94,rr=.972,nr=.01,St=.2,Ve=.3,Mt=.16,ie=1+Ve+Mt+St,sr=`
fn mod289v3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn mod289v4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn permute(x: vec4f) -> vec4f { return mod289v4(((x * 34.0) + 10.0) * x); }
fn taylorInvSqrt(r: vec4f) -> vec4f { return 1.79284291400159 - 0.85373472095314 * r; }
fn fadeCurve(t: vec3f) -> vec3f { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

fn cnoise(P: vec3f) -> f32 {
  var Pi0 = floor(P);
  var Pi1 = Pi0 + vec3f(1.0);
  Pi0 = mod289v3(Pi0);
  Pi1 = mod289v3(Pi1);
  let Pf0 = fract(P);
  let Pf1 = Pf0 - vec3f(1.0);
  let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  let iy = vec4f(Pi0.yy, Pi1.yy);
  let iz0 = Pi0.zzzz;
  let iz1 = Pi1.zzzz;

  let ixy = permute(permute(ix) + iy);
  let ixy0 = permute(ixy + iz0);
  let ixy1 = permute(ixy + iz1);

  var gx0 = ixy0 * (1.0 / 7.0);
  var gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  let gz0 = vec4f(0.5) - abs(gx0) - abs(gy0);
  let sz0 = step(gz0, vec4f(0.0));
  gx0 -= sz0 * (step(vec4f(0.0), gx0) - 0.5);
  gy0 -= sz0 * (step(vec4f(0.0), gy0) - 0.5);

  var gx1 = ixy1 * (1.0 / 7.0);
  var gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  let gz1 = vec4f(0.5) - abs(gx1) - abs(gy1);
  let sz1 = step(gz1, vec4f(0.0));
  gx1 -= sz1 * (step(vec4f(0.0), gx1) - 0.5);
  gy1 -= sz1 * (step(vec4f(0.0), gy1) - 0.5);

  var g000 = vec3f(gx0.x, gy0.x, gz0.x);
  var g100 = vec3f(gx0.y, gy0.y, gz0.y);
  var g010 = vec3f(gx0.z, gy0.z, gz0.z);
  var g110 = vec3f(gx0.w, gy0.w, gz0.w);
  var g001 = vec3f(gx1.x, gy1.x, gz1.x);
  var g101 = vec3f(gx1.y, gy1.y, gz1.y);
  var g011 = vec3f(gx1.z, gy1.z, gz1.z);
  var g111 = vec3f(gx1.w, gy1.w, gz1.w);

  let norm0 = taylorInvSqrt(vec4f(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  let norm1 = taylorInvSqrt(vec4f(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  let n000 = dot(g000, Pf0);
  let n100 = dot(g100, vec3f(Pf1.x, Pf0.yz));
  let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));
  let n110 = dot(g110, vec3f(Pf1.xy, Pf0.z));
  let n001 = dot(g001, vec3f(Pf0.xy, Pf1.z));
  let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));
  let n011 = dot(g011, vec3f(Pf0.x, Pf1.yz));
  let n111 = dot(g111, Pf1);

  let f = fadeCurve(Pf0);
  let nz = mix(vec4f(n000, n100, n010, n110), vec4f(n001, n101, n011, n111), f.z);
  let ny = mix(nz.xy, nz.zw, f.y);
  return 2.2 * mix(ny.x, ny.y, f.x);
}

fn fbm(p: vec3f) -> f32 {
  var total = 0.0;
  var amplitude = 1.0;
  var weight = 0.0;
  var frequency = 1.0;
  for (var i = 0; i < 2; i++) {
    total += amplitude * cnoise(p * frequency);
    weight += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return total / weight;
}
`,ar=`
struct Params {
  resolution: vec4f,
  placement: vec4f,
  grid: vec4f,
  field: vec4f,
  motion: vec4f,
  color: vec4f,
  hover: vec4f,
  background: vec4f,
}
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var maskTexture: texture_2d<f32>;
@group(0) @binding(2) var maskSampler: sampler;
@group(0) @binding(3) var<storage, read> charges: array<f32>;

const SEED = vec2f(12.9898, 78.233);
const GLOW_THRESHOLD = 0.6;
${sr}

fn sdIsoscelesTriangle(point: vec2f, q: vec2f) -> f32 {
  let p = vec2f(abs(point.x), point.y);
  let a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
  let b = p - q * vec2f(clamp(p.x / q.x, 0.0, 1.0), 1.0);
  let s = -sign(q.y);
  let d = min(vec2f(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2f(dot(b, b), s * (p.y - q.y)));
  return -sqrt(d.x) * sign(d.y);
}

fn shapeDistance(p: vec2f, shape: i32, c: f32) -> f32 {
  if (shape == 0) { return max(abs(p.x), abs(p.y)) - c; }
  if (shape == 1) { return length(p) - c; }
  return sdIsoscelesTriangle(vec2f(p.x, p.y + c), vec2f(c, 2.0 * c));
}

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let resolution = params.resolution.xy;
  let cellPx = params.grid.x;
  let dotSize = params.grid.y;
  let mode = i32(params.grid.z + 0.5);
  let cols = i32(params.grid.w + 0.5);
  let background = params.background.rgb;
  let toSurface = params.hover.w < 0.5;

  let pixel = uv * resolution;
  let origin = params.placement.xy;
  let rows = i32(params.placement.z + 0.5);
  let cell = floor((pixel - origin) / cellPx);
  if (cell.y < 0.0 || i32(cell.y) >= rows || cell.x < 0.0 || i32(cell.x) >= cols) {
    return vec4f(background, select(0.0, 1.0, toSurface));
  }
  let center = origin + (cell + 0.5) * cellPx;
  let local = (pixel - center) / (cellPx * 0.5);
  let cellUv = center / resolution;

  if (params.motion.z > 0.5 && textureSampleLevel(maskTexture, maskSampler, cellUv, 0.0).r > 0.5) {
    return vec4f(background, select(0.0, 1.0, toSurface));
  }

  var level = 1.0;
  let fade = params.motion.w;
  if (fade > 0.0) {
    let q = abs(uv * 2.0 - 1.0);
    let radius = pow(pow(q.x, 2.5) + pow(q.y, 2.5), 1.0 / 2.5) / pow(2.0, 1.0 / 2.5);
    level = 1.0 - smoothstep(max(0.0, 1.0 - fade * 2.2), 1.0, radius);
  }
  let noise = fbm(vec3f((center + params.motion.xy) / params.field.x + SEED, params.field.w));
  let tone = clamp((noise * 0.5 + 0.5 - params.field.y) * params.field.z + 0.5, 0.0, 1.0);
  let band = i32(min(tone, 0.999999) * 3.0);

  var charge = 0.0;
  let index = i32(cell.y) * cols + i32(cell.x);
  if (index >= 0 && index < i32(arrayLength(&charges))) { charge = charges[index]; }
  let stepped = (band + i32(clamp(charge, 0.0, 0.999) * 3.0)) % 3;

  var shape = 2 - stepped;
  var size = dotSize;
  if (mode != 0) {
    shape = mode - 1;
    size = dotSize * mix(0.45, 1.0, f32(stepped) / 2.0);
  }
  let introProgress = params.placement.w;
  var front = 0.0;
  if (introProgress < ${ie.toFixed(2)}) {
    let radial = length((center - resolution * 0.5) / (resolution * 0.5)) * 0.70710678;
    let warp = cnoise(vec3f(cellUv * vec2f(3.2, 2.4) + SEED, 4.7)) * ${Ve.toFixed(2)};
    let jitter = hash21(cell) * ${Mt.toFixed(2)};
    let spread = radial + warp + jitter + ${Ve.toFixed(2)};
    let band = ${St.toFixed(2)} * (0.6 + 0.8 * hash21(cell + vec2f(17.0, 9.0)));
    let t = clamp((introProgress - spread) / band, 0.0, 1.0);
    if (t <= 0.0) {
      return vec4f(background, select(0.0, 1.0, toSurface));
    }
    let back = t - 1.0;
    size = max(size * (1.0 + 2.70158 * back * back * back + 1.70158 * back * back), 0.02);
    front = 1.0 - smoothstep(0.0, 1.0, abs(introProgress - spread) / band);
  }
  let aa = 2.0 / cellPx;
  let coverage = smoothstep(aa, -aa, shapeDistance(local, shape, size));

  let tint = mix(params.color.rgb, params.hover.rgb, max(smoothstep(0.15, 0.85, charge), front * 0.35));

  let rgb = mix(background, tint, coverage * level);
  if (toSurface) { return vec4f(rgb, 1.0); }
  let luminance = dot(tint * level, vec3f(0.2126, 0.7152, 0.0722));
  let glow = max(0.0, (luminance - GLOW_THRESHOLD) / (1.0 - GLOW_THRESHOLD)) * coverage;
  return vec4f(rgb, glow);
}
`,bt=`
struct Blur { direction: vec4f }
@group(0) @binding(0) var<uniform> blur: Blur;
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;
@group(0) @binding(2) var sourceSampler: sampler;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let sigma = blur.direction.z;
  let radius = i32(ceil(3.0 * sigma));
  var sum = vec3f(0.0);
  var weight = 0.0;
  for (var i = -radius; i <= radius; i++) {
    let offset = f32(i);
    let w = exp(-(offset * offset) / (2.0 * sigma * sigma));
    let sample = textureSampleLevel(sourceTexture, sourceSampler, uv + offset * blur.direction.xy, 0.0);
    sum += select(sample.rgb, sample.rgb * sample.a, blur.direction.w > 0.5) * w;
    weight += w;
  }
  return vec4f(sum / weight, 1.0);
}
`,or=`
struct Composite { strength: vec4f }
@group(0) @binding(0) var<uniform> composite: Composite;
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;
@group(0) @binding(2) var glowTexture: texture_2d<f32>;
@group(0) @binding(3) var linearSampler: sampler;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let scene = textureSampleLevel(sceneTexture, linearSampler, uv, 0.0).rgb;
  let glow = textureSampleLevel(glowTexture, linearSampler, uv, 0.0).rgb;
  return vec4f(scene + glow * composite.strength.x, 1.0);
}
`,Ne=(c,r)=>{const b=typeof c=="string"?c.trim():"";let l=(/^#?([\da-f]{3}|[\da-f]{6})$/i.exec(b)||/^#?([\da-f]{6})$/i.exec(r))[1];return l.length===3&&(l=l.replace(/./g,d=>d+d)),[0,2,4].map(d=>parseInt(l.slice(d,d+2),16)/255)};function gr({text:c="",fontFamily:r='Geist, "Geist Sans", system-ui, sans-serif',fontWeight:b=500,textSize:g=.6,shapes:l="mixed",cellSize:d=10,dotSize:ce=.75,color:le="#929292",hoverColor:fe="#ffffff",backgroundColor:Z="#000000",speed:ue=1,scale:K=1,contrast:ge=1,brightness:je=.4,flow:Ge=0,direction:Ue=0,fade:Xe=.25,interactive:Ye=!0,splashRadius:Je=40,splashStrength:Ze=.4,glow:Ke=.35,intro:Qe=!0,introDuration:et=1.6,introKey:Ae=0,paused:tt=!1,onError:rt,className:Pt=""}){const nt=w.useRef(null),st=w.useRef(null),[Et,at]=w.useState(!1),h=w.useRef(null),me=w.useRef(()=>{}),de=w.useRef(()=>{}),ot=w.useRef(rt);h.current={text:String(c??""),fontFamily:r,fontWeight:b,textSize:g,shapes:l,cellSize:Math.max(2,d),dotSize:ce,color:le,hoverColor:fe,backgroundColor:Z,speed:ue,scale:Math.max(.05,K),contrast:ge,brightness:je,flow:Ge,direction:Ue,fade:Xe,interactive:Ye,splashRadius:Je,splashStrength:Ze,glow:Ke,intro:Qe,introDuration:Math.max(.1,et),introKey:Ae,paused:tt},ot.current=rt;const Rt=[l,d,ce,le,fe,Z,ue,K,ge,je,Ge,Ue,Xe,Ye,Je,Ze,Ke,Qe,et,tt].join("|"),Tt=[c,r,b,g].join("|"),Ie=w.useRef(()=>{});return w.useEffect(()=>{me.current()},[Rt]),w.useEffect(()=>{de.current()},[Tt]),w.useEffect(()=>{Ae&&Ie.current()},[Ae]),w.useEffect(()=>{const pe=nt.current,ve=st.current;if(!pe||!ve)return;let z=!1,A=!1,n,Q,F,I=0,xe=0,it=0,ee=[0,0],B=1,he=!0,ct=!1,p=1,S=1,L=10,$=[0,0],T=new Float32Array(1),y=new Float32Array(1),H=new Float32Array(1),ye=0,lt=0,te=ie,we=!1,N=!1,V=null,Le,be,ze,C=()=>{};const O={x:0,y:0,at:0,inside:!1},re=window.matchMedia("(prefers-reduced-motion: reduce)"),Se=document.createElement("canvas"),k=Se.getContext("2d"),Me=()=>C(),Oe=()=>{V=null},kt=(a,_,f)=>{const v=U(h.current),M=Math.max(.5,v.splashRadius*B/L*.5),q=Math.ceil(M*2.5),P=(a*B-$[0])/L-.5,E=(_*B-$[1])/L-.5,ne=Math.max(0,Math.floor(E-q)),Y=Math.min(S-1,Math.ceil(E+q)),J=Math.max(0,Math.floor(P-q)),Pe=Math.min(p-1,Math.ceil(P+q));for(let j=ne;j<=Y;j++){const se=j-E;for(let G=J;G<=Pe;G++){const ae=G-P,Ee=f*Math.exp(-(ae*ae+se*se)/(2*M*M)),oe=j*p+G;y[oe]=Math.min(1.2,y[oe]+Ee)}}N=!0},ft=a=>{if(!h.current.interactive)return;V||(V=pe.getBoundingClientRect());const _=performance.now(),f=a.clientX-V.left,v=a.clientY-V.top,M=f>=0&&v>=0&&f<=V.width&&v<=V.height;if(M){const q=O.inside?Math.max(8,_-O.at):16,E=(O.inside?Math.hypot(f-O.x,v-O.y):0)/q*1e3;kt(f,v,Math.min(1,.22+E*6e-4)*h.current.splashStrength),C()}O.x=f,O.y=v,O.at=_,O.inside=M},qe=a=>{if(z||A)return;A=!0,I&&cancelAnimationFrame(I),I=0,be?.disconnect(),ze?.disconnect(),Le?.(),me.current=()=>{},de.current=()=>{};const _=n;n=void 0,_?.dispose(),at(!1),ot.current?.(a instanceof Error?a:new Error(String(a)))},ut=()=>(B=Math.min(window.devicePixelRatio||1,Jt),[Math.max(1,Math.round(ve.clientWidth*B)),Math.max(1,Math.round(ve.clientHeight*B))]);return(async()=>{try{if(n=await Ht({powerPreference:"low-power"}),z)return n.dispose();Le=n.onError(qe);const a=ut(),_=navigator.gpu.getPreferredCanvasFormat(),f=Nt(n,ve,{dpr:B,size:a,autoResize:!1,format:_}),v=ke(n,{resolution:[a[0],a[1],1/a[0],1/a[1]],placement:[0,0,1,0],grid:[10,.75,0,1],field:[320,.5,2.8,0],motion:[0,0,0,.25],color:[.573,.573,.573,1],hover:[1,1,1,0],background:[0,0,0,1]}),M=Vt(n,{minFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}),q=(e,t)=>n.device.createTexture({size:[e,t],format:"rgba8unorm",usage:["texture_binding","copy_dst","render_attachment"],label:"shape-waves-mask"});Q=q(1,1),F=wt(n,4,"read"),F.write(T);const P=_e(n,ar,{label:"shape-waves-scene",set:{params:v,maskTexture:Q,maskSampler:M,charges:F}}),E=$e(n,{size:a,format:"rgba8unorm",label:"shape-waves-scene"}),ne=e=>[Math.max(1,Math.ceil(e[0]/2)),Math.max(1,Math.ceil(e[1]/2))],Y=$e(n,{size:ne(a),format:"rgba8unorm",label:"shape-waves-glow-a"}),J=$e(n,{size:ne(a),format:"rgba8unorm",label:"shape-waves-glow-b"}),Pe=ke(n,{direction:[0,0,4,1]}),j=ke(n,{direction:[0,0,4,0]}),se=_e(n,bt,{label:"shape-waves-glow-x",set:{blur:Pe,sourceTexture:E,sourceSampler:M}}),G=_e(n,bt,{label:"shape-waves-glow-y",set:{blur:j,sourceTexture:Y,sourceSampler:M}}),ae=ke(n,{strength:[2,0,0,0]}),Ee=_e(n,or,{label:"shape-waves-composite",set:{composite:ae,sceneTexture:E,glowTexture:J,linearSampler:M}});if(await Promise.all([P.compile({colors:[_]}),P.compile(E),se.compile(Y),G.compile(J),Ee.compile({colors:[_]})]),z)return;const oe=()=>h.current.glow>0;let gt=!1;const _t=()=>{const e=U(h.current),[t,i]=f.size,u=Math.max(1,Math.round(t/(e.cellSize*B)));L=t/u;const s=Math.max(1,Math.floor(i/L));if($=[0,(i-s*L)/2],u===p&&s===S&&T.length===p*S)return;p=u,S=s,T=new Float32Array(p*S),y=new Float32Array(p*S),H=new Float32Array(p*S),N=!1;const R=wt(n,T.byteLength,"read");R.write(T),P.set({charges:R}),F.destroy(),F=R},At=()=>{const e=p-1,t=S-1;let i=0;for(let s=0;s<S;s++){const R=(s===0?s:s-1)*p,o=(s===t?s:s+1)*p,x=s*p;for(let m=0;m<p;m++){const D=x+m,Re=x+(m===0?m:m-1),Te=x+(m===e?m:m+1),W=y[D],Be=y[Re]+y[Te]+y[R+m]+y[o+m]-4*W,Ce=(W-H[D])*tr,vt=(W+Ce+er*Be)*rr;H[D]=vt;const We=Math.min(1,Math.max(0,vt));T[D]=We,We>i&&(i=We)}}const u=y;return y=H,H=u,i},It=e=>{if(!N)return!1;ye=Math.min(ye+e,He*4);let t=1;for(;ye>=He;)ye-=He,t=At();return t<nr&&(y.fill(0),H.fill(0),T.fill(0),N=!1),F.write(T),N},Lt=()=>{const e=U(h.current);return he&&!document.hidden&&!e.paused&&e.speed>0&&!re.matches},mt=e=>{if(I=0,z||A)return;const t=U(h.current),i=xe?Math.min(.1,(e-xe)/1e3):0;xe=e;const u=Lt();if(u){it+=i*Qt*t.speed;const o=t.direction*Math.PI/180,x=t.flow*L*i;ee=[ee[0]+Math.cos(o)*x,ee[1]+Math.sin(o)*x]}const s=he&&!document.hidden&&It(i);we&&(we=!1,lt=e,te=0);const R=te<ie;R&&(te=Math.min(ie,(e-lt)/1e3/t.introDuration*ie)),v.set({placement:[$[0],$[1],S,te]}),v.set({field:[Kt*L*t.scale,.5-(t.brightness-.5)*.4,2.8*t.contrast,it]}),v.set({motion:[ee[0],ee[1],t.text.trim()?1:0,t.fade]});try{jt(n,o=>{if(!oe()){o.pass(f,P);return}o.pass(E,P),o.pass(Y,se),o.pass(J,G),o.pass(f,Ee)})}catch(o){qe(o);return}ct||(ct=!0,at(!0)),u||s||R?I=requestAnimationFrame(mt):xe=0};C=()=>{z||A||I||(I=requestAnimationFrame(mt))};const De=()=>{const e=U(h.current),t=e.text.trim(),[i,u]=f.size,s=t.length>0,R=s?Math.min(1,Zt/Math.max(i,u)):0,o=s?Math.max(1,Math.round(i*R)):1,x=s?Math.max(1,Math.round(u*R)):1;if(Se.width=o,Se.height=x,k.fillStyle="#000",k.fillRect(0,0,o,x),s){let D=Math.max(1,e.textSize*x);k.font=`${e.fontWeight} ${D}px ${e.fontFamily}`;const Re=k.measureText(t).width,Te=o*.9;Re>Te&&(D=Math.max(1,D*Te/Re),k.font=`${e.fontWeight} ${D}px ${e.fontFamily}`),k.textAlign="center",k.textBaseline="alphabetic";const W=k.measureText(t),Be=(o+W.actualBoundingBoxLeft-W.actualBoundingBoxRight)/2,Ce=(x+W.actualBoundingBoxAscent-W.actualBoundingBoxDescent)/2;k.fillStyle="#fff",k.fillText(t,Be,Ce)}const m=q(o,x);n.gpu.queue.copyExternalImageToTexture({source:Se},{texture:m.gpu},[o,x]),P.set({maskTexture:m}),Q.destroy(),Q=m},Fe=()=>{if(z||A)return;const e=U(h.current);_t(),v.set({placement:[$[0],$[1],S,te],grid:[L,Math.min(1,Math.max(.1,e.dotSize)),Yt[e.shapes]??0,p],color:[...Ne(e.color,"#929292"),1],hover:[...Ne(e.hoverColor,"#ffffff"),oe()?1:0],background:[...Ne(e.backgroundColor,"#000000"),1]}),ae.set({strength:[2*e.glow,0,0,0]}),e.intro!==gt&&(gt=e.intro,e.intro&&!re.matches&&(we=!0)),!e.interactive&&N&&(y.fill(0),H.fill(0),T.fill(0),N=!1,F.write(T)),C()},dt=()=>{if(z||A)return;De(),Fe();const e=U(h.current);!e.text.trim()||!document.fonts?.load||document.fonts.load(`${e.fontWeight} 32px ${e.fontFamily}`).then(()=>{z||A||(De(),C())}).catch(()=>{})},pt=()=>{if(z||A)return;Oe();const e=ut();(e[0]!==f.size[0]||e[1]!==f.size[1])&&f.resize(e);const[t,i]=f.size;E.resize([t,i]);const u=ne([t,i]);Y.resize(u),J.resize(u),Pe.set({direction:[1/u[0],0,4,1]}),j.set({direction:[0,1/u[1],4,0]}),v.set({resolution:[t,i,1/t,1/i]}),De(),Fe()};me.current=Fe,de.current=dt,Ie.current=()=>{z||A||!h.current.intro||re.matches||(we=!0,C())},be=new ResizeObserver(pt),be.observe(pe),ze=new IntersectionObserver(e=>{he=e.some(t=>t.isIntersecting),he&&C()},{threshold:0}),ze.observe(pe),document.addEventListener("visibilitychange",Me),re.addEventListener("change",Me),ht(window).addEventListener("pointermove",ft,{passive:!0}),window.addEventListener("scroll",Oe,{capture:!0,passive:!0}),pt(),dt()}catch(a){qe(a)}})(),()=>{z=!0,C=()=>{},me.current=()=>{},de.current=()=>{},Ie.current=()=>{},document.removeEventListener("visibilitychange",Me),re.removeEventListener("change",Me),ht(window).removeEventListener("pointermove",ft),window.removeEventListener("scroll",Oe,{capture:!0}),be?.disconnect(),ze?.disconnect(),Le?.(),I&&cancelAnimationFrame(I),Q?.destroy(),F?.destroy(),n?.dispose()}},[]),xt.jsx("div",{ref:nt,className:`shape-waves ${Pt}`,"data-ready":Et,style:{backgroundColor:Z},"aria-hidden":"true",children:xt.jsx("canvas",{ref:st,className:"shape-waves__canvas"})})}export{gr as default};
