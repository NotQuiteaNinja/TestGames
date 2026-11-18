import{r as L,j as Le}from"./index-uEvbEw5g.js";import{b}from"./App-Dofw4Ib9.js";import{b as ce}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const qe=24e5,J=4,Pe=8,De=90,Ke=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,Je=`#version 300 es
precision highp float;
uniform sampler2D uPrev;
uniform vec2 uSize;
uniform vec2 uCss;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform vec2 uPush;
uniform float uRadius;
uniform float uDecay;
out vec4 fragColor;

void main() {
  vec2 cell = gl_FragCoord.xy / uSize;
  vec2 p = vec2(cell.x, 1.0 - cell.y) * uCss;
  vec2 seg = uTo - uFrom;
  float len2 = max(dot(seg, seg), 1e-6);
  float h = clamp(dot(p - uFrom, seg) / len2, 0.0, 1.0);
  vec2 gap = p - uFrom - seg * h;
  vec2 delta = uPush * exp(-dot(gap, gap) / (uRadius * uRadius));
  vec2 src = p - delta;
  vec2 prev = texture(uPrev, vec2(src.x / uCss.x, 1.0 - src.y / uCss.y)).xy;
  fragColor = vec4((prev + delta) * uDecay, 0.0, 1.0);
}`,Qe=`#version 300 es
precision highp float;
uniform vec2 uCss;
uniform vec2 uCanvas;
uniform float uBlock;
uniform float uFlow;
uniform float uSpin;
uniform vec2 uOffset;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uContrast;
uniform float uLighting;
uniform float uSwirl;
uniform float uScale;
uniform int uDetail;
uniform sampler2D uField;
uniform float uFieldOn;
uniform vec4 uTwirls[${J}];
uniform float uReveal;
uniform float uLight;
uniform float uOpacity;
out vec4 fragColor;

vec3 paint(vec2 screenSize, vec2 coords) {
  vec2 uv = (coords - 0.5 * screenSize) / length(screenSize) - uOffset;
  float radius = length(uv);
  float speed = uSpin + 302.2;
  float angle = atan(uv.y, uv.x) + speed - 20.0 * (uSwirl * radius + (1.0 - uSwirl));
  vec2 mid = (screenSize / length(screenSize)) / 2.0;
  uv = vec2(radius * cos(angle) + mid.x, radius * sin(angle) + mid.y) - mid;

  uv *= 30.0 / uScale;
  speed = uFlow;
  vec2 uv2 = vec2(uv.x + uv.y);
  for (int i = 0; i < 8; i++) {
    if (i >= uDetail) break;
    uv2 += sin(max(uv.x, uv.y)) + uv;
    uv += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121), sin(uv2.x - 0.113 * speed));
    uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
  }

  float contrastMod = 0.25 * uContrast + 0.5 * uSwirl + 1.2;
  float amount = min(2.0, max(0.0, length(uv) * 0.035 * contrastMod));
  float c1 = max(0.0, 1.0 - contrastMod * abs(1.0 - amount));
  float c2 = max(0.0, 1.0 - contrastMod * abs(amount));
  float c3 = 1.0 - min(1.0, c1 + c2);
  float light = (uLighting - 0.2) * max(c1 * 5.0 - 4.0, 0.0) + uLighting * max(c2 * 5.0 - 4.0, 0.0);
  vec3 gap = uLight > 0.5 ? mix(uColor3, vec3(1.0), 0.9) : uColor3;
  float base = 0.3 / uContrast;
  vec3 color = base * uColor1 + (1.0 - base) * (uColor1 * c1 + uColor2 * c2 + gap * c3) + light;
  return mix(gap, color, uReveal);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy) + 0.5;
  vec2 p = vec2(cell.x, uCanvas.y - cell.y) * uBlock;
  if (uFieldOn > 0.5) {
    p -= texture(uField, vec2(p.x / uCss.x, 1.0 - p.y / uCss.y)).xy;
  }
  for (int i = 0; i < ${J}; i++) {
    vec4 twirl = uTwirls[i];
    if (twirl.w <= 0.0) continue;
    vec2 rel = p - twirl.xy;
    float turn = twirl.z * exp(-dot(rel, rel) / (twirl.w * twirl.w));
    float c = cos(turn);
    float s = sin(turn);
    p = twirl.xy + vec2(c * rel.x - s * rel.y, s * rel.x + c * rel.y);
  }
  vec3 color = paint(uCss, vec2(p.x, uCss.y - p.y));
  float grain = (fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  color = clamp(color + grain, 0.0, 1.0);
  fragColor = vec4(color * uOpacity, uOpacity);
}`,Ze=`#version 300 es
precision highp float;
uniform sampler2D uPaint;
uniform vec2 uCanvas;
uniform vec2 uSource;
uniform float uDevice;
uniform float uCrt;
out vec4 fragColor;

float smoother(float edge0, float edge1, float x) {
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 device = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y);
  vec2 cell = floor(device / uDevice);
  vec4 texel = texture(uPaint, vec2((cell.x + 0.5) / uSource.x, 1.0 - (cell.y + 0.5) / uSource.y));
  vec3 color = texel.rgb;
  float glow = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float period = max(uDevice, 3.0);
  float row = fract(device.y / period);
  float line = smoother(0.5, 0.92, row) * (1.0 - smoother(0.92, 1.0, row));
  color *= 1.0 - uCrt * 0.34 * line * (1.0 - 0.7 * glow);
  vec2 screen = gl_FragCoord.xy / uCanvas;
  float edge = smoother(0.0, 0.18, screen.x) * smoother(0.0, 0.18, 1.0 - screen.x);
  edge *= smoother(0.0, 0.24, screen.y) * smoother(0.0, 0.24, 1.0 - screen.y);
  color *= mix(1.0, 0.78 + 0.22 * edge, uCrt);
  color *= 1.0 + uCrt * 0.1;
  fragColor = vec4(min(color, vec3(texel.a)), texel.a);
}`,g=(r,v,f)=>Math.min(f,Math.max(v,r)),ue=r=>{const v=String(r||"").trim(),f=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);if(f){const m=f[1].length===3?f[1].replace(/./g,F=>F+F):f[1];return[0,2,4].map(F=>parseInt(m.slice(F,F+2),16)/255)}const u=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(v);return u?[u[1],u[2],u[3]].map(m=>g(parseFloat(m)/255,0,1)):null},Ue=(r,v,f)=>{const u=r.createShader(v);return u?(r.shaderSource(u,f),r.compileShader(u),r.getShaderParameter(u,r.COMPILE_STATUS)?u:(console.error(r.getShaderInfoLog(u)),r.deleteShader(u),null)):null},le=(r,v)=>{const f=Ue(r,r.VERTEX_SHADER,Ke),u=Ue(r,r.FRAGMENT_SHADER,v),m=f&&u?r.createProgram():null;if(!f||!u||!m)return f&&r.deleteShader(f),u&&r.deleteShader(u),null;if(r.attachShader(m,f),r.attachShader(m,u),r.linkProgram(m),r.deleteShader(f),r.deleteShader(u),!r.getProgramParameter(m,r.LINK_STATUS))return console.error(r.getProgramInfoLog(m)),r.deleteProgram(m),null;const F={},Q=r.getProgramParameter(m,r.ACTIVE_UNIFORMS);for(let X=0;X<Q;X++){const I=r.getActiveUniform(m,X);I&&(F[I.name.replace(/\[0\]$/,"")]=r.getUniformLocation(m,I.name))}return{program:m,uniforms:F}},K=r=>{const v=g(r,0,1);return v*v*v*(v*(v*6-15)+10)},it=({color1:r="#DE443B",color2:v="#006BB4",color3:f="#162325",contrast:u=3.5,lighting:m=.4,swirl:F=.25,speed:Q=1,rotationSpeed:X=0,scale:I=1,detail:Xe=5,offset:Z=[0,0],pixelSize:Ie=1.5,crt:Oe=0,mouseInteraction:Be=!0,mouseStrength:Ne=1,clickSwirl:ze=!0,intro:Ge=!0,lightMode:ke=!1,opacity:We=1,maxDevicePixelRatio:He=2,className:fe="",style:Ye})=>{const me=L.useRef(null),de=L.useRef(null),ee=L.useRef(null),[ve,Ve]=L.useState(0),he={color1:ue(r)||[.871,.267,.231],color2:ue(v)||[0,.42,.706],color3:ue(f)||[.086,.137,.145],contrast:g(u,.5,10),lighting:g(m,0,1.5),swirl:g(F,0,1),speed:Math.max(0,Q),rotation:g(X,-10,10),scale:g(I,.2,5),detail:g(Math.round(Xe),1,8),offset:Array.isArray(Z)?[Number(Z[0])||0,Number(Z[1])||0]:[0,0],pixelSize:g(Ie,0,24),crt:g(Oe,0,1),mouse:Be,strength:g(Ne,0,3),clickSwirl:ze,intro:Ge,light:ke,opacity:g(We,0,1),maxRatio:g(He,.5,3)},O=L.useRef(he);return O.current=he,L.useEffect(()=>{ee.current?.()}),L.useEffect(()=>{const B=me.current,d=de.current;if(!B||!d)return;const e=d.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"}),z=e?le(e,Qe):null,G=e?le(e,Ze):null;if(!e||!z||!G)return;const S=!!(e.getExtension("EXT_color_buffer_float")||e.getExtension("EXT_color_buffer_half_float"))?le(e,Je):null,k=window.matchMedia("(prefers-reduced-motion: reduce)").matches,ge=e.createVertexArray(),c={cssWidth:1,cssHeight:1,block:1,device:1,width:1,height:1,crt:!1},y={texture:e.createTexture(),framebuffer:e.createFramebuffer(),width:0,height:0},i={width:0,height:0,targets:[],energy:0},a={x:0,y:0,lastX:0,lastY:0,vx:0,inside:!1,ready:!1},W={value:0},_=[],P=new Float32Array(J*4);let Ee=14,xe=0,D=O.current.intro&&!k&&ve===0?0:1,A=0,H=0,te=!0,re=document.visibilityState!=="hidden",oe=!1;const pe=(o,t)=>{const l=e.createTexture();e.bindTexture(e.TEXTURE_2D,l),e.texImage2D(e.TEXTURE_2D,0,e.RG16F,o,t,0,e.RG,e.HALF_FLOAT,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const R=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,R),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,l,0),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,null),{texture:l,framebuffer:R}},Te=()=>{i.targets.forEach(o=>{e.deleteTexture(o.texture),e.deleteFramebuffer(o.framebuffer)}),i.targets=[],i.width=0,i.height=0,i.energy=0};let ne=!1;const $e=()=>{const o=ce(O.current),t=B.getBoundingClientRect(),l=Math.max(1,t.width),R=Math.max(1,t.height),p=Math.min(window.devicePixelRatio||1,o.maxRatio),U=Math.ceil(Math.sqrt(l*R*p*p/qe)-.05),w=Math.max(o.pixelSize>0?Math.round(o.pixelSize*p):1,U,1),x=Math.max(1,Math.ceil(l*p/w)),n=Math.max(1,Math.ceil(R*p/w)),h=o.crt>0,se=h?x*w:x,s=h?n*w:n;if((d.width!==se||d.height!==s)&&(d.width=se,d.height=s),d.style.width=`${x*w/p}px`,d.style.height=`${n*w/p}px`,d.style.imageRendering=!h&&o.pixelSize>0&&w>=2?"pixelated":"auto",h&&(y.width!==x||y.height!==n)&&(e.bindTexture(e.TEXTURE_2D,y.texture),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,x,n,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,y.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,y.texture,0),e.bindFramebuffer(e.FRAMEBUFFER,null),y.width=x,y.height=n),c.cssWidth=l,c.cssHeight=R,c.block=w/p,c.device=w,c.width=x,c.height=n,c.crt=h,!S)return;const E=g(Math.ceil(l/Pe),8,320),T=g(Math.ceil(R/Pe),8,320);E===i.width&&T===i.height||(Te(),i.width=E,i.height=T,i.targets=[pe(E,T),pe(E,T)])},ie=()=>{ne=!0,C()},je=(o,t,l,R,p,U,w)=>{if(!S)return;const[x,n]=i.targets;e.bindFramebuffer(e.FRAMEBUFFER,n.framebuffer),e.viewport(0,0,i.width,i.height),e.useProgram(S.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,x.texture);const h=S.uniforms;e.uniform1i(h.uPrev,0),e.uniform2f(h.uSize,i.width,i.height),e.uniform2f(h.uCss,c.cssWidth,c.cssHeight),e.uniform2f(h.uFrom,o,t),e.uniform2f(h.uTo,l,R),e.uniform2f(h.uPush,p,U),e.uniform1f(h.uRadius,De),e.uniform1f(h.uDecay,w),e.drawArrays(e.TRIANGLES,0,3),i.targets=[n,x]},Re=o=>{if(A=0,ne&&(ne=!1,$e()),oe)return;const t=ce(O.current),l=g((o-H)/1e3||0,0,.05);H=Math.max(H,o);const R=k?.2:1;Ee+=l*t.speed*7*R,xe+=l*t.rotation*.2*R,D<1&&(D=Math.min(1,D+l/2.2));const p=t.mouse&&a.inside,U=p?(a.x/c.cssWidth-.5)*.35*t.strength:0;if(W.value+=(U-W.value)*(1-Math.exp(-l/.8)),e.bindVertexArray(ge),S&&i.targets.length){const s=a.x-a.lastX,E=a.y-a.lastY,T=p&&a.ready&&(s!==0||E!==0),V=Math.exp(-l/1.6);if(T||i.energy>.05){const N=.85*t.strength*(k?.4:1),Me=T?Math.hypot(s,E)*N:0,$=Math.max(1,Math.ceil(Me/(De*.3)));for(let M=0;M<$;M++){const j=M/$,q=(M+1)/$;je(a.lastX+s*j,a.lastY+E*j,a.lastX+s*q,a.lastY+E*q,T?s*(q-j)*N:0,T?E*(q-j)*N:0,M===$-1?V:1)}i.energy=i.energy*V+Me,i.energy<=.05&&i.targets.forEach(M=>{e.bindFramebuffer(e.FRAMEBUFFER,M.framebuffer),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT)})}}a.lastX=a.x,a.lastY=a.y;for(let s=_.length-1;s>=0;s--)_[s].age+=l,_[s].age>=3.2&&_.splice(s,1);P.fill(0),_.forEach((s,E)=>{const T=s.age,V=K(T/.25),N=1-K((T-.25)/2.95);P[E*4]=s.x,P[E*4+1]=s.y,P[E*4+2]=s.direction*1.9*V*N,P[E*4+3]=150*(1+.6*K(T/3.2))});const x=1-(1-Math.pow(1-D,3));e.bindFramebuffer(e.FRAMEBUFFER,c.crt?y.framebuffer:null),e.viewport(0,0,c.width,c.height),e.useProgram(z.program);const n=z.uniforms;if(e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,i.targets.length?i.targets[0].texture:null),e.uniform1i(n.uField,0),e.uniform1f(n.uFieldOn,i.targets.length&&i.energy>.05?1:0),e.uniform2f(n.uCss,c.cssWidth,c.cssHeight),e.uniform2f(n.uCanvas,c.width,c.height),e.uniform1f(n.uBlock,c.block),e.uniform1f(n.uFlow,Ee),e.uniform1f(n.uSpin,-.4+xe+W.value+2.6*x*x),e.uniform2f(n.uOffset,t.offset[0],t.offset[1]),e.uniform3f(n.uColor1,t.color1[0],t.color1[1],t.color1[2]),e.uniform3f(n.uColor2,t.color2[0],t.color2[1],t.color2[2]),e.uniform3f(n.uColor3,t.color3[0],t.color3[1],t.color3[2]),e.uniform1f(n.uContrast,t.contrast),e.uniform1f(n.uLighting,t.lighting),e.uniform1f(n.uSwirl,Math.min(1,t.swirl+.55*x)),e.uniform1f(n.uScale,t.scale),e.uniform1i(n.uDetail,t.detail),e.uniform4fv(n.uTwirls,P),e.uniform1f(n.uReveal,K(D/.45)),e.uniform1f(n.uLight,t.light?1:0),e.uniform1f(n.uOpacity,t.opacity),e.drawArrays(e.TRIANGLES,0,3),c.crt){e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,d.width,d.height),e.useProgram(G.program);const s=G.uniforms;e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,y.texture),e.uniform1i(s.uPaint,0),e.uniform2f(s.uCanvas,d.width,d.height),e.uniform2f(s.uSource,c.width,c.height),e.uniform1f(s.uDevice,c.device),e.uniform1f(s.uCrt,t.crt),e.drawArrays(e.TRIANGLES,0,3)}const h=Math.abs(U-W.value)>5e-4||i.energy>.05||_.length>0;(t.speed>0||t.rotation!==0||D<1||h)&&te&&re&&(A=requestAnimationFrame(Re))},C=()=>{A||oe||!te||!re||(H=performance.now(),A=requestAnimationFrame(Re))};ee.current=()=>{ie(),C()};const we=o=>{const t=B.getBoundingClientRect();return{x:o.clientX-t.left,y:o.clientY-t.top,inside:o.clientX>=t.left&&o.clientX<=t.right&&o.clientY>=t.top&&o.clientY<=t.bottom}},ye=o=>{const t=we(o);(!a.ready||!a.inside)&&(a.lastX=t.x,a.lastY=t.y),a.vx=t.x-a.x,a.x=t.x,a.y=t.y,a.inside=t.inside,a.ready=!0,C()},Fe=o=>{const t=ce(O.current),l=we(o);!l.inside||!t.clickSwirl||k||(_.push({x:l.x,y:l.y,age:0,direction:a.vx<0?1:-1}),_.length>J&&_.shift(),C())},ae=()=>{a.inside=!1,C()},Y=o=>{o.pointerType!=="mouse"&&ae()};b(window).addEventListener("pointermove",ye,{passive:!0}),b(window).addEventListener("pointerdown",Fe,{passive:!0}),b(window).addEventListener("pointerup",Y,{passive:!0}),b(window).addEventListener("pointercancel",Y,{passive:!0}),b(document.documentElement).addEventListener("pointerleave",ae);const be=o=>{o.preventDefault(),oe=!0,cancelAnimationFrame(A),A=0},_e=()=>Ve(o=>o+1);d.addEventListener("webglcontextlost",be),d.addEventListener("webglcontextrestored",_e);const Ce=new ResizeObserver(()=>{ie(),C()});Ce.observe(B);const Se=new IntersectionObserver(o=>{te=o.some(t=>t.isIntersecting),C()});Se.observe(B);const Ae=()=>{re=document.visibilityState!=="hidden",C()};return document.addEventListener("visibilitychange",Ae),ie(),C(),()=>{cancelAnimationFrame(A),ee.current=null,Ce.disconnect(),Se.disconnect(),b(window).removeEventListener("pointermove",ye),b(window).removeEventListener("pointerdown",Fe),b(window).removeEventListener("pointerup",Y),b(window).removeEventListener("pointercancel",Y),b(document.documentElement).removeEventListener("pointerleave",ae),document.removeEventListener("visibilitychange",Ae),d.removeEventListener("webglcontextlost",be),d.removeEventListener("webglcontextrestored",_e),e.isContextLost()||(Te(),e.deleteTexture(y.texture),e.deleteFramebuffer(y.framebuffer),e.deleteVertexArray(ge),e.deleteProgram(z.program),e.deleteProgram(G.program),S&&e.deleteProgram(S.program))}},[ve]),Le.jsx("div",{ref:me,className:`balatro${fe?` ${fe}`:""}`,style:Ye,children:Le.jsx("canvas",{ref:de,className:"balatro__canvas","aria-hidden":"true"})})};export{it as default};
