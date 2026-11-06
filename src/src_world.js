/* ================= WORLD: an endless Bengaluru that grows from 1537 to 2037 =================
   One continuous landscape runs to a hazy horizon. Moving right along the timeline, the land
   turns from scrub and villages to gardens, a lamp-lit town, a campus, an airfield, a tech city
   and a green future city. The hero scenes sit straight on this ground. */
const world=new THREE.Group(); scene.add(world);
const X0=-300, X1=480, WATER_Y=-.25;
const hash2=(x,z)=>{ const s=Math.sin(x*127.1+z*311.7)*43758.5453; return s-Math.floor(s); };
function vnoise(x,z){ const xi=Math.floor(x), zi=Math.floor(z), xf=x-xi, zf=z-zi, u=xf*xf*(3-2*xf), v=zf*zf*(3-2*zf);
  const a=hash2(xi,zi), b=hash2(xi+1,zi), c=hash2(xi,zi+1), d=hash2(xi+1,zi+1); return (a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v)*2-1; }
function fbm(x,z,o=4){ let s=0,a=.5,f=1; for(let i=0;i<o;i++){ s+=a*vnoise(x*f+i*17.3,z*f-i*9.1); f*=2.03; a*=.5; } return s; }
const sstep=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const eraX=x=>x/SP;
const nearStop=x=>{ const i=clamp(Math.round(x/SP),0,N-1); return [i,x-stopX(i)]; };
const inHero=(x,z,rx=5.5,rz=4)=>{ const [,dx]=nearStop(x); return Math.abs(dx)<rx&&Math.abs(z)<rz; };
const nearNarrator=(x,z,r=4)=>Math.hypot(x-START,z+1)<r;

/* ---- lakes: Bengaluru was built around tanks ---- */
const LAKES=[[-36,-30,13,7],[-110,-62,20,10],[14,-27,9,5],[40,-42,15,8],[70,-28,8,4.5],[104,-50,12,7],[150,-33,11,6],[200,-62,22,11],[262,-44,16,8],[330,-80,24,12]];
function lakeMask(x,z){ let m=0; for(const [lx,lz,rx,rz] of LAKES){ const d=Math.hypot((x-lx)/rx,(z-lz)/rz); if(d<1.4) m=Math.max(m,1-sstep(.82,1.28,d)); } return m; }

/* ---- the ground ---- */
function hgt(x,z){
  const back=sstep(-9,-60,z), far=sstep(-110,-420,z), front=sstep(10,46,z);
  let h=.03*fbm(x*.35,z*.35,2)*(1-back);
  h+=back*(.7+1.5*fbm(x*.03+7,z*.03,4)+.45*fbm(x*.12,z*.12,3));
  h+=far*(14+30*Math.max(0,fbm(x*.006+3,z*.006,4)+.28));
  h+=front*(-.5+.9*fbm(x*.05,z*.05,3));
  if(inHero(x,z,6.5,5)) { const [,dx]=nearStop(x); const k=sstep(6.5,4.5,Math.abs(dx))*sstep(5,3.5,Math.abs(z)); h*=1-k; }
  const lm=lakeMask(x,z); return h*(1-lm)+(WATER_Y-.7)*lm; }
