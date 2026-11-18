import{r as k,j as se}from"./index-uEvbEw5g.js";import{b as l}from"./App-Dofw4Ib9.js";import{b as I}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Ue=1.8,Ve=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ge=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uScale;
uniform float uRatio;
uniform float uTime;
uniform float uDrift;
uniform vec2 uSteer;
uniform float uBend;
uniform float uCount;
uniform float uSwing;
uniform float uWave;
uniform float uWidth;
uniform float uPulseWidth;
uniform float uHead;
uniform float uTail;
uniform float uChance;
uniform float uSpacing;
uniform float uPulseSpeed;
uniform float uFlow;
uniform float uHalo;
uniform float uGlow;
uniform float uBrightness;
uniform float uVariance;
uniform float uBody;
uniform float uFadeNear;
uniform float uFadeFar;
uniform vec3 uCable;
uniform vec3 uPulse;
uniform vec3 uTunnel;
uniform vec3 uSurge;
uniform float uReveal;
uniform float uGrain;
uniform float uSeed;
uniform float uLight;
uniform float uOpacity;
out vec4 outColor;

const float TAU = 6.2831853;

vec3 inkOf(vec3 color, float depthOfInk) {
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float peak = max(color.r, max(color.g, color.b));
  float chroma = (peak - min(color.r, min(color.g, color.b))) / max(peak, 0.001);
  return color * min(1.0, mix(depthOfInk, depthOfInk * 1.7, chroma) / max(luma, 0.001));
}

float hash(float n) {
  return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453);
}

