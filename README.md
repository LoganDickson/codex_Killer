# Lorcana Deck Lab

Fully static Disney Lorcana deck building and matchup simulation app built with React + TypeScript.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Zustand
- Recharts
- Static local card DB (`src/data/cards.json`)
- `localStorage` persistence
- Web Worker powered Monte Carlo simulations

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The static output is generated in `dist/` and is suitable for GitHub Pages.

## GitHub Pages deployment

1. Update `base` in `vite.config.ts` to match your repo name if needed.
2. Build the site:
   ```bash
   npm run build
   ```
3. Deploy contents of `dist/` to your `gh-pages` branch.
   Example with `gh-pages` package:
   ```bash
   npx gh-pages -d dist
   ```
4. In GitHub repo settings, set Pages source to `gh-pages` branch root.

## Notes

- Routing uses `HashRouter` to work on static hosting.
- There are no backend services, API routes, or runtime servers.
- Simulation iterations are capped at 10,000 and run in a Web Worker.
