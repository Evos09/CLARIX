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

## Auto-update (not enabled yet — needs two things)
The updater is intentionally **not wired in** because it can't work without:
1. A **signing keypair** — `npx tauri signer generate` (keep the private key
   secret; never commit it), and
2. A **hosted update feed** — easiest is **GitHub Releases** publishing a
   `latest.json` manifest.

Once you pick a release host, enabling it is: add `tauri-plugin-updater` to
`Cargo.toml`, add the updater plugin in `main.rs`, and add a `plugins.updater`
block (endpoints + `pubkey`) to `tauri.conf.json`.

## Notes
- Bundle identifier: `ai.clarix.app`.
- This folder is standalone from the Next.js web app; it is not built or deployed
  by Railway.