vec2 bendAt(float depth) {
  float reach = 1.0 - exp(-max(depth, 0.0) * 0.55);
  vec2 wobble = vec2(sin(uDrift * 0.37 + depth * 0.31), cos(uDrift * 0.29 + depth * 0.23)) * uBend;
  return (wobble + uSteer) * reach;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution - uCenter) / uScale;
  float depth = -log(max(length(p), 1e-5));
  vec2 q = p;
  for (int i = 0; i < 4; i++) {
    q = p - bendAt(depth);
    depth = -log(max(length(q), 1e-5));
  }
  float r = length(q);
  float px = r * uScale;
  float turn = atan(q.y, q.x) / TAU;
  float s = turn - uSwing - uWave * sin(depth * 1.2 + uDrift * 0.5);
  float cell = floor(s * uCount);
  float spacing = TAU * px / uCount;
  float near = smoothstep(0.55, 1.25, r);
  float width = uWidth * (1.0 + near * 1.2);
  float soft = uRatio * (0.55 + near * 0.9);
  float tight = uRatio * uHalo * (1.0 + near);
  float wide = tight * 4.5;

  float lines = 0.0;
  float body = 0.0;
  vec3 glow = vec3(0.0);
  float strokes = 0.0;
  for (int k = -3; k <= 3; k++) {
    float i = cell + float(k);
    float id = mod(i, uCount);
    float h1 = hash(id);
    float h2 = hash(id + 17.0);
    float h3 = hash(id + 41.0);
    float h4 = hash(id + 73.0);
    float center = (i + 0.5 + (h1 - 0.5) * 0.55) / uCount;
    center += 0.12 * sin(depth * (0.8 + h2 * 0.9) + uDrift * (0.4 + h3 * 0.5) + h4 * TAU) / uCount;
    float d = abs(s - center) * TAU * px;
    float shade = 1.0 + uVariance * (h3 - 0.5) * 0.9;
    float reach = smoothstep(spacing * 2.4, spacing * 1.4, d);

    lines += smoothstep(width + soft, width - soft, d) * shade;
    body += exp(-d / max(spacing * 0.22, 0.001)) * shade * reach;

    float x = depth * uSpacing + uTime * uPulseSpeed * (0.55 + h2 * 0.6) * uFlow + h4 * 7.0;
    float lead = (fract(x) - 0.5) / uSpacing * uFlow;
    float lit = step(hash(id * 3.7 + floor(x) * 13.1), uChance);
    float limit = 0.5 / uSpacing;
    float head = exp(-pow(max(-lead, 0.0) / uHead, 2.0)) * smoothstep(-limit, -limit * 0.8, lead);
    float tail = exp(-max(lead, 0.0) / uTail) * smoothstep(limit, limit * 0.55, lead);
    float pulse = (lead < 0.0 ? head : tail) * lit;
    float ring = uSurge.y * exp(-pow((depth - uSurge.x) / uSurge.z, 2.0));
    pulse = max(pulse, ring);
    float hot = pulse * (lead < 0.0 ? 1.0 : exp(-max(lead, 0.0) / (uTail * 0.35)));

    float core = uPulseWidth * width + 0.35 * uRatio;
    float stroke = smoothstep(core + soft, core - soft, d);
    float bloom = (exp(-d / tight) * 0.7 + exp(-d / wide) * 0.18) * uGlow * reach;
    vec3 tint = mix(uPulse, vec3(1.0), hot * 0.55 * (1.0 - uLight));
    glow += tint * pulse * (stroke * 1.5 + bloom) * shade;
    strokes += pulse * stroke * shade;
  }

  float lod = smoothstep(4.0, 1.2, spacing);
  float average = min(2.0 * uWidth / max(spacing, 0.001), 1.0);
  lines = mix(lines, average, lod);
  glow = mix(glow, uPulse * average * 0.6 * uChance, lod);
  strokes = mix(strokes, average * 0.6 * uChance, lod);
  body = mix(body, 1.0, lod) * uBody;

  float rr = r * 0.25;
  float fade = smoothstep(0.0, uFadeNear, rr) * smoothstep(uFadeFar, uFadeFar * 0.55, rr);
  fade *= smoothstep(uReveal - 0.6, uReveal, depth);

  float grain = 1.0;
  if (uGrain > 0.0) {
    grain += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime * 7.0) * 43758.5453) - 0.5) * uGrain * 4.0;
  }

  if (uLight > 0.5) {
    float hairline = clamp(lines * 0.26 + body * 0.2, 0.0, 1.0);
    float stroke = clamp(strokes * 1.6, 0.0, 1.0);
    float haze = clamp(length(glow) * 0.12, 0.0, 0.25);
    float ink = clamp(hairline + stroke + haze, 0.0, 1.0) * fade * uOpacity * grain;
    vec3 tone = mix(inkOf(uCable, 0.3), inkOf(uPulse, 0.16), clamp(stroke + haze * 2.0, 0.0, 1.0));
    tone = mix(tone, inkOf(uTunnel, 0.3), clamp(body * uBody, 0.0, 1.0) * 0.5);
    outColor = vec4(tone * ink, ink);
    return;
  }

  vec3 light = (uCable * lines * 0.12 + uTunnel * body * 0.35 + glow) * uBrightness * fade * grain;
  vec3 mapped = (1.0 - exp(-light * 1.4)) * uOpacity;
  outColor = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));
}`,f=(n,c,d)=>Math.min(d,Math.max(c,n)),le=(n,c,d)=>{const r=n.createShader(c);return r?(n.shaderSource(r,d),n.compileShader(r),n.getShaderParameter(r,n.COMPILE_STATUS)?r:(n.deleteShader(r),null)):null},qe=n=>{const c=le(n,n.VERTEX_SHADER,Ve),d=le(n,n.FRAGMENT_SHADER,Ge),r=n.createProgram();if(!c||!d||!r)return null;if(n.attachShader(r,c),n.attachShader(r,d),n.bindAttribLocation(r,0,"aPosition"),n.linkProgram(r),n.deleteShader(c),n.deleteShader(d),!n.getProgramParameter(r,n.LINK_STATUS))return n.deleteProgram(r),null;const F={},W=n.getProgramParameter(r,n.ACTIVE_UNIFORMS);for(let E=0;E<W;E++){const P=n.getActiveUniform(r,E);P&&(F[P.name]=n.getUniformLocation(r,P.name))}return{program:r,uniforms:F}},Ye=({cableColor:n="#ffffff",pulseColor:c="#ffffff",tunnelColor:d="#ffffff",tunnelOpacity:r=0,speed:F=.1,flowDirection:W="inward",pulseSpeed:E=2,pulseLength:P=.28,pulseBlend:fe=.6,pulseWidth:ce=1,pulseDensity:de=.5,cableCount:me=56,thickness:he=.35,rimWidth:pe=.15,waviness:ge=.3,sway:ve=.5,bend:xe=.4,size:we=1,centerX:be=0,centerY:Se=0,glow:ye=1,fadeNear:Me=.5,fadeFar:Re=2,brightness:Ae=1,colorVariance:Ce=!0,grain:ke=!1,grainIntensity:Ee=.05,opacity:Pe=1,mouseInteraction:Te=!0,mouseStrength:Fe=.1,clickSurge:Le=!0,intro:Oe=!0,variation:Be=0,lightMode:Ie=!1,dpr:We,className:H="",style:De,..._e})=>{const j=k.useRef(null),X=k.useRef(null),D=k.useRef(null),Y={cableColor:n,pulseColor:c,tunnelColor:d,tunnelOpacity:f(r,0,1),speed:Math.max(0,F),flow:W==="outward"?1:-1,pulseSpeed:Math.max(0,E),pulseLength:f(P,.02,1),pulseBlend:f(fe,0,1),pulseWidth:f(ce,.1,3),pulseDensity:f(de,0,1),cableCount:f(Math.round(me),4,200),thickness:f(he,.05,2),rimWidth:f(pe,0,1),waviness:Math.max(0,ge),sway:Math.max(0,ve),bend:Math.max(0,xe),size:Math.max(.05,we),centerX:be,centerY:Se,glow:Math.max(0,ye),fadeNear:Math.max(.001,Me),fadeFar:Math.max(.01,Re),brightness:Math.max(0,Ae),colorVariance:Ce,grain:ke,grainIntensity:Math.max(0,Ee),opacity:f(Pe,0,1),mouseInteraction:Te,mouseStrength:Math.max(0,Fe),clickSurge:Le,intro:Oe,variation:Be,lightMode:Ie,dpr:We},h=k.useRef(Y);return h.current=Y,k.useEffect(()=>{const x=j.current,S=X.current,e=S?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!x||!S||!e)return;const L=qe(e);if(!L)return;const o=L.uniforms,$=e.createBuffer(),_=e.createVertexArray();e.bindVertexArray(_),e.bindBuffer(e.ARRAY_BUFFER,$),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const y=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),N=new Map,U=(t,a)=>{if(!t)return a;const i=String(t);if(N.has(i))return N.get(i);let u=a;if(y){y.clearRect(0,0,1,1),y.fillStyle="#000000",y.fillStyle=i,y.fillRect(0,0,1,1);const[s,b,v]=y.getImageData(0,0,1,1).data;u=[s/255,b/255,v/255]}return N.set(i,u),u},M=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,m={x:0,y:0,inside:!1},p={x:0,y:0},w={age:10};let K=0,V=0,g=h.current.intro&&!M?0:1,R=0,A=0,O=!0;const G=()=>{const t=I(h.current),a=S.width,i=S.height,u=a/Math.max(1,x.clientWidth),s=Math.min(a,i),b=t.flow,v=3.4,T=w.age*2.6,z=b>0?v-T:-.6+T,ie=w.age<2.4?Math.min(1,w.age/.12)*Math.exp(-w.age*1.1):0,Ne=g*g*(3-2*g);e.viewport(0,0,a,i),e.useProgram(L.program),e.bindVertexArray(_),e.uniform2f(o.uResolution,a,i),e.uniform2f(o.uCenter,t.centerX*s,t.centerY*s),e.uniform1f(o.uScale,s*.5*t.size),e.uniform1f(o.uRatio,u),e.uniform1f(o.uTime,K),e.uniform1f(o.uDrift,V),e.uniform2f(o.uSteer,p.x,p.y),e.uniform1f(o.uBend,t.bend*.45),e.uniform1f(o.uCount,t.cableCount),e.uniform1f(o.uSwing,Math.sin(V*.9)*t.sway*.5/(Math.PI*2)),e.uniform1f(o.uWave,t.waviness*.15),e.uniform1f(o.uWidth,(.25+t.thickness*1.5)*u),e.uniform1f(o.uPulseWidth,.6+t.pulseWidth*.9);const ue=t.pulseLength*1.2;e.uniform1f(o.uHead,ue*(.08+t.pulseBlend*.22)),e.uniform1f(o.uTail,ue*(.5+t.pulseBlend*.7)),e.uniform1f(o.uChance,t.pulseDensity),e.uniform1f(o.uSpacing,.4),e.uniform1f(o.uPulseSpeed,t.pulseSpeed*4),e.uniform1f(o.uFlow,b),e.uniform1f(o.uHalo,1.2+t.rimWidth*8),e.uniform1f(o.uGlow,t.glow),e.uniform1f(o.uBrightness,t.brightness),e.uniform1f(o.uVariance,t.colorVariance?1:0),e.uniform1f(o.uBody,t.tunnelOpacity),e.uniform1f(o.uFadeNear,t.fadeNear),e.uniform1f(o.uFadeFar,t.fadeFar),e.uniform3fv(o.uCable,U(t.cableColor,[1,1,1])),e.uniform3fv(o.uPulse,U(t.pulseColor,[1,1,1])),e.uniform3fv(o.uTunnel,U(t.tunnelColor,[1,1,1])),e.uniform3f(o.uSurge,z,ie,.22),e.uniform1f(o.uReveal,1.7-Ne*3.6),e.uniform1f(o.uGrain,t.grain?t.grainIntensity:0),e.uniform1f(o.uSeed,t.variation),e.uniform1f(o.uLight,t.lightMode?1:0),e.uniform1f(o.uOpacity,t.opacity),e.drawArrays(e.TRIANGLES,0,3)},J=t=>{if(R=0,!O||document.hidden)return;const a=I(h.current),i=A?f((t-A)/1e3,5e-4,.05):1/60;A=t;const u=M?0:1;K+=i*a.speed*u,V+=i*(a.speed+.2)*u,w.age+=i,a.intro&&!M&&g<1?g=Math.min(1,g+i/Ue):(!a.intro||M)&&(g=1);const s=a.mouseInteraction&&m.inside&&!M,b=a.mouseStrength*2.5,v=s?[m.x*b,m.y*b]:[0,0],T=1-Math.exp(-i/.6);p.x+=(v[0]-p.x)*T,p.y+=(v[1]-p.y)*T,G();const z=Math.abs(v[0]-p.x)<5e-4&&Math.abs(v[1]-p.y)<5e-4;u>0||!z||g<1||w.age<2.4?R=requestAnimationFrame(J):A=0},C=()=>{!R&&O&&!document.hidden&&(R=requestAnimationFrame(J))},q=()=>{const t=I(h.current),a=Math.max(1,x.clientWidth),i=Math.max(1,x.clientHeight),u=Math.min(t.dpr||window.devicePixelRatio||1,2);S.width=Math.max(1,Math.round(a*u)),S.height=Math.max(1,Math.round(i*u)),G(),C()},Q=t=>{const a=x.getBoundingClientRect(),i=t.clientX-a.left,u=t.clientY-a.top;m.inside=i>=0&&u>=0&&i<=a.width&&u<=a.height;const s=Math.min(a.width,a.height)*.5;m.x=(i-a.width/2)/Math.max(1,s),m.y=(a.height/2-u)/Math.max(1,s)},Z=t=>{Q(t),C()},ee=t=>{Q(t),!(!m.inside||!h.current.clickSurge||M)&&(w.age=0,C())},B=t=>{t.pointerType!=="mouse"&&(m.inside=!1)},te=()=>{m.inside=!1},oe=()=>{A=0,C()},ne=new ResizeObserver(q);ne.observe(x);const ae=new IntersectionObserver(t=>{O=t.some(a=>a.isIntersecting),O&&(A=0,C())});ae.observe(x),l(window).addEventListener("pointermove",Z,{passive:!0}),l(window).addEventListener("pointerdown",ee,{passive:!0}),l(window).addEventListener("pointerup",B,{passive:!0}),l(window).addEventListener("pointercancel",B,{passive:!0}),l(document.documentElement).addEventListener("pointerleave",te),document.addEventListener("visibilitychange",oe),q();let re=h.current.dpr;return D.current=()=>{const t=I(h.current);if(t.dpr!==re){re=t.dpr,q();return}R||G(),C()},()=>{cancelAnimationFrame(R),D.current=null,ne.disconnect(),ae.disconnect(),l(window).removeEventListener("pointermove",Z),l(window).removeEventListener("pointerdown",ee),l(window).removeEventListener("pointerup",B),l(window).removeEventListener("pointercancel",B),l(document.documentElement).removeEventListener("pointerleave",te),document.removeEventListener("visibilitychange",oe),e.deleteProgram(L.program),e.deleteBuffer($),e.deleteVertexArray(_),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),k.useEffect(()=>{D.current?.()}),se.jsx("div",{ref:j,className:`light-tunnel-container${H?` ${H}`:""}`,style:De,..._e,children:se.jsx("canvas",{ref:X,className:"light-tunnel-canvas","aria-hidden":"true"})})};export{Ye as default};
