import{r as B,j as b}from"./index-uEvbEw5g.js";import{b as E}from"./App-Dofw4Ib9.js";import{a as T}from"./_cmdrushBeat-CLoDPAAd.js";import{R as k,T as U,a as O,P as D,M as _}from"./Triangle-D_z1jqbi.js";import"./react-vendor-DHz4kLit.js";function N(l){const r=l.replace("#","");return[parseInt(r.slice(0,2),16)/255,parseInt(r.slice(2,4),16)/255,parseInt(r.slice(4,6),16)/255]}function z(l=256){const r=new Uint8Array(l*l*4);function g(s,c,n){let o=s*374761393+c*668265263+n*1274126177;return o=Math.imul(o^o>>>13,1274126177),((o^o>>>16)>>>0)/4294967296}function d(s,c,n,o){const v=s/l*n,m=c/l*n,a=Math.floor(v),u=Math.floor(m),t=v-a,f=m-u,e=n|0,R=g((a%e+e)%e,(u%e+e)%e,o),y=g(((a+1)%e+e)%e,(u%e+e)%e,o),i=g((a%e+e)%e,((u+1)%e+e)%e,o),h=g(((a+1)%e+e)%e,((u+1)%e+e)%e,o);return R*(1-t)*(1-f)+y*t*(1-f)+i*(1-t)*f+h*t*f}for(let s=0;s<l;s++)for(let c=0;c<l;c++){let n=0,o=.4,v=0;for(let u=0;u<8;u++){const t=32*(1<<u);n+=o*d(c,s,t,u*31),v+=o,o*=.65}n/=v,n=(n-.5)*2.2+.5,n=Math.max(0,Math.min(1,n));const m=Math.round(n*255),a=(s*l+c)*4;r[a]=m,r[a+1]=m,r[a+2]=m,r[a+3]=255}return r}const W=`
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`,j=`
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform sampler2D uNoiseTexture;
uniform float uPupilSize;
uniform float uIrisWidth;
uniform float uGlowIntensity;
uniform float uIntensity;
uniform float uScale;
uniform float uNoiseScale;
uniform vec2 uMouse;
uniform float uPupilFollow;
uniform float uFlameSpeed;
uniform vec3 uEyeColor;
uniform vec3 uBgColor;
uniform bool uLightMode;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;
  uv /= uScale;
  float ft = uTime * uFlameSpeed;

  float polarRadius = length(uv) * 2.0;
  float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;
  vec2 polarUv = vec2(polarRadius, polarAngle);

  vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));
  vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) * uNoiseScale + vec2(-ft * 0.2, 0.0));
  vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));

  float distanceMask = 1.0 - length(uv);

  // Inner ring
  float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / uIrisWidth), 0.0, 1.0);
  innerRing = (innerRing * distanceMask - 0.2) / 0.28;
  innerRing += noiseA.r - 0.5;
  innerRing *= 1.3;
  innerRing = clamp(innerRing, 0.0, 1.0);

  float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);
  outerRing = (outerRing * distanceMask - 0.1) / 0.38;
  outerRing += noiseC.r - 0.5;
  outerRing *= 1.3;
  outerRing = clamp(outerRing, 0.0, 1.0);

  innerRing += outerRing;

  // Inner eye
  float innerEye = distanceMask - 0.1 * 2.0;
  innerEye *= noiseB.r * 2.0;

  // Pupil with cursor tracking
  vec2 pupilOffset = uMouse * uPupilFollow * 0.12;
  vec2 pupilUv = uv - pupilOffset;
  float pupil = 1.0 - length(pupilUv * vec2(9.0, 2.3));
  pupil *= uPupilSize;
  pupil = clamp(pupil, 0.0, 1.0);
  pupil /= 0.35;

  // Outer eye
  float outerEyeGlow = 1.0 - length(uv * vec2(0.5, 1.5));
  outerEyeGlow = clamp(outerEyeGlow + 0.5, 0.0, 1.0);
  outerEyeGlow += noiseC.r - 0.5;
  float outerBgGlow = outerEyeGlow;
  outerEyeGlow = pow(outerEyeGlow, 2.0);
  outerEyeGlow += distanceMask;
  outerEyeGlow *= uGlowIntensity;
  outerEyeGlow = clamp(outerEyeGlow, 0.0, 1.0);
  outerEyeGlow *= pow(1.0 - distanceMask, 2.0) * 2.5;

  // Outer eye bg glow
  outerBgGlow += distanceMask;
  outerBgGlow = pow(outerBgGlow, 0.5);
  outerBgGlow *= 0.15;

  vec3 eyeEnergy = uEyeColor * uIntensity * clamp(max(innerRing + innerEye, outerEyeGlow + outerBgGlow) - pupil, 0.0, 3.0);
  vec3 color;
  if (uLightMode) {
    vec3 mapped = vec3(1.0) - exp(-max(eyeEnergy, vec3(0.0)) * 1.3);
    float energy = clamp(max(mapped.r, max(mapped.g, mapped.b)), 0.0, 1.0);
    vec3 hue = mapped / max(energy, 0.0001);
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.2));
    color = mix(uBgColor, hue, smoothstep(0.02, 0.82, energy) * 0.96);
  } else {
    color = eyeEnergy + uBgColor;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;function J({eyeColor:l="#FF6F37",intensity:r=1.5,pupilSize:g=.6,irisWidth:d=.25,glowIntensity:s=.35,scale:c=.8,noiseScale:n=1,pupilFollow:o=1,flameSpeed:v=1,backgroundColor:m="#000000",lightMode:a=!1}){const u=B.useRef(null);return B.useEffect(()=>{if(!u.current)return;const t=u.current,f=new k({alpha:!0,premultipliedAlpha:!1}),e=f.gl;e.clearColor(0,0,0,0);const R=z(256),y=new U(e,{image:R,width:256,height:256,generateMipmaps:!1,flipY:!1});y.minFilter=e.LINEAR,y.magFilter=e.LINEAR,y.wrapS=e.REPEAT,y.wrapT=e.REPEAT;const i={x:0,y:0,tx:0,ty:0};function h(w){const x=t.getBoundingClientRect();i.tx=(w.clientX-x.left)/x.width*2-1,i.ty=-((w.clientY-x.top)/x.height*2-1)}function F(){i.tx=0,i.ty=0}E(t).addEventListener("mousemove",h),E(t).addEventListener("mouseleave",F);let p;function S(){f.setSize(t.offsetWidth,t.offsetHeight),p&&(p.uniforms.uResolution.value=[e.canvas.width,e.canvas.height,e.canvas.width/e.canvas.height])}let M=!1;const G=()=>{M=!0},C=new ResizeObserver(G);C.observe(t),window.addEventListener("resize",G),S();const L=new O(e);p=new D(e,{vertex:W,fragment:j,uniforms:{uTime:{value:0},uResolution:{value:[e.canvas.width,e.canvas.height,e.canvas.width/e.canvas.height]},uNoiseTexture:{value:y},uPupilSize:{value:g},uIrisWidth:{value:d},uGlowIntensity:{value:s},uIntensity:{value:r},uScale:{value:c},uNoiseScale:{value:n},uMouse:{value:[0,0]},uPupilFollow:{value:o},uFlameSpeed:{value:v},uEyeColor:{value:N(l)},uBgColor:{value:N(m)},uLightMode:{value:a}}});const P=new _(e,{geometry:L,program:p});t.appendChild(e.canvas);let I;function A(w){M&&(M=!1,S()),I=requestAnimationFrame(A),i.x+=(i.tx-i.x)*.05,i.y+=(i.ty-i.y)*.05,p.uniforms.uMouse.value=[i.x,i.y],p.uniforms.uTime.value=w*.001,p.uniforms.uIntensity.value=T("intensity",r),p.uniforms.uGlowIntensity.value=T("glowIntensity",s),p.uniforms.uFlameSpeed.value=T("flameSpeed",v),f.render({scene:P})}return I=requestAnimationFrame(A),()=>{cancelAnimationFrame(I),window.removeEventListener("resize",G),C.disconnect(),E(t).removeEventListener("mousemove",h),E(t).removeEventListener("mouseleave",F),t.removeChild(e.canvas),e.getExtension("WEBGL_lose_context")?.loseContext()}},[l,r,g,d,s,c,n,o,v,m,a]),b.jsx("div",{ref:u,className:"evil-eye-container"})}export{J as default};
