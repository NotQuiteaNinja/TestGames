import{r as S,j as pe}from"./index-uEvbEw5g.js";import{b as A}from"./App-Dofw4Ib9.js";import{b as L}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Ge=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Be=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uScale;
uniform float uRotation;
uniform int uDetail;
uniform float uWarp;
uniform float uHue;
uniform float uSaturation;
uniform float uBrightness;
uniform float uContrast;
uniform float uGrain;
uniform float uSeed;
uniform float uFade;
uniform float uOpacity;
uniform sampler2D uField;
uniform float uStir;
uniform vec3 uPointer;
uniform float uSheen;
uniform vec4 uSwirls[6];
in vec2 vUv;
out vec4 outColor;

vec3 hueRotate(vec3 c, float angle) {
  const vec3 k = vec3(0.57735027);
  float ca = cos(angle);
  return c * ca + cross(k, c) * sin(angle) + k * dot(k, c) * (1.0 - ca);
}

float smootherstep(float edge, float x) {
  float t = clamp(x / edge, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 aspect = uResolution / mr;
  vec2 st = vUv - texture(uField, vUv).rg * uStir;

  for (int k = 0; k < 6; k++) {
    vec4 swirl = uSwirls[k];
    if (swirl.w == 0.0) continue;
    vec2 delta = (st - swirl.xy) * aspect;
    float angle = swirl.w * exp(-dot(delta, delta) / (swirl.z * swirl.z));
    float ca = cos(angle);
    float sa = sin(angle);
    st = swirl.xy + vec2(ca * delta.x - sa * delta.y, sa * delta.x + ca * delta.y) / aspect;
  }

  vec2 uv = (st * 2.0 - 1.0) * aspect;
  float c = cos(uRotation);
  float s = sin(uRotation);
  uv = mat2(c, -s, s, c) * uv / uScale;
  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5;
  float a = 0.0;
  for (int i = 0; i < 24; i++) {
    if (i >= uDetail) break;
    float fi = float(i);
    a += cos(fi - d - a * uv.x * uWarp);
    d += sin(uv.y * fi + a);
  }
  d += uTime * 0.5;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;

  vec2 toPointer = (vUv - uPointer.xy) * aspect;
  col += col * uPointer.z * uSheen * 0.8 * exp(-dot(toPointer, toPointer) / 0.09);

  col = hueRotate(col, uHue);
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, uSaturation);
  col = (col - 0.5) * uContrast + 0.5;
  col *= uBrightness;
  col += (hash(gl_FragCoord.xy + uSeed) - 0.5) * uGrain * 0.12;
  col = clamp(col, 0.0, 1.0);

  float alpha = uOpacity;
  if (uFade > 0.0) {
    vec2 px = vUv * uResolution;
    float edge = uFade * mr * 0.5;
    alpha *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);
    alpha *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);
  }
  outColor = vec4(col * alpha, alpha);
}`,Ne=48,ve=6,$=3.2,g=(f,F,P)=>Math.min(P,Math.max(F,f)),xe=(f,F,P)=>{const v=f.createShader(F);return v?(f.shaderSource(v,P),f.compileShader(v),f.getShaderParameter(v,f.COMPILE_STATUS)?v:(f.deleteShader(v),null)):null},qe=({color:f=[1,1,1],speed:F=1,amplitude:P=.1,mouseReact:v=!0,scale:Re=1,detail:ge=8,rotation:we=0,warp:Ee=1,hueShift:Me=0,saturation:Te=1,brightness:ye=1.5,contrast:Se=1,stir:Ae=.5,sheen:Fe=.3,clickSwirl:Pe=!0,grain:be=0,fade:_e=0,opacity:Ue=1,resolution:Le=1,paused:De=!1,className:J="",style:Ce})=>{const Q=S.useRef(null),Z=S.useRef(null),k=S.useRef(null),ee={colorKey:Array.isArray(f)?f.join(","):String(f),color:f,speed:F,amplitude:P,mouseReact:v,scale:Math.max(.05,Re),detail:g(Math.round(ge),1,24),rotation:we,warp:Ee,hueShift:Me,saturation:Math.max(0,Te),brightness:Math.max(0,ye),contrast:Math.max(0,Se),stir:Math.max(0,Ae),sheen:Math.max(0,Fe),clickSwirl:Pe,grain:g(be,0,1),fade:g(_e,0,1),opacity:g(Ue,0,1),resolution:g(Le,.1,2),paused:De},x=S.useRef(ee);return x.current=ee,S.useEffect(()=>{const w=Q.current,R=Z.current,e=R?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!w||!R||!e)return;const O=xe(e,e.VERTEX_SHADER,Ge),G=xe(e,e.FRAGMENT_SHADER,Be),p=e.createProgram();if(!O||!G||!p||(e.attachShader(p,O),e.attachShader(p,G),e.linkProgram(p),!e.getProgramParameter(p,e.LINK_STATUS)))return;e.useProgram(p);const te=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,te),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const oe=e.getAttribLocation(p,"aPosition");e.enableVertexAttribArray(oe),e.vertexAttribPointer(oe,2,e.FLOAT,!1,0,0);const n={};for(const o of["uResolution","uTime","uColor","uMouse","uAmplitude","uScale","uRotation","uDetail","uWarp","uHue","uSaturation","uBrightness","uContrast","uGrain","uSeed","uFade","uOpacity","uField","uStir","uPointer","uSheen","uSwirls"])n[o]=e.getUniformLocation(p,o);const D=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.uniform1i(n.uField,0);const B=document.createElement("canvas");B.width=1,B.height=1;const E=B.getContext("2d",{willReadFrequently:!0}),N=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,u={x:.5,y:.5,inside:!1,tracked:!1},t={width:1,height:1,phase:0,mouse:[.5,.5],presence:0,color:[1,1,1],colorKey:"",cols:0,rows:0,field:new Float32Array(0),scratch:new Float32Array(0),fieldActive:!1,swirls:[],seed:0},W=new Float32Array(ve*4);let M=0,b=0,C=!0,K=!0;const Ie=o=>{if(o.colorKey===t.colorKey)return;if(t.colorKey=o.colorKey,Array.isArray(o.color)){t.color=[0,1,2].map(s=>g(Number(o.color[s]??1),0,1));return}if(!E)return;E.clearRect(0,0,1,1),E.fillStyle="#ffffff",E.fillStyle=String(o.color),E.fillRect(0,0,1,1);const[r,i,a]=E.getImageData(0,0,1,1).data;t.color=[r/255,i/255,a/255]},Xe=()=>{const o=Ne,r=g(Math.round(o*t.height/t.width),6,96);o===t.cols&&r===t.rows||(t.cols=o,t.rows=r,t.field=new Float32Array(o*r*2),t.scratch=new Float32Array(o*r*2),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,D),e.texImage2D(e.TEXTURE_2D,0,e.RG16F,o,r,0,e.RG,e.FLOAT,t.field))},ke=(o,r,i,a)=>{const{cols:s,rows:m,field:h}=t,c=.22,d=t.width/t.height,_=Math.max(0,Math.floor((o-c/d)*s)),j=Math.min(s-1,Math.ceil((o+c/d)*s)),q=Math.max(0,Math.floor((r-c)*m)),V=Math.min(m-1,Math.ceil((r+c)*m));for(let y=q;y<=V;y++)for(let l=_;l<=j;l++){const I=((l+.5)/s-o)*d,le=(y+.5)/m-r,U=1-(I*I+le*le)/(c*c);if(U<=0)continue;const X=(y*s+l)*2,fe=h[X]+i*U*U*3.2,me=h[X+1]+a*U*U*3.2,Y=Math.hypot(fe,me),de=.4,he=Y>0?de*Math.tanh(Y/de)/Y:0;h[X]=fe*he,h[X+1]=me*he}t.fieldActive=!0},Oe=o=>{const{cols:r,rows:i,field:a,scratch:s}=t,m=Math.exp(-o*1.4);let h=0;for(let c=0;c<i;c++)for(let d=0;d<r;d++){const _=(c*r+d)*2,j=(c*r+Math.max(0,d-1))*2,q=(c*r+Math.min(r-1,d+1))*2,V=(Math.max(0,c-1)*r+d)*2,y=(Math.min(i-1,c+1)*r+d)*2;for(let l=0;l<2;l++){const I=(a[_+l]*12+a[j+l]+a[q+l]+a[V+l]+a[y+l])/16;s[_+l]=I*m,h=Math.max(h,Math.abs(s[_+l]))}}a.set(s),h<4e-4&&(a.fill(0),t.fieldActive=!1)},H=()=>{const o=L(x.current);Ie(o),Xe(),e.viewport(0,0,R.width,R.height),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,D),e.texSubImage2D(e.TEXTURE_2D,0,0,0,t.cols,t.rows,e.RG,e.FLOAT,t.field),W.fill(0),t.swirls.forEach((r,i)=>{const a=.21*(1+.4*r.age),s=Math.exp(-r.age*1.35)-Math.exp(-r.age*10),m=Math.min(1,($-r.age)/.8);W.set([r.x,r.y,a,3*s*m*(.21/a)**2],i*4)}),e.uniform2f(n.uResolution,t.width,t.height),e.uniform1f(n.uTime,t.phase),e.uniform3f(n.uColor,t.color[0],t.color[1],t.color[2]),e.uniform2f(n.uMouse,t.mouse[0],t.mouse[1]),e.uniform1f(n.uAmplitude,o.amplitude),e.uniform1f(n.uScale,o.scale),e.uniform1f(n.uRotation,o.rotation*Math.PI/180),e.uniform1i(n.uDetail,o.detail),e.uniform1f(n.uWarp,o.warp),e.uniform1f(n.uHue,o.hueShift*Math.PI/180),e.uniform1f(n.uSaturation,o.saturation),e.uniform1f(n.uBrightness,o.brightness),e.uniform1f(n.uContrast,o.contrast),e.uniform1f(n.uGrain,o.grain),e.uniform1f(n.uSeed,t.seed),e.uniform1f(n.uFade,o.fade),e.uniform1f(n.uOpacity,o.opacity),e.uniform1f(n.uStir,o.mouseReact?o.stir:0),e.uniform3f(n.uPointer,u.x,u.y,o.mouseReact?t.presence:0),e.uniform1f(n.uSheen,o.sheen),e.uniform4fv(n.uSwirls,W),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)},re=o=>{if(M=0,!K||!C)return;const r=L(x.current),i=b?Math.min(.05,(o-b)/1e3):1/60;b=o;const a=!r.paused&&!N;a&&(t.phase+=i*r.speed);const s=r.mouseReact&&u.tracked?[u.x,u.y]:[.5,.5],m=1-Math.exp(-i*5);t.mouse[0]+=(s[0]-t.mouse[0])*m,t.mouse[1]+=(s[1]-t.mouse[1])*m,t.presence+=((u.inside?1:0)-t.presence)*(1-Math.exp(-i*4)),t.fieldActive&&Oe(i),t.swirls=t.swirls.filter(c=>(c.age+=i)<$),r.grain>0&&a&&(t.seed=Math.floor(o/42)%997),H();const h=Math.abs(s[0]-t.mouse[0])>5e-4||Math.abs(s[1]-t.mouse[1])>5e-4||Math.abs((u.inside?1:0)-t.presence)>.002;a||h||t.fieldActive||t.swirls.length?M=requestAnimationFrame(re):b=0},T=()=>{M||!K||!C||(M=requestAnimationFrame(re))},ae=o=>{const r=w.getBoundingClientRect();return{x:(o.clientX-r.left)/Math.max(1,r.width),y:1-(o.clientY-r.top)/Math.max(1,r.height)}},ie=o=>{const r=L(x.current),{x:i,y:a}=ae(o),s=i>=0&&i<=1&&a>=0&&a<=1;s&&r.mouseReact&&!N&&u.inside&&r.stir>0&&ke(i,a,i-u.x,a-u.y),u.x=i,u.y=a,u.inside=s,s&&(u.tracked=!0),T()},ne=()=>{u.inside=!1,T()},se=o=>{if(!L(x.current).clickSwirl||N)return;const{x:i,y:a}=ae(o);if(!(i<0||i>1||a<0||a>1)){if(t.swirls.length>=ve){if(t.swirls[0].age<$-.4)return;t.swirls.shift()}t.swirls.push({x:i,y:a,age:0}),T()}},z=()=>{const o=L(x.current),r=Math.min(window.devicePixelRatio||1,2)*o.resolution;t.width=Math.max(1,w.clientWidth),t.height=Math.max(1,w.clientHeight),R.width=Math.max(1,Math.round(t.width*r)),R.height=Math.max(1,Math.round(t.height*r)),H(),T()};k.current=()=>{const o=Math.min(window.devicePixelRatio||1,2)*x.current.resolution;R.width!==Math.max(1,Math.round(t.width*o))?z():M||H(),T()};const ce=new ResizeObserver(z);ce.observe(w);const ue=new IntersectionObserver(o=>{C=o.some(r=>r.isIntersecting),C&&(b=0,T())});return ue.observe(w),A(window).addEventListener("pointermove",ie,{passive:!0}),A(window).addEventListener("pointerdown",se,{passive:!0}),A(document.documentElement).addEventListener("pointerleave",ne),z(),()=>{K=!1,cancelAnimationFrame(M),k.current=null,ce.disconnect(),ue.disconnect(),A(window).removeEventListener("pointermove",ie),A(window).removeEventListener("pointerdown",se),A(document.documentElement).removeEventListener("pointerleave",ne),e.deleteTexture(D),e.deleteBuffer(te),e.deleteProgram(p),e.deleteShader(O),e.deleteShader(G)}},[]),S.useEffect(()=>{k.current?.()}),pe.jsx("div",{ref:Q,className:`iridescence-container${J?` ${J}`:""}`,style:Ce,children:pe.jsx("canvas",{ref:Z,className:"iridescence-canvas","aria-hidden":"true"})})};export{qe as default};
