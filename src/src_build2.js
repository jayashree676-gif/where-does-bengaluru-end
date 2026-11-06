/* ================= BUILD YOUR OWN BENGALURU (2037, L2) =================
   A full-screen, calm page: one plain isometric ground (5 × 5 tiles) and a tray with the 7 stamps.
   Drag a stamp onto the ground (the same stamp can be used again and again), up to 7 in all.
   Drag a placed stamp to move it, or off the ground to remove it. Keyboard: Enter on a tray stamp
   places it on the next free tile; on a placed stamp, arrows move it and Delete removes it.
   The 3D timeline underneath is left as it was and is not rendered while this page is open. */
const BLD_STAMPS=[['tree','Tree'],['power','Clean power'],['startup','Startup'],['blossom','Blossom'],['techpark','Tech park'],['build','Build'],['lab','Lab']];
const BLD={ N:5, TW:136, TH:68, CX:400, TOP:150, MAX:7, KEY:'wdbe.build', open:false, cells:[], visitor:false, drag:null };
const bldPx=(r,c)=>[BLD.CX+(c-r)*BLD.TW/2, BLD.TOP+(c+r+1)*BLD.TH/2];           /* tile centre in stage px */
function bldCellAt(x,y){ const u=(x-BLD.CX)/(BLD.TW/2), v=(y-BLD.TOP)/(BLD.TH/2), c=Math.floor((u+v)/2), r=Math.floor((v-u)/2); return (r>=0&&c>=0&&r<BLD.N&&c<BLD.N)?r*BLD.N+c:-1; }
/* the stamp art is an isometric tile: anchor its ground (≈ 50% across, 76% down) on the tile centre */
const BLD_W=()=>BLD.TW*1.24;
function bldScale(){ return Math.min(innerWidth/1440,innerHeight/900); }
function bldDrawPlate(){ const N=BLD.N, tw=BLD.TW, th=BLD.TH, cx=BLD.CX, top=BLD.TOP, d=22, P=(x,y)=>`${x.toFixed(1)},${y.toFixed(1)}`;
  const L=[cx-N*tw/2,top+N*th/2], B=[cx,top+N*th], R=[cx+N*tw/2,top+N*th/2];
  let s=`<ellipse cx="${cx}" cy="${B[1]+d+6}" rx="${N*tw*.4}" ry="22" fill="rgba(0,0,0,.09)" style="filter:blur(12px)"/>`;
  s+=`<polygon class="sl" points="${P(...L)} ${P(...B)} ${P(B[0],B[1]+d)} ${P(L[0],L[1]+d)}"/><polygon class="sr" points="${P(...B)} ${P(...R)} ${P(R[0],R[1]+d)} ${P(B[0],B[1]+d)}"/>`;
  for(let r=0;r<N;r++) for(let c=0;c<N;c++){ const [x,y]=bldPx(r,c); s+=`<polygon class="t${(r+c)%2?' alt':''}" data-k="${r*N+c}" points="${P(x,y-th/2)} ${P(x+tw/2,y)} ${P(x,y+th/2)} ${P(x-tw/2,y)}"/>`; }
  $('bldPlate').innerHTML=s; }
