import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
/* lane-based traffic (traffic.js), inlined */
const { makeVehicle, initPlace, stepTraffic } = (()=>{ /*TRAFFIC*/ return { makeVehicle, initPlace, stepTraffic }; })();

/* ================= ASSETS =================
   Replaceable slots. Paste a URL or data URL to use the original Figma assets:
   mascot  = the Watchtower character (94 x 94, transparent PNG)
   stamp   = the collected watchtower stamp (40 x 40, transparent PNG)
   noise   = the original grain tile (used in the band between the dividers)
   Left empty, the mascot and stamps are rendered from the 3D models and the grain is generated. */
/*FIGASSETS*/
/*STAMPS*/
const ASSETS={ mascot:FIG['mascot-94'], stamp:FIG['stamp-tree-80'], noise:FIG.noise };
/*RENDERS*/

/* ================= CONTENT ================= */
const ZONES = [
  {year:1537, chapter:'The founding', hue:22, block:'Heritage', title:'A city drawn in mud', rebuild:'Rebuild the fort',
   summary:'Before me, there was a chieftain with a plan. A mud fort, a market and a street for every trade.',
   story:['I was not here yet. In 1537, Kempegowda I left Yelahanka and drew a city on open scrubland: a mud fort, and streets sorted by trade. The markets of that old pete still trade today.','Later, his son built me and my brothers on high ground, near water. A plaque says we mark the limits the town would one day reach. Historians argue about that. I like the story anyway.'],
   edge:'a mud wall around 2.24 km².', done:'The first Bengaluru: 2.24 km² inside a mud wall. It would not stay that small.',
   tease:'A Sultan plants a garden that never stops growing.',
   stats:[{n:2.24,s:'km²',l:'area of the first fort'},{n:4,s:'',l:'watchtowers still standing'},{n:1761,s:'',l:'mud walls rebuilt in stone',raw:true}]},
  {year:1760, chapter:'Garden City', hue:128, block:'Trees', title:'A garden grows around me', rebuild:'Replant the garden',
   summary:'A Sultan planted a garden near my rock. It never really stopped growing.',
   story:['I stand on one of the oldest rocks on Earth. In 1760, Hyder Ali began a Mughal-style garden nearby. His son Tipu Sultan filled it with plants from Persia, Turkey and Mauritius.','The British turned it into a botanical garden and added a Glass House in 1889. About 30 acres became 240. People began calling my city the Garden City.'],
   edge:'the city turns green.', done:'30 acres in 1760. 240 acres today. That is how a city earns the name Garden City.',
   tease:'The night a waterfall switched the whole city on.',
   stats:[{n:30,s:'acres',l:'the original garden'},{n:240,s:'acres',l:'Lalbagh today'},{n:1889,s:'',l:'Glass House built',raw:true}]},
  {year:1905, chapter:'City of Lights', hue:42, block:'Clean power', title:'The night the city switched on', rebuild:'Switch the city on',
   summary:'For three centuries my nights were dark. Then a waterfall switched the city on.',
   story:['Every evening, three men walked the streets, cleaning, refuelling and lighting kerosene lamps by hand.','On 5 August 1905, power from the Shivanasamudra falls, over 100 km away, reached Bengaluru. Electric street lamps came on, among the first in Asia. By the end of that year there were 1,395.'],
   edge:'now the edge glows at night.', done:'5 August 1905. 1,395 lamps by the end of the year. Bengaluru never went back to the dark.',
   tease:'A conversation on a ship brings a science institute here.',
   stats:[{n:1395,s:'',l:'street lamps by end of 1905'},{n:5,s:'Aug',l:'switch-on day'},{n:1902,s:'',l:'Shivanasamudra powers KGF',raw:true}]},
  {year:1909, chapter:'City of Science', hue:178, block:'Labs', title:'A conversation on a ship', rebuild:'Reconnect the ideas',
   summary:'A chance meeting at sea brought a science institute to my city.',
   story:['In 1893, Jamsetji Tata met Swami Vivekananda on a ship and talked about science for India. Tata pledged his fortune to a research institute, but died in 1904 before it opened.',"Mysore's Regent Queen gave 371 acres of land. In 1909 the Indian Institute of Science opened. In 1911 it had just 21 students. Locals still call it the Tata Institute."],
   edge:'the edge moves north, and the city starts growing ideas.', done:'21 students in 1911. Their ideas connected into a city of science.',
   tease:'Someone decides to build aeroplanes in a field full of cobras.',
   stats:[{n:371,s:'acres',l:'land given by Mysore State'},{n:21,s:'',l:'students in 1911'},{n:2,s:'',l:'departments in 1911'}]},
  {year:1940, chapter:'Factories of the future', hue:208, block:'Transit', title:'Cobras, termites and aeroplanes', rebuild:'Rebuild the airfield',
   summary:'Someone decided to build aeroplanes on scrubland full of cobras. My city said yes.',
   story:['In December 1940, Walchand Hirachand and the Kingdom of Mysore set up Hindustan Aircraft. Mysore put in half the capital and the land. Workers had to clear termite nests and cobras before the aerodrome could rise.','It became Hindustan Aeronautics in 1964. Factories followed, and so did thousands of engineers.'],
   edge:'the edge moves east, past the cantonment.', done:'From cobra-filled scrubland to an aerospace city in one generation.',
   tease:'The future arrives on a bullock cart.',
   stats:[{n:50,s:'%',l:'capital from Mysore Govt'},{n:23,s:'Dec',l:'founding day'},{n:1964,s:'',l:'renamed HAL',raw:true}]},
  {year:1985, chapter:'Silicon Plateau', hue:226, block:'Tech park', title:'The future arrived on a bullock cart', rebuild:'Deliver the dish',
   summary:"The most modern machine in India came down Miller's Road on a bullock cart. I have never laughed so hard.",
   story:["Texas Instruments opened the first multinational R&D centre in India. To talk to its US offices, it needed India's first private satellite dish.","The dish arrived on a bullock cart. In 1991 India's first Software Technology Park opened here, and my city got a new nickname: India's Silicon Valley."],
   edge:'now the edge reaches across the world.', done:'Delivered. One dish, one link to the US, and Bengaluru plugged into the world.',
   tease:'Two engineers ride up on a motorcycle looking for a room.',
   stats:[{n:1,s:'st',l:'MNC R&D centre in India'},{n:1,s:'st',l:'private satellite dish'},{n:1991,s:'',l:'first Software Technology Park',raw:true}]},
  {year:2007, chapter:'Startup City', hue:262, block:'Startup street', title:'Two engineers on a motorcycle', rebuild:'Start it up again',
   summary:'Two young engineers rode up on a motorcycle looking for a room. What they started in it changed my city again.',
   story:['Sachin and Binny Bansal rented 447-C, Koramangala. Their landlord later remembered them arriving on a Hero Honda. They had three servers and sold only books.','That flat became Flipkart. Around it, a startup wave rose, and Koramangala became a startup neighbourhood.'],
   edge:'I stopped being able to see it.', done:'One flat, three servers, one category. Ideas in this city multiply.',
   tease:"The stop I can't see. With 7 stamps, you build it.",
   stats:[{n:2,s:'',l:'founders'},{n:3,s:'',l:'servers on day one'},{n:1,s:'',l:'category: books'}]},
  {year:2037, chapter:'You build it', hue:150, future:true, block:'', title:'Where should Bengaluru end?', rebuild:'',
   summary:"In 2037 my city turns 500. I can't see the edge any more. So I'm handing it to you.",
   story:['My city was built around lakes. Government records count 262 water bodies in 1960, and 81 today. The Garden City and the Tech City have been pulling against each other.','For my next 500 years, I would like both: lakes and labs, trees and transit. They built me to mark where the city would end. You decide what it keeps.'],
   edge:'no edge left to mark. Only choices.', done:'', tease:'',
   stats:[{n:500,s:'',l:'years old in 2037'},{n:262,s:'',l:'lakes in 1960'},{n:81,s:'',l:'lakes today'}]},
];
const EDGE=['The Edge: A mud wall around 2.24Km','The Edge: The city turns green','The Edge: Now it glows at night','The Edge: Moves north, growing ideas','The Edge: Moves east, past the cantonment','The Edge: Reaches across the world','The Edge: I can no longer see it','The Edge: None left to mark. Only choices'];
const TEASE=['A sultan plants a garden','A waterfall switches the city on','A ship brings a science institute','Aeroplanes in a field of cobras','The future arrives on a bullock cart','Two engineers on a motorcycle','The stop I can’t see. You build it'];
/* the Figma reference frame shows these timeline labels and footer lines; kept as data so they can be changed in one place */
const TIMELINE_LABELS=[null,'1760','1950','1909','1760','1760','1760','2037'];
const FOOT={0:{prev:'A sultan plants a garden',next:'A sultan plants a garden'}};
const N=ZONES.length, pad=n=>String(n).padStart(2,'0'), $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const L=(k,dt)=>1-Math.pow(1-k,dt);
function rng(seed){ return ()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return((t^t>>>14)>>>0)/4294967296; }; }

/* ================= STRINGTUNE ================= */
let ST=null;
function initStringTune(){
  try{ const NS=window.StringTune; if(!NS||!NS.StringTune) return;
    ST=NS.StringTune.getInstance();
    ST.use(NS.StringMagnetic);
    try{ ST.scrollDesktopMode='smooth'; ST.scrollMobileMode='default'; }catch(e){}
    ST.start(60);
  }catch(e){ console.warn('StringTune failed',e); ST=null; }
}
function ensureSplit(root){
  root.querySelectorAll('[data-split]').forEach(el=>{
    if(el.querySelector('.-s-word,.-s-char')) return;
    const mode=el.getAttribute('data-split')||'word', txt=el.textContent; el.textContent='';
    if(mode.includes('char')) [...txt].forEach((c,k)=>{ const s=document.createElement('span'); s.className='-s-char'; s.style.setProperty('--char-index',k); s.textContent=c; el.appendChild(s); });
    else txt.split(' ').forEach((w,k,a)=>{ const s=document.createElement('span'); s.className='-s-word'; s.style.setProperty('--word-index',k); s.textContent=w; el.appendChild(s); if(k<a.length-1) el.appendChild(document.createTextNode(' ')); });
  });
}
const nudgeST=()=>{ try{ window.dispatchEvent(new Event('resize')); }catch(e){} };

/* ================= THE WATCHTOWER SPEAKS (right block) ================= */
let MASCOT='';                       /* data URL, rendered from the 3D watchtower at boot */
const FACE=()=>'';   /* the Watchtower icon is removed from every screen */
function react(mood){ const m=$('mascot'); m.classList.remove('jump'); void m.offsetWidth; m.classList.add('jump'); }
let typeT=null, sayTimer=null, saying=false;
function say(text, acts=[]){
  const q=$('qR'), a=$('actsR'); clearInterval(typeT); clearTimeout(sayTimer); a.innerHTML=''; saying=true;
  $('blkR').classList.add('in'); q.textContent=''; react();
  let i=0; const full='“'+text+'”';
  typeT=setInterval(()=>{ q.textContent=full.slice(0,++i); if(i>=full.length){ clearInterval(typeT);
    acts.forEach(([lab,fn,gh])=>{ const bt=document.createElement('button'); bt.className='chip '+(gh?'glass':'dark'); bt.textContent=lab; bt.onclick=e=>{ e.stopPropagation(); restoreQuote(); fn(); }; a.appendChild(bt); });
    sayTimer=setTimeout(restoreQuote,11000); } },18);
}
function restoreQuote(){ clearInterval(typeT); clearTimeout(sayTimer); if(!saying) return; saying=false; $('actsR').innerHTML='';
  if(arrived&&zoneIdx>=0){ const q=$('qR'); q.textContent=quoteOf(zoneIdx); q.removeAttribute('data-done'); ensureSplit($('blkR')); q.querySelectorAll('.-s-word').forEach(w=>w.style.transitionDelay='0s'); }
  else $('blkR').classList.remove('in'); }
let soundOn=true, actx=null;
function tone(f,vol=.05,dur=.25,type='sine'){ if(!soundOn) return; try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); const t=actx.currentTime,o=actx.createOscillator(),g=actx.createGain(); o.type=type;o.frequency.value=f; g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+.05);}catch(e){} }
const chord=()=>{ tone(659,.05,.35); setTimeout(()=>tone(784,.045,.35),90); setTimeout(()=>tone(1046,.045,.5),180); };
const whoosh=()=>{ tone(220,.03,.5,'triangle'); setTimeout(()=>tone(330,.02,.4,'triangle'),60); };

/* ================= RENDERER / SCENE ================= */
const canvas=$('gl');
let renderer;
try{ renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); }
catch(e){ $('nogl').style.display='grid'; throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight,false);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate=false; renderer.shadowMap.needsUpdate=true;   /* shadows are refreshed every other frame in renderWorld */
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.0;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const PAPER=new THREE.Color('#eaeaea');
renderer.setClearColor(PAPER,0);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(30,innerWidth/innerHeight,.5,2400);
/* golden-hour miniature look (matches the supplied renders): low warm sun from the front-left, soft sky fill, studio reflections */
scene.add(new THREE.HemisphereLight(0xc6d4ff,0x6e5c46,.3));
const sun=new THREE.DirectionalLight(0xffc995,3.9); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.radius=2.5;
const rim=new THREE.DirectionalLight(0xbcd0ff,.45); scene.add(rim); scene.add(rim.target);
Object.assign(sun.shadow.camera,{left:-24,right:24,top:22,bottom:-14,near:1,far:140}); sun.shadow.bias=-.0004; sun.shadow.normalBias=.04;
scene.add(sun); scene.add(sun.target);


/* the lens: one shared uniform turns the world grey (outside the frame) or colour (inside) */
const GRAY={value:0};
/* hero detail (default state only, uHD=0 everywhere else): fine surface grain, micro relief, grime and
   contact occlusion near the ground. In VR and the builder uHD is 0, so those views render exactly as before. */
const HD={value:0}, HGY={value:0};
const HD_GLSL=`float hh3(vec3 p){ p=fract(p*.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn3(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(hh3(i),hh3(i+vec3(1,0,0)),f.x),mix(hh3(i+vec3(0,1,0)),hh3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hh3(i+vec3(0,0,1)),hh3(i+vec3(1,0,1)),f.x),mix(hh3(i+vec3(0,1,1)),hh3(i+vec3(1,1,1)),f.x),f.y),f.z); }
vec3 vn3g(vec3 q){ float e=.35, b=vn3(q); return vec3(vn3(q+vec3(e,0.,0.))-b,vn3(q+vec3(0.,e,0.))-b,vn3(q+vec3(0.,0.,e))-b)/e; }`;
function patch(m){
  m.onBeforeCompile=s=>{ s.uniforms.uGray=GRAY; s.uniforms.uHD=HD; s.uniforms.uHGY=HGY; const br=m.userData.brick;
    s.vertexShader='varying vec3 vHP;\n'+s.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
    { vec4 hp=vec4(transformed,1.);
      #ifdef USE_INSTANCING
        hp=instanceMatrix*hp;
      #endif
      vHP=(modelMatrix*hp).xyz; }`);
    if(br){ /* masonry drawn in object space: courses of blocks with mortar and per-block tone */
      s.vertexShader='varying vec3 vOP; varying vec3 vON;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvOP=position; vON=normal;');
      s.fragmentShader='varying vec3 vOP; varying vec3 vON;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      { vec3 an=abs(vON); vec2 q=an.y>max(an.x,an.z)?vOP.xz:(an.x>an.z?vOP.zy:vOP.xy);
        q/=vec2(${br[0].toFixed(3)},${br[1].toFixed(3)}); float row=floor(q.y); q.x+=mod(row,2.)*.5;
        vec2 c=floor(q), f=fract(q); float h=fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);
        float mt=smoothstep(.0,.06,f.x)*smoothstep(.0,.06,1.-f.x)*smoothstep(.0,.09,f.y)*smoothstep(.0,.09,1.-f.y);
        diffuseColor.rgb*=mix(.66,1.,mt)*(.87+.24*h); }`); }
    const pt=m.userData.pat; if(pt){ if(!br){ s.vertexShader='varying vec3 vOP; varying vec3 vON;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvOP=position; vON=normal;'); s.fragmentShader='varying vec3 vOP; varying vec3 vON;\n'+s.fragmentShader; }
      s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+PAT_GLSL(pt)); }
    s.fragmentShader='uniform float uHD; uniform float uHGY; varying vec3 vHP;\n'+HD_GLSL+'\n'+s.fragmentShader
      .replace('#include <color_fragment>',`#include <color_fragment>
      if(uHD>0.){ float n1=vn3(vHP*7.), n2=vn3(vHP*23.+3.1), n3=vn3(vHP*61.+7.7);
        diffuseColor.rgb*=mix(1.,.86+.2*n1+.1*n2+.06*n3,uHD);
        float side=1.-smoothstep(.55,.85,abs(normalize(cross(dFdx(vHP),dFdy(vHP)))).y);   /* walls, not floors */
        float grime=smoothstep(.5,0.,vHP.y-uHGY)*(.55+.45*n2)*side;
        diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.8,.75,.68),grime*.45*uHD); }`)
      .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      if(uHD>0.){ vec3 g=vn3g(vHP*38.)+.5*vn3g(vHP*120.+5.3); vec3 gv=(viewMatrix*vec4(g,0.)).xyz;
        normal=normalize(normal-uHD*.045*(gv-dot(gv,normal)*normal)); }`)
      .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      if(uHD>0.) roughnessFactor=clamp(roughnessFactor+uHD*(vn3(vHP*17.)-.5)*.22,.04,1.);`)
      .replace('#include <aomap_fragment>',`#include <aomap_fragment>
      if(uHD>0.){ float hg=vHP.y-uHGY, sd=1.-smoothstep(.55,.85,abs(normalize(cross(dFdx(vHP),dFdy(vHP)))).y);
        float ao=mix(1.,mix(.55,1.,smoothstep(0.,.75,hg)),sd)*mix(.9,1.,vn3(vHP*5.));
        reflectedLight.indirectDiffuse*=mix(1.,ao,uHD); reflectedLight.directDiffuse*=mix(1.,mix(1.,mix(.75,1.,smoothstep(0.,.32,hg)),sd),uHD); }`);
    s.fragmentShader='uniform float uGray;\n'+s.fragmentShader.replace('#include <fog_fragment>',
    `float lum=dot(gl_FragColor.rgb,vec3(.299,.587,.114)); vec3 clay=mix(vec3(lum),vec3(.80),.35); gl_FragColor.rgb=mix(gl_FragColor.rgb,clay,uGray);\n#include <fog_fragment>`); };
  m.customProgramCacheKey=()=>'lens'+(m.userData.brick?'b'+m.userData.brick.join('_'):'')+(m.userData.pat?JSON.stringify(m.userData.pat):''); return m;
}
const mcache=new Map();
function mat(c,o={}){ const k=c+'|'+JSON.stringify(o); if(mcache.has(k)) return mcache.get(k);
  const m=new THREE.MeshStandardMaterial({color:c,roughness:o.rough??.78,metalness:o.metal??0,flatShading:o.flat??false,emissive:o.em??0x000000,emissiveIntensity:o.ei??1,transparent:o.op!=null,opacity:o.op??1,wireframe:!!o.wire,side:o.side?THREE.DoubleSide:THREE.FrontSide,depthWrite:o.op==null||o.op>.6});
  if(o.brick) m.userData.brick=o.brick; patch(m);
  mcache.set(k,m); return m; }
const C={ink:0x1c1b19,stone:0xcdb592,stone2:0xa8957a,earth:0x7a5634,grass:0x7d9d3e,moss:0x55752c,leaf1:0x3f6e2a,leaf2:0x5d8a32,leaf3:0x86ad48,terra:0xb8643b,roof:0x8a4b32,cream:0xece2cf,white:0xf3efe8,gold:0xe2b24a,water:0x4f97c4,dark:0x2b2b30,metal:0x9aa0a6,mud:0xc9915a,glass:0xcfe6ef,sand:0xdca46a,soil:0x6e5034,concrete:0xc4b9a8,ivy:0x35561f};

/* geometry helpers */
function mesh(geo,c){ const m=new THREE.Mesh(geo,(c&&c.isMaterial)?c:mat(c)); m.castShadow=true; m.receiveShadow=true; return m; }
const box=(w,h,d,c,r=0)=>mesh(r?new RoundedBoxGeometry(w,h,d,2,r):new THREE.BoxGeometry(w,h,d),c);
const cyl=(rt,rb,h,c,seg=12)=>mesh(new THREE.CylinderGeometry(rt,rb,h,seg),c);
const cone=(r,h,c,seg=10)=>mesh(new THREE.ConeGeometry(r,h,seg),c);
const ico=(r,c,det=0)=>mesh(new THREE.IcosahedronGeometry(r,det),c);
const sph=(r,c,ws=14,hs=10)=>mesh(new THREE.SphereGeometry(r,ws,hs),c);
const tor=(r,t,c,arc=Math.PI*2)=>mesh(new THREE.TorusGeometry(r,t,8,24,arc),c);
function at(o,x,y,z,ry=0,rx=0,rz=0,s=1){ o.position.set(x,y,z); o.rotation.set(rx,ry,rz); if(s!==1) o.scale.setScalar(s); return o; }
function grp(...ch){ const g=new THREE.Group(); ch.forEach(c=>g.add(c)); return g; }
function link(a,b,c,r=.015){ const v=new THREE.Vector3().subVectors(b,a), m=cyl(r,r,v.length(),c,5); m.position.copy(a).addScaledVector(v,.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize()); return m; }


/* leafy masses (trees, bushes, ivy): one instanced mesh of faceted leaves in mixed greens */
const leafGeo=new THREE.IcosahedronGeometry(1,1), ivyMat=mat(0xffffff,{flat:true,rough:.92});
function leafMass(pts,R=Math.random,cols=[C.leaf1,C.leaf2,C.leaf3]){
  const im=new THREE.InstancedMesh(leafGeo,ivyMat,pts.length); im.castShadow=true; im.receiveShadow=true;
  const o=new THREE.Object3D(), c=new THREE.Color();
  pts.forEach((p,k)=>{ o.position.set(p[0],p[1],p[2]); o.rotation.set(R()*3,R()*3,R()*3); o.scale.set(p[3],p[3]*(p[4]??.85),p[3]); o.updateMatrix(); im.setMatrixAt(k,o.matrix); im.setColorAt(k,c.set(cols[(R()*cols.length)|0]).offsetHSL(0,0,(R()-.5)*.07)); });
  im.computeBoundingBox(); im.computeBoundingSphere(); return im; }
/* ivy climbing a round tower (front arc) or a flat wall */
function ivyTower(cx,cz,r,y0,y1,a0,a1,n,R){ const pts=[]; for(let k=0;k<n;k++){ const yy=y0+(y1-y0)*Math.pow(R(),1.6), a=a0+(a1-a0)*R(), rr=r+.015; pts.push([cx+Math.sin(a)*rr,yy,cz+Math.cos(a)*rr,.028+R()*.032,.75]); } return leafMass(pts,R,[0x1f3a14,0x2c4a1b,0x3b6224,0x46702a]); }
function ivyWall(x0,x1,y0,y1,z,n,R){ const pts=[]; for(let k=0;k<n;k++){ pts.push([x0+(x1-x0)*R(),y0+(y1-y0)*Math.pow(R(),1.5),z+.02,.03+R()*.03,.75]); } return leafMass(pts,R,[0x1f3a14,0x2c4a1b,0x3b6224]); }
/* arched openings (round or pointed) as extruded shapes */
function archShape(w,h,pointed=false){ const s=new THREE.Shape(), r=w/2, hs=h-r; s.moveTo(-r,0); s.lineTo(-r,hs);
  if(pointed){ s.quadraticCurveTo(-r,hs+r*.9,0,hs+r*1.25); s.quadraticCurveTo(r,hs+r*.9,r,hs); } else s.absarc(0,hs,r,Math.PI,0,true);
  s.lineTo(r,0); s.lineTo(-r,0); return s; }
const darkWin=mat(0x24170f,{rough:.5}), trimM=mat(0xe7b67c,{rough:.8});
function archWin(w,h,pointed=false){ const g=new THREE.Group();
  const fr=mesh(new THREE.ExtrudeGeometry(archShape(w+.06,h+.035,pointed),{depth:.03,bevelEnabled:false,curveSegments:10}),trimM); fr.position.set(0,-.02,-.01); g.add(fr);
  const dk=mesh(new THREE.ExtrudeGeometry(archShape(w,h,pointed),{depth:.035,bevelEnabled:false,curveSegments:10}),darkWin); g.add(dk);
  g.add(at(box(w+.1,.03,.07,trimM),0,-.02,.02)); return g; }
function prism(w,h,dep,m){ const s=new THREE.Shape(); s.moveTo(-w/2,0); s.lineTo(w/2,0); s.lineTo(0,h); s.lineTo(-w/2,0); const g=new THREE.ExtrudeGeometry(s,{depth:dep,bevelEnabled:false}); g.translate(0,0,-dep/2); return mesh(g,m); }

/*WORLDKIT*/
/* ================= DETAIL KIT (hero dioramas) =================
   Parts are merged per material into a few meshes, so a scene can hold thousands of
   small pieces (mullions, spokes, rivets, leaves) and still cost only a few draw calls.
   Every material goes through patch(), so the grey lens and hero detail still apply. */
const VM=new Map();
function vmat(o={}){ const k=JSON.stringify(o); if(VM.has(k)) return VM.get(k);
  const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:o.rough??.8,metalness:o.metal??0,flatShading:!!o.flat,emissive:o.em??0x000000,emissiveIntensity:o.ei??1,
    side:o.side?THREE.DoubleSide:THREE.FrontSide,transparent:o.op!=null,opacity:o.op??1,depthWrite:o.op==null||o.op>.6});
  if(o.brick) m.userData.brick=o.brick; if(o.pat) m.userData.pat=o.pat; patch(m); VM.set(k,m); return m; }
function kit(){ const L=new Map(); const k={
  p(m,geo,col,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1,shade){ k.raw(m,P(geo,col,x,y,z,rx,ry,rz,sx,sy,sz,shade)); return k; },
  l(m,geo,col,a,b,shade){ k.raw(m,PL(geo,col,a,b,shade)); return k; },
  raw(m,g,col=0xffffff){ if(!g.attributes.color) g=P(g,col); const key=JSON.stringify(m); let e=L.get(key); if(!e) L.set(key,e={m,parts:[]}); e.parts.push(g); return k; },
  build(cast=true){ const g=new THREE.Group(); for(const {m,parts} of L.values()){ const me=new THREE.Mesh(MG(parts),vmat(m)); me.castShadow=cast&&m.op==null; me.receiveShadow=true; g.add(me); } return g; } }; return k; }
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d), RB=(w,h,d,r)=>new RoundedBoxGeometry(w,h,d,2,r), CY=(rt,rb,h,s=12,open=false)=>new THREE.CylinderGeometry(rt,rb,h,s,1,open);
const SPH=(r,w=12,h=8)=>new THREE.SphereGeometry(r,w,h), TOR=(r,t,arc=Math.PI*2,rs=6,ts=20)=>new THREE.TorusGeometry(r,t,rs,ts,arc);
const UCYL=(r0,r1=r0,s=6)=>new THREE.CylinderGeometry(r1,r0,1,s);           /* unit-height, for k.l() between two points */
function tubeG(pts,r,seg=24,rs=6,closed=false){ return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>V3(...p)),closed),seg,r,rs,closed); }
/* a hanging cable between two points */
function sagG(a,b,sag=.12,r=.006){ const pts=[]; for(let s=0;s<=14;s++){ const t=s/14; pts.push([a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t-sag*Math.sin(Math.PI*t),a.z+(b.z-a.z)*t]); } return tubeG(pts,r,20,4); }
/* procedural surface patterns (object space): corrugated sheet, wood grain, clay roof tiles */
function PAT_GLSL(p){ const a=p.a??0, ax=['x','y','z'][a], o=['yz','xz','xy'][a];
  if(p.k==='corr') return `{ float cr=sin(vOP.${ax}/${(p.s??.03).toFixed(4)}*6.2832); diffuseColor.rgb*=.8+.2*(cr*.5+.5);
    float ru=smoothstep(.55,.9,vn3(vOP*vec3(4.,16.,4.)+2.)*.7+vn3(vOP*31.)*.4); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.9,.66,.45),ru*${(p.rust??.5).toFixed(2)}); }`;
  if(p.k==='wood') return `{ vec2 q=vOP.${o}; float gr=vn3(vec3(q*${(p.f??60).toFixed(1)}*vec2(1.,.12),vOP.${ax}*3.)); float st=sin((q.x+q.y)*${(p.f??60).toFixed(1)}+gr*7.);
    diffuseColor.rgb*=.8+.16*(st*.5+.5)+.1*vn3(vOP*9.); }`;
  if(p.k==='tile'){ const s=(p.s??.05).toFixed(4); return `{ float rw=floor(vOP.y/${s}), fy=fract(vOP.y/${s}); float cx=(vOP.x+vOP.z)/(${s}*1.25)+mod(rw,2.)*.5, fx=fract(cx);
    float hh=fract(sin(dot(vec2(floor(cx),rw),vec2(12.9898,78.233)))*43758.5453); diffuseColor.rgb*=(.66+.34*smoothstep(0.,.8,fy))*(.86+.14*sin(fx*3.1416))*(.84+.26*hh); }`; }
  if(p.k==='stain') return `{ float sn=vn3(vOP*vec3(5.,1.2,5.)); float dr=smoothstep(.35,.9,vn3(vec3(vOP.x*22.,vOP.y*2.5,vOP.z*22.)))*smoothstep(.9,0.,fract(vOP.y*.9));
    diffuseColor.rgb*=.9+.14*sn; diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.78,.76,.72),dr*${(p.d??.35).toFixed(2)}); }`;
  return ''; }
/* moving water: 'fall' runs down in world y, 'flow' runs along a world direction in xz */
function flowMat({c=0x9fc9d6,op=.9,mode='fall',speed=1,foam=.85,th=.45,dir=[1,0],em=.18,key=''}={}){
  const m=new THREE.MeshStandardMaterial({color:c,roughness:.08,metalness:.1,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide,emissive:c,emissiveIntensity:em});
  patch(m); const pb=m.onBeforeCompile, d=Math.hypot(...dir)||1;
  const q=mode==='fall'?`vec3 q=vec3(p.x*34.+p.z*18.,p.y*1.5+uT*${speed.toFixed(2)},p.z*34.-p.x*12.), q2=vec3(p.x*80.+p.z*40.,p.y*4.2+uT*${(speed*1.8).toFixed(2)},p.z*80.);`
    :`float al=dot(p.xz,vec2(${(dir[0]/d).toFixed(3)},${(dir[1]/d).toFixed(3)})), ac=dot(p.xz,vec2(${(-dir[1]/d).toFixed(3)},${(dir[0]/d).toFixed(3)})); vec3 q=vec3(al*4.-uT*${speed.toFixed(2)},ac*11.,p.y*3.), q2=vec3(al*11.-uT*${(speed*1.6).toFixed(2)},ac*26.,1.7);`;
  m.onBeforeCompile=(s,r)=>{ pb(s,r); s.uniforms.uT=WT;
    s.fragmentShader='uniform float uT; float fFoam=0.;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    { vec3 p=vHP; ${q} float n=vn3(q)*.62+vn3(q2)*.38; fFoam=smoothstep(${th.toFixed(2)},${(th+.28).toFixed(2)},n)*${foam.toFixed(2)};
      diffuseColor.rgb=mix(diffuseColor.rgb*(.82+.3*vn3(q2*.5)),vec3(.96,.985,1.),fFoam); diffuseColor.a=clamp(diffuseColor.a*(.72+.45*fFoam),0.,1.); }`)
    .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.65,fFoam);'); };
  m.customProgramCacheKey=()=>'flow'+mode+speed+foam+th+dir+key; return m; }
/* soft sprites (spray, mist, dust) that take part in the grey lens */
const SOFT=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'), r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.45,'rgba(255,255,255,.45)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
const EXTRA_PTS=[];
function spritePoints(n,color,size,op,additive=false){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3)); g.setAttribute('aLife',new THREE.BufferAttribute(new Float32Array(n),1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,uniforms:{map:{value:SOFT},col:{value:new THREE.Color(color)},sz:{value:size},op:{value:op},uGray:GRAY},
    vertexShader:`attribute float aLife; varying float vL; uniform float sz; void main(){ vL=aLife; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=sz*(.6+aLife*1.6)/-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`uniform sampler2D map; uniform vec3 col; uniform float op, uGray; varying float vL; void main(){ float a=texture2D(map,gl_PointCoord).a; vec3 c=mix(col,vec3(dot(col,vec3(.3,.59,.11))),uGray); gl_FragColor=vec4(c,a*op*sin(3.1416*clamp(vL,0.,1.))); }`});
  const p=new THREE.Points(g,m); p.frustumCulled=false; p.userData.sz=size; EXTRA_PTS.push(p); return p; }
/* a warm pool of light on the ground under a lamp */
const GLOWT=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'), r=g.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,'rgba(255,214,150,.95)'); r.addColorStop(.35,'rgba(255,170,90,.42)'); r.addColorStop(1,'rgba(255,140,60,0)'); g.fillStyle=r; g.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); })();
function glowPool(r){ const m=new THREE.MeshBasicMaterial({map:GLOWT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}); patch(m); const g=new THREE.Mesh(new THREE.CircleGeometry(r,24).rotateX(-Math.PI/2),m); g.renderOrder=2; return g; }
/* painted sign boards */
function signTex(text,{w=512,h=96,bg='#efe6cf',fg='#2b2620',font='600 54px Georgia, serif',border=null}={}){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d');
  g.fillStyle=bg; g.fillRect(0,0,w,h); if(border){ g.strokeStyle=border; g.lineWidth=6; g.strokeRect(5,5,w-10,h-10); } g.fillStyle=fg; g.font=font; g.textAlign='center'; g.textBaseline='middle'; g.fillText(text,w/2,h/2+2);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function sign(text,w,h,o={}){ const m=new THREE.MeshStandardMaterial({map:signTex(text,o),roughness:.75}); patch(m); const s=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m); s.receiveShadow=true; return s; }

/* ---- people: simple but proportioned figures, ~0.32 tall at scene scale ----
   dress: pants | dhoti | sari | lungi;  head: hair | turban | cap | topi | bun;  pose: stand | walk | sit | bend | point | carry */
