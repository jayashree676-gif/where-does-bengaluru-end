# Rebuilds ../index.html from shell.html (layout + CSS) and app.js (3D + interaction).
# figassets.js holds the Figma artwork as data URLs; renders.js holds the reference renders.
import os
d=os.path.dirname(os.path.abspath(__file__))
r=lambda f:open(os.path.join(d,f)).read()
a=r('app.js').replace('/*FIGASSETS*/',r('figassets.js')).replace('/*RENDERS*/',r('renders.js'))
open(os.path.join(d,'..','index.html'),'w').write(r('shell.html').replace('/*APP*/',a))