const GSOIL=[0xb07448,0x7a5a3a,0x7a5b3c,0x7a5a3a,0x9c7a50,0x86765f,0x7d7568,0x66553d].map(h=>new THREE.Color(h));
const GGRASS=[0x8e8743,0x4c8a2c,0x578a31,0x4f8a30,0x9a964c,0x648544,0x5f7d45,0x418533].map(h=>new THREE.Color(h));
const GAMT=[.42,.95,.86,.9,.58,.62,.55,.95];
const _c1=new THREE.Color(), _c2=new THREE.Color(), FARHILL=new THREE.Color(0x4f6b45);
function eraLerp(arr,x,out){ const e=clamp(eraX(x),0,7), i=Math.min(6,Math.floor(e)), t=sstep(0,1,e-i); if(out) return out.copy(arr[i]).lerp(arr[i+1],t); return arr[i]+(arr[i+1]-arr[i])*t; }
function groundCol(x,z,h,out){
  eraLerp(GSOIL,x,_c1); eraLerp(GGRASS,x,_c2); const amt=clamp(eraLerp(GAMT,x)+.38*fbm(x*.07+3,z*.07,3),0,1);
  out.copy(_c1).lerp(_c2,amt); out.lerp(FARHILL,sstep(-60,-240,z)*.55); return out; }
{ const NX=360, NZ=200, W=X1-X0, pos=new Float32Array((NX+1)*(NZ+1)*3), col=new Float32Array(pos.length), idx=new Uint32Array(NX*NZ*6), c=new THREE.Color(); let q=0;
  for(let j=0;j<=NZ;j++){ const t=j/NZ, z=62-560*t*t; for(let i=0;i<=NX;i++){ const x=X0+W*i/NX, h=hgt(x,z), k=(j*(NX+1)+i)*3; pos[k]=x; pos[k+1]=h; pos[k+2]=z; groundCol(x,z,h,c); col[k]=c.r; col[k+1]=c.g; col[k+2]=c.b; } }
  for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){ const a=j*(NX+1)+i, b=a+1, cc=a+NX+1, d=cc+1; idx.set([a,b,cc, b,d,cc],q); q+=6; }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setIndex(new THREE.BufferAttribute(idx,1)); g.computeVertexNormals();
  const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97});
  m.onBeforeCompile=s=>{ worldVaryings(s); s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    { vec2 p=vWP.xz; float n1=vn2(p*.7), n2=vn2(p*3.1), n3=vn2(p*13.7), n4=vn2(p*41.);
      diffuseColor.rgb*=.7+.34*n1+.16*n2+.1*n3+.07*n4; diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.86,1.06,.8),smoothstep(.45,.75,vn2(p*.18))*.6);
      float e=vWP.x/${SP.toFixed(1)};
      vec2 cs=vec2(7.,5.); vec2 cell=floor(p/cs); float hc=h21(cell);
      float farm=step(hc,.62)*smoothstep(-13.,-17.,p.y)*smoothstep(-240.,-170.,p.y)*(1.-smoothstep(2.6,3.9,e))*smoothstep(-6.,-1.,e)*smoothstep(.8,.94,vWN.y);
      vec3 fc=hc<.2?vec3(.24,.42,.1):hc<.42?vec3(.56,.47,.2):vec3(.4,.26,.15);
      float ang=h21(cell+3.)*3.14; vec2 dir=vec2(cos(ang),sin(ang)); float rows=.84+.2*sin(dot(p,dir)*24.);
      vec2 fp=fract(p/cs); float edge=smoothstep(0.,.06,min(min(fp.x,1.-fp.x),min(fp.y,1.-fp.y)));
      diffuseColor.rgb=mix(diffuseColor.rgb,fc*rows*(.85+.2*n2),farm*edge);
      float sl=1.-vWN.y; diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.52,.46,.43)*(.78+.4*n2),smoothstep(.32,.6,sl));
      diffuseColor.rgb*=mix(.5,1.,smoothstep(${(WATER_Y-.02).toFixed(2)},${(WATER_Y+.45).toFixed(2)},vWP.y)); }`); };
  m.customProgramCacheKey=()=>'terrain';
  const t=new THREE.Mesh(g,m); t.receiveShadow=true; world.add(t); }

/* ---- water ---- */
function waterNormals(){ const S=256, c=document.createElement('canvas'); c.width=c.height=S; const g=c.getContext('2d'), im=g.createImageData(S,S);
  const P=64, hs=(x,y)=>{ let s=0,a=1,f=1; for(let o=0;o<4;o++){ const px=(x*f/S*P), py=(y*f/S*P); const xi=Math.floor(px), yi=Math.floor(py), xf=px-xi, yf=py-yi; const per=P*f;
      const hh=(i,j)=>hash2(((i%per)+per)%per+o*13,((j%per)+per)%per); const u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
      s+=a*(hh(xi,yi)+(hh(xi+1,yi)-hh(xi,yi))*u+(hh(xi,yi+1)-hh(xi,yi))*v+(hh(xi,yi)-hh(xi+1,yi)-hh(xi,yi+1)+hh(xi+1,yi+1))*u*v); a*=.5; f*=2; } return s; };
  const H=new Float32Array(S*S); for(let y=0;y<S;y++) for(let x=0;x<S;x++) H[y*S+x]=hs(x,y);
  for(let y=0;y<S;y++) for(let x=0;x<S;x++){ const dx=H[y*S+(x+1)%S]-H[y*S+(x-1+S)%S], dy=H[((y+1)%S)*S+x]-H[((y-1+S)%S)*S+x]; const k=(y*S+x)*4; const nx=-dx*3, ny=-dy*3, l=Math.hypot(nx,ny,1);
    im.data[k]=(nx/l*.5+.5)*255; im.data[k+1]=(ny/l*.5+.5)*255; im.data[k+2]=(1/l*.5+.5)*255; im.data[k+3]=255; }
  g.putImageData(im,0,0); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; }
const waterTex=waterNormals(); waterTex.repeat.set(10,10);
const waterMat=new THREE.MeshStandardMaterial({color:0x1b4250,roughness:.07,metalness:.12,normalMap:waterTex,normalScale:new THREE.Vector2(.32,.32),envMapIntensity:1.5});
LAKES.forEach(([x,z,rx,rz])=>{ const m=new THREE.Mesh(new THREE.CircleGeometry(1.18,72),waterMat); m.rotation.x=-Math.PI/2; m.scale.set(rx,rz,1); m.position.set(x,WATER_Y,z); m.receiveShadow=true; world.add(m); });

/* ---- sky: golden hour with drifting clouds ---- */
const FOGC=new THREE.Color(0xdfcdc6); scene.fog=new THREE.FogExp2(FOGC,.0025);
const SUN=new THREE.Vector3(-.82,.24,.5).normalize();
function skyMat(env){ return new THREE.ShaderMaterial({ side:THREE.BackSide, depthWrite:false, fog:false,
  uniforms:{uT:WT,sunDir:{value:SUN},fogC:{value:FOGC},env:{value:env?1:0}},
  vertexShader:`varying vec3 vD; void main(){ vD=normalize(position); vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p.xyww; }`,
  fragmentShader:NOISE_GLSL+`
  uniform float uT; uniform vec3 sunDir; uniform vec3 fogC; uniform float env; varying vec3 vD;
  float fbm5(vec2 p){ float s=0.,a=.5; for(int i=0;i<5;i++){ s+=a*vn2(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return s; }
  void main(){ vec3 d=normalize(vD); float y=d.y, t=clamp(y,0.,1.);
    vec3 zen=vec3(.22,.38,.72), mid=vec3(.56,.62,.84);
    vec3 c=mix(fogC,mid,smoothstep(.0,.2,t)); c=mix(c,zen,smoothstep(.16,.75,t));
    float s=max(dot(d,sunDir),0.);
    c+=vec3(1.,.55,.28)*(pow(s,5.)*.55+pow(s,48.)*.7)*(1.-smoothstep(0.,.55,t)*.6);
    c+=vec3(1.,.92,.75)*pow(s,1200.)*30.;
    float anti=max(dot(d,-sunDir),0.); c=mix(c,vec3(.9,.66,.72),smoothstep(.015,.1,t)*(1.-smoothstep(.1,.32,t))*anti*.4);
    if(y>0.){ vec2 cp=d.xz/(y+.1)*2.2+vec2(uT*.006,uT*.002); float n=fbm5(cp), n2=fbm5(cp*2.7+5.);
      float cov=smoothstep(.5,.78,n*.8+n2*.3)*smoothstep(0.,.1,y)*(1.-smoothstep(.55,.95,y)*.6);
      vec3 cc=mix(vec3(.94,.8,.76),vec3(1.,.74,.5),pow(s,3.))*(.62+.5*n2); cc=mix(cc,vec3(.62,.58,.68),smoothstep(.55,.85,n)*.35);
      c=mix(c,cc,cov*.9); }
    c=mix(c,fogC,smoothstep(.0,-.03,y));
    if(env>.5&&y<0.) c=mix(fogC,vec3(.22,.24,.15),smoothstep(0.,-.25,y));
    gl_FragColor=vec4(c,1.); }` }); }
const sky=new THREE.Mesh(new THREE.SphereGeometry(1800,48,24),skyMat(false)); sky.frustumCulled=false; sky.renderOrder=-10; scene.add(sky);
{ const pm=new THREE.PMREMGenerator(renderer), es=new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(900,48,24),skyMat(true)));
  scene.environment=pm.fromScene(es,.02,1,3000).texture; scene.environmentIntensity=.62; }

/* ---- roads ---- */
function ribbon(pts,w,lift=.03){ const n=pts.length, pos=new Float32Array(n*6), uv=new Float32Array(n*4), idx=[]; let L=0;
  for(let k=0;k<n;k++){ const [x,z]=pts[k], [px,pz]=pts[Math.max(0,k-1)], [nx,nz]=pts[Math.min(n-1,k+1)]; let dx=nx-px, dz=nz-pz; const l=Math.hypot(dx,dz)||1; dx/=l; dz/=l;
    const ox=-dz*w/2, oz=dx*w/2; if(k) L+=Math.hypot(x-pts[k-1][0],z-pts[k-1][1]);
    const xl=x+ox, zl=z+oz, xr=x-ox, zr=z-oz; pos.set([xl,Math.max(hgt(xl,zl),WATER_Y+.05)+lift,zl, xr,Math.max(hgt(xr,zr),WATER_Y+.05)+lift,zr],k*6); uv.set([L,0,L,1],k*4);
    if(k<n-1){ const a=k*2; idx.push(a,a+1,a+2, a+1,a+3,a+2); } }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals();
  if(g.attributes.normal.getY(0)<0){ const ix=g.index.array; for(let i=0;i<ix.length;i+=3){ const t=ix[i]; ix[i]=ix[i+1]; ix[i+1]=t; } g.computeVertexNormals(); }
  return g; }
const roadMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
roadMat.onBeforeCompile=s=>{ worldVaryings(s);
  s.vertexShader='varying vec2 vRU;\n'+s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvRU=uv;');
  s.fragmentShader='varying vec2 vRU;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  { float e=vWP.x/${SP.toFixed(1)}, u=vRU.x, v=vRU.y; float n=vn2(vWP.xz*3.)*.5+vn2(vWP.xz*13.)*.5;
    vec3 dirt=vec3(.6,.37,.23)*(.78+.38*n); float rut=exp(-pow((v-.32)*12.,2.))+exp(-pow((v-.68)*12.,2.)); dirt*=1.-.22*rut;
    vec3 grav=vec3(.56,.51,.45)*(.72+.42*vn2(vWP.xz*31.));
    vec3 asph=vec3(.19,.195,.205)*(.82+.28*n);
    float dash=step(.5,fract(u*.32))*smoothstep(.03,.015,abs(v-.5)); float edge=smoothstep(.022,.01,abs(v-.07))+smoothstep(.022,.01,abs(v-.93));
    asph=mix(asph,vec3(.9,.86,.7),dash*step(4.4,e)); asph=mix(asph,vec3(.92,.9,.86),edge*step(5.5,e));
    vec3 c=mix(dirt,grav,smoothstep(1.4,1.9,e)); c=mix(c,asph,smoothstep(3.5,4.,e));
    c*=.8+.2*smoothstep(0.,.07,min(v,1.-v)); diffuseColor.rgb=c; } `); };
roadMat.customProgramCacheKey=()=>'road';
const ROAD_Z=5.2;
{ const pts=[]; for(let x=X0;x<=X1;x+=.6) pts.push([x,ROAD_Z]); const m=new THREE.Mesh(ribbon(pts,1.5,.03),roadMat); m.receiveShadow=true; world.add(m); }
const urb=x=>sstep(2.3,6.0,eraX(x));
const STREET_Z=[-14,-31,-50,-73,-100,-134,-178,-232];
const streetZ=(Z,x)=>Z+(1-urb(x))*2.6*Math.sin(x*.06+Z);
const crossX=x=>{ const m=((x-3)%12+12)%12; return m<1.0; };
function onStreet(x,z,pad=.7){ for(const Z of STREET_Z){ if(Math.abs(z-streetZ(Z,x))<pad) return true; } if(z<-10&&urb(x)>.3&&crossX(x)&&z>-260) return true; return false; }
{ const parts=[]; for(const Z of STREET_Z){ const pts=[]; for(let x=X0;x<=X1;x+=Z>-60?.8:2) pts.push([x,streetZ(Z,x)]); parts.push(ribbon(pts,Z>-60?.95:1.3)); }
  for(let x=3.5;x<X1;x+=12){ if(urb(x)<.3) continue; const pts=[]; for(let z=-10;z>=-260;z-=1) pts.push([x,z]); parts.push(ribbon(pts,.85)); }
  const g=mergeGeometries(parts,false), m=new THREE.Mesh(g,roadMat); m.receiveShadow=true; world.add(m); }