const FIG_SWAPS=[], SWAPS=[];
function swapVehicle(obj,name,{len,y=0,flat=false}={}){ SWAPS.push({obj,name,len,y,flat}); }
const SKINS=[0x8d5a3b,0x7a4b30,0xa66a45,0x6b3f26,0x9a6440];
function figure({h=.32,top=0xe9e4da,bottom=0x2f3a4a,skin=SKINS[0],head='hair',hair=0x1b1714,dress='pants',pose='stand',accent=0xc0392b,tool=null,seed=1}={}){
  const K=kit(), R=rng(seed), cloth={rough:.88}, sk={rough:.6}, S=1;
  const hipY=.5, shY=.8, legX=.048;
  const walk=pose==='walk'?.32:0, sit=pose==='sit', bend=pose==='bend';
  /* legs */
  for(const sd of [-1,1]){ const sw=walk*sd;
    if(sit){ K.l(cloth,UCYL(.045,.04),bottom,V3(sd*legX,hipY,0),V3(sd*legX,hipY,.24)); K.l(cloth,UCYL(.04,.034),bottom,V3(sd*legX,hipY,.24),V3(sd*legX,.05,.26)); K.p({rough:.6},BX(.06,.04,.1),0x2a211b,sd*legX,.03,.29); }
    else { const kx=Math.sin(sw)*.24, ky=hipY-Math.cos(sw)*.24, fx=kx+Math.sin(sw*.55)*.24, fy=ky-Math.cos(sw*.55)*.24;
      K.l(cloth,UCYL(.047,.04),bottom,V3(sd*legX,hipY,0),V3(sd*legX,ky,kx)); K.l(cloth,UCYL(.04,.032),bottom,V3(sd*legX,ky,kx),V3(sd*legX,Math.max(.03,fy),fx));
      K.p({rough:.55},BX(.06,.04,.11),dress==='dhoti'||dress==='lungi'?skin:0x2a211b,sd*legX,.02,fx+.025); } }
  if(dress==='dhoti') K.p(cloth,CY(.085,.11,.3,10),0xf2ede0,0,.36,0);
  if(dress==='lungi') K.p(cloth,CY(.085,.1,.38,10),accent,0,.31,0);
  if(dress==='sari'){ K.p(cloth,CY(.08,.13,sit?.2:.47,12),accent,0,sit?.42:.245,sit?.06:0); K.l(cloth,UCYL(.03,.03),accent,V3(-.09,.48,.02),V3(.08,.8,.0)); }
  /* torso, bent forward when working */
  const lean=bend?.75:pose==='carry'?.08:0, tx=0, ty=hipY, tc=V3(0,ty+Math.cos(lean)*.15,Math.sin(lean)*.15), top3=V3(0,ty+Math.cos(lean)*.3,Math.sin(lean)*.3);
  K.p(cloth,CY(.078,.07,.3,10),top,tc.x,tc.y,tc.z,lean,0,0,1,1,.72);
  K.p(cloth,SPH(.08,10,6),top,top3.x,top3.y-.02,top3.z,0,0,0,1.15,.55,.8);
  const neck=V3(0,top3.y+.02,top3.z+.01), hc=V3(0,top3.y+.1,top3.z+Math.sin(lean)*.05);
  K.l(sk,UCYL(.026,.024),skin,V3(0,top3.y-.03,top3.z),neck);
  K.p(sk,SPH(.068,12,10),skin,hc.x,hc.y,hc.z,0,0,0,.92,1.1,.98);
  K.p(sk,SPH(.016,6,4),skin,hc.x,hc.y-.005,hc.z+.066);
  if(head==='hair') K.p({rough:.7},SPH(.071,12,8,),hair,hc.x,hc.y+.018,hc.z-.012,-.25,0,0,.95,.85,1);
  if(head==='bun'){ K.p({rough:.7},SPH(.071,12,8),hair,hc.x,hc.y+.015,hc.z-.012,-.25,0,0,.95,.85,1); K.p({rough:.7},SPH(.034,8,6),hair,hc.x,hc.y+.0,hc.z-.08); }
  if(head==='turban'){ K.p(cloth,TOR(.056,.026,Math.PI*2,6,14),accent,hc.x,hc.y+.04,hc.z,Math.PI/2,0,0,1,1,1.1); K.p(cloth,SPH(.058,10,6),accent,hc.x,hc.y+.06,hc.z,0,0,0,1,.7,1); }
  if(head==='cap') { K.p({rough:.7},SPH(.071,12,8),hair,hc.x,hc.y+.02,hc.z-.01,-.25,0,0,.95,.85,1); K.p(cloth,CY(.072,.074,.05,12),accent,hc.x,hc.y+.06,hc.z); K.p(cloth,BX(.08,.012,.06),accent,hc.x,hc.y+.04,hc.z+.07); }
  if(head==='topi'){ K.p(cloth,CY(.06,.066,.05,12),0xf4f1ea,hc.x,hc.y+.065,hc.z); K.p({rough:.7},SPH(.07,12,8),hair,hc.x,hc.y+.01,hc.z-.012,-.25,0,0,.95,.8,1); }
  /* arms */
  const shL=V3(-.1,top3.y-.03,top3.z), shR=V3(.1,top3.y-.03,top3.z);
  const armDirs={ stand:[[-.02,-1,.06],[.02,-1,.06]], walk:[[-.05,-1,-.3],[.05,-1,.3]], sit:[[-.05,-.7,.7],[.05,-.7,.7]], bend:[[-.1,-.6,.8],[.1,-.6,.8]],
    point:[[-.02,-1,.06],[.55,.25,.8]], carry:[[-.3,.75,.2],[.3,.75,.2]] }[pose]||[[-.02,-1,.06],[.02,-1,.06]];
  [[shL,armDirs[0]],[shR,armDirs[1]]].forEach(([sh,d0])=>{ const dv=V3(...d0).normalize(); const el=sh.clone().addScaledVector(dv,.15), hd=el.clone().addScaledVector(V3(dv.x,dv.y,dv.z+.12).normalize(),.15);
    K.l(cloth,UCYL(.03,.026),pose==='carry'||dress==='sari'?skin:top,sh,el); K.l(sk,UCYL(.025,.021),skin,el,hd); K.p(sk,SPH(.024,6,5),skin,hd.x,hd.y,hd.z); });
  if(tool==='stick'){ K.l({rough:.8},UCYL(.008),0x6b4a2b,V3(.1,.35,.18),V3(.14,.95,.42)); }
  if(tool==='pick'){ K.l({rough:.8},UCYL(.01),0x6b4a2b,V3(.0,.18,.28),V3(.02,.55,.42)); K.p({rough:.4,metal:.6},BX(.2,.025,.025),0x55575a,.02,.19,.28,0,0,.3); }
  if(tool==='bag'){ K.p({rough:.85},RB(.13,.17,.07,.02),accent,0,top3.y-.12,-.09); }
  if(tool==='can'){ K.p({rough:.4,metal:.6},CY(.035,.04,.08,10),0x8a8f94,.13,.52,.06); }
  const g=K.build(); g.scale.setScalar(h); FIG_SWAPS.push({g,o:{h,top,bottom,skin,head,hair,dress,pose,accent,tool,seed}}); return g; }

/* ---- hero trees: real branching structure with dense leaf clusters ---- */
const leafGeo0=new THREE.IcosahedronGeometry(1,0);
const SPEC={ rain:{cols:[0x2c561c,0x3a6823,0x477a2b,0x568a32,0x6a9a3a],spread:1.12,flat:.55,tips:2,lean:1.05},
  gul:{cols:[0xd8342a,0xe35a2a,0xc9281f,0xf07a35,0x3a6823,0x477a2b],spread:1.0,flat:.5,tips:2,lean:1.1},
  jac:{cols:[0x8a70c8,0x7b5fc0,0x9a80d4,0x6d55b0,0x4f7a32],spread:.85,flat:.7,tips:2,lean:.8},
  mango:{cols:[0x1f4a1a,0x2a5a20,0x2f6524,0x3b6a2a],spread:.7,flat:.95,tips:2,lean:.7},
  neem:{cols:[0x3f6e2a,0x4d7d30,0x5c8a38,0x6a9a3e],spread:.8,flat:.8,tips:2,lean:.8} };
function htree(seed,{h=1.6,w=1.0,kind='rain',leaves=1}={}){ const R=rng(seed), sp=SPEC[kind]||SPEC.rain, K=kit(), bark=0x54402e, pts=[];
  const grow=(a,dir,len,r,dep)=>{ const b=a.clone().addScaledVector(dir,len); K.l({rough:.95,pat:{k:'wood',a:1,f:90}},UCYL(r,r*.62,7),bark,a,b);
    if(dep>=sp.tips){ const cr=(.2+R()*.12)*w*1.5; const n=Math.round((38+R()*16)*leaves);
      for(let i=0;i<n;i++){ const u=R()*6.283, v=Math.acos(2*R()-1), rr=Math.cbrt(R()); const x=Math.sin(v)*Math.cos(u)*rr, y=Math.cos(v)*rr*sp.flat, z=Math.sin(v)*Math.sin(u)*rr;
        pts.push([b.x+x*cr,b.y+.04+y*cr,b.z+z*cr,(.035+R()*.035)*w*1.4,.7,rr,y]); } return; }
    const kids=dep===0?4+(R()*2|0):2+(R()*2|0);
    for(let i=0;i<kids;i++){ const az=i/kids*6.283+R()*.8, el=(dep===0?.62:.5)*sp.spread+R()*.3; const nd=V3(Math.sin(az)*Math.sin(el),Math.cos(el),Math.cos(az)*Math.sin(el)).lerp(dir,dep===0?.15:.35).normalize();
      grow(b,nd,len*(dep===0?.62:.6)*(.85+R()*.3)*sp.lean,r*.62,dep+1); } };
  grow(V3((R()-.5)*.04,0,(R()-.5)*.04),V3((R()-.5)*.12,1,(R()-.5)*.12).normalize(),h*.4,.06*h,0);
  const g=K.build();
  /* leaves: darker inside and underneath the crown, lit on the outer top */
  const im=new THREE.InstancedMesh(leafGeo0,ivyMat,pts.length), o=new THREE.Object3D(), c=new THREE.Color();
  pts.forEach((p,i)=>{ o.position.set(p[0],p[1],p[2]); o.rotation.set(R()*3,R()*3,R()*3); o.scale.set(p[3],p[3]*p[4],p[3]); o.updateMatrix(); im.setMatrixAt(i,o.matrix);
    c.set(sp.cols[(R()*sp.cols.length)|0]); const lit=clamp(.35+.5*p[5]+.4*p[6],0,1); c.multiplyScalar(.55+.6*lit); im.setColorAt(i,c); });
  im.castShadow=true; im.receiveShadow=true; im.computeBoundingBox(); im.computeBoundingSphere(); g.add(im); g.userData.sway=R()*6; return g; }
function cypress(seed,h=2.0){ const R=rng(seed), K=kit(); K.p({rough:.95},CY(.025,.04,h,6),0x4a3a2a,0,h/2,0);
  const pts=[]; for(let k=0;k<160;k++){ const y=.25+R()*(h-.2), rr=(1-Math.pow((y-.25)/(h-.05),1.3))*.24*(.6+R()*.5), a=R()*6.283; pts.push([Math.sin(a)*rr,y,Math.cos(a)*rr,.05+R()*.04,1.2]); }
  const g=K.build(); g.add(leafMassG(pts,R,[0x1d3f18,0x24481c,0x2c5420,0x335d25])); g.userData.sway=R()*6; return g; }
function leafMassG(pts,R,cols){ const im=new THREE.InstancedMesh(leafGeo0,ivyMat,pts.length), o=new THREE.Object3D(), c=new THREE.Color();
  pts.forEach((p,k)=>{ o.position.set(p[0],p[1],p[2]); o.rotation.set(R()*3,R()*3,R()*3); o.scale.set(p[3],p[3]*(p[4]??.85),p[3]); o.updateMatrix(); im.setMatrixAt(k,o.matrix); im.setColorAt(k,c.set(cols[(R()*cols.length)|0]).offsetHSL(0,0,(R()-.5)*.08)); });
  im.castShadow=true; im.receiveShadow=true; im.computeBoundingBox(); im.computeBoundingSphere(); return im; }
/* a shrub with flowers dotted on its outer surface */
function shrub(seed,{r=.16,cols=[0x2f5a1f,0x3d6a24,0x4c7a2b],flowers=null,fl=.3}={}){ const R=rng(seed), pts=[], fpts=[];
  for(let k=0;k<70;k++){ const u=R()*6.283, v=Math.acos(2*R()-1)*.55, rr=Math.cbrt(R()); pts.push([Math.sin(v)*Math.cos(u)*rr*r,r*.45+Math.cos(v)*rr*r*.8,Math.sin(v)*Math.sin(u)*rr*r,r*(.22+R()*.18),.8]);
    if(flowers&&R()<fl) fpts.push([Math.sin(v)*Math.cos(u)*r*1.02,r*.45+Math.cos(v)*r*.82,Math.sin(v)*Math.sin(u)*r*1.02,r*.1,1]); }
  const g=new THREE.Group(); g.add(leafMassG(pts,R,cols)); if(fpts.length) g.add(leafMassG(fpts,R,flowers)); return g; }
/* weathered boulder (granite / gneiss) */
function boulder(seed,sx,sy,sz,col=0x9a8d84){ const g=blob(2,.32,seed); const m=new THREE.Mesh(MG([P(g,col,0,0,0,0,0,0,sx,sy,sz,(x,y)=>.66+.42*clamp(y/sy*.5+.5,0,1))]),vmat({rough:.92,pat:{k:'stain',d:.5}})); m.castShadow=m.receiveShadow=true; return m; }

/* ================= DIORAMAS ================= */
const SP=20, START=-14, FZ=3.4;
/* the through street (scenes 5-7 sit on it) and the metro viaduct (scene 7): one world-level line each, so nothing starts or stops inside the view */
const STAGE_Z=1.56, STAGE_HW=.47, VIA_X0=134.4, VIA_Z=.09;
const WORLD_COLOUR=[];   /* world objects that belong to a scene (street, viaduct, train): drawn in colour in the card, like the scene itself */
const stopX=i=>i*SP;
const DIO=[];
function makeDio(i){ const g=new THREE.Group(); g.position.x=stopX(i); g.scale.setScalar(1.3); scene.add(g); const d={i,g,pieces:[],keys:[],disp:false,update:null}; DIO.push(d); return d; }
function piece(d,obj,o={}){ d.g.add(obj); const p={obj,dyn:!!o.dyn,hero:!!o.hero,key:!!o.key,slide:o.slide??null,amp:o.amp??1,lift:o.lift??0,d:0,t:0,wait:0,tgt:0,phase:Math.random()*6.28,glow:0}; d.pieces.push(p); if(p.key) d.keys.push(p); return obj; }
/* one real-world scale everywhere: a 1.75 m person is .32 in a scene, x1.3 = .416 in the world (~.24 per metre) */
const DIO_SCALE=1.3, RS=2.4;
function finalize(d,fit=7.0,maxH=4.9){
  /* fit each scene to the card's illustration area (352 x 331 in the Figma frame) */
  d.g.scale.setScalar(1); d.g.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(d.g), sz=bb.getSize(new THREE.Vector3());
  d.g.scale.setScalar(DIO_SCALE); d.g.updateMatrixWorld(true);
  bb.setFromObject(d.g); d.cy=(bb.min.y+bb.max.y)/2;
  const R=rng(d.i*97+11), box3=new THREE.Box3(), c=new THREE.Vector3();
  d.pieces.forEach(p=>{ const o=p.obj; p.home=o.position.clone(); p.hr=o.rotation.clone(); p.hs=o.scale.clone();
    box3.setFromObject(o); box3.getCenter(c); d.g.worldToLocal(c);
    let v=new THREE.Vector3(c.x,0,c.z); if(v.length()<.25) v.set(R()-.5,0,R()-.5); v.normalize();
    p.off=new THREE.Vector3(v.x*(1.6+R()*2.0),2.2+R()*3.0+p.lift,v.z*(1.0+R()*1.2)).multiplyScalar(Math.max(p.amp,.35));
    p.roff=new THREE.Vector3((R()-.5)*2.2,(R()-.5)*2.6,(R()-.5)*2).multiplyScalar(Math.max(p.amp,.4));
    if(p.amp<=.15){ p.off.set(0,-.35,0); p.roff.set(0,0,0); }
  });
  const rest=d.pieces.filter(p=>!p.hero); rest.forEach((p,k)=>{ p.delay=k/Math.max(1,rest.length-1)*.55; p.d=0; });
  d.prox=0; d.focus=0; d.at=0; d.baseRY=d.g.rotation.y; d.hero=d.pieces.find(p=>p.hero); d.sway=[];
  d.g.traverse(m=>{ if(m.userData.sway!=null) d.sway.push(m); if(m.isMesh) m.userData.dio=d.i; });
}
let T=0;
function base(d,r=2.7){
  const R=rng(d.i*31+5), bs=new THREE.Group();
  for(let k=0;k<7;k++){ const a=R()*6.28, rr=r*(.75+R()*.35); bs.add(bush(Math.sin(a)*rr,Math.cos(a)*rr*.8,0,.8+R()*.6,R)); }
  piece(d,bs,{amp:.25});
}
function watchtower(s=1){ const g=new THREE.Group();
  g.add(at(ico(.42,C.stone2,0),0,.1,0,.4)); g.add(at(box(.5,.42,.5,C.cream),0,.44,0));
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>g.add(at(cyl(.035,.035,.42,C.cream,6),a*.2,.86,b*.2)));
  g.add(at(box(.66,.07,.66,C.cream),0,1.1,0)); g.add(at(cone(.45,.5,C.roof,4),0,1.38,0,Math.PI/4)); g.add(at(sph(.06,C.gold),0,1.67,0)); g.scale.setScalar(s); return g; }

/* 0 · 1537 fort (recreated from the supplied castle render: sandstone, crenellated towers, ivy, stepped plinth) */
{ const d=makeDio(0); const R=rng(15);
  const sandB=mat(C.sand,{brick:[.17,.075],rough:.85}), plinM=mat(0xd1a26c,{brick:[.6,.2],rough:.9}), capM=mat(0xe2b47c,{rough:.82});
  const GT=0;
  const merlonRow=(x0,x1,y,z,ry=0)=>{ const g=new THREE.Group(); const n=Math.max(2,Math.round(Math.abs(x1-x0)/.25)); for(let k=0;k<=n;k++) g.add(at(box(.13,.16,.14,sandB),x0+(x1-x0)*k/n,y,z)); g.rotation.y=ry; return g; };
  const tower=(r,h,nW=2)=>{ const g=new THREE.Group();
    g.add(at(cyl(r,r*1.05,h,sandB,28),0,h/2,0)); g.add(at(cyl(r+.1,r,.16,capM,28),0,h+.08,0)); g.add(at(cyl(r+.1,r+.1,.14,sandB,28),0,h+.23,0));
    g.add(at(cyl(r+.04,r+.04,.02,darkWin,20),0,h+.3,0));
    const n=10; for(let k=0;k<n;k++){ const a=k/n*6.283; g.add(at(box(.13,.17,.11,sandB),Math.sin(a)*(r+.04),h+.38,Math.cos(a)*(r+.04),a)); }
    for(let k=0;k<n;k++){ const a=(k+.5)/n*6.283; g.add(at(box(.035,.05,.03,darkWin),Math.sin(a)*(r+.1),h+.12,Math.cos(a)*(r+.1),a)); }
    [-.55,.55].slice(0,nW).forEach(a=>{ const w=at(archWin(.12,.26),Math.sin(a)*(r+.01),h*.72,Math.cos(a)*(r+.01),a); g.add(w); });
    g.add(at(archWin(.1,.2),0,h*.42,r+.012)); return g; };
  /* rear block and front wing */
  const rear=new THREE.Group(); rear.add(at(box(3.6,1.75,1.3,sandB),.1,GT+.875,-.8));
  for(let k=0;k<5;k++) rear.add(at(archWin(.2,.4),-1.3+k*.6+.1,GT+1.05,-.145));
  rear.add(at(box(3.66,.07,1.36,capM),.1,GT+1.78,-.8)); rear.add(merlonRow(-1.7,1.9,GT+1.9,-.16)); rear.add(merlonRow(-1.7,1.9,GT+1.9,-1.44));
  piece(d,rear,{});
  const wing=new THREE.Group(); wing.add(at(box(2.9,1.25,1.0,sandB),-.3,GT+.625,.42));
  for(let k=0;k<4;k++){ wing.add(at(archWin(.26,.5),-1.25+k*.62,GT+.1,.925)); wing.add(at(archWin(.22,.4),-1.25+k*.62,GT+.74,.925)); }
  wing.add(at(box(2.96,.06,1.06,capM),-.3,GT+.67,.42)); wing.add(at(box(2.7,.05,.14,capM),-.3,GT+.72,.98));
  for(let k=0;k<9;k++) wing.add(at(box(.035,.13,.035,capM),-1.55+k*.31,GT+.8,1.03));
  wing.add(at(box(2.96,.07,1.06,capM),-.3,GT+1.27,.42)); wing.add(merlonRow(-1.7,1.1,GT+1.39,.9));
  piece(d,wing,{});
  /* right block with gabled porch */
  const rb=new THREE.Group(); rb.add(at(box(1.15,1.45,1.5,sandB),1.62,GT+.725,.12));
  rb.add(at(archWin(.2,.4),1.62,GT+.85,.875)); rb.add(at(archWin(.16,.3),1.25,GT+.85,.875));
  rb.add(at(box(1.21,.07,1.56,capM),1.62,GT+1.47,.12)); rb.add(merlonRow(1.1,2.15,GT+1.58,.86));
  const por=new THREE.Group(); por.add(at(box(.7,.95,.42,sandB),0,.475,0)); por.add(at(prism(.86,.42,.48,sandB),0,.95,0)); por.add(at(prism(.92,.46,.4,capM),0,.93,-.02));
  por.add(at(archWin(.34,.66,true),0,0,.215)); por.add(at(box(.08,.12,.06,capM),0,1.38,0));
  rb.add(at(por,1.62,GT,.95)); piece(d,rb,{});
  /* left porch */
  const lp=new THREE.Group(); lp.add(at(box(.66,.9,.4,sandB),0,.45,0)); lp.add(at(prism(.8,.4,.46,sandB),0,.9,0)); lp.add(at(archWin(.3,.62,true),0,0,.205)); lp.add(at(archWin(.1,.18),0,.98,.235));
  piece(d,at(lp,-1.18,GT,1.07),{});
  /* towers */
  const T1=at(tower(.34,1.95),-1.82,GT,.6), T2=at(tower(.34,2.1),-.6,GT,.95), T3=at(tower(.37,2.3),.62,GT,.95), T4=at(tower(.34,3.05),1.85,GT,-.9), T5=at(tower(.3,2.35),-1.35,GT,-.95);
  piece(d,T1,{}); piece(d,T2,{}); piece(d,T5,{}); piece(d,T4,{lift:.4}); piece(d,T3,{hero:true,lift:.5});
  /* ivy */
  piece(d,grp(ivyTower(-1.82,.6,.34,GT,GT+1.35,-1.2,1.4,90,R),ivyTower(-.6,.95,.34,GT,GT+1.2,-1.3,1.3,80,R),ivyTower(.62,.95,.37,GT,GT+1.3,-1.3,1.4,90,R)),{amp:.5});
  piece(d,grp(ivyTower(1.85,-.9,.34,GT+.2,GT+2.2,.3,1.9,80,R),ivyWall(.95,1.3,GT,GT+1.1,.87,26,R),ivyWall(-1.62,-1.42,GT,GT+.9,1.27,14,R)),{amp:.5});
  /* the pete outside the gate: traders and a woman carrying water */
  piece(d,grp(at(figure({pose:'walk',dress:'sari',head:'bun',accent:0xb8264a,skin:SKINS[2],tool:'can',seed:81}),.3,0,1.75,Math.PI*.9),
    at(figure({pose:'stand',dress:'dhoti',head:'turban',top:0xf2ede0,accent:0xe1a12e,skin:SKINS[0],tool:'stick',seed:82}),-.55,0,1.65,.3),
    at(figure({pose:'bend',dress:'lungi',head:'hair',top:0xd9cdb0,accent:0x3d5a7a,skin:SKINS[3],seed:83}),1.05,0,1.6,-.6)),{amp:.4});
  d.g.rotation.y=-.62;
  const flag=new THREE.Group(); flag.add(at(cyl(.012,.012,.55,mat(C.dark),5),0,.27,0)); const cloth=box(.26,.15,.01,mat(0xb8432e,{side:true})); cloth.position.set(.13,.47,0); flag.add(cloth);
  T4.add(at(flag,0,3.05+.45,0));
  d.update=(t,dt,k)=>{ cloth.rotation.y=Math.sin(t*3.1)*.35*k; cloth.scale.x=1-.12*Math.abs(Math.sin(t*2.3))*k; };
  finalize(d,7.0); }

/* a single mesh whose own space carries a surface pattern (vertex colours baked in) */
function vm(geo,col,o={}){ const m=new THREE.Mesh(P(geo,col),vmat(o)); m.castShadow=o.op==null; m.receiveShadow=true; return m; }
function halfCyl(r,len,axis='x',seg=28){ const g=axis==='x'?new THREE.CylinderGeometry(r,r,len,seg,1,true,0,Math.PI):new THREE.CylinderGeometry(r,r,len,seg,1,true,Math.PI/2,Math.PI);
  if(axis==='x') g.rotateZ(Math.PI/2); else g.rotateX(Math.PI/2); return g; }

/* 1 · 1760 Lalbagh: the 1889 Glass House on a Mughal char-bagh, rose parterres, a tiered fountain, and Lalbagh Rock with its watchtower */
{ const d=makeDio(1); const R=rng(2);
  const iron={rough:.38,metal:.35}, IRON=0xf2eee4, glassO={rough:.03,metal:.6,op:.24,side:true}, GL=0xcfe7e6;
  /* ground: gravel walks, the terrace, stone-edged water channels */
  { const K=kit(), GR=0xd9c8a4, ED=0xd2c6ae;
    K.p({rough:.97},BX(.66,.02,2.3),GR,0,.01,.62); K.p({rough:.97},BX(3.5,.02,.46),GR,0,.011,.8); K.p({rough:.97},BX(3.0,.02,.52),GR,0,.012,-.38);
    for(const s of [-1,1]){ K.p({rough:.85},BX(.035,.035,1.75),ED,s*.1,.025,.88); K.p({rough:.85},BX(2.9,.035,.035),ED,0,.026,.8+s*.1); }
    piece(d,K.build(),{amp:.15}); }
  { const fw=flowMat({c:0x4f8ea2,mode:'flow',speed:.35,foam:.35,th:.55,dir:[0,1],op:.9,em:.1,key:'lb'});
    const g=new THREE.Group(); const a=new THREE.Mesh(new THREE.BoxGeometry(.165,.01,1.75),fw); a.position.set(0,.03,.88); const b=new THREE.Mesh(new THREE.BoxGeometry(2.9,.01,.165),fw); b.position.set(0,.031,.8); g.add(a,b);
    /* tiered fountain at the crossing */
    const K=kit(), ST=0xe1d6c0, sto={rough:.85};
    K.p(sto,CY(.34,.36,.09,8),ST,0,.045,.8); K.p(sto,CY(.3,.3,.091,8),0x6b8b8f,0,.046,.8);
    K.p(sto,CY(.04,.06,.26,10),ST,0,.2,.8); K.p(sto,new THREE.LatheGeometry([V3(0,0),V3(.15,.0),V3(.165,.035),V3(.16,.04)].map(v=>new THREE.Vector2(v.x,v.y)),20),ST,0,.32,.8);
    K.p(sto,CY(.025,.035,.14,10),ST,0,.42,.8); K.p(sto,new THREE.LatheGeometry([new THREE.Vector2(0,0),new THREE.Vector2(.085,0),new THREE.Vector2(.095,.025)],16),ST,0,.48,.8); K.p(sto,SPH(.025,10,8),ST,0,.53,.8);
    g.add(K.build());
    const fall=flowMat({mode:'fall',speed:1.8,foam:.55,th:.5,op:.42,c:0xcfe6ee,em:.1,key:'lbf'});
    [[.162,.33,.23],[.09,.5,.12]].forEach(([r,y,h])=>{ const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r+.025,h,20,1,true),fall); c.position.set(0,y-h/2,.8); g.add(c); });
    const pool=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.01,8),flowMat({c:0x5d97a6,mode:'flow',speed:.3,foam:.5,th:.5,dir:[1,1],op:.95,key:'lbp'})); pool.position.set(0,.088,.8); g.add(pool);
    const jet=new THREE.Mesh(new THREE.CylinderGeometry(.006,.012,.16,8,1,true),fall); jet.position.set(0,.6,.8); g.add(jet);
    piece(d,g,{key:true}); }
  /* four rose parterres with clipped box hedges and corner topiary */
  const bedQ=[[1,1],[-1,1],[1,-1],[-1,-1]];
  bedQ.forEach(([sx,sz],q)=>{ const x0=.42, x1=1.52, z0=sz>0?.96:.14, z1=sz>0?1.62:.6, cx=sx*(x0+x1)/2, cz=(z0+z1)/2, w=x1-x0, dz=z1-z0;
    const K=kit(), HG=0x2b5a21, hed={rough:.9};
    K.p({rough:.98},BX(w,.03,dz),0x5c4129,cx,.015,cz);
    K.p(hed,RB(w,.07,.06,.02),HG,cx,.045,cz-dz/2); K.p(hed,RB(w,.07,.06,.02),HG,cx,.045,cz+dz/2); K.p(hed,RB(.06,.07,dz,.02),HG,cx-w/2,.045,cz); K.p(hed,RB(.06,.07,dz,.02),HG,cx+w/2,.045,cz);
    K.p(hed,RB(.06,.06,dz-.1,.02),HG,cx,.04,cz);
    for(const [ex,ez] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ K.p({rough:.9,flat:true},new THREE.ConeGeometry(.06,.24,8),0x24501c,cx+ex*w/2,.19,cz+ez*dz/2); K.p({rough:.9},CY(.05,.06,.06,8),0x9a8f7c,cx+ex*w/2,.03,cz+ez*dz/2); }
    const g=K.build(); const lp=[], fp=[];
    for(let i=0;i<8;i++) for(let j=0;j<2;j++){ const bx=cx-w/2+.1+(i+.5)*(w-.2)/8, bz=cz+(j?.17:-.17)*dz/.66;
      for(let k=0;k<14;k++){ const u=R()*6.283, rr=Math.sqrt(R())*.07; lp.push([bx+Math.cos(u)*rr,.07+R()*.08,bz+Math.sin(u)*rr,.026+R()*.02,.8]); }
      for(let k=0;k<5;k++){ const u=R()*6.283, rr=Math.sqrt(R())*.06; fp.push([bx+Math.cos(u)*rr,.13+R()*.05,bz+Math.sin(u)*rr,.017+R()*.008,1]); } }
    g.add(leafMassG(lp,R,[0x2f5a1f,0x3d6a24,0x46732a])); g.add(leafMassG(fp,R,q%2?[0xc41f2c,0xe0384a,0xa8141f]:[0xf06a8a,0xe8405a,0xffd2dc]));
    piece(d,g,{key:true}); });
  /* the Glass House (1889): cast-iron nave and transept, glazed barrel vaults, a lantern over the crossing */
  { const gh=new THREE.Group(), Kf=kit(), Kg=kit(), z0=-1.2, Ln=2.7, wn=.42, hw=.4, Lt=1.36, wt=.36, b=.08, yb=b+hw;
    Kf.p({rough:.88},BX(Ln+.12,b,2*wn+.12),0xd9cdb6,0,b/2,z0); Kf.p({rough:.88},BX(2*wt+.12,b,Lt+.12),0xd9cdb6,0,b/2,z0);
    Kf.p({rough:.88},BX(.9,.04,.3),0xcfc3ab,0,.02,z0+Lt/2+.18); Kf.p({rough:.88},BX(.75,.04,.18),0xcfc3ab,0,.06,z0+Lt/2+.11);
    /* nave walls */
    for(const s of [-1,1]){ Kg.p(glassO,BX(Ln,hw,.006),GL,0,b+hw/2,z0+s*wn); Kg.p(glassO,BX(.006,hw,2*wn),GL,s*Ln/2,b+hw/2,z0); }
    for(let x=-Ln/2;x<=Ln/2+.001;x+=Ln/20){ for(const s of [-1,1]){ if(Math.abs(x)<wt+.01) continue; Kf.p(iron,BX(.014,hw,.016),IRON,x,b+hw/2,z0+s*wn); } }
    for(let z=-wn;z<=wn+.001;z+=wn/3) for(const s of [-1,1]) Kf.p(iron,BX(.016,hw,.014),IRON,s*Ln/2,b+hw/2,z0+z);
    for(const y of [b+.012,b+.16,yb]){ for(const s of [-1,1]){ Kf.p(iron,BX(Ln+.02,.016,.022),IRON,0,y,z0+s*wn); Kf.p(iron,BX(.022,.016,2*wn+.02),IRON,s*Ln/2,y,z0); } }
    /* nave vault: glazing, ribs, purlins, ridge cresting */
    Kg.p(glassO,halfCyl(wn,Ln,'x'),GL,0,yb,z0);
    for(let k=0;k<=20;k++) Kf.p(iron,TOR(wn+.004,.0075,Math.PI,4,22),IRON,-Ln/2+k*Ln/20,yb,z0,0,Math.PI/2,0);
    for(let a=1;a<6;a++){ const t=a/6*Math.PI; Kf.p(iron,BX(Ln,.011,.011),IRON,0,yb+Math.sin(t)*(wn+.004),z0+Math.cos(t)*(wn+.004)); }
    for(let x=-Ln/2+.05;x<Ln/2;x+=.09) Kf.p(iron,new THREE.ConeGeometry(.008,.05,4),IRON,x,yb+wn+.03,z0);
    /* nave gable fans */
    for(const s of [-1,1]){ Kg.p(glassO,new THREE.CircleGeometry(wn,24,0,Math.PI),GL,s*Ln/2,yb,z0,0,Math.PI/2,0);
      for(let k=0;k<=8;k++){ const a=k/8*Math.PI; Kf.l(iron,UCYL(.006),IRON,V3(s*Ln/2,yb,z0),V3(s*Ln/2,yb+Math.sin(a)*wn,z0+Math.cos(a)*wn)); }
      Kf.p(iron,TOR(wn*.45,.007,Math.PI,4,16),IRON,s*Ln/2,yb,z0,0,Math.PI/2,0); }
    /* transept: front and back porches, vaulted, with a fan gable and a door */
    for(const s of [-1,1]){ const zf=z0+s*Lt/2, zm=z0+s*(wn+(Lt/2-wn)/2), ln=Lt/2-wn;
      Kg.p(glassO,BX(2*wt,hw,.006),GL,0,b+hw/2,zf); for(const sx of [-1,1]) Kg.p(glassO,BX(.006,hw,ln),GL,sx*wt,b+hw/2,zm);
      for(let x=-wt;x<=wt+.001;x+=wt/3){ if(s>0&&Math.abs(x)<.13) continue; Kf.p(iron,BX(.014,hw,.016),IRON,x,b+hw/2,zf); }
      for(const sx of [-1,1]) for(let z=0;z<=ln+.001;z+=ln/2) Kf.p(iron,BX(.016,hw,.014),IRON,sx*wt,b+hw/2,z0+s*(wn+z));
      for(const y of [b+.012,b+.16,yb]){ Kf.p(iron,BX(2*wt+.02,.016,.022),IRON,0,y,zf); for(const sx of [-1,1]) Kf.p(iron,BX(.022,.016,ln+.02),IRON,sx*wt,y,zm); }
      Kg.p(glassO,halfCyl(wt,ln+.04,'z'),GL,0,yb,zm);
      for(let k=0;k<=4;k++) Kf.p(iron,TOR(wt+.004,.0075,Math.PI,4,20),IRON,0,yb,z0+s*(wn+k*ln/4));
      for(let a=1;a<5;a++){ const t=a/5*Math.PI; Kf.p(iron,BX(.011,.011,ln+.04),IRON,Math.cos(t)*(wt+.004),yb+Math.sin(t)*(wt+.004),zm); }
      Kg.p(glassO,new THREE.CircleGeometry(wt,22,0,Math.PI),GL,0,yb,zf);
      for(let k=0;k<=8;k++){ const a=k/8*Math.PI; Kf.l(iron,UCYL(.006),IRON,V3(0,yb,zf),V3(Math.cos(a)*wt,yb+Math.sin(a)*wt,zf)); }
      Kf.p(iron,TOR(wt*.45,.007,Math.PI,4,16),IRON,0,yb,zf); }
    /* door */
    Kf.p(iron,BX(.26,.3,.02),0x2c3a34,0,b+.15,z0+Lt/2+.002); Kf.p(iron,TOR(.13,.012,Math.PI,4,14),IRON,0,b+.3,z0+Lt/2+.006); Kf.p(iron,BX(.012,.3,.024),IRON,0,b+.15,z0+Lt/2+.008);
    /* lantern over the crossing */
    const yd=yb+wn-.04, hd=.26, wd=.33;
    for(const [x,z,ry] of [[0,wd,0],[0,-wd,0],[wd,0,Math.PI/2],[-wd,0,Math.PI/2]]){ Kg.p(glassO,BX(2*wd,hd,.006),GL,x,yd+hd/2,z0+z,0,ry,0);
      for(let u=-wd;u<=wd+.001;u+=wd/3) Kf.p(iron,BX(.013,hd,.016),IRON,x+(ry?0:u),yd+hd/2,z0+z+(ry?u:0)); }
    Kf.p(iron,BX(2*wd+.06,.03,2*wd+.06),IRON,0,yd+hd,z0); Kf.p(iron,BX(2*wd+.04,.02,2*wd+.04),IRON,0,yd,z0);
    Kg.p(glassO,halfCyl(wd,2*wd,'x'),GL,0,yd+hd,z0); Kg.p(glassO,halfCyl(wd,2*wd,'z'),GL,0,yd+hd,z0);
    for(let k=0;k<=4;k++){ Kf.p(iron,TOR(wd+.004,.007,Math.PI,4,18),IRON,-wd+k*wd/2,yd+hd,z0,0,Math.PI/2,0); Kf.p(iron,TOR(wd+.004,.007,Math.PI,4,18),IRON,0,yd+hd,z0-wd+k*wd/2); }
    Kf.p(iron,SPH(.04,12,8),IRON,0,yd+hd+wd+.02,z0); Kf.p(iron,new THREE.ConeGeometry(.012,.2,6),IRON,0,yd+hd+wd+.15,z0);
    gh.add(Kf.build());
    /* palms and ferns growing inside, seen through the glass */
    for(const [x,z,s] of [[-.95,0,.34],[.95,.05,.3],[-.5,-.15,.26],[.45,.15,.24],[0,0,.42]]){ const p=new THREE.Mesh(TREE_GEOS.palm[(x>0)|0],leafMat); p.scale.setScalar(s); p.position.set(x,b,z0+z); p.castShadow=true; gh.add(p); }
    { const lp=[]; for(let k=0;k<160;k++){ const x=(R()-.5)*(Ln-.2), z=(R()-.5)*(2*wn-.15); lp.push([x,b+.03+R()*.08,z0+z,.04+R()*.03,.7]); } gh.add(leafMassG(lp,R,[0x2f6a26,0x3d7a2c,0x4e8a32,0x2a5a20])); }
    gh.add(Kg.build(false)); gh.scale.setScalar(1.12); gh.position.z=.12;
    piece(d,gh,{hero:true,lift:.5}); }
  /* Lalbagh Rock: 3,000-million-year-old gneiss, with Kempegowda's tower on top */
  { const g=new THREE.Group(); const rk=boulder(41,1.05,.42,.72,0x948b86); rk.position.set(-1.62,-.08,-1.72); g.add(rk); const r2=boulder(42,.42,.22,.36,0x8f8781); r2.position.set(-1.08,-.03,-1.95); g.add(r2); const r3=boulder(43,.3,.14,.26,0x9a918a); r3.position.set(-2.0,-.03,-1.3); g.add(r3);
    g.add(at(watchtower(.32),-1.65,.3,-1.8)); piece(d,g,{key:true}); }
  /* trees: rain trees, a gulmohur, a jacaranda, and Mughal cypresses at the terrace */
  piece(d,at(htree(301,{h:1.85,w:.85,kind:'rain'}),1.7,0,-1.75),{key:true});
  piece(d,at(htree(302,{h:1.35,w:.72,kind:'gul'}),-1.78,0,1.25),{key:true});
  piece(d,at(htree(303,{h:1.3,w:.68,kind:'neem'}),1.8,0,1.3),{key:true});
  piece(d,at(htree(304,{h:1.4,w:.75,kind:'jac'}),.55,0,-2.15),{key:true});
  piece(d,grp(at(cypress(305,1.15),-1.5,0,-.3),at(cypress(306,1.15),1.5,0,-.3)),{key:true});
  /* people: a mali at the roses, a couple on the walk */
  piece(d,at(figure({pose:'bend',dress:'dhoti',head:'turban',top:0xf2ede0,accent:0xe8e0cc,skin:SKINS[1],seed:11}),-.95,.03,1.3,.6),{amp:.4});
  piece(d,grp(at(figure({pose:'walk',dress:'sari',head:'bun',accent:0xb8264a,skin:SKINS[2],seed:12}),.25,.02,1.42,Math.PI),at(figure({pose:'walk',dress:'dhoti',head:'turban',top:0xf4f0e6,accent:0xd9a63a,skin:SKINS[0],seed:13}),-.24,.02,1.5,Math.PI)),{amp:.4});
  d.g.rotation.y=-.12;
  finalize(d,7.0); }

