---
title: "m4l-livecam"
---

# m4l-livecam

Max 4 Live device for integrating real-time camera tracking and control into Ableton Live.

[Get it on Gumroad](https://alienmindzzz.gumroad.com/l/livecam) | [Download .amxd directly](/m4l-livecam/dist/alienmind-m4l-livecam.amxd)

---

## Overview

> **Note for Ableton users**: Technically, this is a Max for Live **MIDI device**, meaning it does not interfere with audio signals. However, it can be dropped on **any** track (Audio or MIDI) to sync with Ableton's recording transport!

![LiveCam Screenshot](/m4l-livecam.png)

LiveCam is a powerful Max for Live device that bridges real-time camera tracking and control into Ableton Live. Capture live visual feeds directly from your performance space and integrate them into your audiovisual sets.

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

1. Download the latest `livecam-dist.zip` from [Releases](https://github.com/alienmind/m4l-livecam/releases).
2. Unzip it and either run the installer for your OS (`install-windows.ps1` /
   `install-mac.sh` / `install-linux.sh` - copies the device into
   `User Library/Max For Live/m4l-livecam/`) or just keep
   `LiveCam/m4l-livecam.amxd` anywhere you like - it is a **single
   self-contained file** (the UI is embedded and self-extracts on first load).
3. In Ableton, open the browser (**B**) and navigate to the folder.
4. Drag **m4l-livecam.amxd** onto any track.

![Installation in Ableton](./images/installation.png)

## Using it

1. **Arm** the track (Arm button in Ableton).
2. Click the **folder icon** (bottom-left of the device panel) to pick where files are saved. You only need to do this once.

... (Read more on GitHub)
