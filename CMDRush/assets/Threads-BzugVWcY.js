import{r as g,j as ae}from"./index-uEvbEw5g.js";import{b as F}from"./App-Dofw4Ib9.js";import{b as ie}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Ce=`#version 300 es
precision highp float;
in vec2 aPoint;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFrame;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
uniform float uCount;
uniform float uThickness;
uniform float uSoftness;
uniform float uWaves;
uniform float uSplit;
uniform float uFray;
uniform float uSeed;
uniform vec2 uTurn;
uniform vec4 uPart;
uniform float uTaper;
out float vEdge;
out float vBand;
out float vDraw;
out float vAlpha;
out float vIndex;

float Perlin2D(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));
  vec4 grad_x = hash_x - 0.49999;
  vec4 grad_y = hash_y - 0.49999;
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
  grad_results *= 1.4142135623730950;
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));
  return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

void main() {
  float perc = float(gl_InstanceID) / uCount;
  float x = aPoint.x;
  float pixel = 1.0 / max(uResolution.x, uResolution.y);
  float splitPoint = uSplit + perc * uFray;
  float amplitudeNormal = smoothstep(splitPoint, max(0.7, splitPoint + 0.2), x);
  float finalAmplitude = amplitudeNormal * 0.5 * uAmplitude * (1.0 + (uMouse.y - 0.5) * 0.2);
  float timeScaled = uTime / 10.0 + (uMouse.x - 0.5);
  float blur = smoothstep(splitPoint, splitPoint + 0.05, x) * perc;
  float xnoise = mix(
    Perlin2D(vec2(timeScaled * 2.5 + uSeed, (x * uWaves + perc) * 2.5)),
    Perlin2D(vec2(timeScaled * 3.5 + uSeed, (x * uWaves + timeScaled) * 3.5)) / 1.5,
    x * 0.3
  );
  float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * finalAmplitude;
  vec2 local = vec2((x - 0.5) * uFrame.x, (y - 0.5) * uFrame.y);
  if (uPart.z > 0.0) {
    vec2 delta = local - uPart.xy;
    float reach = uPart.w;
    float pull = exp(-dot(delta, delta) / (reach * reach));
    local.y += delta.y * pull * uPart.z;
  }
  float width = 7.0 * uThickness * pixel * (1.0 - perc);
  float band = (width / 2.0 + 10.0 * uSoftness * pixel * blur) * uFrame.y;
  float draw = max(band, 1.0);
  local.y += aPoint.y * draw;
  vec2 turned = vec2(local.x * uTurn.x - local.y * uTurn.y, local.x * uTurn.y + local.y * uTurn.x);
  gl_Position = vec4(turned / (uResolution * 0.5), 0.0, 1.0);
  vEdge = aPoint.y * draw;
  vBand = band;
  vDraw = draw;
  vAlpha = 1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3)) * uTaper;
  vIndex = perc;
}`,Le=`#version 300 es
precision highp float;
in float vEdge;
in float vBand;
in float vDraw;
in float vAlpha;
in float vIndex;
uniform vec3 uColor;
uniform vec3 uAccent;
out vec4 outColor;
void main() {
  float coverage = (1.0 - smoothstep(0.0, vDraw, abs(vEdge))) * (vBand / vDraw) * vAlpha;
  outColor = vec4(mix(uColor, uAccent, vIndex) * coverage, coverage);
}`,Be=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ie=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uLines;
uniform vec2 uResolution;
uniform float uFade;
uniform float uOpacity;
uniform float uCurve;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / edge, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec4 lines = texture(uLines, vUv);
  float alpha = lines.a;
  vec3 color = alpha > 0.0001 ? lines.rgb / alpha : vec3(0.0);
  float mask = uOpacity;
  if (uFade > 0.0) {
    vec2 px = vUv * uResolution;
    float edge = uFade * min(uResolution.x, uResolution.y) * 0.5;
    mask *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);
    mask *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);
  }
  outColor = vec4(color * pow(alpha, uCurve), alpha) * mask;
}`,se=1920,f=(n,l,m)=>Math.min(m,Math.max(l,n)),ue=(n,l,m)=>{const c=n.createShader(l);return c?(n.shaderSource(c,m),n.compileShader(c),n.getShaderParameter(c,n.COMPILE_STATUS)?c:(n.deleteShader(c),null)):null},ce=(n,l,m)=>{const c=ue(n,n.VERTEX_SHADER,l),p=ue(n,n.FRAGMENT_SHADER,m),d=n.createProgram();return!c||!p||!d?null:(n.attachShader(d,c),n.attachShader(d,p),n.linkProgram(d),n.deleteShader(c),n.deleteShader(p),n.getProgramParameter(d,n.LINK_STATUS)?d:(n.deleteProgram(d),null))},le=(n,l,m)=>{const c={};for(const p of m)c[p]=n.getUniformLocation(l,p);return c},ke=({color:n=[1,1,1],accentColor:l,amplitude:m=1.7,distance:c=.4,enableMouseInteraction:p=!1,lineCount:d=90,thickness:fe=.6,softness:me=1.3,speed:de=.6,waves:pe=1.05,split:he=.04,fray:ve=.5,angle:xe=25,seed:Ee=0,parting:Re=0,taper:Pe=.85,brightness:ge=1.4,fade:ye=0,opacity:Ae=1,paused:Te=!1,...be})=>{const X=g.useRef(null),V=g.useRef(null),w=g.useRef(null),_e=`${Array.isArray(n)?n.join(","):String(n)}|${Array.isArray(l)?l.join(","):String(l??"")}`,k={color:n,accentColor:l,colorKey:_e,amplitude:m,distance:c,enableMouseInteraction:p,lineCount:f(Math.round(d),1,400),thickness:Math.max(0,fe),softness:Math.max(0,me),speed:de,waves:Math.max(0,pe),split:f(he,0,1),fray:f(ve,0,1),angle:xe,seed:Ee,parting:f(Re,0,1),taper:f(Pe,0,1),brightness:f(ge,.25,2),fade:f(ye,0,1),opacity:f(Ae,0,1),paused:Te},S=g.useRef(k);S.current=k,g.useEffect(()=>{const x=X.current,h=V.current,e=h?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!x||!h||!e)return;const y=ce(e,Ce,Le),A=ce(e,Be,Ie);if(!y||!A)return;const i=le(e,y,["uTime","uResolution","uFrame","uAmplitude","uDistance","uMouse","uCount","uThickness","uSoftness","uWaves","uSplit","uFray","uSeed","uTurn","uPart","uTaper","uColor","uAccent"]),T=le(e,A,["uLines","uResolution","uFade","uOpacity","uCurve"]),D=e.createVertexArray(),U=e.createBuffer();e.bindVertexArray(D),e.bindBuffer(e.ARRAY_BUFFER,U);const G=e.getAttribLocation(y,"aPoint");e.enableVertexAttribArray(G),e.vertexAttribPointer(G,2,e.FLOAT,!1,0,0);const C=e.createVertexArray(),W=e.createBuffer();e.bindVertexArray(C),e.bindBuffer(e.ARRAY_BUFFER,W),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const Y=e.getAttribLocation(A,"aPosition");e.enableVertexAttribArray(Y),e.vertexAttribPointer(Y,2,e.FLOAT,!1,0,0),e.bindVertexArray(null);const b=e.createTexture(),L=e.createFramebuffer();e.bindTexture(e.TEXTURE_2D,b),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const B=document.createElement("canvas");B.width=1,B.height=1;const E=B.getContext("2d",{willReadFrequently:!0}),Fe=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,t={time:0,width:1,height:1,segments:0,colorKey:"",color:[1,1,1],accent:[1,1,1],mouse:[.5,.5],targetMouse:[.5,.5],pointer:[0,0],targetPointer:[0,0],presence:0,inside:!1};let R=0,P=0,M=!0,I=!0;const K=r=>{if(Array.isArray(r))return[0,1,2].map(u=>f(Number(r[u]??1),0,1));if(!E)return[1,1,1];E.clearRect(0,0,1,1),E.fillStyle="#ffffff",E.fillStyle=String(r),E.fillRect(0,0,1,1);const[o,a,s]=E.getImageData(0,0,1,1).data;return[o/255,a/255,s/255]},we=r=>{r.colorKey!==t.colorKey&&(t.colorKey=r.colorKey,t.color=K(r.color),t.accent=r.accentColor===void 0||r.accentColor===null?t.color:K(r.accentColor))},Se=r=>{if(r===t.segments)return;t.segments=r;const o=new Float32Array((r+1)*4);for(let a=0;a<=r;a++){const s=a/r;o.set([s,-1,s,1],a*4)}e.bindBuffer(e.ARRAY_BUFFER,U),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW)},j=()=>{const r=Math.max(1,x.clientWidth),o=Math.max(1,x.clientHeight),a=Math.min(window.devicePixelRatio||1,2),s=Math.max(r,o)*a,u=s>se?a*se/s:a;h.width=Math.max(1,Math.round(r*u)),h.height=Math.max(1,Math.round(o*u)),t.width=r,t.height=o,e.bindTexture(e.TEXTURE_2D,b),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,h.width,h.height,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,L),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,b,0),e.bindFramebuffer(e.FRAMEBUFFER,null),Se(f(Math.round(r/3),96,640)),N()},N=()=>{const r=ie(S.current);we(r);const o=h.width,a=h.height,s=r.angle*Math.PI/180,u=Math.cos(s),v=Math.sin(s),O=Math.abs(o*u)+Math.abs(a*v),De=Math.abs(o*v)+Math.abs(a*u),ee=o/t.width,te=r.enableMouseInteraction?t.mouse:[.5,.5],Ue=r.parting*t.presence*2,re=t.pointer[0]*ee,oe=t.pointer[1]*ee,ne=[re*u+oe*v,-re*v+oe*u];e.bindFramebuffer(e.FRAMEBUFFER,L),e.viewport(0,0,o,a),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.useProgram(y),e.uniform1f(i.uTime,t.time),e.uniform2f(i.uResolution,o,a),e.uniform2f(i.uFrame,O,De),e.uniform1f(i.uAmplitude,r.amplitude),e.uniform1f(i.uDistance,r.distance),e.uniform2f(i.uMouse,te[0],te[1]),e.uniform1f(i.uCount,r.lineCount),e.uniform1f(i.uThickness,r.thickness),e.uniform1f(i.uSoftness,r.softness),e.uniform1f(i.uWaves,r.waves),e.uniform1f(i.uSplit,r.split),e.uniform1f(i.uFray,r.fray),e.uniform1f(i.uSeed,r.seed*13.37),e.uniform2f(i.uTurn,u,v),e.uniform4f(i.uPart,ne[0],ne[1],Ue,Math.min(o,a)*.16),e.uniform1f(i.uTaper,r.taper),e.uniform3f(i.uColor,t.color[0],t.color[1],t.color[2]),e.uniform3f(i.uAccent,t.accent[0],t.accent[1],t.accent[2]),e.bindVertexArray(D),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,(t.segments+1)*2,r.lineCount),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,o,a),e.disable(e.BLEND),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(A),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,b),e.uniform1i(T.uLines,0),e.uniform2f(T.uResolution,o,a),e.uniform1f(T.uFade,r.fade),e.uniform1f(T.uOpacity,r.opacity),e.uniform1f(T.uCurve,2/r.brightness),e.bindVertexArray(C),e.drawArrays(e.TRIANGLES,0,3),e.bindVertexArray(null)},H=r=>{if(R=0,!I||!M||document.hidden)return;const o=ie(S.current),a=P?Math.min(.05,(r-P)/1e3):1/60;P=r;const s=!o.paused&&!Fe;s&&(t.time+=a*o.speed);const u=1-Math.exp(-a*3);t.mouse[0]+=(t.targetMouse[0]-t.mouse[0])*u,t.mouse[1]+=(t.targetMouse[1]-t.mouse[1])*u;const v=1-Math.exp(-a*10);t.pointer[0]+=(t.targetPointer[0]-t.pointer[0])*v,t.pointer[1]+=(t.targetPointer[1]-t.pointer[1])*v,t.presence+=((t.inside&&o.parting>0?1:0)-t.presence)*(1-Math.exp(-a*4)),N();const O=Math.abs(t.targetMouse[0]-t.mouse[0])>5e-4||Math.abs(t.targetMouse[1]-t.mouse[1])>5e-4||Math.abs(t.targetPointer[0]-t.pointer[0])>.05||Math.abs(t.targetPointer[1]-t.pointer[1])>.05||Math.abs((t.inside&&o.parting>0?1:0)-t.presence)>.002;s||O?R=requestAnimationFrame(H):P=0},_=()=>{!R&&I&&M&&!document.hidden&&(R=requestAnimationFrame(H))},q=r=>{const o=x.getBoundingClientRect(),a=(r.clientX-o.left)/Math.max(1,o.width),s=(r.clientY-o.top)/Math.max(1,o.height),u=a>=0&&a<=1&&s>=0&&s<=1;u?(t.targetMouse=[a,1-s],t.targetPointer=[r.clientX-o.left-o.width/2,o.height/2-(r.clientY-o.top)],!t.inside&&t.presence<.01&&(t.pointer=[...t.targetPointer])):t.inside&&(t.targetMouse=[.5,.5]),t.inside=u,_()},$=()=>{t.inside=!1,t.targetMouse=[.5,.5],_()},J=()=>{P=0,_()},Q=new ResizeObserver(j);Q.observe(x);const Z=new IntersectionObserver(r=>{M=r.some(o=>o.isIntersecting),M&&(P=0,_())});return Z.observe(x),F(window).addEventListener("pointermove",q,{passive:!0}),F(document.documentElement).addEventListener("pointerleave",$),document.addEventListener("visibilitychange",J),j(),w.current=()=>{R||N(),_()},()=>{I=!1,cancelAnimationFrame(R),w.current=null,Q.disconnect(),Z.disconnect(),F(window).removeEventListener("pointermove",q),F(document.documentElement).removeEventListener("pointerleave",$),document.removeEventListener("visibilitychange",J),e.deleteFramebuffer(L),e.deleteTexture(b),e.deleteBuffer(U),e.deleteBuffer(W),e.deleteVertexArray(D),e.deleteVertexArray(C),e.deleteProgram(y),e.deleteProgram(A)}},[]),g.useEffect(()=>{w.current?.()});const{className:z="",...Me}=be;return ae.jsx("div",{ref:X,className:`threads-container${z?` ${z}`:""}`,...Me,children:ae.jsx("canvas",{ref:V,className:"threads-canvas","aria-hidden":"true"})})};export{ke as default};
