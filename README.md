# Game Hub

A mobile-first collection of browser games. Built with Vite, React, TypeScript and Tailwind CSS, and installable as a PWA.

## Develop

```sh
npm install
npm run dev      # local dev server
npm test         # unit tests
npm run lint
npm run build    # production build in dist/
```

## How it fits together

- `src/core/registry.ts` lists every game. Games without a `load` function show a "Coming soon" page.
- Each game declares an `orientation` (`portrait`, `landscape` or `any`). The game page tries to lock that orientation and shows a "Rotate your device" prompt on touch devices held the wrong way.
- `GameStage` renders a game at a fixed logical size (720×1280 portrait, 1280×720 landscape, 1000×1000 any) and scales it uniformly to fit the screen.

## Updates

`src/pwa/updates.ts` registers the service worker and checks for a new version every 15 minutes, whenever the app comes back to the foreground, and when the device comes back online. An installed app that is resumed from the background never navigates, so the browser would otherwise never look for one.

When a new version is found, `UpdateNotice` shows a "Downloading update…" toast. Once it is installed, the app reloads straight away if that won't disrupt anyone (just launched, or in the background, and not in a game). Otherwise it shows an "Update ready" toast with a Restart button.

## Adding a game

1. Create `src/games/<slug>/index.tsx` with a default-exported component that takes `GameProps`.
2. Add `load: () => import('../games/<slug>')` to the game's entry in `src/core/registry.ts`.

## Deploy

Import the repository in Vercel. It detects Vite automatically, and `vercel.json` routes every page to the app.
