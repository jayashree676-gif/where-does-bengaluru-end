/* ================= WORLD KIT: shared detailed geometry =================
   Everything is merged into a few geometries with vertex colours, then instanced,
   so the city can hold thousands of buildings and trees and still run in a browser. */
const WT={value:0};                       /* shared clock for wind, water, clouds */
const _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3(), _up=new THREE.Vector3(0,1,0);
function PM(geo,col,m4,shade){
  let g=geo.index?geo.toNonIndexed():geo.clone(); ['uv','uv1','uv2'].forEach(a=>g.attributes[a]&&g.deleteAttribute(a));
  if(!g.attributes.normal) g.computeVertexNormals();
  g.applyMatrix4(m4);
  const c=new THREE.Color(col), n=g.attributes.position.count, a=new Float32Array(n*3), p=g.attributes.position;
  for(let i=0;i<n;i++){ const k=shade?shade(p.getX(i),p.getY(i),p.getZ(i)):1; a[i*3]=c.r*k; a[i*3+1]=c.g*k; a[i*3+2]=c.b*k; }
  g.setAttribute('color',new THREE.BufferAttribute(a,3)); return g; }
function P(geo,col,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1,shade){ return PM(geo,col,_m4.compose(_v.set(x,y,z),_q.setFromEuler(_e.set(rx,ry,rz)),_s.set(sx,sy,sz)),shade); }
/* a part stretched between two points (branches, struts, cables) */
function PL(geo,col,a,b,shade){ const d=new THREE.Vector3().subVectors(b,a), l=d.length(); const m=new THREE.Matrix4().compose(a.clone().addScaledVector(d,.5),new THREE.Quaternion().setFromUnitVectors(_up,d.normalize()),new THREE.Vector3(1,l,1)); return PM(geo,col,m,shade); }
const MG=parts=>{ const g=mergeGeometries(parts,false); g.computeBoundingBox(); g.computeBoundingSphere(); return g; };
function blob(det=1,amt=.3,seed=1){ let g=new THREE.IcosahedronGeometry(1,det); g.deleteAttribute('uv'); g.deleteAttribute('normal'); g=mergeVertices(g);
  const p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i); const h=Math.sin(x*91.7+y*47.3+z*13.1+seed*7.7)*43758.5453; const r=1+(h-Math.floor(h)-.5)*amt; p.setXYZ(i,x*r,y*r,z*r); }
  g.computeVertexNormals(); return g; }

/* ---- trees: Bengaluru species ---- */
const BARK=0x4f3c2b, LEAF=[0x2c561c,0x3a6823,0x477a2b,0x568a32,0x6a9a3a];
const shadeUp=(cy,sy)=>(x,y,z)=>.58+.55*clamp((y-cy)/sy*.5+.5,0,1);
function canopy(parts,R,cx,cy,cz,sx,sy,sz,cols,det=1){ parts.push(P(blob(det,.46,R()*99),cols[(R()*cols.length)|0],cx,cy,cz,R()*3,R()*3,R()*3,sx,sy,sz,shadeUp(cy,sy))); }
function branchFan(parts,R,y0,n,len,spread,col=BARK){ const base=new THREE.Vector3(0,y0,0);
  for(let k=0;k<n;k++){ const a=k/n*6.283+R()*.7, t=spread+R()*.25, l=len*(.75+R()*.4); const tip=new THREE.Vector3(Math.sin(a)*Math.sin(t)*l,y0+Math.cos(t)*l,Math.cos(a)*Math.sin(t)*l);
    parts.push(PL(new THREE.CylinderGeometry(.018,.035,1,5),col,base,tip)); } }
