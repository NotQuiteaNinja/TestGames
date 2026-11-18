import{r as w,j as fe}from"./index-uEvbEw5g.js";import{b as m}from"./App-Dofw4Ib9.js";import{b as X}from"./_cmdrushBeat-CLoDPAAd.js";import"./react-vendor-DHz4kLit.js";const q=4,Fe=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,He=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uFlow;
uniform float uHue;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform vec2 uShift;
uniform vec4 uCursor;
uniform vec4 uPulses[${q}];
uniform float uSpectrum;
uniform float uTilt;
uniform vec3 uIntro;
uniform float uLightMode;
uniform float uOpacity;
out vec4 fragColor;

#define TAU 6.28318

vec3 gradientHash(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 234.6)),
    dot(p, vec3(269.5, 183.3, 198.3)),
    dot(p, vec3(169.5, 283.3, 156.9))
  );
  vec3 h = fract(sin(p) * 43758.5453123);
  float phi = acos(2.0 * h.x - 1.0);
  float theta = TAU * h.y;
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
}

float quinticSmooth(float t) {
  float t2 = t * t;
  float t3 = t * t2;
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
}

vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
  float x = px * frequency;
  float y = py * frequency;

  float fx = floor(x);
  float fy = floor(y);
  float fz = floor(pz);
  float cx = ceil(x);
  float cy = ceil(y);
  float cz = ceil(pz);

  vec3 g000 = gradientHash(vec3(fx, fy, fz));
  vec3 g100 = gradientHash(vec3(cx, fy, fz));
  vec3 g010 = gradientHash(vec3(fx, cy, fz));
  vec3 g110 = gradientHash(vec3(cx, cy, fz));
  vec3 g001 = gradientHash(vec3(fx, fy, cz));
  vec3 g101 = gradientHash(vec3(cx, fy, cz));
  vec3 g011 = gradientHash(vec3(fx, cy, cz));
  vec3 g111 = gradientHash(vec3(cx, cy, cz));

  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

  float sx = quinticSmooth(x - fx);
  float sy = quinticSmooth(y - fy);
  float sz = quinticSmooth(pz - fz);

  float lx00 = mix(d000, d100, sx);
  float lx10 = mix(d010, d110, sx);
  float lx01 = mix(d001, d101, sx);
  float lx11 = mix(d011, d111, sx);

  float ly0 = mix(lx00, lx10, sy);
  float ly1 = mix(lx01, lx11, sy);

  return amplitude * mix(ly0, ly1, sz);
}

float auroraGlow(float t, vec2 uv, float bend) {
  float noiseVal = 0.0;
  float freq = uNoiseFreq;
  float amp = uNoiseAmp;
  vec2 samplePos = uv * uScale;

  for (float i = 0.0; i < 3.0; i += 1.0) {
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
    amp *= uOctaveDecay;
    freq *= 2.0;
  }

  float yBand = uv.y * 10.0 - (uBandHeight + bend) * 10.0;
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * uIntro.y * abs(noiseVal * uIntro.z + yBand))), 0.0);
}

