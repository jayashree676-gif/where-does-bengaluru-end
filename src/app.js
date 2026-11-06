import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

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
const FACE=()=>`<img class="m" src="${MASCOT}" alt="">`;
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
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate=true;
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
  m.customProgramCacheKey=()=>'lens'+(m.userData.brick?'b'+m.userData.brick.join('_'):''); return m;
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
/* ================= DIORAMAS ================= */
const SP=20, START=-14, FZ=3.4;
const stopX=i=>i*SP;
const DIO=[];
function makeDio(i){ const g=new THREE.Group(); g.position.x=stopX(i); g.scale.setScalar(1.3); scene.add(g); const d={i,g,pieces:[],keys:[],disp:false,update:null}; DIO.push(d); return d; }
function piece(d,obj,o={}){ d.g.add(obj); const p={obj,hero:!!o.hero,key:!!o.key,amp:o.amp??1,lift:o.lift??0,d:0,t:0,wait:0,tgt:0,phase:Math.random()*6.28,glow:0}; d.pieces.push(p); if(p.key) d.keys.push(p); return obj; }
function finalize(d,fit=7.0,maxH=4.9){
  /* fit each scene to the card's illustration area (352 x 331 in the Figma frame) */
  d.g.scale.setScalar(1); d.g.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(d.g), sz=bb.getSize(new THREE.Vector3());
  d.g.scale.setScalar(Math.min(fit/sz.x,maxH/sz.y,1.5)); d.g.updateMatrixWorld(true);
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
  d.g.rotation.y=-.62;
  const flag=new THREE.Group(); flag.add(at(cyl(.012,.012,.55,mat(C.dark),5),0,.27,0)); const cloth=box(.26,.15,.01,mat(0xb8432e,{side:true})); cloth.position.set(.13,.47,0); flag.add(cloth);
  T4.add(at(flag,0,3.05+.45,0));
  d.update=(t,dt,k)=>{ cloth.rotation.y=Math.sin(t*3.1)*.35*k; cloth.scale.x=1-.12*Math.abs(Math.sin(t*2.3))*k; };
  finalize(d,7.0); }

/* 1 · 1760 garden */
{ const d=makeDio(1); base(d); const R=rng(2);
  piece(d,at(box(4.3,.03,.45,0xe0d2b8),0,T+.015,1.0,.12),{amp:.2});
  const gh=new THREE.Group(); gh.add(at(box(2.0,.1,1.0,C.white),0,.05,0));
  const shell=mesh(new THREE.CylinderGeometry(.5,.5,1.9,18,1,true,0,Math.PI),mat(C.glass,{op:.5,rough:.15,flat:false,side:true})); shell.rotation.z=Math.PI/2; shell.position.y=.1; shell.castShadow=false; gh.add(shell);
  for(let k=0;k<7;k++) gh.add(at(tor(.5,.018,C.white,Math.PI),-.9+k*.3,.1,0,Math.PI/2));
  gh.add(at(cyl(.17,.17,.26,mat(C.glass,{op:.5,rough:.15}),10),0,.68,0)); gh.add(at(cone(.21,.2,C.white,10),0,.9,0));
  piece(d,at(gh,0,T,-.55),{key:true,hero:true});
  piece(d,grp(tree(-1.65,.25,T,1.1,R),tree(-1.15,1.3,T,.9,R)),{key:true});
  piece(d,grp(tree(1.65,.15,T,1.15,R),tree(1.2,1.35,T,.85,R)),{key:true});
  piece(d,grp(tree(-1.75,-1.05,T,1,R),tree(1.75,-1.1,T,1.05,R),tree(0,-1.75,T,.9,R)),{key:true});
  const bed=new THREE.Group(); bed.add(at(box(1.0,.08,.36,C.earth,.02),0,T+.04,1.6)); for(let k=0;k<14;k++) bed.add(at(sph(.045,[0xe8622a,0xf2c14e,0xe86fa0][k%3],8,6),-.42+(k%7)*.14,T+.12,1.52+(k>6?.16:0)));
  piece(d,bed,{key:true});
  finalize(d); }

