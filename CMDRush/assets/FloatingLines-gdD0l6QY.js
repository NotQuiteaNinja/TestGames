import{r as W,j as We}from"./index-uEvbEw5g.js";import{b as S}from"./App-Dofw4Ib9.js";import{b as $}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const F=24,ut=8,G=3,dt=1.8,X=["top","middle","bottom"],mt={top:{x:10,y:.5,rotate:-.4},middle:{x:5,y:0,rotate:.2},bottom:{x:2,y:-.7,rotate:-1}},ht={top:{offset:1,step:.2,light:.2,flip:1,depth:1,drift:.6},middle:{offset:2,step:.15,light:1,flip:0,depth:0,drift:1},bottom:{offset:1.5,step:.2,light:.32,flip:0,depth:.6,drift:1.4}},pt=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,gt=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform float uRatio;
uniform vec4 uWave[3];
uniform vec4 uShape[3];
uniform vec4 uParallax[3];
uniform int uCount[3];
uniform vec4 uLine[${F*3}];
uniform vec3 uLineColor[${F*3}];
uniform vec2 uMouseWarp[3];
uniform float uHaloReach;
uniform float uWidth;
uniform float uGlow;
uniform float uBrightness;
uniform float uFocus;
uniform float uEdgeFade;
uniform vec4 uMouse;
uniform float uBendRadius;
uniform float uBendStrength;
uniform vec4 uClicks[${G}];
uniform float uLight;
uniform float uOpaque;
uniform vec3 uBackground;
uniform float uOpacity;
uniform float uStyle;
uniform float uSpacing;
out vec4 outColor;

vec3 toSrgb(vec3 c) {
  return pow(max(c, 0.0), vec3(1.0 / 2.2));
}

vec3 inkOf(vec3 color) {
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  return color * min(1.0, 0.16 / max(luma, 0.001));
}

vec2 warp(vec2 p, float rotate, float flip) {
  float angle = rotate * log(length(p) + 1.0);
  vec2 r = p * mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
  if (flip > 0.5) r.x = -r.x;
  return r;
}