/* 2 · 1905 City of Lights: Shivanasamudra's falls feed a stone powerhouse; a steel pylon carries the line to cast-iron lamps that switch on, one by one */
{ const d=makeDio(2); const R=rng(19);
  /* street: granite setts, kerbs, flagstone footpath */
  { const g=new THREE.Group(); const st=new THREE.Mesh(P(BX(4.0,.03,1.0),0x7f776c),vmat({rough:.93,brick:[.07,.055]})); st.position.set(0,.015,.95); st.receiveShadow=true; g.add(st);
    const fp=new THREE.Mesh(P(BX(4.0,.035,.32),0xb1a898),vmat({rough:.92,brick:[.2,.2]})); fp.position.set(0,.0175,.29); fp.receiveShadow=true; g.add(fp);
    const K=kit(); K.p({rough:.85},BX(4.0,.055,.06),0xc2b8a6,0,.027,.46); K.p({rough:.85},BX(4.0,.055,.06),0xc2b8a6,0,.027,1.46); g.add(K.build()); piece(d,g,{amp:.15}); }
  /* the falls: a horseshoe of layered granite, three cascades, a churning plunge pool, spray */
  const mist=spritePoints(44,0xffffff,.5,.34), mistD=[];
  { const g=new THREE.Group(), K=kit(), cx=-1.12, cz=-1.6, RR=.82, rk={rough:.93,pat:{k:'stain',d:.45}};
    /* stratified granite: ledges stepping back with height, a dark backing mass so no gaps show */
    K.p(rk,blob(2,.3,5),0x6f675f,cx,.62,cz-.95,0,0,0,1.45,.78,.42);
    for(let L=0;L<9;L++){ const y=L*.155, back=L*.05; for(let a=-1.3;a<=1.31;a+=.13+R()*.1){ const ang=a+(R()-.5)*.06, rr=RR+back+(R()-.5)*.06;
      const wet=Math.abs(ang)<.95?.72:1, big=.7+R()*.75; const c=new THREE.Color([0x9a8f86,0x8b8178,0xa69b90,0x7f766e,0x938a80][(R()*5)|0]).multiplyScalar(wet);
      K.p(rk,blob(1,.55,L*31+a*7+3),c.getHex(),cx+Math.sin(ang)*rr,y+.08,cz-Math.cos(ang)*rr*.55-back,R()*.5,R()*3,R()*.5,.1*big+R()*.05,.07*big+R()*.03,.09*big+R()*.05,(x,yy)=>.55+.55*clamp((yy-y)/.17+.5,0,1)); } }
    K.p(rk,blob(2,.22,7),0x8a8179,cx,1.32,cz-1.0,0,0,0,1.5,.12,.5);
    for(let k=0;k<14;k++){ const a=(R()-.5)*2.4; K.p({rough:.9},blob(1,.4,90+k),[0x3d5a24,0x4a6a2a,0x2f4a1f][k%3],cx+Math.sin(a)*(RR+.3),1.38+R()*.06,cz-Math.cos(a)*(RR+.3)*.55-.32,0,0,0,.1+R()*.06,.06+R()*.03,.09+R()*.05); }
    for(let k=0;k<9;k++) K.p(rk,blob(1,.45,60+k),0x8a8178,cx+(R()-.5)*1.6,.05,cz+.55+R()*.3,R()*3,R()*3,R()*3,.1+R()*.08,.07+R()*.04,.09+R()*.06);
    g.add(K.build());
    /* water over the lip, three cascades, pool, outflow */
    const top=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.5).rotateX(-Math.PI/2),flowMat({c:0x5b8c96,mode:'flow',speed:.9,foam:.55,th:.48,dir:[0,1],op:.95,key:'sv1'})); top.position.set(cx,1.43,cz-.48); g.add(top);
    const FOAM=flowMat({c:0xffffff,mode:'flow',speed:1.3,foam:1,th:.25,dir:[0,1],op:.8,key:'svf'});
    const fall=flowMat({c:0xb9d9e3,mode:'fall',speed:2.3,foam:.8,th:.38,op:.8,em:.2,key:'sv2'});
    for(const [a,w,h] of [[-.9,.13,1.0],[-.58,.24,1.36],[-.26,.16,1.38],[.06,.3,1.4],[.38,.17,1.38],[.66,.22,1.3],[.95,.12,.9]]){ const geo=new THREE.PlaneGeometry(w,h,4,18), p=geo.attributes.position;
      for(let i=0;i<p.count;i++){ const y=p.getY(i), t=(y+h/2)/h; p.setZ(i,.07*Math.sin((1-t)*Math.PI)+.05*(1-t)); p.setX(i,p.getX(i)*(1+.35*(1-t))); } geo.computeVertexNormals();
      const m=new THREE.Mesh(geo,fall), bk=(1.4-h)*.32; m.position.set(cx+Math.sin(a)*(RR-.16+bk),h/2+.02,cz-Math.cos(a)*(RR-.16+bk)*.55+.04-bk); m.rotation.y=-a*.85; m.renderOrder=3; g.add(m);
      const fo=new THREE.Mesh(new THREE.CircleGeometry(w*.8,20).rotateX(-Math.PI/2),FOAM); fo.position.set(m.position.x,.05,m.position.z+.1); fo.renderOrder=4; g.add(fo);
      for(let k=0;k<6;k++) mistD.push({x:m.position.x,z:m.position.z+.12,w,ph:R(),sp:.25+R()*.2,dx:(R()-.5)*w,dz:R()*.25}); }
    const pool=new THREE.Mesh(new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2),flowMat({c:0x3f7f8f,mode:'flow',speed:.45,foam:.45,th:.52,dir:[-1,.5],op:.96,em:.08,key:'sv4'})); pool.scale.set(.95,1,.42); pool.position.set(cx,.035,cz+.72); g.add(pool);
    const out=new THREE.Mesh(new THREE.PlaneGeometry(1.0,.34).rotateX(-Math.PI/2),flowMat({c:0x3f7f8f,mode:'flow',speed:.6,foam:.4,th:.55,dir:[-1,0],op:.96,key:'sv5'})); out.position.set(cx-.75,.03,cz+.95); out.rotation.y=-.35; g.add(out);
    g.add(mist); piece(d,g,{key:true}); }
  /* powerhouse: dressed stone, tall arched windows, corrugated roof with a ventilator ridge, two riveted penstocks */
  { const g=new THREE.Group(), cx=.52, cz=-1.3, W=1.45, H=1.0, D=.9;
    g.add(at(vm(BX(W,H,D),0xbca78a,{rough:.9,brick:[.13,.065]}),cx,H/2,cz));
    const K=kit(), TR={rough:.85}, TC=0xd6c4a3;
    K.p(TR,BX(W+.06,.08,D+.06),0x9d8a70,cx,.04,cz); K.p(TR,BX(W+.08,.05,D+.08),TC,cx,H,cz); K.p(TR,BX(W+.04,.03,D+.04),TC,cx,H*.62,cz);
    for(let k=0;k<5;k++) K.p(TR,BX(.06,H,.03),TC,cx-W/2+k*W/4,H/2,cz+D/2+.012);
    g.add(K.build());
    for(let k=0;k<4;k++) g.add(at(archWin(.2,.6),cx-W/2+W/8+k*W/4,.14,cz+D/2+.006));
    for(const s of [-1,1]) g.add(at(archWin(.2,.52),cx+s*W/2+s*.006,.18,cz,s*Math.PI/2));
    const roof=new THREE.Mesh(P(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-D/2-.07,0),new THREE.Vector2(D/2+.07,0),new THREE.Vector2(0,.4)]),{depth:W+.12,bevelEnabled:false}).translate(0,0,-(W+.12)/2),0x8b9093),vmat({rough:.5,metal:.45,pat:{k:'corr',a:0,s:.022,rust:.7}}));
    roof.rotation.y=Math.PI/2; roof.position.set(cx,H+.02,cz); roof.castShadow=roof.receiveShadow=true; g.add(roof);
    const Kv=kit(); Kv.p({rough:.5,metal:.4},BX(W*.7,.08,.12),0x7d8285,cx,H+.46,cz); Kv.p({rough:.5,metal:.4},BX(W*.72,.02,.2),0x6c7174,cx,H+.51,cz);
    for(let k=0;k<12;k++) Kv.p({rough:.5},BX(.012,.06,.13),0x3a3d40,cx-W*.33+k*W*.06,H+.46,cz);
    /* penstocks from the cliff top */
    for(const z of [-1.45,-1.18]){ const a=V3(-.55,1.3,z-.25), b=V3(cx-W/2-.02,.45,z), dv=b.clone().sub(a), n=Math.floor(dv.length()/.11);
      Kv.l({rough:.5,metal:.55},UCYL(.055,.055,14),0x4a4b4c,a,b);
      for(let k=1;k<n;k++){ const p=a.clone().addScaledVector(dv,k/n); const q=new THREE.Quaternion().setFromUnitVectors(V3(0,0,1),dv.clone().normalize());
        Kv.raw({rough:.5,metal:.55},PM(TOR(.058,.008,Math.PI*2,4,16),0x3a3b3c,new THREE.Matrix4().compose(p,q,V3(1,1,1)))); }
      for(let k=1;k<4;k++){ const p=a.clone().addScaledVector(dv,k/4); Kv.p({rough:.9},BX(.12,p.y,.1),0xa89c88,p.x,p.y/2,p.z); } }
    /* transformers and bushings */
    for(const x of [.62,.92]){ Kv.p({rough:.6,metal:.3},BX(.18,.2,.13),0x5c6a5e,x,.1,-.72); for(let f=0;f<6;f++) Kv.p({rough:.6,metal:.3},BX(.012,.16,.17),0x4f5c51,x-.075+f*.03,.1,-.72);
      for(const o of [-.05,0,.05]){ Kv.p({rough:.4},CY(.008,.008,.1,6),0x6b5a48,x+o,.25,-.72); for(let q=0;q<3;q++) Kv.p({rough:.3},CY(.018,.018,.008,8),0xc9773e,x+o,.22+q*.025,-.72); } }
    g.add(Kv.build());
    const sg=sign('POWER HOUSE',.76,.1,{bg:'#e7dcc2',fg:'#2b2620',font:'600 58px Georgia, serif'}); sg.position.set(cx,H-.13,cz+D/2+.022); g.add(sg);
    piece(d,g,{key:true}); }
  /* steel lattice pylon with insulator strings */
  const tower=V3(1.62,0,-.62), arms=[];
  { const K=kit(), stl={rough:.45,metal:.6}, SC=0x7c8288, lv=[0,.38,.74,1.06,1.34,1.58,1.8,2.02], hwAt=y=>.27-(.27-.07)*Math.pow(y/2.02,.85);
    const c=(y,i)=>{ const h=hwAt(y), s=[[-1,-1],[1,-1],[1,1],[-1,1]][i]; return V3(tower.x+s[0]*h,y,tower.z+s[1]*h); };
    for(let i=0;i<4;i++){ K.l(stl,UCYL(.014,.011,5),SC,c(0,i),c(2.02,i)); K.p({rough:.9},BX(.1,.06,.1),0xb0a693,c(0,i).x,.03,c(0,i).z); }
    for(let L=0;L<lv.length;L++) for(let i=0;i<4;i++){ const j=(i+1)%4; K.l(stl,UCYL(.007),SC,c(lv[L],i),c(lv[L],j));
      if(L<lv.length-1){ K.l(stl,UCYL(.0055),SC,c(lv[L],i),c(lv[L+1],j)); K.l(stl,UCYL(.0055),SC,c(lv[L],j),c(lv[L+1],i)); } }
    K.l(stl,UCYL(.01,.006,5),SC,V3(tower.x,2.02,tower.z),V3(tower.x,2.32,tower.z));
    for(const [y,L] of [[1.8,.46],[2.02,.36]]){ for(const s of [-1,1]){ K.l(stl,UCYL(.007),SC,V3(tower.x+s*.07,y,tower.z-.05),V3(tower.x+s*L,y,tower.z)); K.l(stl,UCYL(.007),SC,V3(tower.x+s*.07,y,tower.z+.05),V3(tower.x+s*L,y,tower.z));
        K.l(stl,UCYL(.005),SC,V3(tower.x+s*.07,y+.12,tower.z),V3(tower.x+s*L,y,tower.z));
        for(let q=0;q<4;q++) K.p({rough:.3},CY(.022,.022,.012,10),0xc0703a,tower.x+s*L,y-.03-q*.03,tower.z); arms.push(V3(tower.x+s*L,y-.14,tower.z)); } }
    piece(d,K.build(),{key:true,lift:.4}); }
  /* cast-iron street lamps (the hero is the centre one) and an old kerosene lamp */
  const LAMPS=[], LX=[-.98,.15,1.25];
  LX.forEach((x,i)=>{ const g=new THREE.Group(), K=kit(), fe={rough:.42,metal:.45}, FE=0x1e2a25, s=(i===1?1.12:1)*.78;
    K.p(fe,CY(.072,.085,.07,8),FE,0,.035,0); K.p(fe,CY(.05,.068,.1,8),FE,0,.12,0); K.p(fe,TOR(.05,.01,Math.PI*2,5,16),FE,0,.17,0,Math.PI/2);
    K.p(fe,CY(.033,.044,.26,12),FE,0,.3,0); for(let f=0;f<8;f++){ const a=f/8*6.283; K.p(fe,BX(.008,.22,.008),FE,Math.sin(a)*.04,.3,Math.cos(a)*.04,0,a,0); }
    K.p(fe,TOR(.038,.009,Math.PI*2,5,16),FE,0,.43,0,Math.PI/2); K.p(fe,CY(.02,.027,.45,10),FE,0,.66,0); K.p(fe,SPH(.03,10,8),FE,0,.9,0);
    K.p(fe,BX(.2,.012,.012),FE,0,.8,0); for(const sx of [-1,1]) K.p(fe,SPH(.012,6,4),FE,sx*.1,.8,0);
    K.raw(fe,tubeG([[0,.86,0],[.05,.93,0],[.03,.98,0],[0,.97,0]],.006,14,4),FE); K.raw(fe,tubeG([[0,.86,0],[-.05,.93,0],[-.03,.98,0],[0,.97,0]],.006,14,4),FE);
    K.p(fe,CY(.02,.02,.08,8),FE,0,.97,0); K.p(fe,CY(.045,.065,.025,4),FE,0,1.02,0,0,Math.PI/4,0);
    for(let q=0;q<4;q++){ const a=q/4*6.283+Math.PI/4; K.l(fe,UCYL(.005),FE,V3(Math.sin(a)*.06,1.03,Math.cos(a)*.06),V3(Math.sin(a)*.075,1.17,Math.cos(a)*.075)); }
    K.p(fe,new THREE.ConeGeometry(.095,.09,4),FE,0,1.22,0,0,Math.PI/4,0); K.p(fe,SPH(.016,8,6),FE,0,1.28,0); K.p(fe,new THREE.ConeGeometry(.006,.05,5),FE,0,1.31,0);
    g.add(K.build());
    const bulb=new THREE.MeshStandardMaterial({color:0xfff2d6,emissive:0xffb35c,emissiveIntensity:0,roughness:.3}); patch(bulb);
    const pane=new THREE.MeshStandardMaterial({color:0xf6ead2,emissive:0xffb066,emissiveIntensity:0,roughness:.05,metalness:.3,transparent:true,opacity:.55,depthWrite:false}); patch(pane);
    const bm=new THREE.Mesh(SPH(.032,12,10),bulb); bm.position.y=1.1; g.add(bm);
    const pn=new THREE.Mesh(new THREE.CylinderGeometry(.075,.062,.14,4,1,true),pane); pn.rotation.y=Math.PI/4; pn.position.y=1.1; g.add(pn);
    const pool=glowPool(.62); pool.position.y=.04; pool.position.z=.3; g.add(pool);
    g.scale.setScalar(s); LAMPS.push({bulb,pane,pool,i}); piece(d,at(g,x,0,.34),{key:true,hero:i===1,lift:i===1?.5:0}); });
  let flame;
  { const g=new THREE.Group(), K=kit(), wd={rough:.85,pat:{k:'wood',a:1,f:70}}, x=-1.72, z=.32;
    K.p(wd,BX(.045,.85,.045),0x5a4330,x,.425,z); K.p(wd,BX(.16,.03,.03),0x5a4330,x+.04,.78,z);
    K.p({rough:.5,metal:.5},BX(.09,.11,.09),0x3a3530,x,.92,z); K.p({rough:.5,metal:.5},new THREE.ConeGeometry(.075,.06,4),0x3a3530,x,1.0,z,0,Math.PI/4,0);
    /* the lamplighter's ladder */
    const a=V3(x+.28,0,z+.18), b=V3(x+.05,.82,z+.03);
    for(const o of [-.06,.06]) K.l(wd,UCYL(.011),0x7a5b3c,V3(a.x,a.y,a.z+o),V3(b.x,b.y,b.z+o));
    for(let r=1;r<8;r++){ const t=r/8, p=a.clone().lerp(b,t); K.p(wd,BX(.012,.012,.13),0x7a5b3c,p.x,p.y,p.z); }
    g.add(K.build());
    const fm=new THREE.MeshStandardMaterial({color:0xffc070,emissive:0xff8a2a,emissiveIntensity:2.2,transparent:true,opacity:.9}); patch(fm); flame=new THREE.Mesh(SPH(.022,8,6),fm); flame.scale.y=1.6; flame.position.set(x,.92,z); g.add(flame);
    g.add(at(figure({pose:'point',dress:'dhoti',head:'turban',top:0xe8dfcc,accent:0x9c3b2a,skin:SKINS[3],tool:'can',seed:21}),x+.24,.2,z+.14,-1.9));
    piece(d,g,{key:true}); }
  /* wires: powerhouse to pylon, pylon to each lamp */
  { const K=kit(), w={rough:.6,metal:.3}, WC=0x23211e;
    for(const [k,o] of [[0,-.12],[1,0],[2,.12]]) K.raw(w,sagG(V3(1.255,.82+k*.05,-1.3+o),arms[k%arms.length],.16,.005),WC);
    LX.forEach((x,i)=>{ const top=V3(x,1.26*(i===1?1.12:1)*.78,.34); K.raw(w,sagG(arms[[0,2,1][i]],top,.22,.005),WC); });
    piece(d,K.build(false),{amp:.3}); }
  /* townsfolk on the footpath, a gulmohur and a neem */
  piece(d,grp(at(figure({pose:'walk',dress:'sari',head:'bun',accent:0x2d6a7a,skin:SKINS[2],seed:22}),-.4,.035,.26,Math.PI/2),at(figure({pose:'walk',dress:'dhoti',head:'topi',top:0x3a3a40,skin:SKINS[0],seed:23}),.75,.035,.24,-Math.PI/2)),{amp:.4});
  piece(d,at(htree(311,{h:1.3,w:.7,kind:'gul'}),1.72,0,-1.7),{key:true});
  piece(d,at(htree(312,{h:1.55,w:.85,kind:'neem'}),-.1,0,-2.15),{key:true});
  { const g=new THREE.Group(); for(let k=0;k<6;k++) g.add(at(shrub(320+k,{r:.14+R()*.08}),[-1.95,1.95,-.05,1.15,-1.9,1.95][k],0,[-.4,.05,-.6,-.35,1.62,1.62][k])); piece(d,g,{amp:.25}); }
  d.update=(t,dt,k)=>{ LAMPS.forEach(L=>{ const th=.3+L.i*.2, on=sstep(th,th+.08,k); const fl=on>0&&on<1?(Math.sin(t*90+L.i*7)>0?1:.35):1, v=on*fl;
      L.bulb.emissiveIntensity=3.4*v; L.pane.emissiveIntensity=.9*v; L.pool.material.opacity=.85*v; });
    if(flame){ flame.scale.set(1+Math.sin(t*13)*.08,1.6+Math.sin(t*17.3)*.2,1); flame.material.emissiveIntensity=2+Math.sin(t*23)*.4; }
    const P=mist.geometry.attributes.position, A=mist.geometry.attributes.aLife;
    mistD.forEach((m,i)=>{ const l=(m.ph+t*m.sp)%1; P.setXYZ(i,m.x+m.dx*(1+l),.06+l*.55,m.z+m.dz+l*.15); A.setX(i,l); }); P.needsUpdate=A.needsUpdate=true; };
  finalize(d,7.0); }


/* 3 · 1909 science: the Indian Institute of Science main building, its tower, lawns and a DNA sculpture */
{ const d=makeDio(3); const R=rng(3);
  const stone=mat(0xb8b0a2,{brick:[.24,.1],rough:.9}), stoneL=mat(0xd2cbbd,{rough:.85}), roofM=mat(0x8a4a33,{rough:.7}), steel=mat(0xb9bec4,{metal:.7,rough:.3}), dial=mat(0xf4efe4,{rough:.5}), dk=mat(0x2b2620);
  piece(d,grp(at(box(1.0,.02,2.6,mat(0xd6c8a8,{rough:.95})),0,.01,1.3),at(box(4.6,.02,.5,mat(0xd6c8a8,{rough:.95})),0,.01,.15)),{amp:.12});
  const wing=sx=>{ const g=new THREE.Group(); const cx=sx*1.55;
    g.add(at(box(2.1,1.05,.95,stone),cx,.525,-.45)); g.add(at(box(2.16,.07,1.01,stoneL),cx,1.06,-.45)); g.add(at(box(2.16,.05,1.01,stoneL),cx,.52,-.45));
    for(let k=0;k<5;k++){ const x=cx-.8+k*.4; g.add(at(archWin(.2,.4),x,.06,.03)); g.add(at(archWin(.16,.3),x,.62,.03)); }
    g.add(at(prism(.95,.34,2.1,roofM),cx,1.09,-.45,Math.PI/2));
    for(let k=0;k<4;k++) g.add(at(box(.07,.16,.07,stoneL),cx-.95+k*.63,1.14,.04));
    return g; };
  piece(d,wing(-1),{}); piece(d,wing(1),{});
  const core=new THREE.Group(); core.add(at(box(1.15,1.45,1.1,stone),0,.725,-.4)); core.add(at(box(1.21,.08,1.16,stoneL),0,1.46,-.4));
  for(let k=0;k<4;k++) core.add(at(cyl(.045,.055,.78,stoneL,10),-.42+k*.28,.39,.3));
  core.add(at(box(1.15,.1,.36,stoneL),0,.83,.3)); core.add(at(prism(1.15,.3,.36,stoneL),0,.88,.3)); core.add(at(archWin(.24,.52,true),0,.02,.16));
  for(const x of [-.35,.35]) core.add(at(archWin(.16,.34),x,.98,.16));
  piece(d,core,{});
  const tw=new THREE.Group(); tw.add(at(box(.66,1.35,.66,stone),0,1.5+.675,-.4)); tw.add(at(box(.72,.07,.72,stoneL),0,2.86,-.4));
  for(const [x,z,ry] of [[0,-.06,0],[.335,-.4,Math.PI/2],[-.335,-.4,-Math.PI/2]]){ const c=at(cyl(.17,.17,.025,dial,24),x,2.45,z,ry,Math.PI/2); tw.add(c); }
  tw.add(at(box(.012,.11,.01,dk),0,2.48,-.045)); tw.add(at(box(.08,.012,.01,dk),.03,2.45,-.045));
  for(let k=0;k<2;k++) tw.add(at(archWin(.14,.32),-.15+k*.3,1.7,-.06));
  tw.add(at(box(.56,.48,.56,stoneL),0,3.12,-.4)); for(const x of [-.14,.14]) tw.add(at(archWin(.1,.26),x,2.98,-.11));
  for(const [x,z] of [[-.3,-.1],[.3,-.1],[-.3,-.7],[.3,-.7]]){ tw.add(at(cyl(.07,.07,.5,stone,8),x,3.15,z)); tw.add(at(cone(.1,.32,roofM,8),x,3.56,z)); }
  tw.add(at(cone(.42,1.0,roofM,4),0,3.86,-.4,Math.PI/4)); tw.add(at(sph(.06,mat(C.gold,{metal:.6,rough:.3})),0,4.4,-.4));
  piece(d,tw,{hero:true,lift:.6});
  const dna=new THREE.Group(); dna.add(at(cyl(.22,.26,.1,mat(0x3a3e46),20),0,.05,0)); dna.add(at(cyl(.016,.016,1.45,steel,8),0,.8,0));
  const NH=46, inst=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),mat(0xffffff,{rough:.35}),NH*2); const o=new THREE.Object3D(), cc=new THREE.Color();
  for(let k=0;k<NH;k++){ const t=k/(NH-1), y=.15+t*1.35, a=t*Math.PI*3.6;
    o.position.set(Math.cos(a)*.2,y,Math.sin(a)*.2); o.scale.setScalar(.045); o.updateMatrix(); inst.setMatrixAt(k,o.matrix); inst.setColorAt(k,cc.setHSL(.02+t*.12,.75,.55));
    o.position.set(Math.cos(a+Math.PI)*.2,y,Math.sin(a+Math.PI)*.2); o.updateMatrix(); inst.setMatrixAt(NH+k,o.matrix); inst.setColorAt(NH+k,cc.setHSL(.55+t*.15,.65,.5)); }
  inst.castShadow=true; inst.computeBoundingSphere(); const helix=new THREE.Group(); helix.add(inst);
  for(let k=0;k<10;k++){ const t=(k+.5)/10, y=.15+t*1.35, a=t*Math.PI*3.6; helix.add(link(new THREE.Vector3(Math.cos(a)*.2,y,Math.sin(a)*.2),new THREE.Vector3(Math.cos(a+Math.PI)*.2,y,Math.sin(a+Math.PI)*.2),mat([0xf2d34a,0x7fd1a8,0xe8608a,0x6b8ff5][k%4]),.014)); }
  dna.add(helix); piece(d,at(dna,-1.25,0,1.15),{lift:.5});
  piece(d,grp(at(htree(391,{h:1.45,w:.72,kind:'rain'}),-2.4,0,.6),at(htree(392,{h:1.5,w:.72,kind:'jac'}),2.4,0,.5)),{}); piece(d,grp(at(htree(393,{h:1.7,w:.8,kind:'rain'}),-2.2,0,-1.6),at(htree(394,{h:1.6,w:.8,kind:'mango'}),2.25,0,-1.5)),{});
  const hedge=new THREE.Group(); for(let k=0;k<6;k++){ hedge.add(bush(-1.9+k*.28,.55,0,.55,R)); hedge.add(bush(.55+k*.28,.55,0,.55,R)); } piece(d,hedge,{amp:.3});
  const bench=grp(at(box(.4,.03,.12,mat(0x6b4a33)),0,.14,0),at(box(.4,.1,.02,mat(0x6b4a33)),0,.2,-.06),at(box(.03,.14,.1,dk),-.17,.07,0),at(box(.03,.14,.1,dk),.17,.07,0));
  piece(d,at(bench,1.3,0,1.2,-.3),{});
  /* the first students: 21 of them in 1911 */
  piece(d,grp(at(figure({pose:'sit',dress:'pants',head:'topi',top:0xf2eee4,bottom:0x3a3a40,skin:SKINS[0],seed:31}),1.3,.02,1.14,-.3),
    at(figure({pose:'walk',dress:'dhoti',head:'turban',top:0xefe9dc,accent:0x9c3b2a,skin:SKINS[2],tool:'bag',seed:32}),-.15,.02,1.55,Math.PI),
    at(figure({pose:'walk',dress:'pants',head:'topi',top:0x3a3a42,bottom:0x3a3a42,skin:SKINS[1],seed:33}),.2,.02,1.75,Math.PI),
    at(figure({pose:'point',dress:'dhoti',head:'turban',top:0xf4f0e6,accent:0xe0b23a,skin:SKINS[3],seed:34}),-1.6,.02,1.05,.6)),{amp:.4});
  d.update=(t,dt,k)=>{ helix.rotation.y=t*.5; };
  finalize(d,7.0); }

/* ---- vehicles and machines for the later scenes ---- */
function wheelK(K,x,y,z,r,{spokes=16,tyre=0x161616,rim=0xc9ccd0,w=.03,hub=.018}={}){ const ch={rough:.25,metal:.85}, rb={rough:.85};
  K.p(rb,TOR(r,w*.5,Math.PI*2,8,28),tyre,x,y,z); K.p(ch,TOR(r*.84,.005,Math.PI*2,4,24),rim,x,y,z); K.p(ch,CY(hub,hub,w*1.3,10),rim,x,y,z,Math.PI/2);
  for(let k=0;k<spokes;k++){ const a=k/spokes*6.283; K.l(ch,UCYL(.0022,.0022,3),rim,V3(x,y,z+(k%2?.008:-.008)),V3(x+Math.cos(a)*r*.84,y+Math.sin(a)*r*.84,z)); } }
/* a 1940 two-seat trainer, nose to +x, wheels on y=0 */
function trainer({body=0xc4c8cc,wing=0xe8b42e,trim=0x8c2a22,dim=1}={}){ const g=new THREE.Group(), K=kit(), al={rough:.3,metal:.7}, pt={rough:.5,metal:.15}, dk={rough:.6};
  const prof=[[0,0],[.05,0],[.068,.02],[.08,.06],[.087,.14],[.088,.3],[.082,.45],[.07,.6],[.052,.78],[.034,.92],[.019,1.02],[0,1.06]].map(([r,y])=>new THREE.Vector2(r,y));
  K.p(al,new THREE.LatheGeometry(prof,22).rotateZ(Math.PI/2),body,0,.27,0);
  K.p(dk,TOR(.068,.017,Math.PI*2,8,24),0x2b2b2d,-.01,.27,0,0,Math.PI/2,0); K.p(dk,CY(.058,.058,.012,18),0x1e1e20,.004,.27,0,0,0,Math.PI/2);
  for(let k=0;k<7;k++){ const a=k/7*6.283; K.p({rough:.5,metal:.5},CY(.011,.013,.035,8),0x55575a,.004,.27+Math.sin(a)*.04,Math.cos(a)*.04,a,0,Math.PI/2); }
  K.p(al,new THREE.ConeGeometry(.026,.07,14).rotateZ(-Math.PI/2),0xd8dadd,.045,.27,0);
  K.p(dk,BX(.32,.012,.05),0x232325,-.18,.355,0);
  /* wings, tail, fin: planforms extruded with rounded edges */
  const wingS=new THREE.Shape(); wingS.moveTo(0,0); wingS.lineTo(-.06,.74); wingS.quadraticCurveTo(-.1,.8,-.17,.79); wingS.quadraticCurveTo(-.23,.77,-.23,.72); wingS.lineTo(-.31,0); wingS.lineTo(-.23,-.72); wingS.quadraticCurveTo(-.23,-.77,-.17,-.79); wingS.quadraticCurveTo(-.1,-.8,-.06,-.74); wingS.lineTo(0,0);
  const ext=(s,dp)=>new THREE.ExtrudeGeometry(s,{depth:dp,bevelEnabled:true,bevelThickness:.007,bevelSize:.007,bevelSegments:2,curveSegments:8});
  K.p(pt,ext(wingS,.014).rotateX(-Math.PI/2),wing,-.2,.2,0);
  const tp=new THREE.Shape(); tp.moveTo(0,0); tp.lineTo(-.03,.23); tp.quadraticCurveTo(-.06,.26,-.1,.24); tp.lineTo(-.14,0); tp.lineTo(-.1,-.24); tp.quadraticCurveTo(-.06,-.26,-.03,-.23); tp.lineTo(0,0);
  K.p(pt,ext(tp,.008).rotateX(-Math.PI/2),wing,-.86,.28,0);
  const fin=new THREE.Shape(); fin.moveTo(0,0); fin.lineTo(-.17,0); fin.quadraticCurveTo(-.19,.13,-.13,.19); fin.quadraticCurveTo(-.07,.17,0,0);
  K.p(pt,ext(fin,.006).translate(0,0,-.003),wing,-.88,.3,0); K.p(pt,BX(.05,.13,.016),trim,-1.03,.39,0,0,0,-.12);
  /* canopy with frame hoops, mast */
  K.p({rough:.6},BX(.36,.02,.1),0x2a2a2c,-.38,.345,0);
  for(const x of [-.22,-.36,-.5]) K.p(al,TOR(.064,.006,Math.PI,4,14),0x9aa0a6,x,.335,0,0,Math.PI/2,0);
  K.l(al,UCYL(.004),0x9aa0a6,V3(-.62,.35,0),V3(-.66,.47,0));
  /* fixed gear with spats, tail wheel */
  for(const s of [-1,1]){ K.l(pt,UCYL(.009),wing,V3(-.08,.21,s*.24),V3(-.09,.075,s*.26)); K.p(pt,SPH(.045,14,10),wing,-.1,.065,s*.26,0,0,0,1.9,1,.6); K.p({rough:.8},CY(.04,.04,.02,14),0x151515,-.09,.04,s*.26,Math.PI/2); }
  K.p({rough:.8},CY(.018,.018,.012,10),0x151515,-.98,.018,0,Math.PI/2); K.l(pt,UCYL(.006),0x55575a,V3(-.96,.2,0),V3(-.98,.03,0));
  g.add(K.build());
  const glass=new THREE.Mesh(P(SPH(.066,18,10,0,Math.PI*2,0,Math.PI/2),0xbfd8e4),vmat({rough:.04,metal:.5,op:.45,side:true})); glass.scale.set(3.1,.95,.95); glass.position.set(-.36,.34,0); g.add(glass);
  const Kp=kit(); Kp.p({rough:.4},BX(.012,.4,.034),0x2a2420,0,0,0,.25); Kp.p({rough:.4},BX(.012,.04,.04),0x2a2420,0,0,0); Kp.p({rough:.3,metal:.6},BX(.0125,.05,.036),0xd6b44a,0,.18,0,.25); Kp.p({rough:.3,metal:.6},BX(.0125,.05,.036),0xd6b44a,0,-.18,0,.25);
  const prop=Kp.build(); prop.position.set(.075,.27,0); g.add(prop); g.userData.prop=prop; return g; }