function geoRain(seed,cols=LEAF){ const R=rng(seed), parts=[];
  parts.push(P(new THREE.CylinderGeometry(.06,.1,1.15,7),BARK,0,.57,0,(R()-.5)*.08,0,(R()-.5)*.08));
  branchFan(parts,R,1.0,5,.75,.95);
  /* a crown of leaf clusters at the branch tips (umbrella-shaped, like a rain tree), each built from small lumps */
  const CL=[[0,1.72,0,.4]]; for(let k=0;k<7;k++){ const a=k/7*6.283+R()*.5, r=.5+R()*.34; CL.push([Math.sin(a)*r,1.4+R()*.22,Math.cos(a)*r,.34]); }
  for(const [x,y,z,s] of CL) for(let j=0;j<8;j++){ const u=R()*6.283, v=R()*1.4, rr=s*(.2+.8*R());
    canopy(parts,R,x+Math.sin(u)*Math.sin(v)*rr,y+Math.cos(v)*rr*.42,z+Math.cos(u)*Math.sin(v)*rr,.22+R()*.09,.15+R()*.05,.22+R()*.09,cols,0); }
  return MG(parts); }
function geoAshoka(seed){ const R=rng(seed), parts=[]; parts.push(P(new THREE.CylinderGeometry(.035,.06,2.4,6),BARK,0,1.2,0));
  for(let k=0;k<6;k++){ const y=.75+k*.36, r=.36-k*.04; canopy(parts,R,(R()-.5)*.06,y,(R()-.5)*.06,r,.34,r,[0x1f4a1a,0x2a5a20,0x356a26]); }
  canopy(parts,R,0,2.95,0,.12,.25,.12,[0x2a5a20]); return MG(parts); }
function geoEuca(seed){ const R=rng(seed), parts=[]; parts.push(P(new THREE.CylinderGeometry(.03,.07,2.6,6),0xcfc6b6,0,1.3,0));
  branchFan(parts,R,1.9,4,.5,.55,0xbdb4a2);
  for(let k=0;k<6;k++){ const a=R()*6.28, r=.15+R()*.3; canopy(parts,R,Math.sin(a)*r,2.2+R()*.7,Math.cos(a)*r,.24,.3,.24,[0x5c7a46,0x6d8a52,0x4f6c3c],0); }
  return MG(parts); }
