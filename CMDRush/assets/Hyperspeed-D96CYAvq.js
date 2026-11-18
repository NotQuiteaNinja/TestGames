import{r as re,j as kt}from"./index-uEvbEw5g.js";import{b as M}from"./App-Dofw4Ib9.js";import{b as Nt}from"./_cmdrushBeat-CLoDPAAd.js";import{W as Gt,L as lt,S as ut,d as Ht,P as st,a as b,M as ie,T as Yt,e as jt,f as $t,I as W,B as Kt,g as be,h as qt,i as Zt,H as Qt,U as Jt,O as eo,j as to,b as ct,k as oo,V as Se,l as ao,N as no,A as ro,m as dt,n as S,Z as io,o as lo,p as vt}from"./three.module-DdQf8mAU.js";import"./react-vendor-DHz4kLit.js";const Y=400,D=160,j=80,$=1500,q=8,ft=["straight","gentle","winding","hills","racing","deep"],mt={dark:{background:"transparent",road:"#08080a",lines:"#25252d",tail:["#d856bf","#6750a2","#c247ac"],head:["#03b3c3","#0e5ea5","#324555"],poles:["#03b3c3"],dust:"#ffffff"},light:{background:"transparent",road:"#efeff2",lines:"#d0d0d7",tail:["#d856bf","#6750a2","#c247ac"],head:["#03b3c3","#0e5ea5","#324555"],poles:["#03b3c3"],dust:"#18181b"}},de=`
  uniform float uTime;
  uniform float uCurvature;
  uniform vec4 uCurveA;
  uniform float uCurveB;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uPixel;
  #define PI 3.14159265358979
  float nsin(float v) { return sin(v) * 0.5 + 0.5; }
  vec3 gentle(float p) {
    return vec3(
      cos(p * PI * 5.0 + uTime) * 25.0 - cos(0.02 * PI * 5.0 + uTime) * 25.0,
      sin(p * PI * 2.0 + PI * 0.5 + uTime) * 15.0 - sin(0.02 * PI * 2.0 + PI * 0.5 + uTime) * 15.0,
      0.0
    );
  }
  float windX(float p) { return cos(PI * p * 4.0 + uTime) * 25.0 + pow(cos(PI * p * 8.0 + uTime * 2.0), 2.0) * 5.0; }
  float windY(float p) { return -nsin(PI * p * 8.0 + uTime) * 10.0 - pow(nsin(PI * p + uTime / 8.0), 5.0) * 10.0; }
  vec3 winding(float p) { return vec3(windX(p) - windX(0.0125), windY(p) - windY(0.0125), 0.0); }
  vec3 hills(float p) {
    return vec3(
      cos(p * PI * 3.0 + uTime) * 30.0 - cos(0.02 * PI * 3.0 + uTime) * 30.0,
      nsin(p * PI * 6.0 + uTime) * 30.0 - nsin(0.02 * PI * 6.0 + uTime) * 30.0,
      nsin(p * PI * 10.0 + uTime) * 20.0 - nsin(0.02 * PI * 10.0 + uTime) * 20.0
    );
  }
  vec3 racing(float p) {
    return vec3(
      sin(p * PI * 2.0 + uTime) * 35.0 - sin(0.0125 * PI * 2.0 + uTime) * 35.0,
      sin(p * PI * 3.0 + uTime) * 10.0 - sin(0.0125 * PI * 3.0 + uTime) * 10.0,
      0.0
    );
  }
  float deepX(float p) { return sin(p * PI * 4.0 + uTime) * 10.0; }
  float deepY(float p) { return pow(abs(p * 10.0), 2.0) + sin(p * PI * 8.0 + uTime) * 20.0; }
  vec3 deep(float p) { return vec3(deepX(p) - deepX(0.02), deepY(p) - deepY(0.02), 0.0); }
  vec3 bend(float p) {
    vec3 d = gentle(p) * uCurveA.x + winding(p) * uCurveA.y + hills(p) * uCurveA.z + racing(p) * uCurveA.w + deep(p) * uCurveB;
    return d * uCurvature;
  }
`,uo=`
  ${de}
  attribute vec4 aSeedA;
  attribute vec4 aSeedB;
  attribute float aPair;
  attribute float aTone;
  uniform float uTravel;
  uniform float uRoadX;
  uniform float uRoadWidth;
  uniform float uLanes;
  uniform float uDirection;
  uniform vec2 uSpeedRange;
  uniform float uTrail;
  uniform float uStretch;
  uniform float uSize;
  uniform float uRadiusScale;
  uniform float uMirror;
  uniform vec3 uColors[${q}];
  uniform float uColorCount;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vThin;
  void main() {
    float laneWidth = uRoadWidth / uLanes;
    float lane = min(floor(aSeedA.x * uLanes), uLanes - 1.0);
    float laneX = (lane + 0.5) * laneWidth - uRoadWidth * 0.5 + (aSeedA.y - 0.5) * 0.5 * laneWidth;
    float carWidth = mix(0.3, 0.5, aSeedA.z) * laneWidth;
    float radius = mix(0.05, 0.14, aSeedA.w) * uSize;
    float len = mix(0.03, 0.2, aSeedB.x) * uTravel * uTrail * (1.0 + uStretch);
    float speed = mix(uSpeedRange.x, uSpeedRange.y, aSeedB.y) * uDirection;
    vec3 center = vec3(
      uRoadX + laneX + aPair * carWidth,
      aSeedB.w * 0.8 + radius * 1.3,
      position.z * len + len - mod(uTime * speed + aSeedB.z * uTravel, uTravel)
    );
    vAbove = center.y;
    center.y = mix(center.y, -center.y * 1.8, uMirror);
    center += bend(abs(center.z / uTravel));
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);
    float wanted = radius * uRadiusScale;
    float shown = max(wanted, depth * uPixel * 0.75);
    vThin = wanted / shown;
    vec3 p = center + vec3(position.x * shown, position.y * shown * mix(1.0, 2.2, uMirror), 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vec3 n = normal;
    n.y *= 1.0 - 2.0 * uMirror;
    vNormal = normalize(normalMatrix * n);
    vView = -mv.xyz;
    vUv = uv;
    vColor = uColors[int(min(floor(aTone * uColorCount), uColorCount - 1.0))];
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,so=`
  uniform vec2 uFade;
  uniform float uIntensity;
  uniform float uSharp;
  uniform float uCore;
  uniform float uMirror;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vThin;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float alpha = pow(facing, uSharp) * smoothstep(uFade.x, uFade.y, vUv.x) * uIntensity * vThin * (1.0 - vFog);
    alpha *= mix(1.0, exp(-vAbove * 0.9), uMirror);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));
  }