/* pavements from the 1940s on */
{ const pv=mat(0xb4ab9c,{brick:[.22,.22],rough:.9}); for(let x=3.6*SP;x<X1;x+=10){ [4.2,6.2].forEach(z=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(10,.07,.42),pv); b.position.set(x+5,.035,z); b.receiveShadow=true; world.add(b); }); } }

/* ---- instancing helper (chunks so off-screen parts are skipped) ---- */
const tmpM=new THREE.Matrix4(), tmpQ=new THREE.Quaternion(), tmpE=new THREE.Euler(), tmpP=new THREE.Vector3(), tmpS=new THREE.Vector3(), tmpCol=new THREE.Color();
function scatter(geo,material,items,{shadow=true,chunk=60,style=false}={}){
  const groups=new Map(); for(const it of items){ const k=Math.floor(it.x/chunk)+'|'+(it.z>-70?0:1); let a=groups.get(k); if(!a) groups.set(k,a=[]); a.push(it); }
  for(const [k,list] of groups){ let g=geo;
    if(style){ g=new THREE.BufferGeometry(); for(const n in geo.attributes) g.setAttribute(n,geo.attributes[n]); if(geo.index) g.setIndex(geo.index);
      const st=new Float32Array(list.length*4); list.forEach((it,i)=>st.set(it.st,i*4)); g.setAttribute('aStyle',new THREE.InstancedBufferAttribute(st,4)); }
    const im=new THREE.InstancedMesh(g,material,list.length);
    list.forEach((it,i)=>{ tmpM.compose(tmpP.set(it.x,it.y,it.z),tmpQ.setFromEuler(tmpE.set(it.rx||0,it.ry||0,it.rz||0)),tmpS.set(it.sx,it.sy??it.sx,it.sz??it.sx)); im.setMatrixAt(i,tmpM); im.setColorAt(i,tmpCol.set(it.c??0xffffff)); });
    im.castShadow=shadow&&k.endsWith('|0'); im.receiveShadow=true; im.computeBoundingSphere(); world.add(im); } }

/* ---- buildings: one facade shader draws windows, shops, balconies and glass ---- */
const facadeMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82,metalness:0});
facadeMat.onBeforeCompile=s=>{ worldVaryings(s);
  s.vertexShader='attribute vec4 aStyle; varying vec4 vSty; varying float vBase;\n'+s.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
  vSty=aStyle; { vec4 b4=vec4(0.,0.,0.,1.);
    #ifdef USE_INSTANCING
      b4=instanceMatrix*b4;
    #endif
    vBase=(modelMatrix*b4).y; }`);
  s.fragmentShader='varying vec4 vSty; varying float vBase; float fWin=0., fLit=0., fGlass=0.;\n'+s.fragmentShader
  .replace('#include <color_fragment>',`#include <color_fragment>
  { float t=vSty.x, fh=vSty.w, side=1.-step(.3,abs(vWN.y));
    float u=abs(vWN.z)>abs(vWN.x)?vWP.x:vWP.z; float y=vWP.y-vBase;
    float gy=y/fh, fy=fract(gy), fl=floor(gy);
    float cw=t>3.5&&t<4.5?fh*.6:t<1.5?fh*1.15:fh*.9; float gu=u/cw, fu=fract(gu), col=floor(gu);
    float r=h31(vec3(col,fl,vSty.y)); float w=0.;
    if(t<.5) w=0.;
    else if(t<1.5) w=step(.3,fu)*step(fu,.7)*step(.3,fy)*step(fy,.76)*step(.28,r);
    else if(t<2.5) w=step(.18,fu)*step(fu,.82)*step(.3,fy)*step(fy,.8);
    else if(t<3.5) w=step(.05,fu)*step(fu,.95)*step(.34,fy)*step(fy,.84);
    else if(t<4.5) w=step(.04,fu)*step(fu,.96)*step(.05,fy)*step(fy,.95);
    else if(t<5.5) w=step(.1,fu)*step(fu,.9)*step(.3,fy)*step(fy,.86);
    else w=step(.06,fu)*step(fu,.94)*step(.6,fy)*step(fy,.86);
    w*=side*step(.08,y);
    float door=step(t,1.5)*step(.5,t)*step(fl,.5)*step(.42,fu)*step(fu,.6)*step(fy,.72)*step(r,.12)*side;
    float lit=step(r,vSty.z)*w;
    float farW=smoothstep(35.,120.,distance(cameraPosition,vWP)); w=mix(w,.42*side*step(.5,t),farW); lit=mix(lit,vSty.z*.3*w,farW); door*=1.-farW;
    vec3 gl=mix(diffuseColor.rgb*.32,vec3(.3,.37,.46),.5+.25*h31(vec3(col,fl,7.)));
    diffuseColor.rgb=mix(diffuseColor.rgb,mix(gl,vec3(.95,.72,.46),lit),w*.92);
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.18,.11,.07),door);
    if(t>1.5&&t<3.5){ diffuseColor.rgb*=1.-.28*side*(1.-smoothstep(0.,.07,fy));
      if(t<2.5){ float bal=side*step(.82,fy)*step(fy,.92); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.78,bal); } }
    if(t>1.5&&t<3.5&&fl<.5&&vSty.y>.35){ float sign=side*step(.74,fy)*step(fy,.94); vec3 sc=vec3(h31(vec3(col,1.,3.)),h31(vec3(col,2.,3.)),h31(vec3(col,3.,3.))); sc=mix(vec3(.85,.2,.15),sc,.6);
      diffuseColor.rgb=mix(diffuseColor.rgb,sc,sign*step(.3,r)); }
    if(t>4.5&&t<5.5){ float band=side*step(mod(fl,3.),.5)*step(fy,.3); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.16,.34,.1)*(.75+.5*vn2(vWP.xz*9.+vWP.y)),band); }
    diffuseColor.rgb*=mix(.5,1.,smoothstep(0.,1.2,y));
    if(vWN.y>.8&&t>1.5) diffuseColor.rgb*=.78;
    fWin=w; fLit=lit; fGlass=t>3.5&&t<4.5?1.:.35; }`)
  .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.1,fWin*(1.-fLit));')
  .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,.65,fWin*fGlass*(1.-fLit));')
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(1.,.66,.34)*fLit*.9;'); };
facadeMat.customProgramCacheKey=()=>'facade';
const roofMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.78});
roofMat.onBeforeCompile=s=>{ worldVaryings(s); s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  { float rows=.84+.18*smoothstep(.3,.5,fract(vWP.y*38.)); diffuseColor.rgb*=rows*(.85+.25*vn2(vWP.xz*7.)); }`); };
roofMat.customProgramCacheKey=()=>'roof';
const solidMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:.15});

const G_BOX=(()=>{ const g=new THREE.BoxGeometry(1,1,1); g.translate(0,.5,0); return MG([P(g,0xffffff)]); })();
const G_HIP=(()=>{ const g=new THREE.ConeGeometry(.7071,1,4,1); g.rotateY(Math.PI/4); g.translate(0,.5,0); return MG([P(g,0xffffff)]); })();
const G_CONE=(()=>{ const g=new THREE.ConeGeometry(1,1,12,2); g.translate(0,.5,0); return MG([P(g,0xffffff)]); })();
const G_CYL=(()=>{ const g=new THREE.CylinderGeometry(1,1,1,12); g.translate(0,.5,0); return MG([P(g,0xffffff)]); })();
const G_SAW=(()=>{ const sh=new THREE.Shape(); sh.moveTo(-.5,0); for(let k=0;k<4;k++){ const x0=-.5+k*.25; sh.lineTo(x0,1); sh.lineTo(x0+.25,0); } sh.lineTo(-.5,0);
  const g=new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false}); g.translate(0,0,-.5); return MG([P(g,0xffffff)]); })();
