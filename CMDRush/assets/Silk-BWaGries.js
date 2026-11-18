import{r as M,j as de}from"./index-uEvbEw5g.js";import{b as S}from"./App-Dofw4Ib9.js";import{b as U}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const Be=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,we=`
uniform vec2 uView;
uniform float uScale;
uniform float uRotation;
uniform float uTime;
uniform float uWave;
uniform float uRipple;
uniform float uFold;
uniform vec2 uShift;
uniform vec4 uPointer;
uniform vec2 uDrag;
uniform vec4 uWaves[4];

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2 r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2 rot = mat2(c, -s, s, c);
  return rot * uv;
}

vec2 bend(vec2 uv) {
  vec2 aspect = vec2(uView.x / uView.y, 1.0);
  vec2 offset = (uv - uPointer.xy) * aspect;
  float touch = uPointer.z * exp(-dot(offset, offset) / (uPointer.w * uPointer.w));
  uv -= uDrag * touch;
  for (int i = 0; i < 4; i++) {
    vec4 wave = uWaves[i];
    if (wave.w <= 0.0) continue;
    vec2 q = (uv - wave.xy) * aspect;
    float dist = length(q);
    float front = dist - wave.z;
    float ring = exp(-front * front * 60.0) * wave.w;
    uv += q / max(dist, 0.0001) / aspect * ring * 0.034 * sin(front * 34.0);
  }
  return uv;
}

float silk(vec2 vUv) {
  vec2 uv = rotateUvs(vUv * uScale, uRotation);
  vec2 tex = uv * uScale + uShift;
  float tOffset = uTime;
  tex.y += 0.03 * uWave * sin(8.0 * tex.x - tOffset);
  return 0.6 + 0.4 * uFold * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) + uRipple * sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));
}
`,Ge=`#version 300 es
precision highp float;
${we}
out vec4 outColor;

void main() {
  vec2 vUv = gl_FragCoord.xy / uView;
  float pattern = silk(bend(vUv));
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);
  outColor = vec4(pow(n, 6.0), 0.0, 0.0, 1.0);
}`,Ne=`#version 300 es
precision highp float;
${we}
uniform sampler2D uBloom;
uniform vec3 uColor;
uniform vec3 uSheenColor;
uniform float uNoiseIntensity;
uniform float uDepth;
uniform float uSheen;
uniform float uGlow;
uniform float uLightMode;
uniform vec3 uLight;
uniform vec2 uStep;
uniform float uPresence;
uniform float uFade;
out vec4 outColor;

float smootherstep01(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec3 softClip(vec3 c) {
  vec3 over = max(c - 0.75, 0.0);
  return min(c, 0.75) + 0.25 * (1.0 - exp(-over * 4.0));
}

void main() {
  vec2 vUv = gl_FragCoord.xy / uView;
  vec2 coord = bend(vUv);
  float pattern = silk(coord);
  float rnd = noise(gl_FragCoord.xy);
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);

  float gx = silk(coord + vec2(uStep.x, 0.0)) - pattern;
  float gy = silk(coord + vec2(0.0, uStep.y)) - pattern;
  vec3 normal = normalize(vec3(-gx * 26.0, -gy * 26.0, 1.0));
  vec3 toLight = normalize(vec3(uLight.xy, 0.85));
  float relief = 1.0 + (dot(normal, toLight) - toLight.z) * 1.8 * uDepth;
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));
  float gloss = pow(max(dot(normal, halfway), 0.0), 48.0) * smoothstep(0.25, 0.85, n);
  float crest = pow(n, 5.0);
  float shine = (gloss * 0.85 + crest * 0.4) * uSheen * (1.0 + uLight.z * 0.6);

  float bloom = 0.0;
  if (uGlow > 0.0) {
    bloom += textureLod(uBloom, vUv, 1.0).r * 0.35;
    bloom += textureLod(uBloom, vUv, 2.0).r * 0.3;
    bloom += textureLod(uBloom, vUv, 3.0).r * 0.2;
    bloom += textureLod(uBloom, vUv, 4.0).r * 0.15;
  }

  vec3 result;
  if (uLightMode > 0.5) {
    float fold = smoothstep(0.28, 0.9, pattern);
    float specular = smoothstep(0.72, 0.98, pattern);
    vec3 shadowColor = uColor * (0.72 - 0.12 * uDepth);
    vec3 bodyColor = min(uColor * 1.18, vec3(1.0));
    vec3 lightBase = mix(shadowColor, bodyColor, fold) * mix(1.0, relief, 0.6);
    lightBase = mix(lightBase, vec3(1.0), clamp(specular * 0.92 + shine * 0.22 + bloom * uGlow * 0.2, 0.0, 1.0));
    float fineNoise = noise(gl_FragCoord.xy * 0.63 + vec2(17.0, 41.0));
    float grainSignal = (rnd + fineNoise - 1.0);
    float grainStrength = clamp(uNoiseIntensity * 0.038, 0.0, 0.16);
    result = clamp(lightBase + grainSignal * grainStrength, 0.0, 1.0);
  } else {
    float grain = rnd / 15.0 * uNoiseIntensity;
    float floorValue = mix(0.2, 0.03, uDepth);
    float curve = uDepth > 0.0 ? pow(n, 1.0 + 1.4 * uDepth) : n;
    float shade = uDepth > 0.0 ? floorValue + (1.0 - floorValue) * curve : pattern;
    vec3 tone = mix(uColor, pow(uColor, vec3(1.45)), (1.0 - n) * uDepth);
    vec3 lit = tone * shade * relief - vec3(grain);
    vec3 tint = mix(uColor, uSheenColor, 0.8);
    vec3 extra = tint * (shine + bloom * uGlow * 0.55);
    float blend = clamp((uSheen + uGlow) * 4.0, 0.0, 1.0);
    result = mix(clamp(lit, 0.0, 1.0), clamp(softClip(lit + extra), 0.0, 1.0), blend);
  }

  float edge = uFade * 0.5;
  float mask = 1.0;
  if (edge > 0.0) {
    mask = smootherstep01(vUv.x / edge) * smootherstep01((1.0 - vUv.x) / edge);
    mask *= smootherstep01(vUv.y / edge) * smootherstep01((1.0 - vUv.y) / edge);
  }
  float alpha = uPresence * mask;
  outColor = vec4(result * alpha, alpha);
}`,Ye=2.2,Oe=1.6,ve=1.6,A=[-.55,.7],ge=Math.hypot(A[0],A[1]),N=(r,d,h)=>Math.min(h,Math.max(d,r)),Ve=r=>r*r*r*(r*(r*6-15)+10),ke=r=>{const d=Number(r)||0;if(!d)return[0,0];const h=u=>{const s=Math.sin(d*12.9898+u*78.233)*43758.5453;return s-Math.floor(s)-.5};return[h(1)*6,h(2)*6]},pe=(r,d,h)=>{const u=r.createShader(d);return u?(r.shaderSource(u,h),r.compileShader(u),r.getShaderParameter(u,r.COMPILE_STATUS)?u:(r.deleteShader(u),null)):null},xe=(r,d)=>{const h=pe(r,r.VERTEX_SHADER,Be),u=pe(r,r.FRAGMENT_SHADER,d),s=r.createProgram();if(!h||!u||!s)return null;if(r.attachShader(s,h),r.attachShader(s,u),r.bindAttribLocation(s,0,"aPosition"),r.linkProgram(s),r.deleteShader(h),r.deleteShader(u),!r.getProgramParameter(s,r.LINK_STATUS))return r.deleteProgram(s),null;const C={},Y=r.getProgramParameter(s,r.ACTIVE_UNIFORMS);for(let L=0;L<Y;L++){const F=r.getActiveUniform(s,L);F&&(C[F.name.replace(/\[0\]$/,"")]=r.getUniformLocation(s,F.name))}return{program:s,uniforms:C}},$e=({speed:r=5,scale:d=1,color:h="#7B7481",sheenColor:u="#ffffff",noiseIntensity:s=1.5,rotation:C=0,sheen:Y=.5,depth:L=.5,glow:F=.3,ripple:Ee=1,wave:Re=1,variation:Te=0,mouseInteraction:ye=!0,interactionStrength:be=1,clickRipple:Me=!0,intro:Se=!0,fade:Ae=0,lightMode:Le=!1,paused:Fe=!1,dpr:_e,className:K="",style:Pe})=>{const J=M.useRef(null),Q=M.useRef(null),O=M.useRef(null),g=M.useRef(null);return g.current={speed:r,scale:d,color:String(h),sheenColor:String(u),noiseIntensity:Math.max(0,s),rotation:C,sheen:Math.max(0,Y),depth:N(L,0,1),glow:Math.max(0,F),ripple:Math.max(0,Ee),wave:Math.max(0,Re),variation:Te,mouseInteraction:ye,interactionStrength:Math.max(0,be),clickRipple:Me,intro:Se,fade:N(Ae,0,1),lightMode:Le,paused:Fe,dpr:_e},M.useEffect(()=>{const E=J.current,m=Q.current,e=m?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!E||!m||!e)return;const D=xe(e,Ge),I=xe(e,Ne);if(!D||!I)return;const Z=e.createBuffer(),V=e.createVertexArray();e.bindVertexArray(V),e.bindBuffer(e.ARRAY_BUFFER,Z),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const _=e.createTexture(),k=e.createFramebuffer(),p={width:0,height:0},Ue=(t,n)=>{p.width===t&&p.height===n||(p.width=t,p.height=n,e.bindTexture(e.TEXTURE_2D,_),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,t,n,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,k),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,_,0))},R=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),W=new Map,ee=t=>{if(W.has(t))return W.get(t);let n=[1,1,1];if(R){R.clearRect(0,0,1,1),R.fillStyle="#ffffff",R.fillStyle=t,R.fillRect(0,0,1,1);const[a,i,c]=R.getImageData(0,0,1,1).data;n=[a/255,i/255,c/255]}return W.set(t,n),n},P=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,l={width:1,height:1,ratio:1},f={x:0,y:0,inside:!1},v=[],z=new Float32Array(16),o={flow:0,intro:g.current.intro&&!P?0:1,touch:0,x:0,y:0,dragX:0,dragY:0,lightX:A[0],lightY:A[1]};let T=0,y=0,X=!0;const te=(t,n,a,i,c)=>{const[b,$]=ke(i.variation);e.uniform2f(t.uView,n,a),e.uniform1f(t.uScale,i.scale),e.uniform1f(t.uRotation,i.rotation),e.uniform1f(t.uTime,o.flow-Oe*(1-c)),e.uniform1f(t.uWave,i.wave),e.uniform1f(t.uRipple,i.ripple),e.uniform1f(t.uFold,.25+.75*c),e.uniform2f(t.uShift,b,$),e.uniform4f(t.uPointer,o.x/l.width,1-o.y/l.height,o.touch*i.interactionStrength,.32),e.uniform2f(t.uDrag,o.dragX,o.dragY),e.uniform4fv(t.uWaves,z)},H=()=>{const t=U(g.current),n=Ve(o.intro),a=1-Math.pow(1-o.intro,3);e.bindVertexArray(V),z.fill(0),v.slice(-4).forEach((c,b)=>{z.set([c.x,c.y,c.age*.6,Math.exp(-c.age/(ve*.45))],b*4)}),t.glow>0&&(Ue(Math.max(1,Math.round(m.width/4)),Math.max(1,Math.round(m.height/4))),e.bindFramebuffer(e.FRAMEBUFFER,k),e.viewport(0,0,p.width,p.height),e.useProgram(D.program),te(D.uniforms,p.width,p.height,t,n),e.drawArrays(e.TRIANGLES,0,3),e.bindTexture(e.TEXTURE_2D,_),e.generateMipmap(e.TEXTURE_2D));const i=I.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,m.width,m.height),e.useProgram(I.program),te(i,m.width,m.height,t,n),e.uniform3fv(i.uColor,ee(t.color)),e.uniform3fv(i.uSheenColor,ee(t.sheenColor)),e.uniform1f(i.uNoiseIntensity,t.noiseIntensity),e.uniform1f(i.uDepth,t.depth),e.uniform1f(i.uSheen,t.sheen),e.uniform1f(i.uGlow,t.glow),e.uniform1f(i.uLightMode,t.lightMode?1:0),e.uniform3f(i.uLight,o.lightX,o.lightY,o.touch*t.interactionStrength),e.uniform2f(i.uStep,l.ratio/m.width,l.ratio/m.height),e.uniform1f(i.uPresence,a),e.uniform1f(i.uFade,t.fade),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,_),e.uniform1i(i.uBloom,0),e.drawArrays(e.TRIANGLES,0,3)},oe=t=>{if(T=0,!X||document.hidden)return;const n=U(g.current),a=y?Math.min(.05,(t-y)/1e3):1/60;y=t;const i=!n.paused&&!P&&n.speed!==0;i&&(o.flow+=a*.1*n.speed),!n.intro||P?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+a/Ye));const c=n.mouseInteraction&&f.inside&&!P;c&&o.touch<.01&&(o.x=f.x,o.y=f.y);const b=1-Math.exp(-a*10),$=o.x,Ce=o.y;o.x+=(f.x-o.x)*b,o.y+=(f.y-o.y)*b;const De=(o.x-$)/Math.max(a,.001)/l.height,Ie=(o.y-Ce)/Math.max(a,.001)/l.height,fe=1-Math.exp(-a*4);o.dragX+=(N(De*.03,-.06,.06)-o.dragX)*fe,o.dragY+=(N(-Ie*.03,-.06,.06)-o.dragY)*fe,o.touch+=((c?1:0)-o.touch)*(1-Math.exp(-a*(c?3.5:1.4)));let B=A[0],G=A[1];if(c){const x=(f.x/l.width-.5)*(l.width/l.height),me=.5-f.y/l.height,j=Math.hypot(x,me);j>.04?(B=x/j*ge,G=me/j*ge):(B=o.lightX,G=o.lightY)}const he=1-Math.exp(-a*3);o.lightX+=(B-o.lightX)*he,o.lightY+=(G-o.lightY)*he;for(let x=v.length-1;x>=0;x--)v[x].age+=a,v[x].age>ve*2.5&&v.splice(x,1);H();const Xe=o.intro<1||v.length>0||Math.abs((c?1:0)-o.touch)>.002||Math.abs(o.dragX)+Math.abs(o.dragY)>2e-4||Math.abs(f.x-o.x)+Math.abs(f.y-o.y)>.3||Math.abs(B-o.lightX)+Math.abs(G-o.lightY)>.001;i||Xe?T=requestAnimationFrame(oe):y=0},w=()=>{!T&&X&&!document.hidden&&(T=requestAnimationFrame(oe))},q=()=>{const t=U(g.current),n=Math.max(1,E.clientWidth),a=Math.max(1,E.clientHeight),i=Math.min(t.dpr||window.devicePixelRatio||1,2);l.width=n,l.height=a,l.ratio=i,m.width=Math.max(1,Math.round(n*i)),m.height=Math.max(1,Math.round(a*i)),H(),w()},re=t=>{const n=E.getBoundingClientRect(),a=t.clientX-n.left,i=t.clientY-n.top;return{x:a,y:i,inside:a>=0&&i>=0&&a<=n.width&&i<=n.height}},ne=t=>{const n=re(t);f.x=n.x,f.y=n.y,f.inside=n.inside,w()},ie=t=>{if(!U(g.current).clickRipple||P)return;const a=re(t);a.inside&&(v.push({x:a.x/l.width,y:1-a.y/l.height,age:0}),v.length>4&&v.shift(),w())},ae=()=>{f.inside=!1,w()},se=()=>{y=0,w()},le=new ResizeObserver(q);le.observe(E);const ce=new IntersectionObserver(t=>{X=t.some(n=>n.isIntersecting),X&&(y=0,w())});ce.observe(E),S(window).addEventListener("pointermove",ne,{passive:!0}),S(window).addEventListener("pointerdown",ie,{passive:!0}),S(document.documentElement).addEventListener("pointerleave",ae),document.addEventListener("visibilitychange",se),q();let ue=g.current.dpr;return O.current=()=>{const t=U(g.current);if(t.dpr!==ue){ue=t.dpr,q();return}T||H(),w()},()=>{cancelAnimationFrame(T),O.current=null,le.disconnect(),ce.disconnect(),S(window).removeEventListener("pointermove",ne),S(window).removeEventListener("pointerdown",ie),S(document.documentElement).removeEventListener("pointerleave",ae),document.removeEventListener("visibilitychange",se),e.deleteTexture(_),e.deleteFramebuffer(k),e.deleteProgram(D.program),e.deleteProgram(I.program),e.deleteBuffer(Z),e.deleteVertexArray(V),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),M.useEffect(()=>{O.current?.()}),de.jsx("div",{ref:J,className:`silk-container${K?` ${K}`:""}`,style:Pe,children:de.jsx("canvas",{ref:Q,className:"silk-canvas","aria-hidden":"true"})})};export{$e as default};
