# Rebuilds ../index.html from shell.html (layout + CSS) and app.js (3D + interaction).
# src_worldkit.js / src_world.js: the endless procedural world. src_post.js: render + composite.
# src_hero.js: default-state focus on each stop's main asset. figassets.js / stamps.js / renders.js: Figma artwork as data URLs.
import os, subprocess, sys
d=os.path.dirname(os.path.abspath(__file__))
r=lambda f:open(os.path.join(d,f)).read()
subprocess.run([sys.executable,os.path.join(d,'kb_build.py')],check=True,stdout=subprocess.DEVNULL)   # kb/*.md -> lampkb.js
a=r('app.js').replace('/*WORLDKIT*/',r('src_worldkit.js')).replace('/*WORLD*/',r('src_world.js'))
a=a.replace('/*POST*/','/*HERO*/\n'+r('src_post.js')).replace('/*HERO*/',r('src_hero.js'))
a=a.replace('/*FIGASSETS*/',r('figassets.js')).replace('/*STAMPS*/',r('stamps.js')+r('lampstamps.js')+r('lampkb.js')).replace('/*RENDERS*/',r('renders.js'))
a=a.replace('/*BUILD2*/',r('src_build2.js'))   # Build your own Bengaluru page
open(os.path.join(d,'..','index.html'),'w').write(r('shell.html').replace('/*APP*/',a))