const G_TANK=MG([P(new THREE.CylinderGeometry(.11,.11,.2,10),0x1c1c1f,0,.1,0),P(new THREE.CylinderGeometry(.06,.11,.04,10),0x1c1c1f,0,.22,0)]);
const G_SOLAR=MG([P(new THREE.BoxGeometry(.7,.03,.42),0x18223a,0,.16,0,-.35,0,0),P(new THREE.BoxGeometry(.04,.16,.04),0x777777,0,.08,0)]);
const G_ANT=MG([P(new THREE.CylinderGeometry(.012,.018,1,5),0x8a8f96,0,.5,0),P(new THREE.SphereGeometry(.03,6,4),0xff4a3a,0,1,0)]);

const WALLS=[], HIPS=[], THATCH=[], HUTW=[], SAWS=[], CHIM=[], TANKS=[], SOLARS=[], ANTS=[], ROOFTREES=[], OCC=new Set();
const occK=(x,z)=>Math.round(x)+','+Math.round(z);
const occupy=(x,z,w,d)=>{ for(let a=-w/2;a<=w/2;a+=.8) for(let b=-d/2;b<=d/2;b+=.8) OCC.add(occK(x+a,z+b)); };
const pal=(R,a)=>a[(R()*a.length)|0];
const WALLC={ house:[0xeee6d6,0xe8cf8a,0xbcd08c,0xe5b3a5,0xa9c4d8,0xf0d9b5,0xd7e0c7], bung:[0xeadcc0,0xf2ead8,0xe4d2ae], colonial:[0xa64a35,0xb85a40,0xe3d3b5,0xd8c49c], factory:[0xa9a59b,0xb5aea0,0x9b5a46],
  flats:[0xdccaa6,0xe7dcc6,0xd8b58a,0xcfcac2,0xd9a9a0,0xc8d1c4,0xe2d6b8], office:[0xbec3c6,0xd3cbbd,0xc9c2b5], glass:[0x8299ae,0x8aa1a8,0x6f8697,0x9aa6b5], future:[0xeef0ec,0xe4ebe6,0xf2efe8] };
const ROOFC={ tile:[0xa2482c,0x9a3f27,0xb05a35,0x8f3c25], thatch:[0x9b8048,0xa58a52,0x8a7140] };
function pickType(ej,R){
  if(ej<1.1) return R()<.62?'hut':'mud';
  if(ej<2.6) return R()<.74?'house':'bung';
  if(ej<3.8) return R()<.42?'house':R()<.55?'colonial':'bung';
  if(ej<4.7) return R()<.5?'factory':R()<.6?'colonial':'house';
  if(ej<5.7) return R()<.66?'flats':R()<.72?'office':'house';
  if(ej<6.7) return R()<.52?'flats':R()<.62?'glass':'office';
  return R()<.45?'future':R()<.55?'glass':'flats'; }
function addBuilding(x,z,type,R,capF){
  const ry=(R()-.5)*.08+(R()<.5?0:Math.PI/2)*(type==='hut'?1:0), fh=.32;
  const cornerBase=(w,d)=>Math.min(hgt(x-w/2,z-d/2),hgt(x+w/2,z-d/2),hgt(x-w/2,z+d/2),hgt(x+w/2,z+d/2))-.12;
  if(type==='hut'){ const r=.26+R()*.14, h=.34+R()*.08, b=cornerBase(r*2,r*2); HUTW.push({x,y:b,z,sx:r,sy:h+.12,sz:r,c:pal(R,[0xb98a5e,0xa97a52,0xc49a6a]),st:[0,R(),0,fh]}); THATCH.push({x,y:b+h+.1,z,sx:r*1.3,sy:.32+R()*.08,sz:r*1.3,c:pal(R,ROOFC.thatch)}); occupy(x,z,r*2,r*2); return; }
  let w,d,f,t,lit,c,roof=null;
  if(type==='mud'){ w=.6+R()*.4; d=.55+R()*.3; f=1; t=0; lit=0; c=pal(R,[0xbf8f60,0xb5845a,0xcaa070]); roof='thatch'; }
  else if(type==='house'){ w=.75+R()*.75; d=.7+R()*.6; f=R()<.7?1:2; t=1; lit=.12; c=pal(R,WALLC.house); roof=R()<.75?'tile':'flat'; }
  else if(type==='bung'){ w=1.2+R()*.7; d=1.0+R()*.6; f=1; t=1; lit=.1; c=pal(R,WALLC.bung); roof='tile'; }
  else if(type==='colonial'){ w=1.8+R()*1.4; d=1.2+R()*.7; f=2+(R()*2|0); t=1; lit=.12; c=pal(R,WALLC.colonial); roof='tile'; }
  else if(type==='factory'){ w=2.2+R()*1.6; d=1.5+R()*.9; f=3; t=6; lit=.1; c=pal(R,WALLC.factory); roof='saw'; }
  else if(type==='flats'){ w=1.2+R()*1.0; d=1.1+R()*.8; f=3+Math.floor(Math.pow(R(),1.6)*10); t=2; lit=.2; c=pal(R,WALLC.flats); roof='tanks'; }
  else if(type==='office'){ w=1.7+R()*1.2; d=1.5+R()*1.0; f=5+Math.floor(R()*11); t=3; lit=.24; c=pal(R,WALLC.office); roof='solar'; }
  else if(type==='glass'){ w=1.5+R()*1.1; d=1.5+R()*1.1; f=12+Math.floor(Math.pow(R(),1.3)*30); t=4; lit=.1; c=pal(R,WALLC.glass); roof='crown'; }
  else { w=1.7+R()*1.1; d=1.7+R()*1.1; f=16+Math.floor(Math.pow(R(),1.2)*36); t=5; lit=.3; c=pal(R,WALLC.future); roof='green'; }
  f=Math.max(1,Math.min(f,capF)); const h=f*fh+(t===6?.25:0), b=cornerBase(w,d);
  WALLS.push({x,y:b,z,ry,sx:w,sy:h+.12,sz:d,c,st:[t,R(),lit,fh]}); occupy(x,z,w+.3,d+.3);
  const top=b+h+.12;
  if(roof==='tile') HIPS.push({x,y:top-.02,z,ry,sx:w*1.16,sy:.18+w*.12,sz:d*1.16,c:pal(R,ROOFC.tile)});
  else if(roof==='thatch') HIPS.push({x,y:top-.02,z,ry,sx:w*1.2,sy:.26,sz:d*1.2,c:pal(R,ROOFC.thatch)});
  else if(roof==='saw'){ SAWS.push({x,y:top,z,ry,sx:w,sy:.3,sz:d,c:0x8b9096}); if(R()<.6) CHIM.push({x:x+w*.3,y:top,z:z-d*.25,sx:.09,sy:1.3+R()*.8,sz:.09,c:0x8a5a46}); }
  else if(roof==='tanks'){ const n=1+(R()*3|0); for(let k=0;k<n;k++) TANKS.push({x:x+(R()-.5)*w*.6,y:top,z:z+(R()-.5)*d*.6,sx:1,c:0xffffff}); if(R()<.5) WALLS.push({x:x-w*.2,y:top,z:z+d*.15,ry,sx:.42,sy:.34,sz:.42,c,st:[0,R(),0,fh]}); }
  else if(roof==='solar'){ for(let k=0;k<2+(R()*3|0);k++) SOLARS.push({x:x+(R()-.5)*w*.6,y:top,z:z+(R()-.5)*d*.6,ry,sx:1,c:0xffffff}); }
  else if(roof==='crown'){ WALLS.push({x,y:top,z,ry,sx:w*.62,sy:.5+R()*.6,sz:d*.62,c,st:[4,R(),.05,fh]}); if(R()<.6) ANTS.push({x,y:top+.9,z,sx:1,sy:.8+R()*1.4,sz:1,c:0xffffff}); }
  else if(roof==='green'){ for(let k=0;k<3;k++) ROOFTREES.push({x:x+(R()-.5)*w*.6,y:top,z:z+(R()-.5)*d*.6,sx:.35+R()*.15}); for(let k=0;k<2;k++) SOLARS.push({x:x+(R()-.5)*w*.5,y:top,z:z+(R()-.5)*d*.5,ry,sx:1,c:0xffffff}); }
}
{ const R=rng(2026);
  for(let z=-10.5;z>-340;){ const dz=2.5+Math.max(0,(-z-60))*.022; const dx0=2.3+Math.max(0,(-z-60))*.022;
    for(let x=X0;x<X1;x+=dx0*(.8+R()*.5)){ const xx=x+(R()-.5)*.6, zz=z+(R()-.5)*.6, e=eraX(xx);
      if(onStreet(xx,zz,.95)||lakeMask(xx,zz)>.02||inHero(xx,zz,7,11)||nearNarrator(xx,zz,6)) continue;
      let dens=urb(xx)*.94; if(e<4.7){ const cl=sstep(.1,.5,fbm(xx*.045+11,zz*.045,3)); dens=Math.max(dens,cl*(e<1?.5:.72)); }
      dens*=sstep(-80,-12,xx)*.85+.15*sstep(-150,-60,xx); dens*=1-sstep(-200,-340,zz)*.65;
      if(R()>dens) continue;
      const ej=e+(R()-.5)*1.3, type=pickType(ej,R);
      const [,ddx]=nearStop(xx); const nearH=1-sstep(8,22,Math.abs(ddx));
      const cbd=sstep(.05,.45,fbm(xx*.018+40,zz*.018,3));
      if(zz>-38&&R()<nearH*.45) continue;
      let capF=Math.round(4+sstep(-16,-115,zz)*58*(1-nearH*.55)); if(type==='glass'||type==='future') capF=Math.round(capF*(.35+.85*cbd));
      addBuilding(xx,zz,type,R,capF); }
    z-=dz; }
  /* low buildings in the gaps between the hero scenes keep the timeline continuous */
  for(let x=X0;x<X1;x+=2.6){ for(const z of [-6.2,-3.4]){ const xx=x+(R()-.5)*.8, zz=z+(R()-.5)*.5, e=eraX(xx);
      if(inHero(xx,zz,7.5,9)||nearNarrator(xx,zz,6)||R()>(.25+.45*urb(xx))*sstep(-60,-10,xx)) continue;
      addBuilding(xx,zz,pickType(Math.min(e+(R()-.5),5.4),R),R,3); } } }