/* 4 · 1940 Hindustan Aircraft: a corrugated barrel-vault hangar, a trainer on the apron, a control tower, and the termite scrub it was cut from */
{ const d=makeDio(4); const R=rng(40);
  /* apron slabs, grass airstrip with markers */
  { const g=new THREE.Group(); const ap=new THREE.Mesh(P(BX(3.1,.025,1.45),0xbab3a6),vmat({rough:.92,brick:[.42,.42],pat:{k:'stain',d:.35}})); ap.position.set(-.35,.0125,-.3); ap.receiveShadow=true; g.add(ap);
    const K=kit(); K.p({rough:.98},BX(4.0,.018,.62),0x9c8a66,0,.009,1.15);
    for(let x=-1.84;x<=1.85;x+=.46) for(const z of [.88,1.42]) K.p({rough:.7},BX(.09,.03,.04),0xf0ece2,x,.02,z);
    for(let k=0;k<5;k++) K.p({rough:.7},BX(.28,.02,.05),0xf0ece2,-1.75,.02,.98+k*.1);
    g.add(K.build()); piece(d,g,{amp:.15}); }
  /* hangar: brick gables, corrugated vault, sliding doors open on a second aircraft being built */
  { const g=new THREE.Group(), cx=-1.0, cz=-1.5, hw=1.12, L=1.45, wall=.25, ry=.75, zf=cz+L/2;
    const vault=vm(halfCyl(hw,L,'z',34),0x8f9599,{rough:.5,metal:.5,pat:{k:'corr',a:2,s:.02,rust:.65}}); vault.scale.y=ry; vault.position.set(cx,wall,cz); g.add(vault);
    const gab=(door)=>{ const s=new THREE.Shape(); s.moveTo(-hw,0); if(door){ s.lineTo(-.78,0); s.lineTo(-.78,.84); s.lineTo(.78,.84); s.lineTo(.78,0); } s.lineTo(hw,0); s.lineTo(hw,wall); s.absellipse(0,wall,hw,hw*ry,0,Math.PI,false); s.lineTo(-hw,0);
      return new THREE.ExtrudeGeometry(s,{depth:.045,bevelEnabled:false,curveSegments:24}); };
    const gf=vm(gab(true),0xa65a3e,{rough:.92,brick:[.09,.045]}); gf.position.set(cx,0,zf-.02); g.add(gf);
    const gb=vm(gab(false),0xa65a3e,{rough:.92,brick:[.09,.045]}); gb.position.set(cx,0,cz-L/2-.02); g.add(gb);
    const K=kit(); for(const s of [-1,1]) K.p({rough:.92},BX(.06,wall,L),0x9a523a,cx+s*hw,wall/2,cz);
    K.p({rough:.9},BX(2.2,.006,L-.06),0x3a3632,cx,.004,cz); K.p({rough:.9,em:0x1a1410,ei:1},BX(2.1,.84,.01),0x2a2420,cx,.42,cz-L/2+.08);
    K.p({rough:.5,metal:.5},BX(2.5,.03,.035),0x3f4245,cx,.87,zf+.05);
    K.p({rough:.6},BX(1.16,.13,.012),0x2b2620,cx,.97,zf+.03);
    g.add(K.build());
    for(const s of [-1,1]){ const dr=vm(BX(.44,.84,.025),0x7e8589,{rough:.5,metal:.5,pat:{k:'corr',a:0,s:.02,rust:.55}}); dr.position.set(cx+s*1.0,.42,zf+.06); g.add(dr); }
    const sg=sign('HINDUSTAN AIRCRAFT LTD',1.1,.11,{bg:'#e9dfc6',fg:'#20201e',font:'600 50px Georgia, serif',w:768,h:76}); sg.position.set(cx,.97,zf+.038); g.add(sg);
    const lampM=new THREE.MeshStandardMaterial({color:0xfff3d4,emissive:0xffd08a,emissiveIntensity:2.4}); patch(lampM);
    for(const x of [-.35,.35]){ const lm=new THREE.Mesh(CY(.03,.05,.03,12),lampM); lm.position.set(cx+x,.92,cz+.1); g.add(lm); }
    const inside=trainer({body:0xb8bcc0,wing:0xc9c3b0}); inside.scale.setScalar(1.0); inside.position.set(cx-.05,0,cz+.05); inside.rotation.y=.35; g.add(inside);
    const Kt=kit(); for(const x of [-.25,.25]) for(const z of [-.18,.18]) Kt.p({rough:.8,pat:{k:'wood',a:1}},BX(.03,.14,.03),0x6b4a2d,cx+x,.07,cz+.05+z); g.add(Kt.build());
    piece(d,g,{key:true}); }
  /* the trainer on the apron, prop turning */
  const plane=trainer(); plane.scale.setScalar(1.3); plane.position.set(.45,.025,.3); plane.rotation.y=-.62; piece(d,plane,{hero:true,lift:.6});
  /* control tower with glazed cab, balcony, stair, windsock */
  let sock;
  { const g=new THREE.Group(), K=kit(), cx=1.38, cz=-1.45, WH=0xe9e3d5, rd={rough:.88,pat:{k:'stain',d:.4}};
    K.p(rd,BX(.62,.56,.52),WH,cx,.28,cz); K.p(rd,BX(.7,.04,.6),0xd8d1c1,cx,.58,cz); K.p(rd,BX(.64,.03,.54),0xd8d1c1,cx,.29,cz);
    for(const y of [.14,.43]) for(const x of [-.18,0,.18]) K.p({rough:.3,metal:.3},BX(.11,.12,.01),0x2d3640,cx+x,y,cz+.262);
    K.p({rough:.4},BX(.13,.24,.012),0x3d4a3f,cx-.24,.12,cz+.262);
    K.p({rough:.5,metal:.3},BX(.46,.025,.42),0x55595c,cx,.6,cz);
    for(const [x,z,ry] of [[0,.2,0],[0,-.2,0],[.22,0,Math.PI/2],[-.22,0,Math.PI/2]]) for(let u=-.2;u<=.2001;u+=.1) K.p({rough:.4,metal:.4},BX(.012,.22,.014),0x3a3d40,cx+x+(ry?0:u),.72,cz+z+(ry?u:0));
    K.p({rough:.8},BX(.52,.035,.48),0xd8d1c1,cx,.845,cz); K.p({rough:.8},BX(.44,.06,.4),WH,cx,.64,cz);
    for(let a=0;a<24;a++){ const t=a/24*6.283, px=Math.max(-1,Math.min(1,Math.cos(t)*1.5))*.34, pz=Math.max(-1,Math.min(1,Math.sin(t)*1.5))*.29; K.p({rough:.6},BX(.008,.07,.008),0x3a3d40,cx+px,.635,cz+pz); }
    for(const z of [-.29,.29]) K.p({rough:.6},BX(.69,.008,.008),0x3a3d40,cx,.67,cz+z); for(const x of [-.34,.34]) K.p({rough:.6},BX(.008,.008,.59),0x3a3d40,cx+x,.67,cz);
    for(let k=0;k<9;k++) K.p(rd,BX(.13,.025,.07),0xd2cab8,cx+.38,.035+k*.06,cz+.25-k*.06);
    K.l({rough:.5,metal:.4},UCYL(.006),0x55595c,V3(cx+.2,.86,cz-.15),V3(cx+.2,1.15,cz-.15));
    g.add(K.build());
    const Kg=kit(); for(const [x,z,ry] of [[0,.2,0],[0,-.2,0],[.22,0,Math.PI/2],[-.22,0,Math.PI/2]]) Kg.p({rough:.04,metal:.6,op:.35,side:true},BX(ry?.4:.44,.22,.006),0xbcd6e2,cx+x,.72,cz+z,0,ry,0); g.add(Kg.build(false));
    sock=new THREE.Group(); const Ks=kit(); for(let k=0;k<4;k++) Ks.p({rough:.8,side:true},new THREE.CylinderGeometry(.03-k*.004,.034-k*.004,.05,10,1,true).rotateZ(Math.PI/2),k%2?0xf3efe6:0xe5602a,-.025-k*.05,0,0);
    sock.add(Ks.build()); sock.position.set(cx+.2,1.13,cz-.15); g.add(sock);
    g.scale.setScalar(1.6); g.position.set(cx*(1-1.6),0,cz*(1-1.6)+.15); piece(d,g,{key:true}); }
  /* fuel drums */
  { const K=kit(); [[.05,-.6,0],[.2,-.65,0],[.08,-.75,0]].forEach(([x,z],i)=>{ K.p({rough:.5,metal:.4},CY(.05,.05,.15,14),[0x3a5a7a,0x8a2f24,0x3a5a7a][i],x,.075,z); for(const y of [.03,.12]) K.p({rough:.5,metal:.4},TOR(.051,.004,Math.PI*2,4,16),0x2a2a2a,x,y,z,Math.PI/2); });
    K.p({rough:.5,metal:.4},CY(.05,.05,.15,14),0x6b6a3a,.35,.05,-.55,0,.4,Math.PI/2); piece(d,K.build(),{key:true}); }
  /* scrub: termite mounds, a cobra, lantana, the men clearing it */
  const mound=(K,x,z,h,seed)=>{ const Q=rng(seed), c=[0xa8613a,0x9b5734,0xb36c42], rr={rough:.95,pat:{k:'stain',d:.5}};
    K.p(rr,blob(1,.45,seed),c[0],x,.05,z,0,0,0,h*.42,h*.2,h*.38); K.p(rr,blob(1,.4,seed+1),c[1],x+(Q()-.5)*.04,h*.32,z,0,0,0,h*.24,h*.38,h*.22);
    for(let k=0;k<3+(Q()*3|0);k++){ const a=Q()*6.28, r=Q()*h*.12; K.p(rr,blob(1,.35,seed+k+3),c[k%3],x+Math.sin(a)*r,h*(.55+Q()*.35),z+Math.cos(a)*r,0,0,0,h*.07,h*(.16+Q()*.1),h*.07); } };
  { const K=kit(); mound(K,1.6,-.25,.6,71); mound(K,1.95,.3,.46,72); mound(K,1.2,.5,.42,73); mound(K,1.95,-.72,.4,74); piece(d,K.build(),{key:true}); }
  { const K=kit(), sn={rough:.32,metal:.1}, SN=0x2a2718, pts=[]; for(let k=0;k<=30;k++){ const t=k/30, a=t*Math.PI*3.4, r=.085-t*.04; pts.push([Math.cos(a)*r,.018,Math.sin(a)*r]); }
    pts.push([.02,.06,.0],[.0,.14,.01],[-.005,.21,.02]); K.raw(sn,tubeG(pts,.017,90,7),SN);
    K.p(sn,SPH(.045,14,10),SN,-.004,.235,.025,0,0,0,1.35,1.55,.32); K.p(sn,SPH(.022,10,8),SN,-.004,.29,.04,.35,0,0,1,.75,1.35);
    K.p({rough:.5},TOR(.012,.0035,Math.PI*2,4,10),0xd9cfa4,-.004,.25,.013,0,0,0); K.p({rough:.4},SPH(.004,6,4),0x0d0d0d,.01,.296,.058); K.p({rough:.4},SPH(.004,6,4),0x0d0d0d,-.018,.296,.058);
    const g=K.build(); g.position.set(1.32,0,.08); g.rotation.y=-.5; piece(d,g,{key:true}); }
  { const g=new THREE.Group(); [[1.0,.72],[1.95,.72],[1.55,.75],[2.05,-.25],[1.05,-.2]].forEach(([x,z],k)=>g.add(at(shrub(410+k,{r:.12+R()*.06,cols:[0x3d5a24,0x4a6a2a,0x56762e],flowers:[0xf08a2a,0xe0508a,0xf3d23a],fl:.25}),x,0,z)));
    for(let k=0;k<7;k++){ const b=boulder(420+k,.06+R()*.06,.04+R()*.03,.05+R()*.05,0x9a8a78); b.position.set(.95+R()*1.05,.0,-.6+R()*1.1); g.add(b); } piece(d,g,{amp:.3}); }
  piece(d,grp(at(figure({pose:'bend',dress:'dhoti',head:'turban',top:0xe6dcc6,accent:0xd8c9a8,skin:SKINS[3],tool:'pick',seed:41}),1.72,0,-.05,-2.2),at(figure({pose:'bend',dress:'lungi',head:'hair',top:0xcfc4ac,accent:0x3d5a7a,skin:SKINS[1],tool:'pick',seed:42}),1.15,0,.22,2.0)),{amp:.4});
  piece(d,at(figure({pose:'point',dress:'pants',head:'topi',top:0x5a6e86,bottom:0x4b5d74,skin:SKINS[0],seed:43}),.95,.025,.58,-2.3),{amp:.4});
  piece(d,at(new THREE.Mesh(TREE_GEOS.euc[0],leafMat),1.95,0,-1.9,0,0,0,.62),{key:true}); piece(d,at(htree(431,{h:1.35,w:.72,kind:'neem'}),-1.85,0,.45),{key:true});
  d.update=(t,dt,k)=>{ plane.userData.prop.rotation.x+=dt*26; if(sock) sock.rotation.set(0,.4+Math.sin(t*.7)*.25,Math.sin(t*2.1)*.06-.05); };
  finalize(d,7.0); }

/* a Hallikar bullock (Karnataka breed): grey-white, humped, long swept-back painted horns. Faces +x. */
function bullock(seed,horn=0xc0392b){ const K=kit(), Q=rng(seed), hd={rough:.85}, W=0xdcd8d0, G=0xb9b4aa, DK=0x3a332c;
  K.p(hd,new THREE.CapsuleGeometry(.074,.24,6,14).rotateZ(Math.PI/2),W,0,.27,0,0,0,0,1,1.12,.86);
  K.p(hd,SPH(.085,14,10),W,-.12,.285,0,0,0,0,1,1,.9); K.p(hd,SPH(.086,14,10),W,.12,.27,0,0,0,0,1,1.12,.9);
  K.p(hd,SPH(.058,12,8),G,.1,.36,0,0,0,.2,1.15,.82,.78); K.p(hd,SPH(.052,12,8),G,.22,.31,0,0,0,-.45,1.55,1,.92);
  K.p(hd,SPH(.042,10,8),W,.2,.235,0,0,0,.1,1.3,1.4,.24);
  K.p(hd,new THREE.CapsuleGeometry(.036,.09,6,10).rotateZ(-1.05),W,.31,.285,0); K.p(hd,SPH(.031,10,8),0x6b625a,.358,.235,0,0,0,0,1,.9,1.1);
  for(const s of [-1,1]){ K.p(hd,new THREE.ConeGeometry(.018,.06,6).rotateX(s*Math.PI/2),W,.285,.31,s*.045,0,0,.4);
    K.p({rough:.3},SPH(.006,6,4),0x0a0a0a,.32,.3,s*.03);
    K.raw({rough:.45},tubeG([[.29,.325,s*.022],[.275,.39,s*.05],[.24,.46,s*.058],[.235,.53,s*.045],[.25,.57,s*.03]],.0085,14,6),horn); K.p({rough:.3,metal:.6},SPH(.009,6,4),0xd9b44a,.25,.575,s*.03); }
  const legs=[];
  for(const [x,s] of [[.13,-1],[.13,1],[-.13,-1],[-.13,1]]){ const sw=(Q()-.5)*.08, KU=kit(), KL=kit();
    KU.l(hd,UCYL(.024,.017,8),x>0?W:G,V3(0,0,0),V3(sw,-.11,0)); KL.l(hd,UCYL(.015,.012,8),W,V3(0,0,0),V3(-.6*sw,-.10,0)); KL.p({rough:.5},CY(.014,.016,.03,8),DK,-.6*sw,-.115,0);
    const up=KU.build(), lo=KL.build(); lo.position.set(sw,-.11,0); up.add(lo); up.position.set(x,.24,s*.045); up.userData={x,s,sw,lo}; legs.push(up); }
  K.raw(hd,tubeG([[-.2,.31,0],[-.22,.24,0],[-.215,.17,.005],[-.2,.12,.01]],.0055,10,5),G); K.p(hd,SPH(.014,8,6),DK,-.2,.11,.01,0,0,0,.8,1.6,.8);
  K.p({rough:.3,metal:.7},SPH(.014,8,6),0xc9a34a,.21,.205,0); K.raw({rough:.8},tubeG([[.24,.29,-.05],[.2,.21,0],[.24,.29,.05]],.003,8,4),0x8a2f24);
  const root=new THREE.Group(), body=K.build(); root.add(body); legs.forEach(l=>root.add(l)); root.userData={body,legs}; return root; }
/* a walking gait: diagonal pairs of legs swing together, the knee folds as the leg comes forward, the body rises a little on each step */
const BULL_STRIDE=.62;
function bullockWalk(b,dist,amp=.5){ const ph=dist/BULL_STRIDE*6.2832;
  for(const l of b.userData.legs){ const a=ph+(((l.userData.x>0)===(l.userData.s>0))?0:Math.PI); l.rotation.z=amp*Math.sin(a); l.userData.lo.rotation.z=-1.15*amp*Math.max(0,Math.cos(a)); }
  b.userData.body.position.y=.006*Math.abs(Math.sin(ph)); }
/* the same gait for the instanced road traffic: tag the parts, the vertex shader does the walking (sc = how much the finished geometry is shrunk) */
function bullockTag(b,sc){ const w=new THREE.Vector3(), f=6.2832/(BULL_STRIDE*sc); b.updateMatrixWorld(true);
  animTag(b.userData.body,9,0,0,.006*sc,0,f,0,0,1);
  for(const l of b.userData.legs){ l.getWorldPosition(w); const {x,s,sw,lo}=l.userData, ph=((x>0)===(s>0))?0:Math.PI; l.remove(lo);
    animTag(l,2,w.x,w.y,.5,ph,f,0,0,sc); animTag(lo,8,w.x,w.y,.5,ph,f,-.11*sc,sw,sc); l.add(lo); } }
/* the TI satellite dish: a parabolic reflector with back ribs, rim, quadripod and feed horn. Opens to +y. */
function dishG(){ const K=kit(), wh={rough:.45,side:true}, mt={rough:.4,metal:.6}, R0=.34;
  const prof=[]; for(let k=0;k<=12;k++){ const r=k/12*R0; prof.push(new THREE.Vector2(r,r*r*1.05)); }
  K.p(wh,new THREE.LatheGeometry(prof,36),0xf2f0ea,0,0,0); K.p(mt,TOR(R0,.009,Math.PI*2,6,40),0xd9d6cf,0,R0*R0*1.05,0,Math.PI/2);
  for(let k=0;k<8;k++){ const a=k/8*6.283; K.l(mt,UCYL(.007),0xbab6ae,V3(0,-.02,0),V3(Math.cos(a)*R0*.98,R0*R0*1.05-.012,Math.sin(a)*R0*.98)); }
  const fy=.29; for(let k=0;k<4;k++){ const a=k/4*6.283+.785; K.l(mt,UCYL(.005),0xbab6ae,V3(Math.cos(a)*R0,R0*R0*1.05,Math.sin(a)*R0),V3(0,fy,0)); }
  K.p(mt,BX(.05,.05,.05),0xd9d6cf,0,fy+.02,0); K.p(mt,new THREE.ConeGeometry(.03,.06,12,1,true),0xd9d6cf,0,fy-.03,0,Math.PI);
  K.p(mt,CY(.04,.06,.08,12),0x8a8f94,0,-.05,0); K.p(mt,BX(.14,.04,.06),0x8a8f94,0,-.1,0);
  return K.build(); }
/* an Ambassador (1980s), nose to +x */
function ambassador(col=0xefeadb){ const K=kit(), pn={rough:.28,metal:.35}, ch={rough:.2,metal:.9}, gl={rough:.05,metal:.6};
  K.p(pn,RB(.44,.1,.19,.045),col,0,.105,0); K.p(pn,RB(.15,.04,.17,.02),col,.15,.16,0); K.p(pn,RB(.27,.1,.172,.045),col,-.03,.2,0);
  K.p(gl,RB(.255,.075,.176,.03),0x2b3442,-.03,.205,0); K.p(pn,BX(.24,.012,.18),col,-.03,.252,0);
  for(const s of [-1,1]){ K.p(ch,BX(.02,.03,.2),0xd8dadc,s*.225,.08,0); K.p({rough:.4,em:0xfff2cc,ei:s>0?.6:0},SPH(.017,10,8),s>0?0xfff6e0:0xb02020,s*.22,.115,.065); K.p({rough:.4,em:0xfff2cc,ei:s>0?.6:0},SPH(.017,10,8),s>0?0xfff6e0:0xb02020,s*.22,.115,-.065); }
  K.p(ch,BX(.012,.04,.1),0xc9ccd0,.222,.115,0); for(let k=0;k<5;k++) K.p(ch,BX(.004,.035,.003),0x9aa0a6,.229,.115,-.04+k*.02);
  for(const [x,z] of [[.14,.09],[.14,-.09],[-.14,.09],[-.14,-.09]]){ K.p({rough:.8},CY(.045,.045,.032,16),0x141414,x,.045,z,Math.PI/2); K.p(ch,CY(.026,.026,.034,12),0xd8dadc,x,.045,z,Math.PI/2); }
  return K.build(); }

/* 5 · 1985 Silicon Plateau: the dish rides down Miller's Road on a bullock cart, shown on its own, filling the scene */
{ const d=makeDio(5); const R=rng(85);
  /* Miller's Road is the world's through street (STAGE_Z): this scene just stands on it */
  d.g.position.z=STAGE_Z-1.3*.95;
  /* only the cart and its cargo: the story is the dish arriving on a bullock cart, so nothing else shares the stage */
  /* the convoy: two Hallikar bullocks, a spoked cart, the dish lashed on, a driver (hero) */
  const HERO_CART=2.05, CART_X=-.96;   /* the story is the cart: it is the biggest thing in the scene and stays centre stage */
  const mkConv=(sd,cA,cB)=>{ const conv=new THREE.Group(), wheels=[];
  { const K=kit(), wd={rough:.85,pat:{k:'wood',a:0,f:80}}, WD=0x7a5634, WD2=0x6a4a2c;
    for(let k=0;k<5;k++) K.p(wd,BX(.9,.022,.085),k%2?WD:WD2,0,.3,-.18+k*.09);
    for(const s of [-1,1]){ K.p(wd,BX(.96,.045,.045),WD2,0,.28,s*.24); K.p(wd,BX(.9,.02,.02),WD,0,.45,s*.24); for(let x=-.42;x<=.43;x+=.14) K.p(wd,BX(.022,.15,.022),WD2,x,.37,s*.24); }
    K.l(wd,UCYL(.024,.02,8),WD2,V3(.42,.29,0),V3(1.08,.4,0)); K.p(wd,BX(.045,.045,.52),WD2,1.06,.41,0); for(const s of [-1,1]) for(const o of [-.07,.07]) K.p(wd,BX(.014,.1,.014),WD2,1.06,.46,s*.13+o);
    K.p({rough:.5,metal:.5},CY(.018,.018,.7,8),0x3a3632,-.04,.2,0,Math.PI/2);
    conv.add(K.build());
    for(const s of [-1,1]){ const Kw=kit(), w={rough:.85,pat:{k:'wood',a:2,f:70}};
      Kw.p(w,TOR(.185,.02,Math.PI*2,6,30),WD,0,0,0); Kw.p({rough:.4,metal:.7},TOR(.2,.009,Math.PI*2,4,30),0x3a3632,0,0,0); Kw.p(w,CY(.04,.04,.1,12),WD2,0,0,0,Math.PI/2);
      for(let k=0;k<12;k++){ const a=k/12*6.283; Kw.l(w,UCYL(.009,.007,6),WD,V3(0,0,0),V3(Math.cos(a)*.18,Math.sin(a)*.18,0)); }
      const wg=Kw.build(); wg.position.set(-.04,.2,s*.31); conv.add(wg); wheels.push(wg); }
    const bl=bullock(51+sd,cA), br=bullock(52+sd,cB); bl.position.set(1.18,0,-.13); br.position.set(1.18,0,.13); conv.add(bl,br);
    if(sd===0){ const dish=dishG(); dish.position.set(-.02,.52,0); dish.rotation.set(.62,-.55,.3); dish.scale.setScalar(1.3); conv.add(dish);
      const Kc=kit(), cw={rough:.85,pat:{k:'wood',a:0,f:60}}; for(const [x,z,s] of [[-.33,-.12,.15],[-.33,.11,.13],[-.31,0,.11]]){ const y=.31+s/2+(s<.12?.15:0); Kc.p(cw,BX(s,s,s),0xa07a4c,x,y,z); Kc.p({rough:.7},BX(s+.004,.022,s+.004),0x3a2f25,x,y,z); } conv.add(Kc.build()); }   /* the hero cart carries the dish and its crates of equipment */   /* only the hero cart carries the dish */
    const Kr=kit(); for(const x of [-.2,.15]) Kr.raw({rough:.9},tubeG([[x,.45,-.25],[x-.02,.62,-.12],[x,.7,.05],[x+.02,.6,.2],[x,.45,.25]],.006,16,4),0xc9b48a); conv.add(Kr.build());
    conv.add(at(figure({h:.32/.72,pose:'sit',dress:'dhoti',head:'turban',top:0xf2ede2,accent:0xe1a12e,skin:SKINS[3],tool:'stick',seed:53+sd}),.4,.31,.0,Math.PI/2,0,0,1));
    conv.position.set(-.35,.025,.78); conv.rotation.y=-.04; conv.scale.setScalar(sd===0?HERO_CART:.72); }
  return {conv,wheels,bulls:conv.children.filter(c=>c.userData.legs)}; };
  const CV=[mkConv(0,0xc0392b,0x2e6db4)]; piece(d,CV[0].conv,{hero:true,lift:.5,dyn:true});
  const CONV_L=54, ZG=d.g.position.z;   /* a convoy of carts along a street that never ends: they enter and leave 26 to 35 units either side of the scene, far outside the view, and follow the street's curve at the junction */
  d.update=(t,dt,k)=>{ CV.forEach((c,n)=>{ const x=CART_X, run=t*.2/HERO_CART, wx=stopX(5)+x*1.3, sl=stageZ(wx+.5)-stageZ(wx-.5);   /* walks in place: wheels turn, bullocks plod */
    c.conv.position.x=x; c.conv.position.z=(stageZ(wx)-ZG)/1.3-.17; c.conv.rotation.y=-Math.atan(sl); c.wheels.forEach(w=>{ w.rotation.z=-run/.185; }); c.bulls.forEach(b=>bullockWalk(b,run,.5)); }); };
  finalize(d,7.0); }

/* a Hero Honda Splendor, nose to +x, on its side stand */
function bike(){ const K=kit(), bk={rough:.22,metal:.35}, ch={rough:.18,metal:.9}, mt={rough:.5,metal:.6}, BK=0x121315, RD=0xc0272d, CH=0xd2d5d8;
  wheelK(K,.21,.088,0,.082,{spokes:18}); wheelK(K,-.21,.088,0,.082,{spokes:18});
  for(const s of [-1,1]){ K.l(ch,UCYL(.008),CH,V3(.21,.088,s*.024),V3(.17,.23,s*.028)); K.l(bk,UCYL(.011),BK,V3(.17,.23,s*.028),V3(.15,.31,s*.03)); }
  K.p(bk,TOR(.09,.012,Math.PI*.55,4,14),BK,.21,.088,0,0,0,.55); K.p(bk,TOR(.092,.014,Math.PI*.7,4,14),BK,-.21,.088,0,0,0,1.5);
  K.p(ch,CY(.034,.029,.04,16),CH,.19,.32,0,0,0,Math.PI/2); K.p({rough:.05,metal:.3,em:0xfff2cc,ei:.3},CY(.03,.03,.004,16),0xf4f1e6,.212,.32,0,0,0,Math.PI/2); K.p(bk,BX(.03,.02,.07),BK,.17,.35,0);
  K.l(ch,UCYL(.006),CH,V3(.14,.37,-.12),V3(.14,.37,.12)); for(const s of [-1,1]){ K.p({rough:.8},CY(.011,.011,.05,10),0x1c1c1c,.14,.37,s*.1,Math.PI/2); K.l(ch,UCYL(.003),CH,V3(.14,.37,s*.08),V3(.13,.45,s*.1)); K.p(ch,CY(.018,.018,.006,12),CH,.13,.455,s*.1,0,0,Math.PI/2); }
  K.p(bk,BX(.04,.03,.05),0x2a2a2c,.15,.375,0);
  K.l(bk,UCYL(.012),BK,V3(.15,.31,0),V3(-.03,.17,0)); K.l(bk,UCYL(.01),BK,V3(.12,.3,0),V3(-.18,.27,0));
  K.p(bk,SPH(.062,18,12),BK,.05,.3,0,0,0,-.08,1.5,.72,.88); for(const s of [-1,1]) K.p({rough:.3,metal:.4},BX(.09,.012,.002),RD,.05,.305,s*.054,0,0,-.08);
  K.p({rough:.75},RB(.22,.035,.09,.015),0x1a1a1b,-.1,.3,0); K.p(bk,RB(.08,.06,.1,.015),BK,-.06,.23,0); for(const s of [-1,1]) K.p({rough:.3},BX(.06,.008,.002),RD,-.06,.235,s*.051);
  K.p(mt,RB(.1,.085,.07,.012),0x8e9296,.02,.155,0); for(let k=0;k<5;k++) K.p(mt,BX(.11,.004,.075),0x7a7e82,.02,.13+k*.012,0);
  K.raw(ch,tubeG([[.06,.14,.03],[.08,.07,.045],[0,.06,.05],[-.12,.09,.05]],.008,12,6),CH); K.p(ch,CY(.019,.022,.18,14),CH,-.15,.1,.05,0,0,Math.PI/2+.08);
  K.p(bk,BX(.2,.03,.02),BK,-.12,.11,-.035); K.l(ch,UCYL(.005),CH,V3(-.2,.33,-.05),V3(-.26,.32,0)); K.l(ch,UCYL(.005),CH,V3(-.26,.32,0),V3(-.2,.33,.05));
  K.p({rough:.3,em:0xff2a2a,ei:.5},BX(.012,.02,.05),0xb01e1e,-.29,.3,0); K.p({rough:.6},BX(.004,.04,.08),0xf2efe6,-.3,.25,0);
  K.l(mt,UCYL(.005),0x3a3a3a,V3(-.02,.08,-.04),V3(-.03,.0,-.1));
  const g=K.build(); g.rotation.x=-.1; return g; }
/* an auto rickshaw (yellow-green, black hood), nose to +x */
function autoRick(){ const K=kit(), p={rough:.35,metal:.2}, GR=0x2f7a3a, YL=0xf2c12e;
  K.p(p,RB(.36,.08,.22,.03),GR,0,.09,0); K.p(p,RB(.11,.16,.2,.04),GR,.16,.17,0); K.p({rough:.05,metal:.5},BX(.01,.12,.17),0x2b3442,.2,.25,0,0,0,-.25);
  K.p({rough:.85},RB(.34,.03,.24,.03),0x161616,-.02,.33,0); for(const s of [-1,1]){ K.l({rough:.5,metal:.5},UCYL(.006),0x2a2a2a,V3(.14,.15,s*.1),V3(.15,.32,s*.1)); K.l({rough:.5,metal:.5},UCYL(.006),0x2a2a2a,V3(-.17,.13,s*.11),V3(-.17,.32,s*.11)); }
  K.p({rough:.8},BX(.2,.16,.005),0x1a1a1a,-.06,.24,-.12); K.p(p,RB(.2,.06,.2,.02),YL,-.07,.12,0); K.p({rough:.7},RB(.12,.05,.2,.015),0x2b2b2b,-.08,.17,0);
  for(const [x,z] of [[.17,0],[-.13,.1],[-.13,-.1]]){ K.p({rough:.8},CY(.04,.04,.03,14),0x141414,x,.04,z,Math.PI/2); K.p({rough:.3,metal:.8},CY(.022,.022,.032,10),0xc9ccd0,x,.04,z,Math.PI/2); }
  K.p({rough:.4,em:0xfff2cc,ei:.4},SPH(.018,10,8),0xfff6e0,.22,.17,0); return K.build(); }

