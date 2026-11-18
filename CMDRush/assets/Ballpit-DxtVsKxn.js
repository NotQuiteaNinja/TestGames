import{r as Mt,j as De}from"./index-uEvbEw5g.js";import{b as ot}from"./App-Dofw4Ib9.js";import{b as Nt}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Xe=50,gt=20,ve=1.5,At=16,Dt=12,je=.01,qe={satin:{roughness:.42,metalness:0,coat:.35,coatRoughness:.22,scatter:1,frost:0},matte:{roughness:.92,metalness:0,coat:0,coatRoughness:.5,scatter:.5,frost:0},gloss:{roughness:.2,metalness:0,coat:1,coatRoughness:.08,scatter:1,frost:0},frosted:{roughness:.55,metalness:0,coat:.6,coatRoughness:.18,scatter:1.5,frost:1},metal:{roughness:.3,metalness:1,coat:0,coatRoughness:.2,scatter:0,frost:0}},Ro=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aSphere;
layout(location = 2) in vec4 aColor;
layout(location = 3) in vec4 aShade;
uniform mat4 uProj;
uniform float uCameraZ;
uniform float uPixel;
out vec3 vPoint;
flat out vec3 vCenter;
flat out float vRadius;
flat out vec4 vColor;
flat out vec4 vShade;
void main() {
  vec3 c = vec3(aSphere.xy, aSphere.z - uCameraZ);
  float r = aSphere.w;
  float d = length(c);
  vec3 toCamera = -c / d;
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), toCamera));
  vec3 up = cross(toCamera, right);
  float reach = r * d / sqrt(max(d * d - r * r, 1e-4)) + uPixel * d * 2.0;
  vec3 p = c + (right * aCorner.x + up * aCorner.y) * reach;
  vPoint = p;
  vCenter = c;
  vRadius = r;
  vColor = aColor;
  vShade = aShade;
  gl_Position = uProj * vec4(p, 1.0);
}`,zo=`#version 300 es
precision highp float;
in vec3 vPoint;
flat in vec3 vCenter;
flat in float vRadius;
flat in vec4 vColor;
flat in vec4 vShade;
uniform mat4 uProj;
uniform vec3 uLightPos;
uniform vec3 uLight;
uniform float uExposure;
uniform float uShadow;
uniform vec4 uSurface;
uniform vec2 uExtra;
out vec4 outColor;

const float PI = 3.14159265;

float lobe(vec3 d, vec3 axis, float sharp) {
  return pow(max(dot(d, axis), 0.0), sharp) * (sharp + 1.0) * 0.16;
}

vec3 studio(vec3 d, float rough) {
  float r = clamp(rough, 0.0, 1.0);
  float sharp = mix(60.0, 1.2, sqrt(r));
  vec3 col = mix(vec3(0.085, 0.085, 0.09), vec3(0.38, 0.38, 0.39), smoothstep(-0.7, 0.9, d.y));
  col += vec3(1.0, 0.99, 0.97) * 2.6 * lobe(d, normalize(vec3(-0.42, 0.78, 0.47)), sharp);
  col += vec3(0.97, 0.98, 1.0) * 1.1 * lobe(d, normalize(vec3(0.78, 0.22, 0.58)), sharp * 0.7);
  col += vec3(1.0) * 1.3 * lobe(d, normalize(vec3(0.15, 0.55, -0.82)), sharp * 0.8);
  return col;
}

vec2 envBRDF(float NoV, float rough) {
  vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
  vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
  vec4 r = rough * c0 + c1;
  float a = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
  return vec2(-1.04, 1.04) * a + r.zw;
}

float ggx(float NoH, float a) {
  float a2 = a * a;
  float d = NoH * NoH * (a2 - 1.0) + 1.0;
  return a2 / (PI * d * d);
}

