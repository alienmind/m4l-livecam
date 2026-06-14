# LiveCam — Architecture & Developer Guide

This document covers everything needed to understand, build, and maintain the LiveCam device from source. The project is open source under the MIT license.

---

## Overview

LiveCam is a **Max for Live MIDI Effect** that records webcam video in sync with an Ableton track recording. The device has two distinct parts that run in completely separate JavaScript environments:

```
Ableton track (armed)
        │  arm / is_playing / record_mode   (Live Object Model)
        ▼
[live.thisdevice] → [js livecam.js] ──"record 1/0"──▶ [jweb] ─loads─▶ React app
        │                                                               │
        └─ on load: derives file:// URL from own path                  ├─ getUserMedia → preview + capture
           and tells jweb which HTML file to load                      ├─ enumerateDevices → switch camera
                                                                       ├─ MediaRecorder → WebM
                                                                       └─ showDirectoryPicker → write to folder
```

### Two JavaScript worlds

| World | File | Runtime | APIs available |
|---|---|---|---|
| Max-side | `livecam.js` | Max's `[js]` object (ES5) | LiveAPI, `post()`, `outlet()` — **no** browser APIs |
| Browser-side | `src/` → built `livecam-ui.html` | jweb (Chromium / CEF) | Full browser APIs — **no** Max/LiveAPI globals |

They communicate only through `outlet(0, "record", 1/0)` on the Max side and `window.max.bindInlet("record", cb)` in the browser.

---

## Repository layout

```
livecam-m4l/
├── ableton-amxd/
│   └── LiveCam.amxd          ← SOURCE .amxd (tracked in git; built in Ableton)
├── livecam.js                 ← Max glue script (tracked in git; copied to dist/ on build)
├── src/                       ← React app source
│   ├── App.tsx                    root component; orchestrates all hooks; About panel toggle
│   ├── vite-env.d.ts              declares __APP_VERSION__ injected at build time
│   ├── components/
│   │   ├── AboutPanel.tsx         About screen (double-click LiveCam title to open)
│   │   ├── CameraPreview.tsx      <video> element; shows VideoOff icon if no stream
│   │   ├── ControlBar.tsx         folder-picker icon button (bottom-left)
│   │   ├── StatusBar.tsx          pulsing REC dot + message pill
│   │   └── ui/button.tsx          CVA-based button with overlay variant
│   ├── hooks/
│   │   ├── useCamera.ts           getUserMedia + enumerateDevices; next() cycles devices
│   │   ├── useFolder.ts           showDirectoryPicker; persists handle in IndexedDB (idb-keyval)
│   │   └── useRecorder.ts         MediaRecorder → WebM blob; calls onComplete on stop
│   ├── lib/
│   │   ├── maxBridge.ts           wraps window.max.bindInlet/outlet; browser no-op fallback
│   │   └── utils.ts               cn() helper + timestamp()
│   ├── types/
│   │   └── file-system-access.d.ts  ambient types for FSA API
│   └── index.css              Tailwind v4 + oklch tokens + Geist font + animate-rec-pulse
├── scripts/
│   ├── postbuild.mjs          assembles dist/ after vite build
│   └── build-docs.mjs         renders README.md → dist/doc/index.html (also standalone)
├── jweb/
│   └── capability-test.html   probe: loads in jweb, reports which browser APIs are available
├── LiveCam.maxpat             reference patch (documents the 3-object layout; not the device)
├── index.html                 Vite dev entry (dev only)
├── vite.config.ts
├── package.json
├── tsconfig.json
├── .github/workflows/deploy.yml   GitHub Pages CI (deploys dist/doc/ on push to main)
└── dist/                      ← FULLY GENERATED — gitignored; never edit here
    ├── LiveCam.amxd               copied from ableton-amxd/
    ├── livecam.js                 copied from root livecam.js
    ├── livecam-ui.html            Vite build output (viteSingleFile, single ~350KB HTML)
    └── doc/
        ├── index.html             static project page (rendered from README.md)
        └── CNAME                  livecam.alienmind.io
```

---

## Build system

### `pnpm build`

```
tsc -b              → type-check (noEmit)
vite build          → builds src/ → dist/index.html (single inlined HTML via viteSingleFile)
node scripts/postbuild.mjs
  ├── rename dist/index.html → dist/livecam-ui.html
  ├── copy ableton-amxd/LiveCam.amxd → dist/LiveCam.amxd
  ├── copy livecam.js → dist/livecam.js
  ├── build-docs: README.md → dist/doc/index.html + CNAME
  └── create livecam-dist.zip (LiveCam/{amxd,js,html})
```

`dist/` is emptied by Vite at the start of every build (`emptyOutDir: true`). This is safe because neither the `.amxd` nor `livecam.js` live there as source files anymore.

### Key Vite settings

- `base: "./"` — all asset URLs relative; required for `file://` loading in jweb.
- `viteSingleFile` — inlines all JS+CSS into `index.html`. No separate asset files.
- `define: { __APP_VERSION__ }` — injects `package.json` version at build time; consumed by `AboutPanel`.
- `outDir: "dist"`, `emptyOutDir: true` — standard; safe because source files are outside dist/.

### `pnpm dev`

Starts Vite on `http://127.0.0.1:5173`. All camera and FSA APIs work on localhost. To simulate Max messages without Ableton, open the browser console:

```js
livecamSimulate("record", 1)   // → starts recording
livecamSimulate("record", 0)   // → stops, writes file
```

`window.livecamSimulate` is exposed by `src/lib/maxBridge.ts` when not running inside jweb.

### `pnpm build:docs`

Standalone: re-renders `dist/doc/index.html` from `README.md` without a full build. Useful if you only edited the README.

---

## How `livecam.js` works (Max-side)

The script runs in the Max `[js]` object. Entry points are `bang()` (from `live.thisdevice`) and `loadbang()`. Both call `setup()`:

1. **`loadWebview()`** — reads `this.patcher.filepath` (the absolute path to `LiveCam.amxd`), strips the filename, and builds a `file:///…/livecam-ui.html` URL. Sends it to outlet 0 which connects to `[jweb]`. This is how the device finds its UI without any hardcoded path.

2. **Three LiveAPI observers** — one on `this_device canonical_parent` for `arm`, two on `live_set` for `is_playing` and `record_mode`. The recording condition is all three truthy simultaneously. Any change re-evaluates and emits `record 1` or `record 0` to outlet 0.

`autowatch = 1` means Max hot-reloads the script whenever `livecam.js` changes on disk — no need to restart Ableton during development.

---

## How jweb works

jweb is Max's embedded Chromium (CEF). Important properties:
- `@enablejavascript 1` — required.
- `Initial URL` in Inspector — set to `about:blank`; `livecam.js` navigates it via `outlet(0, "url", derivedUrl)`.
- **`file://` is a secure context** in this Max build (Chrome 135 / Max 9 on Windows). `getUserMedia`, `showDirectoryPicker`, `MediaRecorder`, `enumerateDevices` all work from `file://` origin. No dev server needed at runtime.

The bridge (`src/lib/maxBridge.ts`) wraps `window.max.bindInlet` and `window.max.outlet` with browser-environment no-ops so the same code runs in a dev browser tab.

---

## How to create (or recreate) the `.amxd`

The `.amxd` is a binary file saved from within Ableton. You can't create it from the command line. If `ableton-amxd/LiveCam.amxd` is lost:

1. In Ableton, create a new **Max MIDI Effect** device on any track.
2. Click the device's **`…` menu → Edit in Max**. The Max editor opens (mini window inside Ableton).
3. Delete any default placeholder objects.
4. Add three objects (press **`n`**, type, click away or press Enter):
   - `live.thisdevice`
   - `js livecam.js`
   - `jweb @enablejavascript 1`
5. Wire them:
   - `live.thisdevice` outlet 0 → `js livecam.js` inlet 0
   - `js livecam.js` outlet 0 → `jweb` inlet 0
6. Open the `jweb` Inspector (`Ctrl+I`). Set **Initial URL** to `about:blank`.
7. Right-click `jweb` → **Add to Presentation**. Switch to Presentation view (`Ctrl+Alt+E`). Resize `jweb` to fill the device panel (the device is 320×180 px).
8. **File → Save** — save as `LiveCam.amxd` inside the `ableton-amxd/` folder.
9. Open **Window → Max Console** and confirm you see:
   ```
   livecam.js loaded
   livecam: loadbang
   livecam: sent url file:///…/ableton-amxd/livecam-ui.html
   livecam: observers ready
   ```

> **Note:** the `.amxd` must be in the same folder as `livecam.js` and `livecam-ui.html` at runtime. During development it's fine to keep it in `ableton-amxd/` alongside the source `livecam.js` copied there manually, or just use `dist/` after a `pnpm build`.

> **Never "Freeze"** the device (the snowflake icon). Max's Freeze is unreliable with `jweb` — the embedded web page often fails to load. Always distribute as a folder of three files.

---

## Recording detection

Recording fires when **all three** conditions are true:

| Property | Observer target | Value when true |
|---|---|---|
| `arm` | `this_device canonical_parent` | 1 |
| `is_playing` | `live_set` | 1 |
| `record_mode` | `live_set` | 1 |

This mirrors Ableton's actual recording state: a track only records when it's armed, the transport is playing, AND global record is on.

---

## Distribution

Run `pnpm build`. This produces:

- `dist/` — the device folder (three files)
- `livecam-dist.zip` — `LiveCam/{LiveCam.amxd, livecam.js, livecam-ui.html}`
- `dist/doc/` — the static project website

Attach `livecam-dist.zip` to a GitHub Release. Recipients unzip it anywhere — the path is derived at runtime, so it works on any machine as long as the three files stay together.

---

## Webcam contention

A webcam is single-consumer. If you open the Max editor while the device is live on a track, two `jweb` instances try to acquire the camera. The live track device wins; the editor's jweb shows "could not start video source". This is expected — close the Max editor to return the camera.

---

## GitHub Pages

`pnpm build` generates `dist/doc/index.html` from `README.md` and writes a `CNAME` (`livecam.alienmind.io`).

The workflow at `.github/workflows/deploy.yml` runs on every push to `main` and deploys `dist/doc/` to GitHub Pages. Custom domain must be configured in the GitHub repo settings (Pages → Custom domain: `livecam.alienmind.io`). DNS: point a CNAME record for `livecam.alienmind.io` to `alienmind.github.io`.