/* 6 · 2007 Startup City: 447-C Koramangala. A Hero Honda at the gate, three servers and a stack of book parcels in the porch */
{ const d=makeDio(6); const R=rng(2007);
  /* the street and footpath are the world's through street (STAGE_Z), so this scene needs no strip of its own */
  /* the house (hero): RCC frame, chajjas, grills, balcony, terrace, Sintex tank; the porch holds the first Flipkart */
  const LEDS=[];
  { const g=new THREE.Group(), K=kit(), x0=-1.45, x1=.45, z0=-1.45, z1=.05, W=x1-x0, D=z1-z0, cx=(x0+x1)/2, cz=(z0+z1)/2, PW=0xf1e3a8, TR=0xf6f3ec, ws={rough:.9,pat:{k:'stain',d:.4}}, tr={rough:.85};
    const porchX1=-.35;
    /* ground floor: rooms at the right, open porch at the left */
    K.p(ws,BX(x1-porchX1,.42,D),PW,(x1+porchX1)/2,.21,cz); K.p(ws,BX(porchX1-x0,.42,.06),PW,(x0+porchX1)/2,.21,z0+.03); K.p(ws,BX(.06,.42,D),PW,x0+.03,.21,cz);
    K.p({rough:.55},BX(porchX1-x0,.012,D),0x4c4844,(x0+porchX1)/2,.006,cz);
    for(const x of [x0+.04,porchX1-.04]) K.p({rough:.5,pat:{k:'stain',d:.2}},BX(.08,.42,.08),0x55504b,x,.21,z1-.04);
    K.p(tr,BX(.2,.32,.015),0x6b3f2a,.2,.16,z1+.008); K.p(tr,BX(.24,.02,.03),TR,.2,.33,z1+.01);
    /* slabs with drip edges */
    for(const y of [.42,.84]) { K.p(tr,BX(W+.08,.05,D+.08),TR,cx,y+.025,cz); K.p(tr,BX(W+.1,.015,D+.1),0xdcd6c8,cx,y,cz); }
    /* first floor */
    K.p(ws,BX(W,.37,D-.32),PW,cx,.45+.185,cz-.16); K.p({rough:.9},BX(W,.012,.32),0xb7ae9c,cx,.455,z1-.16);
    for(let x=x0+.02;x<=x1-.02+.001;x+=.035) K.p({rough:.5,metal:.6},BX(.006,.13,.006),0x2f3a36,x,.52,z1+.03);
    K.p({rough:.5,metal:.6},BX(W,.012,.015),0x2f3a36,cx,.585,z1+.03); for(const x of [x0,x1]) K.p({rough:.5,metal:.6},BX(.015,.012,.32),0x2f3a36,x,.585,z1-.13);
    K.p(tr,BX(.24,.3,.015),0x7a4a30,cx-.4,.6,z1-.32+.008);
    /* second floor (stair headroom + room), terrace parapet */
    K.p(ws,BX(.9,.36,.85),PW,x1-.48,.87+.18,z0+.45); K.p(tr,BX(.96,.045,.91),TR,x1-.48,1.25,z0+.45);
    for(const [x,z,w,dd] of [[cx,z1+.02,W+.08,.05],[x0-.02,cz,.05,D+.08],[cx,z0-.02,W+.08,.05]]) K.p(ws,BX(w,.11,dd),PW,x,.92,z);
    for(let x=x0+.06;x<-.03;x+=.12) K.p({rough:.6},CY(.035,.03,.05,10),0x9a4a2c,x,.92+.08,z1+.02);
    /* water tank and DTH dish */
    K.p({rough:.6},CY(.1,.11,.22,18),0x1d1e20,x1-.25,1.38,z0+.35); for(const y of [1.31,1.38,1.45]) K.p({rough:.6},TOR(.105,.006,Math.PI*2,4,18),0x2a2b2d,x1-.25,y,z0+.35,Math.PI/2); K.p({rough:.6},CY(.05,.05,.025,14),0x1d1e20,x1-.25,1.5,z0+.35);
    K.p({rough:.5,side:true},new THREE.LatheGeometry([0,1,2,3,4].map(k=>new THREE.Vector2(k*.014,k*k*.003)),14),0x7d8286,x0+.12,1.03,z1-.02,0,0,1.25);
    g.add(K.build());
    /* windows: aluminium frames, tinted glass, MS grills, sloping chajjas */
    const Kw=kit(), win=(x,y,z,w,h,ry=0,lit=false)=>{ const sx=Math.cos(ry), sz=-Math.sin(ry);
      Kw.p({rough:.08,metal:.5,em:lit?0xffc070:0,ei:lit?.9:0},BX(w,h,.008),lit?0xffe2b0:0x2f4150,x,y,z,0,ry,0); Kw.p({rough:.4,metal:.6},BX(w+.02,.012,.012),0xd9dcdf,x,y+h/2,z,0,ry,0); Kw.p({rough:.4,metal:.6},BX(w+.02,.012,.012),0xd9dcdf,x,y-h/2,z,0,ry,0);
      for(let k=0;k<=Math.round(w/.028);k++){ const u=-w/2+k*w/Math.round(w/.028); Kw.p({rough:.5,metal:.6},BX(.005,h,.006),0x33403a,x+sx*u+Math.sin(ry)*.012,y,z+sz*u+Math.cos(ry)*.012,0,ry,0); }
      Kw.p({rough:.85},BX(w+.1,.016,.1),TR,x+Math.sin(ry)*.05,y+h/2+.04,z+Math.cos(ry)*.05,-.25,ry,0); };
    win(.05,.22,z1+.006,.26,.18); win(-.1,.64,z1-.32+.006,.26,.18,0,true); win(.3,.64,z1-.32+.006,.22,.18); win(x1+.006,.64,z0+.5,.24,.18,Math.PI/2); win(x1+.006,.22,z0+.5,.24,.16,Math.PI/2); win(x1-.48,1.04,z0+.875+.006,.22,.16);
    g.add(Kw.build());
    /* porch: a table with three tower servers, a CRT, book parcels, a plastic chair, a tube light */
    const Kp=kit(), pz=-.3, px=-.95;
    Kp.p({rough:.6},BX(.44,.015,.2),0x7a5a3c,px,.16,pz); for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]) Kp.p({rough:.6},BX(.015,.16,.015),0x5a4128,px+a*.2,.08,pz+b*.08);
    for(let k=0;k<3;k++){ Kp.p({rough:.4,metal:.3},RB(.07,.17,.16,.008),0x1b1c1f,px-.13+k*.085,.255,pz); Kp.p({rough:.4},BX(.06,.15,.004),0x2e3034,px-.13+k*.085,.255,pz+.081); }
    Kp.p({rough:.7},RB(.13,.11,.12,.01),0xd8d2c0,px+.15,.23,pz-.01); Kp.p({rough:.2,em:0x2a5a9a,ei:.7},BX(.1,.075,.004),0x2a4a7a,px+.15,.235,pz+.052);
    for(let k=0;k<7;k++){ const bx=px+(k<4?-.32:.32)+(R()-.5)*.03, by=.04+(k%4)*.07*(k<4?1:0)+(k>=4?(k-4)*.07:0); Kp.p({rough:.9},BX(.14,.07,.1),0xb8895a,bx,by+.0,pz+.12+(R()-.5)*.04,0,(R()-.5)*.3,0); Kp.p({rough:.6},BX(.142,.012,.03),0xd8c29a,bx,by+.036,pz+.12); }
    Kp.p({rough:.5},RB(.1,.012,.1,.01),0xf0eee8,px+.05,.11,pz+.24); Kp.p({rough:.5},RB(.1,.1,.012,.01),0xf0eee8,px+.05,.17,pz+.19);
    for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]) Kp.l({rough:.5},UCYL(.006),0xf0eee8,V3(px+.05+a*.045,.105,pz+.24+b*.045),V3(px+.05+a*.055,0,pz+.24+b*.055));
    Kp.p({rough:.3,em:0xffffff,ei:1.6},BX(.24,.012,.012),0xffffff,px,.405,pz+.1);
    g.add(Kp.build());
    const ledOn=new THREE.MeshStandardMaterial({color:0x7dffa0,emissive:0x2bdc5a,emissiveIntensity:2.4}), ledB=new THREE.MeshStandardMaterial({color:0x9ad8ff,emissive:0x3aa8ff,emissiveIntensity:2.4}); patch(ledOn); patch(ledB);
    for(let k=0;k<3;k++) for(let j=0;j<3;j++){ const m=new THREE.Mesh(SPH(.006,6,4),j%2?ledB:ledOn); m.position.set(px-.13+k*.085-.015+j*.015,.31,pz+.085); g.add(m); }
    LEDS.push(ledOn,ledB);
    /* compound wall, gate pillars, a sliding MS gate half open, the address plate */
    const Kc=kit(), wl={rough:.9,pat:{k:'stain',d:.35}};
    for(const [a,b] of [[-1.85,-1.45],[-.35,.15],[.5,.95]]){ Kc.p(wl,BX(b-a,.18,.06),PW,(a+b)/2,.09,.6); Kc.p(tr,BX(b-a+.02,.02,.08),TR,(a+b)/2,.19,.6); }
    for(const x of [-1.45,-.35,.15,.5]){ Kc.p(wl,BX(.09,.26,.09),PW,x,.13,.6); Kc.p(tr,BX(.11,.025,.11),TR,x,.27,.6); Kc.p({rough:.4,em:0xfff0c8,ei:.5},SPH(.022,10,8),0xfff6e0,x,.3,.6); }
    for(let x=-1.4;x<=-.62;x+=.035) Kc.p({rough:.5,metal:.6},BX(.006,.2,.006),0x2f3a36,x,.12,.66); Kc.p({rough:.5,metal:.6},BX(.8,.014,.012),0x2f3a36,-1.01,.22,.66); Kc.p({rough:.5,metal:.6},BX(.8,.014,.012),0x2f3a36,-1.01,.03,.66);
    for(let x=.18;x<=.47;x+=.035) Kc.p({rough:.5,metal:.6},BX(.006,.18,.006),0x2f3a36,x,.11,.6);
    g.add(Kc.build());
    const plate=sign('447-C',.07,.035,{bg:'#f4f1ea',fg:'#1f2a44',font:'700 60px Helvetica, Arial, sans-serif',w:256,h:128,border:'#1f2a44'}); plate.position.set(.15,.19,.647); g.add(plate);
    g.scale.y=1.3; /* 3 m storeys for 1.75 m people */ piece(d,g,{hero:true,lift:.5}); }
  /* the bike at the gate, two founders, a passing auto */
  const hb=bike(); hb.position.set(.72,.025,1.0); hb.rotation.y=Math.PI*.92; swapVehicle(hb,'IN_Motorbike_01',{len:.38,flat:true}); piece(d,hb,{key:true});
  piece(d,grp(at(figure({pose:'point',dress:'pants',head:'hair',top:0x3b5f8a,bottom:0x2f3e56,skin:SKINS[2],tool:'bag',accent:0x2a2a2a,seed:61}),.98,.025,.78,-2.6),at(figure({pose:'carry',dress:'pants',head:'hair',top:0xd9d4c8,bottom:0x3a4a62,skin:SKINS[0],seed:62}),.32,.03,.72,-2.3)),{amp:.4});
  piece(d,grp(at(new THREE.Mesh(P(BX(.14,.08,.1),0xb8895a),vmat({rough:.9})),.42,.07,.7,-.3),at(new THREE.Mesh(P(BX(.12,.07,.09),0xc49a6c),vmat({rough:.9})),.43,.145,.71,.2)),{amp:.4});
  { const ar=autoRick(); swapVehicle(ar,'IN_Rickshaw_02',{len:.5}); piece(d,at(ar,-1.35,.025,1.26,Math.PI),{key:true}); }
  /* the neighbour's house, a coconut palm, a gulmohur on the corner */
  { const g=new THREE.Group(), K=kit(), PK=0xe8bdb0, ws={rough:.9,pat:{k:'stain',d:.4}};
    K.p(ws,BX(1.0,.82,1.05),PK,1.45,.41,-1.15); K.p({rough:.85},BX(1.06,.05,1.11),0xf4efe6,1.45,.845,-1.15); K.p({rough:.85},BX(1.04,.05,1.09),0xf4efe6,1.45,.42,-1.15);
    for(const y of [.22,.62]) for(const x of [1.2,1.68]){ K.p({rough:.08,metal:.5},BX(.2,.16,.008),0x2f4150,x,y,-.622); K.p({rough:.85},BX(.28,.016,.09),0xf4efe6,x,y+.12,-.585,-.25); }
    K.p({rough:.6},CY(.08,.09,.18,16),0x1d1e20,1.7,.96,-1.4); g.add(K.build());
    const palm=new THREE.Mesh(TREE_GEOS.palm[0],leafMat); palm.scale.setScalar(.95); palm.position.set(.72,0,-.15); palm.castShadow=true; g.add(palm); g.scale.y=1.3; piece(d,g,{key:true}); }
  piece(d,at(htree(601,{h:1.4,w:.72,kind:'gul'}),-1.82,0,.2),{key:true});
  piece(d,at(htree(602,{h:1.2,w:.66,kind:'neem'}),1.85,0,.2),{key:true});
  d.update=(t,dt,k)=>{
    LEDS[0].emissiveIntensity=Math.sin(t*9)>-.2?2.6:.2; LEDS[1].emissiveIntensity=Math.sin(t*6.3+1)>.1?2.6:.25; };
  finalize(d,7.0); }


/* 7 · 2037 (recreated from the supplied metro render: elevated line, purple trains, station, bus, auto, trees). The grass disc is also the build plot. */
const plot={T:.03, cell:.52, cols:6, rows:7};
{ const d=makeDio(7); const R=rng(7), TT=plot.T;
  /* the street and the viaduct are world-level (STAGE_Z, VIA_Z): endless, and always there. This scene adds the station, the stop's trees and people, and its own bus and auto. */
  d.g.position.z=STAGE_Z-1.3*.98;
  const station=new THREE.Group(); station.add(at(box(1.15,.62,1.3,mat(0xd9d2c4,{rough:.7})),0,.31,0));
  for(let k=0;k<4;k++) station.add(at(box(.18,.32,.02,mat(0x2e3644,{rough:.2})),-.4+k*.27,.33,.66));
  const roof=mesh(new THREE.CylinderGeometry(.82,.82,1.5,28,1,true,0,Math.PI),mat(0x6a6c70,{metal:.4,rough:.45,side:true})); roof.rotation.z=Math.PI/2; roof.position.set(.15,.6,0); roof.scale.set(.42,1,.84);
  station.add(roof); for(let k=0;k<3;k++) station.add(at(sph(.04,mat(0xfff2c8,{em:0xffe2a0,ei:1.4}),8,6),-.2+k*.4,.86,.3));
  station.scale.z=.34; piece(d,at(station,-2.25,TT+1.88,-.56),{});
  const win=mat(0x2b3240,{rough:.12,metal:.2});
  const bus=new THREE.Group(); bus.add(at(box(1.15,.42,.38,mat(0xf1eee8,{rough:.5}),.06),0,0,0)); bus.add(at(box(1.07,.14,.39,win),.02,.08,0)); bus.add(at(box(1.16,.06,.39,mat(0x2f6fc0)),0,-.12,0)); bus.add(at(box(.7,.04,.392,mat(0xf2a23a)),-.15,-.05,0));
  [-.36,.36].forEach(x=>[-.18,.18].forEach(z=>bus.add(at(cyl(.08,.08,.05,mat(0x1d1d20),12),x,-.2,z,0,Math.PI/2))));
  const busO=at(bus,-.6,TT+.3,.78); swapVehicle(bus,'IN_Bus_01',{len:1.9,y:-.28}); piece(d,busO,{slide:-5.2,dyn:true});
  const auto=new THREE.Group(); auto.add(at(box(.34,.2,.26,mat(0x2f7a3a,{rough:.5}),.05),0,.0,0)); auto.add(at(box(.36,.17,.28,mat(0xf2c12e,{rough:.5}),.07),-.02,.19,0)); auto.add(at(box(.02,.12,.22,win),.17,.15,0));
  [[.14,0],[-.12,.13],[-.12,-.13]].forEach(([x,z])=>auto.add(at(cyl(.06,.06,.04,mat(0x1d1d20),10),x,-.1,z,0,Math.PI/2)));
  const autoO=at(auto,.9,TT+.17,1.15,Math.PI); swapVehicle(auto,'IN_Rickshaw_01',{len:.5,y:-.15}); piece(d,autoO,{slide:5.2,dyn:true});
  piece(d,grp(at(htree(791,{h:1.85,w:.82,kind:'rain'}),-2.05,TT,.45),at(htree(792,{h:1.6,w:.85,kind:'jac'}),-1.0,TT,-1.35)),{}); piece(d,grp(at(htree(793,{h:1.5,w:.85,kind:'gul'}),1.0,TT,-1.45),at(htree(794,{h:1.35,w:.7,kind:'neem'}),2.2,TT,-.55)),{});
  const bs=new THREE.Group(); for(let k=0;k<14;k++) bs.add(bush((R()-.5)*9,(R()<.5?-1:1)*(1.9+R()*.6),0,.9+R()*.5,R)); piece(d,bs,{amp:.3});
  piece(d,grp(at(figure({pose:'walk',dress:'pants',head:'hair',top:0x2f6db4,bottom:0x2a2f3a,skin:SKINS[2],tool:'bag',accent:0x1c1c1c,seed:71}),-1.55,TT,1.48,Math.PI/2),
    at(figure({pose:'walk',dress:'sari',head:'bun',accent:0x1f8a5a,skin:SKINS[4],seed:72}),-1.2,TT,1.48,-Math.PI/2),
    at(figure({pose:'stand',dress:'pants',head:'cap',top:0xe8e4da,bottom:0x4a5568,skin:SKINS[0],accent:0xc0392b,seed:73}),1.55,TT,1.48,-2.6),
    at(figure({pose:'point',dress:'pants',head:'hair',top:0xe1a12e,bottom:0x2a2f3a,skin:SKINS[1],seed:74}),1.85,TT,1.48,-2.2)),{});
  /* the bus and the auto drive their own lanes of the endless street and wrap round far outside the view (the train is part of the world: see METRO) */
  d.update=(t,dt,k)=>{ const wrap=(v,L)=>((v%L)+L)%L-L/2;
    busO.position.x=wrap(t*.8+3,52)+(busO.userData.so||0); autoO.position.x=-wrap(t*1.0+9,52)+(autoO.userData.so||0); };
  finalize(d,7.2); }

/* the narrator: Kempegowda's watchtower on a granite outcrop at the start of the timeline */
const narrator=at(watchtower(1.6),START,.85,-1); scene.add(narrator);
/*WORLD*/
const clayOnly=new THREE.Group();
const BURST=180, burst=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.6,0),mat(0xffffff,{rough:.4,em:0xffc070,ei:.6}),BURST); burst.castShadow=false; burst.frustumCulled=false; scene.add(burst);
const bp=Array.from({length:BURST},()=>({life:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,s:0,r:0}));
const tmpO=new THREE.Object3D(), tmpC=new THREE.Color();
function spawnBurst(x,y,z,n,hue,spread=1){ let k=0; for(const p of bp){ if(p.life>0) continue; Object.assign(p,{life:1,x:x+(Math.random()-.5)*spread,y:y+(Math.random()-.5)*spread,z:z+(Math.random()-.5)*spread,vx:(Math.random()-.5)*4,vy:1+Math.random()*3.2,vz:(Math.random()-.2)*3,s:.05+Math.random()*.11,r:Math.random()*6});
  burst.setColorAt(bp.indexOf(p),tmpC.setHSL(((hue+(Math.random()-.5)*40)/360+1)%1,.55,.55+Math.random()*.2)); if(++k>=n) break; } burst.instanceColor.needsUpdate=true; }
for(let k=0;k<BURST;k++) burst.setColorAt(k,tmpC.set(0xffffff));

/* ================= THE FRAME (screen on rails) ================= */
const FW=5.2, FH=9.25, FB=.3, FY=.18;
const frame=new THREE.Group(); scene.add(frame);
{ const rr=(s,x,y,w,h,r)=>{ s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r); s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h); s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r); s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y); };
  const sh=new THREE.Shape(); rr(sh,-FW/2,0,FW,FH,.25); const hole=new THREE.Path(); rr(hole,-FW/2+FB,FB,FW-2*FB,FH-2*FB,.08); sh.holes.push(hole);
  const bez=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.24,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2,curveSegments:8}),new THREE.MeshStandardMaterial({color:0x1d1d21,metalness:.35,roughness:.42}));
  bez.castShadow=true; frame.add(bez);
  const hmat=new THREE.MeshStandardMaterial({color:0xe8622a,emissive:0xe8622a,emissiveIntensity:.4,roughness:.5});
  frame.userData.hmat=hmat;
  [-1,1].forEach(s=>{ const h=new THREE.Mesh(new RoundedBoxGeometry(.18,1.5,.34,2,.08),hmat); h.position.set(s*(FW/2+.14),FH/2,.12); h.castShadow=true; frame.add(h); });
  const car=new THREE.MeshStandardMaterial({color:0x2a2a2e,metalness:.3,roughness:.5});
  frame.add(at(new THREE.Mesh(new RoundedBoxGeometry(1.6,.2,.34,2,.06),car),0,FH+.14,.12));
  frame.add(at(new THREE.Mesh(new RoundedBoxGeometry(1.6,.16,.34,2,.06),car),0,-.06,.12));
  const sheen=new THREE.Mesh(new THREE.PlaneGeometry(FW-2*FB,FH-2*FB),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.035,depthWrite:false})); sheen.position.set(0,FH/2,.2); frame.add(sheen);
}
frame.position.set(START,FY,FZ); frame.visible=false;
const railMat=new THREE.MeshStandardMaterial({color:0x8c867c,metalness:.5,roughness:.35});


/* ================= STATE ================= */
let fx=START, vx=0, phase='rest', snapT=START, dragT=START, restX=START, zoneIdx=-1, started=false, arrived=false, building=false, lensMode=null;
const seen=new Set(), starred=new Set(), F={dragged:false,announced:false};
const stampCount=()=>[0,1,2,3,4,5,6].filter(i=>starred.has(i)).length, unlocked=()=>stampCount()===7;
const nearest=x=>clamp(Math.round(x/SP),0,N-1);
const camPos=new THREE.Vector3(START,6,40), camLook=new THREE.Vector3(START,4.5,0), camRoll={v:0}, camFov={v:30};
let mx=-100,my=-100, pointerOnCanvas=false;

/* projected rects of the frame */
const v3=new THREE.Vector3();
function projRect(x0,x1,y0,y1,z){ let l=1e9,r=-1e9,t=1e9,b=-1e9; for(const [x,y] of [[x0,y0],[x1,y0],[x0,y1],[x1,y1]]){ v3.set(x,y,z).project(camera); const sx=(v3.x+1)/2*innerWidth, sy=(1-v3.y)/2*innerHeight; l=Math.min(l,sx); r=Math.max(r,sx); t=Math.min(t,sy); b=Math.max(b,sy); } return {l,r,t,b,w:r-l,h:b-t}; }
/* the Figma artboard (1440 x 900) is centred and scaled down to fit; below 1100px the page reflows. The glass card is the frame. */
const LAY={s:1}; let cardDX=0; const NARROWQ=matchMedia('(max-width:1099px)'); let NARROW=NARROWQ.matches;
function layout(){ NARROW=NARROWQ.matches; const s=NARROW?1:Math.min(innerWidth/1440,innerHeight/900,1); LAY.s=s; const R=document.documentElement.style; R.setProperty('--s',s);
  R.setProperty('--obs',NARROW?Math.min(innerWidth/560,innerHeight/900):Math.min(innerWidth/1440,innerHeight/900)); $('artM').style.setProperty('--obs',NARROW?Math.min(innerWidth/1120,innerHeight/900):s); const al=$('artL'); al&&al.style.setProperty('--obs',NARROW?Math.min(innerWidth/1120,innerHeight/900):s); }
const rectOf=el=>{ const r=el.getBoundingClientRect(); return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}; };
const cardRect=()=>rectOf($('cardF'));
const homeRect=()=>rectOf($('cardHome'));
const glassRect=()=>{ const r=cardRect(), k=2*r.w/384; return {l:r.l+k,t:r.t+k,r:r.r-k,b:r.b-k,w:r.w-2*k,h:r.h-2*k}; };
const bandRect=()=>{ const a=$('rule1').getBoundingClientRect(), b=$('rule2').getBoundingClientRect(); return {l:0,r:innerWidth,t:a.bottom,b:b.top,w:innerWidth,h:b.top-a.bottom}; };
let cbKey='';
function placeCardBack(){ const r=cardRect(), k=r.w/384, key=[r.l,r.t,r.w,r.h].map(v=>v.toFixed(1)).join(',');
  if(key===cbKey) return; cbKey=key; $('cardF').style.setProperty('--cs',NARROW?k:1); const st=$('cardB').style; st.transform=`translate(${r.l}px,${r.t}px)`; st.width=r.w+'px'; st.height=r.h+'px'; st.borderRadius=(32*k)+'px'; st.setProperty('--bw',(2*k)+'px'); }

/* ================= DISPERSION ================= */
const ASM_R=8;
const easeOutBack=t=>1+2.4*Math.pow(t-1,3)+1.4*Math.pow(t-1,2);
function keysLeft(d){ return 0; }

/* ================= STORY BLOCKS (left chapter, right Watchtower, prev / next) ================= */
const BLKS=()=>[$('blkL'),$('blkR'),$('navP'),$('navN')];
function quoteOf(i){ const z=ZONES[i];
  if(z.future&&!unlocked()) return `“${z.summary} Bring me all 7 stamps first. You have ${stampCount()}.”`;
  return `“${z.summary}”`; }
function setSplit(el,text){ el.textContent=text; }
function fillBlocks(i){
  const z=ZONES[i];
  setSplit($('kL'),`Chapter ${pad(i+1)} - ${z.chapter}`);
  setSplit($('yL'),String(z.year));
  setSplit($('tL'),z.future&&!unlocked()?'Locked, for now':z.title);
  $('eL').textContent=EDGE[i];
  setSplit($('qR'),quoteOf(i)); $('actsR').innerHTML=''; saying=false;
  const ft=FOOT[i]||{}; $('nT').textContent=ft.next||TEASE[i]||'The end of my timeline'; $('navN').classList.toggle('off',i>=N-1);
  $('pT').textContent=ft.prev||(i>0?ZONES[i-1].title:''); $('navP').classList.toggle('off',false);
  const rb=$('btnRead'); rb.hidden=false; syncRead();
  ensureSplit($('artF'));
}
let storyTimer=null;
function showStory(i){
  const go=()=>{ if(building||lensMode||!arrived||zoneIdx!==i) return; fillBlocks(i); nudgeST(); clearTimeout(storyTimer);
    storyTimer=setTimeout(()=>{ if(building||lensMode||!arrived||zoneIdx!==i) return; BLKS().forEach(b=>b.classList.add('in')); },90); };
  if($('blkL').classList.contains('in')){ hideStory(); setTimeout(go,320); } else go();
}
function hideStory(){ BLKS().forEach(b=>b.classList.remove('in')); clearTimeout(storyTimer); clearInterval(typeT); clearTimeout(sayTimer); saying=false; }
/* the primary CTA: Read Full Story, or at 2037 Build Your Bangalore, disabled until all 7 stamps are in */
function syncRead(){ const rb=$('btnRead'), z=zoneIdx>=0?ZONES[zoneIdx]:null, fut=!!(z&&z.future), lock=fut&&!unlocked();
  rb.textContent=fut?'✦ Build Your Bangalore ✦':'✦ Read Full Story ✦'; rb.classList.toggle('locked',lock); rb.setAttribute('aria-disabled',lock?'true':'false');
  if(lock) rb.setAttribute('aria-describedby','readTip'); else { rb.removeAttribute('aria-describedby'); readTip(false); } }
let readTipT=null;
function readTip(on){ const t=$('readTip'), rb=$('btnRead'); clearTimeout(readTipT);
  if(!on){ t.classList.remove('show'); return; }
  t.textContent=`Bring me all 7 stamps first to enable me. You have ${stampCount()}.`;
  const r=rb.getBoundingClientRect(); t.style.left=(r.left+r.width/2)+'px'; t.style.top=(r.top-12)+'px'; t.classList.add('show'); }
$('btnRead').addEventListener('mouseenter',()=>{ if($('btnRead').classList.contains('locked')) readTip(true); });
$('btnRead').addEventListener('mouseleave',()=>readTip(false));
$('btnRead').addEventListener('focus',()=>{ if($('btnRead').classList.contains('locked')) readTip(true); });
$('btnRead').addEventListener('blur',()=>readTip(false));
$('btnRead').onclick=()=>{ if(!started||zoneIdx<0||obBusy()) return; const z=ZONES[zoneIdx];
  if(z.future&&!unlocked()){ readTip(true); readTipT=setTimeout(()=>readTip(false),2600); return; }
  if(z.future) enterBuilder(); else openChapter(); };
$('navN').onclick=()=>{ if(!started) return; if(zoneIdx<N-1) goTo(zoneIdx+1); };
$('navP').onclick=()=>{ if(!started) return; if(zoneIdx>0) goTo(zoneIdx-1); else { markDragged(); onLeave(); snapT=START; phase='snap'; } };

/* ================= ARRIVE / LEAVE ================= */
let pendingStamp=-1, pillUntil=0;
function onArrive(i){
  const prevZone=lastZone; lastZone=i;
  arrived=true; zoneIdx=i; const first=!seen.has(i); seen.add(i);
  const earn=i<7&&!starred.has(i); pendingStamp=earn?i:-1; updatePassport();
  showStory(i); tone(660,.06,.3); setTimeout(()=>tone(990,.035,.25),70);
  if(earn) setTimeout(()=>celebrate(i),1000);
  if(first&&i===7&&unlocked()) setTimeout(()=>say("This is the stop I couldn't see. With your 7 stamps, it's yours.",[['Start building',()=>enterBuilder()]]),1400);
  if(follow) scheduleFollow();
  lampOnArrive(i,prevZone);
}
function onLeave(){ hideStory(); arrived=false; pendingStamp=-1; }
function celebrate(i){
  if(!(arrived&&zoneIdx===i)||starred.has(i)) return;
  starred.add(i); pendingStamp=-1; updatePassport(); chord(); const d=DIO[i]; spawnBurst(d.g.position.x,2.8,.4,110,ZONES[i].hue,2.8); react();
  toast(`✦  Memory restored · stamp ${stampCount()} / 7`);
  if(unlocked()&&!F.allAnn){ F.allAnn=true; setTimeout(()=>say('All 7 memories restored! I can finally see 2037. Come and build it with me.',[['Take me to 2037',()=>goTo(7)]]),1600); }
}
const earnStamp=i=>{ if(!(arrived&&zoneIdx===i)) return; celebrate(i); };
function goTo(i){ if(building) exitBuilder(); if(vrMode) exitVR(); markDragged(); snapT=stopX(i); phase='snap'; }
function markDragged(){ if(!F.dragged){ F.dragged=true; document.body.classList.add('dragged'); } }

/* ================= REBUILD (tap the glowing pieces) ================= */
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
function pick(clientX,clientY,objs){ ndc.set(clientX/innerWidth*2-1,-(clientY/innerHeight)*2+1); ray.setFromCamera(ndc,camera); return ray.intersectObjects(objs,true)[0]; }
function keyMeshes(){ return []; }
function dioMeshes(){ const out=[]; DIO.forEach(d=>{ if(Math.abs(d.g.position.x-camLook.x)>22) return; if(arrived&&d.i===zoneIdx) d.g.traverse(m=>{ if(m.isMesh&&m.userData.dio!=null) out.push(m); }); else if(d.hero) d.hero.obj.traverse(m=>{ if(m.isMesh) out.push(m); }); }); return out; }
function clickWorld(cx,cy){ const cr=cardRect(); if(clayK<.2&&!(cx>cr.l&&cx<cr.r&&cy>cr.t&&cy<cr.b)) return; const hit=pick(cx,cy,dioMeshes()); if(!hit) return; const j=hit.object.userData.dio; if(j==null) return;
  if(arrived&&j===zoneIdx&&phase==='rest') openChapter(); else { tone(500,.04,.15); goTo(j); } }

/* ================= PASSPORT BAR ================= */
const ICONS=[];                      /* per-stop stamp images, rendered from each hero piece */
function stampsHTML(live){ let h=''; ZONES.forEach((z,i)=>{ const lab=TIMELINE_LABELS[i]??String(z.year);
  h+=`<li>${i?'<i class="ln" aria-hidden="true"></i>':''}<button class="st ${i===7?'last':''}" data-i="${i}" ${live?`data-cursor="Go" aria-label="Go to ${z.year}: ${z.title}"`:'tabindex="-1" aria-hidden="true"'}>${lab}</button></li>`; }); return h; }
$('sbar').innerHTML=stampsHTML(true);
$('sbar').querySelectorAll('.st').forEach(b=>b.onclick=()=>{ if(!started) return; const i=+b.dataset.i; if(lensMode) closeChapter(()=>goTo(i)); else goTo(i); });
function setStamp(b,got,i,pop){ if(got===b.classList.contains('got')&&b.dataset.ok) return; b.dataset.ok=1; b.classList.toggle('got',got); b.classList.toggle('glass',got); b.classList.toggle('pop',got&&!!pop);
  const src=STAMPS[i]||ICONS[i]; b.innerHTML=got&&src?`<img src="${src}" alt="">`:(TIMELINE_LABELS[i]??String(ZONES[i].year)); }
function updatePassport(){ $('sbN').innerHTML=`${stampCount()} <small>/ 7</small>`; if(typeof syncRead==='function') try{ syncRead(); }catch(e){}
  $('sbar').querySelectorAll('.st').forEach(b=>{ const i=+b.dataset.i; b.classList.toggle('here',arrived&&i===zoneIdx); if(i<7) setStamp(b,starred.has(i),i,started); else b.classList.toggle('locked',!unlocked()); b.title=i<7?(starred.has(i)?`${ZONES[i].year} · memory restored`:`${ZONES[i].year} · not restored yet`):(unlocked()?'2037 · open':'2037 · needs 7 stamps'); }); }

/* ================= SNAPSHOTS (render the 3D picture) ================= */
const snapCam=new THREE.PerspectiveCamera(34,1,.1,200);
function snapshot(pos,look,fov=34){
  snapCam.fov=fov; snapCam.aspect=innerWidth/innerHeight; snapCam.updateProjectionMatrix(); snapCam.position.copy(pos); snapCam.lookAt(look);
  renderer.setRenderTarget(null); renderer.setScissorTest(false); renderer.setViewport(0,0,innerWidth,innerHeight); renderer.setClearColor(PAPER,1); renderer.clear(); GRAY.value=0; sky.position.copy(snapCam.position);
  renderer.render(scene,snapCam); let url=''; try{ url=canvas.toDataURL('image/jpeg',.88); }catch(e){} renderer.setClearColor(PAPER,0); clayOnly.visible=true; return url;
}
/* small transparent icons (mascot, stamps): render one object alone, then copy that corner of the canvas */
const studio=new THREE.Scene(); studio.add(new THREE.HemisphereLight(0xffffff,0xb8b0a4,1.5)); { const k=new THREE.DirectionalLight(0xfff4e6,2.4); k.position.set(-4,8,6); studio.add(k); }
const iconCam=new THREE.PerspectiveCamera(26,1,.1,100);
function iconOf(obj,px=160,{yaw=.5,pitch=.32,pad=1.15}={}){
  const o=obj.clone(true); o.position.set(0,0,0); o.rotation.set(0,0,0); o.scale.copy(obj.scale);
  o.traverse(m=>{ m.castShadow=false; }); const g=new THREE.Group(); g.add(o); studio.add(g);
  const bb=new THREE.Box3().setFromObject(g), c=bb.getCenter(new THREE.Vector3()), sz3=bb.getSize(new THREE.Vector3()), r=Math.max(sz3.y,Math.hypot(sz3.x,sz3.z)*.85)/2;
  const d=r*pad/Math.tan(iconCam.fov*Math.PI/360)+Math.hypot(sz3.x,sz3.z)/2; iconCam.position.set(c.x+Math.sin(yaw)*Math.cos(pitch)*d,c.y+Math.sin(pitch)*d,c.z+Math.cos(yaw)*Math.cos(pitch)*d); iconCam.lookAt(c);
  const pr=renderer.getPixelRatio(), cw=canvas.width, ch=canvas.height, sz=Math.min(px,Math.floor(cw/pr),Math.floor(ch/pr));
  GRAY.value=0; renderer.setClearColor(0x000000,0); renderer.setScissorTest(true); renderer.setScissor(0,0,sz,sz); renderer.setViewport(0,0,sz,sz); renderer.clear(); renderer.render(studio,iconCam);
  const out=document.createElement('canvas'); out.width=out.height=Math.round(sz*pr); out.getContext('2d').drawImage(canvas,0,ch-out.height,out.width,out.height,0,0,out.width,out.height);
  renderer.setScissorTest(false); renderer.setViewport(0,0,innerWidth,innerHeight); renderer.setClearColor(PAPER,0); studio.remove(g);
  try{ return out.toDataURL('image/png'); }catch(e){ return ''; }
}