scatter(G_BOX,facadeMat,WALLS,{style:true}); scatter(G_CYL,facadeMat,HUTW,{style:true});
scatter(G_HIP,roofMat,HIPS); scatter(G_CONE,roofMat,THATCH); scatter(G_SAW,roofMat,SAWS);
scatter(G_CYL,solidMat,CHIM.map(c=>({...c,sx:c.sx,sz:c.sz}))); scatter(G_TANK,solidMat,TANKS,{shadow:false}); scatter(G_SOLAR,solidMat,SOLARS,{shadow:false}); scatter(G_ANT,solidMat,ANTS,{shadow:false});

/* ---- trees, bushes, grass, flowers, rocks ---- */
const TREES={rain:[],gul:[],jac:[],ash:[],euc:[],palm:[],bush:[]}, FAR=[[],[]];
const TREE_DENS=[.3,.95,.62,.72,.36,.42,.32,.88];
function plantTree(x,z,R,big=1){ const e=clamp(eraX(x),-1,8), y=hgt(x,z); const r=R();
  let k; if(e<1.2) k=r<.42?'rain':r<.62?'palm':r<.8?'euc':'bush';
  else if(e<2.2) k=r<.45?'rain':r<.6?'jac':r<.75?'gul':r<.88?'ash':'palm';
  else if(e<4.5) k=r<.5?'rain':r<.62?'gul':r<.75?'ash':r<.88?'euc':'palm';
  else k=r<.5?'rain':r<.62?'gul':r<.72?'jac':r<.86?'ash':'palm';
  const s=(.8+R()*.55)*big; TREES[k].push({x,y,z,ry:R()*6.28,sx:k==='bush'?s*.7:s,c:0xffffff}); }
{ const R=rng(77);
  for(let z=-9.5;z>-58;z-=1.55) for(let x=X0+60;x<X1-40;x+=1.6){ const xx=x+(R()-.5)*1.2, zz=z+(R()-.5)*1.1;
      if(OCC.has(occK(xx,zz))||onStreet(xx,zz,.65)||lakeMask(xx,zz)>.01||inHero(xx,zz,5.5,8)||nearNarrator(xx,zz,4)) continue;
      const dens=eraLerp(TREE_DENS,xx)*(1-.45*urb(xx)*(OCC.has(occK(xx+1,zz))?1:0))*(.55+.45*sstep(-.2,.4,fbm(xx*.06,zz*.06,3)));
      if(R()<dens*.42) plantTree(xx,zz,R); }
  /* avenue trees along the timeline road */
  for(let x=-40;x<X1-60;x+=3.3){ const e=eraX(x); if(e<1.4) continue; for(const z of [3.5,6.95]){ const xx=x+(R()-.5)*.4; if(inHero(xx,z,6.2,8)) continue; if(R()<.8) TREES[R()<.8?'rain':'ash'].push({x:xx,y:hgt(xx,z),z,ry:R()*6,sx:1.05+R()*.4,c:0xffffff}); } }
  /* scrub and trees in the gaps along the stage */
  for(let x=-60;x<X1-60;x+=1.3){ for(const z of [-8,-5,-2,1.5,3.2]){ const xx=x+(R()-.5), zz=z+(R()-.5)*.8; if(inHero(xx,zz,6,6)||nearNarrator(xx,zz,3.5)||OCC.has(occK(xx,zz))) continue; if(R()<.18*eraLerp(TREE_DENS,xx)+.04) plantTree(xx,zz,R,.95); } }
  /* far forests on the hills */
  for(let z=-58;z>-330;z-=3.4) for(let x=X0;x<X1;x+=3.2){ const xx=x+(R()-.5)*3, zz=z+(R()-.5)*3; if(OCC.has(occK(xx,zz))||lakeMask(xx,zz)>.01) continue;
      if(R()<(.25+.45*sstep(-.1,.4,fbm(xx*.02,zz*.02,3)))*(1-.5*urb(xx))) FAR[R()<.5?0:1].push({x:xx,y:hgt(xx,zz),z:zz,ry:R()*6,sx:1.4+R()*1.1,c:0xffffff}); }
  ROOFTREES.forEach(t=>TREES.bush.push({x:t.x,y:t.y,z:t.z,ry:0,sx:t.sx,c:0xffffff})); }
Object.entries(TREES).forEach(([k,list])=>{ const geos=TREE_GEOS[k]; geos.forEach((g,i)=>scatter(g,leafMat,list.filter((_,j)=>j%geos.length===i),{shadow:true})); });
scatter(geoFarTree(91,[0x3a5e2c,0x4a6e34]),leafMat,FAR[0],{shadow:false,chunk:120}); scatter(geoFarTree(92,[0x4e6a35,0x5a7a3e]),leafMat,FAR[1],{shadow:false,chunk:120});

