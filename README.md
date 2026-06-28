# AscendFit — Web (PWA)

A real, persistent parallel of the AscendFit iOS app — same RPG progression math (XP, leveling, adaptive difficulty, quests), now running in a browser with offline storage via IndexedDB (Dexie), installable as a PWA.

## What's here vs. the in-chat artifact you saw earlier
- **Persists for real.** Data lives in IndexedDB on your device, survives refresh/restart, unlike the chat artifact (which had no storage access at all).
- **Installable.** Has a real `manifest.json` (generated from `vite.config.ts`) and service worker, so "Add to Home Screen" actually works.
- **Same Engine math.** `src/engine/*.ts` are line-for-line ports of the Swift app's `Engine/*.swift` — same constants, same formulas.
- **Wider scope.** 5 tabs (Dashboard, Stats, Quests, Achievements, Settings) and the full 20-exercise database, vs. the artifact's 2 tabs and 7 exercises.

## What this is *not*
- Not a port of the SwiftUI code itself — it's a parallel implementation, same design/logic, different stack (see the original "is it possible to make it run on Safari" conversation for why a literal port isn't possible).
- No HealthKit, no Watch companion — no web equivalent exists.
- Workout sessions use a simple fixed 5-exercise flow for now, not the adaptive weekly plan generator from the iOS app (that Engine module, `AdaptiveDifficultyEngine.ts`, is ported and ready to use, just not wired into a "weekly plan" UI yet).

---

## Setup

```sh
npm install
npm run dev
```

This starts the Vite dev server. You'll see output like:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.42:5173/
```

## Testing on your MacBook

Open the **Local** URL (`http://localhost:5173/`) in Safari or Chrome. That's it — full functionality, including the installable PWA prompt (Chrome: address bar install icon; Safari on macOS doesn't support PWA install the way iOS does, but the app works fine as a regular tab).

## Testing on your iPhone

1. Make sure your iPhone and Mac are on the **same WiFi network**.
2. On your Mac, note the **Network** URL Vite printed (something like `http://192.168.1.42:5173/`).
3. On your iPhone, open Safari and type that exact URL in.
4. To install: tap the **Share** icon → **Add to Home Screen**.

**Important caveat — read this before assuming something's broken:** that Network URL is plain `http://`, not `https://`. iOS Safari is stricter than desktop browsers about treating non-`localhost` HTTP origins as insecure, which can affect:
- Service worker registration (may not register at all over LAN HTTP on some iOS versions — the app will still *work*, it just won't cache itself for true offline use)
- The "Add to Home Screen" icon/splash screen sometimes not picking up the manifest correctly on the first try (force-quitting Safari and reopening usually fixes it)

If you hit either of those and want it to behave exactly like a normal installed PWA, the fix is deploying it to a real `https://` host (Vercel, Netlify, GitHub Pages all have free tiers and take about 5 minutes) — happy to walk through that next if it comes up.

## Building for production

```sh
npm run build
npm run preview
```

`npm run build` type-checks (`tsc -b`) and produces a real production bundle with the service worker in `dist/`. `npm run preview` serves that build locally so you can sanity-check it before deploying anywhere.

## Project structure

```
ascendfit-pwa/
├── src/
│   ├── engine/          # Pure-function ports of Engine/*.swift — same formulas
│   ├── db/               # Dexie schema, seed data, QuestStore (dedup-safe quest generation)
│   ├── hooks/            # useLiveQuery wrappers — the ViewModel-equivalent layer
│   ├── components/        # HoloPanel, NeonProgressBar, LevelUpOverlay, StatRadar
│   ├── screens/            # Onboarding, Dashboard, StatusPanel, Directives, Workout, Achievements, Settings
│   ├── types.ts
│   ├── App.tsx             # Root router + tab shell
│   └── main.tsx
├── public/
│   ├── favicon.svg
│   ├── icon-192.png       # generated placeholder — replace with real artwork before any real deployment
│   └── icon-512.png       # same
├── vite.config.ts          # PWA manifest + service worker config lives here
└── package.json
```

**One honest flag on the icons:** `icon-192.png`/`icon-512.png` are programmatically generated placeholders (a hexagon outline + "A"), not designed artwork — good enough to make the PWA installable and show *something* on your home screen, not good enough to ship publicly. Swap them before sharing this with anyone else.