/* ================= CHAPTER PAGE (the frame opens up) ================= */
const lo=$('lensOpen'), loScroll=$('loScroll');
function inset(r,rad=8){ return `inset(${r.t.toFixed(1)}px ${(innerWidth-r.r).toFixed(1)}px ${(innerHeight-r.b).toFixed(1)}px ${r.l.toFixed(1)}px round ${rad.toFixed(1)}px)`; }
function openChapter(){ if(!CHAPTER_PAGE) return;
  if(lensMode||zoneIdx<0) return; const i=zoneIdx, z=ZONES[i], d=DIO[i], X=d.g.position.x;
  const imgs=[ snapshot(new THREE.Vector3(X+5.5,7.4,17),new THREE.Vector3(X,3.0,0),34), snapshot(new THREE.Vector3(X-7,8.5,12),new THREE.Vector3(X,2.2,0),34), snapshot(new THREE.Vector3(X+2.4,3.2,9.5),new THREE.Vector3(X+.3,2.2,0),36) ];
  lensMode='story'; document.body.classList.add('lens-story');
  lo.style.setProperty('--zc',`hsl(${z.hue} 60% 34%)`);
  $('loInner').innerHTML=chapterHTML(i,imgs); bindChapter(i);
  lo.classList.remove('anim','open'); lo.style.clipPath=inset(cardRect(),40*cardRect().w/384); lo.classList.add('show'); lo.getBoundingClientRect();
  lo.classList.add('anim'); lo.style.clipPath='inset(0px 0px 0px 0px round 0px)'; requestAnimationFrame(()=>lo.classList.add('open'));
  loScroll.scrollTop=0; $('loProg').style.width='0'; tone(392,.04,.5); tone(587,.03,.6); hideStory(); follow&&stopFollow();
  ensureSplit(lo); chapterScroll(); setTimeout(()=>{ if(lensMode&&window.ScrollTrigger) ScrollTrigger.refresh(); },1150);
}
function closeChapter(after){
  if(!lensMode){ after&&after(); return; } lo.classList.remove('open'); lo.style.clipPath=inset(cardRect(),40*cardRect().w/384); lensMode=null; document.body.classList.remove('lens-story'); tone(330,.03,.4);
  setTimeout(()=>{ killChapterScroll(); lo.classList.remove('show','anim'); $('loInner').innerHTML=''; if(arrived&&!after) showStory(zoneIdx); after&&after(); },1050);
}
$('loClose').onclick=()=>closeChapter();
const CHAPTER_PAGE=true; /* the Read Full Story page */
const RENDER_OF={0:RENDERS.fort,3:RENDERS.lab,7:RENDERS.metro};
const ARROW=`<svg viewBox="0 0 24 24" fill="none"><use href="#arrowF" fill="currentColor"/></svg>`;   /* the shared arrow path has no fill of its own */
function chapterHTML(i,imgs){
  const z=ZONES[i], nx=ZONES[i+1];
  const num=s=>`${s.raw?s.n:s.n.toLocaleString()}${s.s?`<small>${s.s}</small>`:''}`;
  let end;
  if(z.future) end= unlocked()? `<div class="kick lo-label">Your turn</div><h2>Build the Bengaluru you want.</h2><div class="row"><button class="cta" id="loBuild">✦ Start building ✦</button><button class="ghost glass" id="loBack">Back to the timeline</button></div>`
    : `<div class="kick lo-label">Locked, for now</div><h2>Bring me all 7 stamps.</h2><p style="font-size:18px;color:#555">You have ${stampCount()} of 7.</p><div class="row">${[0,1,2,3,4,5,6].filter(k=>!starred.has(k)).map(k=>`<button class="ghost glass" data-go="${k}">${ZONES[k].year} · ${ZONES[k].block} →</button>`).join('')}</div>`;
  else end=`<div class="kick lo-label">Memory restored</div><h2>The ${z.block} block is yours for 2037.</h2><div class="row"><button class="cta" id="loBack">✦ Back to the timeline ✦</button><button class="ghost glass" id="loVR" data-cursor="VR">Open in VR</button></div>`;
  return `<section class="lo-hero"><img src="${imgs[0]}" alt="${z.year} diorama">
    <div class="lo-hero-txt"><div class="kick">Chapter ${pad(i+1)} - ${z.chapter}</div><div class="lo-year">${z.year}</div><h1 class="lo-title" data-split="word">${z.title}</h1></div><div class="lo-scrollcue kick">Scroll to read ↓</div></section>
  <section class="lo-narr"><div class="kick lo-label">The watch tower remembers</div>${z.story.map(p=>`<p class="scrub" data-split="word">${p}</p>`).join('')}</section>
  <section class="lo-nums">${z.stats.map(s=>`<div class="lo-num"><b data-n="${s.n}" data-s="${s.s}" data-raw="${s.raw?1:0}">0</b><span>${s.l}</span></div>`).join('')}</section>
  <section class="lo-strip"><div class="kick lo-label"><span>Through ${z.year}</span><span>Keep scrolling →</span></div><div class="lo-track" id="loTrack">
    ${RENDER_OF[i]?`<div class="lo-card glass"><img src="${RENDER_OF[i]}" alt="Reference render, ${z.year}" style="object-fit:contain;padding:24px"><div class="cap">Reference render</div></div>`:''}<div class="lo-card glass"><img src="${imgs[1]}" alt=""><div class="cap">Live 3D · ${z.year}</div></div>
    <div class="lo-card glass txt"><div class="kick">The watch tower says</div><q>“${z.summary}”</q>${FACE()}</div>
    <div class="lo-card glass"><img src="${imgs[2]}" alt=""><div class="cap">Up close</div></div>
    <div class="lo-card glass txt"><div class="kick">${z.stats[0].l}</div><b class="big">${num(z.stats[0])}</b><p>${z.stats[1].l}: ${z.stats[1].raw?z.stats[1].n:z.stats[1].n.toLocaleString()}${z.stats[1].s}<br>${z.stats[2].l}: ${z.stats[2].raw?z.stats[2].n:z.stats[2].n.toLocaleString()}${z.stats[2].s}</p></div>
    <div class="lo-card glass txt"><div class="kick">The edge</div><p style="font-family:var(--display);font-weight:500;font-size:clamp(26px,2.4vw,40px);line-height:1.1;color:var(--ink)">${EDGE[i].replace('The Edge: ','')}</p><p>Archive images and captions go here in the final build.</p></div>
  </div></section>
  <section class="lo-end">${end}${nx?`<button class="lo-next" id="loNext"><div><div class="kick">Next STOP · ${nx.year}</div><span>${TEASE[i]}</span></div><div class="arrow glass">${ARROW}</div></button>`:''}</section>`;
}
function bindChapter(i){
  const q=s=>$('loInner').querySelector(s);
  q('#loBack')&&(q('#loBack').onclick=()=>closeChapter());
  q('#loVR')&&(q('#loVR').onclick=()=>closeChapter(()=>{ if(zoneIdx!==i) goTo(i); setTimeout(enterVR, zoneIdx!==i?1200:0); }));   /* secondary CTA: straight into this year's diorama in VR */
  q('#loBuild')&&(q('#loBuild').onclick=()=>closeChapter(()=>enterBuilder()));
  q('#loNext')&&(q('#loNext').onclick=()=>closeChapter(()=>goTo(i+1)));
  $('loInner').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>closeChapter(()=>goTo(+b.dataset.go)));
}
/* ================= SCROLL: Lenis smooth scroll + GSAP ScrollTrigger =================
   Chapter page: Lenis drives the #loScroll container; ScrollTrigger runs the progress bar, hero parallax,
   word-by-word reading scrub, number count-up, pinned horizontal strip and the closing reveal.
   Narrow screens (< 1100px): Lenis smooths the page itself and sections rise in as they enter. */
const GS=()=>window.gsap, STR=()=>window.ScrollTrigger, LEN=()=>window.Lenis;
let chLenis=null, chCtx=null, pageLenis=null, pageCtx=null, gsapReady=false;
function initScrollLibs(){ if(gsapReady||!GS()||!STR()) return gsapReady; GS().registerPlugin(STR()); GS().ticker.add(t=>{ chLenis&&chLenis.raf(t*1000); pageLenis&&pageLenis.raf(t*1000); }); GS().ticker.lagSmoothing(0); gsapReady=true; return true; }
function countUp(sec){ const els=sec.querySelectorAll('[data-n]');
  els.forEach(el=>{ const n=+el.dataset.n, o={v:0}, fmt=v=>(el.dataset.raw==='1'?Math.round(v):(Number.isInteger(n)?Math.round(v).toLocaleString():v.toFixed(2)))+(el.dataset.s?`<small>${el.dataset.s}</small>`:'');
    if(!gsapReady||REDUCED){ el.innerHTML=fmt(n); return; } GS().to(o,{v:n,duration:1.4,ease:'power3.out',onUpdate:()=>el.innerHTML=fmt(o.v)}); }); }
function chapterScroll(){
  const inner=$('loInner'); loScroll.scrollTop=0;
  if(!initScrollLibs()||REDUCED){ /* no libraries or reduced motion: plain scroll, everything shown */
    inner.querySelectorAll('.scrub .-s-word').forEach(w=>w.classList.add('lit')); inner.querySelectorAll('.lo-nums').forEach(countUp);
    loScroll.onscroll=()=>{ const m=Math.max(1,loScroll.scrollHeight-loScroll.clientHeight); $('loProg').style.width=(loScroll.scrollTop/m*100)+'%'; }; return; }
  const gsap=GS(), ScrollTrigger=STR();
  if(LEN()){ chLenis=new (LEN())({wrapper:loScroll,content:inner,lerp:.085,smoothWheel:true,wheelMultiplier:1,autoRaf:false}); chLenis.on('scroll',ScrollTrigger.update); }
  chCtx=gsap.context(()=>{
    const sc={scroller:loScroll};
    gsap.fromTo($('loProg'),{width:'0%'},{width:'100%',ease:'none',scrollTrigger:{...sc,trigger:inner,start:'top top',end:'bottom bottom',scrub:true}});
    gsap.to('.lo-hero img',{yPercent:12,scale:1.08,ease:'none',scrollTrigger:{...sc,trigger:'.lo-hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.lo-hero-txt',{y:-90,autoAlpha:0,ease:'none',scrollTrigger:{...sc,trigger:'.lo-hero',start:'top top',end:'65% top',scrub:true}});
    gsap.to('.lo-scrollcue',{autoAlpha:0,ease:'none',scrollTrigger:{...sc,trigger:'.lo-hero',start:'top top',end:'12% top',scrub:true}});
    gsap.from('.lo-narr .lo-label',{y:30,autoAlpha:0,duration:.8,ease:'power3.out',scrollTrigger:{...sc,trigger:'.lo-narr',start:'top 80%'}});
    gsap.utils.toArray(inner.querySelectorAll('.scrub')).forEach(p=>{
      gsap.to(p.querySelectorAll('.-s-word'),{color:'#1e1e1e',stagger:.1,ease:'none',scrollTrigger:{...sc,trigger:p,start:'top 82%',end:'bottom 48%',scrub:.6}}); });
    const nums=inner.querySelector('.lo-nums');
    if(nums){ gsap.from(nums.querySelectorAll('.lo-num'),{y:60,autoAlpha:0,stagger:.12,duration:.9,ease:'power3.out',scrollTrigger:{...sc,trigger:nums,start:'top 85%'}});
      ScrollTrigger.create({...sc,trigger:nums,start:'top 78%',once:true,onEnter:()=>countUp(nums)}); }
    const tr=$('loTrack');
    if(tr){ const dist=()=>Math.max(0,tr.scrollWidth-innerWidth);
      const skew=gsap.quickTo(tr,'skewX',{duration:.5,ease:'power3'});
      gsap.to(tr,{x:()=>-dist(),ease:'none',scrollTrigger:{...sc,trigger:'.lo-strip',start:'top top',end:()=>'+='+dist(),pin:true,scrub:.8,invalidateOnRefresh:true,
        onUpdate:self=>{ skew(clamp(-self.getVelocity()/400,-5,5)); clearTimeout(tr._sk); tr._sk=setTimeout(()=>skew(0),120); }}});
      gsap.from(tr.querySelectorAll('.lo-card'),{y:90,rotate:1.5,autoAlpha:0,stagger:.08,duration:1,ease:'power3.out',scrollTrigger:{...sc,trigger:'.lo-strip',start:'top 70%'}}); }
    gsap.from(inner.querySelectorAll('.lo-end > *'),{y:50,autoAlpha:0,stagger:.12,duration:.9,ease:'power3.out',scrollTrigger:{...sc,trigger:'.lo-end',start:'top 78%'}});
  },inner);
  ScrollTrigger.refresh();
}
function killChapterScroll(){ loScroll.onscroll=null; if(chCtx){ chCtx.revert(); chCtx=null; } if(chLenis){ chLenis.destroy(); chLenis=null; } }
/* pull down at the very top of a chapter to close it */
let pull=0;
loScroll.addEventListener('wheel',e=>{ if(!lensMode) return; if(loScroll.scrollTop<=1&&e.deltaY<0){ pull+=-e.deltaY; if(pull>170){ pull=0; closeChapter(); } } else pull=0; },{passive:true});
function pageScroll(){
  if(!initScrollLibs()) return; const gsap=GS(), ScrollTrigger=STR(), want=NARROW;
  if(want&&!pageLenis&&LEN()&&!REDUCED){ pageLenis=new (LEN())({lerp:.1,smoothWheel:true,autoRaf:false}); pageLenis.on('scroll',ScrollTrigger.update); }
  if(!want&&pageLenis){ pageLenis.destroy(); pageLenis=null; }
  if(want&&!pageCtx&&!REDUCED){ pageCtx=gsap.context(()=>{
    ['#blkR','#pass','.navrow'].forEach(sel=>gsap.from(sel,{y:40,autoAlpha:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:sel,start:'top 92%'}}));
    gsap.from('#stage',{y:40,duration:1,ease:'power3.out',scrollTrigger:{trigger:'#stage',start:'top 95%'}}); }); }
  if(!want&&pageCtx){ pageCtx.revert(); pageCtx=null; }
  ScrollTrigger.refresh();
}
NARROWQ.addEventListener('change',()=>{ layout(); pageScroll(); });

/* ================= 3D CITY BUILDER ================= */
const TOOLS=[
  {k:'lake',name:'Lake',src:'Gift',col:'#3fb6ff',g:12,l:6,i:0},{k:'heritage',name:'Heritage',src:'1537',col:'#c99a63',g:2,l:7,i:3},
  {k:'tree',name:'Trees',src:'1760',col:'#4fae5c',g:10,l:5,i:0},{k:'power',name:'Power',src:'1905',col:'#2f5bff',g:6,l:3,i:5},
  {k:'labs',name:'Labs',src:'1909',col:'#3fbfb0',g:0,l:3,i:10},{k:'metro',name:'Transit',src:'1940',col:'#a78bfa',g:3,l:8,i:5},
  {k:'tech',name:'Tech park',src:'1985',col:'#7cc4ff',g:-4,l:2,i:12},{k:'startup',name:'Startups',src:'2007',col:'#ff9f6b',g:-1,l:7,i:8}];
function blockModel(k,R=Math.random){ const g=new THREE.Group();
  if(k==='c'){ const h=.2+R()*.42; g.add(at(box(.5,h,.5,0x9a958c,.03),0,h/2,0)); if(R()>.5) g.add(at(box(.3,h*.5,.3,0xa9a499,.03),.06,h+h*.25,.04)); }
  if(k==='lake'){ g.add(at(box(.58,.05,.58,mat(C.water,{rough:.25}),.02),0,.03,0)); g.add(at(box(.4,.02,.4,0x8fd0ef),0,.065,0)); }
  if(k==='heritage'){ g.add(at(watchtower(.42),0,0,0)); }
  if(k==='tree'){ g.add(tree(-.1,-.08,0,.5,R)); g.add(tree(.14,.12,0,.42,R)); }
  if(k==='power'){ g.add(at(box(.04,.14,.04,C.dark),0,.07,0)); g.add(at(box(.48,.03,.34,0x2f5bff),0,.18,0,0,-.5)); }
  if(k==='labs'){ g.add(at(box(.46,.24,.36,C.cream),0,.12,0)); g.add(at(mesh(new THREE.SphereGeometry(.13,12,8,0,Math.PI*2,0,Math.PI/2),mat(0x3fbfb0)),0,.24,0)); }
  if(k==='metro'){ g.add(at(cyl(.035,.04,.32,C.cream,6),0,.16,0)); g.add(at(box(.6,.05,.13,C.cream),0,.34,0)); g.add(at(box(.42,.1,.11,0xa78bfa,.03),0,.42,0)); }
  if(k==='tech'){ g.add(at(box(.3,.95,.3,mat(0x7cc4ff,{rough:.3})),-.06,.475,-.04)); g.add(at(box(.2,.55,.2,0x5b8fd9),.15,.275,.12)); }
  if(k==='startup'){ g.add(at(box(.2,.2,.2,0xff9f6b),-.12,.1,0)); g.add(at(cone(.17,.14,C.terra,4),-.12,.27,0,Math.PI/4)); g.add(at(box(.2,.28,.2,0xb48cff),.13,.14,.05)); g.add(at(cone(.17,.14,0x7c3aed,4),.13,.35,.05,Math.PI/4)); }
  return g; }
const B={grid:[],tool:0,budget:12,placed:0,cells:[],objs:[],visitor:false};
const plotGroup=new THREE.Group(); DIO[7].g.add(plotGroup);
const plateMat=mat(0xe9e4d6), plateHi=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xe8622a,emissiveIntensity:.35,roughness:.8});
for(let k=0;k<42;k++){ const c=k%6, r=Math.floor(k/6); const x=(c-2.5)*plot.cell, z=(r-3)*plot.cell;
  const pl=mesh(new RoundedBoxGeometry(.48,.04,.48,1,.02),plateMat); pl.position.set(x,plot.T+.02,z); pl.userData.cell=k; pl.visible=false; plotGroup.add(pl); B.cells.push(pl); }
function cellPos(k){ return [(k%6-2.5)*plot.cell,plot.T+.04,(Math.floor(k/6)-3)*plot.cell]; }
function bInit(code){ const R=rng(2037); B.grid=Array.from({length:42},()=>R()<.27?'c':''); if(code) code.split('').forEach((ch,k)=>{ const n=+ch; if(k<42) B.grid[k]=n===1?'c':n>=2&&TOOLS[n-2]?TOOLS[n-2].k:''; }); B.placed=B.grid.filter(v=>v&&v!=='c').length; bSync(true); }
function bSync(all){
  B.objs.forEach((o,k)=>{ if(o&&(all||o.userData.kind!==B.grid[k])){ plotGroup.remove(o); B.objs[k]=null; } });
  B.grid.forEach((v,k)=>{ if(v&&!B.objs[k]){ const o=blockModel(v,rng(k*13+7)); const [x,y,z]=cellPos(k); o.position.set(x,y,z); o.userData.kind=v; o.userData.pop=0; o.scale.setScalar(.01); o.traverse(m=>{ if(m.isMesh) m.userData.cell=k; }); plotGroup.add(o); B.objs[k]=o; } });
}
const cityBuilt=()=>B.grid.some(v=>v&&v!=='c');
function bScore(){ let g=20,l=35,i=60; B.grid.forEach(v=>{ const t=TOOLS.find(t=>t.k===v); if(t){ g+=t.g; l+=t.l; i+=t.i; } }); return {g:clamp(g,0,100),l:clamp(l,0,100),i:clamp(i,0,100)}; }
function bCode(){ return B.grid.map(v=>v===''?0:v==='c'?1:TOOLS.findIndex(t=>t.k===v)+2).join(''); }
function bRender(){ const s=bScore(); [['g',s.g],['l',s.l],['i',s.i]].forEach(([k,v])=>{ $('b'+k).style.width=v+'%'; $('m'+k).textContent=v; }); $('bbud').innerHTML=`<b>${B.budget-B.placed}</b>blocks left`; $('bDone').disabled=B.placed<5; }
$('bpal').innerHTML=TOOLS.map((t,k)=>`<button class="tool glass ${k===0?'on':''}" data-k="${k}"><i style="background:${t.col}"></i>${t.name}<small>${t.src==='Gift'?'Gift':'✦ '+t.src}</small></button>`).join('');
$('bpal').querySelectorAll('.tool').forEach(b=>b.onclick=()=>{ B.tool=+b.dataset.k; $('bpal').querySelectorAll('.tool').forEach(x=>x.classList.toggle('on',x===b)); tone(700,.03,.1); });
$('bReset').onclick=()=>{ bInit(); bRender(); };
$('bDone').onclick=()=>bResult();
$('bExit').onclick=()=>exitBuilder();
function setFutureVisible(v){ DIO[7].pieces.forEach((p,k)=>{ if(k>0) p.obj.visible=v; }); }
function enterBuilderOld(code){
  if(building) return; if(vrMode) exitVR(); stopFollow(); building=true; document.body.classList.add('building'); hideStory();
  if(zoneIdx!==7){ fx=snapT=restX=stopX(7); phase='rest'; zoneIdx=7; arrived=true; }
  setFutureVisible(false); B.cells.forEach(c=>c.visible=true);
  B.visitor=!!code&&!unlocked(); if(!B.grid.length||code) bInit(code);
  bRender(); whoosh(); if(!code) setTimeout(()=>toast('Every block here is one you earned. The lake is my gift.'),900);
}
function exitBuilderOld(){ if(!building) return; building=false; document.body.classList.remove('building'); $('bres').classList.remove('show'); B.cells.forEach(c=>c.visible=false); if(!cityBuilt()) setFutureVisible(true); if(arrived&&zoneIdx===7) showStory(7); }
function bTap(k){ const v=B.grid[k], t=TOOLS[B.tool];
  if(v==='c'){ tone(200,.03,.12); return; }
  if(v){ B.grid[k]=''; B.placed--; tone(300,.04,.12); }
  else { if(B.placed>=B.budget){ toast("That's all 12 blocks. Tap one of yours to swap it, or name your city."); return; } B.grid[k]=t.k; B.placed++; tone(520+B.tool*60,.05,.16); const [x,y,z]=cellPos(k); spawnBurst(stopX(7)+x*1.3,(y+.3)*1.3,z*1.3,10,150,.3); }
  bSync(false); bRender(); }
function bResult(fromLink){
  const s=bScore(), cnt=k=>B.grid.filter(v=>v===k).length; let name,line;
  if(s.g>=60&&s.l>=60&&s.i>=60){ name='Garden + Tech City'; line="Both. You found it. Lakes and labs, side by side. I've waited 500 years for this."; }
  else if(cnt('lake')>=4){ name='The City of Lakes, reborn'; line='You gave my tanks back to the city. Kempegowda would recognise this place.'; }
  else if(s.g>=s.l&&s.g>=s.i){ name='The Garden City returns'; line="Green again, the way Hyder Ali's garden started it. I can breathe up here."; }
  else if(s.i>=s.l){ name='Silicon City 2.0'; line="Busy, bright and building. Just don't forget to leave room for the trees."; }
  else { name='The city people love living in'; line='Homes, trains, old stones kept safe. A city made for people first.'; }
  const lab={lake:'lake',heritage:'heritage site',tree:'grove',power:'solar field',labs:'lab',metro:'metro line',tech:'tech park',startup:'startup street'};
  const facts=TOOLS.map(t=>{ const n=cnt(t.k); return n?`${n} ${lab[t.k]}${n>1?'s':''}`:null; }).filter(Boolean).join(' · ');
  B.objs.forEach(o=>{ if(o){ o.userData.pop=1; o.scale.setScalar(1); } });
  const X=stopX(7), img=snapshot(new THREE.Vector3(X+6,8.6,10.5),new THREE.Vector3(X,1.3,0),32);
  $('resIn').innerHTML=`<img src="${img}" alt="Your 2037 Bengaluru, rendered"><div><span class="kick">Bengaluru · 2037 · built by ${B.visitor?'a visitor':'you'}</span><h5>${name}</h5><p>“${line}”</p><div class="facts">${facts||'A quiet city.'}<br>Green ${s.g} · Liveable ${s.l} · Innovation ${s.i}</div>
    <div class="row">${B.visitor?`<button class="cta" id="rOwn">✦ Build your own ✦</button>`:`<button class="ghost glass" id="rEdit">Keep building</button><button class="cta" id="rShare">✦ Share my city ✦</button>`}<button class="ghost glass" id="rBack">Back to the timeline</button></div></div>`;
  $('bres').classList.add('show'); chord(); spawnBurst(X,2.5,0,90,150,2.5);
  const q=id=>$(id); q('rEdit')&&(q('rEdit').onclick=()=>$('bres').classList.remove('show'));
  q('rShare')&&(q('rShare').onclick=()=>{ try{ location.hash='city-'+bCode(); }catch(e){} toast('Your city now has its own link. Copy this page’s link to share it.'); });
  q('rOwn')&&(q('rOwn').onclick=()=>{ $('bres').classList.remove('show'); exitBuilder(); B.grid=[]; bSync(true); setFutureVisible(true); goTo(0); });
  q('rBack').onclick=()=>exitBuilder();

}

/* ================= INPUT ================= */
let down=null, camDist=30;
const ppu=()=>innerHeight/(2*camDist*Math.tan(camera.fov*Math.PI/360));
function startDown(e,src){ if(!started||lensMode||obBusy()||BODY.classList.contains('lamp')) return; if(e.button&&e.button!==0) return; down={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,fx0:fx,drag:false,src}; try{ e.currentTarget.setPointerCapture(e.pointerId); }catch(_){} }
canvas.addEventListener('pointerdown',e=>startDown(e,'world'));
$('cardF').addEventListener('pointerdown',e=>{ if(!NARROW||e.target.closest('button')) return; startDown(e,'world'); });
$('hL').addEventListener('pointerdown',e=>{ e.stopPropagation(); startDown(e,'hL'); });
$('hR').addEventListener('pointerdown',e=>{ e.stopPropagation(); startDown(e,'hR'); });
addEventListener('pointermove',e=>{ if(!down) return;
  if(vrMode){ VR.ty-=(e.clientX-down.lx)*.006; VR.tp=clamp(VR.tp+(e.clientY-down.ly)*.004,.05,1.25); down.lx=e.clientX; down.ly=e.clientY; down.drag=true; return; }
  if(!down.drag&&NARROW&&Math.abs(e.clientY-down.y)>Math.abs(e.clientX-down.x)+4){ down=null; return; }
  if(!down.drag&&Math.abs(e.clientX-down.x)>6&&!building){ down.drag=true; phase='drag'; markDragged(); stopFollow(); }
  if(down.drag) dragT=clamp(down.fx0+(e.clientX-down.x)/ppu(),START-1,stopX(N-1)+1); });
canvas.addEventListener('pointermove',()=>{ pointerOnCanvas=true; });
canvas.addEventListener('pointerleave',()=>{ pointerOnCanvas=false; });
const endPtr=e=>{ if(!down) return; const d=down; down=null;
  if(vrMode) return;
  if(d.drag){ releaseSnap(d.fx0); return; }
  if(d.src==='hL'||d.src==='hR'){ markDragged(); stopFollow(); const cur=arrived?zoneIdx:(fx<0?-1:nearest(fx)); if(d.src==='hR') goTo(Math.min(N-1,cur+1)); else if(cur>0) goTo(cur-1); return; }
  if(building){ const hit=pick(e.clientX,e.clientY,[...B.cells,...B.objs.filter(Boolean)]); if(hit){ let o=hit.object; while(o&&o.userData.cell==null) o=o.parent; if(o) bTap(o.userData.cell); } return; }
  clickWorld(e.clientX,e.clientY); };
addEventListener('pointerup',endPtr); addEventListener('pointercancel',()=>{ if(down&&down.drag&&!vrMode) releaseSnap(down.fx0); down=null; });
let wheelAcc=0;
canvas.addEventListener('wheel',e=>{ if(!started||lensMode||building) return; e.preventDefault();
  if(vrMode){ VR.td=clamp(VR.td+e.deltaY*.012,7,26); return; }
  if(tlLenis||NARROW||obBusy()) return;          /* Lenis owns the wheel; this is only the no-Lenis fallback */
  const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY; wheelAcc+=d; clearTimeout(wheelIdle); wheelIdle=setTimeout(()=>wheelAcc=0,180);
  if(Math.abs(wheelAcc)>80&&phase!=='snap'){ const dir=Math.sign(wheelAcc); wheelAcc=0; markDragged(); stopFollow(); snapT=dirTarget(dir); phase='snap'; } },{passive:false});

/* ================= SNAP: GSAP settles the frame on a stop ================= */
const SNAP={o:{x:0},tw:null,to:null};
function snapTween(target){ const g=window.gsap; if(!g) return false;
  if(SNAP.tw) SNAP.tw.kill(); SNAP.o.x=fx; SNAP.to=target;
  const stops=Math.abs(target-fx)/SP, fling=Math.abs(vx)>.1;
  SNAP.tw=g.to(SNAP.o,{x:target,duration:REDUCED?.001:clamp(.62+Math.sqrt(stops)*.5,.6,2.1),ease:fling?'expo.out':'power3.inOut',overwrite:true,onComplete:()=>{ SNAP.tw=null; }});
  return true; }
function killSnap(){ if(SNAP.tw){ SNAP.tw.kill(); SNAP.tw=null; } SNAP.to=null; }
const settleStop=x=>x< -SP*.35?START:stopX(nearest(x));
/* the next stop in the direction of travel (left of 1537 is the Watchtower's own spot) */
function dirTarget(dir){ const a=fx/SP; const i=dir>0?Math.floor(a+.002)+1:Math.ceil(a-.002)-1; return i<0?START:stopX(Math.min(N-1,i)); }
/* release after a drag: a tiny nudge settles back, anything more goes to the next stop that way */
function releaseSnap(fx0){ const moved=fx-fx0, fast=Math.abs(vx)>.06;
  snapT=(!fast&&Math.abs(moved)<.8)?settleStop(fx0):dirTarget(fast?Math.sign(vx):Math.sign(moved)); phase='snap'; }

/* ================= WHEEL / TRACKPAD: Lenis smooths the gesture, GSAP settles it ================= */
const WPX=14, tlMin=START-1, tlMax=()=>stopX(N-1)+1, xToPx=x=>(x-tlMin)*WPX;
let tlLenis=null, wheelX=0, wheelIdle=null, wheelDir=0, wheelFrom=0, wheelLock=false, wheelLockT=null;
function syncLenis(){ if(!tlLenis) return; tlLenis.scrollTo(xToPx(fx),{immediate:true,force:true}); }
function wheelSettle(){ if(phase!=='wheel') return; const moved=fx-wheelFrom;
  snapT=Math.abs(moved)<.6?settleStop(wheelFrom):dirTarget(wheelDir||Math.sign(moved)); phase='snap';
  wheelLock=true; clearTimeout(wheelLockT); wheelLockT=setTimeout(()=>wheelLock=false,240); }
function initTimelineLenis(){ const Len=window.Lenis; if(tlLenis||!Len) return;
  const wrap=document.createElement('div'), track=document.createElement('div');
  Object.assign(wrap.style,{position:'fixed',left:'0',top:'0',width:'200px',height:'8px',overflow:'hidden',opacity:'0',pointerEvents:'none',zIndex:'-1'});
  Object.assign(track.style,{width:(200+xToPx(tlMax()))+'px',height:'8px'}); wrap.appendChild(track); document.body.appendChild(wrap);
  tlLenis=new Len({wrapper:wrap,content:track,eventsTarget:canvas,orientation:'horizontal',gestureOrientation:'both',smoothWheel:true,lerp:.1,wheelMultiplier:1,syncTouch:false,autoRaf:false,
    virtualScroll:({deltaX,deltaY,event})=>{
      if(!event.type.includes('wheel')||event.ctrlKey) return false;
      if(!started||lensMode||building||vrMode||NARROW||obBusy()||down) return false;
      const d=Math.abs(deltaY)>Math.abs(deltaX)?deltaY:deltaX; if(!d) return false;
      if(wheelLock){ event.preventDefault(); clearTimeout(wheelLockT); wheelLockT=setTimeout(()=>wheelLock=false,240); return false; }
      if(phase!=='wheel'){ killSnap(); syncLenis(); wheelX=wheelFrom=fx; phase='wheel'; markDragged(); stopFollow(); }
      wheelDir=Math.sign(d); clearTimeout(wheelIdle); wheelIdle=setTimeout(wheelSettle,150); return true; } });
  tlLenis.on('scroll',l=>{ if(phase==='wheel') wheelX=clamp(tlMin+l.animatedScroll/WPX,tlMin,tlMax()); });
  if(window.gsap) gsap.ticker.add(t=>tlLenis&&tlLenis.raf(t*1000)); else (function r(t){ tlLenis.raf(t); requestAnimationFrame(r); })(performance.now());
  syncLenis(); }
addEventListener('keydown',e=>{ if(!started||obBusy()||BODY.classList.contains('assist')) return;
  if(e.key==='Escape'){ if($('panel').classList.contains('open')) $('panel').classList.remove('open'); else if(vrMode) exitVR(); else if(lensMode) closeChapter(); else if($('bres').classList.contains('show')) $('bres').classList.remove('show'); else if(building) exitBuilder(); return; }
  if(lensMode||building||vrMode||BODY.classList.contains('lamp')||BODY.classList.contains('bld2')) return;
  const cur=arrived?zoneIdx:(fx<0?-1:nearest(fx));
  if(e.key==='ArrowRight'){ stopFollow(); goTo(Math.min(N-1,cur+1)); } else if(e.key==='ArrowLeft'){ stopFollow(); goTo(Math.max(0,cur-1)); }
  else if((e.key==='ArrowDown'||e.key==='Enter')&&arrived&&!e.target.closest('button,input')){ e.preventDefault(); openChapter(); }
 });

/* ================= FOLLOW VIEW (the Watchtower gives the tour) ================= */
let follow=false, followT=null;
function scheduleFollow(){ clearTimeout(followT); followT=setTimeout(()=>{ if(!follow||lensMode||building||vrMode||!arrived) return; if(zoneIdx<N-1) goTo(zoneIdx+1); else stopFollow(); },7500); }
function startFollow(){ follow=true; $('btnFollow').classList.add('on'); $('btnFollow').setAttribute('aria-pressed','true'); toast('Follow View is on. I’ll take you through every stop.'); if(arrived&&phase==='rest') scheduleFollow(); else goTo(Math.max(0,arrived?zoneIdx:nearest(Math.max(0,fx)))); }
function stopFollow(){ if(!follow) return; follow=false; clearTimeout(followT); $('btnFollow').classList.remove('on'); $('btnFollow').setAttribute('aria-pressed','false'); }
$('btnFollow').onclick=()=>{ if(!started) return; follow?stopFollow():startFollow(); };

/* ================= VR VIEW (step inside the diorama) ================= */
let vrMode=false; const VR={yaw:.5,pitch:.4,dist:15,ty:.5,tp:.4,td:15};
function enterVR(){ if(!started||building||lensMode) return; if(!arrived||zoneIdx<0) return toast('Slide the frame onto a year first.');
  vrMode=true; stopFollow(); VR.yaw=VR.ty=.15; VR.pitch=VR.tp=.32; VR.dist=VR.td=15; document.body.classList.add('vrmode'); whoosh(); }
function exitVR(){ if(!vrMode) return; vrMode=false; document.body.classList.remove('vrmode'); }
$('btnVR').onclick=()=>{ if(started) enterVR(); }; $('vrExit').onclick=exitVR;

/* ================= HUD ================= */
function toast(t){ const el=$('toast'); el.textContent=t; el.classList.add('show'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),3400); }
/* Begin Again: clear the stamps and return to the plain "Drag me to begin the journey" frame */
function beginAgain(){ if(obBusy()) return; $('panel').classList.remove('open'); closeAssist(); $('bres')&&$('bres').classList.remove('show');
  if(building) exitBuilder(); if(vrMode) exitVR(); stopFollow(); killSnap(); hideStory(); down=null;
  starred.clear(); seen.clear(); F.allAnn=false; pendingStamp=-1; arrived=false; zoneIdx=-1; fx=snapT=dragT=restX=0; vx=0; phase='rest'; camLook.x=0; syncLenis();
  updatePassport(); OB.p=0; obDragVis(0); bc('ob-drag',true); tone(440,.04,.3);
  const g=window.gsap; if(g&&!REDUCED) g.from('#obCard .ob-plain',{y:24,autoAlpha:0,duration:.8,ease:'power3.out'}); }
$('btnBegin')&&($('btnBegin').onclick=beginAgain);   /* the Begin Again button was removed from the header */
$('btnNotes').onclick=()=>$('panel').classList.add('open'); $('panelX').onclick=()=>$('panel').classList.remove('open');
$('btnShare').onclick=async()=>{ const y=zoneIdx>=0?ZONES[zoneIdx].year:null; let url=location.href.split('#')[0]+(y?'#stop-'+y:'');
  try{ if(y) history.replaceState(null,'','#stop-'+y); }catch(e){}
  const data={title:'Where does Bengaluru Ends?',text:y?`${y}: ${ZONES[zoneIdx].title}. 500 years in 5.8 m, told by the Watchtower.`:'500 years in 5.8 m, told by the Watchtower.',url};
  if(navigator.share){ try{ await navigator.share(data); return; }catch(e){ if(e&&e.name==='AbortError') return; } }
  try{ await navigator.clipboard.writeText(url); toast('Link copied.'); }catch(e){ toast('Copy this link: '+url); } };
