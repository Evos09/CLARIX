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

## Auto-update (GitHub Releases) — REMOVED for now
The updater was removed from the app so it builds and runs with **no signing
key** (the updater plugin panics at startup unless a full `plugins.updater`
config + valid signing key exist — which is why an earlier build crashed on
launch with exit code 101). The release workflow
`.github/workflows/desktop-release.yml` is kept for when you enable it.

**To (re-)enable auto-update later:**
1. Generate a signing keypair (never commit the private key):
   ```
   npx tauri signer generate -w clarix.key
   ```
2. `Cargo.toml`: add `tauri-plugin-updater = "2"`.
3. `main.rs`: register `.plugin(tauri_plugin_updater::Builder::new().build())`
   and add a launch check via `app.updater()?.check()`.
4. `tauri.conf.json`: add the updater config with your **public** key, and set
   `createUpdaterArtifacts: true` in `bundle`:
   ```json
   "bundle": { ...existing..., "createUpdaterArtifacts": true },
   "plugins": {
     "updater": {
       "endpoints": ["https://github.com/Evos09/CLARIX/releases/latest/download/latest.json"],
       "pubkey": "PASTE_PUBLIC_KEY_HERE"
     }
   }
   ```
5. `capabilities/default.json`: add `"updater:default"`.
6. GitHub → Settings → Secrets → Actions: add `TAURI_SIGNING_PRIVATE_KEY` (the
   contents of `clarix.key`) and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

**To ship an update once enabled:** bump `version`, commit, push a tag
`git tag desktop-v1.0.1 && git push origin desktop-v1.0.1`. The workflow builds +
signs and drafts a GitHub Release with `latest.json`; publish it and installed
apps update on next launch.

## Notes
- Bundle identifier: `ai.clarix.app`.
- This folder is standalone from the Next.js web app; it is not built or deployed
  by Railway.
