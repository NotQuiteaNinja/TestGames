import{r as J,j as nt}from"./index-uEvbEw5g.js";import{b as _}from"./App-Dofw4Ib9.js";import{b as P}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const ot="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789",rt="ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace",Dt=["#ffffff","#61dca3"],kt=["#18181b","#0f9f6e"],_e=8,It=1.4,Ut=.2,Xt=.1,Bt=48,Ot=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Gt=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uAtlas;
uniform sampler2D uState;
uniform ivec2 uCell;
uniform ivec2 uGrid;
uniform int uAtlasColumns;
uniform vec2 uResolution;
uniform vec2 uOrigin;
uniform vec3 uBase;
uniform float uBaseOpacity;
uniform vec3 uColors[8];
uniform float uEdge;
uniform float uCenter;
uniform vec2 uPointer;
uniform float uRadius;
uniform float uPresence;
uniform float uReveal;
uniform float uTime;
uniform float uFlow;
uniform float uFlowScale;
uniform vec4 uBackground;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) - uOrigin;
  ivec2 q = ivec2(floor(frag));
  ivec2 cell = q / uCell;
  vec4 color = vec4(0.0);
  if (all(greaterThanEqual(q, ivec2(0))) && all(lessThan(cell, uGrid))) {
    vec4 state = texelFetch(uState, cell, 0);
    int glyph = int(state.r * 255.0 + 0.5);
    ivec2 texel = ivec2(glyph % uAtlasColumns, glyph / uAtlasColumns) * uCell + (q - cell * uCell);
    float coverage = texelFetch(uAtlas, texel, 0).a;
    if (coverage > 0.0) {
      vec2 center = vec2(cell * uCell) + vec2(uCell) * 0.5 + uOrigin;
      float mask = 1.0;
      if (uEdge > 0.0) {
        vec2 edge = min(center, uResolution - center) / uEdge;
        mask = smoother(edge.x) * smoother(edge.y);
      }
      if (uCenter > 0.0) {
        vec2 room = max(abs(center - uResolution * 0.5) - uResolution * vec2(0.3, 0.24), 0.0);
        float soft = min(uResolution.x, uResolution.y) * 0.24;
        mask *= 1.0 - uCenter * (1.0 - smoother(length(room) / soft));
      }
      float seed = hash(vec2(cell) + 17.0);
      float rest = state.g * uBaseOpacity * (0.8 + 0.2 * sin(uTime * (0.5 + 1.2 * seed) + seed * 40.0));
      if (uFlow > 0.0) {
        vec2 p = center / uFlowScale;
        float n = 0.65 * noise(p + vec2(uTime * 0.05, uTime * 0.03)) + 0.35 * noise(p * 2.03 - vec2(uTime * 0.04, -uTime * 0.06));
        rest *= mix(1.0, 0.1 + 1.7 * smoothstep(0.25, 0.8, n), uFlow);
      }
      if (uPresence > 0.0) {
        float d = length(center - uPointer) / uRadius;
        float f = clamp(1.0 - d * d, 0.0, 1.0);
        rest = mix(rest, max(rest, uReveal * step(0.004, state.g)), f * f * uPresence);
      }
      float heat = state.b;
      rest = min(rest, 1.0) * (1.0 - heat);
      vec3 tint = uColors[int(state.a * 255.0 + 0.5)];
      float weight = coverage * mask;
      color = vec4((uBase * rest + tint * heat) * weight, (rest + heat) * weight);
    }
  }
  outColor = color + uBackground * (1.0 - color.a);
}`,S=(f,E,L)=>Math.min(L,Math.max(E,f)),Wt=f=>{const E=S(f,0,1);return E*E*E*(E*(E*6-15)+10)},at=(f,E,L)=>{const M=f.createShader(E);return M?(f.shaderSource(M,L),f.compileShader(M),f.getShaderParameter(M,f.COMPILE_STATUS)?M:(f.deleteShader(M),null)):null},Ht=f=>{const E=at(f,f.VERTEX_SHADER,Ot),L=at(f,f.FRAGMENT_SHADER,Gt),M=f.createProgram();if(!E||!L||!M)return null;if(f.attachShader(M,E),f.attachShader(M,L),f.linkProgram(M),f.deleteShader(E),f.deleteShader(L),!f.getProgramParameter(M,f.LINK_STATUS))return f.deleteProgram(M),null;const re={},Me=f.getProgramParameter(M,f.ACTIVE_UNIFORMS);for(let Z=0;Z<Me;Z++){const ae=f.getActiveUniform(M,Z);if(!ae)continue;const se=ae.name.replace(/\[0\]$/,"");re[se]=f.getUniformLocation(M,se)}return{program:M,uniforms:re}},$t=({glitchColors:f,baseColor:E,characters:L=ot,fontFamily:M=rt,fontSize:re=14,spacing:Me=.6,density:Z=.9,baseOpacity:ae=.16,glitchAmount:se=.5,speed:st=1,smooth:ct=!0,interactive:it=!0,cursorRadius:lt=140,clickEffect:ut="tear",flow:ft=.5,edgeFade:ht=0,centerFade:mt=0,intro:dt=!0,lightMode:Pe=!1,backgroundColor:pt,dpr:gt,className:Le="",style:Mt,...xt})=>{const De=J.useRef(null),ke=J.useRef(null),xe=J.useRef(null),Ie={colors:((Array.isArray(f)&&f.length?f:null)||(Pe?kt:Dt)).slice(0,_e),baseColor:E||(Pe?"#18181b":"#ffffff"),characters:L||ot,fontFamily:M||rt,fontSize:S(re,6,96),spacing:S(Me,0,2),density:S(Z,0,1),baseOpacity:S(ae,0,1),glitchAmount:S(se,0,1),speed:Math.max(0,st),smooth:ct,interactive:it,cursorRadius:Math.max(0,lt),clickEffect:ut,flow:S(ft,0,1),edgeFade:S(ht,0,.5),centerFade:S(mt,0,1),intro:dt,backgroundColor:pt,dpr:gt},T=J.useRef(Ie);return T.current=Ie,J.useEffect(()=>{const G=De.current,y=ke.current,o=y?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!G||!y||!o)return;const ce=Ht(o);if(!ce)return;const d=ce.uniforms,Ue=o.createVertexArray(),Xe=()=>{const t=o.createTexture();return o.bindTexture(o.TEXTURE_2D,t),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),t},ve=Xe(),we=Xe(),vt=o.getParameter(o.MAX_TEXTURE_SIZE),ie=document.createElement("canvas"),D=ie.getContext("2d"),W=document.createElement("canvas").getContext("2d",{willReadFrequently:!0});if(!D)return;const Be=new Map,ye=t=>{const n=String(t),e=Be.get(n);if(e)return e;let a=[1,1,1];if(W){W.clearRect(0,0,1,1),W.fillStyle="#ffffff",W.fillStyle=n,W.fillRect(0,0,1,1);const[i,s,l]=W.getImageData(0,0,1,1).data;a=[i/255,s/255,l/255]}return Be.set(n,a),a},U=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,x={width:1,height:1,ratio:1},r={cols:0,rows:0,cellW:0,cellH:0,originX:0,originY:0,atlasColumns:1},c={x:0,y:0,sx:0,sy:0,inside:!1,presence:0,stir:0,fresh:!0},X=[],le=new Float32Array(_e*3),Oe=new Set;let Q=[0],ue="",Ge="",fe=1,A=0,w=new Uint8Array(0),H=new Float32Array(0),N=new Float32Array(0),I=new Float32Array(0),ee=new Float32Array(0),te=new Float32Array(0),q=new Float32Array(0),he=new Float32Array(0),Ee=new Float32Array(0),z=new Float32Array(0),B=new Int32Array(0),Y=new Int32Array(0),V=0,me=T.current.intro&&!U,We=0,He=0,Te=-1,Re=0,Ae=0,be=0,F=!0,ne=0,$=0,de=!0,Ne=!0;const oe=()=>Q[Math.random()*Q.length|0],O=()=>Math.random()*fe|0,Ce=(t,n=1)=>he[t]<T.current.density?Math.round(Ee[t]*255*n):0,pe=(t,n)=>{const e=Math.floor((t-r.originX)/r.cellW),a=Math.floor((n-r.originY)/r.cellH);return e<0||a<0||e>=r.cols||a>=r.rows?-1:a*r.cols+e},j=(t,n,e,a,i,s=0)=>{if(B[t]<0){B[t]=V,Y[V++]=t,H[t]=0,I[t]=e,N[t]=n,ee[t]=a,te[t]=0,q[t]=s,w[t*4+3]=i;return}H[t]<.15&&(w[t*4+3]=i),N[t]=I[t]>0?Math.max(N[t],n):n,I[t]=Math.max(I[t],e),ee[t]=Math.max(ee[t],a),q[t]=Math.min(q[t],s)},wt=t=>{const n=Y[t],e=Y[--V];Y[t]=e,B[e]=t,B[n]=-1,H[n]=0,w[n*4+2]=0},yt=()=>{const t=P(T.current),n=t.fontSize*x.ratio,e=`${n}px ${t.fontFamily}`,a=Array.from(t.characters),i=Array.from(new Set(a)).slice(0,256);D.font=e;let s=1;i.forEach(v=>{s=Math.max(s,D.measureText(v).width)});const l=D.measureText("M"),p=Math.max(2,Math.ceil(s+n*t.spacing)),R=Math.max(2,Math.ceil(n*(.95+t.spacing))),u=Math.max(1,Math.min(i.length,Math.floor(vt/p)));ie.width=u*p,ie.height=Math.ceil(i.length/u)*R,D.font=e,D.textAlign="center",D.textBaseline="alphabetic",D.fillStyle="#ffffff";const m=R/2+(l.actualBoundingBoxAscent-l.actualBoundingBoxDescent)/2;i.forEach((v,K)=>{D.fillText(v,K%u*p+p/2,Math.floor(K/u)*R+m)}),o.bindTexture(o.TEXTURE_2D,ve),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,ie);const h=new Map(i.map((v,K)=>[v,K])),g=a.map(v=>h.get(v)).filter(v=>v!==void 0),b=g.length!==Q.length||g.some((v,K)=>v!==Q[K]);Q=g.length?g:[0];const C=p!==r.cellW||R!==r.cellH;return r.cellW=p,r.cellH=R,r.atlasColumns=u,!Oe.has(e)&&document.fonts?.load&&(Oe.add(e),document.fonts.load(e,t.characters).then(()=>{Ne&&(ue="",k())}).catch(()=>{})),{resized:C,charsChanged:b}},Et=(t,n,e,a)=>{const i=(t+.5)/e-.5,s=(n+.5)/a-.5,l=Math.min(1,Math.hypot(i,s*.8)*1.6);return It*(.3*l+.7*Math.random()**1.3)},qe=()=>{const t=Math.ceil(y.width/r.cellW)+1,n=Math.ceil(y.height/r.cellH)+1;if(r.originX=Math.floor((y.width-t*r.cellW)/2),r.originY=Math.floor((y.height-n*r.cellH)/2),t===r.cols&&n===r.rows)return;const e=t*n,a=new Uint8Array(e*4),i=new Float32Array(e),s=new Float32Array(e),l=new Float32Array(e),p=Math.floor((r.cols-t)/2),R=Math.floor((r.rows-n)/2);for(let u=0;u<n;u++)for(let m=0;m<t;m++){const h=u*t+m,g=m+p,b=u+R;if(g>=0&&b>=0&&g<r.cols&&b<r.rows){const C=b*r.cols+g;a[h*4]=w[C*4],a[h*4+1]=w[C*4+1],i[h]=he[C],s[h]=Ee[C],l[h]=z[C]}else a[h*4]=oe(),i[h]=Math.random(),s[h]=.55+.45*Math.random(),l[h]=me?Et(m,u,t,n):-1}r.cols=t,r.rows=n,A=e,w=a,he=i,Ee=s,z=l,H=new Float32Array(e),N=new Float32Array(e),I=new Float32Array(e),ee=new Float32Array(e),te=new Float32Array(e),q=new Float32Array(e),B=new Int32Array(e).fill(-1),Y=new Int32Array(e),V=0,X.length=0;for(let u=0;u<e;u++)w[u*4+1]=z[u]>=0?0:Ce(u);Te=T.current.density,o.bindTexture(o.TEXTURE_2D,we),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,t,n,0,o.RGBA,o.UNSIGNED_BYTE,w),F=!1},ze=()=>{const t=P(T.current),n=`${t.fontSize*x.ratio}|${t.fontFamily}|${t.spacing}|${t.characters}`;if(n===ue)return;ue=n;const{resized:e,charsChanged:a}=yt();if((e||!r.cols)&&qe(),a){for(let i=0;i<A;i++)w[i*4]=oe();F=!0}},Tt=()=>{const t=P(T.current),n=t.colors.join(",");if(n!==Ge){Ge=n,fe=Math.max(1,t.colors.length);for(let e=0;e<_e;e++){const a=ye(t.colors[Math.min(e,fe-1)]??"#ffffff");le[e*3]=a[0],le[e*3+1]=a[1],le[e*3+2]=a[2]}for(let e=0;e<A;e++)w[e*4+3]>=fe&&(w[e*4+3]=O());F=!0}},Fe=t=>{X.length<Bt&&X.push({carry:0,after:0,wiggle:0,branch:0,...t})},Rt=(t,n)=>{const e=pe(t,n);if(e<0)return;const a=Math.floor(e/r.cols),i=r.cols*r.cellW;for(let s=-2;s<=2;s++){const l=a+s;if(l<0||l>=r.rows)continue;const p=1-Math.abs(s)/3;if(s!==0&&Math.random()>.3+.6*p)continue;const R=O(),u=r.originY+(l+.5)*r.cellH,m=(Math.random()-.5)*6*r.cellW*(1-p);[0,Math.PI].forEach(h=>{const g=i*(.12+.5*p*(.4+.6*Math.random()));Fe({x:t+m,y:u,angle:h,life:g,span:g,speed:(2200+Math.random()*1200)*x.ratio,after:Math.abs(s)*.035+Math.random()*.03,color:R})})}},At=(t,n)=>{const e=Math.min(x.width,x.height)*x.ratio,a=5+(Math.random()*3|0),i=Math.random()*Math.PI*2;for(let s=0;s<a;s++){const l=e*(.25+Math.random()*.3);Fe({x:t,y:n,angle:i+s/a*Math.PI*2+(Math.random()-.5)*.4,life:l,span:l,speed:(700+Math.random()*400)*x.ratio,wiggle:.2,branch:.03,color:O()})}},bt=(t,n)=>{const e=pe(t,n);e<0||(j(e,1,.08,.8,O()),T.current.clickEffect==="burst"?At(t,n):Rt(t,n))},Ct=t=>{for(let n=X.length-1;n>=0;n--){const e=X[n];if(e.after>0){e.after-=t;continue}const a=Math.max(1,Math.abs(Math.cos(e.angle))*r.cellW+Math.abs(Math.sin(e.angle))*r.cellH*.6);for(e.carry+=e.speed*t;e.carry>=a&&e.life>0;){e.carry-=a,e.life-=a,e.angle+=(Math.random()-.5)*e.wiggle,e.x+=Math.cos(e.angle)*a,e.y+=Math.sin(e.angle)*a;const i=pe(e.x,e.y);if(i<0){e.life=0;break}const s=e.life/e.span;if(j(i,.5+.5*s,.03+Math.random()*.05,.5+.5*s,e.color),e.branch&&Math.random()<e.branch){const l=Math.random()<.5?-1:1,p=e.life*(.45+Math.random()*.3);Fe({x:e.x,y:e.y,angle:e.angle+l*(.5+Math.random()*.5),life:p,span:e.span,speed:e.speed,wiggle:e.wiggle,color:e.color})}}e.life<=0&&X.splice(n,1)}},Ft=t=>{const n=P(T.current);if(U||n.speed<=0||!A)return;Re+=A*Ut*n.speed*t;let e=Math.min(A,Re|0);for(Re-=e;e-- >0;){const s=Math.random()*A|0;B[s]<0&&(w[s*4]=oe(),F=!0)}const a=Math.max(n.speed,.2);Ae+=A*n.glitchAmount**1.6*Xt*n.speed*t;let i=Math.min(A,Ae|0);for(Ae-=i;i-- >0;){const s=Math.random()*A|0,l=O(),p=.45+.55*Math.random(),R=(.04+Math.random()*.26)/a,u=(.45+Math.random()*.6)/a,m=Math.random();if(m<.24){const h=s%r.cols,g=m<.015,b=Math.min(r.cols-h,g?10+(Math.random()*24|0):2+(Math.random()*7|0)),C=(g?.012:.028)/a;for(let v=0;v<b;v++)j(s+v,p,R,u,l,v*C)}else j(s,p,R,u,l)}},St=t=>{const n=P(T.current);if(c.presence<.02||U||!A)return;const e=n.cursorRadius*x.ratio;if(e<1)return;const a=Math.max(0,Math.floor((c.sx-e-r.originX)/r.cellW)),i=Math.min(r.cols-1,Math.floor((c.sx+e-r.originX)/r.cellW)),s=Math.max(0,Math.floor((c.sy-e-r.originY)/r.cellH)),l=Math.min(r.rows-1,Math.floor((c.sy+e-r.originY)/r.cellH)),p=c.presence*(3+9*c.stir)*t;for(let m=s;m<=l;m++){const h=(r.originY+(m+.5)*r.cellH-c.sy)/e;for(let g=a;g<=i;g++){const b=(r.originX+(g+.5)*r.cellW-c.sx)/e,C=b*b+h*h;if(C>=1)continue;const v=m*r.cols+g;B[v]<0&&Math.random()<(1-C)*(1-C)*p&&(w[v*4]=oe(),F=!0)}}const R=Math.PI*e*e/(r.cellW*r.cellH);be+=R*c.presence*(.15+4*c.stir)*t;let u=Math.min(512,be|0);for(be-=u;u-- >0;){const m=Math.random()*Math.PI*2,h=Math.sqrt(Math.random()),g=(1-h*h)**2;if(Math.random()>g)continue;const b=pe(c.sx+Math.cos(m)*h*e,c.sy+Math.sin(m)*h*e);b<0||j(b,(.3+.7*Math.random())*(.45+.55*c.stir),.02+Math.random()*.08,.35+Math.random()*.4,O())}},_t=t=>{const n=P(T.current),e=Math.max(n.speed,.5),a=1-Math.exp(-t/.05);for(let i=0;i<V;){const s=Y[i];if(q[s]>0){q[s]-=t,i++;continue}let l=H[s];if(I[s]>0?(I[s]-=t,l=n.smooth?l+(N[s]-l)*a:N[s]):l=n.smooth?l*Math.exp(-t*4/Math.max(ee[s],.05)):0,l<.012&&I[s]<=0){wt(i),F=!0;continue}H[s]=l,te[s]-=t,te[s]<=0&&(w[s*4]=oe(),te[s]=(.045+.45*(1-l)*(1-l))*(.6+.8*Math.random())/e),w[s*4+2]=Math.round(l*255),F=!0,i++}},Pt=t=>{if(!me)return;const n=P(T.current);let e=!1;for(let a=0;a<A;a++){const i=z[a];if(i<0)continue;const s=We-i;if(s<0){e=!0;continue}s<t&&Math.random()<(he[a]<n.density?.45:.12)&&j(a,.4+.5*Math.random(),.02,.35+Math.random()*.35,O());const l=n.smooth?Wt(s/.35):1;w[a*4+1]=Ce(a,l),l>=1?z[a]=-1:e=!0}F=!0,e||(me=!1)},Ye=t=>{if(ne=0,Se&&(Se=!1,Lt()),!de||document.hidden)return;const n=P(T.current),e=$?S((t-$)/1e3,5e-4,.05):1/60;if($=t,We+=e,U||(He+=e*n.speed),ze(),Tt(),n.density!==Te){Te=n.density;for(let u=0;u<A;u++)z[u]<0&&(w[u*4+1]=Ce(u));F=!0}const a=n.interactive&&c.inside&&!U?1:0;c.presence+=(a-c.presence)*(1-Math.exp(-e/.25)),Math.abs(a-c.presence)<.002&&(c.presence=a);const i=c.sx,s=c.sy,l=1-Math.exp(-e/.07);c.sx+=(c.x-c.sx)*l,c.sy+=(c.y-c.sy)*l;const p=Math.hypot(c.sx-i,c.sy-s)/x.ratio/e;if(c.stir+=(S(p/1400,0,1)-c.stir)*(1-Math.exp(-e/.12)),c.stir<.001&&(c.stir=0),Pt(e),Ft(e),St(e),Ct(e),_t(e),o.viewport(0,0,y.width,y.height),o.disable(o.BLEND),o.useProgram(ce.program),o.bindVertexArray(Ue),o.activeTexture(o.TEXTURE1),o.bindTexture(o.TEXTURE_2D,we),F&&(o.texSubImage2D(o.TEXTURE_2D,0,0,0,r.cols,r.rows,o.RGBA,o.UNSIGNED_BYTE,w),F=!1),o.uniform1i(d.uState,1),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,ve),o.uniform1i(d.uAtlas,0),o.uniform2i(d.uCell,r.cellW,r.cellH),o.uniform2i(d.uGrid,r.cols,r.rows),o.uniform1i(d.uAtlasColumns,r.atlasColumns),o.uniform2f(d.uResolution,y.width,y.height),o.uniform2f(d.uOrigin,r.originX,r.originY),o.uniform3fv(d.uBase,ye(n.baseColor)),o.uniform1f(d.uBaseOpacity,n.baseOpacity),o.uniform3fv(d.uColors,le),o.uniform1f(d.uEdge,n.edgeFade*Math.min(y.width,y.height)),o.uniform1f(d.uCenter,n.centerFade),o.uniform2f(d.uPointer,c.sx,c.sy),o.uniform1f(d.uRadius,Math.max(1,n.cursorRadius*x.ratio)),o.uniform1f(d.uPresence,c.presence),o.uniform1f(d.uReveal,Math.min(1,n.baseOpacity*3.5)),o.uniform1f(d.uTime,He),o.uniform1f(d.uFlow,n.flow),o.uniform1f(d.uFlowScale,Math.max(y.width,y.height)*.32),n.backgroundColor){const[u,m,h]=ye(n.backgroundColor);o.uniform4f(d.uBackground,u,m,h,1)}else o.uniform4f(d.uBackground,0,0,0,0);o.drawArrays(o.TRIANGLES,0,3),!U&&n.speed>0||V>0||X.length>0||me||c.presence!==0&&c.presence!==1||c.stir>0?ne=requestAnimationFrame(Ye):$=0};function k(){!ne&&de&&!document.hidden&&(ne=requestAnimationFrame(Ye))}let Se=!1;const Lt=()=>{const t=P(T.current);x.width=Math.max(1,G.clientWidth),x.height=Math.max(1,G.clientHeight),x.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),y.width=Math.max(1,Math.round(x.width*x.ratio)),y.height=Math.max(1,Math.round(x.height*x.ratio)),ze(),r.cols&&qe()},Ve=()=>{Se=!0,k()},$e=t=>{const n=G.getBoundingClientRect(),e=t.clientX-n.left,a=t.clientY-n.top;c.inside=e>=0&&a>=0&&e<=n.width&&a<=n.height,c.x=e*x.ratio,c.y=a*x.ratio,(c.fresh||c.presence<.02)&&(c.sx=c.x,c.sy=c.y,c.fresh=!1)},je=t=>{$e(t),k()},Ke=t=>{$e(t);const n=P(T.current);!c.inside||n.clickEffect==="none"||U||!A||(bt(c.x,c.y),k())},ge=t=>{t.pointerType!=="mouse"&&(c.inside=!1)},Je=()=>{c.inside=!1,k()},Ze=()=>{$=0,k()},Qe=()=>{ue="",k()},et=new ResizeObserver(Ve);et.observe(G);const tt=new IntersectionObserver(t=>{de=t.some(n=>n.isIntersecting),de&&($=0,k())});return tt.observe(G),_(window).addEventListener("pointermove",je,{passive:!0}),_(window).addEventListener("pointerdown",Ke,{passive:!0}),_(window).addEventListener("pointerup",ge,{passive:!0}),_(window).addEventListener("pointercancel",ge,{passive:!0}),_(document.documentElement).addEventListener("pointerleave",Je),document.addEventListener("visibilitychange",Ze),document.fonts?.addEventListener?.("loadingdone",Qe),Ve(),xe.current=k,()=>{Ne=!1,cancelAnimationFrame(ne),xe.current=null,et.disconnect(),tt.disconnect(),_(window).removeEventListener("pointermove",je),_(window).removeEventListener("pointerdown",Ke),_(window).removeEventListener("pointerup",ge),_(window).removeEventListener("pointercancel",ge),_(document.documentElement).removeEventListener("pointerleave",Je),document.removeEventListener("visibilitychange",Ze),document.fonts?.removeEventListener?.("loadingdone",Qe),o.deleteTexture(ve),o.deleteTexture(we),o.deleteVertexArray(Ue),o.deleteProgram(ce.program),o.getExtension("WEBGL_lose_context")?.loseContext()}},[]),J.useEffect(()=>{xe.current?.()}),nt.jsx("div",{ref:De,className:`letter-glitch${Le?` ${Le}`:""}`,style:Mt,...xt,children:nt.jsx("canvas",{ref:ke,className:"letter-glitch-canvas","aria-hidden":"true"})})};export{$t as default};
