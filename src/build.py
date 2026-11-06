# Rebuilds ../index.html from shell.html (layout + CSS) and app.js (3D + interaction).
# src_worldkit.js / src_world.js: the endless procedural world. src_post.js: render + composite.
# src_hero.js: default-state focus on each stop's main asset. figassets.js / stamps.js / renders.js: Figma artwork as data URLs.
import os
d=os.path.dirname(os.path.abspath(__file__))
r=lambda f:open(os.path.join(d,f)).read()
a=r('app.js').replace('/*WORLDKIT*/',r('src_worldkit.js')).replace('/*WORLD*/',r('src_world.js'))
a=a.replace('/*POST*/','/*HERO*/\n'+r('src_post.js')).replace('/*HERO*/',r('src_hero.js'))
a=a.replace('/*FIGASSETS*/',r('figassets.js')).replace('/*STAMPS*/',r('stamps.js')).replace('/*RENDERS*/',r('renders.js'))
open(os.path.join(d,'..','index.html'),'w').write(r('shell.html').replace('/*APP*/',a))
