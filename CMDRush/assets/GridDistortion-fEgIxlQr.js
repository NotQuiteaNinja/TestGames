import{r as I,j as Ue}from"./index-uEvbEw5g.js";import{b as j}from"./App-Dofw4Ib9.js";import{b as ye}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const ke=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,We=`#version 300 es
precision highp float;
uniform sampler2D uImage;
uniform sampler2D uField;
uniform vec2 uGrid;
uniform vec2 uCover;
uniform float uSoftness;
uniform float uChroma;
uniform float uReveal;
in vec2 vUv;
out vec4 outColor;

vec2 fieldAt(ivec2 cell) {
  return texelFetch(uField, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0).rg;
}

vec3 sampleImage(vec2 uv) {
  return texture(uImage, (uv - 0.5) * uCover + 0.5).rgb;
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 g = uv * uGrid;
  vec2 blocky = fieldAt(ivec2(floor(g)));
  vec2 p = g - 0.5;
  ivec2 base = ivec2(floor(p));
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  vec2 soft = mix(
    mix(fieldAt(base), fieldAt(base + ivec2(1, 0)), f.x),
    mix(fieldAt(base + ivec2(0, 1)), fieldAt(base + ivec2(1, 1)), f.x),
    f.y
  );
  vec2 shift = mix(blocky, soft, uSoftness);
  float spread = uChroma * 0.35;
  vec3 color = vec3(
    sampleImage(uv - shift * (1.0 + spread)).r,
    sampleImage(uv - shift).g,
    sampleImage(uv - shift * (1.0 - spread)).b
  );
  outColor = vec4(color * uReveal, uReveal);
}`,qe=["drag","push","swirl"],He=18,Ie=1.6,b=(m,M,A)=>Math.min(A,Math.max(M,m)),be=(m,M,A)=>{let c=Math.imul(m,668265261)^Math.imul(M,374761393)^Math.imul(A,739982445);return c=Math.imul(c^c>>>15,2246822507),c=Math.imul(c^c>>>13,3266489909),((c^c>>>16)>>>0)/2147483648-1},Pe=(m,M,A)=>{const c=m.createShader(M);return c?(m.shaderSource(c,A),m.compileShader(c),m.getShaderParameter(c,m.COMPILE_STATUS)?c:(m.deleteShader(c),null)):null},$e=({imageSrc:m,grid:M=15,radius:A=.18,strength:c=.15,relaxation:De=.96,mode:Z="drag",softness:Xe=0,chroma:Fe=0,idle:Se=.3,clickRipple:Le=!0,intro:Ge=!0,className:ee="",style:Ce})=>{const te=I.useRef(null),oe=I.useRef(null),O=I.useRef(null),re={grid:b(Math.round(M),2,120),radius:b(A,.01,1),strength:Math.max(0,c),relaxation:b(De,0,.995),mode:qe.includes(Z)?Z:"drag",softness:b(Xe,0,1),chroma:b(Fe,0,2),idle:b(Se,0,1),clickRipple:Le,intro:Ge},w=I.useRef(re);return w.current=re,I.useEffect(()=>{const _=te.current,P=oe.current,e=P?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!_||!P||!e)return;const z=Pe(e,e.VERTEX_SHADER,ke),V=Pe(e,e.FRAGMENT_SHADER,We),p=e.createProgram();if(!z||!V||!p||(e.attachShader(p,z),e.attachShader(p,V),e.linkProgram(p),!e.getProgramParameter(p,e.LINK_STATUS)))return;e.useProgram(p);const ne=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,ne),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const ie=e.getAttribLocation(p,"aPosition");e.enableVertexAttribArray(ie),e.vertexAttribPointer(ie,2,e.FLOAT,!1,0,0);const g={};for(const o of["uImage","uField","uGrid","uCover","uSoftness","uChroma","uReveal"])g[o]=e.getUniformLocation(p,o);e.uniform1i(g.uImage,0),e.uniform1i(g.uField,1);const $=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,$),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.MIRRORED_REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.MIRRORED_REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR);const se=e.createTexture();e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,se),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const G=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,l={x:0,y:0,px:0,py:0,inside:!1},t={width:1,height:1,cols:0,rows:0,sim:new Float32Array(0),out:new Float32Array(0),ripples:[],time:0,reveal:0,loaded:!1,imageAspect:1,request:0,lastMove:-10,phantom:1};let C=0,N=0,k=!0,W=!0;const K=()=>{const o=w.current.grid,n=Math.max(1,Math.round(o*t.height/t.width));o===t.cols&&n===t.rows||(t.cols=o,t.rows=n,t.sim=new Float32Array(o*n*2),t.out=new Float32Array(o*n*2),e.activeTexture(e.TEXTURE1),e.texImage2D(e.TEXTURE_2D,0,e.RG32F,o,n,0,e.RG,e.FLOAT,t.out))},Ne=()=>{const{sim:o,cols:n,rows:r,width:i,height:s}=t,f=Math.min(i,s)*.12;for(let u=0;u<r;u++)for(let h=0;h<n;h++){const d=(u*n+h)*2;o[d]=be(h+1,u+1,11)*f/i,o[d+1]=be(h+1,u+1,23)*f/s}},ae=(o,n,r,i,s,f)=>{const{sim:u,cols:h,rows:d,width:a,height:v}=t,E=Math.max(1,o.radius*a),x=a/h,T=v/d,U=Math.hypot(i,s),q=(.25+o.strength)*.4*a,J=Math.max(0,Math.floor((n-E)/x)),X=Math.min(h-1,Math.floor((n+E)/x)),F=Math.max(0,Math.floor((r-E)/T)),H=Math.min(d-1,Math.floor((r+E)/T));for(let y=F;y<=H;y++)for(let R=J;R<=X;R++){const S=(R+.5)*x-n,B=(y+.5)*T-r,L=Math.hypot(S,B);if(L>=E)continue;const ve=1-(L/E)**2,Te=o.strength*He*f*ve*ve;let Re=i,ge=s;if(o.mode!=="drag"){const we=L>0?S/L:0,_e=L>0?B/L:0;Re=o.mode==="push"?we*U:-_e*U,ge=o.mode==="push"?_e*U:we*U}const Y=(y*h+R)*2,xe=u[Y]*a+Re*Te,Me=u[Y+1]*v+ge*Te,Q=Math.hypot(xe,Me),Ae=Q>0?q*Math.tanh(Q/q)/Q:0;u[Y]=xe*Ae/a,u[Y+1]=Me*Ae/v}},ce=o=>[t.width*(.5+.34*Math.sin(o*.43)+.08*Math.sin(o*1.21+1.7)),t.height*(.5+.3*Math.sin(o*.61+.9)+.08*Math.cos(o*1.03+.4))],Be=(o,n)=>{const{sim:r}=t,i=Math.pow(o.relaxation,n*60);let s=0;for(let a=0;a<r.length;a++)r[a]*=i,Math.abs(r[a])<1e-5?r[a]=0:s=Math.max(s,Math.abs(r[a]));if(o.strength<=0)return s;const f=l.x-l.px,u=l.y-l.py;l.px=l.x,l.py=l.y,l.inside&&(f||u)&&(t.lastMove=t.time,ae(o,l.x,l.y,f,u,1),s=Math.max(s,.001));const h=G?0:o.idle,d=t.time-t.lastMove>2.5;if(t.phantom=b(t.phantom+(d?n:-n*3),0,1),h>0&&t.phantom>0){const[a,v]=ce(t.time),[E,x]=ce(t.time-n);ae(o,a,v,a-E,v-x,h*.6*t.phantom*t.phantom)}return s},le=o=>{const{sim:n,out:r,cols:i,rows:s,width:f,height:u,time:h}=t;if(r.set(n),t.ripples.length){const d=f/i,a=u/s,v=Math.hypot(f,u),E=Math.max(d,a)*1.2+v*.03,x=f*(.03+o.strength*.3);t.ripples=t.ripples.filter(T=>h-T.start<Ie);for(const T of t.ripples){const U=(h-T.start)/Ie,q=U*v*.75,J=(1-U)**2;for(let X=0;X<s;X++)for(let F=0;F<i;F++){const H=(F+.5)*d-T.x,y=(X+.5)*a-T.y,R=Math.hypot(H,y),S=Math.exp(-(((R-q)/E)**2))*J;if(S<.002||R===0)continue;const B=(X*i+F)*2;r[B]+=H/R*(S*x/f),r[B+1]+=y/R*(S*x/u)}}}},ue=()=>{const{width:o,height:n}=t,r=o/n,i=r>t.imageAspect?[1,t.imageAspect/r]:[r/t.imageAspect,1];e.viewport(0,0,P.width,P.height),e.activeTexture(e.TEXTURE1),e.texSubImage2D(e.TEXTURE_2D,0,0,0,t.cols,t.rows,e.RG,e.FLOAT,t.out);const s=ye(w.current);e.uniform2f(g.uGrid,t.cols,t.rows),e.uniform2f(g.uCover,i[0],i[1]),e.uniform1f(g.uSoftness,s.softness),e.uniform1f(g.uChroma,s.chroma),e.uniform1f(g.uReveal,t.reveal),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)},he=o=>{if(C=0,!W||!k)return;const n=ye(w.current),r=N?Math.min(.05,(o-N)/1e3):1/60;N=o,t.time+=r,K(),t.loaded&&(t.reveal=G?1:Math.min(1,t.reveal+r/.6));const i=Be(n,r);le(n),ue(),i>0||t.ripples.length>0||n.idle>0&&!G||t.reveal<1?C=requestAnimationFrame(he):N=0},D=()=>{C||!W||!k||(C=requestAnimationFrame(he))},Oe=o=>{const n=++t.request;if(!o)return;const r=new Image;r.crossOrigin="anonymous",r.decoding="async",r.onload=()=>{!W||n!==t.request||(e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,$),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),t.imageAspect=r.naturalWidth/Math.max(1,r.naturalHeight),K(),w.current.intro&&!G&&Ne(),t.loaded=!0,D())},r.src=o},me=o=>{const n=_.getBoundingClientRect(),r=o.clientX-n.left,i=o.clientY-n.top,s=r>=0&&i>=0&&r<=n.width&&i<=n.height;s&&!l.inside&&(l.px=r,l.py=i),l.x=r,l.y=i,l.inside=s,s&&D()},fe=o=>{if(!w.current.clickRipple||G)return;const n=_.getBoundingClientRect(),r=o.clientX-n.left,i=o.clientY-n.top;r<0||i<0||r>n.width||i>n.height||(t.ripples.push({x:r,y:i,start:t.time}),t.ripples.length>4&&t.ripples.shift(),D())},de=()=>{const o=Math.min(window.devicePixelRatio||1,2);t.width=Math.max(1,_.clientWidth),t.height=Math.max(1,_.clientHeight),P.width=Math.round(t.width*o),P.height=Math.round(t.height*o),K(),le(w.current),ue(),D()};O.current={load:Oe,wake:D};const Ee=new ResizeObserver(de);Ee.observe(_);const pe=new IntersectionObserver(o=>{k=o.some(n=>n.isIntersecting),k&&(N=0,D())});return pe.observe(_),j(window).addEventListener("pointermove",me,{passive:!0}),j(window).addEventListener("pointerdown",fe,{passive:!0}),de(),()=>{W=!1,cancelAnimationFrame(C),O.current=null,Ee.disconnect(),pe.disconnect(),j(window).removeEventListener("pointermove",me),j(window).removeEventListener("pointerdown",fe),e.deleteTexture($),e.deleteTexture(se),e.deleteBuffer(ne),e.deleteProgram(p),e.deleteShader(z),e.deleteShader(V)}},[]),I.useEffect(()=>{O.current?.load(m)},[m]),I.useEffect(()=>{O.current?.wake()}),Ue.jsx("div",{ref:te,className:`distortion-container${ee?` ${ee}`:""}`,style:Ce,children:Ue.jsx("canvas",{ref:oe,className:"distortion-container__canvas","aria-hidden":"true"})})};export{$e as default};