const grassMat=windPatch(new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}),.2,0,'grass');
const G_TUFT=(()=>{ const pos=[], col=[], c0=new THREE.Color(0x2c4a19), c1=new THREE.Color(0xa6bf62); const R=rng(5);
  for(let b=0;b<7;b++){ const a=b/7*6.28+R(), r=R()*.05, h=.13+R()*.12, lean=.03+R()*.05, x=Math.sin(a)*r, z=Math.cos(a)*r, w=.012+R()*.008, ox=Math.cos(a)*w, oz=-Math.sin(a)*w;
    pos.push(x-ox,0,z-oz, x+ox,0,z+oz, x+Math.sin(a)*lean,h,z+Math.cos(a)*lean); col.push(c0.r,c0.g,c0.b, c0.r,c0.g,c0.b, c1.r,c1.g,c1.b); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals(); return g; })();
const G_FLOWER=MG([P(new THREE.IcosahedronGeometry(.035,0),0xffffff,0,.07,0)]);
{ const R=rng(88), GR=[], FL=[], RK=[], dry=new THREE.Color(0xd8c98a), lush=new THREE.Color(0xbfe0a0), tc=new THREE.Color();
  const FLC=[0xf2c14e,0xe86fa0,0xffffff,0xe8622a,0xb98ae8,0xfff0a0];
  for(let i=0;i<62000;i++){ const x=-70+R()*300, z=-11+R()*26; if((z>3.9&&z<6.5)||inHero(x,z,3.9,3.3)||lakeMask(x,z)>.01||nearNarrator(x,z,2.4)||OCC.has(occK(x,z))) continue;
    const dryness=1-eraLerp(GAMT,x); tc.copy(lush).lerp(dry,clamp(dryness*1.4+.15*fbm(x*.1,z*.1,2),0,1)); GR.push({x,y:hgt(x,z),z,ry:R()*6.28,sx:.38+R()*.42,c:tc.getHex()}); }
  for(let i=0;i<5200;i++){ const x=-60+R()*280, z=-10+R()*24, e=eraX(x); const p=e>.5&&e<1.6?1:e>6.6?.6:.16; if(R()>p||(z>3.9&&z<6.5)||inHero(x,z,3.9,3.3)||lakeMask(x,z)>.01) continue; FL.push({x,y:hgt(x,z),z,sx:.7+R()*.7,c:pal(R,FLC)}); }
  for(let i=0;i<900;i++){ const x=-120+R()*420, z=-60+R()*74; const e=eraX(x); if(R()>(e<1.5?.9:.25)||inHero(x,z,5,4.5)||(z>3.6&&z<6.8)||lakeMask(x,z)>.02||OCC.has(occK(x,z))) continue; const s=.12+Math.pow(R(),3)*.9; RK.push({x,y:hgt(x,z)-s*.3,z,rx:R()*3,ry:R()*3,sx:s*(1+R()*.6),sy:s*(.6+R()*.5),sz:s,c:0xffffff}); }
  /* the granite outcrop the Watchtower stands on */
  for(let k=0;k<7;k++){ const a=k/7*6.28; RK.push({x:START+Math.cos(a)*1.4,y:-.2,z:-1+Math.sin(a)*1.1,ry:a,sx:1.1+R()*.5,sy:.7+R()*.3,sz:1.0,c:0xffffff}); }
  RK.push({x:START,y:-.1,z:-1,ry:0,sx:1.9,sy:1.1,sz:1.6,c:0xffffff});
  scatter(G_TUFT,grassMat,GR,{shadow:false,chunk:40}); scatter(G_FLOWER,solidMat,FL,{shadow:false,chunk:40});
  const rockMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92}); rockMat.onBeforeCompile=s=>{ worldVaryings(s); s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=.78+.25*vn2(vWP.xz*9.+vWP.y*7.)+.14*vn2(vWP.xy*31.);'); }; rockMat.customProgramCacheKey=()=>'rock';
  [geoRock(1),geoRock(2),geoRock(3)].forEach((g,i)=>scatter(g,rockMat,RK.filter((_,j)=>j%3===i))); }

/* ---- street lamps (from 1905) and electric poles with wires ---- */
const bulbMat=new THREE.MeshStandardMaterial({color:0xfff1d0,emissive:0xffb35c,emissiveIntensity:3.2,roughness:.4});
{ const POST=MG([P(new THREE.CylinderGeometry(.016,.026,1.15,6),0x2c352f,0,.575,0),P(new THREE.BoxGeometry(.24,.016,.016),0x2c352f,.1,1.12,0),P(new THREE.CylinderGeometry(.04,.025,.06,6),0x2c352f,.2,1.09,0)]);
  const BULB=MG([P(new THREE.SphereGeometry(.032,8,6),0xffffff,.2,1.05,0)]);
  const posts=[]; for(let x=1.8*SP;x<X1-60;x+=3.2){ for(const [z,ry] of [[4.15,Math.PI/2],[6.25,-Math.PI/2]]){ if(inHero(x,z,4.2,8)) continue; posts.push({x,y:0,z,ry,sx:1,c:0xffffff}); } }
  scatter(POST,solidMat,posts); scatter(BULB,bulbMat,posts,{shadow:false});
  const POLE=MG([P(new THREE.CylinderGeometry(.02,.03,1.6,6),0x6b6258,0,.8,0),P(new THREE.BoxGeometry(.04,.03,.42),0x5b5248,0,1.52,0)]);
  const poles=[], wire=[]; let prev=null;
  for(let x=2*SP;x<6.3*SP;x+=4.6){ const z=7.25; if(inHero(x,z,3,8)){ prev=null; continue; } poles.push({x,y:hgt(x,z),z,sx:1,c:0xffffff});
    if(prev) for(const o of [-.18,0,.18]){ for(let s=0;s<8;s++){ const t0=s/8, t1=(s+1)/8, sag=t=>-.12*Math.sin(Math.PI*t); wire.push(prev+(x-prev)*t0,1.52+sag(t0),z+o, prev+(x-prev)*t1,1.52+sag(t1),z+o); } }
    prev=x; }
  scatter(POLE,solidMat,poles); const wg=new THREE.BufferGeometry(); wg.setAttribute('position',new THREE.Float32BufferAttribute(wire,3)); world.add(new THREE.LineSegments(wg,new THREE.LineBasicMaterial({color:0x2a2622}))); }

/* ---- 1537: Kempegowda's mud fort wall ---- */
{ const wallM=mat(0xa86a43,{brick:[.2,.09],rough:.95}), segs=[], towers=[]; const rx=6.6, rz=4.1, n=44;
  for(let k=0;k<n;k++){ const a0=k/n*6.283, a1=(k+1)/n*6.283, am=(a0+a1)/2; if(Math.abs(am-Math.PI/2)<.34) continue;
    const x0=Math.cos(a0)*rx, z0=Math.sin(a0)*rz, x1=Math.cos(a1)*rx, z1=Math.sin(a1)*rz, len=Math.hypot(x1-x0,z1-z0)+.05;
    segs.push({x:(x0+x1)/2,y:0,z:(z0+z1)/2,ry:-Math.atan2(z1-z0,x1-x0),sx:len,sy:.55,sz:.24});
    if(k%6===0) towers.push({x:x0,y:0,z:z0}); }
  segs.forEach(s=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(1,1,1).translate(0,.5,0),wallM); b.position.set(s.x,s.y,s.z); b.rotation.y=s.ry; b.scale.set(s.sx,s.sy,s.sz); b.castShadow=b.receiveShadow=true; world.add(b); });
  towers.forEach(t=>{ const c=new THREE.Mesh(new THREE.CylinderGeometry(.3,.36,.8,12).translate(0,.4,0),wallM); c.position.set(t.x,0,t.z); c.castShadow=c.receiveShadow=true; world.add(c); }); }

/* ---- 2037 onwards: elevated metro and wind turbines ---- */
const metroTrain=new THREE.Group(), turbines=[];
{ const conc=mat(0xc9bfae,{rough:.85}), z=-10.2, xs=118;
  for(let x=xs;x<X1-30;x+=3.4){ const h=2.4; const pl=new THREE.Mesh(new THREE.BoxGeometry(.32,h,.32).translate(0,h/2,0),conc); pl.position.set(x,hgt(x,z)-.1,z); pl.castShadow=pl.receiveShadow=true; world.add(pl);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.9),conc); cap.position.set(x,2.36,z); world.add(cap); }
  for(let x=xs;x<X1-30;x+=20){ const deck=new THREE.Mesh(new THREE.BoxGeometry(20.05,.16,.95),conc); deck.position.set(x+10,2.53,z); deck.castShadow=deck.receiveShadow=true; world.add(deck);
    [-.42,.42].forEach(o=>{ const w=new THREE.Mesh(new THREE.BoxGeometry(20.05,.14,.06),mat(0xb0a693)); w.position.set(x+10,2.68,z+o); world.add(w); }); }
  const silver=mat(0xe2dfd8,{metal:.3,rough:.3}), purple=mat(0x7c4bb4,{rough:.35}), win=mat(0x232a36,{rough:.1,metal:.3});
  for(let k=0;k<6;k++){ const car=new THREE.Group(); car.add(new THREE.Mesh(new THREE.BoxGeometry(1.04,.3,.32),silver)); const w=new THREE.Mesh(new THREE.BoxGeometry(.98,.09,.325),win); w.position.y=.05; car.add(w);
    const st=new THREE.Mesh(new THREE.BoxGeometry(1.04,.03,.326),purple); st.position.y=-.08; car.add(st); car.position.x=-k*1.08; car.children.forEach(m=>{ m.castShadow=true; }); metroTrain.add(car); }
  metroTrain.position.set(xs,2.79,z); world.add(metroTrain);
  const tw=mat(0xf2f2f0,{rough:.4}); const R=rng(303);
  for(let i=0;i<16;i++){ const x=125+i*20+R()*10, z=-110-R()*120, y=hgt(x,z); if(lakeMask(x,z)>0) continue; const g=new THREE.Group();
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(.18,.32,9,10).translate(0,4.5,0),tw),0,0,0)); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(.5,.4,.9),tw),0,9.1,.1));
    const rot=new THREE.Group(); for(let b=0;b<3;b++){ const bl=new THREE.Mesh(new THREE.BoxGeometry(.18,4.2,.06).translate(0,2.1,0),tw); bl.rotation.z=b*2.094; rot.add(bl); } rot.position.set(0,9.1,.62); rot.rotation.z=R()*6; g.add(rot);
    g.position.set(x,y,z); g.rotation.y=.4; world.add(g); turbines.push(rot); } }

