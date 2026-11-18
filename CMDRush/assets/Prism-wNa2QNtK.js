import{r as b,j as ce}from"./index-uEvbEw5g.js";import{b as q}from"./App-Dofw4Ib9.js";import{b as B}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const _e=1.4,C=64,Pe=[.299,.587,.114,.299,.587,.114,.299,.587,.114],Ae=[.701,-.587,-.114,-.299,.413,-.114,-.3,-.588,.886],Ie=[.168,-.331,.5,.328,.035,-.5,-.497,.296,.201],Ue=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Ne=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform mat3 uRay;
uniform float uGlow;
uniform vec2 uOffset;
uniform float uColorFreq;
uniform float uCenterShift;
uniform float uInvBaseHalf;
uniform float uInvHeight;
uniform float uMinAxis;
uniform float uPxScale;
uniform sampler2D uPalette;
uniform int uUsePalette;
uniform float uTime;
uniform float uNoise;
uniform float uSaturation;
uniform mat3 uHue;
uniform int uUseHue;
uniform float uLight;
uniform float uNeutral;
out vec4 outColor;

const vec4 PHASE_COS = vec4(1.0, 0.5403023058681398, -0.4161468365471424, -0.9899924966004454);
const vec4 PHASE_SIN = vec4(0.0, 0.8414709848078965, 0.9092974268256817, 0.1411200080598672);

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
}

float pyramid(vec3 p) {
  vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
  return max((q.x + q.y + q.z - 1.0) * uMinAxis * 0.5773502691896258, -p.y);
}

vec3 grade(vec3 col, vec2 seed) {
  col += (rand(seed) - 0.5) * uNoise;
  col = clamp(col, 0.0, 1.0);
  float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);
  if (uUseHue == 1) col = clamp(uHue * col, 0.0, 1.0);
  return col;
}