/* 2 · 1905 lights */
{ const d=makeDio(2); base(d);
  const road=new THREE.Group(); road.add(at(box(4.3,.03,.85,0x57524b),0,T+.015,.75)); for(let k=0;k<7;k++) road.add(at(box(.28,.012,.05,C.white),-1.8+k*.6,T+.035,.75)); piece(d,road,{amp:.2});
  const bulb=mat(0xffd36b,{em:0xffb02e,ei:2.4,flat:false});
  const post=(x,z,dir)=>grp(at(cyl(.03,.04,1.0,C.dark,6),x,T+.5,z),at(box(.24,.03,.03,C.dark),x+.1*dir,T+.99,z),at(sph(.075,bulb),x+.21*dir,T+.95,z));
  [-1.45,0,1.45].forEach(x=>piece(d,grp(post(x,.22,1),post(x,1.28,-1)),{key:true,hero:x===0}));
  const wf=new THREE.Group(); wf.add(at(box(1.2,1.5,.6,C.stone2,.08),-.95,T+.75,-1.35)); wf.add(at(box(.9,.9,.6,C.stone,.06),.15,T+.45,-1.45));
  wf.add(at(box(.45,1.42,.06,mat(C.water,{em:0x3a8fbf,ei:.4,op:.85})),-.95,T+.74,-1.03)); wf.add(at(cyl(.55,.6,.06,C.water,14),-.95,T+.03,-.62));
  const drops=[]; for(let k=0;k<8;k++){ const c=at(box(.06,.06,.06,mat(0xdff3ff,{em:0x9fd8ff,ei:.5})),-1.1+(k%4)*.1,T+1.4-k*.17,-.98); wf.add(c); drops.push(c); }
  piece(d,wf,{key:true});
  const py=new THREE.Group(); const wire=mat(C.metal,{wire:true});
  py.add(at(mesh(new THREE.ConeGeometry(.3,2.0,4,4,true),wire),1.55,T+1.0,-1.1)); py.add(at(mesh(new THREE.ConeGeometry(.24,1.6,4,4,true),wire),.75,T+.8,-1.65));
  py.add(link(new THREE.Vector3(1.55,T+1.95,-1.1),new THREE.Vector3(.75,T+1.55,-1.65),C.dark,.01));
  piece(d,py,{key:true});
  d.update=(t)=>{ drops.forEach((c,k)=>{ c.position.y=T+1.4-((t*1.2+k*.17)%1.35); }); };
  finalize(d); }

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
  piece(d,grp(tree(-2.6,.6,0,1.05,R),tree(2.6,.5,0,1.1,R)),{}); piece(d,grp(tree(-2.3,-1.6,0,1.2,R),tree(2.4,-1.5,0,1.15,R)),{});
  const hedge=new THREE.Group(); for(let k=0;k<6;k++){ hedge.add(bush(-1.9+k*.28,.55,0,.55,R)); hedge.add(bush(.55+k*.28,.55,0,.55,R)); } piece(d,hedge,{amp:.3});
  const bench=grp(at(box(.4,.03,.12,mat(0x6b4a33)),0,.14,0),at(box(.4,.1,.02,mat(0x6b4a33)),0,.2,-.06),at(box(.03,.14,.1,dk),-.17,.07,0),at(box(.03,.14,.1,dk),.17,.07,0));
  piece(d,at(bench,1.3,0,1.2,-.3),{});
  d.update=(t,dt,k)=>{ helix.rotation.y=t*.5; };
  finalize(d,7.0); }

/* 4 · 1940 aircraft */
{ const d=makeDio(4); base(d);
  const rw=new THREE.Group(); rw.add(at(box(4.3,.03,.55,0x4c4945),0,T+.015,.95)); for(let k=0;k<7;k++) rw.add(at(box(.28,.012,.05,C.white),-1.8+k*.6,T+.035,.95)); piece(d,rw,{amp:.2});
  piece(d,grp(at(box(1.3,.62,1.15,0x8b9479,.28),-1.0,T+.31,-.7),at(box(.9,.42,.04,C.dark),-1.0,T+.21,-.12)),{key:true});
  piece(d,grp(at(cyl(.13,.16,.95,C.cream,8),1.0,T+.48,-1.05),at(box(.42,.24,.42,mat(C.glass,{em:0x6fb7d4,ei:.3})),1.0,T+1.07,-1.05),at(box(.48,.05,.48,C.dark),1.0,T+1.21,-1.05)),{key:true});
  const pl=new THREE.Group(); pl.add(at(cyl(.09,.06,1.05,0xd6cdbd,10),0,0,0,0,0,Math.PI/2)); pl.add(at(box(.24,.03,1.35,C.terra,.01),.05,0,0));
  pl.add(at(box(.14,.2,.03,C.terra),-.48,.12,0)); pl.add(at(box(.12,.025,.42,C.terra),-.48,.02,0)); pl.add(at(sph(.065,C.glass),.14,.08,0));
  const prop=grp(at(box(.025,.44,.05,C.dark),0,0,0),at(box(.025,.05,.44,C.dark),0,0,0)); prop.position.x=.56; pl.add(prop);
  piece(d,at(pl,.25,T+1.55,.35,.3,0,.08),{key:true,amp:.7,hero:true});
  piece(d,grp(at(cone(.2,.62,C.mud,7),-1.75,T+.31,.3),at(cone(.14,.42,C.mud,7),-1.48,T+.21,.55),at(cone(.11,.32,C.mud,6),-1.95,T+.16,.62)),{key:true});
  const cb=new THREE.Group(); cb.add(at(tor(.15,.05,0x3d5a2a),0,.05,0,0,Math.PI/2)); cb.add(at(tor(.1,.045,0x3d5a2a),0,.13,0,0,Math.PI/2));
  cb.add(at(cyl(.04,.05,.32,0x3d5a2a,6),.08,.3,0,0,0,-.2)); const hood=sph(.085,0x4a6b33,10,8); hood.scale.set(1.3,1,.6); cb.add(at(hood,.12,.48,0,Math.PI/2));
  piece(d,at(cb,1.75,T,.3),{key:true});
  const base0=pl.position.y; d.update=(t,dt)=>{ prop.rotation.x+=dt*.9; };
  finalize(d); }