/* ---- life on the timeline road: carts, cycles, cars, autos, buses, pods ---- */
const vehMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.42,metalness:.25});
const wheel=(x,z,r=.33,w=.14)=>P(new THREE.CylinderGeometry(r,r,w,10),0x161616,x,r,z,Math.PI/2);
function carGeo(L,W,H,cabin,glassC=0x1d2633){ return MG([P(new THREE.BoxGeometry(L,H*.55,W),0xffffff,0,H*.42,0), P(new THREE.BoxGeometry(L*cabin,H*.42,W*.92),glassC,-L*.05,H*.86,0), wheel(L*.33,W*.45),wheel(-L*.33,W*.45),wheel(L*.33,-W*.45),wheel(-L*.33,-W*.45)]).scale(.1,.1,.1); }
const VG={
  cart:MG([P(new THREE.BoxGeometry(2.2,.5,1.4),0x7a5232,-.4,1.0,0),P(new THREE.CylinderGeometry(.95,.95,1.6,10,1,true,0,Math.PI),0xc9b48a,-.4,1.2,0,Math.PI/2,0,0,1,1,.8),
    P(new THREE.TorusGeometry(.6,.08,5,12),0x4a3220,-.4,.6,.75),P(new THREE.TorusGeometry(.6,.08,5,12),0x4a3220,-.4,.6,-.75),P(new THREE.BoxGeometry(1.6,.08,.08),0x5a3e25,1.2,1.0,0),
    P(new THREE.BoxGeometry(1.4,.75,.55),0xe9e3d6,1.9,1.05,.38),P(new THREE.BoxGeometry(1.4,.75,.55),0xe9e3d6,1.9,1.05,-.38),P(new THREE.BoxGeometry(.4,.4,.35),0xe9e3d6,2.75,1.35,.38),P(new THREE.BoxGeometry(.4,.4,.35),0xe9e3d6,2.75,1.35,-.38),
    P(new THREE.ConeGeometry(.06,.45,5),0xc0392b,2.7,1.75,.5),P(new THREE.ConeGeometry(.06,.45,5),0xc0392b,2.7,1.75,-.5),
    ...[[1.4,.38],[2.4,.38],[1.4,-.38],[2.4,-.38]].map(([x,z])=>P(new THREE.BoxGeometry(.14,.7,.14),0xd9d2c4,x,.35,z))]).scale(.1,.1,.1),
  cycle:MG([P(new THREE.TorusGeometry(.33,.04,4,12),0x222222,.5,.33,0),P(new THREE.TorusGeometry(.33,.04,4,12),0x222222,-.5,.33,0),P(new THREE.BoxGeometry(1.0,.06,.06),0x2b2b2b,0,.62,0),
    P(new THREE.CapsuleGeometry(.2,.6,3,6),0xffffff,-.1,1.25,0,0,0,-.2),P(new THREE.SphereGeometry(.15,8,6),0x7a4e34,.0,1.82,0)]).scale(.1,.1,.1),
  vintage:carGeo(4.0,1.7,1.6,.45,0x202020),
  amby:MG([P(new THREE.BoxGeometry(4.3,.8,1.7),0xffffff,0,.68,0),P(new THREE.BoxGeometry(2.2,.65,1.56),0x1d2633,-.2,1.38,0),P(new THREE.BoxGeometry(2.0,.12,1.5),0xffffff,-.2,1.75,0),wheel(1.35,.8),wheel(-1.35,.8),wheel(1.35,-.8),wheel(-1.35,-.8)]).scale(.1,.1,.1),
  auto:MG([P(new THREE.BoxGeometry(2.6,.8,1.3),0x2e7d3a,0,.75,0),P(new THREE.BoxGeometry(2.3,.95,1.36),0xf2c12e,-.15,1.62,0),P(new THREE.BoxGeometry(.06,.6,1.1),0x1d2633,1.0,1.55,0),wheel(1.1,0,.3),wheel(-.9,.55,.3),wheel(-.9,-.55,.3)]).scale(.1,.1,.1),
  bus:MG([P(new THREE.BoxGeometry(11,2.4,2.5),0xffffff,0,1.65,0),P(new THREE.BoxGeometry(10.8,.85,2.52),0x1d2633,.1,2.15,0),P(new THREE.BoxGeometry(11.02,.3,2.52),0x2f6fc0,0,.9,0),wheel(3.6,1.2,.5,.3),wheel(-3.6,1.2,.5,.3),wheel(3.6,-1.2,.5,.3),wheel(-3.6,-1.2,.5,.3)]).scale(.1,.1,.1),
  car:carGeo(4.1,1.75,1.45,.55),
  scooter:MG([P(new THREE.BoxGeometry(1.6,.5,.4),0xffffff,0,.6,0),wheel(.6,0,.25,.1),wheel(-.6,0,.25,.1),P(new THREE.CapsuleGeometry(.2,.55,3,6),0x2a2a2a,-.15,1.3,0),P(new THREE.SphereGeometry(.17,8,6),0x111111,-.1,1.9,0)]).scale(.1,.1,.1),
  pod:MG([P(new THREE.CapsuleGeometry(.85,2.0,4,10),0xffffff,0,1.1,0,0,0,Math.PI/2,1,1,.95),P(new THREE.BoxGeometry(2.0,.5,1.62),0x14324a,.2,1.45,0),P(new THREE.BoxGeometry(3.6,.08,1.64),0x55d8ff,0,.7,0),wheel(1.1,.7,.3,.12),wheel(-1.1,.7,.3,.12),wheel(1.1,-.7,.3,.12),wheel(-1.1,-.7,.3,.12)]).scale(.1,.1,.1) };
const VTYPES=[['cart',-3,2.6,.28,14,[0xffffff]],['cycle',1.5,5.6,.55,16,[0xc0392b,0x2e86c1,0x7d3c98,0xf1c40f,0xffffff]],['vintage',3.2,5.0,1.0,8,[0x1c1c1c,0x5b1f1f,0x23324a,0x3a3a3a]],
  ['bus',4.0,7.6,.85,9,[0xd9d9d9,0xb7312b,0xe8e6e0]],['amby',4.6,6.3,1.1,12,[0xf2f0ea,0xffffff,0x1c1c1c]],['auto',4.8,7.8,.95,18,[0xffffff]],['car',5.8,9.5,1.25,28,[0xc0392b,0xf2f0ea,0x2c3e50,0x7f8c8d,0x1f618d,0xd4ac0d,0x1c1c1c]],
  ['scooter',5.0,8.2,1.1,16,[0xc0392b,0x2e86c1,0x7f8c8d,0xf2f0ea]],['pod',6.8,11,1.15,14,[0xffffff,0xeaf6ff]]];
