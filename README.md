# Where does Bengaluru Ends?

*500 years in 5.8 m · told by the Watchtower*

A digital slider museum timeline of Bengaluru, narrated by Kempegowda's Watchtower. A glass frame slides along a 500-year timeline. Wherever it lands, a 3D memory of the city assembles itself and comes alive.

![Landing](media/01-landing.jpg)

## Run it

Open `index.html` in a modern browser. Everything is in that one file. It loads Three.js, GSAP, Lenis and StringTune from jsdelivr, so it needs an internet connection.

## Features

**Opening and onboarding**
- Landing screen with a slow background zoom and the title rising in
- Six-step guided tour that spotlights each control (first visit only; click or Enter to continue, Esc to skip)
- Mission panel with the lantern guide
- Drag-to-start: drag the frame right and the 1537 scene comes into the frame in colour

**The sliding frame**
- Drag the glass frame along the timeline, or use the side handles, arrow keys or previous/next buttons
- The frame is a lens: grey archive outside, full colour inside

**Living 3D memories**
- 8 hand-built 3D scenes from 1537 to 2037 in a golden-hour miniature style
- Each scene assembles when the frame lands on it, then comes alive (trains, traffic, DNA, bubbling flasks, flags, swaying trees)

**Story and game**
- Chapter text and the Watchtower's narration for every stop
- "Read Full Story" opens a scrolling chapter page (Lenis smooth scroll, GSAP ScrollTrigger)
- Stamp passport: 7 stamps unlock 2037, where you build your own city and share it by link
- VR view, Follow View (guided tour), Share, Help

**Lantern assistant (UI ready)**
- Launcher and "Ask me anything" bar with all designed states (empty, focused, typing)
- Fires a `lantern:ask` browser event with the typed text; not yet connected to an AI service

**Quality**
- Built to the Figma frames at 1440 × 900; responsive down to phones
- Keyboard navigation, visible focus states and reduced-motion support

| | |
|---|---|
| ![Guided tour](media/02-guided-tour.jpg) | ![Mission](media/03-mission.jpg) |
| ![Drag to start](media/04-drag-to-start.jpg) | ![Chapter](media/05-chapter.jpg) |
| ![Chapter page](media/06-chapter-page.jpg) | ![2037 builder](media/07-builder-2037.jpg) |

## Editing

- `src/shell.html`: layout and CSS
- `src/app.js`: 3D world, interaction, onboarding and assistant states
- `src/figassets.js`: Figma artwork as data URLs (originals in `src/assets/`)
- `src/renders.js`: reference renders shown on chapter pages

Rebuild after editing: `python3 src/build.py`

## Known gaps

- Noe Display is a licensed font and is not included. Gloock stands in.
- The lantern assistant has no reply, loading or error designs yet, so sending a message shows nothing.
- Stamps for years other than 1537 are rendered from the 3D models.

## Built with

Three.js · GSAP ScrollTrigger · Lenis · StringTune