vec2 turn(vec2 p, vec2 center) {
  float c = cos(uTilt);
  float s = sin(uTilt);
  vec2 d = p - center;
  return center + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 center = vec2(0.5 * uResolution.x / uResolution.y, 0.5);
  vec2 screen = turn(gl_FragCoord.xy / uResolution.y, center);
  vec2 cursor = turn(uCursor.xy, center);
  vec2 field = screen + uShift;
  float t = 0.4 * uFlow;

  float reach = exp(-pow((screen.x - cursor.x) / 0.32, 2.0)) * uCursor.z;
  float gap = cursor.y + uShift.y - uBandHeight;
  float near = exp(-gap * gap / 0.16);
  float bend = reach * gap * near * 0.55;

  float pulse = 0.0;
  for (int i = 0; i < ${q}; i++) {
    vec4 wave = uPulses[i];
    if (wave.z <= 0.0) continue;
    float x = (abs(screen.x - turn(wave.xy, center).x) - wave.w * 0.55) / (0.1 + wave.w * 0.06);
    pulse += wave.z * exp(-x * x);
  }
  float boost = (1.0 + reach * near * 0.25 + pulse * 0.65) * uIntro.x;

  float glow1 = auroraGlow(t, field, bend) * boost;
  float glow2 = auroraGlow(t + uLayerOffset, field, bend) * boost;
  vec3 gradient1 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.2, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)), uSpectrum);
  vec3 gradient2 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.1, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)), uSpectrum);

  vec3 col = 0.99 * glow1 * gradient1 * uColor1;
  col += 0.99 * glow2 * gradient2 * uColor2;
  col *= uBrightness;

  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  if (uLightMode > 0.5) {
    float energy = max(col.r, max(col.g, col.b));
    vec3 hue = clamp(col / max(energy, 1e-4), 0.0, 1.0);
    vec3 average = (glow1 * uColor1 + glow2 * uColor2) / max(glow1 + glow2, 1e-4);
    float top = max(average.r, max(average.g, average.b));
    float spread = top - min(average.r, min(average.g, average.b));
    float core = smoothstep(0.55, 1.6, energy);
    float depth = 1.25 + 0.45 * core;
    vec3 tint = mix(average * 0.82, pow(average / max(top, 1e-4), vec3(depth + 0.6)), smoothstep(0.04, 0.2, spread));
    float vivid = smoothstep(0.12, 0.55, 1.0 - min(hue.r, min(hue.g, hue.b))) * smoothstep(0.04, 0.2, spread);
    vec3 ink = mix(tint, pow(hue, vec3(depth)), vivid) * mix(0.93, 0.8, core);
    float density = 0.88 * (1.0 - exp(-1.9 * pow(energy, 1.7)));
    density = clamp(density * uOpacity + grain, 0.0, 1.0);
    fragColor = vec4(ink * density, density);
  } else {
    float alpha = clamp(length(col), 0.0, 1.0);
    vec3 color = clamp(col, 0.0, 1.0);
    fragColor = vec4(clamp(color * alpha + grain, 0.0, alpha) * uOpacity, alpha * uOpacity);
  }
}`,b=(t,a,c)=>Math.min(c,Math.max(a,t)),ue=t=>{const a=String(t||"").trim(),c=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(a);if(c){const g=c[1].length===3?c[1].replace(/./g,p=>p+p):c[1];return[0,2,4].map(p=>parseInt(g.slice(p,p+2),16)/255)}const r=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(a);return r?[r[1],r[2],r[3]].map(g=>b(parseFloat(g)/255,0,1)):null},de=(t,a,c)=>{const r=t.createShader(a);return r?(t.shaderSource(r,c),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS)?r:(console.error(t.getShaderInfoLog(r)),t.deleteShader(r),null)):null},Ie=t=>{const a=de(t,t.VERTEX_SHADER,Fe),c=de(t,t.FRAGMENT_SHADER,He),r=a&&c?t.createProgram():null;if(!a||!c||!r)return a&&t.deleteShader(a),c&&t.deleteShader(c),null;if(t.attachShader(r,a),t.attachShader(r,c),t.linkProgram(r),t.deleteShader(a),t.deleteShader(c),!t.getProgramParameter(r,t.LINK_STATUS))return console.error(t.getProgramInfoLog(r)),t.deleteProgram(r),null;const g={},p=t.getProgramParameter(r,t.ACTIVE_UNIFORMS);for(let L=0;L<p;L++){const R=t.getActiveUniform(r,L);R&&(g[R.name.replace(/\[0\]$/,"")]=t.getUniformLocation(r,R.name))}return{program:r,uniforms:g}},$=t=>{const a=b(t,0,1);return a*a*a*(a*(a*6-15)+10)},De=({speed:t=.6,scale:a=1.5,brightness:c=1,color1:r="#f7f7f7",color2:g="#e100ff",noiseFrequency:p=2.5,noiseAmplitude:L=1,bandHeight:R=.5,bandSpread:me=1,octaveDecay:pe=.1,layerOffset:ve=0,colorSpeed:he=1,spectrum:xe=1,tilt:ge=0,enableMouseInteraction:ye=!0,mouseInfluence:we=.25,clickPulse:be=!0,intro:Se=!0,lightMode:ze=!1,opacity:Me=1,className:j="",style:Ee})=>{const Y=w.useRef(null),K=w.useRef(null),B=w.useRef(null),[W,Le]=w.useState(0),J={speed:Math.max(0,t),scale:Math.max(.01,a),brightness:Math.max(0,c),color1:ue(r)||[.969,.969,.969],color2:ue(g)||[.882,0,1],noiseFrequency:Math.max(.01,p),noiseAmplitude:Math.max(0,L),bandHeight:R,bandSpread:Math.max(0,me),octaveDecay:Math.max(0,pe),layerOffset:ve,colorSpeed:he,spectrum:b(xe,0,1),tilt:b(ge,-90,90)*Math.PI/180,mouse:ye,influence:Math.max(0,we),clickPulse:be,intro:Se,light:ze,opacity:b(Me,0,1)},A=w.useRef(J);return A.current=J,w.useEffect(()=>{B.current?.()}),w.useEffect(()=>{const C=Y.current,s=K.current;if(!C||!s)return;const o=s.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"}),H=o?Ie(o):null;if(!o||!H)return;const _=window.matchMedia("(prefers-reduced-motion: reduce)").matches,Q=o.createVertexArray(),S={width:1,height:1},v={x:.5,y:.5,inside:!1},l={x:.5,y:.5,presence:0},h=[],z=new Float32Array(q*4);let Z=0,ee=0,M=A.current.intro&&!_&&W===0?0:1,y=0,I=0,D=!0,N=document.visibilityState!=="hidden",V=!1,U=!1;const Re=()=>{const n=X(A.current),e=C.getBoundingClientRect(),f=Math.max(1,e.width),P=Math.max(1,e.height),d=b(.35+.04*n.noiseFrequency*n.scale,.5,1),F=Math.max(1,Math.round(f*d)),E=Math.max(1,Math.round(P*d));(s.width!==F||s.height!==E)&&(s.width=F,s.height=E),S.width=f,S.height=P},G=()=>{U=!0,x()},te=n=>{if(y=0,U&&(U=!1,Re()),V)return;const e=X(A.current),f=b((n-I)/1e3||0,0,.05);I=Math.max(I,n);const P=_?.35:1;Z+=f*e.speed*P,ee+=f*e.speed*e.colorSpeed*P,M<1&&(M=Math.min(1,M+f/2));const d=e.mouse&&v.inside,F=1-Math.exp(-f/.325);l.x+=((d?v.x:.5)-l.x)*F,l.y+=((d?v.y:.5)-l.y)*F,l.presence+=((d?1:0)-l.presence)*(1-Math.exp(-f/(d?.45:.8)));for(let u=h.length-1;u>=0;u--)h[u].age+=f,h[u].age>=2.6&&h.splice(u,1);z.fill(0),h.forEach((u,T)=>{z[T*4]=u.x,z[T*4+1]=u.y,z[T*4+2]=$(u.age/.18)*(1-$((u.age-.18)/2.42)),z[T*4+3]=u.age});const E=1-Math.pow(1-M,3),Ae=S.width/S.height,Ce=Math.min(1,e.influence*4)*l.presence;o.viewport(0,0,s.width,s.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(H.program),o.bindVertexArray(Q);const i=H.uniforms;o.uniform2f(i.uResolution,s.width,s.height),o.uniform1f(i.uFlow,Z),o.uniform1f(i.uHue,ee),o.uniform1f(i.uScale,e.scale),o.uniform1f(i.uBrightness,e.brightness),o.uniform3f(i.uColor1,e.color1[0],e.color1[1],e.color1[2]),o.uniform3f(i.uColor2,e.color2[0],e.color2[1],e.color2[2]),o.uniform1f(i.uNoiseFreq,e.noiseFrequency),o.uniform1f(i.uNoiseAmp,e.noiseAmplitude),o.uniform1f(i.uBandHeight,e.bandHeight),o.uniform1f(i.uBandSpread,e.bandSpread),o.uniform1f(i.uOctaveDecay,e.octaveDecay),o.uniform1f(i.uLayerOffset,e.layerOffset),o.uniform2f(i.uShift,(l.x-.5)*e.influence*(e.mouse?1:0),(l.y-.5)*e.influence*(e.mouse?1:0)),o.uniform4f(i.uCursor,l.x*Ae,l.y,Ce,0),o.uniform4fv(i.uPulses,z),o.uniform1f(i.uSpectrum,e.spectrum),o.uniform1f(i.uTilt,e.tilt),o.uniform3f(i.uIntro,$(M/.7),1+3*(1-E)*(1-E),.25+.75*E),o.uniform1f(i.uLightMode,e.light?1:0),o.uniform1f(i.uOpacity,e.opacity),o.drawArrays(o.TRIANGLES,0,3);const Pe=Math.abs(l.x-(d?v.x:.5))>1e-4||Math.abs(l.y-(d?v.y:.5))>1e-4||Math.abs((d?1:0)-l.presence)>.001||h.length>0;(e.speed>0||M<1||Pe)&&D&&N&&(y=requestAnimationFrame(te))},x=()=>{y||V||!D||!N||(I=performance.now(),y=requestAnimationFrame(te))};B.current=()=>{G(),x()};const oe=n=>{const e=C.getBoundingClientRect();return{x:(n.clientX-e.left)/Math.max(1,e.width),y:1-(n.clientY-e.top)/Math.max(1,e.height),inside:n.clientX>=e.left&&n.clientX<=e.right&&n.clientY>=e.top&&n.clientY<=e.bottom}},re=n=>{const e=oe(n);v.x=e.x,v.y=e.y,v.inside=e.inside,x()},ne=n=>{const e=X(A.current),f=oe(n);!f.inside||!e.clickPulse||_||(h.push({x:f.x*(S.width/S.height),y:f.y,age:0}),h.length>q&&h.shift(),x())},k=()=>{v.inside=!1,x()},O=n=>{n.pointerType!=="mouse"&&k()};m(window).addEventListener("pointermove",re,{passive:!0}),m(window).addEventListener("pointerdown",ne,{passive:!0}),m(window).addEventListener("pointerup",O,{passive:!0}),m(window).addEventListener("pointercancel",O,{passive:!0}),m(document.documentElement).addEventListener("pointerleave",k);const ae=n=>{n.preventDefault(),V=!0,cancelAnimationFrame(y),y=0},ie=()=>Le(n=>n+1);s.addEventListener("webglcontextlost",ae),s.addEventListener("webglcontextrestored",ie);const ce=new ResizeObserver(()=>{G(),x()});ce.observe(C);const se=new IntersectionObserver(n=>{D=n.some(e=>e.isIntersecting),x()});se.observe(C);const le=()=>{N=document.visibilityState!=="hidden",x()};return document.addEventListener("visibilitychange",le),G(),x(),()=>{cancelAnimationFrame(y),B.current=null,ce.disconnect(),se.disconnect(),m(window).removeEventListener("pointermove",re),m(window).removeEventListener("pointerdown",ne),m(window).removeEventListener("pointerup",O),m(window).removeEventListener("pointercancel",O),m(document.documentElement).removeEventListener("pointerleave",k),document.removeEventListener("visibilitychange",le),s.removeEventListener("webglcontextlost",ae),s.removeEventListener("webglcontextrestored",ie),o.isContextLost()||(o.deleteVertexArray(Q),o.deleteProgram(H.program))}},[W]),fe.jsx("div",{ref:Y,className:`soft-aurora${j?` ${j}`:""}`,style:Ee,children:fe.jsx("canvas",{ref:K,className:"soft-aurora__canvas","aria-hidden":"true"})})};export{De as default};