function bldHot(k){ $('bldPlate').querySelectorAll('.t.hot').forEach(t=>t.classList.remove('hot')); if(k>=0){ const t=$('bldPlate').querySelector(`.t[data-k="${k}"]`); t&&t.classList.add('hot'); } }
function bldCount(){ return BLD.cells.filter(v=>v>=0).length; }
/* nearest free tile to a point (stage px), so a drop always lands */
function bldNearestFree(x,y,except=-1){ let best=-1, bd=1e9; for(let k=0;k<BLD.N*BLD.N;k++){ if(BLD.cells[k]>=0&&k!==except) continue; const [px,py]=bldPx((k/BLD.N)|0,k%BLD.N), d=(px-x)**2+((py-y)*2)**2; if(d<bd){ bd=d; best=k; } } return best; }
function bldSave(){ if(!BLD.visitor) LS.set(BLD.KEY,bldCode()); }
const bldCode=()=>BLD.cells.map((v,k)=>v>=0?k.toString(36)+v:'').join('');
function bldLoad(code){ BLD.cells=Array(BLD.N*BLD.N).fill(-1); const m=String(code||'').match(/[0-9a-o][0-6]/g)||[]; m.slice(0,BLD.MAX).forEach(p=>{ const k=parseInt(p[0],36), v=+p[1]; if(k<BLD.N*BLD.N) BLD.cells[k]=v; }); }
function bldRender(dropK=-1){ const box=$('bldItems'), w=BLD_W();
  box.innerHTML=BLD.cells.map((v,k)=>{ if(v<0) return ''; const r=(k/BLD.N)|0, c=k%BLD.N, [x,y]=bldPx(r,c), p=`translate(${(x-w*.5).toFixed(1)}px,${(y-w*.76).toFixed(1)}px)`;
    return `<button class="bs${k===dropK?' drop':''}" type="button" data-k="${k}" style="width:${w}px;height:${w}px;z-index:${(r+c)*10+5};transform:${p};--p:${p}" aria-label="${BLD_STAMPS[v][1]} on row ${r+1}, column ${c+1}. Drag or use arrow keys to move, Delete to remove."><img src="${LAMP_STAMPS[BLD_STAMPS[v][0]]}" alt=""></button>`; }).join('');
  const n=bldCount(); $('bldN').textContent=n; $('bldDots').innerHTML=Array.from({length:BLD.MAX},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('');
  $('bld').classList.toggle('full',n>=BLD.MAX); $('bldShare').disabled=!n; $('bldClear').disabled=!n;
  $('bldHint').textContent=BLD.visitor?'':n>=BLD.MAX?'All 7 stamps are on the ground. Drag one off to swap it.':n?'Tip: drag a stamp off the ground to remove it.':'Start anywhere. The ground is yours.'; }
function bldTray(){ $('bldTray').innerHTML=BLD_STAMPS.map(([k,name],i)=>`<button class="bt" type="button" data-s="${i}" aria-label="${name} stamp"><img src="${LAMP_STAMPS[k]}" alt=""><span>${name}</span></button>`).join(''); }
function bldLayout(){ $('bld').style.setProperty('--bs',bldScale()); }
/* stage px from a screen point */
function bldLocal(e){ const r=$('bldStage').getBoundingClientRect(), s=r.width/800; return [(e.clientX-r.left)/s,(e.clientY-r.top)/s]; }
function bldGhost(on,src){ const g=$('bldGhost'); if(!on){ g.style.display='none'; g.classList.remove('out'); return; } const w=BLD_W()*bldScale(); g.style.width=g.style.height=w+'px'; g.querySelector('img').src=src; g.style.display='block'; }
function bldGhostMove(e,out){ const g=$('bldGhost'), w=parseFloat(g.style.width); g.style.transform=`translate(${e.clientX-w*.5}px,${e.clientY-w*.76}px)`; g.classList.toggle('out',!!out); }
function bldStart(e,src,from){ if(BLD.visitor) return; if(from.type==='tray'&&bldCount()>=BLD.MAX){ tone(220,.04,.15); $('bldHint').textContent='All 7 stamps are on the ground. Drag one off to swap it.'; return; }
  e.preventDefault(); BLD.drag={...from,id:e.pointerId,x0:e.clientX,y0:e.clientY,moved:false,src};
  try{ e.target.setPointerCapture(e.pointerId); }catch(_){} }
addEventListener('pointermove',e=>{ const d=BLD.drag; if(!d||e.pointerId!==d.id) return;
  if(!d.moved){ if(Math.hypot(e.clientX-d.x0,e.clientY-d.y0)<4) return; d.moved=true; bldGhost(true,d.src);
    if(d.type==='tray') $('bldTray').querySelector(`.bt[data-s="${d.s}"]`).classList.add('held'); else { const b=$('bldItems').querySelector(`.bs[data-k="${d.k}"]`); b&&b.classList.add('lifting'); } }
  const [x,y]=bldLocal(e), k=bldCellAt(x,y), out=k<0&&d.type==='cell';
  bldGhostMove(e,out); bldHot(k<0?-1:bldNearestFree(x,y,d.type==='cell'?d.k:-1)); });
function bldEnd(e){ const d=BLD.drag; if(!d||e.pointerId!==d.id) return; BLD.drag=null; bldGhost(false); bldHot(-1); $('bldTray').querySelectorAll('.held').forEach(b=>b.classList.remove('held'));
  if(!d.moved){ if(d.type==='tray') bldPlaceNext(d.s); else bldRender(); return; }
  const [x,y]=bldLocal(e), onGround=bldCellAt(x,y)>=0;
  if(d.type==='tray'){ if(!onGround){ bldRender(); return; } const k=bldNearestFree(x,y); if(k<0) return; BLD.cells[k]=d.s; tone(520+d.s*40,.05,.18); bldRender(k); }
  else { if(!onGround){ BLD.cells[d.k]=-1; tone(260,.04,.14); bldRender(); } else { const k=bldNearestFree(x,y,d.k), v=BLD.cells[d.k]; BLD.cells[d.k]=-1; BLD.cells[k]=v; tone(480,.04,.12); bldRender(k); } }
  bldSave(); }
addEventListener('pointerup',bldEnd); addEventListener('pointercancel',bldEnd);
/* keyboard / tap: place on the free tile nearest the centre */
function bldPlaceNext(s){ if(BLD.visitor) return; if(bldCount()>=BLD.MAX){ tone(220,.04,.15); return; } const [cx,cy]=bldPx((BLD.N-1)/2,(BLD.N-1)/2), k=bldNearestFree(cx,cy); if(k<0) return; BLD.cells[k]=s; tone(520+s*40,.05,.18); bldRender(k); bldSave(); }
function openBuilder(code){ if(BLD.open) return; if(lamp&&lamp.open) closeLamp(); if(lensMode) closeChapter();
  BLD.visitor=!!code&&!unlocked(); bldLoad(code!=null?code:(LS.get(BLD.KEY)||'')); BLD.open=true;
  const b=$('bld'); b.hidden=false; b.classList.toggle('visitor',BLD.visitor); bldLayout(); bldTray(); bldDrawPlate(); bldRender();
  $('bldTitle').innerHTML=BLD.visitor?'Someone’s Bengaluru,<br>in 2037.':'Build the Bengaluru<br>you envision.';
  $('bldLede').textContent=BLD.visitor?'A visitor built this with their 7 stamps. Bring all 7 memories back on the timeline and you can build your own.':'Yay, you have collected all the stamps! Drag the stamp you want and place it over the grid to build the Bangalore you envision. Use the same stamp as often as you like, up to 7 stamps in all.';
  bc('bld2',true); requestAnimationFrame(()=>b.classList.add('on')); whoosh&&whoosh(); setTimeout(()=>b.focus({preventScroll:true}),60); }
function closeBuilder(){ if(!BLD.open) return; BLD.open=false; const b=$('bld'); b.classList.remove('on'); bc('bld2',false); BLD.drag=null; bldGhost(false);
  setTimeout(()=>{ if(!BLD.open) b.hidden=true; },REDUCED?0:500); if(location.hash.startsWith('#build-')) history.replaceState(null,'',location.pathname+location.search); }
function enterBuilder(code){ if(!started) startExperience(true); openBuilder(typeof code==='string'&&/^([0-9a-o][0-6]){0,7}$/.test(code)?code:null); }
function exitBuilder(){ closeBuilder(); }
$('bldBack').onclick=closeBuilder;
$('bldClear').onclick=()=>{ BLD.cells.fill(-1); bldRender(); bldSave(); tone(300,.04,.15); };
$('bldShare').onclick=async()=>{ const url=location.href.split('#')[0]+'#build-'+bldCode(); let ok=false; try{ await navigator.clipboard.writeText(url); ok=true; }catch(_){ }
  if(!ok){ try{ history.replaceState(null,'',url); }catch(_){ } } toast(ok?'Link copied. Anyone with it can see your Bengaluru.':'Your Bengaluru now has its own link in the address bar. Copy it to share.'); };
$('bldTray').addEventListener('pointerdown',e=>{ const t=e.target.closest('.bt'); if(!t) return; const s=+t.dataset.s; bldStart(e,LAMP_STAMPS[BLD_STAMPS[s][0]],{type:'tray',s}); });
$('bldTray').addEventListener('keydown',e=>{ const t=e.target.closest('.bt'); if(!t) return; if(e.key==='Enter'||e.key===' '){ e.preventDefault(); bldPlaceNext(+t.dataset.s); } });
$('bldTray').addEventListener('click',e=>{ if(e.detail===0){ const t=e.target.closest('.bt'); t&&bldPlaceNext(+t.dataset.s); } });   /* keyboard-generated click */
$('bldItems').addEventListener('pointerdown',e=>{ const b=e.target.closest('.bs'); if(!b) return; const k=+b.dataset.k; bldStart(e,LAMP_STAMPS[BLD_STAMPS[BLD.cells[k]][0]],{type:'cell',k}); });
$('bldItems').addEventListener('keydown',e=>{ const b=e.target.closest('.bs'); if(!b||BLD.visitor) return; const k=+b.dataset.k, r=(k/BLD.N)|0, c=k%BLD.N;
  if(e.key==='Delete'||e.key==='Backspace'){ e.preventDefault(); BLD.cells[k]=-1; bldRender(); bldSave(); return; }
  const mv={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key]; if(!mv) return; e.preventDefault();
  const r2=r+mv[0], c2=c+mv[1]; if(r2<0||c2<0||r2>=BLD.N||c2>=BLD.N) return; const k2=r2*BLD.N+c2; if(BLD.cells[k2]>=0) return;
  BLD.cells[k2]=BLD.cells[k]; BLD.cells[k]=-1; bldRender(); bldSave(); const nb=$('bldItems').querySelector(`.bs[data-k="${k2}"]`); nb&&nb.focus(); });
addEventListener('keydown',e=>{ if(!BLD.open) return; if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); closeBuilder(); return; }
  if(e.key==='Tab'){ const f=[...$('bld').querySelectorAll('button:not([disabled])')].filter(x=>x.offsetParent!==null); if(!f.length) return; const a=f[0], z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){ e.preventDefault(); z.focus(); } else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus(); } } },true);
addEventListener('resize',()=>{ if(BLD.open) bldLayout(); });
