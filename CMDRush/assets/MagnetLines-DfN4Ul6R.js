import{r as mt,j as ae}from"./index-uEvbEw5g.js";import{b as It}from"./App-Dofw4Ib9.js";import{b as oe}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const ze=`#version 300 es
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec2 aCenter;
layout(location = 2) in vec4 aState;
uniform mat3 uView;
uniform vec2 uCanvas;
uniform vec2 uOffset;
uniform vec2 uLine;
uniform float uStretch;
uniform float uHead;
uniform float uPad;
uniform float uFar;
out vec2 vLocal;
out vec2 vHalf;
out float vEmphasis;
out float vFlash;
out float vAngle;
out float vShown;
void main() {
  float angle = aState.x;
  float emphasis = aState.y;
  float halfLength = uLine.x * (1.0 + uStretch * emphasis);
  float halfWidth = uLine.y;
  vec2 extent = vec2(halfLength + uPad, max(halfWidth, uHead * halfLength) + uPad);
  vec2 local = aCorner * extent;
  vec2 axis = vec2(cos(angle), sin(angle));
  vec2 point = aCenter + axis * local.x + vec2(-axis.y, axis.x) * local.y;
  vec3 screen = uView * vec3(point, 1.0);
  vec2 scale = vec2(2.0 / uCanvas.x, -2.0 / uCanvas.y);
  vec2 shift = vec2(-1.0 + 2.0 * uOffset.x / uCanvas.x, 1.0 - 2.0 * uOffset.y / uCanvas.y);
  gl_Position = vec4(screen.xy * scale + shift * screen.z, 0.0, screen.z);
  float depth = (uView * vec3(aCenter, 1.0)).z;
  vLocal = local;
  vHalf = vec2(halfLength, halfWidth);
  vEmphasis = emphasis;
  vFlash = aState.z;
  vAngle = angle;
  vShown = aState.w * (1.0 - smoothstep(uFar * 0.45, uFar, depth));
}`,je=`#version 300 es
precision highp float;
in vec2 vLocal;
in vec2 vHalf;
in float vEmphasis;
in float vFlash;
in float vAngle;
in float vShown;
out vec4 fragColor;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uAccentMix;
uniform float uOpacity;
uniform float uFade;
uniform int uShape;
uniform float uHead;
uniform float uRainbow;
uniform float uTone;
uniform float uPeriod;
uniform vec2 uCanvas;
uniform vec2 uOffset;
uniform vec2 uPixels;
uniform vec2 uEdge;

float ndot(vec2 a, vec2 b) {
  return a.x * b.x - a.y * b.y;
}

float rhombus(vec2 p, vec2 b) {
  p = abs(p);
  float h = clamp(ndot(b - 2.0 * p, b) / dot(b, b), -1.0, 1.0);
  float d = length(p - 0.5 * b * vec2(1.0 - h, 1.0 + h));
  return d * sign(p.x * b.y + p.y * b.x - b.x * b.y);
}

float triangle(vec2 p, vec2 q) {
  p.x = abs(p.x);
  vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
  vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);
  float s = -sign(q.y);
  vec2 d = min(vec2(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2(dot(b, b), s * (p.y - q.y)));
  return -sqrt(d.x) * sign(d.y);
}

float capsule(vec2 p, float from, float to, float radius) {
  float x = clamp(p.x, from, to);
  return length(vec2(p.x - x, p.y)) - radius;
}

float feather(float distance, float zone) {
  if (zone <= 0.0) return 1.0;
  float t = clamp(distance / zone, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec3 spectrum(float hue, float tone) {
  vec3 k = clamp(abs(fract(hue + vec3(0.0, 2.0, 1.0) / 3.0) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  float chroma = (1.0 - abs(2.0 * tone - 1.0)) * 0.92;
  return tone + chroma * (k - 0.5);
}

void main() {
  vec2 p = vLocal;
  float aa = max(length(fwidth(p)) * 0.7071, 0.0001);
  float halfWidth = max(vHalf.y, aa * 0.5);
  float thin = vHalf.y / halfWidth;
  float halfLength = max(vHalf.x, halfWidth);
  float d;
  if (uShape == 1) {
    float head = min(halfLength * 0.9, max(halfWidth * 4.5, halfLength * 0.55));
    float wing = max(uHead * halfLength, halfWidth * 2.2);
    float shaft = capsule(p, -halfLength + halfWidth, halfLength - head * 0.6, halfWidth);
    float tip = triangle(vec2(p.y, halfLength - p.x), vec2(wing, head));
    d = min(shaft, tip);
  } else if (uShape == 2) {
    d = rhombus(p, vec2(halfLength, max(uHead * halfLength, halfWidth)));
  } else {
    d = capsule(p, -halfLength + halfWidth, halfLength - halfWidth, halfWidth);
  }
  float coverage = clamp(0.5 - d / aa, 0.0, 1.0) * thin;
  if (coverage <= 0.0) discard;

  float emphasis = clamp(vEmphasis + vFlash, 0.0, 1.0);
  vec3 color = mix(uColor, uAccent, uAccentMix * emphasis);
  if (uShape == 2) {
    float north = smoothstep(-aa, aa, p.x);
    color = mix(uColor, uAccent, north);
  }
  if (uRainbow > 0.5) {
    float hue = fract(vAngle / uPeriod);
    vec3 tint = spectrum(hue, uTone);
    color = uShape == 2 ? mix(tint, uColor, 1.0 - smoothstep(-aa, aa, p.x)) : tint;
  }
  float alpha = uOpacity * mix(1.0 - uFade, 1.0, clamp(vEmphasis, 0.0, 1.0));
  alpha = clamp(alpha + vFlash * 0.6, 0.0, 1.0) * coverage * vShown;
  vec2 point = vec2(gl_FragCoord.x, uPixels.y - gl_FragCoord.y) * (uCanvas / uPixels) - uOffset;
  vec2 inside = min(point, uCanvas - 2.0 * uOffset - point);
  alpha *= feather(inside.x, uEdge.x) * feather(inside.y, uEdge.y);
  fragColor = vec4(color * alpha, alpha);
}`,Ge=["orbit","attract","spiral","dipole"],Ce={line:0,arrow:1,needle:2},re=Math.PI*2,Nt=520,se=.34,_e=700,Ke=1.1,Je=.65,ce=4,Wt=3e4,I=(e,o,a)=>Math.min(a,Math.max(o,e)),ie=e=>e*e*e*(e*(e*6-15)+10),dt=(e,o)=>{const a=o/2;return((e+a)%o+o)%o-a},Qe=(e,o)=>{let a=Math.imul(e+40503,2246822519)^Math.imul(o+9973,3266489917);return a=Math.imul(a^a>>>15,668265263),a=Math.imul(a^a>>>13,374761393),((a^a>>>16)>>>0)/4294967296*2-1},Dt=e=>{const o=String(e||"").trim(),a=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(o);if(a){const m=a[1].length===3?a[1].replace(/./g,u=>u+u):a[1];return[0,2,4].map(u=>parseInt(m.slice(u,u+2),16)/255)}const r=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(o);if(r)return[r[1],r[2],r[3]].map(m=>I(parseFloat(m)/255,0,1));if(typeof document<"u"){const m=document.createElement("canvas").getContext("2d");if(m){m.fillStyle="#000000",m.fillStyle=o;const u=String(m.fillStyle);if(u!=="#000000"||/^(#0{3}|#0{6}|black)$/i.test(o))return Dt(u)}}return[.94,.94,.94]},Ze=e=>(Math.max(...e)+Math.min(...e))/2,Be=(e,o,a)=>{const r=e.createShader(o);return r?(e.shaderSource(r,a),e.compileShader(r),r):null},tn=e=>{const o=Be(e,e.VERTEX_SHADER,ze),a=Be(e,e.FRAGMENT_SHADER,je),r=o&&a?e.createProgram():null;return!o||!a||!r?(o&&e.deleteShader(o),a&&e.deleteShader(a),null):(e.attachShader(r,o),e.attachShader(r,a),e.linkProgram(r),{program:r,vertex:o,fragment:a})},Te=(e,{program:o,vertex:a,fragment:r})=>{const m=e.getProgramParameter(o,e.LINK_STATUS);if(!m){let l=!0;for(const M of[a,r])e.getShaderParameter(M,e.COMPILE_STATUS)||(console.error(e.getShaderInfoLog(M)),l=!1);l&&console.error(e.getProgramInfoLog(o))}if(e.deleteShader(a),e.deleteShader(r),!m)return e.deleteProgram(o),null;const u={},p=e.getProgramParameter(o,e.ACTIVE_UNIFORMS);for(let l=0;l<p;l++){const M=e.getActiveUniform(o,l);M&&(u[M.name]=e.getUniformLocation(o,M.name))}return{program:o,uniforms:u}},Ye=(e,o,a)=>{if(o&&e.getProgramParameter(a.program,o.COMPLETION_STATUS_KHR)===!1){requestAnimationFrame(()=>Ye(e,o,a));return}e.deleteShader(a.vertex),e.deleteShader(a.fragment),e.deleteProgram(a.program)},Oe=(e,o)=>{const a=[];for(let r=0;r<3;r++)for(let m=0;m<3;m++)a.push(e[r*3]*o[m]+e[r*3+1]*o[m+3]+e[r*3+2]*o[m+6]);return a},Ue=e=>{const[o,a,r,m,u,p,l,M,F]=e,w=u*F-p*M,N=p*l-m*F,J=m*M-u*l,Z=o*w+a*N+r*J;return[w,r*M-a*F,a*p-r*u,N,o*F-r*l,r*m-o*p,J,a*l-o*M,o*u-a*m].map(A=>A/Z)},Vt=(e,o,a)=>{const r=e[6]*o+e[7]*a+e[8];return[(e[0]*o+e[1]*a+e[2])/r,(e[3]*o+e[4]*a+e[5])/r,r]},en=(e,o,a,r,m)=>{const u=e*Math.PI/180,p=o*Math.PI/180,l=Math.max(a,r)*1.25,M=[Math.cos(p),0,0,Math.sin(u)*Math.sin(p),Math.cos(u),0,Math.sin(p)*Math.cos(u)/l,-Math.sin(u)/l,1];if(m){const X=Oe([1,0,a/2,0,1,r/2,0,0,1],M);return{forward:X,inverse:Ue(X),minScale:1,maxScale:1}}const F=[[-a/2,-r/2],[a/2,-r/2],[a/2,r/2],[-a/2,r/2]].map(([X,Xt])=>Vt(M,X,Xt)),w=F.map(X=>X[0]),N=F.map(X=>X[1]),J=Math.max(...w)-Math.min(...w),Z=Math.max(...N)-Math.min(...N),A=Math.min(1,a/Math.max(1,J),r/Math.max(1,Z)),tt=(Math.max(...w)+Math.min(...w))/2,V=(Math.max(...N)+Math.min(...N))/2,it=[A,0,a/2-tt*A,0,A,r/2-V*A,0,0,1],pt=Oe(it,M),xt=F.map(X=>A/Math.abs(X[2]));return{forward:pt,inverse:Ue(pt),minScale:Math.min(...xt),maxScale:Math.max(...xt)}},nn=(e,o,a,r,m)=>{const u=e.inverse,p=Math.max(r,m)*2,l=[[-p,-p],[o+p,-p],[o+p,a+p],[-p,a+p]],M=([A,tt])=>u[6]*A+u[7]*tt+u[8]-1/ce,F=[];if(l.forEach((A,tt)=>{const V=l[(tt+1)%l.length],it=M(A),pt=M(V);if(it>=0&&F.push(A),it>=0!=pt>=0){const xt=it/(it-pt);F.push([A[0]+(V[0]-A[0])*xt,A[1]+(V[1]-A[1])*xt])}}),F.length<3)return null;let w=1/0,N=1/0,J=-1/0,Z=-1/0;for(const[A,tt]of F){const V=Vt(u,A,tt);w=Math.min(w,V[0]),N=Math.min(N,V[1]),J=Math.max(J,V[0]),Z=Math.max(Z,V[1])}return{fromColumn:Math.floor((w+o/2)/r-.5)-1,toColumn:Math.ceil((J+o/2)/r-.5)+1,fromRow:Math.floor((N+a/2)/m-.5)-1,toRow:Math.ceil((Z+a/2)/m-.5)+1}},an=e=>{const o=e.length;let a=1/0,r=-1/0;for(let l=0;l<o;l++)a=Math.min(a,e[l]),r=Math.max(r,e[l]);const m=r>a?(o-1)/(r-a):0,u=new Uint32Array(o+1);for(let l=0;l<o;l++)u[Math.floor((e[l]-a)*m)+1]+=1;for(let l=0;l<o;l++)u[l+1]+=u[l];const p=new Uint32Array(o);for(let l=0;l<o;l++)p[u[Math.floor((e[l]-a)*m)]++]=l;for(let l=1;l<o;l++){const M=p[l],F=e[M];let w=l-1;for(;w>=0&&e[p[w]]>F;)p[w+1]=p[w],w-=1;p[w+1]=M}return p},ln=({spacing:e=30,rows:o,columns:a,containerSize:r,lineColor:m="#efefef",accentColor:u,lineWidth:p=2,lineHeight:l=18,baseAngle:M=-10,mode:F="orbit",shape:w="line",rainbow:N=!1,radius:J=200,fade:Z=.65,edgeFade:A=0,stretch:tt=.4,reach:V=0,scatter:it=0,inertia:pt=.35,bounce:xt=.3,ripple:X=.3,clickPulse:Xt=!0,intro:ke=!0,idle:He=!1,tiltX:qe=0,tiltY:Ne=0,maxDevicePixelRatio:We=2,className:le="",style:fe})=>{const ue=mt.useRef(null),he=mt.useRef(null),me=mt.useRef(null),$t=mt.useRef(null),[de,De]=mt.useState(0),pe=typeof r=="number"?`${r}px`:r,zt=!!pe,jt=Dt(m),xe=u?Dt(u):null,ve={square:zt,spacing:Math.max(4,Number(e)||30),rows:o?I(Math.round(o),1,400):0,columns:a?I(Math.round(a),1,400):0,lineWidth:p,lineHeight:l,baseAngle:M*Math.PI/180,mode:Ge.includes(F)?F:"orbit",shape:Ce[w]!==void 0?w:"line",color:jt,accent:xe??(w==="needle"?Dt("#f43f5e"):jt),accentMix:xe?1:0,rainbow:N,tone:I(Ze(jt),.42,.66),radius:Math.max(1,J),fade:I(Z,0,1),edgeFade:I(A,0,1),stretch:I(tt,0,2),reach:Math.max(0,V),scatter:I(it,0,1),inertia:I(pt,0,1),bounce:I(xt,0,1),ripple:I(X,0,1),clickPulse:Xt,intro:ke,idle:He,tiltX:I(qe,-70,70),tiltY:I(Ne,-70,70),maxRatio:I(We,.5,3)},Ct=mt.useRef(ve);return Ct.current=ve,mt.useEffect(()=>{$t.current?.()}),mt.useEffect(()=>{const _t=ue.current,R=he.current,Gt=me.current;if(!_t||!R||!Gt)return;const t=R.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"default"}),Bt=t?t.getExtension("KHR_parallel_shader_compile"):null,St=t?tn(t):null;let Ft=t&&St&&!Bt?Te(t,St):null;if(!t||!St||!Bt&&!Ft)return;const Tt=window.matchMedia("(prefers-reduced-motion: reduce)").matches,Kt=t.createVertexArray();t.bindVertexArray(Kt);const ye=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,ye),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0);const Jt=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,Jt),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,2,t.FLOAT,!1,0,0),t.vertexAttribDivisor(1,1);const Yt=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,Yt),t.enableVertexAttribArray(2),t.vertexAttribPointer(2,4,t.FLOAT,!1,0,0),t.vertexAttribDivisor(2,1),t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA);const h={width:1,height:1,pad:0,ratio:1,view:null,length:20,thickness:2,fill:!0,edgePad:1,minScale:1,maxScale:1,introSpeed:_e,bounds:[0,0,0,0],span:[0,0,0,0],key:""},d={x:0,y:0,vx:0,vy:0,time:0,seen:!1,inside:!1,away:0},E={x:0,y:0,heading:0},et=[];let vt=0,Et=new Float32Array(0),Qt=new Int32Array(0),Me=new Float32Array(0),Zt=new Float32Array(0),ge=new Float32Array(0),nt=new Float32Array(0),Lt=new Float32Array(0),yt=new Float32Array(0),Mt=new Float32Array(0),te=new Uint8Array(0),gt=new Float32Array(0),kt=-1,wt=Ct.current.intro&&!Tt&&de===0,ct=0,Pt=0,G=0,Ht=!0,qt=document.visibilityState!=="hidden",Ot=!1,Ut=!0;const we=s=>typeof s=="number"?s:(Gt.style.width=String(s),Gt.getBoundingClientRect().width),Ve=(s,i,c,x,B,L)=>{const y=s/x,T=i/B,P=L?nn(c,s,i,y,T):{fromColumn:0,toColumn:x-1,fromRow:0,toRow:B-1},S=c.forward,k=Vt(S,0,0),H=.49*Math.min(y,T),U=_=>{let O=0;if(!P)return O;for(let v=P.fromRow;v<=P.toRow;v++){const Y=(v+.5)*T-i/2;for(let q=P.fromColumn;q<=P.toColumn;q++){const K=(q+.5)*y-s/2,z=S[6]*K+S[7]*Y+S[8],st=(S[0]*K+S[1]*Y+S[2])/z,f=(S[3]*K+S[4]*Y+S[5])/z;if(L){if(z<=0||z>ce)continue;const b=H/z;if(st<-b||st>s+b||f<-b||f>i+b)continue}_&&_(O,q,v,K,Y,z,st,f),O+=1}}return O},lt=U(null),g=Math.min(lt,Wt);let W=null;if(lt>Wt){const _=new Float64Array(lt);U((v,Y,q,K,z,st)=>{_[v]=st});const O=an(_);W=new Int32Array(lt).fill(-1);for(let v=0;v<g;v++)W[O[v]]=v}const[bt,ft,ot,rt]=h.span,Q=new Int32Array(ot*rt);for(let _=0;_<vt;_++)Q[(Qt[_*2+1]-ft)*ot+Qt[_*2]-bt]=_+1;const D={centers:new Float32Array(g*2),cells:new Int32Array(g*2),reveal:new Float32Array(g),seeds:new Float32Array(g),rests:new Float32Array(g),angles:new Float32Array(g),speeds:new Float32Array(g),seenX:new Float32Array(g),seenY:new Float32Array(g),pending:new Uint8Array(g)};let n=0,ut=1/0,At=0;const $=[1/0,1/0,-1/0,-1/0],C=[1/0,1/0,-1/0,-1/0];U((_,O,v,Y,q,K,z,st)=>{const f=W?W[_]:_;if(f<0)return;const b=Math.hypot(z-k[0],st-k[1]);D.centers[f*2]=Y,D.centers[f*2+1]=q,D.cells[f*2]=O,D.cells[f*2+1]=v,D.reveal[f]=b,D.seeds[f]=Qe(O,v),n=Math.max(n,b),ut=Math.min(ut,K),At=Math.max(At,K),$[0]=Math.min($[0],Y),$[1]=Math.min($[1],q),$[2]=Math.max($[2],Y),$[3]=Math.max($[3],q),C[0]=Math.min(C[0],O),C[1]=Math.min(C[1],v),C[2]=Math.max(C[2],O),C[3]=Math.max(C[3],v);const j=O-bt,Rt=v-ft,ht=j>=0&&j<ot&&Rt>=0&&Rt<rt?Q[Rt*ot+j]-1:-1;if(ht<0){D.pending[f]=1;return}D.angles[f]=nt[ht],D.speeds[f]=Lt[ht],D.seenX[f]=yt[ht],D.seenY[f]=Mt[ht]}),vt=g,{centers:Et,cells:Qt,reveal:Me,seeds:ge,rests:Zt,angles:nt,speeds:Lt,seenX:yt,seenY:Mt,pending:te}=D,gt=new Float32Array(g*4),h.introSpeed=Math.max(_e,n/Ke),h.bounds=g?$:[0,0,0,0],h.span=g?[C[0],C[1],C[2]-C[0]+1,C[3]-C[1]+1]:[0,0,0,0],h.minScale=g?1/At:1,h.maxScale=g?1/ut:1,t.bindBuffer(t.ARRAY_BUFFER,Jt),t.bufferData(t.ARRAY_BUFFER,Et,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,Yt),t.bufferData(t.ARRAY_BUFFER,gt.byteLength||16,t.DYNAMIC_DRAW)},Xe=()=>{const s=oe(Ct.current),i=_t.getBoundingClientRect(),c=Math.max(1,i.width),x=Math.max(1,i.height),B=Math.max(1,we(s.lineHeight)),L=Math.max(.25,we(s.lineWidth)),y=!s.square,T=y&&(s.tiltX!==0||s.tiltY!==0),P=en(s.tiltX,s.tiltY,c,x,y),S=Math.min(window.devicePixelRatio||1,s.maxRatio);let k=Math.max(1,Math.round(s.columns||(s.rows?s.rows*c/x:c/s.spacing))),H=Math.max(1,Math.round(s.rows||(s.columns?s.columns*x/c:x/s.spacing)));if(k*H>Wt){const Q=Math.sqrt(k*H/Wt);k=Math.max(1,Math.floor(k/Q)),H=Math.max(1,Math.floor(H/Q))}const U=[y,k,H,c.toFixed(1),x.toFixed(1),T?`${s.tiltX},${s.tiltY}`:""].join("|");U!==h.key&&(h.key=U,Ve(c,x,P,k,H,T));const lt=y?h.minScale:P.minScale,g=y?h.maxScale:P.maxScale,W=y?0:Math.ceil((B*(1+s.stretch)+L*2)*Math.max(1,g)+8),bt=c+W*2,ft=x+W*2;R.style.left=`${-W}px`,R.style.top=`${-W}px`,R.style.width=`${bt}px`,R.style.height=`${ft}px`;const ot=Math.max(1,Math.round(bt*S)),rt=Math.max(1,Math.round(ft*S));(R.width!==ot||R.height!==rt)&&(R.width=ot,R.height=rt),Object.assign(h,{width:c,height:x,pad:W,ratio:S,view:P,length:B,thickness:L,fill:y,edgePad:2/(S*Math.max(.05,lt))})},$e=(s,i,c,x)=>{const B=c-Et[i*2],L=x-Et[i*2+1];if(s.mode==="dipole"){const T=Math.hypot(B,L)||1,P=-B/T,S=-L/T,k=Math.cos(E.heading),H=Math.sin(E.heading),U=k*P+H*S;return Math.atan2(3*U*S-H,3*U*P-k)}const y=Math.atan2(L,B);return s.mode==="attract"?y:s.mode==="spiral"?y+Math.PI/4:y+Math.PI/2},ee=s=>{if(ct=0,Ot)return;if(!Ft){if(!Bt||t.isContextLost())return;if(!t.getProgramParameter(St.program,Bt.COMPLETION_STATUS_KHR)){Pt=Math.max(Pt,s),Ht&&qt&&(ct=requestAnimationFrame(ee));return}if(Ft=Te(t,St),!Ft){Ot=!0;return}}const i=oe(Ct.current),c=I((s-Pt)/1e3||0,0,.05);Pt=Math.max(Pt,s),G+=c,Ut&&Xe(),Ut=!1;const x=i.shape==="line"?Math.PI:re,B=i.scatter*Math.PI*.5;for(let n=0;n<vt;n++)Zt[n]=i.baseAngle+Math.PI/2+ge[n]*B;const L=i.idle&&!Tt&&(!d.seen||d.away>1.2);d.seen&&!d.inside&&(d.away+=c);let y=d.seen?d.x:0,T=d.seen?d.y:0;if(L){const n=Math.min(h.width,h.height)*.32;y=Math.cos(G*.37)*n+Math.sin(G*.21)*n*.35,T=Math.sin(G*.53+1.3)*n*.8}const P=1-Math.exp(-c/(d.seen&&!L?.035:.6));if(E.x+=(y-E.x)*P,E.y+=(T-E.y)*P,Math.hypot(d.vx,d.vy)>40){const n=dt(Math.atan2(d.vy,d.vx)-E.heading,re);E.heading+=n*(1-Math.exp(-c/.25))}d.vx*=Math.exp(-c/.12),d.vy*=Math.exp(-c/.12),wt&&kt<0&&(kt=G);const k=wt?G-kt:1/0;let H=!1;const U=i.inertia<=0||Tt?0:Math.pow(6+42*Math.pow(1-i.inertia,2),2),lt=U?2*Math.sqrt(U)*(1-.75*i.bounce):0,g=U?Math.max(1,Math.ceil(c/(1/240))):0,W=g?c/g:0,bt=Tt?0:i.ripple/900,ft=i.radius,ot=i.reach*.55,rt=i.reach;for(let n=et.length-1;n>=0;n--)G-et[n].start>et[n].life&&et.splice(n,1);let Q=!1;for(let n=0;n<vt;n++){const ut=Et[n*2],At=Et[n*2+1],$=te[n]===1;if($)yt[n]=E.x,Mt[n]=E.y;else{const f=Math.hypot(E.x-ut,E.y-At),b=bt*f,j=b>0?1-Math.exp(-c/b):1;yt[n]+=(E.x-yt[n])*j,Mt[n]+=(E.y-Mt[n])*j,Math.abs(E.x-yt[n])+Math.abs(E.y-Mt[n])>.05&&(Q=!0)}const C=yt[n],_=Mt[n],O=Math.hypot(C-ut,_-At);let v=$e(i,n,C,_);const Y=Zt[n];if(rt>0){const f=I((rt-O)/Math.max(1,rt-ot),0,1);v=Y+dt(v-Y,x)*ie(f)}let q=1;if(wt){const f=(k-Me[n]/h.introSpeed)/Je,b=ie(I(f,0,1));f<1&&(H=!0),v=Y+dt(v-Y,x)*b,q=I(f*2.5,0,1)}if($)nt[n]=wt?Y:v,Lt[n]=0,te[n]=0;else if(!U)nt[n]=nt[n]+dt(v-nt[n],x),Lt[n]=0;else{let f=nt[n],b=Lt[n];for(let j=0;j<g;j++)b+=(U*dt(v-f,x)-lt*b)*W,f+=b*W;Math.abs(b)<.002&&Math.abs(dt(v-f,x))<5e-4?(f+=dt(v-f,x),b=0):Q=!0,(f>40||f<-40)&&(f=dt(f,re)),nt[n]=f,Lt[n]=b}let K=0,z=0;for(const f of et){const b=(G-f.start)*Nt,j=Math.hypot(ut-f.x,At-f.y),Rt=(b-j)/(Nt*se);Rt>0&&Rt<1&&(K+=ie(Rt)*x);const ht=(b-j-Nt*se*.5)/60;z+=Math.exp(-ht*ht)*Math.max(0,1-(G-f.start)/f.life)}const st=Math.exp(-(O*O)/(ft*ft))*q;gt[n*4]=nt[n]+K,gt[n*4+1]=st,gt[n*4+2]=Math.min(1,z*.9)*q,gt[n*4+3]=q}if(wt&&!H&&G-kt>.2&&(wt=!1),Math.abs(y-E.x)+Math.abs(T-E.y)>.05&&(Q=!0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,R.width,R.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),vt&&h.view){const n=Ft.uniforms;t.useProgram(Ft.program),t.uniformMatrix3fv(n.uView,!0,h.view.forward),t.uniform2f(n.uCanvas,h.width+h.pad*2,h.height+h.pad*2),t.uniform2f(n.uOffset,h.pad,h.pad),t.uniform2f(n.uLine,h.length/2,h.thickness/2),t.uniform1f(n.uStretch,i.stretch),t.uniform1f(n.uHead,i.shape==="needle"?.16:i.shape==="arrow"?.32:0),t.uniform1f(n.uPad,h.edgePad),t.uniform1f(n.uFar,h.fill?ce:1e6),t.uniform3fv(n.uColor,i.color),t.uniform3fv(n.uAccent,i.accent),t.uniform1f(n.uAccentMix,i.accentMix),t.uniform1f(n.uOpacity,1),t.uniform1f(n.uFade,i.fade),t.uniform1i(n.uShape,Ce[i.shape]),t.uniform1f(n.uRainbow,i.rainbow?1:0),t.uniform1f(n.uTone,i.tone),t.uniform1f(n.uPeriod,x),t.uniform2f(n.uPixels,R.width,R.height),t.uniform2f(n.uEdge,i.edgeFade*.34*h.width,i.edgeFade*.44*h.height),t.bindVertexArray(Kt),t.bindBuffer(t.ARRAY_BUFFER,Yt),t.bufferSubData(t.ARRAY_BUFFER,0,gt),t.drawArraysInstanced(t.TRIANGLE_STRIP,0,4,vt)}(Q||wt||et.length>0||L)&&Ht&&qt&&(ct=requestAnimationFrame(ee))},at=()=>{ct||Ot||!Ht||!qt||(Pt=performance.now(),ct=requestAnimationFrame(ee))};$t.current=()=>{Ut=!0,at()};const be=(s,i)=>{if(!h.view)return null;const c=_t.getBoundingClientRect(),[x,B,L]=Vt(h.view.inverse,s-c.left,i-c.top);if(L<=0)return null;const y=s>=c.left&&s<=c.right&&i>=c.top&&i<=c.bottom;return{x,y:B,inside:y}},ne=s=>{const i=be(s.clientX,s.clientY);if(!i)return;const c=performance.now(),x=Math.max(1,c-d.time)/1e3;d.seen&&x<.2&&(d.vx=d.vx*.6+(i.x-d.x)/x*.4,d.vy=d.vy*.6+(i.y-d.y)/x*.4),d.time=c,d.x=i.x,d.y=i.y,d.seen=!0,d.inside=i.inside,i.inside&&(d.away=0),at()},Ae=s=>{if(ne(s),!oe(Ct.current).clickPulse||Tt||!vt)return;const c=be(s.clientX,s.clientY);if(!c||!(h.fill?c.inside:Math.abs(c.x)<=h.width/2&&Math.abs(c.y)<=h.height/2))return;const[B,L,y,T]=h.bounds,P=Math.max(Math.hypot(c.x-B,c.y-L),Math.hypot(c.x-y,c.y-L),Math.hypot(c.x-B,c.y-T),Math.hypot(c.x-y,c.y-T));et.push({x:c.x,y:c.y,start:G,life:Math.min(6,P/Nt+se+.1)}),et.length>6&&et.shift(),at()},Re=()=>{d.inside=!1,at()};It(window).addEventListener("pointermove",ne,{passive:!0}),It(window).addEventListener("pointerdown",Ae,{passive:!0}),It(document.documentElement).addEventListener("pointerleave",Re);const Se=s=>{s.preventDefault(),Ot=!0,cancelAnimationFrame(ct),ct=0},Fe=()=>De(s=>s+1);R.addEventListener("webglcontextlost",Se),R.addEventListener("webglcontextrestored",Fe);const Ee=new ResizeObserver(()=>{Ut=!0,at()});Ee.observe(_t);const Le=()=>{Ut=!0,at()};window.addEventListener("resize",Le);const Pe=new IntersectionObserver(s=>{Ht=s.some(i=>i.isIntersecting),at()});Pe.observe(_t);const Ie=()=>{qt=document.visibilityState!=="hidden",at()};return document.addEventListener("visibilitychange",Ie),at(),()=>{cancelAnimationFrame(ct),$t.current=null,Ee.disconnect(),Pe.disconnect(),It(window).removeEventListener("pointermove",ne),It(window).removeEventListener("pointerdown",Ae),window.removeEventListener("resize",Le),It(document.documentElement).removeEventListener("pointerleave",Re),document.removeEventListener("visibilitychange",Ie),R.removeEventListener("webglcontextlost",Se),R.removeEventListener("webglcontextrestored",Fe),t.isContextLost()||(t.deleteBuffer(ye),t.deleteBuffer(Jt),t.deleteBuffer(Yt),t.deleteVertexArray(Kt),R.isConnected?Ot||Ye(t,Bt,St):t.getExtension("WEBGL_lose_context")?.loseContext())}},[de]),ae.jsxs("div",{ref:ue,className:`magnet-lines${zt?" magnet-lines--square":""}${le?` ${le}`:""}`,style:zt?{width:pe,...fe}:fe,children:[ae.jsx("canvas",{ref:he,className:"magnet-lines__canvas","aria-hidden":"true"}),ae.jsx("span",{ref:me,className:"magnet-lines__probe","aria-hidden":"true"})]})};export{ln as default};