/* 5 · 1985 dish */
{ const d=makeDio(5); base(d);
  piece(d,at(box(4.3,.03,.6,0x5b5048),0,T+.015,1.15),{amp:.2});
  const st=new THREE.Group(); st.add(at(box(.95,2.5,.85,0xd9d4cc),1.35,T+1.25,-.95)); for(let k=0;k<9;k++) st.add(at(box(.97,.045,.87,0x5d7fa8),1.35,T+.25+k*.26,-.95));
  st.add(at(box(.6,.25,.5,0xd9d4cc),1.35,T+2.62,-.95)); st.add(at(cyl(.015,.015,.45,C.dark,5),1.35,T+2.95,-.95)); piece(d,st,{key:true});
  piece(d,grp(at(box(1.2,.7,.8,C.cream),-1.15,T+.35,-1.0),at(box(1.22,.08,.82,C.terra),-1.15,T+.62,-1.0),at(box(.25,.32,.02,C.dark),-1.15,T+.16,-.59)),{key:true});
  const cart=new THREE.Group(); cart.add(at(box(.75,.16,.46,0x8a6a45,.03),0,.38,0)); cart.add(at(box(.75,.05,.04,0x6b4a33),0,.5,.21)); cart.add(at(box(.75,.05,.04,0x6b4a33),0,.5,-.21));
  cart.add(at(tor(.17,.035,0xd8c3a0),0,.17,.27)); cart.add(at(tor(.17,.035,0xd8c3a0),0,.17,-.27)); cart.add(at(cyl(.02,.02,.6,C.dark,5),0,.17,0,0,Math.PI/2));
  piece(d,at(cart,-.4,T,1.1),{key:true});
  const dish=new THREE.Group(); dish.add(at(cyl(.03,.03,.25,C.metal,6),0,.58,0));
  const pts=[]; for(let k=0;k<=8;k++){ const r=k*.05; pts.push(new THREE.Vector2(r,r*r*.9)); }
  const dm=mesh(new THREE.LatheGeometry(pts,24),mat(C.white,{flat:false,side:true})); dish.add(at(dm,0,.7,0,0,-.9)); dish.add(at(cyl(.01,.01,.32,C.metal,4),0,.83,.09,0,-.9));
  piece(d,at(dish,-.4,T,1.1),{key:true,lift:.8,hero:true});
  const ox=new THREE.Group(); const hide=0xe9e2d3; ox.add(at(box(.55,.28,.26,hide,.08),0,.4,0)); [[-.2,-.09],[-.2,.09],[.2,-.09],[.2,.09]].forEach(([a,b])=>ox.add(at(cyl(.03,.035,.26,hide,6),a,.13,b)));
  ox.add(at(box(.18,.17,.15,hide,.04),.34,.5,0)); ox.add(at(cone(.02,.15,0x6b4a33,5),.36,.64,.07,0,0,-.4)); ox.add(at(cone(.02,.15,0x6b4a33,5),.36,.64,-.07,0,0,-.4)); ox.add(at(sph(.08,hide,8,6),.12,.56,0));
  piece(d,at(ox,.55,T,1.1),{key:true});
  finalize(d); }

/* 6 · 2007 startup */
{ const d=makeDio(6); base(d); const R=rng(6);
  const blk=new THREE.Group(); blk.add(at(box(1.35,1.55,.95,0xe6dccb,.04),-.75,T+.775,-.7));
  const lit=mat(0xffd36b,{em:0xffb02e,ei:1.2}), off=mat(0x6b7a8f);
  for(let r=0;r<3;r++) for(let c=0;c<3;c++) blk.add(at(box(.2,.2,.03,(r*3+c)%3===1?lit:off),-.75+(c-1)*.38,T+.45+r*.42,-.22));
  blk.add(at(box(1.45,.06,1.05,C.terra),-.75,T+1.58,-.7)); piece(d,blk,{key:true,hero:true});
  const bk=new THREE.Group(); bk.add(at(tor(.14,.035,C.dark),-.27,.14,0)); bk.add(at(tor(.14,.035,C.dark),.27,.14,0)); bk.add(at(box(.42,.08,.06,C.terra,.02),0,.27,0));
  bk.add(at(box(.16,.1,.1,C.terra,.02),.06,.34,0)); bk.add(at(box(.18,.04,.1,C.dark),-.12,.34,0)); bk.add(at(cyl(.012,.012,.28,C.dark,4),.22,.42,0,0,Math.PI/2)); bk.add(at(sph(.035,C.gold,8,6),.3,.36,0));
  piece(d,at(bk,1.05,T,1.05,-.4),{key:true});
  const bx=new THREE.Group(); [[0,.1,0],[0,.3,0],[.04,.5,.02],[.34,.1,.05]].forEach(([x,y,z])=>{ bx.add(at(box(.3,.2,.28,0xc49a6c,.02),x,y,z,R()*.2)); bx.add(at(box(.31,.02,.06,0xe8d6b0),x,y+.1,z)); });
  piece(d,at(bx,.75,T,-.55),{key:true});
  const led=mat(0x5cff7a,{em:0x2bdc4f,ei:2.2}), sv=new THREE.Group(); for(let k=0;k<3;k++){ sv.add(at(box(.2,.55,.3,C.dark,.02),k*.24,.275,0)); for(let j=0;j<3;j++) sv.add(at(sph(.02,led,6,4),k*.24-.05,.15+j*.14,.16)); }
  piece(d,at(sv,1.45,T,-.3),{key:true});
  const cubes=new THREE.Group(); for(let k=0;k<14;k++) cubes.add(at(box(.17,.17,.17,[0x8b5cf6,0xa78bfa,0xc4b5fd,0x7c3aed][k%4],.03),(R()-.5)*.9,(R()-.5)*.6,(R()-.5)*.5,R()*3,R()*3));
  piece(d,at(cubes,-.7,T+2.35,-.6),{key:true,amp:.6});
  piece(d,grp(tree(-1.9,.7,T,.85,R),tree(1.9,.2,T,.8,R)),{});
  d.update=(t,dt)=>{ cubes.rotation.y+=dt*.25; };
  finalize(d); }