const helpDlg=$('helpDlg'); $('btnHelp').onclick=()=>{ try{ helpDlg.showModal(); }catch(e){ helpDlg.setAttribute('open',''); } }; $('helpClose').onclick=()=>helpDlg.close();
$('btnUnlockAll').onclick=()=>{ [0,1,2,3,4,5,6].forEach(i=>starred.add(i)); F.allAnn=true; updatePassport(); $('panel').classList.remove('open'); if(arrived) showStory(zoneIdx); setTimeout(()=>say('All 7 stamps, just like that. 2037 is open.',[['Take me to 2037',()=>goTo(7)]]),700); };
$('mascot').onclick=()=>{ if(started) hint(); };
function hint(){ if(!started||lensMode) return;
  if(!arrived) return say('Drag the frame onto a year. Its memory will come back together.',[['Take me to 1537',()=>goTo(0)]]);
  const z=ZONES[zoneIdx]; if(z.future) return unlocked()? say('2037 is open. Build the city you want.',[['Start building',()=>enterBuilder()]]) : say(`2037 needs all 7 stamps. You have ${stampCount()}.`);
  return say(`Next: ${z.tease}`,[['Take me there',()=>goTo(zoneIdx+1)]]); }

/* cursor */
const cur=$('cur'), ring=$('ring'); let rx=-100, ry=-100, hoverPiece=null;
/* two concentric circles (outline ring + small filled dot) on open ground; the normal hand near the
   frame, its arrows and anything clickable; the normal cursor inside overlays */
function cursorMode(t){
  const overlay=BODY.classList.contains('bld2')||BODY.classList.contains('lamp')||!!lensMode||obBusy();
  const clickable=t&&t.closest&&t.closest('button,a,input,textarea,select,label,[role="button"],[tabindex="0"],.handle');
  let near=false; if(!vrMode&&!overlay){ const r=cardRect(), m=28*r.w/384; near=mx>r.l-m&&mx<r.r+m&&my>r.t-m&&my<r.b+m; }
  bc('cur-custom',!overlay&&!clickable&&!near); canvas.style.cursor=near?'pointer':''; }
addEventListener('pointermove',e=>{ mx=e.clientX; my=e.clientY; const tr=`translate(${mx}px,${my}px)`; cur.style.transform=tr; ring.style.transform=tr; rx=mx; ry=my; cursorMode(e.target); },{passive:true});
function cursorLabel(){
  const el=document.elementFromPoint(mx,my); let lab='';
  if(el&&el!==canvas){ const t=el.closest&&el.closest('[data-cursor]'); lab=t?t.dataset.cursor:''; hoverPiece=null; }
  else if(started&&!lensMode){ if(vrMode) lab='Look'; else if(building){ const h=pick(mx,my,B.cells); lab=h?'Place':''; } else { const h=pick(mx,my,dioMeshes()); const j=h?h.object.userData.dio:null; hoverPiece=j!=null?j:null; lab=j!=null?((arrived&&j===zoneIdx)?'Read':'Go'):(phase==='drag'?'':'Drag'); } }
  /* no text labels on the cursor any more */
}

/* ================= DEEP LINKS ================= */
function jump(i){ startExperience(true); markDragged(); fx=snapT=dragT=stopX(i); camLook.x=fx; restX=START; phase='snap'; }
function handleHash(){ const h=decodeURIComponent(location.hash.slice(1));
  let m=h.match(/^stop-(\d{4})$/); if(m){ const i=ZONES.findIndex(z=>z.year===+m[1]); if(i>=0){ jump(i); return true; } }
  { const mb=h.match(/^build-((?:[0-9a-o][0-6]){1,7})$/); if(mb){ startExperience(true); enterBuilder(mb[1]); return true; } }
  m=h.match(/^city-([0-9]{42})$/); if(m){ startExperience(true); markDragged(); fx=snapT=dragT=restX=stopX(7); camLook.x=fx; phase='rest'; zoneIdx=7; arrived=true; const code=m[1]; enterBuilder(code); setTimeout(()=>bResult(true),900); return true; }
  return false; }
addEventListener('hashchange',()=>{ const h=location.hash; if(h.startsWith('#stop-')&&zoneIdx>=0&&ZONES[zoneIdx].year===+h.slice(6)) return; if(h.startsWith('#city-')&&building) return; closeChapter(()=>handleHash()); });

/* ================= ONBOARDING =================
   Figma flow (node 32:1599): 01 landing → 6 coach marks → mission → drag to start → revealed chapter.
   The coach marks, mission and drag screen sit on top of the existing experience; the revealed chapter hands off to it. */
function startExperience(fromLink){ if(started) return; started=true; document.body.classList.add('has-launcher'); updatePassport(); }
const LS={ get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }, set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} } };
const OB_KEY='wdbe.onboarding.done';
const OB={ static:false, coach:-1, dragging:null, p:0 };
const BODY=document.body, bc=(c,on)=>BODY.classList.toggle(c,on);
const obBusy=()=>['ob-landing','ob-coach','ob-mission','ob-drag'].some(c=>BODY.classList.contains(c));
/* the chapter underneath the coach marks and after the drag: 1537, stamp 1 of 7, the supplied diorama in the frame */
function revealState(){ fx=snapT=dragT=restX=0; vx=0; camLook.x=0; camPos.x=0; phase='rest'; zoneIdx=0; arrived=true; seen.add(0); starred.add(0); OB.static=true; bc('ob-static',true); updatePassport(); }
function endStatic(){ if(!OB.static) return; OB.static=false; bc('ob-static',false); }
/* 01 · landing */
function obLanding(){ bc('ob-landing',true); const L=$('landing'); const go=()=>{ if(REDUCED){ L.querySelectorAll('.ld-in,.ld-fade').forEach(e=>{ e.style.opacity=1; e.style.transform='none'; }); return; } L.classList.add('play'); };
  const img=$('ldBg'); if(img.complete) go(); else { img.onload=go; setTimeout(go,1500); } }
$('ldCta').onclick=()=>{ const L=$('landing'); L.classList.add('out'); tone(520,.04,.4);
  setTimeout(()=>{ bc('ob-landing',false); L.classList.remove('out'); if(LS.get(WT_KEY)!=='1') wtStart(wtAfter); else wtAfter(); },600); };
/* ================= FIRST-TIME WALKTHROUGH (Figma 79:3307) =================
   Four coach marks over the real page: an 80% black mask with transparent cutouts, white dashed
   connectors and centred text. Every tap advances one step (Skip closes it). The tour only changes
   what is shown; it never touches stamps, the timeline position or any other progress. */
const WT_KEY='wdbe.walkthrough.done';
/* ref = the target's box in the 1440 × 900 Figma frame, hole = the cutout around it */
const TOUR=[
  { h:'Brief story', d:'Gives you an Idea about the time stamp, tells you a story of achievement.', scene:'chapter', route:'brief',
    holes:[{sel:'#blkL',ref:[60,324,355,252],hole:[31,299,409,326],r:60},{sel:'#blkR',ref:[1025,333,355,270],hole:[995,299,391,326],r:60}] },
  { h:'Timeline stamps', d:'You can visit every timeline and unlock time stamps.', scene:'intro', route:'stamps',
    holes:[{sel:'#pass',ref:[377,804,687,82],hole:[376.5,804,688,82],r:'pill'}] },
  { h:'Read full story', d:'You get access to every details and memory of the time zone.', scene:'chapter', route:'read',
    holes:[{sel:'#btnRead',ref:[604,732,292,48],hole:[592,720,320,72],r:'pill',ring:true}] },
  { h:'Virtual Reality (VR)', d:'Experience the time zone in 3d verse. An Immersive experience.', scene:'chapter', route:'vr',
    holes:[{sel:'#btnVR',ref:[544,732,48,48],hole:[531,720,72,72],r:'pill',ring:true}] } ];
const wt={ i:-1, raf:0, last:'', after:null };
function rr(x,y,w,h,r){ r=Math.min(r,w/2,h/2); return `M${x+r} ${y}H${x+w-r}A${r} ${r} 0 0 1 ${x+w} ${y+r}V${y+h-r}A${r} ${r} 0 0 1 ${x+w-r} ${y+h}H${x+r}A${r} ${r} 0 0 1 ${x} ${y+h-r}V${y+r}A${r} ${r} 0 0 1 ${x+r} ${y}Z`; }
/* artboard scale: 1 at the 1440 reference, the artboard's own scale elsewhere, 1 in the stacked phone layout */
const wtK=()=>NARROW?1:($('artF').getBoundingClientRect().width/1440||1);
/* cutout from the element's live bounds plus the reference padding around it */
function wtHole(o,k){ const el=document.querySelector(o.sel); if(!el) return null; const b=el.getBoundingClientRect(); if(!b.width) return null;
  const [rx,ry,rw,rh]=o.ref, [hx,hy,hw,hh]=o.hole, L=rx-hx, T=ry-hy, R=(hx+hw)-(rx+rw), B=(hy+hh)-(ry+rh);
  const x=b.left-L*k, y=b.top-T*k, w=b.width+(L+R)*k, h=b.height+(T+B)*k; return {x,y,w,h,r:o.r==='pill'?h/2:o.r*k,el:b,ring:!!o.ring}; }
/* orthogonal connector with round corners (Figma corner radius 40) */
function wtPath(pts,r){ let d=`M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for(let i=1;i<pts.length-1;i++){ const [px,py]=pts[i-1], [x,y]=pts[i], [nx,ny]=pts[i+1];
    const l1=Math.hypot(x-px,y-py), l2=Math.hypot(nx-x,ny-y), rc=Math.max(0,Math.min(r,l1/2,l2/2)); if(!l1||!l2){ continue; }
    const ax=x-(x-px)/l1*rc, ay=y-(y-py)/l1*rc, bx=x+(nx-x)/l2*rc, by=y+(ny-y)/l2*rc, cr=(x-px)*(ny-y)-(y-py)*(nx-x);
    d+=`L${ax.toFixed(1)} ${ay.toFixed(1)}A${rc.toFixed(1)} ${rc.toFixed(1)} 0 0 ${cr>0?1:0} ${bx.toFixed(1)} ${by.toFixed(1)}`; }
  const e=pts[pts.length-1]; return d+`L${e[0].toFixed(1)} ${e[1].toFixed(1)}`; }
const wtDot=(x,y,r)=>`<circle class="mk" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}"/>`;
const wtDia=(x,y,r)=>`<path class="mk" d="M${x.toFixed(1)} ${(y-r).toFixed(1)}L${(x+r).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y+r).toFixed(1)}L${(x-r).toFixed(1)} ${y.toFixed(1)}Z"/>`;
function wtLayout(){ if(wt.i<0) return; const st=TOUR[wt.i], W=innerWidth, H=innerHeight, k=wtK(), narrow=NARROW;
  bc('wt-narrow',narrow);
  const holes=st.holes.map(o=>wtHole(o,k)).filter(Boolean);
  /* text block: the Figma spot (473, 357) on desktop; on phones it sits in the half away from the target */
  const tx=$('wtText'); let gx, gy, gw, gs;
  if(!narrow){ const a=$('artF').getBoundingClientRect(); gs=k; gw=493*k; gx=a.left+473*k; gy=a.top+357*k; tx.style.width='493px'; }
  else { gs=1; gw=Math.min(493,W-32); gx=(W-gw)/2; tx.style.width=gw+'px'; const th=tx.offsetHeight||200, vis=holes.filter(h=>h.y+h.h>0&&h.y<H);
    /* phones: the text goes in the free space above or below the visible target, never over it */
    if(vis.length){ const top=Math.min(...vis.map(h=>h.y)), bot=Math.max(...vis.map(h=>h.y+h.h)), gap=56;
      gy=top-gap-th>=16?top-gap-th:(H-bot-gap-th>=16?bot+gap:Math.max(16,(H-th)/2)); } else gy=(H-th)/2; }
  tx.style.transform=`translate(${gx.toFixed(1)}px,${gy.toFixed(1)}px) scale(${gs.toFixed(4)})`;
  const cx=gx+gw/2, ky=gs, sw=Math.max(1.5,2*ky), dash=`${(8*ky).toFixed(2)} ${(8*ky).toFixed(2)}`, RC=40*ky, md=5*ky, mdd=5*ky, clX=x=>clamp(x,10,W-10);
  /* connectors, reproduced from the Figma vectors and re-anchored to the live targets */
  let lines='', marks='';
  const P=(pts)=>{ lines+=`<path d="${wtPath(pts,RC)}" stroke-width="${sw.toFixed(2)}" stroke-dasharray="${dash}"/>`; };
  if(narrow){ const th=tx.offsetHeight||200;
    holes.filter(h=>h.y+h.h>0&&h.y<H).forEach(h=>{ const above=gy+th<=h.y, S=above?[cx,gy+th+12]:[cx,gy-12], E=[clX(h.x+h.w/2),above?h.y:h.y+h.h], mid=(S[1]+E[1])/2;
      P(Math.abs(S[0]-E[0])<2?[S,[S[0],E[1]]]:[S,[S[0],mid],[E[0],mid],E]); marks+=wtDot(S[0],S[1],md)+wtDia(E[0],E[1],mdd); }); }
  else if(st.route==='brief'&&holes.length===2){ const [l,r]=holes, S=[cx-6*ky,gy-26*ky];
    const e1=[l.x+l.w*(195/409),l.y], e2=[r.x+r.w*(193/391),r.y], y1=Math.min(e1[1]-80*ky,S[1]-30*ky), y2=Math.min(e2[1]-81*ky,S[1]-30*ky);
    P([S,[S[0],y1],[e1[0],y1],e1]); P([S,[S[0],y2],[e2[0],y2],e2]); marks+=wtDot(S[0],S[1],md)+wtDia(e1[0],e1[1],mdd)+wtDia(e2[0],e2[1],mdd); }
  else if(holes.length){ const h=holes[0], hy=gy+12*ky;
    if(st.route==='stamps'){ const S=[cx+123*ky,hy], E=[h.x+h.w,h.y+h.h/2], X=clX(Math.max(E[0],S[0])+67*ky); P([S,[X,S[1]],[X,E[1]],E]); marks+=wtDot(S[0],S[1],md)+wtDia(E[0],E[1],mdd); }
    if(st.route==='read'){ const S=[cx+117*ky,hy], E=[h.x+h.w,h.y+h.h*(40/72)], X=clX(Math.max(E[0],S[0])+116*ky); P([S,[X,S[1]],[X,E[1]],E]); marks+=wtDot(S[0],S[1],md)+wtDia(E[0],E[1],mdd); }
    if(st.route==='vr'){ const S=[cx-137*ky,hy], E=[h.x,h.y+h.h*(40/72)], X=clX(Math.min(E[0],S[0])-116*ky); P([S,[X,S[1]],[X,E[1]],E]); marks+=wtDot(S[0],S[1],md)+wtDia(E[0],E[1],mdd); } }
  const mask=`M0 0H${W}V${H}H0Z`+holes.map(h=>rr(h.x,h.y,h.w,h.h,h.r)).join('');
  /* the light surround kept around a highlighted button (the gap between the button and its cutout) */
  const ring=holes.filter(h=>h.ring).map(h=>rr(h.x,h.y,h.w,h.h,h.r)+rr(h.el.left,h.el.top,h.el.width,h.el.height,h.el.height/2)).join('');
  const key=mask+ring+lines+marks; if(key===wt.last) return; wt.last=key;
  $('coachPath').setAttribute('d',mask); $('wtRing').setAttribute('d',ring); $('wtLines').innerHTML=lines+marks; }
function wtLoop(){ if(wt.i<0){ wt.raf=0; return; } wtLayout(); wt.raf=requestAnimationFrame(wtLoop); }
/* what sits under each step: the intro frame or the 1537 chapter, shown without any progress */
function wtScene(sc){
  if(sc==='intro'){ hideStory(); bc('ob-static',false); bc('wt-intro',true); OB.p=0; obDragVis(0); }
  else { bc('wt-intro',false); bc('ob-static',true); fillBlocks(0); clearTimeout(storyTimer); BLKS().forEach(b=>b.classList.add('in')); }
  if(NARROW){ const t=document.querySelector(TOUR[wt.i].holes[0].sel); if(t){ const dy=t.getBoundingClientRect().top-innerHeight*.5;
      if(pageLenis) pageLenis.scrollTo(pageLenis.scroll+dy,{immediate:true,force:true}); else (document.scrollingElement||document.documentElement).scrollBy(0,dy); } } }
function wtShow(i){ wt.i=i; const st=TOUR[i]; const co=$('coach');
  const apply=()=>{ $('wtHead').textContent=st.h; $('wtDesc').textContent=st.d; wtScene(st.scene); wt.last=''; wtLayout(); co.classList.remove('swap'); };
  if(REDUCED||!BODY.classList.contains('wt-on')) apply(); else { co.classList.add('swap'); setTimeout(apply,170); } }
function wtStart(after){ wt.after=after; bc('has-launcher',true); bc('ob-coach',true); if(pageLenis) pageLenis.stop();
  wtShow(0); requestAnimationFrame(()=>bc('wt-on',true)); const co=$('coach'); co.focus({preventScroll:true}); if(!wt.raf) wt.raf=requestAnimationFrame(wtLoop); }
function wtNext(){ if(wt.i<0||BODY.classList.contains('wt-closing')) return; if(wt.i>=TOUR.length-1) return wtClose(); tone(560,.03,.2); wtShow(wt.i+1); }
function wtClose(){ if(wt.i<0) return; LS.set(WT_KEY,'1'); bc('wt-closing',true);
  setTimeout(()=>{ wt.i=-1; bc('ob-coach',false); bc('wt-on',false); bc('wt-closing',false); bc('wt-intro',false); bc('wt-narrow',false);
    hideStory(); bc('ob-static',false); OB.static=false; $('coach').classList.remove('swap'); if(pageLenis) pageLenis.start(); const f=wt.after; wt.after=null; f&&f(); },REDUCED?0:300); }
$('coach').addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); wtNext(); });
$('wtSkip').addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); wtClose(); });
['pointerdown','pointerup','mousedown','touchstart'].forEach(t=>$('coach').addEventListener(t,e=>{ e.stopPropagation(); },{passive:true}));
['wheel','touchmove'].forEach(t=>$('coach').addEventListener(t,e=>{ e.preventDefault(); e.stopPropagation(); },{passive:false}));
addEventListener('resize',()=>{ wt.last=''; wtLayout(); });
/* after the tour: the existing first-visit flow (mission → drag to begin), or straight in for returning visitors */
/* after the tour (or straight after Lets Begin on later visits): land on the Watchtower start screen before 1537 */
function landStart(){ LS.set(OB_KEY,'1'); hideStory(); endStatic(); startExperience(true); killSnap(); arrived=false; zoneIdx=-1; fx=snapT=dragT=restX=START; vx=0; camLook.x=START; phase='rest'; syncLenis(); updatePassport(); }
function wtAfter(){ landStart(); }
/* 08 · mission (drag screen underneath) */
function obMission(){ bc('ob-mission',true); bc('has-launcher',true); setTimeout(()=>$('mStart').focus(),60); }
$('mStart').onclick=()=>{ if(!BODY.classList.contains('ob-mission')) return; bc('ob-mission',false); bc('ob-drag',true); obDragVis(0); };
/* 09 · drag to start → 10 · revealed */
/* plain frame: "Drag me to begin the journey" follows the pointer and fades as you pull */
function obDragVis(p){ OB.p=p; const c=$('obCard'); c.style.opacity=Math.max(0,1-p*1.5); c.style.transform=`translateX(${p*90}px)`; }
function obTween(to,done){ const g=window.gsap; if(g&&!REDUCED){ const o={p:OB.p}; g.to(o,{p:to,duration:to>OB.p?.45:.6,ease:to>OB.p?'power2.out':'elastic.out(1,.6)',overwrite:true,onUpdate:()=>obDragVis(o.p),onComplete:()=>done&&done()}); return; }
  const from=OB.p, t0=performance.now(), d=REDUCED?1:380; (function f(now){ const k=Math.min(1,(now-t0)/d), e=1-Math.pow(1-k,3); obDragVis(from+(to-from)*e); if(k<1) requestAnimationFrame(f); else done&&done(); })(t0); }
function obReveal(){ obTween(1,()=>{ const g=window.gsap; if(g&&!REDUCED) g.fromTo(canvas,{opacity:0},{opacity:1,duration:.9,ease:'power2.out',clearProps:'opacity'});
  bc('ob-drag',false); $('obCard').style.opacity=''; $('obCard').style.transform=''; revealState(); endStatic(); startExperience(false); showStory(0); LS.set(OB_KEY,'1'); tone(660,.06,.3); setTimeout(()=>tone(990,.035,.25),70); }); }
addEventListener('pointerdown',e=>{ if(!BODY.classList.contains('ob-drag')) return; if(e.target.closest('.hudb,#pass,.nav,#launcher,dialog,#hL')) return;
  if(e.target.closest('#hR')){ e.preventDefault(); obReveal(); return; } OB.dragging={x:e.clientX,p:OB.p,id:e.pointerId}; bc('ob-dragging',true); },true);
addEventListener('pointermove',e=>{ const d=OB.dragging; if(!d) return; const k=$('artF').getBoundingClientRect().width/1440||1; obDragVis(clamp(d.p+(e.clientX-d.x)/(360*k),0,1)); },true);
const obUp=()=>{ if(!OB.dragging) return; OB.dragging=null; bc('ob-dragging',false); if(OB.p>.42) obReveal(); else obTween(0); };
addEventListener('pointerup',obUp,true); addEventListener('pointercancel',obUp,true);
addEventListener('keydown',e=>{
  if(BODY.classList.contains('ob-coach')){ if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); wtClose(); return; }
    if(e.target&&e.target.id==='wtSkip'&&(e.key==='Enter'||e.key===' ')) return;
    if(['Enter',' ','ArrowRight','ArrowDown'].includes(e.key)){ e.preventDefault(); e.stopPropagation(); wtNext(); return; }
    if(e.key==='Tab'){ e.preventDefault(); (document.activeElement===$('wtSkip')?$('coach'):$('wtSkip')).focus({preventScroll:true}); return; }
    e.preventDefault(); e.stopPropagation(); return; }
  if(BODY.classList.contains('ob-drag')&&(e.key==='ArrowRight'||e.key==='Enter')&&!e.target.closest('input,button')){ e.preventDefault(); obReveal(); }
  if(BODY.classList.contains('assist')&&e.key==='Escape'){ closeAssist(); } },true);
/* lantern assistant: the selected lantern panel and its input bar (no conversation designs exist yet) */
function openAssist(){ if(obBusy()) return; bc('assist',true); setTimeout(()=>$('aInput').focus(),60); }
function closeAssist(){ bc('assist',false); $('aInput').blur(); }
$('launcher').onclick=()=>{ if(BODY.classList.contains('ob-mission')) return; if(typeof openLamp==='function') openLamp(); else openAssist(); };
$('obDim').addEventListener('click',()=>{ if(BODY.classList.contains('assist')) closeAssist(); });
function bindBar(form){ const inp=form.querySelector('input'), btn=form.querySelector('.abub');
  const sync=()=>{ const has=inp.value.trim().length>0, foc=document.activeElement===inp; form.classList.toggle('has-text',has); form.classList.toggle('is-focus',foc); if(btn) btn.setAttribute('aria-label',has||foc?'Send':'Search'); };
  inp.addEventListener('input',sync); inp.addEventListener('focus',sync); inp.addEventListener('blur',()=>setTimeout(sync,0));
  btn&&btn.addEventListener('mousedown',e=>{ if(document.activeElement===inp) e.preventDefault(); });
  form.addEventListener('submit',e=>{ e.preventDefault(); const t=inp.value.trim(); if(!t){ inp.focus(); return; }
    /* hand-off point for the assistant service; nothing is shown because no reply, loading or error designs exist */
    window.dispatchEvent(new CustomEvent('lantern:ask',{detail:{text:t}})); });
  sync(); return {sync}; }
const aBar=bindBar($('aBar'));
/*BUILD2*/

/* ================= MR. LAMP (Figma "Pop up" 48:5268) =================
   Opens by itself once: the first time the frame reaches 1760 coming from 1537. Never again after that
   (remembered in the browser, untouched by Begin Again). The lantern launcher can reopen it at any time.
   States: mission → search (input focused) → result (first answer) → chat (follow-up messages).
   Answers come only from the stories already on this site (ZONES); nothing is fetched or made up. */
const LAMP_KEY='wdbe.lamp.seen';
const lamp={ open:false, state:'mission', hist:[], timer:0, lastFocus:null };
let lastZone=-1;
const lampTime=()=>new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function lampSet(st){ lamp.state=st; $('lPanel').dataset.state=st; const bar=$('lBar');
  bar.classList.toggle('search',st==='search'||st==='result'); bar.classList.toggle('text',st==='mission'||st==='chat');
  $('lHead').textContent=st==='result'?'Mr. Lamp • search result':'Mr. Lamp';
  $('artL').setAttribute('aria-labelledby',st==='mission'||st==='search'?'lHeadMission':'lHead'); lBar.sync(); }
function lampRender(){ const m=$('lMsgs');
  const items=lamp.state==='result'?lamp.hist.slice(-2):lamp.hist;   /* question first, its answer below */
  m.innerHTML=items.map(h=>h.who==='lamp'
    ?`<div class="lb"><div class="lh"><span class="ln">Lamp</span><time>${h.t}</time></div><p class="lx">${esc(h.text)}</p></div>`
    :`<div class="ub"><time>${h.t}</time><p class="ux">${esc(h.text)}</p></div>`).join('');
  /* keep the latest question in view with its answer right below it */
  const lastQ=[...m.querySelectorAll('.ub')].pop(); m.scrollTop=lastQ?lastQ.offsetTop-m.offsetTop*0-(lastQ.offsetParent===m?0:m.offsetTop):m.scrollHeight; }
function openLamp(){ if(lamp.open||obBusy()||building||vrMode||lensMode) return;
  lamp.open=true; lamp.lastFocus=document.activeElement; lamp.hist=[]; $('lInput').value=''; lampSet('mission'); lampRender(); $('lPanel').querySelector('.lscroll').scrollTop=0;
  closeAssist(); stopFollow(); bc('lamp',true); setTimeout(()=>$('lPanel').focus({preventScroll:true}),80); }
function closeLamp(){ if(!lamp.open) return; lamp.open=false; bc('lamp',false); $('lInput').blur(); const f=lamp.lastFocus; lamp.lastFocus=null; if(f&&f.focus&&document.contains(f)) f.focus({preventScroll:true}); }
/* first 1537 → 1760 arrival only */
function lampOnArrive(i,prev){ if(i!==1||prev!==0||LS.get(LAMP_KEY)==='1'||lamp.timer) return; LS.set(LAMP_KEY,'1');
  lamp.timer=setTimeout(()=>{ lamp.timer=0; if(arrived&&zoneIdx===1) openLamp(); },1500); }
$('lClose').onclick=closeLamp; $('lGo').onclick=closeLamp;
/* let the mission text and the messages scroll natively: keep the page's smooth-scroll handlers from swallowing the wheel */
$('lPanel').querySelectorAll('.lscroll,.lmsgs').forEach(el=>['wheel','touchmove'].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:true})));
$('obDim').addEventListener('click',()=>{ if(lamp.open) closeLamp(); });
$('lPanel').querySelectorAll('[data-lstamp]').forEach(im=>{ im.src=LAMP_STAMPS[im.dataset.lstamp]; });
$('lLamp').src=FIG['lantern-688']; $('lAv').src=FIG['lantern-688'];
const lBar=bindBar($('lBar'));
$('lInput').addEventListener('focus',()=>{ if(lamp.state==='mission') lampSet('search'); else if(lamp.state==='result'){ $('lInput').value=''; lampSet('chat'); lampRender(); } });
$('lInput').addEventListener('blur',()=>setTimeout(()=>{ if(lamp.open&&lamp.state==='search'&&!$('lInput').value.trim()&&document.activeElement!==$('lInput')) lampSet('mission'); },0));
$('lBar').addEventListener('submit',e=>{ e.preventDefault(); e.stopImmediatePropagation(); const q=$('lInput').value.trim(); if(!q){ $('lInput').focus(); return; }
  const t=lampTime(); lamp.hist.push({who:'you',text:q,t},{who:'lamp',text:lampAnswer(q),t});
  if(lamp.state==='chat'){ $('lInput').value=''; lampRender(); lBar.sync(); }
  else { $('lInput').value=''; lampSet('result'); lampRender(); $('lInput').blur(); } },true);
/* keyboard: Escape closes, Tab stays inside the panel */
addEventListener('keydown',e=>{ if(!lamp.open) return;
  if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); closeLamp(); return; }
  if(e.key==='Tab'){ const f=[...$('artL').querySelectorAll('button,input,[tabindex="0"]')].filter(el=>el.offsetParent!==null&&!el.disabled); if(!f.length) return;
    const a=f[0], z=f[f.length-1]; if(e.shiftKey&&document.activeElement===a){ e.preventDefault(); z.focus(); } else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus(); } return; }
  if(!e.target.closest||!e.target.closest('#artL')) e.stopPropagation(); },true);

/* answers come only from Jayashree's knowledge document ("bengaluru_chatbot_knowledge", Google Drive),
   compiled into LAMP_KB at build time by kb_build.py. Anything the document does not cover gets
   "I am not aware of it." Details the document marks [VERIFY] are left out. */
const LAMP_STOP=new Set('a an the and or of to in on at is are was were be been do does did i me my you your we it its this that these those there their them they he she his her with for from by as into than then so lamp mr hi hello hey please can could would will shall should just more some any tell about give know show explain say said much many very also who when why how what where which whom whose'.split(' '));
const LAMP_WEAK=new Set(['bengaluru','bangalore','city','cities','year','years','story','stories','happen','happened','start','started','first']);
/* extra names people use for each stop (index = stop) */
const LAMP_TAGS=[
  'kempegowda kempe gowda fort mud founding founder founded pete petes market markets yelahanka chieftain heritage wall walls',
  'lalbagh lal bagh garden gardens hyder ali tipu sultan glass house glasshouse botanical tree trees plants green rock',
  'electricity electric power lights light lamps lamp street streetlights shivanasamudra waterfall falls kerosene cauvery',
  'iisc indian institute science scientific tata jamsetji vivekananda lab labs research ship students',
  'hal hindustan aircraft aeronautics aeroplane aeroplanes airplane plane planes walchand hirachand cobra cobras termite termites airfield aerodrome factory factories',
  'texas instruments ti satellite dish bullock cart software technology park tech silicon valley plateau stpi',
  'flipkart sachin binny bansal startup startups koramangala motorcycle books servers hero honda',
  'future lake lakes water bodies 500 choices tanks'
].map(s=>new Set(s.split(' ')));
const stem=w=>w.length>4&&w.endsWith('ies')?w.slice(0,-3)+'y':w.length>4&&w.endsWith('s')&&!/ss$/.test(w)?w.slice(0,-1):w;
const LAMP_SYN={named:'name',naming:'name',sell:'sold',sells:'sold',selling:'sold',built:'build',building:'build',builds:'build',founded:'found',founder:'found',founds:'found',started:'start',starts:'start'};
const lampTok=t=>String(t).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(w=>w&&!LAMP_STOP.has(w)).map(w=>LAMP_SYN[w]||w).map(stem);
const whOf=t=>{ const m=String(t).toLowerCase().match(/\b(who|when|why|where|what|how many|how much|how big|how old|how)\b/); return m?m[1]:''; };
const LAMP_UNITS=(()=>{ const U=[], add=(kind,q,text,ctx,stop)=>{ if(!text) return; U.push({kind,q:q||'',text,stop,askOnly:/boiled beans/.test(text),qs:new Set(lampTok(q||'')),ts:new Set(lampTok(text)),cs:new Set(lampTok(ctx)),wh:whOf(q)}); };
  LAMP_KB.stops.forEach((st,i)=>{ const ctx=[st.year,st.chapter,st.headline,...(LAMP_TAGS[i]?[...LAMP_TAGS[i]]:[])].join(' ');
    st.qa.forEach(x=>add('qa',x.q,x.a,ctx,i)); [...st.facts,...st.more,st.line,st.payoff].forEach(t=>add('fact','',t,ctx,i));
    if(st.edge) add('fact','',`The edge in ${st.year}: ${st.edge}`,ctx+' edge',i);
    if(st.careful) add('fact','',st.careful,ctx+' lake count number',i); });
  const tctx='watchtower watchtowers tower towers narrator plaque kempegowda you yourself lalbagh rock';
  LAMP_KB.tower.qa.forEach(x=>add('qa',x.q,x.a,tctx,-1)); [...LAMP_KB.tower.facts,...LAMP_KB.tower.more].forEach(t=>add('fact','',t,tctx,-1));
  if(LAMP_KB.tower.plaque) add('fact','What does the plaque say?','The plaque says the towers mark '+LAMP_KB.tower.plaque.replace(/^the towers mark\s*/i,''),tctx+' plaque say',-1);
  LAMP_KB.themes.forEach(th=>add('theme','',(th.intro?th.intro+' ':'')+th.text,th.name+' theme thread',-2));
  return U; })();
function lampAnswer(q){ const ql=q.toLowerCase().trim(), words=lampTok(q), strong=words.filter(w=>!LAMP_WEAK.has(w)), wh=whOf(ql);
  const NA=LAMP_KB.fallback||'I am not aware of it.';
  if(/^(hi+|hello+|hey+|namaste|hola|good (morning|afternoon|evening))\b[\s!.,]*(lamp|mr\.? lamp|watchtower)?[\s!.]*$/.test(ql)||/\bwho are you\b|\bwhat are you\b/.test(ql)) return LAMP_KB.hook;
  if(/\b(name|named|called)\b/.test(ql)&&/\b(bengaluru|bangalore)\b/.test(ql)&&!/silicon|garden|tata|tech/.test(ql)){ const u=LAMP_UNITS.find(x=>x.askOnly); if(u) return u.text; }
  if(/\b(summary|summarise|summarize|overview|all (the )?(stops|years)|whole (story|timeline)|the timeline)\b/.test(ql)) return LAMP_KB.cheat.join(' ');
  if(!strong.length&&!/\b(1537|1760|1905|1909|1940|1985|2007|2037)\b/.test(ql)) return NA;
  const yr=(ql.match(/\b(1537|1760|1905|1909|1940|1985|2007|2037)\b/)||[])[1];
  const scored=LAMP_UNITS.map(u=>{ let s=0, hits=0;
    words.forEach(w=>{ const weak=LAMP_WEAK.has(w)?.3:1; const inQ=u.qs.has(w), inT=u.ts.has(w), inC=u.cs.has(w);
      s+=weak*((inQ?3:0)+(inT?2:0)+(inC?2.5:0)); if(!LAMP_WEAK.has(w)&&(inQ||inT||inC)) hits++; });
    if(yr&&u.stop>=0&&String(LAMP_KB.stops[u.stop].year)===yr){ s+=4; hits++; }
    if(u.kind==='qa'&&wh&&u.wh===wh) s+=1.5; else if(u.kind==='qa'&&wh&&u.wh&&u.wh!==wh) s-=1.5;
    if(/^how (many|much)/.test(wh)&&/\d/.test(u.text)) s+=3;
    if(u.askOnly&&!/\b(bean|beans|legend|name|named|called)\b/.test(ql)) s=-1;
    if(u.kind==='theme'&&/\b(water|thread|theme|edge|identit)/.test(ql)&&!yr) s+=2;
    return {u,s,hits}; }).sort((a,b)=>b.s-a.s);
  const top=scored[0]; if(!top||top.hits===0) return NA;
  /* every content word of the question has to appear somewhere in the document */
  const unknown=strong.filter(w=>!LAMP_UNITS.some(u=>u.qs.has(w)||u.ts.has(w)||u.cs.has(w)));
  if(unknown.length>(strong.length>3?1:0)) return NA;
  const overlap=(a,b)=>{ const A=new Set(lampTok(a)), B=lampTok(b); return B.length?B.filter(w=>A.has(w)).length/B.length:1; };
  /* only the topic matched (e.g. "tell me about labs"): give that stop's first two facts */
  if(top.s<3){ const st=top.u.stop>=0?LAMP_KB.stops[top.u.stop]:top.u.stop===-1?LAMP_KB.tower:null; if(!st) return NA; return st.facts.slice(0,2).join(' '); }
  /* "tell me about …": the stop's own first two facts read better than a single Q&A line */
  if(!wh&&top.u.stop>=0&&/^(tell|talk|explain|what about|about|describe)\b/.test(ql)) return LAMP_KB.stops[top.u.stop].facts.slice(0,2).join(' ');
  let ans=top.u.text;
  const more=scored.find(x=>x!==top&&x.u.stop===top.u.stop&&x.u.kind!=='qa'&&x.hits>0&&(top.u.kind==='qa'||x.s>=top.s*.55)&&overlap(ans,x.u.text)<.5);
  if(more&&more.s>0&&(top.u.kind!=='qa'||ans.length<40)) ans+=' '+more.u.text;
  /* where the document says sources differ, say so */
  const st=top.u.stop>=0?LAMP_KB.stops[top.u.stop]:top.u.stop===-1?LAMP_KB.tower:null;
  if(st&&st.differ&&st.differ.length){ const d=st.differ[0], dw=lampTok(d); if(strong.some(w=>dw.includes(w))||(wh==='when'&&/date/.test(d))) ans+=' Sources differ on '+d; }
  return ans.replace(/\s+/g,' ').trim(); }