function geoPalm(seed){ const R=rng(seed), parts=[]; let x=0,y=0,lean=(R()-.5)*.25; const segs=9, h=.24;
  for(let k=0;k<segs;k++){ const nx=x+lean*h*(k/segs), ny=y+h; parts.push(PL(new THREE.CylinderGeometry(.034,.042,1,7),k%2?0x6d5a45:0x5f4e3c,new THREE.Vector3(x,y,0),new THREE.Vector3(nx,ny+.01,0))); x=nx; y=ny; }
  const top=new THREE.Vector3(x,y,0);
  for(let f=0;f<11;f++){ const a=f/11*6.283+R()*.3, L=.9+R()*.25, droop=.5+R()*.35; const pos=[], idx=[]; const n=7;
    for(let s=0;s<=n;s++){ const t=s/n, r=L*t, yy=top.y+.08+Math.sin(t*2.2)*.22-droop*t*t*.9, w=.13*Math.sin(Math.PI*Math.min(1,t*1.15)+.05);
      const cx=top.x+Math.sin(a)*r, cz=Math.cos(a)*r, px=Math.cos(a)*w, pz=-Math.sin(a)*w;
      pos.push(cx+px,yy-.02,cz+pz, cx-px,yy-.02,cz-pz); if(s<n){ const b=s*2; idx.push(b,b+1,b+2, b+1,b+3,b+2); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
    parts.push(P(g,[0x3f6a22,0x4d7a28,0x58852e][f%3],0,0,0,0,0,0,1,1,1,(xx,yy)=>.75+.4*clamp((yy-top.y+.3)/.5,0,1))); }
  for(let k=0;k<4;k++) parts.push(P(new THREE.SphereGeometry(.055,6,5),0x6b6a2a,top.x+Math.sin(k*1.6)*.07,top.y-.04,Math.cos(k*1.6)*.07));
  return MG(parts); }
function geoBush(seed,cols=[0x2f5a1f,0x3d6a24,0x4c7a2b,0x5b8a33]){ const R=rng(seed), parts=[]; const n=4+(R()*3|0);
  for(let k=0;k<n;k++){ const a=R()*6.28, r=R()*.32; canopy(parts,R,Math.sin(a)*r,.22+R()*.14,Math.cos(a)*r,.26+R()*.12,.22+R()*.08,.26+R()*.12,cols); }
  return MG(parts); }
function geoFarTree(seed,cols){ const R=rng(seed); return MG([P(new THREE.CylinderGeometry(.05,.08,.8,5),BARK,0,.4,0), P(blob(0,.25,seed),cols[0],0,1.25,0,0,0,0,.72,.5,.72,shadeUp(1.25,.5)), P(blob(0,.25,seed+3),cols[1],.28,1.05,.1,0,0,0,.42,.32,.42,shadeUp(1.05,.32))]); }
function geoRock(seed){ const g=blob(1,.55,seed); return MG([P(g,0x9a8d84,0,0,0,0,0,0,1,1,1,(x,y)=>.72+.35*clamp(y*.5+.5,0,1))]); }

/* materials: leaves sway in the wind and get a dappled look */
const NOISE_GLSL=`float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float h31(vec3 p){ return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453); }
float vn2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }`;
function worldVaryings(s){
  s.vertexShader='varying vec3 vWP; varying vec3 vWN;\n'+s.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
  { vec4 w4=vec4(transformed,1.); vec3 wn=objectNormal;
    #ifdef USE_INSTANCING
      w4=instanceMatrix*w4; wn=mat3(instanceMatrix)*wn;
    #endif
    w4=modelMatrix*w4; vWP=w4.xyz; vWN=normalize(mat3(modelMatrix)*wn); }`);
  s.fragmentShader='varying vec3 vWP; varying vec3 vWN;\n'+NOISE_GLSL+'\n'+s.fragmentShader; }
function windPatch(m,amp=.035,from=.35,key='leaf'){
  m.onBeforeCompile=s=>{ s.uniforms.uT=WT; worldVaryings(s);
    s.vertexShader='uniform float uT;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    { vec4 ip=vec4(0.,0.,0.,1.);
      #ifdef USE_INSTANCING
        ip=instanceMatrix*ip;
      #endif
      ip=modelMatrix*ip; float k=max(0.,position.y-${from.toFixed(2)}); float ph=ip.x*.37+ip.z*.23;
      float sw=sin(uT*1.1+ph)*${amp.toFixed(3)}+sin(uT*2.6+ph*1.7)*${(amp*.4).toFixed(3)};
      transformed.x+=sw*k; transformed.z+=sw*.55*k; }`);
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      diffuseColor.rgb*=.8+.32*vn2(vWP.xz*4.+vWP.y*3.)+.12*vn2(vWP.xz*19.);`); };
  m.customProgramCacheKey=()=>key; return m; }
const leafMat=windPatch(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,side:THREE.DoubleSide}),.035,.35,'leaf');
const TREE_GEOS={ rain:[geoRain(11),geoRain(12),geoRain(13)], gul:[geoRain(21,[0xc9381f,0xe0602a,0x3a6823,0x477a2b,0x568a32,0x3a6823])], jac:[geoRain(31,[0x8a70c8,0x7b5fc0,0x477a2b,0x3a6823,0x568a32])], ash:[geoAshoka(41)], euc:[geoEuca(51)], palm:[geoPalm(61),geoPalm(62)], bush:[geoBush(71),geoBush(72),geoBush(73)] };
/* used by the hero scenes */
function tree(x,z,y,s=1,R=Math.random){ const pool=R()<.18?TREE_GEOS.gul:TREE_GEOS.rain; const m=new THREE.Mesh(pool[(R()*pool.length)|0],leafMat); m.castShadow=true; m.receiveShadow=true;
  const g=new THREE.Group(); g.add(m); g.scale.setScalar(s*.72); g.rotation.y=R()*6.28; g.userData.sway=R()*6; return at(g,x,y,z); }
function bush(x,z,y,s=1,R=Math.random){ const m=new THREE.Mesh(TREE_GEOS.bush[(R()*3)|0],leafMat); m.castShadow=true; m.receiveShadow=true; m.scale.setScalar(s*.42); m.rotation.y=R()*6.28; m.position.set(x,y,z); return m; }
