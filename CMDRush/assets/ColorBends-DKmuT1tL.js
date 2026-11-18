import{r as a,j as se}from"./index-uEvbEw5g.js";import{b as H}from"./App-Dofw4Ib9.js";import{b as Y}from"./_cmdrushBeat-CLoDPAAd.js";import{V as m,S as ie,O as le,P as ce,a as J,b as fe,M as me,W as ve,c as de,C as pe}from"./three.module-DdQf8mAU.js";import"./react-vendor-DHz4kLit.js";const h=8,he=`
#define MAX_COLORS ${h}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer; // in NDC [-1,1]
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 shift = vec2(0.2 * cos(t) - 7.56);
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

    for (int j = 0; j < 5; j++) {
      if (j >= uIterations - 1) break;
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
      q += (rr - q) * 0.15;
      shift *= 0.85;
    }

    vec3 col = vec3(0.0);
    float a = 1.0;

    if (uColorCount > 0) {
      vec2 s = q;
      vec3 sumCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
            if (i >= uColorCount) break;
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3); // strong response across 0..1
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0); // allow >1 to amplify displacement
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float spare = 1.0 - kBelow * gain;
            if (spare != 0.0) warped -= shift * spare;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float m = mix(m0, m1, kMix);
            float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
            sumCol += uColors[i] * w;
            cover = max(cover, w);
      }
      col = clamp(sumCol, 0.0, 1.0);
      a = uTransparent > 0 ? cover : 1.0;
    } else {
        vec2 s = q;
        for (int k = 0; k < 3; ++k) {
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float spare = 1.0 - kBelow * gain;
            if (spare != 0.0) warped -= shift * spare;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float m = mix(m0, m1, kMix);
            col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
        }
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    col *= uIntensity;

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    vec3 rgb = (uTransparent > 0) ? col * a : col;
    gl_FragColor = vec4(rgb, a);
}
`,ge=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;function qe({className:K,style:Q,rotation:g=90,speed:w=.2,colors:A=[],transparent:v=!0,autoRotate:y=0,scale:C=1,frequency:R=1,warpStrength:x=1,mouseInfluence:S=1,parallax:q=.5,noise:k=.15,iterations:b=1,intensity:I=1.5,bandWidth:M=6}){const B=a.useRef(null),j=a.useRef(null),c=a.useRef(null),E=a.useRef(null),F=a.useRef(null),z=a.useRef(g),N=a.useRef(y),_=a.useRef(new m(0,0)),Z=a.useRef(new m(0,0)),ee=a.useRef(8),V={speed:w,scale:C,frequency:R,warpStrength:x,mouseInfluence:S,parallax:q,noise:k,iterations:b,intensity:I,bandWidth:M,transparent:v},P=a.useRef(V);return P.current=V,a.useEffect(()=>{const e=B.current,n=Y(P.current),l=new ie,s=new le(-1,1,1,-1,0,1),u=new ce(2,2),t=Array.from({length:h},()=>new J(0,0,0)),r=new fe({vertexShader:ge,fragmentShader:he,uniforms:{uCanvas:{value:new m(1,1)},uTime:{value:0},uSpeed:{value:n.speed},uRot:{value:new m(1,0)},uColorCount:{value:0},uColors:{value:t},uTransparent:{value:n.transparent?1:0},uScale:{value:n.scale},uFrequency:{value:n.frequency},uWarpStrength:{value:n.warpStrength},uPointer:{value:new m(0,0)},uMouseInfluence:{value:n.mouseInfluence},uParallax:{value:n.parallax},uNoise:{value:n.noise},uIterations:{value:n.iterations},uIntensity:{value:n.intensity},uBandWidth:{value:n.bandWidth}},premultipliedAlpha:!0,transparent:!0});E.current=r;const ne=new me(u,r);l.add(ne);const o=new ve({antialias:!1,powerPreference:"high-performance",alpha:!0});j.current=o,o.outputColorSpace=de,o.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),o.setClearColor(0,n.transparent?0:1),o.domElement.style.width="100%",o.domElement.style.height="100%",o.domElement.style.display="block",e.appendChild(o.domElement);const te=new pe,d=()=>{const i=e.clientWidth||1,f=e.clientHeight||1;o.setSize(i,f,!1),r.uniforms.uCanvas.value.set(i,f),o.render(l,s)};if(d(),"ResizeObserver"in window){const i=new ResizeObserver(d);i.observe(e),F.current=i}else window.addEventListener("resize",d);let W=0,O=!0,p=!1;const L=()=>{if(c.current=null,!O||document.hidden)return;const i=te.getDelta(),f=p?0:i;p=!1,W+=f,r.uniforms.uTime.value=W;const T=Y(P.current);r.uniforms.uIntensity.value=T.intensity,r.uniforms.uWarpStrength.value=T.warpStrength,r.uniforms.uSpeed.value=T.speed;const D=(z.current%360+N.current*W)*Math.PI/180,re=Math.cos(D),oe=Math.sin(D);r.uniforms.uRot.value.set(re,oe);const $=Z.current,ue=_.current,ae=Math.min(1,f*ee.current);$.lerp(ue,ae),r.uniforms.uPointer.value.copy($),o.render(l,s),c.current=requestAnimationFrame(L)},X=()=>{c.current!==null||!O||document.hidden||(p=!0,c.current=requestAnimationFrame(L))},U=()=>{document.hidden||(p=!0,X())},G=new IntersectionObserver(i=>{O=i.some(f=>f.isIntersecting),X()});return G.observe(e),document.addEventListener("visibilitychange",U),c.current=requestAnimationFrame(L),()=>{c.current!==null&&cancelAnimationFrame(c.current),G.disconnect(),document.removeEventListener("visibilitychange",U),F.current?F.current.disconnect():window.removeEventListener("resize",d),u.dispose(),r.dispose(),o.dispose(),o.forceContextLoss(),o.domElement&&o.domElement.parentElement===e&&e.removeChild(o.domElement)}},[]),a.useEffect(()=>{const e=E.current,n=j.current;if(!e)return;z.current=g,N.current=y,e.uniforms.uSpeed.value=w,e.uniforms.uScale.value=C,e.uniforms.uFrequency.value=R,e.uniforms.uWarpStrength.value=x,e.uniforms.uMouseInfluence.value=S,e.uniforms.uParallax.value=q,e.uniforms.uNoise.value=k,e.uniforms.uIterations.value=b,e.uniforms.uIntensity.value=I,e.uniforms.uBandWidth.value=M;const l=u=>{const t=u.replace("#","").trim(),r=t.length===3?[parseInt(t[0]+t[0],16),parseInt(t[1]+t[1],16),parseInt(t[2]+t[2],16)]:[parseInt(t.slice(0,2),16),parseInt(t.slice(2,4),16),parseInt(t.slice(4,6),16)];return new J(r[0]/255,r[1]/255,r[2]/255)},s=(A||[]).filter(Boolean).slice(0,h).map(l);for(let u=0;u<h;u++){const t=e.uniforms.uColors.value[u];u<s.length?t.copy(s[u]):t.set(0,0,0)}e.uniforms.uColorCount.value=s.length,e.uniforms.uTransparent.value=v?1:0,n&&n.setClearColor(0,v?0:1)},[g,y,w,C,R,x,S,q,k,b,I,M,A,v]),a.useEffect(()=>{const e=E.current,n=B.current;if(!e||!n)return;const l=s=>{const u=n.getBoundingClientRect(),t=(s.clientX-u.left)/(u.width||1)*2-1,r=-((s.clientY-u.top)/(u.height||1)*2-1);_.current.set(t,r)};return H(n).addEventListener("pointermove",l),()=>{H(n).removeEventListener("pointermove",l)}},[]),se.jsx("div",{ref:B,className:`color-bends-container ${K}`,style:Q})}export{qe as default};
