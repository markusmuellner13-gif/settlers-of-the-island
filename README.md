# Settlers of the Island 🏝️

A faithful, mobile-first adaptation of the classic settlement-building board game —
built as an installable Progressive Web App. Play **solo against computer opponents**
or **pass-and-play with up to 4 players** on one phone.

> Fan-made, unofficial project for personal/educational use. Not affiliated with
> Catan GmbH or CATAN Studio. "Catan" is a trademark of its respective owners —
> rename/rebrand before any commercial release.

## ▶️ Play

- **Live:** deployed on Vercel (see project deployment URL)
- **Local:** `npx serve .` then open the printed URL
- **Install on your phone:** open the live URL in Safari/Chrome → *Share → Add to
  Home Screen*. The game runs fullscreen and works completely offline.

## ✨ Features

- **Real base-game rules** — 19 terrain hexes (4 forest, 4 pasture, 4 fields,
  3 hills, 3 mountains, 1 desert), 18 number tokens (2–12, no 7, none used more
  than twice, 6/8 never adjacent), randomized board every game
- **Animated setup cutscene** — tiles fly onto the board, then number tokens drop in
- **Drag-and-drop building** — slide a road, settlement, or city from the tray
  straight onto the board; legal spots glow, pieces snap into place
  (tap-to-place works too)
- **Full rules engine** — snake-draft setup with starting resources, dice
  production, robber + discard-half on 7, stealing, building costs, piece limits
  (15 roads / 5 settlements / 4 cities), distance rule, bank limits (19 per
  resource), 25-card development deck (14 knights, 5 VP, 2×3 progress),
  one-dev-card-per-turn, longest road (incl. road-breaking), largest army,
  10 VP to win
- **Trading** — player-to-player offers (AI evaluates them; humans accept/decline),
  maritime 4:1, and all 9 harbors (4× generic 3:1 + five 2:1 resource ports)
- **Solo mode** — heuristic AI that drafts strong starts, expands, upgrades,
  plays dev cards, trades with the bank, and chases longest road / largest army
- **Pass-and-play** — privacy hand-off screen between human turns
- **Mobile-game feel** — dice roll animation, token flash on production, sound
  effects (WebAudio, no assets), toasts, game log, win screen with revealed VP
- **PWA** — offline-capable service worker, home-screen icon, fullscreen display

## 🕹️ How to play

1. Pick seats on the menu (Human / Computer; seat 4 optional). Min 3 players.
2. Watch the island form, then place your two starting settlements + roads.
3. On your turn: **Roll** → collect resources → build (drag pieces!), trade, play
   dev cards → **End Turn**. First to **10 victory points** wins.

## 🧱 Tech

- Plain **HTML/CSS/JavaScript (ES modules)** + **SVG** rendering — no framework,
  no build step. 2D top-down board (chosen over 3D: matches the board game's
  readability, crisp on small screens, flawless performance everywhere).
- Rules engine (`js/game.js`), board generator (`js/board.js`), and AI
  (`js/ai.js`) are pure modules — fully unit-testable in Node.

```
index.html            app shell
css/style.css         mobile-first styling + animations
js/constants.js       real game data (decks, costs, limits)
js/board.js           hex grid math + randomized board generation
js/game.js            complete rules engine (pure state machine)
js/ai.js              computer opponent heuristics
js/ui.js              SVG rendering, cutscene, drag & drop, modals, AI driver
js/sfx.js             WebAudio sound effects
sw.js                 offline service worker
manifest.webmanifest  PWA manifest
icons/                app icon (SVG + generated PNGs)
```

## 🧪 Tests

```bash
npm test          # 14 tests: board invariants, rules, 20 full AI-vs-AI games
node tools/verify.mjs   # Playwright E2E: drives a real game in Chromium
npm run icons     # regenerate PNG icons from icons/icon.svg
```

## 📦 Releasing beyond the web

The game is a self-contained static app, so it wraps directly:

- **Android/iOS stores:** [Capacitor](https://capacitorjs.com) or
  [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) (TWA)
- **Steam:** package with [Electron](https://electronjs.org) — the UI already
  scales to desktop. (Trademark note above applies before any store release.)