const VEH=[];
{ const R=rng(4242); VTYPES.forEach(([k,e0,e1,sp,n,cols])=>{ const im=new THREE.InstancedMesh(VG[k],vehMat,n); im.castShadow=true; im.frustumCulled=false; world.add(im); const list=[];
    for(let i=0;i<n;i++){ const dir=R()<.5?1:-1; list.push({x:e0*SP+R()*(e1-e0)*SP,dir,z:dir>0?4.85:5.55,v:sp*(.8+R()*.4),x0:e0*SP,x1:e1*SP}); im.setColorAt(i,tmpCol.set(pal(R,cols))); }
    VEH.push({im,list}); }); }

/* ---- people walking on the edges of the road ---- */
const PEOPLE=[], bodyIM=new THREE.InstancedMesh(MG([P(new THREE.CapsuleGeometry(.2,.95,3,7),0xffffff,0,.68,0)]).scale(.1,.1,.1),vehMat,320), headIM=new THREE.InstancedMesh(MG([P(new THREE.SphereGeometry(.14,8,6),0xffffff,0,1.58,0)]).scale(.1,.1,.1),vehMat,320);
{ const R=rng(55), CL=[0xc0392b,0xe67e22,0xf1c40f,0x16a085,0x2980b9,0x8e44ad,0xecf0f1,0xd35400,0x27ae60,0xe84393,0x34495e,0xfdcb6e], SK=[0x8d5a3b,0x7a4b30,0xa66a45,0x6b3f26];
  for(let i=0;i<320;i++){ const z=R()<.5?(3.9+R()*.15):(6.45+R()*.15), dir=R()<.5?1:-1; PEOPLE.push({x:-40+R()*300,z,dir,v:.12+R()*.1,ph:R()*6}); bodyIM.setColorAt(i,tmpCol.set(pal(R,CL))); headIM.setColorAt(i,tmpCol.set(pal(R,SK))); }
  [bodyIM,headIM].forEach(m=>{ m.frustumCulled=false; m.castShadow=true; world.add(m); }); }

/* ---- birds ---- */
const BIRDS=[], wingG=(()=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.06, 0,0,.06, .42,0,-.02],3)); g.computeVertexNormals(); return g; })();
const wingL=new THREE.InstancedMesh(wingG,new THREE.MeshBasicMaterial({color:0x2a2420,side:THREE.DoubleSide}),36), wingR=new THREE.InstancedMesh(wingG,wingL.material,36);
{ const R=rng(9); for(let i=0;i<36;i++) BIRDS.push({r:6+R()*10,h:7+R()*6,ph:R()*6.28,sp:.12+R()*.1,z:-14-R()*22,fl:R()*6,flock:i%3}); [wingL,wingR].forEach(m=>{ m.frustumCulled=false; world.add(m); }); }

/* ---- chimney smoke (1940s) and floating dust motes in the warm light ---- */
const softTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'), r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
function pointsMat(color,size,op){ return new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,uniforms:{map:{value:softTex},col:{value:new THREE.Color(color)},sz:{value:size},op:{value:op}},
  vertexShader:`attribute float aLife; varying float vL; uniform float sz; void main(){ vL=aLife; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=sz*(1.+aLife*2.)/-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader:`uniform sampler2D map; uniform vec3 col; uniform float op; varying float vL; void main(){ float a=texture2D(map,gl_PointCoord).a; gl_FragColor=vec4(col,a*op*sin(3.1416*clamp(vL,0.,1.))); }`}); }
const SMOKE=[], CH=CHIM.filter(c=>c.z>-70).slice(0,40);
const smokeG=new THREE.BufferGeometry(), SMN=CH.length*7; smokeG.setAttribute('position',new THREE.BufferAttribute(new Float32Array(Math.max(1,SMN)*3),3)); smokeG.setAttribute('aLife',new THREE.BufferAttribute(new Float32Array(Math.max(1,SMN)),1));
CH.forEach((c,ci)=>{ for(let k=0;k<7;k++) SMOKE.push({c,t:k/7}); });
const smoke=new THREE.Points(smokeG,pointsMat(0xd9d2c8,.9,.5)); smoke.frustumCulled=false; world.add(smoke);
const MOTES=220, moteG=new THREE.BufferGeometry(), moteP=new Float32Array(MOTES*3), moteL=new Float32Array(MOTES), moteD=[];
{ const R=rng(31); for(let i=0;i<MOTES;i++){ moteD.push({x:(R()-.5)*16,y:.3+R()*4,z:-4+R()*12,ph:R()*6,sp:.1+R()*.2}); moteL[i]=.5; } }
moteG.setAttribute('position',new THREE.BufferAttribute(moteP,3)); moteG.setAttribute('aLife',new THREE.BufferAttribute(moteL,1));
const motes=new THREE.Points(moteG,pointsMat(0xffd9a0,.035,.55)); motes.frustumCulled=false; world.add(motes);

/* ---- per-frame life ---- */
const _o=new THREE.Object3D();
function updateWorld(t,dt,cx){
  WT.value=t; waterTex.offset.set(t*.006,t*.004); sky.position.copy(camera.position);
  for(const {im,list} of VEH){ list.forEach((v,i)=>{ v.x+=v.dir*v.v*dt; const span=v.x1-v.x0; if(v.x>v.x1) v.x-=span; if(v.x<v.x0) v.x+=span;
      const fade=Math.min(1,(v.x-v.x0)/1.5,(v.x1-v.x)/1.5); _o.position.set(v.x,hgt(v.x,v.z),v.z); _o.rotation.set(0,v.dir>0?0:Math.PI,0); _o.scale.setScalar(Math.max(.001,fade)); _o.updateMatrix(); im.setMatrixAt(i,_o.matrix); });
    im.instanceMatrix.needsUpdate=true; }
  PEOPLE.forEach((p,i)=>{ p.x+=p.dir*p.v*dt; if(p.x>cx+40) p.x-=80; if(p.x<cx-40) p.x+=80; const b=Math.abs(Math.sin(t*6+p.ph))*.012;
    _o.position.set(p.x,b,p.z); _o.rotation.set(0,p.dir>0?Math.PI/2:-Math.PI/2,Math.sin(t*6+p.ph)*.05); _o.scale.setScalar(1); _o.updateMatrix(); bodyIM.setMatrixAt(i,_o.matrix); headIM.setMatrixAt(i,_o.matrix); });
  bodyIM.instanceMatrix.needsUpdate=headIM.instanceMatrix.needsUpdate=true;
  BIRDS.forEach((b,i)=>{ const a=b.ph+t*b.sp, x=cx+Math.cos(a)*b.r+(b.flock-1)*5, z=b.z+Math.sin(a)*b.r*.4, y=b.h+Math.sin(t*.7+b.ph)*.6, flap=Math.sin(t*9+b.fl)*.6;
    _o.position.set(x,y,z); _o.rotation.set(0,-a,flap); _o.scale.setScalar(.6); _o.updateMatrix(); wingR.setMatrixAt(i,_o.matrix);
    _o.rotation.set(0,-a+Math.PI,-flap); _o.updateMatrix(); wingL.setMatrixAt(i,_o.matrix); });
  wingL.instanceMatrix.needsUpdate=wingR.instanceMatrix.needsUpdate=true;
  const sp=smokeG.attributes.position.array, sl=smokeG.attributes.aLife.array;
  SMOKE.forEach((s,i)=>{ s.t+=dt*.12; if(s.t>1) s.t-=1; const c=s.c; sp[i*3]=c.x+s.t*1.6+Math.sin(t+i)*.1; sp[i*3+1]=c.y+c.sy+s.t*2.2; sp[i*3+2]=c.z; sl[i]=s.t; });
  smokeG.attributes.position.needsUpdate=smokeG.attributes.aLife.needsUpdate=true;
  moteD.forEach((m,i)=>{ moteP[i*3]=cx+((m.x+t*m.sp*.3)%16+16)%16-8; moteP[i*3+1]=m.y+Math.sin(t*.6+m.ph)*.25; moteP[i*3+2]=m.z+Math.cos(t*.4+m.ph)*.3; moteL[i]=.5+.45*Math.sin(t*.8+m.ph); });
  moteG.attributes.position.needsUpdate=moteG.attributes.aLife.needsUpdate=true;
  metroTrain.position.x=118+((t*5.5)%(X1-160)); turbines.forEach((r,i)=>r.rotation.z+=dt*(.9+i%3*.15));
}