/* ================= LOOP ================= */
const clock=new THREE.Clock(); let time=0, frameN=0, clayK=0, offX=0, offY=0, vrModeWas=false;
function resize(){ layout(); renderer.setSize(innerWidth,innerHeight,false); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); cbKey=''; }
addEventListener('resize',resize);
renderer.autoClear=false;
/*POST*/
let MANUAL=false, SKIPR=false; const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
function loop(){ const raw=clock.getDelta(), r=Math.min(.05,raw); if(!MANUAL){ adaptQuality(raw); stepFrame(r); } requestAnimationFrame(loop); }
let lookY=2.2; const EL=.13, LOOKY=2.2, tpV=new THREE.Vector3(), tlV=new THREE.Vector3();
function scissor(r){ const sx=Math.max(0,Math.floor(r.l)), sy=Math.max(0,Math.floor(r.t)), sw=Math.min(innerWidth,Math.ceil(r.r))-sx, sh=Math.min(innerHeight,Math.ceil(r.b))-sy; if(sw<2||sh<2) return false; renderer.setScissorTest(true); renderer.setScissor(sx,innerHeight-sy-sh,sw,sh); return true; }
function stepFrame(rdt){
  const dt=rdt*60; time+=rdt; frameN++;
  /* frame physics */
  const prev=fx;
  if(phase!=='snap'&&SNAP.to!==null) killSnap();
  if(phase==='drag'){ fx+=(dragT-fx)*L(.3,dt); vx=(fx-prev)/Math.max(dt,.001); }
  else if(phase==='wheel'){ fx+=(wheelX-fx)*L(.5,dt); vx=(fx-prev)/Math.max(dt,.001); }
  else if(phase==='inertia'){ fx+=vx*dt; vx*=Math.pow(.92,dt); if(Math.abs(vx)<.035){ const target=(!arrived&&!seen.size&&fx<START+1.5)?START:stopX(nearest(fx+vx*10)); snapT=target; phase='snap'; } }
  else if(phase==='snap'){ let done;
    if(window.gsap){ if(SNAP.to!==snapT) snapTween(snapT); fx=SNAP.o.x; done=!SNAP.tw; }
    else { fx+=(snapT-fx)*L(.075,dt); done=Math.abs(snapT-fx)<.004; }
    vx=(fx-prev)/Math.max(dt,.001);
    if(done){ fx=snapT; vx=0; phase='rest'; SNAP.to=null; syncLenis();
      const moved=Math.abs(fx-restX)>.3; restX=fx; if(fx>=0&&(moved||!arrived)&&!building) onArrive(nearest(fx)); } }
  fx=clamp(fx,START-1,stopX(N-1)+1);
  if(arrived&&phase!=='rest'&&Math.abs(fx-restX)>.35&&!building) onLeave();
  if(OB.static&&(phase!=='rest'||building||vrMode||lensMode)) endStatic();
  frame.position.x=fx;
  document.body.classList.toggle('moving',phase!=='rest');
  /* camera: the world sits under the fixed Figma card; the card leads a little while you drag */
  const W=innerWidth, H=innerHeight, hr=homeRect(), s=hr.w/384, sl=$('slot').getBoundingClientRect(), slx=sl.left+sl.width/2-cardDX*(NARROW?0:LAY.s), sly=sl.top+sl.height/2;
  camDist=8.7*H/(2*Math.tan(camera.fov*Math.PI/360)*330*s);   /* framed wider: the focal asset sits centred with room around it */
  let k=L(.07,dt);
  if(building){ const X=stopX(7); tpV.set(X-3.0,12,15.8); tlV.set(X-2.7,.6,.4); k=L(.04,dt); }
  else if(vrMode){ VR.yaw+=(VR.ty-VR.yaw)*L(.12,dt); VR.pitch+=(VR.tp-VR.pitch)*L(.12,dt); VR.dist+=(VR.td-VR.dist)*L(.1,dt); if(!down) VR.ty+=.0016*dt;
    const X=stopX(Math.max(0,zoneIdx)); tlV.set(X,1.6,0); tpV.set(X+Math.sin(VR.yaw)*Math.cos(VR.pitch)*VR.dist,1.6+Math.max(.6,Math.sin(VR.pitch)*VR.dist),Math.cos(VR.yaw)*Math.cos(VR.pitch)*VR.dist); k=L(.09,dt); }
  else { const nd=fx<-SP/2?null:DIO[nearest(fx)]; lookY+=((nd?nd.cy+.5:2.4)-lookY)*L(.05,dt); tlV.set(fx,lookY,0); tpV.set(0,Math.sin(EL)*camDist,Math.cos(EL)*camDist); }
  if(!building&&!vrMode){ camLook.x+=(fx-camLook.x)*k; camLook.y+=(lookY-camLook.y)*k; camLook.z+=(0-camLook.z)*k;
    const maxD=96*s/ppu(); if(Math.abs(fx-camLook.x)>maxD) camLook.x=fx-Math.sign(fx-camLook.x)*maxD;
    tpV.add(camLook); camPos.lerp(tpV,L(.12,dt)); camPos.x=camLook.x; }
  else { camLook.lerp(tlV,k); camPos.lerp(tpV,k); }
  camera.position.copy(camPos); camera.lookAt(camLook);
  /* keep the look point on the card's centre (Figma: x 720, y 464) */
  const full=!building&&!vrMode, ox=full?W/2-slx:0, oy=full?H/2-sly:0;
  if(NARROW||Math.abs(ox-offX)>200&&full&&!vrModeWas){ offX=ox; offY=oy; } else { offX+=(ox-offX)*L(.1,dt); offY+=(oy-offY)*L(.1,dt); } if(Math.abs(offX-ox)<.3) offX=ox; if(Math.abs(offY-oy)<.3) offY=oy; vrModeWas=!full;
  camera.setViewOffset(W,H,offX,offY,W,H);
  cardDX=full&&!NARROW?clamp((fx-camLook.x)*ppu()/s,-96,96):0; placeCardBack();
  document.documentElement.style.setProperty('--dx',cardDX.toFixed(2)+'px');
  sun.position.set(camLook.x+SUN.x*60,SUN.y*60,SUN.z*60-6); sun.target.position.set(camLook.x,0,-6); rim.position.set(camLook.x+8,6,-8); rim.target.position.set(camLook.x,1,0);
  /* pieces */
  DIO.forEach(d=>{ if(Math.abs(d.g.position.x-camLook.x)>36&&d.prox<.001) return;
    const want=(building&&d.i===7)||(vrMode&&Math.abs(fx-d.g.position.x)<34)?1:clamp(1-Math.abs(fx-d.g.position.x)/ASM_R,0,1);
    d.prox+=(want-d.prox)*L(.12,dt); const pr=d.prox;
    d.pieces.forEach(p=>{ const o=p.obj;
      if(p.dyn){ const hid=vrMode&&d.i!==zoneIdx; o.visible=!hid; if(hid) return; }   /* moving props (carts, bus, auto) belong to the scene in focus: a neighbour's never pop in or out in view */
      if(p.hero){ const idle=1-ease(clamp(pr*1.5,0,1)); o.position.set(p.home.x,p.home.y+.3*idle+Math.sin(time*1.1+p.phase)*.12*idle,p.home.z);
        o.rotation.set(p.hr.x,p.hr.y+Math.sin(time*.45+p.phase)*.45*idle,p.hr.z); o.scale.copy(p.hs); return; }
      const loc=clamp((pr-p.delay)/.3,0,1); p.d+=(loc-p.d)*L(.15,dt);
      const e=clamp(p.d,0,1), inv=1-ease(e), sc=e<.002?.0001:Math.max(.0001,easeOutBack(e));
      if(p.slide!=null){ o.visible=e>.002; o.userData.so=p.slide*inv; o.position.copy(p.home); o.rotation.copy(p.hr); o.scale.copy(p.hs); return; }
      o.position.set(p.home.x+p.off.x*inv,p.home.y+p.off.y*inv,p.home.z+p.off.z*inv);
      o.rotation.set(p.hr.x+p.roff.x*inv,p.hr.y+p.roff.y*inv,p.hr.z+p.roff.z*inv);
      o.scale.copy(p.hs).multiplyScalar(sc); });
    /* when the frame rests on a stop, its scene comes alive: gentle turntable, moving parts, swaying trees */
    const fw=(arrived&&zoneIdx===d.i&&phase==='rest'&&!building)||(vrMode&&zoneIdx===d.i)?1:0; d.focus+=(fw-d.focus)*L(.05,dt);
    const k=REDUCED?0:d.focus; d.at+=rdt*k;
    d.g.rotation.y=d.baseRY+Math.sin(d.at*.32)*.07*k;
    d.sway.forEach(o=>{ o.rotation.z=Math.sin(d.at*1.4+o.userData.sway)*.035*k; o.rotation.x=Math.cos(d.at*1.1+o.userData.sway)*.02*k; });
    d.update&&d.update(d.at,rdt*k,k); });
  /* builder pop-in */
  B.objs.forEach(o=>{ if(o&&o.userData.pop<1){ o.userData.pop=Math.min(1,o.userData.pop+rdt*2.4); const t=o.userData.pop, sc=1+Math.sin(t*Math.PI)*.25*(1-t); o.scale.setScalar(Math.max(.01,ease(t)*sc)); } });
  /* dust + bursts */
  { const rc=full&&!NARROW&&phase==='rest'&&clayK===0&&!building&&!vrMode&&!lensMode; if(rc){ const g=glassRect(); TVIEW.l=g.l; TVIEW.r=g.r; } else { TVIEW.l=0; TVIEW.r=innerWidth; } }
  updateWorld(time,REDUCED?0:rdt,camLook.x);
  bp.forEach((p,j)=>{ if(p.life>0){ p.life-=rdt*.75; p.vy-=rdt*3.2; p.x+=p.vx*rdt; p.y=Math.max(.05,p.y+p.vy*rdt); p.z+=p.vz*rdt; p.vx*=.985; p.vz*=.985; }
    tmpO.position.set(p.x,p.y,p.z); tmpO.rotation.set(p.r+time*2,p.r,0); tmpO.scale.setScalar(p.life>0?p.s*Math.min(1,p.life*2):0); tmpO.updateMatrix(); burst.setMatrixAt(j,tmpO.matrix); });
  burst.instanceMatrix.needsUpdate=true;
  if(frameN%3===0&&pointerOnCanvas) cursorLabel();
  if(frameN%6===0) cursorMode(document.elementFromPoint(mx,my));   /* the frame moves under a still pointer too */
  /* render: grey timeline in the band while moving, colour inside the glass card */
  const wantK=(started&&full&&!NARROW&&phase!=='rest')?.92:0; clayK+=(wantK-clayK)*L(wantK>clayK?.12:.06,dt); if(clayK<.004) clayK=0;
  if(SKIPR||(lensMode&&lo.classList.contains('open')&&performance.now()-lensOpenedAt>1200)) return;
  const atStart=started&&full&&!lensMode&&!obBusy()&&phase==='rest'&&fx<-SP*.35; if(atStart!==BODY.classList.contains('at-start')) bc('at-start',atStart);
  const gr=glassRect();
  heroMode(full&&!OB.static,clayK===0&&phase==='rest',camLook.x);
  if(!full){ renderWorld('full-colour',gr,0); return; }
  if(gr.b<0||gr.t>H||OB.static||obBusy()||atStart||BODY.classList.contains('bld2')){ renderer.setRenderTarget(null); renderer.setScissorTest(false); renderer.setViewport(0,0,W,H); renderer.setClearColor(0x000000,0); renderer.clear(); return; }
  renderWorld(clayK>0?'full':'card',gr,clayK);
}
let lensOpenedAt=0; new MutationObserver(()=>{ if(lo.classList.contains('open')) lensOpenedAt=performance.now(); }).observe(lo,{attributes:true,attributeFilter:['class']});

/* ================= REAL MODELS =================
   Downloaded models replace the procedural people and vehicles once they have loaded. Until then,
   and if the files are missing (for example when this page is opened straight from disk), the
   procedural versions stay in place, so nothing ever goes blank.
   - People: Quaternius, Universal Animation Library (CC0 1.0): a rigged human with walk, talk,
     sit and work cycles, dressed here per character with vertex colours and headwear.
   - Vehicles: "Bus Simulator India - Traffic Cars" by Villanueva-Jonatan-32621, Sketchfab,
     CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). UVs are remapped from the packed
     texture atlases; indicator and brake-lamp overlays are left out. */
const MODEL_BASE='models/';
const MODEL_DATA=/*MODELS*/{}; const modelURL=n=>MODEL_DATA[n]||MODEL_BASE+n;   /* the models ship inside the page, so the single file works anywhere */
const MIXERS=[]; let WALKERS=null, MODELS_READY=false;
const dioOf=o=>{ for(let p=o;p;p=p.parent){ const d=DIO.find(d=>d.g===p); if(d) return d.i; } return null; };
function heroTag(root,dio){ root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; if(dio!=null){ o.layers.enable(HERO_LAYER); o.userData.dio=dio; } if(o.isSkinnedMesh){ o.frustumCulled=true; o.computeBoundingSphere(); o.boundingSphere.radius*=1.6; } } }); }

/* ---- vehicles ---- */
const VMATS=new Map();
function vehMaterial(src){ if(VMATS.has(src.uuid)) return VMATS.get(src.uuid);
  const light=/light/i.test(src.name), body=/body|hatchback|luxury|suv|motor$/i.test(src.name);
  const m=new THREE.MeshStandardMaterial({map:src.map||null,color:src.color?src.color.clone():0xffffff,roughness:light?.35:body?.5:.7,metalness:body?.15:0,side:THREE.FrontSide,
    emissive:light?0xfff2d8:0x000000,emissiveIntensity:light?.25:0,emissiveMap:light?src.map||null:null});
  if(m.map){ m.map.colorSpace=THREE.SRGBColorSpace; m.map.anisotropy=4; }
  patch(m); animPatch(m); VMATS.set(src.uuid,m); return m; }
/* one vehicle, nose to +x, centred, wheels on y=0, in metres */
function prepVehicle(gl,name){ const node=gl.scene.getObjectByName(name); if(!node) return null; gl.scene.updateMatrixWorld(true);
  const c=node.clone(true); c.matrixAutoUpdate=true; node.matrixWorld.decompose(c.position,c.quaternion,c.scale);
  const drop=[]; c.traverse(o=>{ if(!o.isMesh) return; if(/light_(turn|break|rear)/i.test(o.name)){ drop.push(o); return; }
    const r=o.material.userData&&o.material.userData.rect; o.geometry=zeroAnim(o.geometry.clone());
    if(r&&o.geometry.attributes.uv){ const uv=o.geometry.attributes.uv, e=.5/1024; for(let i=0;i<uv.count;i++){ const u=Math.min(1-e,Math.max(e,uv.getX(i))), v=Math.min(1-e,Math.max(e,uv.getY(i))); uv.setXY(i,r[0]+u*r[2],r[1]+v*r[3]); } }
    o.material=vehMaterial(o.material); });
  drop.forEach(o=>o.parent.remove(o));
  const turn=new THREE.Group(); turn.add(c); turn.rotation.y=Math.PI/2; const pivot=new THREE.Group(); pivot.add(turn); pivot.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(pivot), ce=bb.getCenter(new THREE.Vector3()); turn.position.set(-ce.x,-bb.min.y,-ce.z); pivot.updateMatrixWorld(true);
  pivot.userData.len=bb.max.x-bb.min.x; pivot.userData.wid=bb.max.z-bb.min.z; pivot.userData.h=bb.max.y-bb.min.y; return pivot; }
/* merged per material, scaled to world units, for instancing along the timeline road */
function vehicleParts(pivot,scale){ pivot.updateMatrixWorld(true); const by=new Map();
  pivot.traverse(o=>{ if(!o.isMesh) return; let g=o.geometry.clone(); g.applyMatrix4(o.matrixWorld); g.scale(scale,scale,scale);
    for(const k of Object.keys(g.attributes)) if(!['position','normal','uv'].includes(k)) g.deleteAttribute(k);
    zeroAnim(g); if(/wheel/i.test(o.name)||(/_(front|rear)_/i.test(o.name)&&/component/i.test(o.name))){ g.computeBoundingBox(); const bb=g.boundingBox, A=g.attributes.aA.array, B=g.attributes.aB.array, cx=(bb.min.x+bb.max.x)/2, cy=(bb.min.y+bb.max.y)/2, r=(bb.max.y-bb.min.y)/2;
      for(let i=0;i<A.length/4;i++){ A[i*4]=1; A[i*4+1]=cx; A[i*4+2]=cy; B[i*4]=r; } }
    if(!g.attributes.uv) g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
    if(g.index) g=g.toNonIndexed(); let a=by.get(o.material); if(!a) by.set(o.material,a=[]); a.push(g); });
  return [...by].map(([m,gs])=>({m,g:mergeGeometries(gs,false)})); }
function applyVehicleSwaps(gl){ const cache={};
  for(const s of SWAPS){ const src=cache[s.name]||(cache[s.name]=prepVehicle(gl,s.name)); if(!src) continue;
    const m=new THREE.Group(); for(const {m:mt,g:geo} of vehicleParts(src,1)){ const me=new THREE.Mesh(geo,mt); me.castShadow=me.receiveShadow=true; m.add(me); }
    const k=s.len/src.userData.len; m.scale.setScalar(k); m.position.y=s.y; if(s.flat) s.obj.rotation.x=0;
    s.obj.children.forEach(c=>c.visible=false); s.obj.add(m); heroTag(m,dioOf(s.obj)); } }
/* the road traffic: autos, cars, buses and two-wheelers from the 1980s on */
const TRAFFIC={ auto:['IN_Rickshaw_02','IN_Rickshaw_01','IN_Rickshaw_02','IN_Rickshaw_03'], car:['IN_Hatchback_01','IN_Hatchback_02','IN_Hatchback_03','IN_Hatchback_04','IN_Luxury_02','IN_SUV_01','IN_SUV_02','IN_SUV_04','IN_EV_02'],
  bus:['IN_Bus_01','IN_Bus_02','IN_Bus_03'], scooter:['IN_Motorbike_01','IN_Motorbike_02','IN_Motorbike_03'], pod:['IN_EV_01','IN_EV_02'],
  vintage:['IN_Luxury_02','IN_Luxury_03'], amby:['IN_Luxury_01','IN_Hatchback_02'] };
function applyTraffic(gl){ const R=rng(808);
  VEH.forEach((V,vi)=>{ const names=TRAFFIC[V.k]; if(!names) return; const parts=[];
    names.forEach(n=>{ const p=prepVehicle(gl,n); if(p) parts.push({name:n,src:vehicleParts(p,.1),ims:[],n:0,len:p.userData.len*.1*RS,wid:p.userData.wid*.1*RS,near:true}); }); if(!parts.length) return;
    V.list.forEach(v=>{ v.var=(R()*parts.length)|0; v.slot=parts[v.var].n++; v.len=parts[v.var].len; v.wid=parts[v.var].wid; });
    parts.forEach(P=>{ if(!P.n) return; P.ims=P.src.map(({m,g})=>{ const im=new THREE.InstancedMesh(g,m,P.n); im.castShadow=true; im.receiveShadow=true; im.frustumCulled=false; world.add(im); return im; }); });
    V.parts=parts; V.im.visible=false; }); }

/* ---- people ---- */
const PEOPLE_MAT=patch(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82,metalness:0}));
let MAN=null;   /* {scene, clips, region[], head:{c,r}, H} */
const REG={skin:0,top:1,bottom:2,shoes:3,hair:4,sleeve:5,shin:6,blouse:7};
function prepMannequin(gl){ const sks=[]; gl.scene.traverse(o=>{ if(o.isSkinnedMesh) sks.push(o); }); if(!sks.length) return null;
  gl.scene.updateMatrixWorld(true); const v=new THREE.Vector3(), all=new THREE.Box3(), hb=new THREE.Box3();
  sks.forEach(sk=>all.expandByObject(sk)); const H=all.max.y-all.min.y;
  const classify=sk=>{ const g=sk.geometry, pos=g.attributes.position, si=g.attributes.skinIndex, sw=g.attributes.skinWeight, bones=sk.skeleton.bones, bb=new THREE.Box3().setFromBufferAttribute(pos), h=bb.max.y-bb.min.y;
    const region=new Uint8Array(pos.count), head=[];
    for(let i=0;i<pos.count;i++){ let best=0,bw=-1; for(let k=0;k<4;k++){ const w=sw.getComponent(i,k); if(w>bw){ bw=w; best=si.getComponent(i,k); } }
      const n=bones[best].name, y=(pos.getY(i)-bb.min.y)/h; let r;
      if(/head/.test(n)){ r=REG.skin; head.push(i); } else if(/neck/.test(n)) r=REG.skin;
      else if(/hand|f_|thumb/.test(n)) r=REG.skin; else if(/forearm/.test(n)) r=REG.sleeve; else if(/upper_arm|shoulder/.test(n)) r=REG.top;
      else if(/spine/.test(n)) r=REG.top; else if(/hips/.test(n)) r=y>.53?REG.top:REG.bottom; else if(/thigh/.test(n)) r=REG.bottom;
      else if(/shin/.test(n)) r=y<.16?REG.shin:REG.bottom; else if(/foot|toe/.test(n)) r=REG.shoes; else r=REG.top;
      region[i]=r; }
    head.forEach(i=>hb.expandByPoint(v.fromBufferAttribute(pos,i))); return {region,head}; };
  const per=sks.map(sk=>({name:sk.name,...classify(sk)}));
  const hc=hb.getCenter(new THREE.Vector3()), hs=hb.getSize(new THREE.Vector3());
  per.forEach((p,j)=>{ const pos=sks[j].geometry.attributes.position; p.head.forEach(i=>{ v.fromBufferAttribute(pos,i); const ry=(v.y-hc.y)/hs.y, rz=(v.z-hc.z)/hs.z; if(ry>.18||(rz<-.12&&ry>-.15)) p.region[i]=REG.hair; }); });
  const clips={}; gl.animations.forEach(a=>clips[a.name]=a);
  return {scene:gl.scene,clips,regions:Object.fromEntries(per.map(p=>[p.name,p.region])),head:{c:hc,s:hs},H,minY:all.min.y}; }
const POSE_CLIP={stand:'Idle_Loop',walk:'Walk_Loop',sit:'Sitting_Idle_Loop',bend:'Fixing_Kneeling',point:'Idle_Talking_Loop',carry:'Idle_Loop'};
const SHOES=[0x2a211b,0x3b2f26,0x1c1c1e,0x5a4636];
function dressedPerson(o){ const R=rng((o.seed||1)*131+7), root=SkeletonUtils.clone(MAN.scene); const sks=[]; root.traverse(c=>{ if(c.isSkinnedMesh) sks.push(c); }); const sk=sks[sks.length-1];
  const C=new THREE.Color(), pal=[];
  const skin=new THREE.Color(o.skin??SKINS[0]), top=new THREE.Color(o.top??0xe9e4da), bot=new THREE.Color(o.bottom??0x2f3a4a), acc=new THREE.Color(o.accent??0xc0392b), hair=new THREE.Color(o.hair??0x1b1714);
  const longSleeve=R()<.55, barefoot=o.dress==='dhoti'||o.dress==='lungi'||(o.dress==='sari'&&R()<.5);
  pal[REG.skin]=skin; pal[REG.hair]=hair; pal[REG.top]=top; pal[REG.sleeve]=longSleeve?top:skin; pal[REG.bottom]=bot; pal[REG.shin]=bot; pal[REG.shoes]=barefoot?skin:new THREE.Color(SHOES[(R()*4)|0]); pal[REG.blouse]=top;
  if(o.dress==='dhoti'){ pal[REG.bottom]=new THREE.Color(0xf2ede0); pal[REG.shin]=skin; }
  if(o.dress==='lungi'){ pal[REG.bottom]=acc; pal[REG.shin]=skin; }
  if(o.dress==='sari'){ pal[REG.bottom]=acc; pal[REG.shin]=acc; pal[REG.top]=acc; pal[REG.sleeve]=skin; }
  const jit=(R()-.5)*.06;
  for(const m of sks){ const rg=MAN.regions[m.name]; if(!rg) continue; const g=m.geometry.clone(), n=g.attributes.position.count, col=new Float32Array(n*3);
    for(let i=0;i<n;i++){ C.copy(pal[rg[i]]); if(rg[i]===REG.top||rg[i]===REG.bottom) C.offsetHSL(0,0,jit); col[i*3]=C.r; col[i*3+1]=C.g; col[i*3+2]=C.b; }
    g.setAttribute('color',new THREE.BufferAttribute(col,3)); for(const k of ['uv','uv1']) if(g.attributes[k]) g.deleteAttribute(k); m.geometry=g; m.material=PEOPLE_MAT; }
  /* headwear and hair shapes ride on the head bone */
  const head=root.getObjectByName('DEF-head'), hc=MAN.head.c, hs=MAN.head.s, wear=[];
  sk.skeleton.pose(); root.updateMatrixWorld(true);
  const add=(geo,colr,x,y,z,sx=1,sy=1,sz=1)=>{ const m=new THREE.Mesh(P(geo,colr),vmat({rough:.85})); m.position.set(hc.x+x*hs.x,hc.y+y*hs.y,hc.z+z*hs.z); m.scale.set(sx,sy,sz); sk.add(m); root.updateMatrixWorld(true); head.attach(m); wear.push(m); };
  if(o.head==='turban'){ add(new THREE.TorusGeometry(hs.x*.47,hs.x*.2,6,16),acc.getHex(),0,.3,0,1,1,1.1); wear[wear.length-1].rotation.x+=Math.PI/2; add(new THREE.SphereGeometry(hs.x*.5,12,8),acc.getHex(),0,.42,-.02,1,.7,1.05); }
  if(o.head==='topi') add(new THREE.CylinderGeometry(hs.x*.48,hs.x*.52,hs.y*.22,14),0xf4f1ea,0,.46,-.02,1,1,1.05);
  if(o.head==='cap'){ add(new THREE.SphereGeometry(hs.x*.54,14,8,0,Math.PI*2,0,Math.PI/2),acc.getHex(),0,.22,0); add(new THREE.BoxGeometry(hs.x*.6,hs.y*.04,hs.z*.4),acc.getHex(),0,.22,.6); }
  if(o.head==='bun') add(new THREE.SphereGeometry(hs.x*.24,10,8),hair.getHex(),0,.05,-.6);
  if(o.head==='hair'&&R()<.5) add(new THREE.SphereGeometry(hs.x*.53,12,8,0,Math.PI*2,0,Math.PI*.55),hair.getHex(),0,.14,-.06,1,.75,1.02);
  if(o.dress==='sari') add(new THREE.SphereGeometry(hs.x*.56,12,8,0,Math.PI*2,0,Math.PI*.55),acc.getHex(),0,.12,-.1,1,.8,1.05);
  /* animation: the pose picks a clip; the lamplighter holds his torch up */
  let clip=POSE_CLIP[o.pose]||'Idle_Loop'; if(o.tool==='can'&&o.pose==='point') clip='Idle_Torch_Loop'; if(o.tool==='pick') clip='Fixing_Kneeling';
  const mixer=new THREE.AnimationMixer(root), a=mixer.clipAction(MAN.clips[clip]||MAN.clips.Idle_Loop); a.play(); a.time=R()*a.getClip().duration; a.timeScale=.85+R()*.3; mixer.update(0);
  return {root,mixer,clip,action:a}; }
function hipsY(person){ const h=person.root.getObjectByName('DEF-hips'), v=new THREE.Vector3(); person.root.updateMatrixWorld(true); h.getWorldPosition(v); person.root.worldToLocal(v); return v.y; }
const FIG_LIVE=[];
function applyPeople(){
  for(const f of FIG_SWAPS){ const p=dressedPerson(f.o), s=1/MAN.H; p.root.scale.setScalar(s); p.root.position.y=-MAN.minY*s;
    if(f.o.pose==='sit'){ p.root.updateMatrixWorld(true); const hy=hipsY(p)*s; p.root.position.y+=.5-hy; p.root.position.z=-.1; }
    f.g.children.forEach(c=>c.visible=false); f.g.add(p.root); heroTag(p.root,dioOf(f.g));
    const live={g:f.g,p,walk:f.o.pose==='walk'?{x0:f.g.position.clone(),dir:new THREE.Vector3(Math.sin(f.g.rotation.y),0,Math.cos(f.g.rotation.y)),range:.75,sp:.7*f.g.scale.x*p.action.timeScale}:null};
    FIG_LIVE.push(live); MIXERS.push(live); }
  /* pedestrians on the timeline road */
  WALKERS=[]; const RW=rng(4321), SC=.42/MAN.H, CL=[0xc0392b,0xe67e22,0xf1c40f,0x16a085,0x2980b9,0x8e44ad,0xecf0f1,0xd35400,0x27ae60,0xe84393,0x34495e,0xfdcb6e,0xf3efe6,0x7d8a9a];
  const DR=['pants','pants','pants','sari','dhoti','lungi','pants','sari'], HD=['hair','hair','bun','turban','topi','cap','hair'];
  for(let i=0;i<32;i++){ const p=PEOPLE[i], d=DR[(RW()*DR.length)|0], o={seed:900+i,dress:d,head:d==='sari'?'bun':HD[(RW()*HD.length)|0],top:CL[(RW()*CL.length)|0],bottom:[0x2f3a4a,0x4a4f58,0x6b5a46,0x1f2a44,0x3a3a40][(RW()*5)|0],accent:CL[(RW()*CL.length)|0],skin:SKINS[(RW()*SKINS.length)|0],pose:'walk'};
    const w=dressedPerson(o); w.root.scale.setScalar(SC); w.action.timeScale=clamp((p.v/.24)/1.35,.75,1.4); world.add(w.root); heroTag(w.root,null); w.root.traverse(o=>{ if(o.isMesh) o.castShadow=false; }); WALKERS.push({w,p}); }
  bodyIM.visible=headIM.visible=false; }
let _mv=new THREE.Vector3();
function updateModels(dt,cx){ if(!MODELS_READY) return;
  for(const m of FIG_LIVE){ m.g.getWorldPosition(_mv); if(Math.abs(_mv.x-cx)>40) continue; m.p.mixer.update(dt);
    if(m.walk){ const W=m.walk; W.t=(W.t??Math.random()*W.range)+dt*W.sp; const d=W.t%W.range, f=Math.min(1,d/.12,(W.range-d)/.12);
      m.g.position.copy(W.x0).addScaledVector(W.dir,d-W.range/2); const s=m.g.userData.s0??(m.g.userData.s0=m.g.scale.x); m.g.scale.setScalar(s*Math.max(.001,f)); } }
  if(WALKERS) for(const {w,p} of WALKERS){ if(p.x>cx+40) p.x-=80; if(p.x<cx-40) p.x+=80; w.root.position.set(p.x,walkY(p.x,p.z),p.z); w.root.rotation.y=p.dir>0?Math.PI/2:-Math.PI/2; const near=Math.abs(p.x-cx)<26; w.root.visible=near; if(near) w.mixer.update(dt); } }
async function loadModels(){ if(!/^https?:/.test(location.protocol)) return;
  const L=new GLTFLoader();
  try{ const [veh,ppl]=await Promise.all([L.loadAsync(modelURL('traffic.glb')),L.loadAsync(modelURL('people.glb'))]);
    MAN=prepMannequin(ppl); applyVehicleSwaps(veh); applyTraffic(veh); if(MAN) applyPeople();
    MODELS_READY=true; try{ renderer.compileAsync&&renderer.compileAsync(scene,camera).catch(()=>{}); }catch(e){}
    document.body.classList.add('models-ready'); }
  catch(e){ console.warn('Real models not loaded; keeping the built-in ones.',e); } }


/* ================= BOOT ================= */
/* fine monochrome grain tile (SVG turbulence), a stand-in for the Figma noise image */
const GRAIN='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n" x="0" y="0"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"/></filter><rect width="180" height="180" filter="url(#n)"/></svg>`);
(async function boot(){
  const t0=performance.now(); layout(); resize();
  /* original Figma artwork */
  $('ldBg').src=FIG.landing; $('slotImg').src=FIG['metro-color']; $('stTower').src=FIG['watchtower-352']; $('obGrayG').src=RENDERS.fort; $('obGrayC').src=FIG['metro-color']; $('mLamp').src=FIG['lantern-688']; $('launcherImg').src=FIG['lantern-688'];
  document.documentElement.style.setProperty('--grain',`url("${ASSETS.noise}")`); Object.assign($('noise').style,{opacity:'1',mixBlendMode:'overlay',backgroundSize:'240px 240px'});
  const hashed=/^#(stop|city|build)-/.test(location.hash); if(!hashed) obLanding();
  const fontP=Promise.race([Promise.all([document.fonts.load('500 120px "Gloock"'),document.fonts.load('italic 400 28px Inter'),document.fonts.load('600 14px "Noto Sans"')]),new Promise(r=>setTimeout(r,2500))]).catch(()=>{});
  /* the Watchtower and the stamps, rendered from the 3D models */
  try{ MASCOT=ASSETS.mascot||iconOf(watchtower(1),188,{yaw:.5,pitch:.16,pad:1.02}); }catch(e){ console.warn(e); }
  document.querySelectorAll('#mascotImg,.mimg').forEach(im=>im.src=MASCOT);
  DIO.forEach((d,i)=>{ if(i<7&&d.hero&&!STAMPS[i]) try{ ICONS[i]=iconOf(d.hero.obj,80,{pad:1.0}); }catch(e){} });
  ensureSplit($('artF'));
  await fontP; initStringTune(); initScrollLibs(); pageScroll(); try{ initTimelineLenis(); }catch(e){ console.warn(e); }
  camLook.set(START,LOOKY,0); camPos.set(START,LOOKY+Math.sin(EL)*30,Math.cos(EL)*30); camera.position.copy(camPos); camera.lookAt(camLook);
  requestAnimationFrame(loop);
  /* compile every scene's shaders in the background, so no stop hitches the first time it comes into view */
  try{ renderer.compileAsync&&renderer.compileAsync(scene,camera).catch(()=>{}); }catch(e){}
  handleHash();
  loadModels();
  window.__app={ manual(on){ MANUAL=on; }, step(n=1,r=1/30){ for(let k=0;k<n;k++){ SKIPR=k<n-1; stepFrame(r); } SKIPR=false; }, goTo, enterBuilder, exitBuilder, enterVR, exitVR, openChapter, closeChapter, startFollow, stopFollow, start:()=>startExperience(true), bTap:(k)=>bTap(k), setTool:(k)=>{B.tool=k;}, bResult:()=>bResult(), setDrag(x){ markDragged(); phase='drag'; dragT=x; }, release(){ releaseSnap(restX); }, get state(){ return {fx,phase,zoneIdx,arrived,building,lensMode,vrMode,follow,stamps:stampCount(),cardDX,clayK,ST:!!ST}; }, DIO, earn:earnStamp, camera, cardRect, unlockAll:()=>$('btnUnlockAll').onclick(), ob:()=>({coach:wt.i,static:OB.static,p:OB.p,cls:BODY.className}), obReset:()=>{ try{ localStorage.removeItem(OB_KEY); }catch(e){} }, chScrollTo:(y)=>{ if(chLenis) chLenis.scrollTo(y,{immediate:true}); else loScroll.scrollTop=y; }, scrollInfo:()=>({lenis:!!chLenis,page:!!pageLenis,gsap:gsapReady,triggers:window.ScrollTrigger?ScrollTrigger.getAll().length:0,top:loScroll.scrollTop}) };
})();
