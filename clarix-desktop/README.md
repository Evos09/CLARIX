# CLARIX Desktop

Wraps the CLARIX web app (https://www.clarixmeetings.com) in a native
Mac/Windows window (Tauri v2), with a system tray, a global summon shortcut,
close-to-tray, and notifications.

## What it does today (Tier A)
- Native window pointed at the live app.
- **System tray** — Open CLARIX / Quit.
- **Global shortcut** — `Ctrl/Cmd + Shift + R` brings CLARIX to the front from
  anywhere.
- **Close to tray** — closing the window hides it; use the tray's Quit to exit.
- App icons generated for Windows/macOS.

> It is a webview of the site, so it does exactly what the website does
> (in-browser recording, upload, bot). **Native system-audio capture**
> (recording in-person meetings / native Zoom/Teams apps) is **not built yet** —
> that's the "Tier B" milestone.

## Prerequisites (required to build — not installed by the web repo)
- **Rust** — https://rustup.rs
- **Node.js 18+**
- **Windows:** Microsoft C++ Build Tools + WebView2 runtime.
- **macOS:** Xcode Command Line Tools.

## Develop
```
cd clarix-desktop
npm install
npm run dev
```
To test against local web dev instead of production, change the window `url` in
`src-tauri/tauri.conf.json` to `http://localhost:3000`.

## Build installers
```
npm run build:windows        # .msi / .exe   (run on Windows)
npm run build:mac-universal   # .dmg (Intel + Apple Silicon, run on macOS)
```
Output lands in `src-tauri/target/…/bundle/`.

## Icons
Generated from `app-icon.png` (the CLARIX logomark). To regenerate after changing
the source art:
```
npx tauri icon app-icon.png
```

## Auto-update (GitHub Releases) — code present, currently DISABLED
The updater code is in place (`check_for_updates` in `main.rs`, the release
workflow in `.github/workflows/desktop-release.yml`), but it is **disabled in
config** so the app builds and runs with **no signing key**. In this state the
tray's "Check for Updates…" reports that it can't check — expected until you
enable it below.

**To enable auto-update (one-time):**
1. Generate a signing keypair (I don't handle the private key):
   ```
   npx tauri signer generate -w clarix.key
   ```
   It prints a **public key** and writes the **private key** to `clarix.key`
   (gitignored — never commit it).
2. Add this block back to `src-tauri/tauri.conf.json`, pasting the public key,
   and set `createUpdaterArtifacts` in `bundle`:
   ```json
   "bundle": { ...existing..., "createUpdaterArtifacts": true },
   "plugins": {
     "updater": {
       "endpoints": ["https://github.com/Evos09/CLARIX/releases/latest/download/latest.json"],
       "pubkey": "PASTE_PUBLIC_KEY_HERE"
     }
   }
   ```
3. In GitHub → Settings → Secrets and variables → Actions, add:
   - `TAURI_SIGNING_PRIVATE_KEY` = the contents of `clarix.key`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` = the password you set (blank if none)

**To ship an update once enabled:** bump `version` in `tauri.conf.json`, commit,
then push a tag `git tag desktop-v1.0.1 && git push origin desktop-v1.0.1`. The
workflow builds + signs Windows/macOS and creates a **draft** GitHub Release with
the installers + `latest.json`. Publish the draft, and installed apps update on
next launch.

## Notes
- Bundle identifier: `ai.clarix.app`.
- This folder is standalone from the Next.js web app; it is not built or deployed
  by Railway.
