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

## Auto-update (wired — GitHub Releases)
The updater is fully wired in code: the app checks GitHub Releases on launch and
silently installs a newer **signed** build (see `check_for_updates` in
`main.rs`, `plugins.updater` in `tauri.conf.json`, and the
`.github/workflows/desktop-release.yml` release workflow). Feed URL:
`https://github.com/Evos09/CLARIX/releases/latest/download/latest.json`.

**One-time activation you must do (I don't handle the private key):**
1. Generate a signing keypair:
   ```
   npx tauri signer generate -w clarix.key
   ```
   It prints a **public key** and writes the **private key** to `clarix.key`
   (this file is gitignored — never commit it).
2. Paste the printed public key into `src-tauri/tauri.conf.json` →
   `plugins.updater.pubkey` (replacing the `REPLACE_WITH_...` placeholder).
3. In GitHub → Settings → Secrets and variables → Actions, add:
   - `TAURI_SIGNING_PRIVATE_KEY` = the contents of `clarix.key`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` = the password you set (blank if none)

**To ship an update:** bump `version` in `tauri.conf.json`, commit, then push a
tag:
```
git tag desktop-v1.0.1 && git push origin desktop-v1.0.1
```
The workflow builds + signs Windows/macOS, and creates a **draft** GitHub
Release with the installers + `latest.json`. Publish the draft, and installed
apps update themselves on next launch.

> Until step 2 is done, `tauri build`/`dev` will fail on the placeholder pubkey —
> that's expected; generate the key first.

## Notes
- Bundle identifier: `ai.clarix.app`.
- This folder is standalone from the Next.js web app; it is not built or deployed
  by Railway.
