import{r as T,j as he}from"./index-uEvbEw5g.js";import{b as _}from"./App-Dofw4Ib9.js";import{b as $}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const We=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Xe=`#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uTarget;
uniform vec2 uRot;
uniform vec2 uPillarRot;
uniform vec2 uWave;
uniform float uShift;
uniform float uPillarWidth;
uniform float uPillarHeight;
uniform int uDetail;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uGlowAmount;
uniform float uWidthNorm;
out vec4 outColor;

void main() {
  vec2 vUv = gl_FragCoord.xy / uTarget;
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
  uv.x -= uShift;
  uv = vec2(uPillarRot.x * uv.x - uPillarRot.y * uv.y, uPillarRot.y * uv.x + uPillarRot.x * uv.y);

  vec3 ro = vec3(0.0, 0.0, -10.0);
  vec3 rd = normalize(vec3(uv, 1.0));
  vec3 origin = vec3(uRot.x * ro.x - uRot.y * ro.z, ro.y, uRot.y * ro.x + uRot.x * ro.z);
  vec3 dir = vec3(uRot.x * rd.x - uRot.y * rd.z, rd.y, uRot.y * rd.x + uRot.x * rd.z);

  float glow = 0.0;
  float lift = 0.0;
  float t = 0.1;
  for (int i = 0; i < 80; i++) {
    vec3 p = origin + dir * t;
    vec3 q = p;
    q.y = p.y * uPillarHeight + uTime;

    float freq = 1.0;
    float amp = 1.0;
    for (int j = 0; j < 6; j++) {
      if (j >= uDetail) break;
      q.xz = vec2(uWave.y * q.x - uWave.x * q.z, uWave.x * q.x + uWave.y * q.z);
      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;
      freq *= 2.0;
      amp *= 0.5;
    }

    float d = length(cos(q.xz)) - 0.2;
    float bound = length(p.xz) - uPillarWidth;
    float h = max(4.0 - abs(d - bound), 0.0);
    d = max(d, bound) + h * h * 0.015625;
    d = abs(d) * 0.15 + 0.01;

    float weight = 1.0 / d;
    glow += weight;
    lift += clamp((15.0 - p.y) / 30.0, 0.0, 1.0) * weight;

    t += d;
    if (t > 50.0) break;
  }

  vec3 col = tanh((uBottomColor * glow + (uTopColor - uBottomColor) * lift) * uGlowAmount / uWidthNorm);
  float peak = max(col.r, max(col.g, col.b));
  outColor = vec4(col, smoothstep(0.62, 1.0, peak));
}`,Oe=`#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uFieldSize;
uniform vec2 uView;
uniform vec2 uAspect;
uniform vec2 uPillarRot;
uniform float uShift;
uniform float uIntensity;
uniform float uNoiseIntensity;
uniform float uLightMode;
uniform float uNeutral;
uniform float uBloom;
uniform float uFade;
uniform float uReveal;
uniform float uFlare;
uniform vec4 uPulses[3];
out vec4 outColor;

vec3 tap(vec2 uv) {
  return textureLod(uField, uv, 0.0).rgb;
}

vec3 bicubic(vec2 uv) {
  vec2 position = uv * uFieldSize;
  vec2 center = floor(position - 0.5) + 0.5;
  vec2 f = position - center;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 t0 = (center - 1.0) / uFieldSize;
  vec2 t3 = (center + 2.0) / uFieldSize;
  vec2 t12 = (center + w2 / w12) / uFieldSize;
  vec3 result = vec3(0.0);
  result += tap(vec2(t0.x, t0.y)) * w0.x * w0.y;
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;
  return max(result, 0.0);
}

float smootherstep01(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uView;
  vec3 col = bicubic(uv);

  if (uBloom > 0.0) {
    vec4 l3 = textureLod(uField, uv, 3.0);
    vec4 l4 = textureLod(uField, uv, 4.0);
    vec4 l5 = textureLod(uField, uv, 5.0);
    vec4 l6 = textureLod(uField, uv, 6.0);
    float halo = l3.a * 0.3 + l4.a * 0.3 + l5.a * 0.25 + l6.a * 0.15;
    vec3 tint = l4.rgb + l5.rgb;
    tint /= max(max(tint.r, max(tint.g, tint.b)), 0.001);
    vec3 glow = clamp(tint * halo * uBloom * 1.1, 0.0, 1.0);
    col = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - glow);
  }

  vec2 p = (uv * 2.0 - 1.0) * uAspect;
  p.x -= uShift;
  float axis = uPillarRot.y * p.x + uPillarRot.x * p.y;

  float boost = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 pulse = uPulses[i];
    if (pulse.y <= 0.0) continue;
    float offset = (axis - pulse.x) / 0.24;
    boost += exp(-offset * offset) * pulse.y;
  }
  float head = (axis - uReveal + 0.35) / 0.3;
  boost += exp(-head * head) * uFlare;
  float lum = max(col.r, max(col.g, col.b));
  col += mix(col, vec3(lum), 0.45) * boost * 1.8;

  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;
  vec3 result = clamp(col * uIntensity, 0.0, 1.0);

  float mask = smoothstep(uReveal, uReveal - 0.9, axis);
  float edge = uFade * 0.5;
  if (edge > 0.0) {
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);
  }

  if (uLightMode > 0.5) {
    float energy = max(result.r, max(result.g, result.b));
    vec3 hue = result / max(energy, 0.001);
    float coverage = smoothstep(0.025, 0.95, energy);
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.25));
    vec3 tinted = mix(vec3(1.0), hue, coverage * 0.94 * mask);
    vec3 ink = vec3(1.0) - pow(result, vec3(1.6)) * 0.85 * mask;
    result = mix(tinted, ink, uNeutral);
  } else {
    result *= mask;
  }
  outColor = vec4(result, 1.0);
}`,de={low:.35,medium:.5,high:.6},Ge=2.1,ve=1.4,xe=.25,W=(r,y,v)=>Math.min(v,Math.max(y,r)),Ve=r=>1-Math.pow(1-r,3),He=r=>r*r*r*(r*(r*6-15)+10),pe=(r,y,v)=>{const f=r.createShader(y);return f?(r.shaderSource(f,v),r.compileShader(f),r.getShaderParameter(f,r.COMPILE_STATUS)?f:(r.deleteShader(f),null)):null},ge=(r,y)=>{const v=pe(r,r.VERTEX_SHADER,We),f=pe(r,r.FRAGMENT_SHADER,y),c=r.createProgram();if(!v||!f||!c)return null;if(r.attachShader(c,v),r.attachShader(c,f),r.bindAttribLocation(c,0,"aPosition"),r.linkProgram(c),r.deleteShader(v),r.deleteShader(f),!r.getProgramParameter(c,r.LINK_STATUS))return r.deleteProgram(c),null;const k={},X=r.getProgramParameter(c,r.ACTIVE_UNIFORMS);for(let L=0;L<X;L++){const C=r.getActiveUniform(c,L);C&&(k[C.name.replace(/\[0\]$/,"")]=r.getUniformLocation(c,C.name))}return{program:c,uniforms:k}},Qe=({topColor:r="#5227FF",bottomColor:y="#FF9FFC",intensity:v=1,rotationSpeed:f=.3,flow:c=1,interactive:k=!0,clickPulse:X=!0,glowAmount:L=.002,bloom:C=.5,pillarWidth:we=3,pillarHeight:Re=.4,pillarRotation:Ee=25,twist:ye=.4,detail:be=4,noiseIntensity:Te=.5,fade:Me=0,intro:Fe=!0,mixBlendMode:Ae="screen",quality:Pe="high",resolution:Se,lightMode:_e=!1,paused:Le=!1,className:K="",style:Ce})=>{const Q=T.useRef(null),J=T.useRef(null),O=T.useRef(null),I=T.useRef(null),[Ie,Ue]=T.useState(0);return I.current={topColor:String(r),bottomColor:String(y),intensity:Math.max(0,v),rotationSpeed:f,flow:c,interactive:k,clickPulse:X,glowAmount:Math.max(0,L),bloom:Math.max(0,C),pillarWidth:Math.max(.05,we),pillarHeight:Re,pillarRotation:Ee,twist:ye,detail:Math.round(W(be,1,6)),noiseIntensity:Math.max(0,Te),fade:W(Me,0,1),intro:Fe,scale:W(Se??de[Pe]??de.high,xe,2),lightMode:_e,paused:Le},T.useEffect(()=>{const M=Q.current,m=J.current,e=m?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!M||!m||!e)return;const ke=!!e.getExtension("EXT_color_buffer_float"),D=ge(e,Xe),N=ge(e,Oe);if(!D||!N)return;const Z=t=>{t.preventDefault()},ee=()=>Ue(t=>t+1);m.addEventListener("webglcontextlost",Z),m.addEventListener("webglcontextrestored",ee);const te=e.createBuffer(),G=e.createVertexArray();e.bindVertexArray(G),e.bindBuffer(e.ARRAY_BUFFER,te),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let x=null;const V=e.createFramebuffer(),h={width:0,height:0},De=(t,i)=>{if(h.width===t&&h.height===i)return;h.width=t,h.height=i,x&&e.deleteTexture(x),x=e.createTexture(),e.bindTexture(e.TEXTURE_2D,x);const n=Math.floor(Math.log2(Math.max(t,i)))+1;e.texStorage2D(e.TEXTURE_2D,n,ke?e.RGBA16F:e.RGBA8,t,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,V),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,x,0)},F=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),H=new Map,q=t=>{if(H.has(t))return H.get(t);let i=[1,1,1];if(F){F.clearRect(0,0,1,1),F.fillStyle="#ffffff",F.fillStyle=t,F.fillRect(0,0,1,1);const[n,s,g]=F.getImageData(0,0,1,1).data;i=[n/255,s/255,g/255]}return H.set(t,i),i},U=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,a={width:1,height:1,ratio:1},A={x:0,y:0,inside:!1},p=[],j=new Float32Array(12),o={clock:0,intro:I.current.intro&&!U?0:1,touch:0,spin:0,lean:0,shift:0,governor:1,slow:0,quick:0};let P=0,w=0,z=!0;const Ne=(t,i,n)=>{const s=a.width/a.height,g=(t/a.width*2-1)*s-o.shift,d=1-i/a.height*2;return Math.sin(n)*g+Math.cos(n)*d},Y=()=>{const t=$(I.current),i=Math.max(xe,t.scale*o.governor),n=Math.max(1,Math.round(a.width*i)),s=Math.max(1,Math.round(a.height*i));De(n,s);const g=He(o.intro),d=Ve(o.intro),R=(t.pillarRotation+o.lean)*Math.PI/180,B=o.clock*.3+o.spin,E=t.pillarWidth*(.3+.7*g);e.bindVertexArray(G);const l=D.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,V),e.viewport(0,0,h.width,h.height),e.useProgram(D.program),e.uniform1f(l.uTime,o.clock*t.flow),e.uniform2f(l.uResolution,a.width,a.height),e.uniform2f(l.uTarget,h.width,h.height),e.uniform2f(l.uRot,Math.cos(B),Math.sin(B)),e.uniform2f(l.uPillarRot,Math.cos(R),Math.sin(R)),e.uniform2f(l.uWave,Math.sin(t.twist),Math.cos(t.twist)),e.uniform1f(l.uShift,o.shift),e.uniform1f(l.uPillarWidth,E),e.uniform1f(l.uPillarHeight,t.pillarHeight),e.uniform1i(l.uDetail,t.detail),e.uniform3fv(l.uTopColor,q(t.topColor)),e.uniform3fv(l.uBottomColor,q(t.bottomColor)),e.uniform1f(l.uGlowAmount,t.glowAmount),e.uniform1f(l.uWidthNorm,E/3),e.drawArrays(e.TRIANGLES,0,3),e.bindTexture(e.TEXTURE_2D,x),t.bloom>0&&e.generateMipmap(e.TEXTURE_2D),j.fill(0),p.forEach((S,Be)=>{j.set([S.axis+S.age*1.7,Math.exp(-S.age/(ve*.45)),0,0],Be*4)});const u=N.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,m.width,m.height),e.useProgram(N.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,x),e.uniform1i(u.uField,0),e.uniform2f(u.uFieldSize,h.width,h.height),e.uniform2f(u.uView,m.width,m.height),e.uniform2f(u.uAspect,a.width/a.height,1),e.uniform2f(u.uPillarRot,Math.cos(R),Math.sin(R)),e.uniform1f(u.uShift,o.shift),e.uniform1f(u.uIntensity,t.intensity*(.15+.85*d)*(1+.12*o.touch)),e.uniform1f(u.uNoiseIntensity,t.noiseIntensity),e.uniform1f(u.uLightMode,t.lightMode?1:0);const fe=S=>Math.max(...S)-Math.min(...S),ze=Math.max(fe(q(t.topColor)),fe(q(t.bottomColor)));e.uniform1f(u.uNeutral,1-W((ze-.08)/.12,0,1)),e.uniform1f(u.uBloom,t.bloom),e.uniform1f(u.uFade,t.fade);const me=a.width/a.height+1.2;e.uniform1f(u.uReveal,o.intro>=1?1e4:-me+d*(me*2+1.2)),e.uniform1f(u.uFlare,o.intro>=1?0:(1-d)*1.3*Math.min(1,o.intro*8)),e.uniform4fv(u.uPulses,j),e.drawArrays(e.TRIANGLES,0,3)},qe=t=>{t>1/40?(o.slow+=1,o.quick=0):t<1/55&&(o.quick+=1,o.slow=0),o.slow>20?(o.governor=Math.max(.5,o.governor*.85),o.slow=0):o.quick>180&&o.governor<1&&(o.governor=Math.min(1,o.governor*1.1),o.quick=0)},oe=t=>{if(P=0,!z||document.hidden)return;const i=$(I.current),n=w?Math.min(.05,(t-w)/1e3):1/60;w&&qe((t-w)/1e3),w=t;const s=!i.paused&&!U&&i.rotationSpeed!==0;s&&(o.clock+=n*.96*i.rotationSpeed),!i.intro||U?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+n/Ge));const g=i.interactive&&A.inside&&!U,d=g?A.x/a.width-.5:0,R=1-Math.exp(-n*2.4);o.spin+=(d*1.4-o.spin)*R,o.lean+=(d*9-o.lean)*R,o.shift+=(d*.35*(a.width/a.height)-o.shift)*R,o.touch+=((g?1:0)-o.touch)*(1-Math.exp(-n*3));for(let E=p.length-1;E>=0;E--)p[E].age+=n,p[E].age>ve*2.2&&p.splice(E,1);Y();const B=o.intro<1||p.length>0||Math.abs(d*1.4-o.spin)>5e-4||Math.abs((g?1:0)-o.touch)>.002;s||B?P=requestAnimationFrame(oe):w=0},b=()=>{!P&&z&&!document.hidden&&(P=requestAnimationFrame(oe))},re=()=>{const t=Math.max(1,M.clientWidth),i=Math.max(1,M.clientHeight),n=Math.min(window.devicePixelRatio||1,2);a.width=t,a.height=i,a.ratio=n,m.width=Math.max(1,Math.round(t*n)),m.height=Math.max(1,Math.round(i*n)),Y(),b()},ie=t=>{const i=M.getBoundingClientRect(),n=t.clientX-i.left,s=t.clientY-i.top;return{x:n,y:s,inside:n>=0&&s>=0&&n<=i.width&&s<=i.height}},ne=t=>{const i=ie(t);A.x=i.x,A.y=i.y,A.inside=i.inside,b()},ae=t=>{const i=$(I.current);if(!i.clickPulse||U)return;const n=ie(t);if(!n.inside)return;const s=(i.pillarRotation+o.lean)*Math.PI/180;p.push({axis:Ne(n.x,n.y,s),age:0}),p.length>3&&p.shift(),b()},ue=()=>{A.inside=!1,b()},se=()=>{w=0,b()},le=new ResizeObserver(re);le.observe(M);const ce=new IntersectionObserver(t=>{z=t.some(i=>i.isIntersecting),z&&(w=0,b())});return ce.observe(M),_(window).addEventListener("pointermove",ne,{passive:!0}),_(window).addEventListener("pointerdown",ae,{passive:!0}),_(document.documentElement).addEventListener("pointerleave",ue),document.addEventListener("visibilitychange",se),re(),O.current=()=>{P||Y(),b()},()=>{cancelAnimationFrame(P),O.current=null,m.removeEventListener("webglcontextlost",Z),m.removeEventListener("webglcontextrestored",ee),le.disconnect(),ce.disconnect(),_(window).removeEventListener("pointermove",ne),_(window).removeEventListener("pointerdown",ae),_(document.documentElement).removeEventListener("pointerleave",ue),document.removeEventListener("visibilitychange",se),x&&e.deleteTexture(x),e.deleteFramebuffer(V),e.deleteProgram(D.program),e.deleteProgram(N.program),e.deleteBuffer(te),e.deleteVertexArray(G),e.isContextLost()||e.getExtension("WEBGL_lose_context")?.loseContext()}},[Ie]),T.useEffect(()=>{O.current?.()}),he.jsx("div",{ref:Q,className:`light-pillar-container${K?` ${K}`:""}`,style:{mixBlendMode:Ae,...Ce},children:he.jsx("canvas",{ref:J,className:"light-pillar-canvas","aria-hidden":"true"})})};export{Qe as default};
