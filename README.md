# Gamecraft Path

A local-first, interactive Phaser 4 and TypeScript game-development curriculum. It is designed for an experienced JavaScript developer who is new to game programming and wants both professional engineering skills and a portfolio of finished games.

## What is included

- A complete six-stage, 72-lesson learning path
- Eight fully authored Foundations lessons with live Phaser demonstrations
- Syllabus outlines for Lessons 09–72, visibly labelled as outlines
- Completion tracking for lessons and individual exercises
- Per-lesson field notes, saved automatically
- JSON progress export and import for moving between Druss and Coda
- A production build that contains all course text, interface code and Phaser locally
- Responsive keyboard- and pointer-friendly interface

The curriculum builds four portfolio games: Arena Survivor, Dungeon Delver, Tactical Operations and Mercenary Company, followed by an independent professional capstone.

## Fastest start on Linux (no install)

The archive includes a finished production build. After extracting it, enter the `phaser-game-dev-course` folder and run:

```bash
python3 -m http.server 4173 --directory dist
```

Open <http://127.0.0.1:4173>. This route needs neither npm nor an internet connection. Keep the terminal open while using the site, and press `Ctrl+C` there when finished.

## Requirements

- Linux, macOS or Windows
- Node.js 20.19 or newer (Node 22 LTS is recommended)
- npm 10 or newer
- An internet connection for the first `npm ci` only (not needed when using the included `dist` build)

## Run locally for development

From this folder:

```bash
npm ci
npm run dev
```

Open the local address printed by Vite, normally <http://127.0.0.1:5173>.

## Build and run the offline-ready version

```bash
npm run build
npm run preview
```

Open the printed address, normally <http://127.0.0.1:4173>. Keep that terminal open while using the course. The production build is in `dist/` and does not fetch course material, fonts, scripts, Phaser or art from the internet.

After the first production page load, a service worker also caches visited files for browser-level offline use. The local web server still needs to be running; browsers deliberately restrict applications opened directly from `file://`.

## Druss and Coda

Copy this entire folder to each machine, run `npm ci` once on each, and use the commands above. To move your learning record:

1. Choose **Export** on the source machine.
2. Copy the downloaded `gamecraft-progress-YYYY-MM-DD.json` file.
3. Choose **Import** on the destination machine and select that file.

The export includes lesson completion, exercise completion, notes and the last lesson visited. No account or network service is involved.

## Data and privacy

Progress is stored in the browser's `localStorage` for the exact local address you use. Clearing browser site data clears that copy, so export periodically. The site sends no telemetry and has no backend.

## Authored content versus outlines

Lessons 01–08 form the complete authored Foundations stage. Each includes concept teaching, annotated code, a real interactive Phaser demonstration, guided work, an independent challenge, a review gate and project integration.

Lessons 09–72 are curriculum outlines. The interface labels them **Syllabus outline** and explains what is not yet authored. They may still be marked complete for personal tracking, but they do not pretend to be finished tutorials.

## Useful commands

```bash
npm run dev       # local development server
npm run build     # TypeScript check and production build
npm run preview   # serve the production build locally
npm audit         # dependency security report
```

## Project structure

```text
src/data.ts       curriculum stages, lessons and authored lesson content
src/demos.ts      interactive Phaser demonstrations
src/main.ts       interface, navigation and progress interactions
src/storage.ts    local persistence and import/export validation
src/style.css     responsive visual system
public/sw.js      production offline cache
docs/AUTHORING.md guide for expanding lessons without changing the app
```

## Versions

The course currently pins Phaser 4.2.1, TypeScript 5.9.3 and Vite 8.3.8. Versions are pinned for reproducibility. Upgrade deliberately and run `npm run build` after any change.

## Asset policy

The MVP uses generated geometric graphics rather than redistributed art. Future projects should keep an `ASSETS.md` file recording source, creator, licence and any attribution requirement for every asset. Kenney CC0 packs are a strong default for teaching; individual itch.io and OpenGameArt items must be checked separately.
