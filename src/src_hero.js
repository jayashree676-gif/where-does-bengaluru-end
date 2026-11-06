/* ================= HERO FOCUS (default, non-VR state only) =================
   Each stop's diorama is the focal asset. It is tagged on layer 2 so the frame can draw a mask of it and
   keep it in full colour while the rest of the world is muted and faded into the page. A small detail kit
   (stones, grass tufts, flowers on stems) dresses the ground around it. Everything here is switched
   off in VR and in the builder, so those views render exactly as before. */
const HERO_LAYER=2;
DIO.forEach(d=>d.g.traverse(o=>o.layers.enable(HERO_LAYER)));
const KITS=[], haloScene=new THREE.Scene();
(function buildKits(){
  const stoneGeo=new THREE.IcosahedronGeometry(1,1), stoneMat=mat(0xffffff,{rough:.93,flat:true});
  /* a grass tuft: five thin tapered blades */
  const blades=[]; for(let k=0;k<5;k++){ const b=new THREE.ConeGeometry(.012,.2,3,1,true); b.translate(0,.1,0); b.rotateZ((k-2)*.16); b.rotateY(k*1.26); blades.push(b); }
  const tuftGeo=mergeGeometries(blades), tuftMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,side:THREE.DoubleSide});
  const petalGeo=new THREE.IcosahedronGeometry(.028,0), petalMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6});
  const stemGeo=new THREE.CylinderGeometry(.004,.005,.14,3); stemGeo.translate(0,.07,0);
  const o=new THREE.Object3D(), col=new THREE.Color();
  const hv=document.createElement('canvas'); hv.width=hv.height=128; const hx=hv.getContext('2d'), hg=hx.createRadialGradient(64,64,0,64,64,64);
  hg.addColorStop(0,'rgba(255,255,255,.7)'); hg.addColorStop(.5,'rgba(255,255,255,.4)'); hg.addColorStop(1,'rgba(255,255,255,0)'); hx.fillStyle=hg; hx.fillRect(0,0,128,128);
  const haloMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(hv),transparent:true,depthTest:false,depthWrite:false,fog:false,blending:THREE.CustomBlending,blendEquation:THREE.MaxEquation});
  const STONES=[0x9c9284,0x857a6c,0xb3a998,0x6f675d,0xa39070,0x8d8577], GREENS=[0x6f9a3c,0x7ea547,0x8db04f,0x5f8c33,0x9bbb5c], BLOOMS=[0xf2c94c,0xffffff,0xe86a92,0xb38df0,0xf29a4a,0xffe08a];
  DIO.forEach(d=>{ const bb=new THREE.Box3().setFromObject(d.g); if(bb.isEmpty()) return;
    const R=rng(d.i*53+9), kit=new THREE.Group(); kit.visible=false; scene.add(kit); KITS.push(kit);
    const x0=bb.min.x, x1=bb.max.x, z0=bb.min.z, z1=Math.min(bb.max.z,ROAD_Z-1.3), w=x1-x0, dz=z1-z0;
    /* a point on a band around the footprint, d0..d1 outside its edge */
    const ring=(d0,d1)=>{ for(let t=0;t<12;t++){ const per=2*(w+dz), u=R()*per, e=d0+(d1-d0)*Math.pow(R(),1.4); let x, z;
        if(u<w){ x=x0+u; z=z0-e; } else if(u<w+dz){ x=x1+e; z=z0+(u-w); } else if(u<2*w+dz){ x=x1-(u-w-dz); z=z1+e; } else { x=x0-e; z=z1-(u-2*w-dz); }
        if(z>ROAD_Z-1.1) continue; return [x,z]; } return null; };
    /* stones */
    const NS=170, st=new THREE.InstancedMesh(stoneGeo,stoneMat,NS); st.castShadow=true; st.receiveShadow=true; let n=0;
    for(let k=0;k<NS;k++){ const p=ring(.05,1.25); if(!p) continue; const s=.03+Math.pow(R(),2.2)*.1;
      o.position.set(p[0],hgt(p[0],p[1])+s*.28,p[1]); o.rotation.set(R()*3,R()*6.28,R()*3); o.scale.set(s,s*(.45+R()*.3),s*(.8+R()*.4)); o.updateMatrix();
      st.setMatrixAt(n,o.matrix); st.setColorAt(n,col.set(STONES[(R()*STONES.length)|0]).offsetHSL(0,(R()-.5)*.04,(R()-.5)*.08)); n++; }
    st.count=n; kit.add(st);
    /* grass tufts */
    const NT=220, tf=new THREE.InstancedMesh(tuftGeo,tuftMat,NT); tf.receiveShadow=true; n=0;
    for(let k=0;k<NT;k++){ const p=ring(.0,1.1); if(!p) continue; const s=.5+R()*.6;
      o.position.set(p[0],hgt(p[0],p[1])-.01,p[1]); o.rotation.set((R()-.5)*.2,R()*6.28,(R()-.5)*.2); o.scale.set(s,s*(.7+R()*.6),s); o.updateMatrix();
      tf.setMatrixAt(n,o.matrix); tf.setColorAt(n,col.set(GREENS[(R()*GREENS.length)|0]).offsetHSL(0,0,(R()-.5)*.08)); n++; }
    tf.count=n; kit.add(tf);
    /* small flowers on stems */
    const NF=110, fl=new THREE.InstancedMesh(petalGeo,petalMat,NF), sm=new THREE.InstancedMesh(stemGeo,tuftMat,NF); n=0;
    for(let k=0;k<NF;k++){ const p=ring(.1,1.4); if(!p) continue; const y=hgt(p[0],p[1]), h=.09+R()*.08;
      o.rotation.set(0,R()*6.28,0); o.position.set(p[0],y,p[1]); o.scale.set(1,h/.14,1); o.updateMatrix(); sm.setMatrixAt(n,o.matrix); sm.setColorAt(n,col.set(0x4a7426));
      o.position.set(p[0],y+h,p[1]); o.scale.setScalar(.8+R()*.6); o.updateMatrix(); fl.setMatrixAt(n,o.matrix); fl.setColorAt(n,col.set(BLOOMS[(R()*BLOOMS.length)|0])); n++; }
    fl.count=sm.count=n; kit.add(sm,fl);
    kit.traverse(m=>m.layers.enable(HERO_LAYER));
    const fc=[(x0+x1)/2,(z0+z1)/2];
    kit.userData.x=(x0+x1)/2;
    /* mask-only halo: keeps a little colour in the ground right around the asset so it stays grounded */
    const ha=new THREE.Mesh(new THREE.PlaneGeometry(1,1),haloMat); ha.rotation.x=-Math.PI/2; ha.position.set(fc[0],hgt(fc[0],fc[1])+.03,fc[1]); ha.scale.set(w+1.6,dz+1.5,1); haloScene.add(ha);
  });
})();
/* default state on/off: detail shading, the kit, and a tighter (sharper) sun shadow around the focal asset */
const SHADOW_WIDE={left:-24,right:24,top:22,bottom:-14}, SHADOW_TIGHT={left:-12,right:12,top:11,bottom:-8};
let heroShadow='';
function heroMode(on,tight,cx){ HD.value=on?1:0;
  KITS.forEach(k=>{ k.visible=on&&Math.abs(k.userData.x-cx)<26; });
  const want=on&&tight?'t':'w'; if(want!==heroShadow){ heroShadow=want; Object.assign(sun.shadow.camera,want==='t'?SHADOW_TIGHT:SHADOW_WIDE); sun.shadow.camera.updateProjectionMatrix(); } }
