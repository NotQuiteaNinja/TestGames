import{r as L,j as ce}from"./index-uEvbEw5g.js";import{b as F}from"./App-Dofw4Ib9.js";import{b as A}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const V=12,Ee={lines:0,dots:1,cross:2},Le=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Fe=`#version 300 es
precision highp float;
uniform vec2 uView;
uniform float uRatio;
uniform float uCell;
uniform float uLineWidth;
uniform float uGlow;
uniform float uTilt;
uniform float uFocal;
uniform vec2 uTurn;
uniform vec4 uRipples[${V}];
uniform int uRippleCount;
uniform float uWaveLength;
uniform float uWaveSpeed;
uniform float uStrength;
uniform vec3 uPointer;
uniform vec3 uColor;
uniform vec3 uInk;
uniform float uPresence;
uniform float uReveal;
uniform float uFade;
uniform float uOpacity;
uniform float uLightMode;
uniform int uVariant;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 css = gl_FragCoord.xy / uRatio;
  vec2 screen = vec2(css.x - uView.x * 0.5, uView.y * 0.5 - css.y);
  vec2 plane = screen;
  float horizon = 1.0;
  if (uTilt > 0.0001) {
    float depth = uFocal + screen.y * tan(uTilt);
    horizon = smoothstep(0.0, uFocal * 0.35, depth);
    float scale = uFocal / max(depth, 0.001);
    plane = vec2(screen.x * scale, screen.y * scale / cos(uTilt));
  }

  vec2 push = vec2(0.0);
  float lift = 0.0;
  for (int i = 0; i < ${V}; i++) {
    if (i >= uRippleCount) break;
    vec4 ripple = uRipples[i];
    vec2 delta = plane - ripple.xy;
    float dist = length(delta);
    float x = (dist - ripple.z * uWaveSpeed) / uWaveLength;
    float packet = exp(-x * x * 1.8);
    float spread = 1.0 / (1.0 + dist / (uWaveLength * 5.0));
    float calm = smoothstep(0.0, uWaveLength * 0.9, dist);
    float wave = sin(x * 6.28318) * packet * spread * calm * ripple.w;
    push += (dist > 0.001 ? delta / dist : vec2(0.0)) * wave;
    lift += wave;
  }

  vec2 bent = plane + push * uStrength * uCell * 0.22;
  vec2 grid = mat2(uTurn.x, uTurn.y, -uTurn.y, uTurn.x) * bent / uCell;
  vec2 fw = max(fwidth(grid), vec2(0.00001));
  vec2 offset = abs(fract(grid - 0.5) - 0.5);
  vec2 dist = offset / fw;
  float width = max(uLineWidth * uRatio, 1.0);
  float thin = min(uLineWidth * uRatio, 1.0);
  float shape = 0.0;
  float edge = min(dist.x, dist.y);
  if (uVariant == 1) {
    edge = length(dist);
    shape = (1.0 - smoothstep(width * 1.7 - 0.5, width * 1.7 + 0.5, edge)) * thin * 1.8;
  } else if (uVariant == 2) {
    float arm = 0.16;
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;
    vec2 reach = 1.0 - smoothstep(arm - fw * 0.5, arm + fw * 0.5, offset);
    shape = max(cover.x * reach.y, cover.y * reach.x);
    edge = max(min(dist.x, dist.y), length(max(offset - arm, 0.0) / fw));
  } else {
    vec2 cover = (1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, dist)) * thin;
    shape = max(cover.x, cover.y);
  }
  float halo = exp(-edge / (uRatio * 2.4)) * uGlow;
  float far = 1.0 - smoothstep(0.18, 0.5, max(fw.x, fw.y));

  vec2 toPointer = (plane - uPointer.xy) / (uCell * 3.2);
  float near = uPointer.z * exp(-dot(toPointer, toPointer));
  float shine = max(1.0 + lift * 3.4 * uStrength, 0.25) * (1.0 + near * 1.6);

  float radius = length(plane);
  float reveal = 1.0 - smoothstep(uReveal - uCell * 4.0, uReveal, radius);
  vec2 uv = gl_FragCoord.xy / (uView * uRatio);
  float edgeFade = uFade * 0.5;
  float mask = smootherstep(edgeFade, uv.x) * smootherstep(edgeFade, 1.0 - uv.x) * smootherstep(edgeFade, uv.y) * smootherstep(edgeFade, 1.0 - uv.y);
  mask *= horizon * far * reveal * uPresence * uOpacity;

  float level = (shape * 0.26 + halo * 0.1) * shine * mask;
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  if (uLightMode > 0.5) {
    float alpha = clamp(level * 1.2 + dither, 0.0, 1.0);
    outColor = vec4(uInk * alpha, alpha);
  } else {
    float alpha = clamp(level + dither, 0.0, 1.0);
    vec3 color = mix(uColor, vec3(1.0), clamp(level - 0.7, 0.0, 1.0));
    outColor = vec4(color * alpha, alpha);
  }
}`,Ce=1.6,$=(n,m,v)=>Math.min(v,Math.max(m,n)),ue=(n,m,v)=>{const l=n.createShader(m);return l?(n.shaderSource(l,v),n.compileShader(l),n.getShaderParameter(l,n.COMPILE_STATUS)?l:(n.deleteShader(l),null)):null},Te=n=>{const m=ue(n,n.VERTEX_SHADER,Le),v=ue(n,n.FRAGMENT_SHADER,Fe),l=n.createProgram();if(!m||!v||!l)return null;if(n.attachShader(l,m),n.attachShader(l,v),n.bindAttribLocation(l,0,"aPosition"),n.linkProgram(l),n.deleteShader(m),n.deleteShader(v),!n.getProgramParameter(l,n.LINK_STATUS))return n.deleteProgram(l),null;const W={},X=n.getProgramParameter(l,n.ACTIVE_UNIFORMS);for(let C=0;C<X;C++){const T=n.getActiveUniform(l,C);T&&(W[T.name.replace("[0]","")]=n.getUniformLocation(l,T.name))}return{program:l,uniforms:W}},ze=({color:n="#ffffff",variant:m="lines",cellSize:v=48,lineWidth:l=1,glow:W=.6,rippleStrength:X=1,rippleSpeed:C=1,rippleSize:T=1,autoRipple:fe="center",rippleInterval:he=2.6,tilt:de=0,rotation:pe=0,mouseInteraction:me=!0,clickRipple:ve=!0,intro:ge=!0,fade:xe=.5,opacity:we=1,lightMode:Re=!1,paused:Me=!1,dpr:ye,className:q="",...Se})=>{const H=L.useRef(null),K=L.useRef(null),B=L.useRef(null),J={color:String(n),variant:Ee[m]??0,cellSize:Math.max(8,v),lineWidth:Math.max(.25,l),glow:Math.max(0,W),rippleStrength:Math.max(0,X),rippleSpeed:Math.max(.05,C),rippleSize:Math.max(.2,T),autoRipple:fe,rippleInterval:Math.max(.3,he),tilt:$(de,0,80),rotation:pe,mouseInteraction:me,clickRipple:ve,intro:ge,fade:$(xe,0,1),opacity:$(we,0,1),lightMode:Re,paused:Me,dpr:ye},p=L.useRef(J);return p.current=J,L.useEffect(()=>{const R=H.current,M=K.current,e=M?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!R||!M||!e)return;const z=Te(e);if(!z)return;const a=z.uniforms,Q=e.createBuffer(),D=e.createVertexArray();e.bindVertexArray(D),e.bindBuffer(e.ARRAY_BUFFER,Q),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const P=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),g=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,G=new Map,Ae=t=>{if(G.has(t))return G.get(t);let o=[1,1,1];if(P){P.clearRect(0,0,1,1),P.fillStyle="#ffffff",P.fillStyle=t,P.fillRect(0,0,1,1);const[r,s,i]=P.getImageData(0,0,1,1).data;o=[r,s,i].map(u=>Math.pow(u/255,2.2))}return G.set(t,o),o},d={width:1,height:1,ratio:1},f={x:0,y:0,inside:!1,planeX:0,planeY:0,travel:0},c={clock:0,intro:p.current.intro&&!g?0:1,glow:0,nextAuto:.4},x=[],k=new Float32Array(V*4);let b=0,E=0,_=!0;const Z=()=>d.height*1.15,Y=(t,o)=>{const r=A(p.current),s=t-d.width/2,i=o-d.height/2,u=r.tilt*Math.PI/180;if(u<=1e-4)return[s,i];const h=Z(),w=h+i*Math.tan(u);if(w<=h*.05)return null;const O=h/w;return[s*O,i*O/Math.cos(u)]},I=(t,o,r)=>{x.push({x:t,y:o,born:c.clock,strength:r}),x.length>V&&x.shift()},U=()=>{const t=A(p.current),o=c.intro*c.intro*(3-2*c.intro),r=t.cellSize*2.4*t.rippleSize,s=240*t.rippleSpeed;let i=0;for(let S=x.length-1;S>=0&&i<V;S--){const N=x[S],le=c.clock-N.born;k[i*4]=N.x,k[i*4+1]=N.y,k[i*4+2]=le,k[i*4+3]=N.strength*Math.exp(-le*.55),i++}const u=t.rotation*Math.PI/180,h=Ae(t.color),w=.2126*h[0]+.7152*h[1]+.0722*h[2],O=Math.min(1,.12/Math.max(w,.001)),Pe=h.map(S=>Math.pow(Math.min(1,S*O),1/2.2)),be=Math.hypot(d.width,d.height);e.bindVertexArray(D),e.viewport(0,0,M.width,M.height),e.useProgram(z.program),e.uniform2f(a.uView,d.width,d.height),e.uniform1f(a.uRatio,d.ratio),e.uniform1f(a.uCell,t.cellSize),e.uniform1f(a.uLineWidth,t.lineWidth),e.uniform1f(a.uGlow,t.glow),e.uniform1f(a.uTilt,t.tilt*Math.PI/180),e.uniform1f(a.uFocal,Z()),e.uniform2f(a.uTurn,Math.cos(u),Math.sin(u)),e.uniform4fv(a.uRipples,k),e.uniform1i(a.uRippleCount,i),e.uniform1f(a.uWaveLength,r),e.uniform1f(a.uWaveSpeed,s),e.uniform1f(a.uStrength,t.rippleStrength),e.uniform3f(a.uPointer,f.planeX,f.planeY,c.glow),e.uniform3fv(a.uColor,h.map(S=>Math.pow(S,1/2.2))),e.uniform3fv(a.uInk,Pe),e.uniform1f(a.uPresence,Math.min(1,o*1.6)),e.uniform1f(a.uReveal,t.intro&&!g?o*be*1.4+t.cellSize*4:1e6),e.uniform1f(a.uFade,t.fade),e.uniform1f(a.uOpacity,t.opacity),e.uniform1f(a.uLightMode,t.lightMode?1:0),e.uniform1i(a.uVariant,t.variant),e.drawArrays(e.TRIANGLES,0,3)},ee=t=>{if(b=0,!_||document.hidden)return;const o=A(p.current),r=E?Math.min(.05,(t-E)/1e3):1/60;E=t;const s=!o.paused&&!g;if(s&&(c.clock+=r),!o.intro||g?c.intro=1:c.intro<1&&(c.intro=Math.min(1,c.intro+r/Ce)),s&&o.autoRipple!=="none"&&c.clock>=c.nextAuto){if(o.autoRipple==="random"){const w=Y(Math.random()*d.width,d.height*(.2+Math.random()*.7));w&&I(w[0],w[1],.75)}else I(0,0,1);c.nextAuto=c.clock+o.rippleInterval}const i=9/Math.max(.2,o.rippleSpeed);for(;x.length&&c.clock-x[0].born>i;)x.shift();const u=o.mouseInteraction&&f.inside&&!g;c.glow+=((u?1:0)-c.glow)*(1-Math.exp(-r*(u?6:2.5))),U();const h=c.intro<1||Math.abs((u?1:0)-c.glow)>.002;s||h?b=requestAnimationFrame(ee):E=0},y=()=>{!b&&_&&!document.hidden&&(b=requestAnimationFrame(ee))},j=()=>{const t=A(p.current),o=Math.max(1,R.clientWidth),r=Math.max(1,R.clientHeight),s=Math.min(t.dpr||window.devicePixelRatio||1,2);d.width=o,d.height=r,M.width=Math.max(1,Math.round(o*s)),M.height=Math.max(1,Math.round(r*s)),d.ratio=M.width/o,U(),y()},te=t=>{const o=R.getBoundingClientRect(),r=t.clientX-o.left,s=t.clientY-o.top;f.inside=r>=0&&s>=0&&r<=o.width&&s<=o.height;const i=f.inside?Y(r,s):null;if(i){const u=A(p.current),h=Math.hypot(i[0]-f.planeX,i[1]-f.planeY);f.planeX=i[0],f.planeY=i[1],u.mouseInteraction&&!g&&h<u.cellSize*6&&(f.travel+=h,f.travel>u.cellSize*1.6&&(f.travel=0,I(i[0],i[1],.32)))}else f.inside=!1;f.x=r,f.y=s,y()},oe=t=>{if(!A(p.current).clickRipple||g)return;const r=R.getBoundingClientRect(),s=t.clientX-r.left,i=t.clientY-r.top;if(s<0||i<0||s>r.width||i>r.height)return;const u=Y(s,i);u&&I(u[0],u[1],1.2),y()},ne=()=>{f.inside=!1,y()},ie=()=>{E=0,y()},re=new ResizeObserver(j);re.observe(R);const ae=new IntersectionObserver(t=>{_=t.some(o=>o.isIntersecting),_&&(E=0,y())});ae.observe(R),F(window).addEventListener("pointermove",te,{passive:!0}),F(window).addEventListener("pointerdown",oe,{passive:!0}),F(document.documentElement).addEventListener("pointerleave",ne),document.addEventListener("visibilitychange",ie),p.current.intro&&!g&&I(0,0,1.1),j();let se=p.current.dpr;return B.current=()=>{const t=A(p.current);if(t.dpr!==se){se=t.dpr,j();return}b||U(),y()},()=>{cancelAnimationFrame(b),B.current=null,re.disconnect(),ae.disconnect(),F(window).removeEventListener("pointermove",te),F(window).removeEventListener("pointerdown",oe),F(document.documentElement).removeEventListener("pointerleave",ne),document.removeEventListener("visibilitychange",ie),e.deleteProgram(z.program),e.deleteBuffer(Q),e.deleteVertexArray(D),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),L.useEffect(()=>{B.current?.()}),ce.jsx("div",{ref:H,className:`ripple-grid-container${q?` ${q}`:""}`,...Se,children:ce.jsx("canvas",{ref:K,className:"ripple-grid-canvas","aria-hidden":"true"})})};export{ze as RippleGrid,ze as default};
