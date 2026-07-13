# Powerlifting Warm-Up

A personal, mobile-first web app that turns a six-stage powerlifting warm-up into a
concise, gym-friendly checklist. Everything runs in the browser — **no login, no
account, no database, no API, no paid service.** All data is stored in
LocalStorage, and the app deploys as a static site (free on Vercel).

- **Fast** to open on a phone, usable one-handed between sets.
- **Configurable** — every routine, stage, exercise, note, cue, and timer.
- **Six-stage framework:** Release → Mobilise → Stabilise → Activate → Pattern → Potentiate.
- **Two seeded routines:** *Squat + Bench* and *Deadlift*.
- **Timers** driven by wall-clock timestamps (accurate across background tabs).
- **Import / export** your data as JSON, with validation and safe fallbacks.
- **Installable PWA** with offline loading after the first visit.

---

## Quick start

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
```

Build and preview a production bundle:

```bash
npm run build    # type-checks then builds to /dist
npm run preview  # serve the built /dist locally
```

There are **no environment variables** and nothing to configure.

---

## Tech stack

React · TypeScript · Vite · Tailwind CSS · Lucide React · LocalStorage.

No backend, no auth, no database, no state-management library.

---

## Project structure

```text
public/
  manifest.webmanifest     # PWA manifest
  sw.js                    # minimal offline service worker
  icon.svg / icon-maskable.svg
src/
  components/              # reusable UI (Checkbox, Toggle, Modal, ConfirmDialog, …)
  features/
    routines/             # Edit Routine view + stage/exercise editors
    session/              # Warm-Up view (stages, exercises, post-lift reset)
    timer/                # timestamp-based countdown hook + UI
    settings/             # Settings view + import dialog
  hooks/                  # useTheme
  lib/
    storage/              # load/save + recovery
    validation/           # normalisation + import validation
    migrations/           # versioned LocalStorage migrations
    progress.ts, duration.ts, feedback.ts, icons.ts, arr.ts, ids.ts, cn.ts
  data/                   # default routines, settings, seed factory
  types/                  # versioned data model
  context/                # AppContext (routines, session, settings)
  App.tsx, main.tsx, index.css
```

---

## How it works

### Views

A compact bottom navigation switches between three views:

1. **Warm-Up** — the default screen. Progressive disclosure keeps the active stage
   expanded while completed stages collapse, so you never see a wall of text.
2. **Edit Routine** — full configuration of routines, stages, and exercises.
3. **Settings** — appearance, feedback, behaviour, and data tools.

### Data model & storage

Data is versioned (`schemaVersion`) and uses **stable string IDs** everywhere, so
reordering or editing never corrupts progress.

- **Configuration** (routines + settings) is saved under `plwu:data`.
- **Session progress** is saved *separately* under `plwu:session`, keyed by
  exercise ID. Editing a routine never disturbs an in-progress session, and
  completion is tracked per exercise so switching routines preserves each one's
  progress.
- On load, stored data is **migrated** to the current schema, then **validated
  and normalised**. If anything is corrupt or unusable, the app **recovers to the
  default routines** and shows a dismissible notice rather than crashing.

### Timers

Each timed exercise can open an inline countdown. The timer computes remaining
time from an absolute end timestamp (not an interval counter), so it stays correct
across tab switches and device sleep. It can pause/resume/reset, optionally chimes
and vibrates on completion (respecting Settings), and **never blocks** manual
check-off. Only one timer runs at a time.

### Import / export

- **Export** produces a JSON bundle with routines, settings, and a schema version.
  Session progress is **excluded by default** (opt-in toggle).
- **Import** validates the file, reports clear errors for malformed input, and
  **confirms before overwriting**. Session progress is only imported if the file
  contains it *and* you explicitly opt in.

---

## Deploy to Vercel (free, personal use)

This is a static Vite SPA. `vercel.json` is included with the correct framework,
build command, output directory, and SPA route fallback. **No environment
variables are required.**

### Option A — Deploy through GitHub

1. Create a new GitHub repository.
2. Push this project:
   ```bash
   git init
   git add .
   git commit -m "Powerlifting warm-up app"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. Go to [vercel.com/new](https://vercel.com/new) and **import the repository**.
4. Vercel auto-detects Vite. Confirm these settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Leave environment variables empty.
6. Click **Deploy**.

### Option B — Deploy through the Vercel CLI

```bash
npm i -g vercel        # install the CLI (once)
vercel login           # authenticate (once)

# From the project root:
vercel                 # create + deploy a preview
vercel --prod          # deploy to production
```

When prompted, accept the detected **Vite** framework, build command
`npm run build`, and output directory `dist`. No environment variables are needed.

---

## Deploy to GitHub Pages (free)

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that
builds the app and publishes it to Pages automatically. The Vite `base` path is
computed from the repository name, so assets, the manifest, and the service worker
all work correctly whether the site is served from a subpath (`/<repo>/`) or root.

1. Create a GitHub repository (must be **public** for free Pages) and push:
   ```bash
   git init
   git add .
   git commit -m "Powerlifting warm-up app"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main` (or run the **Deploy to GitHub Pages** workflow from the Actions
   tab). When it finishes, your site is live at:
   ```
   https://<you>.github.io/<repo>/
   ```

Notes:

- If you name the repository `<you>.github.io`, the workflow serves it at the root
  (`https://<you>.github.io/`) automatically.
- There are no secrets or environment variables to configure.
- This app uses no client-side routing, so Pages' lack of SPA rewrites is not an
  issue — refreshing and installing both work.

## PWA / install

- The app ships a web manifest and a small service worker (registered only in
  production builds). After the first online visit it loads offline.
- On a phone, use the browser's **"Add to Home Screen"** to install it in
  standalone mode.
- **Icons:** `public/icon.svg` and `public/icon-maskable.svg` are provided as
  scalable SVGs. Most modern browsers accept SVG icons. If you want raster PNGs
  for maximum compatibility, export `192×192` and `512×512` PNGs from the SVG,
  drop them in `public/`, and add them to the `icons` array in
  `public/manifest.webmanifest`.

---

## Accessibility & responsiveness

- Semantic HTML, labelled controls, visible focus rings, and a skip link.
- Large (≥44px) tap targets; checkboxes and switches are native inputs styled for
  clarity, so screen readers and keyboards work as expected.
- Respects `prefers-reduced-motion` and `prefers-color-scheme`.
- Mobile-first (optimised for ~375–430px) and centred within a readable maximum
  width on tablets and desktops, with iOS safe-area support.

---

## Notes

- Everything is local to the browser it runs in. Clearing site data or using a
  different browser/device starts fresh — use **Export** to back up or migrate.
- No analytics, no tracking, no social features, no gamification.