void main() {
  vec2 screen = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
  screen.y = -screen.y;
  for (int k = 0; k < ${G}; k++) {
    vec4 click = uClicks[k];
    if (click.w == 0.0) continue;
    float age = click.z;
    float turn = 1.9 * smoothstep(0.0, 0.23, age) * exp(-max(age - 0.23, 0.0) * 1.1) * click.w;
    float spread = 0.3 * (1.0 + age * 0.55);
    vec2 offset = screen - click.xy;
    float angle = turn * exp(-dot(offset, offset) / (spread * spread));
    screen = click.xy + mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * offset;
  }
  vec3 light = vec3(0.0);
  vec3 bloom = vec3(0.0);
  vec3 inkColor = vec3(0.0);
  float inkAlpha = 0.0;
  float aa = 0.75 * uRatio;
  float invSigma = 1.0 / max(uBendRadius * uBendRadius, 1e-4);
  float tight = 1.0 / (2.6 * uRatio);
  float wide = 1.0 / (11.0 * uRatio);

  for (int w = 0; w < 3; w++) {
    int count = uCount[w];
    if (count <= 0) continue;
    vec4 wave = uWave[w];
    vec4 shape = uShape[w];
    vec2 r = warp(screen + uParallax[w].xy, wave.z, shape.w);
    vec2 rm = uMouseWarp[w];
    float blur = uFocus * uParallax[w].z;
    float width = uWidth * (1.0 + blur * 2.5);
    float soft = aa * (1.0 + blur * 7.0);
    float energy = (uWidth + aa) / (width + soft) * shape.z;
    float cut = uHaloReach + width * 2.0 + soft;
    float sx = sin(r.x);
    float cx = cos(r.x);
    float along = r.x - rm.x;
    float pull = uMouse.z * exp(-along * along * invSigma);
    float level = r.y + wave.y;
    int first = w * ${F};

    for (int i = 0; i < ${F}; i++) {
      if (i >= count) break;
      vec4 line = uLine[first + i];
      float y = (sx * line.x + cx * line.y) * line.z;
      float near = 0.0;
      if (pull > 0.002) {
        float across = (y - wave.y) - rm.y;
        near = exp(-across * across * invSigma) * pull;
        float push = uBendStrength * near;
        y += across * (uBendStrength < 0.0 ? min(-push, 2.5) : -min(push, 0.9));
      }
      float m = level - y;
      float slope = length(vec2(dFdx(m), dFdy(m)));
      float d = abs(m) / max(slope, 1e-5);
      if (d < cut) {
        float gap = d;
        float size = width;
        if (uStyle > 0.5) {
          float period = uSpacing / (uResolution.y * 0.5);
          float cell = (fract((r.x + line.w) / period + float(i) * 0.37) - 0.5) * uSpacing;
          float span = uStyle > 1.5 ? max(uSpacing * 0.32 - width, 0.0) : 0.0;
          gap = length(vec2(max(abs(cell) - span, 0.0), d));
          size = uStyle > 1.5 ? width : width * 1.6;
        }
        float core = smoothstep(size + soft, size - soft, gap);
        float fall = 1.0 - d / cut;
        float halo = (exp(-gap * tight) * 0.3 + exp(-d * wide) * 0.02 * fall * fall) * uGlow;
        vec3 color = uLineColor[first + i];
        float lift = 1.0 + near * 0.8;
        light += color * core * energy * lift;
        bloom += color * halo * shape.z * lift;
        float a = clamp(clamp(core * energy * 1.15 + halo * shape.z * 0.12, 0.0, 1.0) * lift, 0.0, 1.0);
        inkColor = inkOf(color) * a + inkColor * (1.0 - a);
        inkAlpha = a + inkAlpha * (1.0 - a);
      }
    }
  }

  float edge = 1.0;
  if (uEdgeFade > 0.0) {
    float u = gl_FragCoord.x / uResolution.x;
    float fade = uEdgeFade * 0.45;
    float left = smoothstep(0.0, fade, u);
    float right = smoothstep(0.0, fade, 1.0 - u);
    edge = left * left * (3.0 - 2.0 * left) * right * right * (3.0 - 2.0 * right);
  }

  if (uLight > 0.5) {
    float alpha = inkAlpha * edge * uOpacity;
    vec3 ink = toSrgb(inkColor / max(inkAlpha, 1e-4));
    if (uOpaque > 0.5) {
      outColor = vec4(mix(uBackground, ink, alpha), 1.0);
    } else {
      outColor = vec4(ink * alpha, alpha);
    }
    return;
  }

  vec3 capped = 0.28 * (1.0 - exp(-bloom / 0.28));
  vec3 glow = toSrgb(1.0 - exp(-(light + capped) * uBrightness * 1.2)) * edge * uOpacity;
  if (uOpaque > 0.5) {
    outColor = vec4(uBackground + glow * (1.0 - uBackground), 1.0);
  } else {
    outColor = vec4(glow, max(glow.r, max(glow.g, glow.b)));
  }
}`,O=(n,i,s)=>Math.min(s,Math.max(i,n)),xt=(n,i,s,l)=>{const v=s*Math.log(Math.hypot(n,i)+1),M=Math.cos(v),V=Math.sin(v),N=n*M+i*V;return[l>.5?-N:N,i*M-n*V]},Ie=(n,i,s)=>{const l=n.createShader(i);return l?(n.shaderSource(l,s),n.compileShader(l),l):null},vt=n=>{const i=Ie(n,n.VERTEX_SHADER,pt),s=Ie(n,n.FRAGMENT_SHADER,gt),l=n.createProgram();return!i||!s||!l?null:(n.attachShader(l,i),n.attachShader(l,s),n.bindAttribLocation(l,0,"aPosition"),n.linkProgram(l),n.deleteShader(i),n.deleteShader(s),l)},ze=(n,i)=>{if(!n.getProgramParameter(i,n.LINK_STATUS))return n.deleteProgram(i),null;const s={},l=n.getProgramParameter(i,n.ACTIVE_UNIFORMS);for(let v=0;v<l;v++){const M=n.getActiveUniform(i,v);M&&(s[M.name.replace("[0]","")]=n.getUniformLocation(i,M.name))}return{program:i,uniforms:s}},Ne=(n,i,s)=>{if(i&&n.getProgramParameter(s,i.COMPLETION_STATUS_KHR)===!1){requestAnimationFrame(()=>Ne(n,i,s));return}n.deleteProgram(s)},Ve=(n,i,s,l)=>{if(typeof n=="number")return n;if(!Array.isArray(n)||n.length===0)return l;const v=i.indexOf(s);return n[v]??n[n.length-1]??l},Rt=({linesGradient:n=["#e945f5","#ffffff"],enabledWaves:i=["top","middle","bottom"],lineCount:s=10,lineDistance:l=6,topWavePosition:v,middleWavePosition:M,bottomWavePosition:V,animationSpeed:N=1,amplitude:He=1,lineWidth:Ue=1,lineStyle:ie="solid",glow:qe=1,brightness:$e=1,depthOfField:Xe=.5,edgeFade:Ge=0,interactive:Ke=!0,bendRadius:je=5,bendStrength:Ye=-.5,mouseDamping:Je=.05,parallax:Qe=!0,parallaxStrength:Ze=.2,clickSwirl:et=!0,intro:tt=!0,mixBlendMode:ot="screen",backgroundColor:ae,lightMode:re=!1,opacity:nt=1,dpr:it,className:se="",style:at,...rt})=>{const le=W.useRef(null),ce=W.useRef(null),K=W.useRef(null),j=Array.isArray(i)?i.filter(m=>X.includes(m)):X,fe={stops:Array.isArray(n)&&n.length?n.slice(0,ut):["#ffffff"],waves:X.map(m=>{const h=j.includes(m),e={...mt[m],...m==="top"?v:m==="middle"?M:V};return{count:h?O(Math.round(Ve(s,j,m,10)),0,F):0,distance:Ve(l,j,m,6)*.01,position:e}}),animationSpeed:Math.max(0,N),amplitude:Math.max(0,He),lineWidth:Math.max(.1,Ue),style:ie==="dashed"?2:ie==="dotted"?1:0,glow:Math.max(0,qe),brightness:Math.max(0,$e),depthOfField:O(Xe,0,1),edgeFade:O(Ge,0,1),interactive:Ke,bendRadius:Math.max(.1,je),bendStrength:Ye,mouseDamping:O(Je,0,1),parallax:Qe,parallaxStrength:Math.max(0,Ze),clickSwirl:et,intro:tt,backgroundColor:ae,lightMode:re,opacity:O(nt,0,1),dpr:it},R=W.useRef(fe);return R.current=fe,W.useEffect(()=>{const m=le.current,h=ce.current,e=h?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!m||!h||!e)return;const I=e.getExtension("KHR_parallel_shader_compile");let w=vt(e),y=w&&!I?ze(e,w):null;if(!w||!I&&!y)return;y&&(w=null);const ue=e.createBuffer(),Y=e.createVertexArray();e.bindVertexArray(Y),e.bindBuffer(e.ARRAY_BUFFER,ue),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let b;const J=new Map,de=(o,t)=>{if(!o)return t;const a=String(o);if(J.has(a))return J.get(a);let f=t;const u=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(a);if(u){const d=u[1].length===3?u[1].replace(/./g,k=>k+k):u[1],p=parseInt(d,16);f=[(p>>16)/255,(p>>8&255)/255,(p&255)/255]}else if(b===void 0&&(b=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})),b){b.clearRect(0,0,1,1),b.fillStyle="#000000",b.fillStyle=a,b.fillRect(0,0,1,1);const[d,p,k]=b.getImageData(0,0,1,1).data;f=[d/255,p/255,k/255]}return J.set(a,f),f},_=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,r={x:0,y:0,nx:0,ny:0,vx:0,inside:!1},c={x:0,y:0,influence:0,px:0,py:0},E=[],me=new Float32Array(12),he=new Float32Array(12),pe=new Float32Array(12),ge=new Int32Array(3),xe=new Float32Array(F*3*4),ve=new Float32Array(F*3*3),we=new Float32Array(6),Q=new Float32Array(G*4);let Z=0,L=R.current.intro&&!_?0:1,C=0,z=0,H=!0;const ee=()=>{if(!y)return;const o=y.uniforms,t=$(R.current),a=h.width,f=h.height,u=L*L*(3-2*L),d=a/Math.max(1,m.clientWidth),p=t.stops.map(g=>de(g,[1,1,1]).map(x=>Math.pow(x,2.2))),k=(2*c.x-a)/f,P=-(2*c.y-f)/f;t.waves.forEach((g,x)=>{const A=ht[X[x]],{x:Fe,y:st,rotate:Le}=g.position,Ce=c.px*A.drift,Pe=-c.py*A.drift;me.set([Fe,st,Le,0],x*4),he.set([A.offset,A.step,A.light,A.flip],x*4),pe.set([Ce,Pe,A.depth,0],x*4),we.set(xt(k+Ce,P+Pe,Le,A.flip),x*2),ge[x]=g.count;for(let T=0;T<g.count;T++){const Oe=A.offset+A.step*T,_e=g.distance*T+Fe,Be=_e+Oe+Z*.1,lt=Math.sin(Oe+Z*.2)*.3*t.amplitude*u,Te=x*F+T;xe.set([Math.cos(Be),Math.sin(Be),lt,_e],Te*4);const De=(g.count>1?T/(g.count-1):0)*Math.max(p.length-1,0),q=Math.min(Math.floor(De),Math.max(p.length-2,0)),ct=Math.min(q+1,p.length-1),ne=O(De-q,0,1),ft=ne*ne*(3-2*ne);for(let D=0;D<3;D++)ve[Te*3+D]=p[q][D]+(p[ct][D]-p[q][D])*ft}}),Q.fill(0),E.forEach((g,x)=>Q.set([g.x,g.y,g.age,g.spin],x*4)),e.viewport(0,0,a,f),e.useProgram(y.program),e.bindVertexArray(Y),e.uniform2f(o.uResolution,a,f),e.uniform1f(o.uRatio,d),e.uniform4fv(o.uWave,me),e.uniform4fv(o.uShape,he),e.uniform4fv(o.uParallax,pe),e.uniform1iv(o.uCount,ge),e.uniform4fv(o.uLine,xe),e.uniform3fv(o.uLineColor,ve),e.uniform2fv(o.uMouseWarp,we),e.uniform1f(o.uHaloReach,11*d*Math.log(160*t.glow+1)),e.uniform1f(o.uWidth,t.lineWidth*.5*d),e.uniform1f(o.uGlow,t.glow),e.uniform1f(o.uBrightness,t.brightness*u),e.uniform1f(o.uFocus,t.depthOfField),e.uniform1f(o.uEdgeFade,t.edgeFade),e.uniform4f(o.uMouse,c.x,c.y,c.influence,0),e.uniform1f(o.uBendRadius,t.bendRadius*.09),e.uniform1f(o.uBendStrength,t.bendStrength*2.5),e.uniform4fv(o.uClicks,Q),e.uniform1f(o.uLight,t.lightMode?1:0),e.uniform1f(o.uOpaque,t.backgroundColor?1:0),e.uniform3fv(o.uBackground,de(t.backgroundColor,t.lightMode?[1,1,1]:[0,0,0])),e.uniform1f(o.uOpacity,t.opacity*u),e.uniform1f(o.uStyle,t.style),e.uniform1f(o.uSpacing,(t.style===2?22:9)*d),e.drawArrays(e.TRIANGLES,0,3)},te=o=>{if(C=0,!H||document.hidden)return;if(!y){if(!w||!I)return;if(!e.getProgramParameter(w,I.COMPLETION_STATUS_KHR)){C=requestAnimationFrame(te);return}if(y=ze(e,w),w=null,!y)return}const t=$(R.current),a=z?O((o-z)/1e3,5e-4,.05):1/60;z=o;const f=_?0:1;Z+=a*t.animationSpeed*f,t.intro&&!_&&L<1?L=Math.min(1,L+a/dt):(!t.intro||_)&&(L=1);const u=1-Math.pow(1-t.mouseDamping,a*60),d=t.interactive&&r.inside&&!_;d&&(c.x+=(r.x-c.x)*u,c.y+=(r.y-c.y)*u),c.influence+=((d?1:0)-c.influence)*u;const p=t.parallax&&d?r.nx*t.parallaxStrength:0,k=t.parallax&&d?r.ny*t.parallaxStrength:0;c.px+=(p-c.px)*u,c.py+=(k-c.py)*u;for(let P=E.length-1;P>=0;P--)E[P].age+=a,E[P].age>4&&E.splice(P,1);ee(),C=requestAnimationFrame(te)},B=()=>{!C&&H&&!document.hidden&&(C=requestAnimationFrame(te))},oe=()=>{const o=$(R.current),t=Math.max(1,m.clientWidth),a=Math.max(1,m.clientHeight),f=Math.min(o.dpr||window.devicePixelRatio||1,2);h.width=Math.max(1,Math.round(t*f)),h.height=Math.max(1,Math.round(a*f)),ee(),B()},ye=o=>{const t=m.getBoundingClientRect(),a=o.clientX-t.left,f=o.clientY-t.top,u=h.width/Math.max(1,t.width);r.inside=a>=0&&f>=0&&a<=t.width&&f<=t.height;const d=a*u;Math.abs(d-r.x)>.5&&(r.vx=d-r.x),r.x=d,r.y=(t.height-f)*u,r.nx=a/Math.max(1,t.width)-.5,r.ny=.5-f/Math.max(1,t.height)},Ae=o=>{const t=r.inside;ye(o),r.inside&&!t&&c.influence<.05&&(c.x=r.x,c.y=r.y),B()},Se=o=>{if(ye(o),!r.inside||!R.current.clickSwirl||_)return;const t=(2*r.x-h.width)/h.height,a=-(2*r.y-h.height)/h.height;E.unshift({x:t,y:a,age:0,spin:r.vx<0?-1:1}),E.length>G&&E.pop(),B()},U=o=>{o.pointerType!=="mouse"&&(r.inside=!1)},Me=()=>{r.inside=!1},Re=()=>{z=0,B()},be=new ResizeObserver(oe);be.observe(m);const Ee=new IntersectionObserver(o=>{H=o.some(t=>t.isIntersecting),H&&(z=0,B())});Ee.observe(m),S(window).addEventListener("pointermove",Ae,{passive:!0}),S(window).addEventListener("pointerdown",Se,{passive:!0}),S(window).addEventListener("pointerup",U,{passive:!0}),S(window).addEventListener("pointercancel",U,{passive:!0}),S(document.documentElement).addEventListener("pointerleave",Me),document.addEventListener("visibilitychange",Re),oe();let ke=R.current.dpr;return K.current=()=>{const o=$(R.current);if(o.dpr!==ke){ke=o.dpr,oe();return}C||ee(),B()},()=>{cancelAnimationFrame(C),K.current=null,be.disconnect(),Ee.disconnect(),S(window).removeEventListener("pointermove",Ae),S(window).removeEventListener("pointerdown",Se),S(window).removeEventListener("pointerup",U),S(window).removeEventListener("pointercancel",U),S(document.documentElement).removeEventListener("pointerleave",Me),document.removeEventListener("visibilitychange",Re),y&&e.deleteProgram(y.program),e.deleteBuffer(ue),e.deleteVertexArray(Y),h.isConnected?w&&Ne(e,I,w):e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),W.useEffect(()=>{K.current?.()}),We.jsx("div",{ref:le,className:`floating-lines-container${se?` ${se}`:""}`,style:{...at,mixBlendMode:re||ae?"normal":ot},...rt,children:We.jsx("canvas",{ref:ce,className:"floating-lines-canvas","aria-hidden":"true"})})};export{Rt as default};
