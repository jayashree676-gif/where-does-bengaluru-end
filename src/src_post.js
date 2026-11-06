/* ================= CINEMATIC FINISH: HDR render → bloom → grade → the glass-frame composite =================
   At rest only the frame's window is rendered (cheap, sharp). While the frame moves, the whole
   band is rendered and shown in grey outside the frame, colour inside it. */
function makeComposer(pr){ const rt=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,samples:4});
  const c=new EffectComposer(renderer,rt); c.renderToScreen=false; c.setPixelRatio(pr); c.addPass(new RenderPass(scene,camera));
  const b=new UnrealBloomPass(new THREE.Vector2(4,4),.28,.55,.92); c.addPass(b); c.__w=0; c.__h=0; return c; }
const DPR=Math.min(devicePixelRatio||1,2);
const cardComp=makeComposer(DPR), fullComp=makeComposer(Math.min(DPR,1.35));
const postScene=new THREE.Scene(), postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const postMat=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,transparent:false,
  uniforms:{tex:{value:null},texel:{value:new THREE.Vector2()},focus:{value:.45},blurK:{value:1},region:{value:new THREE.Vector4()},card:{value:new THREE.Vector4()},radius:{value:30},clayK:{value:0},full:{value:0},band:{value:new THREE.Vector2()},expo:{value:1.08},uT:WT,maskT:{value:null},muteK:{value:0},fadeK:{value:0},fadePx:{value:60},BG:{value:new THREE.Vector3(.89,.89,.89)}},
  vertexShader:`void main(){ gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader:`uniform sampler2D tex; uniform vec2 texel; uniform float focus, blurK; uniform vec4 region, card; uniform float radius, clayK, full, expo, uT; uniform vec2 band; uniform sampler2D maskT; uniform float muteK, fadeK, fadePx; uniform vec3 BG;
  vec3 rrt(vec3 v){ vec3 a=v*(v+.0245786)-.000090537; vec3 b=v*(.983729*v+.4329510)+.238081; return a/b; }
  vec3 aces(vec3 c){ const mat3 I=mat3(.59719,.07600,.02840,.35458,.90834,.13383,.04823,.01566,.83777); const mat3 O=mat3(1.60475,-.10208,-.00327,-.53108,1.10813,-.07276,-.07367,-.00605,1.07602); return clamp(O*rrt(I*c),0.,1.); }
  vec3 srgb(vec3 c){ return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c)); }
  void main(){ vec2 fc=gl_FragCoord.xy; vec2 uv=(fc-region.xy)/region.zw;
    if(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.){ gl_FragColor=vec4(0.); return; }
    vec2 cu0=(fc-card.xy)/(card.zw-card.xy); float bl=blurK*(smoothstep(.1,.42,cu0.y-focus)*1.15+smoothstep(.16,.5,focus-cu0.y)*.8);
    float hm=0.; if(muteK>0.){ vec2 mo=texel*7.;
      hm=(texture2D(maskT,uv).r*2.+texture2D(maskT,uv+vec2(mo.x,0.)).r+texture2D(maskT,uv-vec2(mo.x,0.)).r+texture2D(maskT,uv+vec2(0.,mo.y)).r+texture2D(maskT,uv-vec2(0.,mo.y)).r)/6.;
      hm=smoothstep(.15,.85,hm); bl=mix(bl+.6*fadeK,0.,hm)*muteK+bl*(1.-muteK); }
    vec3 c=texture2D(tex,uv).rgb;
    if(bl>.02){ vec3 acc=c; float wsum=1.; for(int i=0;i<16;i++){ float a=float(i)*2.39996, r=sqrt(float(i)+.5)/4.; vec2 o=vec2(cos(a),sin(a))*r*bl*5.5*texel; acc+=texture2D(tex,uv+o).rgb; wsum+=1.; } c=acc/wsum; }
    c*=expo/.6;
    c=aces(c);
    float l=dot(c,vec3(.2126,.7152,.0722)); c=mix(vec3(l),c,1.1); c=mix(c,smoothstep(0.,1.,c),.25);
    c*=mix(vec3(.96,.98,1.04),vec3(1.05,1.0,.94),smoothstep(.2,.8,l));
    c=srgb(c);
    vec2 cc=(card.xy+card.zw)*.5, hs=(card.zw-card.xy)*.5; vec2 q=abs(fc-cc)-hs+radius; float sd=length(max(q,0.))+min(max(q.x,q.y),0.)-radius;
    float inCard=1.-smoothstep(-1.,1.,sd);
    vec2 cu=(fc-card.xy)/(card.zw-card.xy); c*=mix(.8,1.,smoothstep(1.,.3,length((cu-.5)*vec2(1.1,.85)))*(1.-.75*fadeK)+.75*fadeK);
    /* default state: the focal asset keeps its colour, everything else goes soft, grey and light */
    if(muteK>0.){
      float lm=dot(c,vec3(.2126,.7152,.0722)); vec3 m=mix(vec3(lm),c,.2); m=mix(vec3(.7),m,.5); m=mix(m,BG,.4);
      c=mix(c,mix(m,c,hm*inCard),muteK);
      /* and dissolves into the page colour towards the frame's edges, most of all at the sky */
      }
    c+=(fract(sin(dot(fc+uT*60.,vec2(12.9898,78.233)))*43758.5453)-.5)*.016;
    float inBand=step(band.x,fc.y)*step(fc.y,band.y);
    float g=dot(c,vec3(.299,.587,.114)); vec3 gc=mix(vec3(g),vec3(.8),.3);
    float a=full>.5?1.:max(inCard,clayK*inBand);
    vec3 o=full>.5?c:mix(gc,c,inCard);
    gl_FragColor=vec4(o*a,a); }`});
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),postMat));
function renderWorld(mode,gr,clayKv){
  const W=innerWidth, H=innerHeight, pr=renderer.getPixelRatio(); let R, comp;
  if(mode==='card'){ R={l:Math.floor(gr.l),t:Math.floor(gr.t),w:Math.max(2,Math.ceil(gr.w)),h:Math.max(2,Math.ceil(gr.h))}; comp=cardComp; camera.setViewOffset(W,H,offX+R.l,offY+R.t,R.w,R.h); }
  else { R={l:0,t:0,w:W,h:H}; comp=fullComp; camera.setViewOffset(W,H,offX,offY,W,H); }
  if(comp.__w!==R.w||comp.__h!==R.h){ comp.setSize(R.w,R.h); comp.__w=R.w; comp.__h=R.h; }
  const ps=comp._pixelRatio||pr; pointsScale(H*ps/(2*Math.tan(camera.fov*Math.PI/360)));
  comp.render();
  if(mode!=='full-colour') renderHeroMask(R);
  const U=postMat.uniforms; U.tex.value=comp.readBuffer.texture; U.texel.value.set(1/(R.w*comp._pixelRatio),1/(R.h*comp._pixelRatio)); U.blurK.value=mode==='full-colour'?.35:1; U.focus.value=.46;
  U.region.value.set(R.l*pr,(H-R.t-R.h)*pr,R.w*pr,R.h*pr);
  U.card.value.set(gr.l*pr,(H-gr.b)*pr,gr.r*pr,(H-gr.t)*pr); U.radius.value=40*gr.w/384*pr;
  const b=bandRect(); U.band.value.set((H-b.b)*pr,(H-b.t)*pr);
  U.clayK.value=clayKv; U.full.value=mode==='full-colour'?1:0;
  U.maskT.value=maskRT.texture; U.muteK.value=mode==='full-colour'?0:1; U.fadeK.value=mode==='full-colour'?0:1-clayKv; U.fadePx.value=64*gr.w/384*pr;
  renderer.setRenderTarget(null); renderer.setScissorTest(false); renderer.setViewport(0,0,W,H); renderer.setClearColor(0x000000,0); renderer.clear();
  renderer.render(postScene,postCam);
  camera.setViewOffset(W,H,offX,offY,W,H); }
/* point sprites (smoke, motes) need the screen scale */
function pointsScale(v){ [smoke,motes].forEach(p=>{ p.material.uniforms.sz.value=p.userData.sz*v; }); }
smoke.userData.sz=.55; motes.userData.sz=.045;
