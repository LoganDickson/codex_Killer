# Lorcana Deck Lab (Plain HTML/CSS/JS)

A fully static Disney Lorcana deck builder and matchup simulator built with **plain HTML, CSS, and JavaScript**.

## Tech approach

- No backend
- No server runtime dependencies
- No API routes
- No database
- All data is local (`data/cards.json`)
- Deck persistence via `localStorage`
- Monte Carlo simulations run in-browser via Web Worker (`js/simulationWorker.js`)

## Run locally

Because this app loads JSON via `fetch`, serve the folder with any static server:

```bash
python -m http.server 4173
```

Then open:

- `http://localhost:4173`

## GitHub Pages deployment

1. Push repository to GitHub.
2. In repository Settings → Pages, set source to your main branch root (or `/docs` if you prefer).
3. Ensure these files are published:
   - `index.html`
   - `css/styles.css`
   - `js/app.js`
   - `js/simulationWorker.js`
   - `data/cards.json`
4. Open the published Pages URL.

## Features

- Card database with 54 Lorcana-style mock cards.
- Client-side combinable filters (ink color, cost range, inkable, legality, type, text search).
- Deck builder with:
  - Add/remove cards
  - Quantity tracking
  - Rule checks (min 60 cards, max 4 copies)
  - Save/load/delete decks in `localStorage`
  - Import/export deck text
- Deck stats visualization (mana curve, color distribution, type distribution).
- Matchup analyzer:
  - Deck A / Deck B selection
  - 1 to 10,000 simulation runs
  - Progress bar
  - Cancellation
  - Win rate + turn distribution outputs
