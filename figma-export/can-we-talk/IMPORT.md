# Import **Can We Talk?** into Figma

Local live preview: http://localhost:3000/can-we-talk  

Empty Figma file already created (MCP):  
**https://www.figma.com/design/ciGqZ4t8mIrksqq9Xb8ei2**  
(`fileKey: ciGqZ4t8mIrksqq9Xb8ei2`) — blank canvas waiting for these screens.

This folder:

| File | Use |
|------|-----|
| `01-home.svg` | Home artboard |
| `02-topics.svg` | Topics artboard |
| `03-connect.svg` | Connect artboard |
| `import.html` | All 3 screens for html.to.design |

Colors: wash `#FFF7ED`, orange `#FF8918` / `#FF9710` / `#D55200`, ink `#1A1410`.  
Fonts: **Fredoka** (headings) + **Nunito** (body) — install from Google Fonts if text looks off after SVG place.

---

## Fastest path (recommended)

1. Open the empty file: https://www.figma.com/design/ciGqZ4t8mIrksqq9Xb8ei2  
2. In Finder go to:  
   `/Users/mac/Projects/roundtable-app/figma-export/can-we-talk/`  
3. Drag `01-home.svg`, `02-topics.svg`, `03-connect.svg` onto the Figma canvas (place side by side).  
4. Select each placed SVG → right-click → **Ungroup** (or Flatten if you prefer a single image).  
5. Optional: wrap each in a **Frame** named `01 — Home`, `02 — Topics`, `03 — Connect` (390×844).

### Wire the prototype

1. Switch to **Prototype** mode.  
2. From Home CTA / screen → **On click** → Navigate to Topics (Smart Animate, Ease Out, ~400ms).  
3. Topics CTA → Connect.  
4. Connect “Back to home” → Home; primary CTA can stay or link to your `/counsel` notes.  
5. Set **Flow starting point** on Home.

---

## Alternative: html.to.design

1. Open `import.html` in Chrome (`open import.html` from this folder).  
2. In Figma, install/open **html.to.design**.  
3. Import from the open page (or copy each `.phone` block).  
4. Place into the same Figma file above.

---

## Optional: live app screenshots

```bash
cd /Users/mac/Projects/roundtable-app && npm run dev
# open http://localhost:3000/can-we-talk — screenshot each step, paste into Figma
```

---

## Note on MCP

`create_new_file` succeeded (empty file linked above).  
`use_figma` / `generate_figma_design` were still **Starter rate-limited**, so screens were not auto-drawn into Figma — use the drag-SVG steps.