/* 7 · 2037 (recreated from the supplied metro render: elevated line, purple trains, station, bus, auto, trees). The grass disc is also the build plot. */
const plot={T:.03, cell:.52, cols:6, rows:7};
{ const d=makeDio(7); const R=rng(7), TT=plot.T;
  { const sh=new THREE.Shape(), w=1.75, h=2.05, r=.5; sh.moveTo(-w+r,-h); sh.lineTo(w-r,-h); sh.quadraticCurveTo(w,-h,w,-h+r); sh.lineTo(w,h-r); sh.quadraticCurveTo(w,h,w-r,h); sh.lineTo(-w+r,h); sh.quadraticCurveTo(-w,h,-w,h-r); sh.lineTo(-w,-h+r); sh.quadraticCurveTo(-w,-h,-w+r,-h);
    const g=new THREE.ShapeGeometry(sh,8); g.rotateX(-Math.PI/2); const pz=mesh(g,mat(0xcfc6b6,{brick:[.26,.26],rough:.85})); pz.position.y=.015; pz.castShadow=false; piece(d,pz,{amp:.08}); }
  const conc=mat(0xc8bcaa,{rough:.88}), conc2=mat(0xa99d8b,{rough:.9});
  const road=new THREE.Group(); road.add(at(box(5.0,.02,.82,mat(0x46484c,{rough:.9})),0,TT+.01,.98)); [.55,1.41].forEach(z=>road.add(at(box(5.0,.05,.09,mat(0xd6d0c4)),0,TT+.025,z)));
  for(let k=0;k<8;k++) road.add(at(box(.28,.012,.04,mat(0xf3f0ea)),-2.1+k*.6,TT+.025,.98)); piece(d,road,{amp:.15});
  const via=new THREE.Group(); [-1.55,.35,2.1].forEach(x=>{ via.add(at(box(.4,1.5,.36,conc,.03),x,TT+.75,-.15)); via.add(at(box(.98,.24,.62,conc,.04),x,TT+1.6,-.15)); });
  via.add(at(box(5.7,.16,1.0,conc,.03),.15,TT+1.8,-.15)); [-.62,.32].forEach(z=>via.add(at(box(5.7,.22,.08,conc2),.15,TT+1.97,z)));
  [-.35,.05].forEach(z=>via.add(at(box(5.6,.03,.04,mat(0x5a5c60,{metal:.6,rough:.4})),.15,TT+1.9,z))); piece(d,via,{});
  const station=new THREE.Group(); station.add(at(box(1.15,.62,1.3,mat(0xd9d2c4,{rough:.7})),0,.31,0));
  for(let k=0;k<4;k++) station.add(at(box(.18,.32,.02,mat(0x2e3644,{rough:.2})),-.4+k*.27,.33,.66));
  const roof=mesh(new THREE.CylinderGeometry(.82,.82,1.5,28,1,true,0,Math.PI),mat(0x6a6c70,{metal:.4,rough:.45,side:true})); roof.rotation.z=Math.PI/2; roof.position.set(.15,.6,0); roof.scale.set(.42,1,.84);
  station.add(roof); for(let k=0;k<3;k++) station.add(at(sph(.04,mat(0xfff2c8,{em:0xffe2a0,ei:1.4}),8,6),-.2+k*.4,.86,.3));
  piece(d,at(station,-2.25,TT+1.88,-.15),{});
  const silver=mat(0xdfdcd6,{metal:.35,rough:.32}), purple=mat(0x7c4bb4,{rough:.35}), win=mat(0x2b3240,{rough:.12,metal:.2});
  const car=(len,front)=>{ const g=new THREE.Group(); g.add(at(box(len,.5,.46,silver,.09),0,0,0)); g.add(at(box(len-.14,.15,.47,win),0,.08,0)); g.add(at(box(len-.06,.04,.468,purple),0,-.13,0));
    for(let k=1;k<4;k++) g.add(at(box(.012,.38,.472,mat(0xbab6ae)),-len/2+k*len/4,-.02,0));
    if(front){ g.add(at(box(.18,.48,.45,purple,.09),len/2,0,0)); g.add(at(box(.03,.18,.36,win),len/2+.08,.09,0)); [-.13,.13].forEach(z=>g.add(at(sph(.03,mat(0xffffff,{em:0xfff4d0,ei:1.5}),8,6),len/2+.09,-.12,z))); }
    return g; };
  const train=new THREE.Group(); train.add(at(car(1.3,false),-1.35,0,0)); train.add(at(car(1.3,true),0,0,0)); train.add(at(car(1.3,false),-2.7,0,0));
  const train2=new THREE.Group(); train2.add(at(car(1.2,true),0,0,0)); train2.add(at(car(1.2,false),-1.25,0,0));
  const tr=at(train,.9,TT+2.17,-.15); piece(d,tr,{hero:true,lift:.6});
  const bus=new THREE.Group(); bus.add(at(box(1.15,.42,.38,mat(0xf1eee8,{rough:.5}),.06),0,0,0)); bus.add(at(box(1.07,.14,.39,win),.02,.08,0)); bus.add(at(box(1.16,.06,.39,mat(0x2f6fc0)),0,-.12,0)); bus.add(at(box(.7,.04,.392,mat(0xf2a23a)),-.15,-.05,0));
  [-.36,.36].forEach(x=>[-.18,.18].forEach(z=>bus.add(at(cyl(.08,.08,.05,mat(0x1d1d20),12),x,-.2,z,0,Math.PI/2))));
  const busO=at(bus,-.6,TT+.3,.78); piece(d,busO,{});
  const auto=new THREE.Group(); auto.add(at(box(.34,.2,.26,mat(0x2f7a3a,{rough:.5}),.05),0,.0,0)); auto.add(at(box(.36,.17,.28,mat(0xf2c12e,{rough:.5}),.07),-.02,.19,0)); auto.add(at(box(.02,.12,.22,win),.17,.15,0));
  [[.14,0],[-.12,.13],[-.12,-.13]].forEach(([x,z])=>auto.add(at(cyl(.06,.06,.04,mat(0x1d1d20),10),x,-.1,z,0,Math.PI/2)));
  const autoO=at(auto,.9,TT+.17,1.15); piece(d,autoO,{});
  piece(d,grp(tree(-2.05,.45,TT,1.35,R),tree(-1.0,-1.35,TT,1.15,R)),{}); piece(d,grp(tree(1.0,-1.45,TT,1.05,R),tree(2.25,-.55,TT,.95,R)),{});
  const bs=new THREE.Group(); for(let k=0;k<8;k++) bs.add(bush((R()-.5)*5,(R()<.5?-1:1)*(1.9+R()*.6),0,.9+R()*.5,R)); piece(d,bs,{amp:.3});
  d.g.rotation.y=-.18;
  d.update=(t,dt,k)=>{ tr.position.x=.9+Math.sin(t*.35)*.4; const L=4.6;
    busO.position.x=((t*.42+1.6)%L)-L/2; busO.scale.setScalar(Math.max(.001,1-Math.pow(Math.max(0,Math.abs(busO.position.x)-1.9)/.4,2)*(k>.01?1:0)));
    autoO.position.x=L/2-((t*.55+1.4)%L); autoO.scale.setScalar(Math.max(.001,1-Math.pow(Math.max(0,Math.abs(autoO.position.x)-1.9)/.4,2)*(k>.01?1:0))); };
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
  const rb=$('btnRead'); rb.textContent=z.future&&unlocked()?'✦  Build Your City':'✦  Read Full Story'; rb.hidden=false;
  ensureSplit($('artF'));
}
let storyTimer=null;
function showStory(i){
  const go=()=>{ if(building||lensMode||!arrived||zoneIdx!==i) return; fillBlocks(i); nudgeST(); clearTimeout(storyTimer);
    storyTimer=setTimeout(()=>{ if(building||lensMode||!arrived||zoneIdx!==i) return; BLKS().forEach(b=>b.classList.add('in')); },90); };
  if($('blkL').classList.contains('in')){ hideStory(); setTimeout(go,320); } else go();
}
function hideStory(){ BLKS().forEach(b=>b.classList.remove('in')); clearTimeout(storyTimer); clearInterval(typeT); clearTimeout(sayTimer); saying=false; }
$('btnRead').onclick=()=>{ if(!started||zoneIdx<0||obBusy()) return; const z=ZONES[zoneIdx]; if(z.future&&unlocked()) enterBuilder(); else openChapter(); };
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
function updatePassport(){ $('sbN').innerHTML=`${stampCount()} <small>/ 7</small>`;
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
const ARROW=`<svg viewBox="0 0 24 24" fill="none"><use href="#arrowF"/></svg>`;
function chapterHTML(i,imgs){
  const z=ZONES[i], nx=ZONES[i+1];
  const num=s=>`${s.raw?s.n:s.n.toLocaleString()}${s.s?`<small>${s.s}</small>`:''}`;
  let end;
  if(z.future) end= unlocked()? `<div class="kick lo-label">Your turn</div><h2>Build the Bengaluru you want.</h2><div class="row"><button class="cta" string="magnetic" id="loBuild">✦  Start building</button><button class="ghost glass" string="magnetic" id="loBack">Back to the timeline</button></div>`
    : `<div class="kick lo-label">Locked, for now</div><h2>Bring me all 7 stamps.</h2><p style="font-size:18px;color:#555">You have ${stampCount()} of 7.</p><div class="row">${[0,1,2,3,4,5,6].filter(k=>!starred.has(k)).map(k=>`<button class="ghost glass" data-go="${k}">${ZONES[k].year} · ${ZONES[k].block} →</button>`).join('')}</div>`;
  else end=`<div class="kick lo-label">Memory restored</div><h2>The ${z.block} block is yours for 2037.</h2><div class="row"><button class="cta" string="magnetic" id="loBack">✦  Back to the timeline</button></div>`;
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
function enterBuilder(code){
  if(building) return; if(vrMode) exitVR(); stopFollow(); building=true; document.body.classList.add('building'); hideStory();
  if(zoneIdx!==7){ fx=snapT=restX=stopX(7); phase='rest'; zoneIdx=7; arrived=true; }
  setFutureVisible(false); B.cells.forEach(c=>c.visible=true);
  B.visitor=!!code&&!unlocked(); if(!B.grid.length||code) bInit(code);
  bRender(); whoosh(); if(!code) setTimeout(()=>toast('Every block here is one you earned. The lake is my gift.'),900);
}
function exitBuilder(){ if(!building) return; building=false; document.body.classList.remove('building'); $('bres').classList.remove('show'); B.cells.forEach(c=>c.visible=false); if(!cityBuilt()) setFutureVisible(true); if(arrived&&zoneIdx===7) showStory(7); }
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
    <div class="row">${B.visitor?`<button class="cta" string="magnetic" id="rOwn">✦  Build your own</button>`:`<button class="ghost glass" string="magnetic" id="rEdit">Keep building</button><button class="cta" string="magnetic" id="rShare">✦  Share my city</button>`}<button class="ghost glass" string="magnetic" id="rBack">Back to the timeline</button></div></div>`;
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
  if(lensMode||building||vrMode||BODY.classList.contains('lamp')) return;
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
$('btnBegin').onclick=beginAgain;
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
addEventListener('pointermove',e=>{ mx=e.clientX; my=e.clientY; cur.style.transform=`translate(${mx}px,${my}px)`; });
function cursorLabel(){
  const el=document.elementFromPoint(mx,my); let lab='';
  if(el&&el!==canvas){ const t=el.closest&&el.closest('[data-cursor]'); lab=t?t.dataset.cursor:''; hoverPiece=null; }
  else if(started&&!lensMode){ if(vrMode) lab='Look'; else if(building){ const h=pick(mx,my,B.cells); lab=h?'Place':''; } else { const h=pick(mx,my,dioMeshes()); const j=h?h.object.userData.dio:null; hoverPiece=j!=null?j:null; lab=j!=null?((arrived&&j===zoneIdx)?'Read':'Go'):(phase==='drag'?'':'Drag'); } }
  ring.classList.toggle('lab',!!lab); $('ringT').textContent=lab; canvas.style.cursor=hoverPiece!=null?'pointer':(building?'crosshair':'grab');
}

/* ================= DEEP LINKS ================= */
function jump(i){ startExperience(true); markDragged(); fx=snapT=dragT=stopX(i); camLook.x=fx; restX=START; phase='snap'; }
function handleHash(){ const h=decodeURIComponent(location.hash.slice(1));
  let m=h.match(/^stop-(\d{4})$/); if(m){ const i=ZONES.findIndex(z=>z.year===+m[1]); if(i>=0){ jump(i); return true; } }
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
  const items=lamp.state==='result'?lamp.hist.filter(h=>h.who==='lamp').slice(-1):lamp.hist;
  m.innerHTML=items.map(h=>h.who==='lamp'
    ?`<div class="lb"><div class="lh"><span class="ln">Lamp</span><time>${h.t}</time></div><p class="lx">${esc(h.text)}</p></div>`
    :`<div class="ub"><time>${h.t}</time><p class="ux">${esc(h.text)}</p></div>`).join('');
  m.scrollTop=m.scrollHeight; }
function openLamp(){ if(lamp.open||obBusy()||building||vrMode||lensMode) return;
  lamp.open=true; lamp.lastFocus=document.activeElement; lamp.hist=[]; $('lInput').value=''; lampSet('mission'); lampRender(); $('lPanel').querySelector('.lscroll').scrollTop=0;
  closeAssist(); stopFollow(); bc('lamp',true); setTimeout(()=>$('lPanel').focus({preventScroll:true}),80); }
function closeLamp(){ if(!lamp.open) return; lamp.open=false; bc('lamp',false); $('lInput').blur(); const f=lamp.lastFocus; lamp.lastFocus=null; if(f&&f.focus&&document.contains(f)) f.focus({preventScroll:true}); }
/* first 1537 → 1760 arrival only */
function lampOnArrive(i,prev){ if(i!==1||prev!==0||LS.get(LAMP_KEY)==='1'||lamp.timer) return; LS.set(LAMP_KEY,'1');
  lamp.timer=setTimeout(()=>{ lamp.timer=0; if(arrived&&zoneIdx===1) openLamp(); },1500); }
$('lClose').onclick=closeLamp; $('lGo').onclick=closeLamp;
$('obDim').addEventListener('click',()=>{ if(lamp.open) closeLamp(); });
$('lPanel').querySelectorAll('[data-lstamp]').forEach(im=>{ im.src=LAMP_STAMPS[im.dataset.lstamp]; });
$('lLamp').src=FIG['lantern-688']; $('lAv').src=FIG['lantern-688'];
const lBar=bindBar($('lBar'));
$('lInput').addEventListener('focus',()=>{ if(lamp.state==='mission') lampSet('search'); else if(lamp.state==='result'){ $('lInput').value=''; lampSet('chat'); lampRender(); } });
$('lInput').addEventListener('blur',()=>setTimeout(()=>{ if(lamp.open&&lamp.state==='search'&&!$('lInput').value.trim()&&document.activeElement!==$('lInput')) lampSet('mission'); },0));
$('lBar').addEventListener('submit',e=>{ e.preventDefault(); e.stopImmediatePropagation(); const q=$('lInput').value.trim(); if(!q){ $('lInput').focus(); return; }
  const t=lampTime(); lamp.hist.push({who:'you',text:q,t},{who:'lamp',text:lampAnswer(q),t});
  if(lamp.state==='chat'){ $('lInput').value=''; lampRender(); lBar.sync(); }
  else { lampSet('result'); lampRender(); $('lInput').blur(); } },true);
/* keyboard: Escape closes, Tab stays inside the panel */
addEventListener('keydown',e=>{ if(!lamp.open) return;
  if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); closeLamp(); return; }
  if(e.key==='Tab'){ const f=[...$('artL').querySelectorAll('button,input,[tabindex="0"]')].filter(el=>el.offsetParent!==null&&!el.disabled); if(!f.length) return;
    const a=f[0], z=f[f.length-1]; if(e.shiftKey&&document.activeElement===a){ e.preventDefault(); z.focus(); } else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus(); } return; }
  if(!e.target.closest||!e.target.closest('#artL')) e.stopPropagation(); },true);

/* answers from the site's own stories */
const LAMP_STOP=new Set('a an the and or of to in on at is are was were be been do does did i me my you your we it its this that what who whom which when where why how tell about please can could would will just more some any there their them with for from by as into than then so lamp mr hi hello hey give know show explain story stories happened happen'.split(' '));
const LAMP_TAGS=[
  'kempegowda kempe gowda fort mud founding founder pete market markets watchtower watchtowers tower towers yelahanka chieftain 1537 heritage wall',
  'lalbagh lal bagh garden gardens hyder ali tipu sultan glass house glasshouse botanical tree trees plants green 1760',
  'electricity electric power lights light lamps lamp street shivanasamudra waterfall falls kerosene 1905 clean switch',
  'iisc indian institute science scientific tata jamsetji vivekananda lab labs research ship 1909 students',
  'hal hindustan aircraft aeronautics aeroplane aeroplanes airplane plane planes walchand hirachand cobra cobras termite airfield aerodrome 1940 transit factory factories',
  'texas instruments ti satellite dish bullock cart software technology park tech silicon valley 1985 1991 mnc',
  'flipkart sachin binny bansal startup startups koramangala motorcycle books servers 2007 street',
  '2037 future lake lakes build builder 500 water bodies choices'
].map(s=>new Set(s.split(' ')));
const lampWords=t=>String(t).toLowerCase().replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(w=>w&&!LAMP_STOP.has(w)).map(w=>w.length>4&&w.endsWith('s')&&!/ss$/.test(w)?w.slice(0,-1):w);
function lampAnswer(q){ const ql=q.toLowerCase().trim(), words=lampWords(q);
  if(!words.length||/^(hi|hii+|hello+|hey|namaste|hola)\b[\s!.,]*(lamp|mr\.? lamp)?[\s!.]*$/.test(ql))
    return "Hello! I'm Mr. Lamp. Ask me about any memory on this timeline, from Kempegowda's mud fort in 1537 to the city you build in 2037.";
  if(/\b(stamp|stamps|mission|unlock|how (do|to) (i )?(play|start|use))\b/.test(ql)&&!/\b(1537|1760|1905|1909|1940|1985|2007|2037)\b/.test(ql))
    return 'Each year on the timeline shows one memory. Slide the frame over it and the memory comes back together. Every memory you restore earns a stamp. With all 7 stamps, you build 2037.';
  const scored=ZONES.map((z,i)=>{ const tags=LAMP_TAGS[i], body=lampWords([z.chapter,z.title,z.block,z.summary,...z.story,z.done,z.edge,z.tease].join(' '));
    let s=0; words.forEach(w=>{ if(tags.has(w)) s+=3; if(body.includes(w)) s+=1; }); if(ql.includes(String(z.year))) s+=8; return {i,s}; }).sort((a,b)=>b.s-a.s);
  if(!scored[0].s) return "I only know the memories on this timeline. Try asking about Kempegowda's fort, Lalbagh, the 1905 street lights, IISc, HAL, the satellite dish on a bullock cart, Flipkart or 2037.";
  const z=ZONES[scored[0].i];
  /* the two sentences of that chapter that match the question best, in story order */
  const when=/\b(when|year|date)\b/.test(ql);
  const sents=[...z.story.join(' ').split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/),...(z.done?[z.done]:[])].map((t,k)=>{ const w=lampWords(t); let s=0; words.forEach(x=>{ if(w.includes(x)) s+=1; }); if(t.includes(String(z.year))) s+=.5; if(when&&/\b(1[5-9]\d\d|20\d\d)\b/.test(t)) s+=2; return {t,k,s}; });
  const best=[...sents].sort((a,b)=>b.s-a.s||a.k-b.k).slice(0,2).sort((a,b)=>a.k-b.k).map(x=>x.t).join(' ');
  return `${z.year}, ${z.chapter}: ${best}`; }


/* ================= LOOP ================= */
const clock=new THREE.Clock(); let time=0, frameN=0, clayK=0, offX=0, offY=0, vrModeWas=false;
function resize(){ layout(); renderer.setSize(innerWidth,innerHeight,false); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); cbKey=''; }
addEventListener('resize',resize);
renderer.autoClear=false;
/*POST*/
let MANUAL=false, SKIPR=false; const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
function loop(){ const r=Math.min(.05,clock.getDelta()); if(!MANUAL) stepFrame(r); requestAnimationFrame(loop); }
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
    const want=(building&&d.i===7)?1:clamp(1-Math.abs(fx-d.g.position.x)/ASM_R,0,1);
    d.prox+=(want-d.prox)*L(.12,dt); const pr=d.prox;
    d.pieces.forEach(p=>{ const o=p.obj;
      if(p.hero){ const idle=1-ease(clamp(pr*1.5,0,1)); o.position.set(p.home.x,p.home.y+.3*idle+Math.sin(time*1.1+p.phase)*.12*idle,p.home.z);
        o.rotation.set(p.hr.x,p.hr.y+Math.sin(time*.45+p.phase)*.45*idle,p.hr.z); o.scale.copy(p.hs); return; }
      const loc=clamp((pr-p.delay)/.3,0,1); p.d+=(loc-p.d)*L(.15,dt);
      const e=clamp(p.d,0,1), inv=1-ease(e), sc=e<.002?.0001:Math.max(.0001,easeOutBack(e));
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
  updateWorld(time,REDUCED?0:rdt,camLook.x);
  bp.forEach((p,j)=>{ if(p.life>0){ p.life-=rdt*.75; p.vy-=rdt*3.2; p.x+=p.vx*rdt; p.y=Math.max(.05,p.y+p.vy*rdt); p.z+=p.vz*rdt; p.vx*=.985; p.vz*=.985; }
    tmpO.position.set(p.x,p.y,p.z); tmpO.rotation.set(p.r+time*2,p.r,0); tmpO.scale.setScalar(p.life>0?p.s*Math.min(1,p.life*2):0); tmpO.updateMatrix(); burst.setMatrixAt(j,tmpO.matrix); });
  burst.instanceMatrix.needsUpdate=true;
  if(frameN%3===0&&pointerOnCanvas) cursorLabel();
  rx+=(mx-rx)*L(.2,dt); ry+=(my-ry)*L(.2,dt); ring.style.transform=`translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px)`;
  /* render: grey timeline in the band while moving, colour inside the glass card */
  const wantK=(started&&full&&!NARROW&&phase!=='rest')?.92:0; clayK+=(wantK-clayK)*L(wantK>clayK?.12:.06,dt); if(clayK<.004) clayK=0;
  if(SKIPR||(lensMode&&lo.classList.contains('open')&&performance.now()-lensOpenedAt>1200)) return;
  const atStart=started&&full&&!lensMode&&!obBusy()&&phase==='rest'&&fx<-SP*.35; if(atStart!==BODY.classList.contains('at-start')) bc('at-start',atStart);
  const gr=glassRect();
  heroMode(full&&!OB.static,clayK===0&&phase==='rest',camLook.x);
  if(!full){ renderWorld('full-colour',gr,0); return; }
  if(gr.b<0||gr.t>H||OB.static||obBusy()||atStart){ renderer.setRenderTarget(null); renderer.setScissorTest(false); renderer.setViewport(0,0,W,H); renderer.setClearColor(0x000000,0); renderer.clear(); return; }
  renderWorld(clayK>0?'full':'card',gr,clayK);
}
let lensOpenedAt=0; new MutationObserver(()=>{ if(lo.classList.contains('open')) lensOpenedAt=performance.now(); }).observe(lo,{attributes:true,attributeFilter:['class']});

/* ================= BOOT ================= */
/* fine monochrome grain tile (SVG turbulence), a stand-in for the Figma noise image */
const GRAIN='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n" x="0" y="0"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"/></filter><rect width="180" height="180" filter="url(#n)"/></svg>`);
(async function boot(){
  const t0=performance.now(); layout(); resize();
  /* original Figma artwork */
  $('ldBg').src=FIG.landing; $('slotImg').src=FIG['metro-color']; $('stTower').src=FIG['watchtower-352']; $('obGrayG').src=RENDERS.fort; $('obGrayC').src=FIG['metro-color']; $('mLamp').src=FIG['lantern-688']; $('launcherImg').src=FIG['lantern-688'];
  document.documentElement.style.setProperty('--grain',`url("${ASSETS.noise}")`); Object.assign($('noise').style,{opacity:'1',mixBlendMode:'overlay',backgroundSize:'240px 240px'});
  const hashed=/^#(stop|city)-/.test(location.hash); if(!hashed) obLanding();
  const fontP=Promise.race([Promise.all([document.fonts.load('500 120px "Gloock"'),document.fonts.load('italic 400 28px Inter'),document.fonts.load('600 14px "Noto Sans"')]),new Promise(r=>setTimeout(r,2500))]).catch(()=>{});
  /* the Watchtower and the stamps, rendered from the 3D models */
  try{ MASCOT=ASSETS.mascot||iconOf(watchtower(1),188,{yaw:.5,pitch:.16,pad:1.02}); }catch(e){ console.warn(e); }
  document.querySelectorAll('#mascotImg,.mimg').forEach(im=>im.src=MASCOT);
  DIO.forEach((d,i)=>{ if(i<7&&d.hero&&!STAMPS[i]) try{ ICONS[i]=iconOf(d.hero.obj,80,{pad:1.0}); }catch(e){} });
  ensureSplit($('artF'));
  await fontP; initStringTune(); initScrollLibs(); pageScroll(); try{ initTimelineLenis(); }catch(e){ console.warn(e); }
  camLook.set(START,LOOKY,0); camPos.set(START,LOOKY+Math.sin(EL)*30,Math.cos(EL)*30); camera.position.copy(camPos); camera.lookAt(camLook);
  requestAnimationFrame(loop);
  handleHash();
  window.__app={ manual(on){ MANUAL=on; }, step(n=1,r=1/30){ for(let k=0;k<n;k++){ SKIPR=k<n-1; stepFrame(r); } SKIPR=false; }, goTo, enterBuilder, exitBuilder, enterVR, exitVR, openChapter, closeChapter, startFollow, stopFollow, start:()=>startExperience(true), bTap:(k)=>bTap(k), setTool:(k)=>{B.tool=k;}, bResult:()=>bResult(), setDrag(x){ markDragged(); phase='drag'; dragT=x; }, release(){ releaseSnap(restX); }, get state(){ return {fx,phase,zoneIdx,arrived,building,lensMode,vrMode,follow,stamps:stampCount(),cardDX,clayK,ST:!!ST}; }, DIO, earn:earnStamp, camera, cardRect, unlockAll:()=>$('btnUnlockAll').onclick(), ob:()=>({coach:wt.i,static:OB.static,p:OB.p,cls:BODY.className}), obReset:()=>{ try{ localStorage.removeItem(OB_KEY); }catch(e){} }, chScrollTo:(y)=>{ if(chLenis) chLenis.scrollTo(y,{immediate:true}); else loScroll.scrollTop=y; }, scrollInfo:()=>({lenis:!!chLenis,page:!!pageLenis,gsap:gsapReady,triggers:window.ScrollTrigger?ScrollTrigger.getAll().length:0,top:loScroll.scrollTop}) };
})();
