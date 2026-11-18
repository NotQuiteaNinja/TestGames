import{r as F,j as Ne}from"./index-uEvbEw5g.js";import{b as N}from"./App-Dofw4Ib9.js";import{b as Y}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const ke=4,Be=4,gt=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,pt=`#version 300 es
precision highp float;
precision highp int;

uniform vec2 uResolution;
uniform float uTime;
uniform float uPhase;
uniform float uIntensity;
uniform mat3 uOrient;
uniform int uColorCount;
uniform float uDistort;
uniform vec2 uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int uRayCount;
uniform float uZoom;
uniform float uRayWidth;
uniform float uTwist;
uniform float uFlow;
uniform float uCenterFade;
uniform vec4 uPointer;
uniform vec4 uPulses[4];
uniform vec3 uIntro;
uniform float uEncode;
out vec4 outColor;

float hash21(vec2 p) {
  p = floor(p);
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
  return fract(f);
}

mat2 rot30() {
  return mat2(0.8, -0.5, 0.5, 0.8);
}

float layeredNoise(vec2 fragPx) {
  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
  vec2 q = rot30() * p;
  float n = 0.0;
  n += 0.40 * hash21(q);
  n += 0.25 * hash21(q * 2.0 + 17.0);
  n += 0.20 * hash21(q * 4.0 + 47.0);
  n += 0.10 * hash21(q * 8.0 + 113.0);
  n += 0.05 * hash21(q * 16.0 + 191.0);
  return n;
}

float edgeFade(vec2 frag, vec2 res, vec2 offset) {
  vec2 toC = frag - 0.5 * res - offset;
  float r = length(toC) / (0.5 * min(res.x, res.y) * uCenterFade);
  float x = clamp(r, 0.0, 1.0);
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  float s = q * 0.5;
  s = pow(s, 1.5);
  float tail = 1.0 - pow(1.0 - s, 2.0);
  s = mix(s, tail, 0.2);
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
  return clamp(s + dn, 0.0, 1.0);
}

vec2 rot2(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t) {
  return 0.8 * sin(q.x * 0.55 + t * 0.6) + 0.7 * sin(q.y * 0.50 - t * 0.5) + 0.6 * sin(q.z * 0.60 + t * 0.7);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float t = uPhase;
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
  vec2 centered = 2.0 * (frag - uOffset) - uResolution;
  vec3 dir = normalize(vec3(centered, uResolution.y * max(uZoom, 1e-3)));
  float marchT = 0.0;
  vec3 col = vec3(0.0);
  float n = layeredNoise(frag);
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;
  float edge = 0.5 - 0.35 * (uRayWidth - 1.0);
  mat2 twist = mat2(1.0);
  if (uTwist != 0.0) {
    float a = uTwist * length(centered) / uResolution.y;
    float c = cos(a);
    float s = sin(a);
    twist = mat2(c, s, -s, c);
  }

  for (int i = 0; i < 44; ++i) {
    vec3 P = marchT * dir;
    P.z -= 2.0;
    float rad = length(P);
    vec3 Pl = P * (10.0 / max(rad, 1e-6));
    if (uTwist != 0.0) Pl.xy = twist * Pl.xy;
    Pl = uOrient * Pl;

    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;

    vec3 Pb = Pl;
    if (amp > 0.0) {
      float grow = smoothstep(0.35, 3.0, marchT);
      float a1 = amp * grow * bendAngle(Pl * 0.6, t);
      float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
      Pb.xz = rot2(Pb.xz, a1);
      Pb.xy = rot2(Pb.xy, a2);
    }

    float rayPattern = smoothstep(
      edge,
      edge + 0.2,
      sin(Pb.x + cos(Pb.y) * cos(Pb.z)) * sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
    );

    if (uRayCount > 0) {
      float ang = atan(Pb.y, Pb.x);
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
      comb = pow(comb, 3.0);
      rayPattern *= smoothstep(0.15, 0.95, comb);
    }

    float depth = marchT - uFlow;
    vec3 spectral;
    if (uColorCount > 0) {
      float saw = fract(depth * 0.25);
      float tRay = saw * saw * (3.0 - 2.0 * saw);
      spectral = 2.0 * texture(uGradient, vec2(clamp(tRay, 0.0, 1.0), 0.5)).rgb;
    } else {
      spectral = 1.0 + cos(depth * 3.0 + vec3(0.0, 1.0, 2.0));
    }

    col += (0.05 / (0.4 + stepLen)) * smoothstep(5.0, 0.0, rad) * spectral * rayPattern;
    marchT += stepLen;
  }

  col *= edgeFade(frag, uResolution, uOffset);
  col *= uIntensity;

  float unit = 0.5 * min(uResolution.x, uResolution.y);
  float radius = length(frag - 0.5 * uResolution - uOffset) / unit;
  float lift = 1.0;
  for (int k = 0; k < 4; k++) {
    vec4 pulse = uPulses[k];
    if (pulse.y <= 0.0) continue;
    float d = (radius - pulse.x) / pulse.z;
    lift += pulse.y * exp(-d * d) + pulse.w;
  }
  if (uPointer.z > 0.0) {
    vec2 m = (frag - uPointer.xy) / unit;
    lift += uPointer.z * exp(-dot(m, m) / max(uPointer.w * uPointer.w, 1e-4));
  }
  if (uIntro.z > 0.0) {
    vec2 toC = frag - 0.5 * uResolution - uOffset;
    float ang = atan(toC.y, toC.x);
    float streak = 0.5 + 0.22 * sin(ang * 5.0 + 1.3) + 0.16 * sin(ang * 13.0 + 4.1) + 0.12 * sin(ang * 29.0 + 2.2);
    float front = uIntro.x * (0.7 + 0.3 * streak);
    float d = (radius - front) / 0.2;
    lift += uIntro.y * exp(-d * d);
    lift *= smoothstep(front, front - 0.5, radius);
  }

  outColor = vec4(col * lift * uEncode, 1.0);
}`,Et=`#version 300 es
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
}`,wt=`#version 300 es
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
}`,Tt=`#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform vec2 uSceneSize;
uniform sampler2D uBloom0;
uniform sampler2D uBloom1;
uniform sampler2D uBloom2;
uniform sampler2D uBloom3;
uniform vec2 uView;
uniform float uExact;
uniform float uDecode;
uniform float uBloom;
uniform float uFade;
uniform float uLightMode;
out vec4 outColor;

vec3 tap(vec2 uv) {
  return textureLod(uScene, uv, 0.0).rgb;
}

vec3 bicubic(vec2 uv) {
  vec2 position = uv * uSceneSize;
  vec2 center = floor(position - 0.5) + 0.5;
  vec2 f = position - center;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 t0 = (center - 1.0) / uSceneSize;
  vec2 t3 = (center + 2.0) / uSceneSize;
  vec2 t12 = (center + w2 / w12) / uSceneSize;
  vec3 result = tap(vec2(t0.x, t0.y)) * w0.x * w0.y;
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
  vec3 col = uExact > 0.5 ? texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb : bicubic(uv);
  if (uBloom > 0.0) {
    vec3 halo = texture(uBloom0, uv).rgb * 0.42;
    halo += texture(uBloom1, uv).rgb * 0.3;
    halo += texture(uBloom2, uv).rgb * 0.18;
    halo += texture(uBloom3, uv).rgb * 0.1;
    col += halo * uBloom * (uLightMode > 0.5 ? 0.25 : 1.0);
  }
  col = clamp(col * uDecode, 0.0, 1.0);

  float mask = 1.0;
  float edge = uFade * 0.5;
  if (edge > 0.0) {
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    vec3 hue = col / max(energy, 0.0001);
    float neutral = min(hue.r, min(hue.g, hue.b));
    hue = max(hue - vec3(neutral * 0.68), vec3(0.0));
    hue /= max(max(hue.r, max(hue.g, hue.b)), 0.0001);
    vec3 pigment = mix(hue, hue * hue, 0.24) * 0.64;
    float coverage = smoothstep(0.001, 0.32, energy);
    coverage = pow(coverage, 0.72) * 0.92 * mask;
    outColor = vec4(pigment * coverage, coverage);
  } else {
    col *= mask;
    outColor = vec4(col, max(col.r, max(col.g, col.b)));
  }
}`,Oe={low:.35,medium:.5,high:.7},ze=.2,yt=2.4,Ge=1.5,qe={rotate:0,rotate3d:1,hover:2},M=(r,u,c)=>Math.min(c,Math.max(u,r)),Ye=r=>{if(r==null)return 0;if(typeof r=="number")return r;const u=parseFloat(String(r).trim().replace("px",""));return Number.isNaN(u)?0:u},me=r=>{const u=Math.cos(r),c=Math.sin(r);return[1,0,0,0,u,-c,0,c,u]},he=r=>{const u=Math.cos(r),c=Math.sin(r);return[u,0,c,0,1,0,-c,0,u]},Rt=r=>{const u=Math.cos(r),c=Math.sin(r);return[u,-c,0,c,u,0,0,0,1]},W=(r,u)=>{const c=new Float32Array(9);for(let m=0;m<3;m++)for(let f=0;f<3;f++)c[m*3+f]=r[f]*u[m*3]+r[3+f]*u[m*3+1]+r[6+f]*u[m*3+2];return c},We=(r,u,c)=>{const m=r.createShader(u);return m?(r.shaderSource(m,c),r.compileShader(m),r.getShaderParameter(m,r.COMPILE_STATUS)?m:(r.deleteShader(m),null)):null},$=(r,u)=>{const c=We(r,r.VERTEX_SHADER,gt),m=We(r,r.FRAGMENT_SHADER,u),f=r.createProgram();if(!c||!m||!f)return null;if(r.attachShader(f,c),r.attachShader(f,m),r.bindAttribLocation(f,0,"aPosition"),r.linkProgram(f),r.deleteShader(c),r.deleteShader(m),!r.getProgramParameter(f,r.LINK_STATUS))return r.deleteProgram(f),null;const V={},K=r.getProgramParameter(f,r.ACTIVE_UNIFORMS);for(let k=0;k<K;k++){const B=r.getActiveUniform(f,k);B&&(V[B.name.replace(/\[0\]$/,"")]=r.getUniformLocation(f,B.name))}return{program:f,uniforms:V}},At=({colors:r,intensity:u=2,speed:c=.5,animationType:m="rotate3d",distort:f=0,rayCount:V=0,rayWidth:K=1,zoom:k=1,twist:B=0,flow:Ve=0,centerFade:He=1,grain:je=.8,glow:Ze=0,offset:de,mouseInteraction:$e=!0,mouseStrength:Ke=.5,hoverDampness:Qe=.25,clickBurst:Je=!0,intro:et=!0,fade:tt=0,quality:ot="high",resolution:rt,lightMode:nt=!1,mixBlendMode:Q,paused:it=!1,dpr:at,className:ve="",style:ut})=>{const xe=F.useRef(null),ge=F.useRef(null),J=F.useRef(null),P=F.useRef(null),[st,ct]=F.useState(0);return P.current={colors:Array.isArray(r)?r.slice(0,64).map(String):[],intensity:Math.max(0,u),speed:c,animation:qe[m]??qe.rotate3d,distort:Math.max(0,f),rayCount:Math.max(0,Math.floor(V??0)),rayWidth:M(K,.2,2.5),zoom:Math.max(.05,k),twist:B,flow:Ve,centerFade:M(He,.5,3),grain:M(je,.3,1),glow:Math.max(0,Ze),offsetX:Ye(de?.x),offsetY:Ye(de?.y),mouseInteraction:$e,mouseStrength:Math.max(0,Ke),hoverDampness:M(Qe,0,1),clickBurst:Je,intro:et,fade:M(tt,0,1),scale:M(rt??Oe[ot]??Oe.high,ze,1),lightMode:nt,paused:it,dpr:at},F.useEffect(()=>{const p=xe.current,v=ge.current,e=v?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!p||!v||!e)return;const pe=!!e.getExtension("EXT_color_buffer_float"),ee=$(e,pt),te=$(e,Et),H=$(e,wt),oe=$(e,Tt);if(!ee||!te||!H||!oe)return;const Ee=t=>{t.preventDefault()},we=()=>ct(t=>t+1);v.addEventListener("webglcontextlost",Ee),v.addEventListener("webglcontextrestored",we);const Te=e.createBuffer(),re=e.createVertexArray();e.bindVertexArray(re),e.bindBuffer(e.ARRAY_BUFFER,Te),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const ft=pe?e.RGBA16F:e.RGBA8,ne=pe?1:.25,ie=()=>({texture:null,framebuffer:e.createFramebuffer(),width:0,height:0}),O=ie(),j=Array.from({length:ke},()=>[ie(),ie()]),ae=(t,n,i)=>{t.texture&&t.width===n&&t.height===i||(t.texture&&e.deleteTexture(t.texture),t.texture=e.createTexture(),t.width=n,t.height=i,e.bindTexture(e.TEXTURE_2D,t.texture),e.texStorage2D(e.TEXTURE_2D,1,ft,n,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0))},z=(t,n)=>(e.bindFramebuffer(e.FRAMEBUFFER,t?t.framebuffer:null),e.viewport(0,0,t?t.width:v.width,t?t.height:v.height),e.useProgram(n.program),n.uniforms),A=(t,n)=>{e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,n)},ue=e.createTexture();let ye=null;const D=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),lt=t=>{if(!D)return[255,255,255];D.clearRect(0,0,1,1),D.fillStyle="#ffffff",D.fillStyle=t,D.fillRect(0,0,1,1);const[n,i,h]=D.getImageData(0,0,1,1).data;return[n,i,h]},mt=t=>{const n=t.join("|");if(n===ye)return;ye=n;const i=Math.max(1,t.length),h=new Uint8Array(i*4).fill(255);t.forEach((y,R)=>h.set(lt(y),R*4)),e.bindTexture(e.TEXTURE_2D,ue),e.pixelStorei(e.UNPACK_ALIGNMENT,1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,i,1,0,e.RGBA,e.UNSIGNED_BYTE,h),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)},G=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,d={x:0,y:0,inside:!1},o={time:0,phase:0,flow:0,kick:0,intro:P.current.intro&&!G?0:1,hoverX:.5,hoverY:.5,smoothX:0,smoothY:0,touch:0,governor:1,slow:0,quick:0},T=[],se=new Float32Array(Be*4);let I=0,S=0,Z=!0;const ce=()=>{const t=Y(P.current),n=v.width,i=v.height,h=Math.max(1,p.clientWidth),y=Math.max(1,p.clientHeight),R=Math.max(ze,t.scale*o.governor),E=Math.max(1,Math.round(n*R)),x=Math.max(1,Math.round(i*R)),le=E===n&&x===i;e.bindVertexArray(re),ae(O,E,x),j.forEach((a,s)=>{const w=Math.max(1,Math.round(h/2**(s+1))),L=Math.max(1,Math.round(y/2**(s+1)));ae(a[0],w,L),ae(a[1],w,L)}),mt(t.colors);const g=E/h,X=t.mouseInteraction?o.touch:0,Fe=h>0?o.smoothX/h*2-1:0,De=y>0?o.smoothY/y*2-1:0,Ie=.06*t.mouseStrength*X*Math.min(E,x)*.5,Xe=t.offsetX*g+Fe*Ie,Ue=t.offsetY*g-De*Ie,q=o.phase;let U;if(t.animation===0){const a=q*.2,s=Math.cos(a);U=[s,0,Math.cos(a+11),0,1,0,Math.cos(a+33),0,s]}else if(t.animation===1)U=W(W(Rt(q*.17),he(q*.21)),me(q*.31));else{const a=o.hoverX*2-1,s=o.hoverY*2-1;U=W(he(a*.6),me(s*.6))}if(t.animation!==2&&X>0){const a=.3*t.mouseStrength*X;U=W(U,W(he(Fe*a),me(De*a)))}se.fill(0),T.forEach((a,s)=>{const w=a.age/Ge;se.set([a.age*1.7,1.6*Math.pow(1-w,1.6),.2+a.age*.16,.35*Math.exp(-a.age*7)],s*4)});const dt=.5*Math.min(E,x),vt=Math.hypot(E*.5+Math.abs(Xe),x*.5+Math.abs(Ue))/Math.max(dt,1),xt=1-Math.pow(1-o.intro,3),l=z(O,ee);if(A(0,ue),e.uniform1i(l.uGradient,0),e.uniform2f(l.uResolution,E,x),e.uniform1f(l.uTime,o.time),e.uniform1f(l.uPhase,q),e.uniform1f(l.uIntensity,t.intensity),e.uniformMatrix3fv(l.uOrient,!1,U),e.uniform1i(l.uColorCount,t.colors.length),e.uniform1f(l.uDistort,t.distort),e.uniform2f(l.uOffset,Xe,Ue),e.uniform1f(l.uNoiseAmount,t.grain),e.uniform1i(l.uRayCount,t.rayCount),e.uniform1f(l.uZoom,t.zoom),e.uniform1f(l.uRayWidth,t.rayWidth),e.uniform1f(l.uTwist,t.twist),e.uniform1f(l.uFlow,o.flow),e.uniform1f(l.uCenterFade,t.centerFade*Math.max(1,t.zoom)),e.uniform4f(l.uPointer,o.smoothX*g,(y-o.smoothY)*g,t.mouseInteraction?.7*t.mouseStrength*X:0,.45),e.uniform4fv(l.uPulses,se),e.uniform3f(l.uIntro,xt*(vt+.6)/.7,1.6*(1-o.intro),o.intro<1?1:0),e.uniform1f(l.uEncode,ne),e.drawArrays(e.TRIANGLES,0,3),t.glow>0){let a=O;j.forEach(([s,w])=>{const L=z(s,te);A(0,a.texture),e.uniform1i(L.uSource,0),e.uniform2f(L.uTarget,s.width,s.height),e.uniform2f(L.uTexel,1/a.width,1/a.height),e.uniform1f(L.uLimit,3*ne),e.drawArrays(e.TRIANGLES,0,3);let C=z(w,H);A(0,s.texture),e.uniform1i(C.uSource,0),e.uniform2f(C.uTarget,w.width,w.height),e.uniform2f(C.uStep,1/s.width,0),e.drawArrays(e.TRIANGLES,0,3),C=z(s,H),A(0,w.texture),e.uniform1i(C.uSource,0),e.uniform2f(C.uTarget,s.width,s.height),e.uniform2f(C.uStep,0,1/w.height),e.drawArrays(e.TRIANGLES,0,3),a=s})}const b=z(null,oe);A(0,O.texture),e.uniform1i(b.uScene,0),j.forEach(([a],s)=>{A(s+1,a.texture),e.uniform1i(b[`uBloom${s}`],s+1)}),e.uniform2f(b.uSceneSize,E,x),e.uniform2f(b.uView,n,i),e.uniform1f(b.uExact,le?1:0),e.uniform1f(b.uDecode,1/ne),e.uniform1f(b.uBloom,t.glow),e.uniform1f(b.uFade,t.fade),e.uniform1f(b.uLightMode,t.lightMode?1:0),e.drawArrays(e.TRIANGLES,0,3);for(let a=ke;a>=0;a--)A(a,null)},ht=t=>{t>1/40?(o.slow+=1,o.quick=0):t<1/55&&(o.quick+=1,o.slow=0),o.slow>20?(o.governor=Math.max(.5,o.governor*.85),o.slow=0):o.quick>180&&o.governor<1&&(o.governor=Math.min(1,o.governor*1.1),o.quick=0)},Re=t=>{if(I=0,!Z||document.hidden)return;const n=Y(P.current),i=S?Math.min(.05,(t-S)/1e3):1/60;S&&ht((t-S)/1e3),S=t,!n.intro||G?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+i/yt));const h=3*Math.pow(1-o.intro,2),y=!n.paused&&!G;y&&(o.time+=i,o.phase+=i*n.speed*(1+h)+o.kick*i,o.flow+=i*n.flow*1.2),o.kick*=Math.exp(-i*3.5),o.kick<.001&&(o.kick=0);const R=n.mouseInteraction&&d.inside&&!G,E=.02+n.hoverDampness*.5,x=1-Math.exp(-i/E);if(R&&o.touch<.01&&(o.smoothX=d.x,o.smoothY=d.y),o.smoothX+=(d.x-o.smoothX)*x,o.smoothY+=(d.y-o.smoothY)*x,o.touch+=((R?1:0)-o.touch)*(1-Math.exp(-i*(R?5:2.5))),n.animation===2&&d.inside){const g=Math.max(1,p.clientWidth),X=Math.max(1,p.clientHeight);o.hoverX+=(M(d.x/g,0,1)-o.hoverX)*x,o.hoverY+=(M(d.y/X,0,1)-o.hoverY)*x}for(let g=T.length-1;g>=0;g--)T[g].age+=i,T[g].age>Ge&&T.splice(g,1);ce();const le=o.intro<1||T.length>0||o.kick>0||Math.abs((R?1:0)-o.touch)>.002||Math.abs(d.x-o.smoothX)+Math.abs(d.y-o.smoothY)>.2;y&&(n.speed!==0||n.grain>0||n.flow!==0)||le?I=requestAnimationFrame(Re):S=0},_=()=>{!I&&Z&&!document.hidden&&(I=requestAnimationFrame(Re))},fe=()=>{const t=Y(P.current),n=Math.max(1,p.clientWidth),i=Math.max(1,p.clientHeight),h=Math.min(t.dpr||window.devicePixelRatio||1,2);v.width=Math.max(1,Math.round(n*h)),v.height=Math.max(1,Math.round(i*h)),ce(),_()},be=t=>{const n=p.getBoundingClientRect(),i=t.clientX-n.left,h=t.clientY-n.top;return{x:i,y:h,inside:i>=0&&h>=0&&i<=n.width&&h<=n.height}},Pe=t=>{const n=be(t);d.x=n.x,d.y=n.y,d.inside=n.inside,_()},Se=t=>{const n=be(t);if(!n.inside)return;d.x=n.x,d.y=n.y,d.inside=!0;const i=Y(P.current);i.mouseInteraction&&i.clickBurst&&!G&&(T.length>=Be&&T.shift(),T.push({age:0}),o.kick=Math.min(5,o.kick+2.4)),_()},Me=()=>{d.inside=!1,_()},Ae=()=>{S=0,_()},_e=new ResizeObserver(fe);_e.observe(p);const Le=new IntersectionObserver(t=>{Z=t.some(n=>n.isIntersecting),Z&&(S=0,_())});Le.observe(p),N(window).addEventListener("pointermove",Pe,{passive:!0}),N(window).addEventListener("pointerdown",Se,{passive:!0}),N(document.documentElement).addEventListener("pointerleave",Me),document.addEventListener("visibilitychange",Ae),fe();let Ce=P.current.dpr;return J.current=()=>{const t=Y(P.current);if(t.dpr!==Ce){Ce=t.dpr,fe();return}I||ce(),_()},()=>{cancelAnimationFrame(I),J.current=null,v.removeEventListener("webglcontextlost",Ee),v.removeEventListener("webglcontextrestored",we),_e.disconnect(),Le.disconnect(),N(window).removeEventListener("pointermove",Pe),N(window).removeEventListener("pointerdown",Se),N(document.documentElement).removeEventListener("pointerleave",Me),document.removeEventListener("visibilitychange",Ae),[O,...j.flat()].forEach(t=>{t.texture&&e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer)}),e.deleteTexture(ue),[ee,te,H,oe].forEach(t=>e.deleteProgram(t.program)),e.deleteBuffer(Te),e.deleteVertexArray(re),e.isContextLost()||e.getExtension("WEBGL_lose_context")?.loseContext()}},[st]),F.useEffect(()=>{J.current?.()}),Ne.jsx("div",{ref:xe,className:`prismatic-burst-container${ve?` ${ve}`:""}`,style:ut,children:Ne.jsx("canvas",{ref:ge,className:"prismatic-burst-canvas",style:Q&&Q!=="none"?{mixBlendMode:Q}:void 0,"aria-hidden":"true"})})};export{At as default};