`,co=`
  ${de}
  attribute vec4 aSeed;
  attribute float aIndex;
  attribute float aSide;
  uniform float uTravel;
  uniform float uCount;
  uniform float uEdge;
  uniform float uHeight;
  uniform float uRadiusScale;
  uniform float uMirror;
  uniform vec3 uColors[${q}];
  uniform float uColorCount;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vHeight;
  varying float vThin;
  void main() {
    vHeight = position.y + 0.5;
    float width = mix(0.08, 0.22, aSeed.y);
    float height = mix(1.3, 1.9, aSeed.z) * uHeight;
    float spacing = uTravel / max(uCount, 1.0);
    vec3 center = vec3(
      aSide * uEdge,
      vHeight * height,
      -uTravel + mod(uTime * 120.0 + (aIndex + aSeed.x * 0.6) * spacing, uTravel)
    );
    vAbove = center.y;
    center.y = mix(center.y, -center.y * 1.6, uMirror);
    center += bend(abs(center.z / uTravel));
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);
    float wanted = width * uRadiusScale;
    float shown = max(wanted, depth * uPixel * 0.75);
    vThin = wanted / shown;
    vec3 p = center + vec3(position.x * shown, 0.0, position.z * shown);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vNormal = normalize(normalMatrix * normal);
    vView = -mv.xyz;
    vColor = uColors[int(min(floor(aSeed.w * uColorCount), uColorCount - 1.0))];
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,vo=`
  uniform float uIntensity;
  uniform float uSharp;
  uniform float uCore;
  uniform float uMirror;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vColor;
  varying float vFog;
  varying float vAbove;
  varying float vHeight;
  varying float vThin;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float ends = smoothstep(0.0, 0.08, vHeight) * smoothstep(1.0, 0.9, vHeight);
    float alpha = pow(facing, uSharp) * ends * uIntensity * vThin * (1.0 - vFog);
    alpha *= mix(1.0, exp(-vAbove * 0.6), uMirror);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));
  }
`,fo=`
  ${de}
  attribute vec4 aSeed;
  attribute float aEnd;
  uniform float uTravel;
  uniform float uStretch;
  uniform float uSpread;
  varying float vAlpha;
  void main() {
    float x = (aSeed.x - 0.5) * uSpread;
    float y = mix(1.0, 42.0, aSeed.y * aSeed.y);
    float speed = mix(140.0, 260.0, aSeed.w);
    float z = -uTravel + mod(uTime * speed + aSeed.z * uTravel, uTravel);
    float len = (0.6 + uStretch * 7.0) * mix(0.6, 1.4, aSeed.w);
    vec3 p = vec3(x, y, z + aEnd * len);
    p += bend(abs(p.z / uTravel));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vAlpha = aEnd * (1.0 - smoothstep(uFogNear, uFogFar, -mv.z));
  }
`,mo=`
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColor, vAlpha * uIntensity);
  }
`,ho=`
  ${de}
  uniform float uTravel;
  uniform float uWidth;
  varying vec2 vRoad;
  varying float vFog;
  void main() {
    vec3 p = position;
    p.x *= uWidth;
    vRoad = vec2(p.x, p.z);
    p += bend(abs(p.z / uTravel));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  }
`,po=`
  uniform float uTime;
  uniform vec3 uRoadColor;
  uniform vec3 uLineColor;
  uniform vec3 uBackground;
  uniform float uRoadWidth;
  uniform float uMedian;
  uniform float uLanes;
  uniform float uTransparent;
  uniform float uOpacity;
  varying vec2 vRoad;
  varying float vFog;
  float stripe(float d, float w) {
    float aa = fwidth(d) * 1.2;
    return 1.0 - smoothstep(w - aa, w + aa, d);
  }
  void main() {
    float rx = abs(vRoad.x) - uMedian * 0.5;
    vec3 color = rx < 0.0 ? mix(uRoadColor, uLineColor, 0.12) : uRoadColor;
    if (rx >= 0.0) {
      float laneWidth = uRoadWidth / uLanes;
      float shoulder = max(stripe(abs(rx - 0.3), 0.07), stripe(abs(rx - (uRoadWidth - 0.3)), 0.07));
      float nearest = floor(rx / laneWidth + 0.5);
      float inner = step(0.5, nearest) * step(nearest, uLanes - 0.5);
      float dash = step(0.5, fract((vRoad.y - uTime * 120.0) / 14.0));
      float marks = max(shoulder, stripe(abs(rx - nearest * laneWidth), 0.06) * inner * dash);
      color = mix(color, uLineColor, marks);
    }
    float alpha = mix(1.0, 1.0 - vFog, uTransparent) * uOpacity;
    gl_FragColor = vec4(mix(color, uBackground, vFog * (1.0 - uTransparent)), alpha);
  }
`,go=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,xo=`
  uniform sampler2D uTexture;
  uniform vec2 uTexel;
  varying vec2 vUv;
  vec4 tap(vec2 offset) {
    return min(texture2D(uTexture, vUv + uTexel * offset), vec4(1.0));
  }
  void main() {
    vec4 sum = tap(vec2(0.0)) * 4.0 + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));
    gl_FragColor = sum * 0.125;
  }
`,pt=`
  uniform sampler2D uTexture;
  uniform vec2 uTexel;
  varying vec2 vUv;
  vec4 tent() {
    vec4 sum = texture2D(uTexture, vUv + uTexel * vec2(-1.0, 0.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(1.0, 0.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, -1.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, 1.0));
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, -0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, -0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, 0.5)) * 2.0;
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, 0.5)) * 2.0;
    return sum / 12.0;
  }
`,wo=`
  ${pt}
  void main() {
    gl_FragColor = tent();
  }
`,yo=`
  ${pt}
  uniform float uStrength;
  uniform float uCeiling;
  uniform float uLight;
  void main() {
    vec4 color = tent() * uStrength;
    float peak = max(uLight > 0.5 ? color.a : max(color.r, max(color.g, color.b)), 0.0001);
    color *= uCeiling * (1.0 - exp(-peak / uCeiling)) / peak;
    gl_FragColor = uLight > 0.5 ? color : vec4(color.rgb, 0.0);
  }
`;let U=null;const K=n=>{if(U=U??document.createElement("canvas").getContext("2d"),!U)return[1,1,1];U.fillStyle="#000000",U.fillStyle=n;const o=String(U.fillStyle);if(o.startsWith("#")){const d=parseInt(o.slice(1,7),16);return[(d>>16&255)/255,(d>>8&255)/255,(d&255)/255]}const u=o.match(/[\d.]+/g)?.map(Number)??[0,0,0];return[u[0]/255,u[1]/255,u[2]/255]},Ae=(n,o,u)=>{const d=u.length?u:["#ffffff"];for(let v=0;v<q;v++)n.value[v].fromArray(K(d[v%d.length]));o.value=Math.min(d.length,q)},ht=n=>{const o=new ao;return o.setIndex(n.index),Object.entries(n.attributes).forEach(([u,d])=>o.setAttribute(u,d)),o},V=n=>Math.sin(n)*.5+.5,le=(n,o)=>Math.cos(Math.PI*n*4+o)*25+Math.cos(Math.PI*n*8+o*2)**2*5,ue=(n,o)=>-V(Math.PI*n*8+o)*10-V(Math.PI*n+o/8)**5*10,se=(n,o)=>Math.sin(n*Math.PI*4+o)*10,ce=(n,o)=>Math.abs(n*10)**2+Math.sin(n*Math.PI*8+o)*20,Co=(n,o)=>{const{PI:u,cos:d,sin:v}=Math;return[[d(n*u*5+o)*25-d(.02*u*5+o)*25,v(n*u*2+u*.5+o)*15-v(.02*u*2+u*.5+o)*15,0],[le(n,o)-le(.0125,o),ue(n,o)-ue(.0125,o),0],[d(n*u*3+o)*30-d(.02*u*3+o)*30,V(n*u*6+o)*30-V(.02*u*6+o)*30,V(n*u*10+o)*20-V(.02*u*10+o)*20],[v(n*u*2+o)*35-v(.0125*u*2+o)*35,v(n*u*3+o)*10-v(.0125*u*3+o)*10,0],[se(n,o)-se(.02,o),ce(n,o)-ce(.02,o),0]]},Mo=(n,o)=>{const[d,,v,Z]=Co(.025,n);return[[d[0]*o*2,d[1]*o*.4,-3],[(le(.025,n)-le(.025+.007,n))*o*-2,(ue(.025,n)-ue(.025+.007,n))*o*-5,-10],[v[0]*o*2,v[1]*o*2,v[2]*o*2-5],[Z[0]*o,Z[1]*o,-5],[(se(.025,n)-se(.025+.01,n))*o*-2,(ce(.025,n)-ce(.025+.01,n))*o*-4,-10]]},Fo=({curve:n="winding",curvature:o=1,speed:u=1,boost:d=3,fov:v=90,boostFov:Z=130,lanes:gt=3,roadWidth:xt=10,medianWidth:wt=2,density:yt=40,trailLength:Ct=1,lightSize:Mt=1,poles:Tt=20,poleHeight:bt=1,dust:St=100,glow:At=.6,reflections:Rt=.5,steer:Ft=.35,tailColors:Re,headColors:Fe,poleColors:Ee,roadColor:Et,roadOpacity:Pt=.1,lineColor:It,background:Lt,theme:Pe="dark",interactive:Wt=!0,boosting:zt=!1,onBoostStart:Ie,onBoostEnd:Le,className:We="",style:Xt})=>{const ze=re.useRef(null),A=mt[Pe]??mt.dark,Xe={light:Pe==="light",curve:ft.includes(n)?n:"winding",curvature:Math.max(0,o),speed:Math.max(0,u),boost:Math.max(1,d),fov:Math.min(170,Math.max(20,v)),boostFov:Math.min(170,Math.max(20,Z)),lanes:Math.max(1,Math.round(gt)),roadWidth:Math.max(1,xt),medianWidth:Math.max(0,wt),density:Math.min(D,Math.max(0,Math.round(yt))),trailLength:Math.max(.05,Ct),lightSize:Math.max(.1,Mt),poles:Math.min(j,Math.max(0,Math.round(Tt))),poleHeight:Math.max(.1,bt),dust:Math.min($,Math.max(0,Math.round(St))),glow:Math.max(0,At),reflections:Math.max(0,Rt),steer:Math.max(0,Ft),tailColors:Re?.length?Re:A.tail,headColors:Fe?.length?Fe:A.head,poleColors:Ee?.length?Ee:A.poles,roadColor:Et??A.road,roadOpacity:Math.min(1,Math.max(0,Pt)),lineColor:It??A.lines,background:Lt??A.background,dustColor:A.dust,interactive:Wt,boosting:zt},z=re.useRef(Xe);z.current=Xe;const ve=re.useRef({onBoostStart:Ie,onBoostEnd:Le});return ve.current={onBoostStart:Ie,onBoostEnd:Le},re.useEffect(()=>{const m=ze.current;if(!m)return;const _e=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,s=new Gt({antialias:!0,alpha:!0,powerPreference:"high-performance"});s.outputColorSpace=lt,s.autoClear=!1,s.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),m.appendChild(s.domElement);const X=new ut,p=new Ht(z.current.fov,1,.1,1e4);p.position.set(0,8,-5);const g={uTime:{value:0},uCurvature:{value:1},uCurveA:{value:new oo},uCurveB:{value:0},uFogNear:{value:Y*.22},uFogFar:{value:Y*.95},uTravel:{value:Y},uStretch:{value:0},uPixel:{value:.001}},x=[],Q=[],J=(t,e,r,c={})=>{const h=new ct({vertexShader:t,fragmentShader:e,uniforms:{...g,...r},transparent:!0,depthWrite:!1,...c});return x.push(h),h},Be=()=>({value:Array.from({length:q},()=>new b(1,1,1))}),ee=new st(1,Y,1,220);ee.rotateX(-Math.PI/2),ee.translate(0,0,-Y/2),x.push(ee);const w={uWidth:{value:1},uRoadColor:{value:new b},uLineColor:{value:new b},uBackground:{value:new b},uRoadWidth:{value:10},uMedian:{value:2},uLanes:{value:3},uTransparent:{value:0},uOpacity:{value:1}},te=J(ho,po,w,{transparent:!0,depthWrite:!0}),oe=new ie(ee,te);oe.frustumCulled=!1,oe.renderOrder=0,oe.layers.enable(1),X.add(oe);const Oe=new Yt(new jt(new b(0,0,0),new b(0,0,-1)),24,1,7,!1);x.push(Oe);const De=(t,e,r)=>{const c=ht(Oe),h=new Float32Array(D*2*4),f=new Float32Array(D*2*4),I=new Float32Array(D*2),N=new Float32Array(D*2);for(let T=0;T<D;T++){const O=[Math.random(),Math.random(),Math.random(),Math.random()],L=[Math.random(),Math.random(),Math.random(),Math.random()*Math.random()],H=Math.random();for(let i=0;i<2;i++){const l=T*2+i;h.set(O,l*4),f.set(L,l*4),I[l]=i?.5:-.5,N[l]=H}}c.setAttribute("aSeedA",new W(h,4)),c.setAttribute("aSeedB",new W(f,4)),c.setAttribute("aPair",new W(I,1)),c.setAttribute("aTone",new W(N,1)),c.instanceCount=0,x.push(c);const G={uRoadX:{value:0},uRoadWidth:{value:10},uLanes:{value:3},uDirection:{value:t},uSpeedRange:{value:new Se(...r)},uTrail:{value:1},uSize:{value:1},uColors:Be(),uColorCount:{value:1},uFade:{value:new Se(...e)}},ne=(T,O,L,H)=>{const i=J(uo,so,{...G,uRadiusScale:{value:T},uSharp:{value:O},uMirror:{value:L},uIntensity:{value:1},uCore:{value:0}},{depthTest:!L});Q.push(i);const l=new ie(c,i);return l.frustumCulled=!1,l.renderOrder=H,L||l.layers.enable(1),X.add(l),i};return{geometry:c,uniforms:G,reflection:ne(2.1,1.2,1,1),core:ne(1,.85,0,3)}},fe=De(1,[0,.6],[60,80]),me=De(-1,[1,.4],[120,160]),Ue=new $t(1,1,1,8,1,!0);x.push(Ue);const R=ht(Ue),Ve=new Float32Array(j*2*4),ke=new Float32Array(j*2),Ne=new Float32Array(j*2);for(let t=0;t<j;t++)for(let e=0;e<2;e++){const r=t*2+e;Ve.set([Math.random(),Math.random(),Math.random(),Math.random()],r*4),ke[r]=t+(e?.5:0),Ne[r]=e?1:-1}R.setAttribute("aSeed",new W(Ve,4)),R.setAttribute("aIndex",new W(ke,1)),R.setAttribute("aSide",new W(Ne,1)),R.instanceCount=0,x.push(R);const _={uCount:{value:20},uEdge:{value:11},uHeight:{value:1},uColors:Be(),uColorCount:{value:1}},Ge=(t,e,r,c)=>{const h=J(co,vo,{..._,uRadiusScale:{value:t},uSharp:{value:e},uMirror:{value:r},uIntensity:{value:1},uCore:{value:0}},{depthTest:!r});Q.push(h);const f=new ie(R,h);return f.frustumCulled=!1,f.renderOrder=c,r||f.layers.enable(1),X.add(f),h},he={reflection:Ge(2.4,1.2,1,1),core:Ge(1,.8,0,3)},F=new Kt,pe=new Float32Array($*2*4),He=new Float32Array($*2);for(let t=0;t<$;t++){const e=[Math.random(),Math.random(),Math.random(),Math.random()];pe.set(e,t*8),pe.set(e,t*8+4),He[t*2+1]=1}F.setAttribute("position",new be(new Float32Array($*2*3),3)),F.setAttribute("aSeed",new be(pe,4)),F.setAttribute("aEnd",new be(He,1)),F.setDrawRange(0,0),x.push(F);const ae={uSpread:{value:140},uColor:{value:new b(1,1,1)},uIntensity:{value:.5}},Ye=J(fo,mo,ae);Q.push(Ye);const ge=new qt(F,Ye);ge.frustumCulled=!1,ge.renderOrder=4,X.add(ge);const _t=s.extensions.has("EXT_color_buffer_float")||s.extensions.has("EXT_color_buffer_half_float"),y=Array.from({length:5},(t,e)=>{const r=new Zt(1,1,{type:_t?Qt:Jt,depthBuffer:e===0});return x.push(r),r}),je=new ut,Bt=new eo(-1,1,1,-1,0,1),$e=new st(2,2);x.push($e);const xe=new ie($e);xe.frustumCulled=!1,je.add(xe);const we=(t,e)=>{const r=new ct({vertexShader:go,fragmentShader:t,uniforms:{uTexture:{value:null},uTexel:{value:new Se},uStrength:{value:1},uCeiling:{value:1},uLight:{value:0}},depthTest:!1,depthWrite:!1,...e});return x.push(r),r},Ot=we(xo,{blending:lo}),Dt=we(wo,{blending:vt,blendSrc:S,blendDst:S,blendSrcAlpha:S,blendDstAlpha:S}),E=we(yo,{blending:vt,blendSrc:S}),ye=(t,e,r)=>{xe.material=t,t.uniforms.uTexture.value=e.texture,t.uniforms.uTexel.value.set(1/e.width,1/e.height),s.setRenderTarget(r),s.render(je,Bt)},Ke=new to;let qe=0;const a={boost:0,held:!1,fov:z.current.fov,fovVelocity:0,steerX:0,steerY:0,pointerX:0,pointerY:0,weights:[0,0,0,0,0],visible:!0},C={tail:"",head:"",poles:"",surface:"",light:null},P=new b;let k=0,Ce=performance.now(),Me=!0;const Ut=t=>{const e=t.tailColors.join();e!==C.tail&&(C.tail=e,Ae(fe.uniforms.uColors,fe.uniforms.uColorCount,t.tailColors));const r=t.headColors.join();r!==C.head&&(C.head=r,Ae(me.uniforms.uColors,me.uniforms.uColorCount,t.headColors));const c=t.poleColors.join();c!==C.poles&&(C.poles=c,Ae(_.uColors,_.uColorCount,t.poleColors));const h=[t.roadColor,t.lineColor,t.background,t.dustColor].join();if(h!==C.surface){C.surface=h,w.uRoadColor.value.fromArray(K(t.roadColor)),w.uLineColor.value.fromArray(K(t.lineColor)),ae.uColor.value.fromArray(K(t.dustColor));const f=t.background==="transparent",I=f?[0,0,0]:K(t.background);w.uBackground.value.fromArray(I),w.uTransparent.value=f?1:0,Ke.setRGB(...I,lt),qe=f?0:1}C.light!==t.light&&(C.light=t.light,Q.forEach(f=>{f.blending=t.light?no:ro,f.needsUpdate=!0}),E.blendDst=t.light?dt:S,E.blendSrcAlpha=t.light?S:io,E.blendDstAlpha=t.light?dt:S,E.uniforms.uLight.value=t.light?1:0)};let Te=!1;const Vt=()=>{const t=Math.max(1,m.clientWidth),e=Math.max(1,m.clientHeight);s.setSize(t,e,!1),y.forEach((r,c)=>r.setSize(Math.max(1,Math.round(t/2**(c+1))),Math.max(1,Math.round(e/2**(c+1))))),p.aspect=t/e,p.updateProjectionMatrix()},Ze=()=>{Te=!0,Je()},Qe=t=>{if(k=0,Te&&(Te=!1,Vt()),!Me)return;const e=Nt(z.current),r=Math.min(.05,Math.max(.001,(t-Ce)/1e3));Ce=t,Ut(e);const c=a.held&&e.interactive||e.boosting?1:0;a.boost+=(c-a.boost)*(1-Math.exp(-r/(c>a.boost?.28:.85)));const h=e.speed*(_e?.3:1)*(1+(e.boost-1)*a.boost);g.uTime.value+=r*h,g.uStretch.value=a.boost*1.1,g.uCurvature.value=e.curvature;const f=ft.indexOf(e.curve)-1,I=1-Math.exp(-r/.6);a.weights=a.weights.map((i,l)=>i+((l===f?1:0)-i)*I),g.uCurveA.value.set(a.weights[0],a.weights[1],a.weights[2],a.weights[3]),g.uCurveB.value=a.weights[4];const N=e.roadWidth/2+e.medianWidth/2,G=.45+.55*e.roadOpacity;[fe,me].forEach((i,l)=>{i.geometry.instanceCount=e.density*2,i.uniforms.uRoadX.value=l?N:-N,i.uniforms.uRoadWidth.value=e.roadWidth,i.uniforms.uLanes.value=e.lanes,i.uniforms.uTrail.value=e.trailLength,i.uniforms.uSize.value=e.lightSize,i.core.uniforms.uIntensity.value=e.light?.95:1+.35*a.boost,i.core.uniforms.uCore.value=e.light?0:.75,i.reflection.uniforms.uIntensity.value=e.reflections*(e.light?.22:.42)*G}),R.instanceCount=e.poles*2,_.uCount.value=Math.max(1,e.poles),_.uEdge.value=e.roadWidth+e.medianWidth/2+.8,_.uHeight.value=e.poleHeight,he.core.uniforms.uIntensity.value=e.light?.9:1,he.core.uniforms.uCore.value=e.light?0:.6,he.reflection.uniforms.uIntensity.value=e.reflections*(e.light?.2:.38)*G,F.setDrawRange(0,e.dust*2),ae.uIntensity.value=(e.light?.35:.45)*(1+a.boost),ae.uSpread.value=(e.roadWidth*2+e.medianWidth)*5,w.uWidth.value=e.roadWidth*2+e.medianWidth+3,w.uRoadWidth.value=e.roadWidth,w.uMedian.value=e.medianWidth,w.uLanes.value=e.lanes,w.uOpacity.value=e.roadOpacity,te.depthWrite=e.roadOpacity>.5;const ne=_e?e.fov:e.fov+(e.boostFov-e.fov)*a.boost;a.fovVelocity+=((ne-a.fov)*90-a.fovVelocity*13)*r,a.fov+=a.fovVelocity*r,p.fov=a.fov,g.uPixel.value=2*Math.tan(a.fov*Math.PI/360)/Math.max(1,s.domElement.height);const T=1-Math.exp(-r/.35),O=e.interactive?e.steer:0;a.steerX+=(a.pointerX*O-a.steerX)*T,a.steerY+=(a.pointerY*O-a.steerY)*T,p.position.set(a.steerX*e.roadWidth*.45,8-a.steerY*2.5,-5);const L=Mo(g.uTime.value,e.curvature),H=1-a.weights.reduce((i,l)=>i+l,0);if(P.set(0,0,-10*H),L.forEach((i,l)=>{P.x+=i[0]*a.weights[l],P.y+=i[1]*a.weights[l],P.z+=i[2]*a.weights[l]}),P.x+=a.steerX*2.5,P.add(p.position),p.lookAt(P),p.updateProjectionMatrix(),s.setRenderTarget(null),s.setClearColor(Ke,qe),s.clear(),s.render(X,p),e.glow>0){const i=g.uPixel.value;g.uPixel.value=i*(s.domElement.height/y[0].height),p.layers.set(1),te.colorWrite=!1,s.setRenderTarget(y[0]),s.setClearColor(0,0),s.clear(),s.render(X,p),te.colorWrite=!0,p.layers.set(0),g.uPixel.value=i;for(let l=1;l<y.length;l++)ye(Ot,y[l-1],y[l]);for(let l=y.length-1;l>1;l--)ye(Dt,y[l],y[l-1]);E.uniforms.uStrength.value=e.glow*(e.light?.5:1.4),E.uniforms.uCeiling.value=e.glow*(e.light?.3:.5),ye(E,y[1],null)}a.visible&&(k=requestAnimationFrame(Qe))},Je=()=>{k||!Me||!a.visible||(Ce=performance.now(),k=requestAnimationFrame(Qe))},et=t=>{a.held!==t&&(a.held=t,z.current.interactive&&(t?ve.current.onBoostStart?.():ve.current.onBoostEnd?.()))},tt=t=>{t.button!==0&&t.pointerType==="mouse"||et(!0)},B=()=>et(!1),ot=t=>{const e=m.getBoundingClientRect();a.pointerX=(t.clientX-e.left)/e.width*2-1,a.pointerY=(t.clientY-e.top)/e.height*2-1},at=()=>{a.pointerX=0,a.pointerY=0},nt=t=>{z.current.interactive&&t.preventDefault()},rt=new ResizeObserver(Ze);rt.observe(m);const it=new IntersectionObserver(t=>{a.visible=t.some(e=>e.isIntersecting),a.visible&&Je()});return it.observe(m),M(m).addEventListener("pointerdown",tt),M(m).addEventListener("pointermove",ot),M(m).addEventListener("pointerleave",at),m.addEventListener("contextmenu",nt),M(window).addEventListener("pointerup",B),M(window).addEventListener("pointercancel",B),window.addEventListener("blur",B),Ze(),()=>{Me=!1,cancelAnimationFrame(k),rt.disconnect(),it.disconnect(),M(m).removeEventListener("pointerdown",tt),M(m).removeEventListener("pointermove",ot),M(m).removeEventListener("pointerleave",at),m.removeEventListener("contextmenu",nt),M(window).removeEventListener("pointerup",B),M(window).removeEventListener("pointercancel",B),window.removeEventListener("blur",B),x.forEach(t=>t.dispose()),s.dispose(),s.domElement.remove()}},[]),kt.jsx("div",{ref:ze,className:`hyperspeed${We?` ${We}`:""}`,style:Xt})};export{Fo as default};