void main() {
  vec2 f = (gl_FragCoord.xy - 0.5 * uResolution - uOffset) * uPxScale;
  vec3 origin = uRay * vec3(f, 0.0);
  vec3 axis = uRay[2];
  float z = 5.0;
  vec4 o = vec4(0.0);
  for (int i = 0; i < 100; i++) {
    vec3 p = origin + axis * z;
    float d = 0.1 + 0.2 * abs(pyramid(p + vec3(0.0, uCenterShift, 0.0)));
    z -= d;
    float phase = (p.y + z) * uColorFreq;
    vec4 band = sin(phase) * PHASE_COS + cos(phase) * PHASE_SIN + 1.0;
    if (uUsePalette == 1) band.rgb = texture(uPalette, vec2(phase * 0.15915494309189535, 0.5)).rgb * 2.0;
    o += band / d;
  }
  vec4 raw = o * o * uGlow / 1e5;
  vec4 e = exp(2.0 * raw);
  vec4 mapped = (e - 1.0) / (e + 1.0);
  vec2 seed = gl_FragCoord.xy + vec2(uTime);
  if (uLight > 0.5) {
    float peak = max(raw.r, max(raw.g, raw.b));
    vec3 hue = grade(raw.rgb / max(peak, 1e-6), seed);
    vec3 ink = pow(hue, vec3(1.5)) * mix(0.86, 0.32, uNeutral);
    float strength = max(mapped.r, max(mapped.g, mapped.b)) * mapped.a;
    float cover = clamp(strength * 0.95 + (rand(seed.yx) - 0.5) * uNoise * 0.5, 0.0, 1.0);
    outColor = vec4(ink * cover, cover);
  } else {
    outColor = vec4(grade(mapped.rgb, seed) * mapped.a, mapped.a);
  }
}`,D=(n,l,f)=>Math.min(f,Math.max(l,n)),ue=(n,l,f)=>{const o=n.createShader(l);return o?(n.shaderSource(o,f),n.compileShader(o),n.getShaderParameter(o,n.COMPILE_STATUS)?o:(n.deleteShader(o),null)):null},He=n=>{const l=ue(n,n.VERTEX_SHADER,Ue),f=ue(n,n.FRAGMENT_SHADER,Ne),o=n.createProgram();if(!l||!f||!o)return null;if(n.attachShader(o,l),n.attachShader(o,f),n.linkProgram(o),n.deleteShader(l),n.deleteShader(f),!n.getProgramParameter(o,n.LINK_STATUS))return n.deleteProgram(o),null;const s={},g=n.getProgramParameter(o,n.ACTIVE_UNIFORMS);for(let v=0;v<g;v++){const p=n.getActiveUniform(o,v);p&&(s[p.name]=n.getUniformLocation(o,p.name))}return{program:o,uniforms:s}},le=(n,l,f)=>{const o=Math.cos(n),s=Math.sin(n),g=Math.cos(l),v=Math.sin(l),p=Math.cos(f),w=Math.sin(f);return[o*p+s*v*w,g*w,-s*p+o*v*w,-o*w+s*v*p,g*p,s*w+o*v*p,s*g,-v,o*g]},fe=(n,l)=>{const f=new Array(9);for(let o=0;o<3;o++)for(let s=0;s<3;s++)f[o*3+s]=n[s]*l[o*3]+n[3+s]*l[o*3+1]+n[6+s]*l[o*3+2];return f},Fe=({height:n=3.5,baseWidth:l=5.5,animationType:f="rotate",glow:o=1,offset:s,noise:g=0,scale:v=3.6,hueShift:p=0,colorFrequency:w=1,colors:j,saturation:me=1.5,timeScale:he=.5,interactive:de=!0,hoverStrength:ve=2,inertia:pe=.05,intro:xe=!0,resolution:Ee=.5,lightMode:ge=!1,dpr:Me,className:Y="",style:Te,...we})=>{const K=b.useRef(null),$=b.useRef(null),z=b.useRef(null),Z=b.useRef(0),Re=Array.isArray(j)?j.filter(Boolean).slice(0,8):[],J={height:Math.max(.1,n),baseWidth:Math.max(.1,l),animationType:f==="rotate3d"?"3drotate":f,glow:Math.max(0,o),offsetX:s?.x??0,offsetY:s?.y??0,noise:Math.max(0,g),scale:Math.max(.1,v),hueShift:(p||0)*Math.PI/180,colorFrequency:Math.max(0,w),colors:Re,saturation:Math.max(0,me),timeScale:Math.max(0,he),interactive:de,hoverStrength:Math.max(0,ve),inertia:D(pe,.001,1),intro:xe,resolution:D(Ee,.25,1),lightMode:ge,dpr:Me},_=b.useRef(J);return _.current=J,b.useEffect(()=>{window.clearTimeout(Z.current);const P=K.current,x=$.current,e=x?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!P||!x||!e)return;const X=He(e);if(!X)return;const i=X.uniforms,Q=e.createVertexArray(),F=e.createTexture();e.bindTexture(e.TEXTURE_2D,F),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,C,1,0,e.RGBA,e.UNSIGNED_BYTE,null);const A=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),Se=t=>{if(!A)return[255,255,255];A.clearRect(0,0,1,1),A.fillStyle="#000000",A.fillStyle=String(t),A.fillRect(0,0,1,1);const[r,a,c]=A.getImageData(0,0,1,1).data;return[r,a,c]};let ee="",V=0;const ye=t=>{const r=t.join(",");if(r===ee||(ee=r,V=0,!t.length))return;const a=t.map(Se);V=1-a.reduce((u,[h,d,M])=>{const T=Math.max(h,d,M);return u+(T>0?(T-Math.min(h,d,M))/T:0)},0)/a.length;const c=new Uint8Array(C*4);for(let u=0;u<C;u++){const h=u/C*a.length,d=Math.floor(h),M=a[d%a.length],T=a[(d+1)%a.length],L=h-d,se=L*L*(3-2*L);for(let y=0;y<3;y++)c[u*4+y]=Math.round(M[y]+(T[y]-M[y])*se);c[u*4+3]=255}e.bindTexture(e.TEXTURE_2D,F),e.texSubImage2D(e.TEXTURE_2D,0,0,0,C,1,e.RGBA,e.UNSIGNED_BYTE,c)},N=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,E={width:1,height:1,scale:1},m={yaw:0,pitch:0,roll:0},R={x:0,y:0,inside:!1};let G=0,S=_.current.intro&&!N?0:1,H=0,I=0,O=!0;const be=t=>{const r=le(m.yaw,m.pitch,m.roll);if(t.animationType==="rotate"){const a=G*t.timeScale,c=Math.cos(a),u=Math.cos(a+33),h=Math.cos(a+11);return fe(r,[c,0,h,0,1,0,u,0,c])}if(t.animationType==="3drotate"){const a=G*t.timeScale;return fe(r,le(a*.55,Math.sin(a*.6+.6)*.6,Math.sin(a*.35+1.9)*.5))}return r},te=()=>{const t=B(_.current);ye(t.colors);const r=t.baseWidth*.5,a=S*S*(3-2*S),c=Math.cos(t.hueShift),u=Math.sin(t.hueShift);e.bindVertexArray(Q),e.viewport(0,0,x.width,x.height),e.useProgram(X.program),e.uniform2f(i.uResolution,x.width,x.height),e.uniformMatrix3fv(i.uRay,!1,be(t)),e.uniform1f(i.uGlow,t.glow*a*a),e.uniform2f(i.uOffset,t.offsetX*E.scale,-t.offsetY*E.scale),e.uniform1f(i.uColorFreq,t.colorFrequency),e.uniform1f(i.uCenterShift,t.height*.25),e.uniform1f(i.uInvBaseHalf,1/r),e.uniform1f(i.uInvHeight,1/t.height),e.uniform1f(i.uMinAxis,Math.min(r,t.height)),e.uniform1f(i.uPxScale,1/(x.height*.1*t.scale)),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,F),e.uniform1i(i.uPalette,0),e.uniform1i(i.uUsePalette,t.colors.length?1:0),e.uniform1f(i.uTime,G),e.uniform1f(i.uNoise,t.noise),e.uniform1f(i.uSaturation,t.saturation),e.uniformMatrix3fv(i.uHue,!1,Pe.map((h,d)=>h+Ae[d]*c+Ie[d]*u)),e.uniform1i(i.uUseHue,Math.abs(t.hueShift)>1e-4?1:0),e.uniform1f(i.uLight,t.lightMode?1:0),e.uniform1f(i.uNeutral,V),e.drawArrays(e.TRIANGLES,0,3)},W=()=>{const t=B(_.current);E.width=Math.max(1,P.clientWidth),E.height=Math.max(1,P.clientHeight),E.scale=Math.min(t.dpr||window.devicePixelRatio||1,2)*t.resolution,x.width=Math.max(1,Math.round(E.width*E.scale)),x.height=Math.max(1,Math.round(E.height*E.scale)),te(),U()},ne=t=>{if(H=0,!O||document.hidden)return;const r=B(_.current);if(Math.round(E.width*Math.min(r.dpr||window.devicePixelRatio||1,2)*r.resolution)!==x.width){W();return}const a=I?D((t-I)/1e3,.001,.05):1/60;I=t,N||(G+=a),S<1&&(S=Math.min(1,S+a/_e));const c=r.animationType==="hover",u=R.inside&&!N&&(c||r.interactive),h=(c?.6:.09)*r.hoverStrength,d=u?-R.x*h:0,M=u?R.y*h:0,T=1-Math.pow(1-r.inertia,a*60);m.yaw+=(d-m.yaw)*T,m.pitch+=(M-m.pitch)*T,m.roll+=(0-m.roll)*(1-Math.pow(.9,a*60)),te();const L=Math.abs(d-m.yaw)+Math.abs(M-m.pitch)+Math.abs(m.roll)>1e-4;!N&&!c&&r.animationType!=="static"&&r.timeScale>0||L||S<1||!N&&r.noise>0?H=requestAnimationFrame(ne):I=0};function U(){!H&&O&&!document.hidden&&(H=requestAnimationFrame(ne))}const oe=t=>{const r=P.getBoundingClientRect(),a=(t.clientX-r.left)/Math.max(1,r.width)*2-1,c=(t.clientY-r.top)/Math.max(1,r.height)*2-1;R.inside=Math.abs(a)<=1&&Math.abs(c)<=1,R.x=D(a,-1,1),R.y=D(c,-1,1);const u=B(_.current);(u.interactive||u.animationType==="hover")&&U()},k=()=>{R.inside=!1,U()},re=()=>{I=0,U()},ae=new ResizeObserver(W);ae.observe(P);const ie=new IntersectionObserver(t=>{O=t.some(r=>r.isIntersecting),O&&(I=0,U())});return ie.observe(P),q(window).addEventListener("pointermove",oe,{passive:!0}),window.addEventListener("blur",k),q(document.documentElement).addEventListener("pointerleave",k),document.addEventListener("visibilitychange",re),W(),z.current=U,()=>{cancelAnimationFrame(H),z.current=null,ae.disconnect(),ie.disconnect(),q(window).removeEventListener("pointermove",oe),window.removeEventListener("blur",k),q(document.documentElement).removeEventListener("pointerleave",k),document.removeEventListener("visibilitychange",re),e.deleteTexture(F),e.deleteVertexArray(Q),e.deleteProgram(X.program),Z.current=window.setTimeout(()=>e.getExtension("WEBGL_lose_context")?.loseContext(),0)}},[]),b.useEffect(()=>{z.current?.()}),ce.jsx("div",{ref:K,className:`prism${Y?` ${Y}`:""}`,style:Te,...we,children:ce.jsx("canvas",{ref:$,className:"prism-canvas","aria-hidden":"true"})})};export{Fe as default};