float smith(float NoV, float NoL, float a) {
  float k = a * 0.5;
  return 0.25 / max((NoV * (1.0 - k) + k) * (NoL * (1.0 - k) + k), 1e-4);
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec3 rd = normalize(vPoint);
  float b = dot(vCenter, rd);
  float h = length(vCenter - rd * b);
  float r = vRadius;
  float aa = max(fwidth(h), 1e-5);
  float cover = clamp((r - h) / aa + 0.5, 0.0, 1.0);
  if (cover <= 0.002) discard;
  float hc = min(h, r * 0.9995);
  float t = b - sqrt(r * r - hc * hc);
  vec3 pos = rd * t;
  vec3 n = normalize(pos - vCenter);
  vec4 clip = uProj * vec4(pos, 1.0);
  gl_FragDepth = clamp(clip.z / clip.w * 0.5 + 0.5, 0.0, 1.0);

  vec3 v = -rd;
  vec3 albedo = vColor.rgb;
  bool lamp = vColor.a > 0.5;
  vec3 dn = fwidth(n);
  float rough = sqrt(min(uSurface.x * uSurface.x + dot(dn, dn) * 0.6, 1.0));
  float metal = uSurface.y;
  float coat = uSurface.z;
  float coatRough = sqrt(min(uSurface.w * uSurface.w + dot(dn, dn) * 0.6, 1.0));
  float NoV = clamp(dot(n, v), 1e-4, 1.0);
  vec3 R = reflect(-v, n);

  float occlusion = vShade.w * smoothstep(-0.15, 0.9, dot(n, vShade.xyz));
  float ao = 1.0 - uShadow * occlusion;
  float specAo = 1.0 - uShadow * occlusion * 0.7;

  vec3 L = uLightPos - pos;
  float dist2 = dot(L, L);
  L *= inversesqrt(dist2);
  vec3 radiance = lamp ? vec3(0.0) : uLight / (dist2 + 1.0);
  float NoL = clamp(dot(n, L), 0.0, 1.0);
  vec3 H = normalize(L + v);
  float NoH = clamp(dot(n, H), 0.0, 1.0);
  float VoH = clamp(dot(v, H), 0.0, 1.0);

  vec3 F0 = mix(vec3(0.04), albedo, metal);
  vec2 ab = envBRDF(NoV, rough);
  vec3 Fr = max(vec3(1.0 - rough), F0) - F0;
  vec3 kS = F0 + Fr * pow(1.0 - NoV, 5.0);
  vec3 diffuseColor = albedo * (1.0 - metal);
  vec3 irradiance = studio(n, 1.0) * 1.15;
  vec3 envSpec = studio(R, rough) * (F0 * ab.x + ab.y);
  vec3 col = diffuseColor * irradiance * (1.0 - kS) * ao + envSpec * specAo;
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - VoH, 5.0);
  float a = max(rough * rough, 0.06);
  vec3 spec = ggx(NoH, a) * smith(NoV, NoL, a) * F;
  float wrap = clamp((dot(n, L) + 0.3) / 1.3, 0.0, 1.0);
  col += (diffuseColor * (1.0 - F) / PI * wrap + spec * NoL) * radiance;
  vec3 sh = normalize(L + n * 0.1);
  float scatter = pow(clamp(dot(v, -sh), 0.0, 1.0), 2.0) * 10.0 + 0.04;
  col += scatter * albedo * radiance * 0.03 * uExtra.x;
  float alpha = 1.0;
  if (uExtra.y > 0.5) {
    float rim = pow(1.0 - NoV, 2.5);
    col += albedo * (studio(-R, 1.0) * 0.35 + 0.06) * (1.0 - rim);
    col += radiance * albedo * pow(max(dot(-v, L), 0.0), 3.0) * 0.08;
    alpha = mix(0.5, 0.96, rim);
  }
  if (coat > 0.0) {
    float Fc = 0.04 + 0.96 * pow(1.0 - NoV, 5.0);
    float ca = max(coatRough * coatRough, 0.03);
    vec3 coatEnv = studio(R, coatRough) * Fc;
    float coatSpec = ggx(NoH, ca) * smith(NoV, NoL, ca) * (0.04 + 0.96 * pow(1.0 - VoH, 5.0)) * NoL;
    col = col * (1.0 - Fc * coat) + (coatEnv * specAo + radiance * coatSpec) * coat;
    alpha = mix(alpha, 1.0, Fc * coat);
  }
  if (lamp) col += uLight * 0.0025 * (0.4 + 0.6 * albedo);
  col = aces(col * uExposure);
  col = pow(col, vec3(1.0 / 2.2));
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  float a2 = alpha * cover;
  outColor = vec4(col * a2, a2);
}`,O=(v,T,H)=>Math.min(H,Math.max(T,v)),Oe=(v,T,H)=>{const b=v.createShader(T);return b?(v.shaderSource(b,H),v.compileShader(b),v.getShaderParameter(b,v.COMPILE_STATUS)?b:(v.deleteShader(b),null)):null},So=v=>{const T=Oe(v,v.VERTEX_SHADER,Ro),H=Oe(v,v.FRAGMENT_SHADER,zo),b=v.createProgram();if(!T||!H||!b)return null;if(v.attachShader(b,T),v.attachShader(b,H),v.linkProgram(b),v.deleteShader(T),v.deleteShader(H),!v.getProgramParameter(b,v.LINK_STATUS))return v.deleteProgram(b),null;const it={},se=v.getProgramParameter(b,v.ACTIVE_UNIFORMS);for(let Vt=0;Vt<se;Vt++){const Bt=v.getActiveUniform(b,Vt);Bt&&(it[Bt.name]=v.getUniformLocation(b,Bt.name))}return{program:b,uniforms:it}},We=v=>{let T;if(typeof v=="number")T=[(v>>16&255)/255,(v>>8&255)/255,(v&255)/255];else{let H=String(v||"#ffffff").replace("#","").trim();(H.length===3||H.length===4)&&(H=H.slice(0,3).split("").map(it=>it+it).join(""));const b=parseInt(H.slice(0,6),16);T=Number.isNaN(b)?[1,1,1]:[(b>>16&255)/255,(b>>8&255)/255,(b&255)/255]}return T.map(H=>Math.pow(H,2.2))},Co=({count:v=200,colors:T=["#ffffff"],material:H="satin",minSize:b=.5,maxSize:it=1,gravity:se=.5,friction:Vt=.9975,wallBounce:Bt=.95,bounce:Ze=.85,depth:Ge=2,drift:$e=0,followCursor:Ke=!0,cursorSize:Qe=1,grab:Je=!0,clickEffect:to="burst",lightColor:eo="#ffffff",lightIntensity:ie=1,exposure:oo=1,shadows:no=.6,intro:ao=!0,dpr:ro,className:co="",style:so})=>{const we=Mt.useRef(null),ye=Mt.useRef(null),le=Mt.useRef(null),Me=Mt.useRef(0),ge={count:Math.round(O(v,1,4e3)),colors:Array.isArray(T)&&T.length?T:["#ffffff"],material:qe[H]?H:"satin",minSize:Math.max(.05,Math.min(b,it)),maxSize:Math.max(.05,Math.max(b,it)),gravity:se,friction:O(Vt,.5,1),wallBounce:O(Bt,0,1),bounce:O(Ze,0,1),depth:Math.max(0,Ge),drift:Math.max(0,$e),followCursor:Ke,cursorSize:Math.max(0,Qe),grab:Je,clickEffect:to,lightColor:eo,lightIntensity:ie>20?ie/200:Math.max(0,ie),exposure:Math.max(0,oo),shadows:O(no,0,1),intro:ao,dpr:ro},lt=Mt.useRef(ge);return lt.current=ge,Mt.useEffect(()=>{window.clearTimeout(Me.current);const xt=we.current,pt=ye.current,c=pt?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!0,stencil:!1,powerPreference:"high-performance"});if(!xt||!pt||!c)return;const Xt=So(c);if(!Xt)return;const nt=Xt.uniforms,jt=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,f={width:1,height:1,ratio:1,halfW:9,halfH:9,fit:1,tan:Math.tan(Xe*Math.PI/360)},vt=new Float32Array(16),fe=c.createVertexArray();c.bindVertexArray(fe);const Ae=c.createBuffer();c.bindBuffer(c.ARRAY_BUFFER,Ae),c.bufferData(c.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),c.STATIC_DRAW),c.enableVertexAttribArray(0),c.vertexAttribPointer(0,2,c.FLOAT,!1,0,0);const qt=c.createBuffer();c.bindBuffer(c.ARRAY_BUFFER,qt);for(let t=0;t<3;t++)c.enableVertexAttribArray(1+t),c.vertexAttribPointer(1+t,4,c.FLOAT,!1,Dt*4,t*16),c.vertexAttribDivisor(1+t,1);c.bindVertexArray(null);let he=0,R=0,L=new Float32Array(0),F=new Float32Array(0),E=new Float32Array(0),y=new Float32Array(0),M=new Float32Array(0),z=new Float32Array(0),V=new Float32Array(0),bt=new Float32Array(0),Ht=new Float32Array(0),Ot=new Float32Array(0),X=new Float32Array(0),ft=new Float32Array(0),_t=new Uint16Array(0),at=new Uint8Array(0),Wt=new Int32Array(0),de=new Int32Array(0),rt=new Int32Array(1),g=new Float32Array(Dt),ht=new Int32Array(2),ue=new Int32Array(2),Zt=[],be="",Re="";const io=t=>{const o=(e,s=1)=>{const u=new Float32Array(t*s);return u.set(e.subarray(0,Math.min(e.length,u.length))),u},a=e=>{const s=new Uint8Array(t);return s.set(e.subarray(0,Math.min(e.length,s.length))),s};L=o(L),F=o(F),E=o(E),y=o(y),M=o(M),z=o(z),V=o(V),bt=o(bt),Ht=o(Ht),Ot=o(Ot),X=o(X,4),ft=o(ft,3);const n=new Uint16Array(t);n.set(_t.subarray(0,Math.min(_t.length,t))),_t=n,at=a(at),Wt=new Int32Array(t),de=new Int32Array(t),rt=new Int32Array(t+1),g=new Float32Array((t+1)*Dt),he=t,c.bindBuffer(c.ARRAY_BUFFER,qt),c.bufferData(c.ARRAY_BUFFER,g.byteLength,c.DYNAMIC_DRAW)},C={inside:!1,down:!1,downX:0,downY:0,downAt:0,moved:!1},d={x:0,y:0,z:0,r:0,tx:0,ty:0,vx:0,vy:0},N={x:0,y:5,z:6,flash:0},m={index:-1,ox:0,oy:0,tx:0,ty:0,vx:0,vy:0};let Gt=0,Tt=0,kt=0,$t=0,Kt=!0,Qt=0;const lo=(t,o,a)=>{const n=V[t],e=Math.max(o.depth-n,0);if(at[t]=1,a&&o.gravity>.05)L[t]=(Math.random()*2-1)*Math.max(f.halfW-n,.01),F[t]=f.halfH+n+Math.random()*f.halfH*2.2,E[t]=(Math.random()*2-1)*e,y[t]=(Math.random()-.5)*2,M[t]=-(4+Math.random()*5),z[t]=0,at[t]=0;else if(a){const s=(Math.random()*2-1)*Math.max(f.halfW-n,.01),u=(Math.random()*2-1)*Math.max(f.halfH-n,.01),h=(Math.random()*2-1)*e;L[t]=(Math.random()*2-1)*.6,F[t]=(Math.random()*2-1)*.6,E[t]=(Math.random()*2-1)*Math.min(e,.3),y[t]=(s-L[t])*2.2,M[t]=(u-F[t])*2.2,z[t]=(h-E[t])*2.2,Tt=1}else L[t]=(Math.random()*2-1)*Math.max(f.halfW-n,.01),F[t]=(Math.random()*2-1)*Math.max(f.halfH-n,.01),E[t]=(Math.random()*2-1)*e,y[t]=0,M[t]=0,z[t]=0},fo=t=>{for(let o=0;o<R;o++)V[o]=(t.minSize+Ht[o]*(t.maxSize-t.minSize))*f.fit,bt[o]=1/(V[o]*V[o]*V[o])},ho=t=>{Zt=t.colors.map(We),be=t.colors.join("|")},ze=(t,o)=>{const a=`${t.minSize}:${t.maxSize}:${f.fit}`;if(t.count!==R){t.count>he&&io(Math.max(t.count,Math.ceil(he*1.5)));const n=R;R=t.count;for(let e=n;e<R;e++)Ht[e]=Math.random(),_t[e]=e,Ot[e]=Math.random()*Math.PI*2,V[e]=(t.minSize+Ht[e]*(t.maxSize-t.minSize))*f.fit,bt[e]=1/(V[e]*V[e]*V[e]),lo(e,t,(o?t.intro:!0)&&!jt);for(let e=0;e<=R;e++)rt[e]=e}a!==Re&&(Re=a,fo(t)),t.colors.join("|")!==be&&ho(t)};let dt=0,W=0,Rt=new Int32Array(0),zt=new Float32Array(0),Jt=new Float64Array(0),te=new Float32Array(0);const S={scale:1,x0:0,y0:0,z0:0,nx:1,ny:1,nz:1},uo=(t,o)=>{S.scale=1/t,S.x0=-f.halfW-t,S.y0=-f.halfH-t,S.z0=-Math.max(o.depth,o.maxSize)-t,S.nx=Math.max(1,Math.ceil((f.halfW*2+t*2)*S.scale)+1),S.ny=Math.max(1,Math.ceil((f.halfH*2+t*2)*S.scale)+1),S.nz=Math.max(1,Math.ceil((Math.max(o.depth,o.maxSize)*2+t*2)*S.scale)+1);const a=S.nx*S.ny*S.nz;ht.length<a+1&&(ht=new Int32Array(a+1),ue=new Int32Array(a+1)),ht.fill(0,0,a+1);for(let n=0;n<R;n++){const e=O(Math.floor((L[n]-S.x0)*S.scale),0,S.nx-1),s=O(Math.floor((F[n]-S.y0)*S.scale),0,S.ny-1),h=(O(Math.floor((E[n]-S.z0)*S.scale),0,S.nz-1)*S.ny+s)*S.nx+e;Wt[n]=h,ht[h+1]++}for(let n=1;n<=a;n++)ht[n]+=ht[n-1];ue.set(ht.subarray(0,a+1));for(let n=0;n<R;n++)de[ue[Wt[n]]++]=n},St=(t,o,a,n,e,s,u,h)=>{if(o>=u||W>=dt)return;const r=y[t]*a+M[t]*n+z[t]*e,l=W,w=Math.fround(o);Rt[l*2]=t,Rt[l*2+1]=-2,zt[l*3]=a,zt[l*3+1]=n,zt[l*3+2]=e,Jt[l]=w>0?-w/h:Math.fround(r<-1.5?-s*r:0),te[l]=0,W++},mo=(t,o,a,n)=>{const e=m.index,{nx:s,ny:u,nz:h}=S,r=L,l=F,w=E,P=y,k=M,U=z,p=V,i=X,A=Wt,I=ht,j=de,Y=Rt,Z=zt,G=Jt,$=te,J=dt,K=t.bounce;W=0;for(let x=0;x<R;x++){const tt=A[x],_=tt%s,ct=Math.floor(tt/s)%u,st=Math.floor(tt/(s*u)),Q=r[x],oe=l[x],ne=w[x],pe=p[x],Ao=_>0?_-1:_,bo=_<s-1?_+2:_+1;for(let q=st>0?-1:0;q<=(st<h-1?1:0);q++)for(let et=ct>0?-1:0;et<=(ct<u-1?1:0);et++){const Ft=((st+q)*u+ct+et)*s,Yt=I[Ft+bo];for(let wt=I[Ft+Ao];wt<Yt;wt++){const B=j[wt];if(B<=x)continue;const Et=r[B]-Q,Lt=l[B]-oe,Pt=w[B]-ne,Ct=Et*Et+Lt*Lt+Pt*Pt,D=pe+p[B],Ut=Math.max(D+n,a?D*1.4:0);if(Ct>=Ut*Ut||Ct<1e-12)continue;const It=Math.sqrt(Ct),ae=Et/It,re=Lt/It,ce=Pt/It;if(a){const mt=O(1-(It-D)/(D*.4),0,1);i[x*4]+=ae*mt,i[x*4+1]+=re*mt,i[x*4+2]+=ce*mt,i[x*4+3]+=mt,i[B*4]-=ae*mt,i[B*4+1]-=re*mt,i[B*4+2]-=ce*mt,i[B*4+3]+=mt}if(It>=D+n||W>=J||x===e&&B===e)continue;const Ye=(P[B]-P[x])*ae+(k[B]-k[x])*re+(U[B]-U[x])*ce,yt=W,Ue=Math.fround(It-D);Y[yt*2]=x,Y[yt*2+1]=B,Z[yt*3]=ae,Z[yt*3+1]=re,Z[yt*3+2]=ce,G[yt]=Ue>0?-Ue/o:Math.fround(Ye<-1.5?-K*Ye:0),$[yt]=0,W++}}if(x!==e){const q=pe,et=Math.max(t.depth-q,0);St(x,Q+f.halfW-q,1,0,0,t.wallBounce,n,o),St(x,f.halfW-q-Q,-1,0,0,t.wallBounce,n,o),St(x,oe+f.halfH-q,0,1,0,t.wallBounce,n,o),at[x]&&St(x,f.halfH-q-oe,0,-1,0,t.wallBounce,n,o),St(x,ne+et,0,0,1,t.wallBounce,n,o),St(x,et-ne,0,0,-1,t.wallBounce,n,o)}if(d.r>.01&&x!==e&&W<J){const q=Q-d.x,et=oe-d.y,Ft=ne-d.z,Yt=pe+d.r,wt=q*q+et*et+Ft*Ft;if(wt<(Yt+n)*(Yt+n)&&wt>1e-12){const B=Math.sqrt(wt),Et=q/B,Lt=et/B,Pt=Ft/B,Ct=(P[x]-d.vx)*Et+(k[x]-d.vy)*Lt+U[x]*Pt,D=W,Ut=Math.fround(B-Yt);Y[D*2]=x,Y[D*2+1]=-1,Z[D*3]=Et,Z[D*3+1]=Lt,Z[D*3+2]=Pt,G[D]=Ut>0?-Ut/o:Math.fround(Ct<-1.5?-K*Ct:0),$[D]=0,W++}}}},xo=()=>{const t=m.index,o=R>800?5:8,a=y,n=M,e=z,s=bt,u=Rt,h=zt,r=Jt,l=te,w=W,P=d.vx,k=d.vy;for(let U=0;U<o;U++)for(let p=0;p<w;p++){const i=u[p*2],A=u[p*2+1],I=h[p*3],j=h[p*3+1],Y=h[p*3+2],Z=r[p],G=l[p];if(A<0){const ct=A===-1?(a[i]-P)*I+(n[i]-k)*j+e[i]*Y:a[i]*I+n[i]*j+e[i]*Y,st=Math.max(G+Z-ct,0),Q=st-G;l[p]=st,a[i]+=Q*I,n[i]+=Q*j,e[i]+=Q*Y;continue}const $=i===t?0:s[i],J=A===t?0:s[A],K=$+J;if(K<=0)continue;const x=(a[A]-a[i])*I+(n[A]-n[i])*j+(e[A]-e[i])*Y,tt=Math.max(G+(Z-x)/K,0),_=tt-G;l[p]=tt,a[i]-=_*$*I,n[i]-=_*$*j,e[i]-=_*$*Y,a[A]+=_*J*I,n[A]+=_*J*j,e[A]+=_*J*Y}},po=()=>{const t=m.index,o=L,a=F,n=E,e=V,s=bt,u=Rt,h=W,r=d.x,l=d.y,w=d.z,P=d.r;for(let k=0;k<2;k++)for(let U=0;U<h;U++){const p=u[U*2],i=u[U*2+1];if(i===-2)continue;if(i<0){const x=o[p]-r,tt=a[p]-l,_=n[p]-w,ct=Math.sqrt(x*x+tt*tt+_*_),st=e[p]+P-ct-je;if(st<=0||ct<1e-6)continue;const Q=st*.5/ct;o[p]+=x*Q,a[p]+=tt*Q,n[p]+=_*Q;continue}const A=o[i]-o[p],I=a[i]-a[p],j=n[i]-n[p],Y=Math.sqrt(A*A+I*I+j*j),Z=e[p]+e[i]-Y-je;if(Z<=0||Y<1e-6)continue;const G=p===t?0:s[p],$=i===t?0:s[i],J=G+$;if(J<=0)continue;const K=Z*.3/(Y*J);o[p]-=A*K*G,a[p]-=I*K*G,n[p]-=j*K*G,o[i]+=A*K*$,a[i]+=I*K*$,n[i]+=j*K*$}},vo=t=>{const o=f.halfW,a=f.halfH,n=t.wallBounce;for(let e=0;e<R;e++){const s=V[e];L[e]<-o+s?(L[e]=-o+s,y[e]<0&&(y[e]=y[e]<-1.5?-y[e]*n:0)):L[e]>o-s&&(L[e]=o-s,y[e]>0&&(y[e]=y[e]>1.5?-y[e]*n:0)),F[e]<-a+s?(F[e]=-a+s,M[e]<0&&(M[e]=M[e]<-1.5?-M[e]*n:0),y[e]*=.995,z[e]*=.995):at[e]&&F[e]>a-s&&(F[e]=a-s,M[e]>0&&(M[e]=M[e]>1.5?-M[e]*n:0)),!at[e]&&F[e]<a-s&&(at[e]=1);const u=Math.max(t.depth-s,0);E[e]<-u?(E[e]=-u,z[e]<0&&(z[e]=z[e]<-1.5?-z[e]*n:0)):E[e]>u&&(E[e]=u,z[e]>0&&(z[e]=z[e]>1.5?-z[e]*n:0))}},wo=(t,o,a)=>{const n=t.gravity*45,e=Math.pow(t.friction,o*60)*(Tt>0?Math.exp(-2.2*o):1),s=jt?0:t.drift*2.2,u=t.maxSize*f.fit,h=u*.3;dt<R*12&&(dt=R*12,Rt=new Int32Array(dt*2),zt=new Float32Array(dt*3),Jt=new Float64Array(dt),te=new Float32Array(dt));for(let r=0;r<R;r++){if(r===m.index){const w=1-Math.exp(-o/.02);y[r]=(m.tx-L[r])*w/o,M[r]=(m.ty-F[r])*w/o,z[r]=0;continue}if(M[r]-=n*o,s){const w=Ot[r];y[r]+=Math.sin(Gt*.63+w)*s*o,M[r]+=Math.cos(Gt*.47+w*1.7)*s*o,z[r]+=Math.sin(Gt*.41+w*2.3)*s*o*.5}y[r]*=e,M[r]*=e,z[r]*=e;const l=y[r]*y[r]+M[r]*M[r]+z[r]*z[r];if(l>At*At){const w=At/Math.sqrt(l);y[r]*=w,M[r]*=w,z[r]*=w}}uo(u*(a?2.8:2.3),t),a&&X.fill(0,0,R*4),mo(t,o,a,h),xo();for(let r=0;r<R;r++)L[r]+=y[r]*o,F[r]+=M[r]*o,E[r]+=z[r]*o;if(po(),vo(t),a)for(let r=0;r<R;r++){const l=F[r]-V[r]+f.halfH,w=V[r]*.5;if(l>=w)continue;const P=1-Math.max(l,0)/w;X[r*4+1]-=P,X[r*4+3]+=P}if(m.index>=0){const r=m.index;m.vx+=(y[r]-m.vx)*(1-Math.exp(-o/.05)),m.vy+=(M[r]-m.vy)*(1-Math.exp(-o/.05))}},Se=(t,o)=>{const a=xt.getBoundingClientRect(),n=(t-a.left)/Math.max(a.width,1)*2-1,e=1-(o-a.top)/Math.max(a.height,1)*2;return[n*f.tan*(f.width/f.height),e*f.tan,-1]},ee=(t,o)=>{const a=(o-gt)/t[2];return[t[0]*a,t[1]*a]},yo=t=>{const o=Math.hypot(t[0],t[1],t[2]),a=t[0]/o,n=t[1]/o,e=t[2]/o;let s=-1,u=1/0;for(let h=0;h<R;h++){const r=-L[h],l=-F[h],w=gt-E[h],P=r*a+l*n+w*e,k=V[h]*1.15,U=r*r+l*l+w*w-k*k,p=P*P-U;if(p<0)continue;const i=-P-Math.sqrt(p);i>0&&i<u&&(u=i,s=h)}return s},Mo=(t,o)=>{const a=Nt(lt.current),n=f.halfH*.7;for(let e=0;e<R;e++){const s=L[e]-t,u=F[e]-o,h=E[e],r=Math.hypot(s,u,h);if(r>=n||r<1e-4)continue;const l=Math.pow(1-r/n,2)*26*(1+.6/(V[e]+.4));y[e]+=s/r*l,M[e]+=u/r*l+l*.25,z[e]+=h/r*l*.5}N.x=t,N.y=o,N.z=Math.max(a.depth,1)+1.5,N.flash=1};let Fe=lt.current.dpr;const me=()=>{const t=Nt(lt.current);Fe=t.dpr,f.width=Math.max(1,xt.clientWidth),f.height=Math.max(1,xt.clientHeight),f.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),pt.width=Math.max(1,Math.round(f.width*f.ratio)),pt.height=Math.max(1,Math.round(f.height*f.ratio));const o=f.width/f.height,a=Math.tan(Xe*Math.PI/360);f.tan=o>ve?a*ve/o:a,f.halfH=f.tan*gt,f.halfW=f.halfH*o,f.fit=O(Math.sqrt(f.halfW*f.halfH/(a*a*gt*gt*ve)),.4,1);const n=1/f.tan,e=1,s=80;vt.fill(0),vt[0]=n/o,vt[5]=n,vt[10]=(s+e)/(e-s),vt[11]=-1,vt[14]=2*s*e/(e-s),R||ze(t,!0),Ee(),ut()},Ee=()=>{const t=Nt(lt.current),o=qe[t.material];let a=0;const n=R+1;for(let u=1;u<n;u++){const h=rt[u],r=h===R?d.z:E[h];let l=u-1;for(;l>=0&&(rt[l]===R?d.z:E[rt[l]])>r;)rt[l+1]=rt[l],l--;rt[l+1]=h}for(let u=0;u<n;u++){const h=rt[u],r=a*Dt;if(h===R){if(d.r<.01||!t.followCursor)continue;const l=Zt[0]||[1,1,1];g[r]=d.x,g[r+1]=d.y,g[r+2]=d.z,g[r+3]=d.r,g[r+4]=l[0],g[r+5]=l[1],g[r+6]=l[2],g[r+7]=1,g[r+8]=0,g[r+9]=0,g[r+10]=0,g[r+11]=0}else{const l=Zt[_t[h]%Zt.length];g[r]=L[h],g[r+1]=F[h],g[r+2]=E[h],g[r+3]=V[h],g[r+4]=l[0],g[r+5]=l[1],g[r+6]=l[2],g[r+7]=0;const w=X[h*4+3],P=Math.hypot(X[h*4],X[h*4+1],X[h*4+2])||1;g[r+8]=X[h*4]/P,g[r+9]=X[h*4+1]/P,g[r+10]=X[h*4+2]/P,g[r+11]=Math.min(w*.55,1)}a++}if(c.viewport(0,0,pt.width,pt.height),c.clearColor(0,0,0,0),c.clearDepth(1),c.clear(c.COLOR_BUFFER_BIT|c.DEPTH_BUFFER_BIT),!a)return;c.enable(c.DEPTH_TEST),c.depthFunc(c.LEQUAL),c.enable(c.BLEND),c.blendFunc(c.ONE,c.ONE_MINUS_SRC_ALPHA),c.useProgram(Xt.program),c.uniformMatrix4fv(nt.uProj,!1,vt),c.uniform1f(nt.uCameraZ,gt),c.uniform1f(nt.uPixel,2*f.tan/pt.height);const e=We(t.lightColor),s=t.lightIntensity*60*(1+N.flash*3);c.uniform3f(nt.uLight,e[0]*s,e[1]*s,e[2]*s),c.uniform3f(nt.uLightPos,N.x,N.y,N.z-gt),c.uniform1f(nt.uExposure,t.exposure),c.uniform1f(nt.uShadow,t.shadows),c.uniform4f(nt.uSurface,o.roughness,o.metalness,o.coat,o.coatRoughness),c.uniform2f(nt.uExtra,o.scatter,o.frost),c.bindBuffer(c.ARRAY_BUFFER,qt),c.bufferSubData(c.ARRAY_BUFFER,0,g,0,a*Dt),c.bindVertexArray(fe),c.drawArraysInstanced(c.TRIANGLE_STRIP,0,4,a),c.bindVertexArray(null)},Le=t=>{if(kt=0,!Kt||document.hidden)return;const o=Nt(lt.current);o.dpr!==Fe&&me();const a=$t?O((t-$t)/1e3,0,1/20):1/60;$t=t,Gt+=a,Tt=Math.max(0,Tt-a),ze(o,!1);const n=o.followCursor&&C.inside&&m.index<0?o.cursorSize*f.fit:0;d.r+=(n-d.r)*(1-Math.exp(-a/.12));const e=1-Math.exp(-a/.06),s=d.x,u=d.y;d.x+=(d.tx-d.x)*e,d.y+=(d.ty-d.y)*e,d.vx=O((d.x-s)/Math.max(a,.001),-At,At),d.vy=O((d.y-u)/Math.max(a,.001),-At,At);const h=0,r=f.halfH*.75,l=o.depth+4,w=C.inside?[d.x,d.y,o.followCursor?d.z:1.5]:N.flash>.05?[N.x,N.y,N.z]:[h,r,l],P=1-Math.exp(-a/.08);if(N.x+=(w[0]-N.x)*P,N.y+=(w[1]-N.y)*P,N.z+=(w[2]-N.z)*P,N.flash*=Math.exp(-a/.3),a>1e-4){const i=Math.min(6,Math.max(1,Math.ceil(a/.005555555555555556))),A=a/i;for(let I=0;I<i;I++)wo(o,A,I===i-1)}Ee();let k=0;for(let i=0;i<R;i++){const A=i*3,I=Math.abs(L[i]-ft[A])+Math.abs(F[i]-ft[A+1])+Math.abs(E[i]-ft[A+2]);I>k&&(k=I),ft[A]=L[i],ft[A+1]=F[i],ft[A+2]=E[i]}Qt=k/Math.max(a,.001)>.6||C.inside||m.index>=0||N.flash>.01||Tt>0||d.r>.01||o.drift>0&&!jt?0:Qt+a,Qt<.8&&(kt=requestAnimationFrame(Le))};function ut(){Qt=0,!kt&&Kt&&!document.hidden&&($t=0,kt=requestAnimationFrame(Le))}const xe=t=>{const o=xt.getBoundingClientRect(),a=t.clientX-o.left,n=t.clientY-o.top;return a>=0&&n>=0&&a<=o.width&&n<=o.height},Pe=t=>{const o=Se(t.clientX,t.clientY),[a,n]=ee(o,d.z);if(d.tx=a,d.ty=n,m.index>=0){const[e,s]=ee(o,E[m.index]);m.tx=e-m.ox,m.ty=s-m.oy}return o},Ce=t=>{const o=C.inside;C.inside=xe(t)||m.index>=0,C.inside&&(Pe(t),o||(d.x=d.tx,d.y=d.ty),C.down&&Math.hypot(t.clientX-C.downX,t.clientY-C.downY)>6&&(C.moved=!0)),(C.inside||o)&&ut()},go=t=>t instanceof Element&&t.closest('a, button, input, textarea, select, label, [role="button"]'),Ie=t=>{if(t.button!==0||!xe(t)||go(t.target))return;const o=Nt(lt.current);C.down=!0,C.moved=!1,C.downX=t.clientX,C.downY=t.clientY,C.downAt=performance.now();const a=Pe(t);if(o.grab){const n=yo(a);if(n>=0){const[e,s]=ee(a,E[n]);m.index=n,m.ox=e-L[n],m.oy=s-F[n],m.tx=L[n],m.ty=F[n],m.vx=0,m.vy=0,t.pointerType==="mouse"&&t.preventDefault()}}ut()},Ne=t=>{const o=Nt(lt.current);if(m.index>=0){const a=m.index,n=Math.hypot(m.vx,m.vy),e=n>22?22/n:1;y[a]=m.vx*e,M[a]=m.vy*e,m.index=-1,at[a]=1}else if(t&&C.down&&!C.moved&&performance.now()-C.downAt<400&&o.clickEffect==="burst"&&!jt&&xe(t)){const[a,n]=ee(Se(t.clientX,t.clientY),0);Mo(a,n)}C.down=!1,ut()},Ve=t=>Ne(t),Be=()=>Ne(null),He=()=>{C.inside=m.index>=0,ut()},_e=()=>ut(),Te=new ResizeObserver(me);Te.observe(xt);const ke=new IntersectionObserver(t=>{Kt=t.some(o=>o.isIntersecting),Kt&&ut()});return ke.observe(xt),ot(window).addEventListener("pointermove",Ce,{passive:!0}),ot(window).addEventListener("pointerdown",Ie),ot(window).addEventListener("pointerup",Ve,{passive:!0}),ot(window).addEventListener("pointercancel",Be,{passive:!0}),ot(document.documentElement).addEventListener("pointerleave",He),document.addEventListener("visibilitychange",_e),me(),le.current=ut,()=>{cancelAnimationFrame(kt),le.current=null,Te.disconnect(),ke.disconnect(),ot(window).removeEventListener("pointermove",Ce),ot(window).removeEventListener("pointerdown",Ie),ot(window).removeEventListener("pointerup",Ve),ot(window).removeEventListener("pointercancel",Be),ot(document.documentElement).removeEventListener("pointerleave",He),document.removeEventListener("visibilitychange",_e),c.deleteBuffer(Ae),c.deleteBuffer(qt),c.deleteVertexArray(fe),c.deleteProgram(Xt.program),Me.current=window.setTimeout(()=>c.getExtension("WEBGL_lose_context")?.loseContext(),0)}},[]),Mt.useEffect(()=>{le.current?.()}),De.jsx("div",{ref:we,className:co,style:{position:"relative",width:"100%",height:"100%",overflow:"hidden",...so},children:De.jsx("canvas",{ref:ye,style:{display:"block",width:"100%",height:"100%"},"aria-hidden":"true"})})};export{Co as default};