/* the colour mask: the focal asset drawn white on black, same view as the frame, half resolution */
const maskRT=new THREE.WebGLRenderTarget(4,4,{depthBuffer:true}), maskMat=new THREE.MeshBasicMaterial({color:0xffffff,fog:false}), _cc=new THREE.Color();
function renderHeroMask(R){ const w=Math.max(2,Math.round(R.w*.5)), h=Math.max(2,Math.round(R.h*.5)); if(maskRT.width!==w||maskRT.height!==h) maskRT.setSize(w,h);
  const ov=scene.overrideMaterial, bg=scene.background, au=renderer.shadowMap.autoUpdate, ca=renderer.getClearAlpha(); renderer.getClearColor(_cc);
  scene.overrideMaterial=maskMat; scene.background=null; renderer.shadowMap.autoUpdate=false; camera.layers.set(HERO_LAYER);
  renderer.setRenderTarget(maskRT); renderer.setClearColor(0x000000,1); renderer.clear(); renderer.render(scene,camera);
  camera.layers.set(0); const ac=renderer.autoClear; renderer.autoClear=false; renderer.render(haloScene,camera); renderer.autoClear=ac; scene.overrideMaterial=ov; scene.background=bg; renderer.shadowMap.autoUpdate=au; renderer.setClearColor(_cc,ca); renderer.setRenderTarget(null); }
