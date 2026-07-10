# LiveCam — Max for Live Camera Sync

Records webcam video in sync with an Ableton Live recording session. Drop it on any armed track; when that track starts recording, LiveCam captures from your camera and writes a timestamped video file.

## Features

- Works on **any track** (audio or MIDI). As a Max MIDI Effect it never touches your signal.
- **Automatic**: recording starts and stops with the transport. Arm the track, hit record, walk away.
- **In-device camera preview** to see what the camera sees without opening another app.
- **Switch cameras** with one click to cycle through all connected devices.
- **Choose your output folder once**. The choice is remembered across sessions.
- **Portable**: unzip anywhere. No install, no config.

## Installation

1. Download the latest `livecam-dist.zip` from [Releases](https://github.com/alienmind/livecam-m4l/releases).
2. Unzip it and either run the installer for your OS (`install-windows.ps1` /
   `install-mac.sh` / `install-linux.sh` - copies the device into
   `User Library/Max For Live/LiveCam-M4L/`) or just keep
   `LiveCam/livecam-m4l.amxd` anywhere you like - it is a **single
   self-contained file** (the UI is embedded and self-extracts on first load).
3. In Ableton, open the browser (**B**) and navigate to the folder.
4. Drag **livecam-m4l.amxd** onto any track.

![Installation in Ableton](./images/installation.png)

## Using it

1. **Arm** the track (Arm button in Ableton).
2. Click the **folder icon** (bottom-left of the device panel) to pick where files are saved. You only need to do this once.

![Select Folder](./images/select-folder.png)

   The browser will ask for permission to edit files in the selected folder first time you instantiate this device - click **Edit files** to allow it.

![Allow Edit Files](./images/accept.png)

3. **On first use**, your browser may ask for permission to access your webcam — **accept this request** to enable video capture.
4. Press **global Record** + **Play** in the Ableton transport.
   LiveCam starts recording automatically when the track is armed and recording.
5. Stop the transport. The `.webm` file is written immediately.
6. **Export your audio track** from Ableton (File → Export Audio) to sync with the video.

### Putting it together

You now have two files:
- **livecam_*.webm** — your video file (from LiveCam)
- **your-track.wav/mp3** — your audio file (exported from Ableton)

Drag both files into any video editing tool (DaVinci Resolve, Premiere Pro, CapCut, etc.) and sync them by timeline. Most modern editors support WebM natively.

### Controls at a glance

| Element | Where | What it does |
|---|---|---|
| Camera preview | Fills the panel | Live feed from the active camera |
| Folder icon | Bottom-left | Choose / change output folder |
| Camera name | Top-right | Shows the active device name |
| Arrow icon (next to name) | Top-right | Switch to next camera |
| Red ring | Panel border | Visible while recording |
| Status pill | Bottom | Ready / REC / Saved … / error |

![Device Controls](./images/controls.png)

Double-click the **LiveCam** title (top-left) to open the About screen.

## Output

Files are saved as **WebM** (VP8/VP9) using your browser's `MediaRecorder`. Filename format:

```
livecam_20240101_120000.webm
```

Import this file and your exported audio into your video editor. WebM is widely supported in modern editing tools.

### Advanced: Convert to MP4

If your video editor doesn't support WebM, convert it using FFmpeg:

```bash
ffmpeg -i livecam_20240101_120000.webm -c copy output.mp4
```

Then import the MP4 and audio file into your editor.

![Recording Example](./images/recording-example.png)

## Notes

- **Video only**: This plugin records video from your webcam only. Audio must be exported separately from Ableton and combined in your video editor.
- **Output folder**: Cannot be auto-set to Ableton's project folder due to browser sandbox limitations. Pick a folder once and it's remembered via IndexedDB.
- **Webcam is single-consumer**: While editing the Max patch, two instances of the device compete for the camera. The live track device wins; the editor shows "could not start video source". That's expected.
- **WebM only**: The format that `MediaRecorder` produces natively.

## Requirements

- Ableton Live **Suite** 12.4+ (includes Max for Live / Max 9)

## Get the plugin

LiveCam is available on Gumroad: [alienmindzzz.gumroad.com/l/livecam](https://alienmindzzz.gumroad.com/l/livecam)

The source code is free and open-source under MIT. If you'd like to support development, consider buying it on Gumroad—think of it as buying me a coffee! ☕

## How the `.amxd` is built (self-contained, no manual Max step)

The device is **not** authored in Max: `scripts/build-amxd.mjs` wraps
`ableton-amxd/patcher.json` (the patcher as plain versioned JSON - an Audio
Effect: `plugin~ → plugout~` passthrough, `live.thisdevice → js wrapper.js →
jweb`) in the amxd binary container at build time, producing a **single
self-contained `livecam-m4l.amxd`**:

1. `vite-plugin-singlefile` inlines all JS/CSS into one `livecam-ui.html`.
2. `build-amxd.mjs` appends it to `wrapper.js` as base64 chunks
   (`UI_PAYLOAD_B64` / `UI_PAYLOAD_BYTES`) before embedding the script in the
   container.
3. On device load, `wrapper.js` decodes the payload and writes
   `livecam-ui.html` next to the `.amxd`, then points `jweb` at that real
   file. Extraction is skipped when an identical-size copy exists; the
   written size is verified (mismatches are posted to the Max console).

Two Max quirks force this design (simpler approaches fail): frozen
dependencies live in Max's **virtual filesystem** - `[js] File()` can open
them but they never exist on disk, so jweb/Chromium gets
`ERR_FILE_NOT_FOUND` for them - and **`File.writebytes` silently truncates
at 16384 bytes per call**, so the extractor writes 4096-byte slices.

The `jweb` uses `rendermode 1` (onscreen): offscreen rendering (the default)
never receives mouse/keyboard input inside Live's device view. To tweak the
patch interactively, open the built device in Live's Max editor, edit, and
port the changes back into `patcher.json`.

> Earlier revisions shipped `ableton-template.amxd`, a Max-authored binary
> patcher, plus `wrapper.js` and `livecam-ui.html` as sidecar files that had
> to stay next to it. That layout still works for dev (`dist/` keeps the
> loose files), but distribution is now the single `.amxd`.

## License

MIT — see [LICENSE](./LICENSE) for details.

---

More info: [livecam.alienmind.io](https://livecam.alienmind.io)
