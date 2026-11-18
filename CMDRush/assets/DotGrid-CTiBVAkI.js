import{r as J,j as Wt}from"./index-uEvbEw5g.js";import{b as Q}from"./App-Dofw4Ib9.js";import{b as $t}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const de=`#version 300 es
precision highp float;

layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aMotion;
layout(location = 2) in vec2 aState;

uniform vec2 uResolution;
uniform float uSize;
uniform float uSwell;
uniform float uStretch;
uniform float uGlow;

out vec2 vLocal;
out vec2 vPoint;
out float vLength;
out float vRadius;
out float vEnergy;

void main() {
  float energy = aState.x;
  float radius = 0.5 * uSize * aState.y * (1.0 + uSwell * energy);
  float speed = length(aMotion.zw);
  float angle = speed > 0.001 ? atan(aMotion.w, aMotion.z) : 0.0;
  float axis = floor(angle / 1.5707963 + 0.5) * 1.5707963;
  angle = axis + (angle - axis) * smoothstep(8.0, 70.0, speed);
  vec2 dir = vec2(cos(angle), sin(angle));
  float halfLength = min(uSize * 2.0, speed * uStretch * 0.02);
  float pad = radius * (1.0 + uGlow * energy * 2.5) + 2.0;
  vec2 local = aCorner * vec2(halfLength + pad, pad);
  vec2 point = aMotion.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;
  vLocal = local;
  vPoint = point;
  vLength = halfLength;
  vRadius = radius;
  vEnergy = energy;
  vec2 clip = point / uResolution * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`,me=`#version 300 es
precision highp float;

in vec2 vLocal;
in vec2 vPoint;
in float vLength;
in float vRadius;
in float vEnergy;

uniform vec2 uResolution;
uniform vec3 uBase;
uniform vec3 uActive;
uniform float uGlow;
uniform float uOpacity;
uniform float uFade;
uniform int uShape;

out vec4 outColor;

float smootherstep01(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  float d;
  if (uShape == 1) {
    float corner = vRadius * 0.3;
    vec2 q = abs(vLocal) - vec2(vLength + vRadius, vRadius) + corner;
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;
  } else {
    d = length(vec2(max(abs(vLocal.x) - vLength, 0.0), vLocal.y)) - vRadius;
  }
  float aa = max(fwidth(d), 0.0001);
  float body = clamp(0.5 - d / aa, 0.0, 1.0);
  float halo = uGlow * vEnergy * 0.5 * exp(-max(d, 0.0) / max(vRadius * 1.3, 0.6));
  float alpha = body + (1.0 - body) * halo;
  vec3 color = mix(uBase, uActive, clamp(vEnergy * 1.2, 0.0, 1.0));
  float fade = 1.0;
  if (uFade > 0.0) {
    vec2 edge = min(vPoint, uResolution - vPoint) / (uFade * 0.4 * min(uResolution.x, uResolution.y));
    fade = smootherstep01(edge.x) * smootherstep01(edge.y);
  }
  alpha *= uOpacity * fade;
  outColor = vec4(color * alpha, alpha);
}
`,Kt=w=>{const m=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(w).trim());if(!m)return[1,1,1];const S=m[1].length===3?m[1].replace(/./g,A=>A+A):m[1];return[0,2,4].map(A=>parseInt(S.slice(A,A+2),16)/255)},wt=w=>{const m=Math.min(1,Math.max(0,w));return m*m*m*(m*(m*6-15)+10)},ve=w=>{const S=w-1;return 1+S*S*((1.9+1)*S+1.9)},Jt=(w,m,S)=>{const A=w.createShader(m);return w.shaderSource(A,S),w.compileShader(A),A},we=({dotSize:w=5,gap:m=18,baseColor:S="#3a3446",activeColor:A="#ffffff",proximity:At=140,strength:Qt=1,bounce:Zt=.6,tension:te=.4,returnDuration:ee=.8,shockRadius:ne=320,shockStrength:oe=5,swell:Mt=.8,stretch:bt=.5,glow:Rt=.5,shape:Ft="circle",fade:St=0,opacity:Et=1,intro:re=!0,mouseInteraction:Lt=!0,clickShock:ae=!0,paused:Bt=!1,dpr:ie,className:se="",style:ce})=>{const _t=J.useRef(null),rt=J.useRef(null),Ot={dotSize:w,gap:m,baseColor:S,activeColor:A,proximity:At,strength:Qt,bounce:Zt,tension:te,returnDuration:ee,shockRadius:ne,shockStrength:oe,swell:Mt,stretch:bt,glow:Rt,shape:Ft,fade:St,opacity:Et,intro:re,mouseInteraction:Lt,clickShock:ae,paused:Bt,dpr:ie},b=J.useRef(Ot);return b.current=Ot,J.useEffect(()=>{const E=_t.current;if(!E)return;const t=E.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!t)return;const G=t.createProgram();if(t.attachShader(G,Jt(t,t.VERTEX_SHADER,de)),t.attachShader(G,Jt(t,t.FRAGMENT_SHADER,me)),t.linkProgram(G),!t.getProgramParameter(G,t.LINK_STATUS))return;const R={};for(const o of["uResolution","uSize","uSwell","uStretch","uGlow","uBase","uActive","uOpacity","uFade","uShape"])R[o]=t.getUniformLocation(G,o);const mt=t.createVertexArray();t.bindVertexArray(mt);const Pt=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,Pt),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0);const at=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,at),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,4,t.FLOAT,!1,24,0),t.vertexAttribDivisor(1,1),t.enableVertexAttribArray(2),t.vertexAttribPointer(2,2,t.FLOAT,!1,24,16),t.vertexAttribDivisor(2,1),t.bindVertexArray(null);const Z=window.matchMedia("(prefers-reduced-motion: reduce)").matches,h={width:0,height:0,left:0,top:0,ratio:1},v={count:0,cols:1,rows:1,cell:1,centerX:0,centerY:0,reach:1};let O=new Float32Array(0),s=new Float32Array(0),c=new Float32Array(0),tt=new Float32Array(0),it=new Float32Array(0),y=new Float32Array(0),vt=new Float32Array(0),P=new Float32Array(0);const e={x:0,y:0,vx:0,vy:0,time:0,inside:!1,presence:0},q=[];let F=b.current.intro&&!Z?-1:null,st=!0,X=0,pt=0;const It=()=>{const{dotSize:o,gap:n}=b.current,r=Math.max(2,o+n),d=Math.max(1,Math.floor((h.width+n)/r)),M=Math.max(1,Math.floor((h.height+n)/r)),L=(h.width-(d*r-n))/2+o/2,g=(h.height-(M*r-n))/2+o/2,u=d*M;O=new Float32Array(u*2),s=new Float32Array(u*2),c=new Float32Array(u*2),tt=new Float32Array(u*2),it=new Float32Array(u*2),y=new Float32Array(u*4),vt=new Float32Array(u),P=new Float32Array(u*6);for(let x=0;x<M;x++)for(let f=0;f<d;f++){const B=(x*d+f)*2;O[B]=L+f*r,O[B+1]=g+x*r}Object.assign(v,{count:u,cols:d,rows:M,cell:r,centerX:h.width/2,centerY:h.height/2,reach:Math.hypot(h.width,h.height)/2}),t.bindBuffer(t.ARRAY_BUFFER,at),t.bufferData(t.ARRAY_BUFFER,P.byteLength,t.DYNAMIC_DRAW)},Tt=()=>{const o=E.getBoundingClientRect(),n=Math.min(b.current.dpr??window.devicePixelRatio??1,2),r=Math.max(1,Math.round(o.width)),d=Math.max(1,Math.round(o.height));Object.assign(h,{width:r,height:d,left:o.left,top:o.top,ratio:n}),E.width=Math.round(r*n),E.height=Math.round(d*n),It(),ct(performance.now())},le=(o,n)=>{const r=$t(b.current),d=Z?0:1,M=1-.85*Math.min(1,Math.max(0,r.bounce)),L=4/(M*Math.max(.2,r.returnDuration)),g=L*L,u=2*M*L,x=Math.max(1,r.proximity),f=Math.hypot(e.vx,e.vy),B=r.mouseInteraction&&e.inside?6500*Math.tanh(f/900)*r.strength*d:0,lt=f>.001?e.vx/f:0,ut=f>.001?e.vy/f:0,T=v.cell*1.4,et=650,D=q.map(l=>{const i=(n-l.start)/1e3*et,p=wt(1-i/Math.max(1,r.shockRadius));return{...l,front:i,amplitude:p*r.shockStrength*v.cell*.24*d}}),_=(Math.max(0,r.tension)*900)**2/(v.cell*v.cell),j=Math.sqrt(_)*.06,fe=Math.sqrt(g+8*_)+u+8*j,Gt=Math.min(24,Math.max(1,Math.ceil(o/Math.min(1/120,1.2/fe)))),yt=o/Gt;for(let l=0;l<v.count;l++){const i=l*2,p=O[i],a=O[i+1];let W=0,$=0;if(B>0){const Y=p+s[i]-e.x,nt=a+s[i+1]-e.y,z=Math.hypot(Y,nt);if(z<x){const H=wt(1-z/x)*B,K=z>.001?Y/z:0,ot=z>.001?nt/z:0;W+=H*(lt+K*.6),$+=H*(ut+ot*.6)}}let V=0,N=0,U=0,k=0;for(const Y of D){if(Y.amplitude<=0)continue;const nt=p-Y.x,z=a-Y.y,H=Math.hypot(nt,z),K=(H-Y.front)/T;if(Math.abs(K)<3&&H>.001){const ot=nt/H,gt=z/H,jt=Math.exp(-K*K),dt=Y.amplitude*jt,Ht=Y.amplitude*2*K*jt/T*et;V+=ot*dt,N+=gt*dt,U+=ot*Ht,k+=gt*Ht,W+=ot*dt*g*.35,$+=gt*dt*g*.35}}tt[i]=W,tt[i+1]=$;const ht=l*4;y[ht]=V,y[ht+1]=N,y[ht+2]=U,y[ht+3]=k}const{cols:ft,rows:qt}=v,C=ft*2;for(let l=0;l<Gt;l++){for(let i=0;i<qt;i++)for(let p=0;p<ft;p++){const a=(i*ft+p)*2;let W=tt[a]-g*s[a]-u*c[a],$=tt[a+1]-g*s[a+1]-u*c[a+1];if(_>0){let V=-4*s[a],N=-4*s[a+1],U=-4*c[a],k=-4*c[a+1];p>0&&(V+=s[a-2],N+=s[a-1],U+=c[a-2],k+=c[a-1]),p<ft-1&&(V+=s[a+2],N+=s[a+3],U+=c[a+2],k+=c[a+3]),i>0&&(V+=s[a-C],N+=s[a-C+1],U+=c[a-C],k+=c[a-C+1]),i<qt-1&&(V+=s[a+C],N+=s[a+C+1],U+=c[a+C],k+=c[a+C+1]),W+=_*V+j*U,$+=_*N+j*k}it[a]=c[a]+W*yt,it[a+1]=c[a+1]+$*yt}for(let i=0;i<s.length;i++)c[i]=it[i],s[i]+=c[i]*yt}for(let l=0;l<v.count;l++){const i=l*2,p=l*4;vt[l]=Math.min(1,Math.hypot(c[i]+y[p+2],c[i+1]+y[p+3])/380*.85+Math.hypot(s[i]+y[p],s[i+1]+y[p+1])/(v.cell*2.2)*.35)}for(let l=q.length-1;l>=0;l--)D[l].front>r.shockRadius+T*3&&q.splice(l,1);const Xt=1-Math.exp(-o/.08);e.vx-=e.vx*Xt,e.vy-=e.vy*Xt;const he=r.mouseInteraction&&e.inside?1:0;e.presence+=(he-e.presence)*(1-Math.exp(-o/.2))},ct=o=>{const n=$t(b.current),r=Math.max(1,n.proximity),M=(F===null?1/0:F<0?0:(o-F)/1e3)*v.reach*1.25,L=v.cell*4;for(let x=0;x<v.count;x++){const f=x*2,B=x*4,lt=O[f]+s[f]+y[B],ut=O[f+1]+s[f+1]+y[B+1];let T=vt[x];if(e.presence>.001){const _=Math.hypot(lt-e.x,ut-e.y);_<r&&(T=Math.max(T,wt(1-_/r)*.4*e.presence))}let et=1;if(F!==null){const _=Math.hypot(O[f]-v.centerX,O[f+1]-v.centerY),j=Math.min(1,Math.max(0,(M-_)/L));et=j>=1?1:Math.max(0,ve(j)),T=Math.max(T,Math.sin(j*Math.PI)*.6)}const D=x*6;P[D]=lt,P[D+1]=ut,P[D+2]=c[f]+y[B+2],P[D+3]=c[f+1]+y[B+3],P[D+4]=T,P[D+5]=et}const g=Kt(n.baseColor),u=Kt(n.activeColor);t.viewport(0,0,E.width,E.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA),t.useProgram(G),t.uniform2f(R.uResolution,h.width,h.height),t.uniform1f(R.uSize,Math.max(.5,n.dotSize)),t.uniform1f(R.uSwell,Z?0:Math.max(0,n.swell)),t.uniform1f(R.uStretch,Z?0:Math.max(0,n.stretch)),t.uniform1f(R.uGlow,Math.max(0,n.glow)),t.uniform3f(R.uBase,g[0],g[1],g[2]),t.uniform3f(R.uActive,u[0],u[1],u[2]),t.uniform1f(R.uOpacity,Math.min(1,Math.max(0,n.opacity))),t.uniform1f(R.uFade,Math.min(1,Math.max(0,n.fade))),t.uniform1i(R.uShape,n.shape==="square"?1:0),t.bindVertexArray(mt),t.bindBuffer(t.ARRAY_BUFFER,at),t.bufferSubData(t.ARRAY_BUFFER,0,P),t.drawArraysInstanced(t.TRIANGLE_STRIP,0,4,v.count),t.bindVertexArray(null)},ue=o=>{if(q.length)return!1;if(F!==null){if(F<0||(o-F)/1e3<1.6)return!1;F=null}if(Math.abs(e.vx)+Math.abs(e.vy)>1)return!1;const n=b.current.mouseInteraction&&e.inside?1:0;if(Math.abs(n-e.presence)>.002)return!1;for(let r=0;r<s.length;r++)if(Math.abs(s[r])>.02||Math.abs(c[r])>.5)return!1;return!0},Dt=o=>{if(X=0,b.current.paused||!st)return;F!==null&&F<0&&(F=o);const n=Math.min(.05,(o-pt)/1e3||0);pt=o,le(n,o),ct(o),ue(o)||(X=requestAnimationFrame(Dt))},I=()=>{X||b.current.paused||!st||(pt=performance.now(),X=requestAnimationFrame(Dt))},Yt=o=>{const n=E.getBoundingClientRect();return h.left=n.left,h.top=n.top,[o.clientX-n.left,o.clientY-n.top]},zt=o=>{if(!b.current.mouseInteraction)return;const[n,r]=Yt(o),d=n>=0&&r>=0&&n<=h.width&&r<=h.height,M=o.timeStamp||performance.now();if(d&&e.inside&&e.time){const L=Math.max(4,M-e.time)/1e3,g=(n-e.x)/L,u=(r-e.y)/L;e.vx+=(g-e.vx)*.6,e.vy+=(u-e.vy)*.6}else e.vx=0,e.vy=0;e.x=n,e.y=r,e.time=M,(d!==e.inside||d)&&(e.inside=d,I())},xt=()=>{e.inside=!1,e.time=0,I()},Ct=o=>{o.relatedTarget||xt()},Vt=o=>{if(!b.current.clickShock||Z)return;const[n,r]=Yt(o);n<0||r<0||n>h.width||r>h.height||(q.push({x:n,y:r,start:performance.now()}),q.length>6&&q.shift(),I())};Q(window).addEventListener("pointermove",zt,{passive:!0}),Q(window).addEventListener("pointerdown",Vt,{passive:!0}),Q(window).addEventListener("pointerout",Ct),window.addEventListener("blur",xt);const Nt=new ResizeObserver(()=>{Tt(),I()});Nt.observe(E);const Ut=new IntersectionObserver(([o])=>{st=o.isIntersecting,st&&I()});Ut.observe(E);const kt=()=>{document.hidden?(cancelAnimationFrame(X),X=0):I()};return document.addEventListener("visibilitychange",kt),Tt(),I(),rt.current={rebuild:()=>{It(),ct(performance.now()),I()},refresh:()=>{ct(performance.now()),I()}},()=>{cancelAnimationFrame(X),Nt.disconnect(),Ut.disconnect(),Q(window).removeEventListener("pointermove",zt),Q(window).removeEventListener("pointerdown",Vt),Q(window).removeEventListener("pointerout",Ct),window.removeEventListener("blur",xt),document.removeEventListener("visibilitychange",kt),t.deleteBuffer(Pt),t.deleteBuffer(at),t.deleteVertexArray(mt),t.deleteProgram(G),rt.current=null}},[]),J.useEffect(()=>{rt.current?.rebuild()},[w,m]),J.useEffect(()=>{rt.current?.refresh()},[S,A,Mt,bt,Rt,Ft,St,Et,Bt,At,Lt]),Wt.jsx("div",{className:`dot-grid ${se}`.trim(),style:ce,children:Wt.jsx("canvas",{ref:_t,className:"dot-grid__canvas"})})};export{we as default};
