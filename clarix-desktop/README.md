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

## Auto-update (GitHub Releases) — ENABLED as of 1.0.4
Both Windows and macOS self-update from the GitHub Release feed. Nothing to
click: `main.rs` checks `releases/latest/download/latest.json` on launch and
every 6 hours after.

**When updates apply.** A new version is downloaded and installed **at launch
only**, then the app relaunches itself. An instance that is already running just
raises a notification and waits for the next start. That asymmetry is
deliberate — updating replaces the running binary (on Windows the installer
terminates the app), and a surprise relaunch mid-meeting would lose the
recording.

Every failure path is logged to stderr and swallowed: no network, no GitHub, or
a bad signature must never stop CLARIX from opening. The cost is that a failed
update is quiet — check the console if a version seems stuck.

### Keys
The keypair was generated with `npx tauri signer generate -w ~/.tauri/clarix.key`
and lives **outside this repo** at `~/.tauri/clarix.key`. Never commit it.

- **Public** half is in `tauri.conf.json` → `plugins.updater.pubkey`. Public by
  design; it is what installed apps use to verify a download.
- **Private** half must exist as the `TAURI_SIGNING_PRIVATE_KEY` repository
  secret (Settings → Secrets and variables → **Actions**), plus
  `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (empty for this key). The release
  workflow fails loudly if it is missing.

> Losing `~/.tauri/clarix.key` means no already-installed app can ever accept an
> update again — a new key would fail verification. Back it up. Replacing it
> requires shipping a new build by hand to every user.

This is **not** OS code-signing. The app is still unsigned for Windows
SmartScreen and macOS Gatekeeper, which only affects the first-run install
warning.

### Shipping an update
1. Bump `version` in all three: `package.json`, `src-tauri/Cargo.toml`,
   `src-tauri/tauri.conf.json`. They must agree.
2. Commit, then tag: `git tag desktop-v1.0.5 && git push origin desktop-v1.0.5`
3. The workflow builds Windows + macOS, signs, and drafts a Release.
4. **Publish the draft.** `releases/latest/download/…` does not resolve for a
   draft, so an unpublished release reaches nobody. Publishing *is* the ship.
5. Optionally drop the new `.dmg`/`.exe` into `/public/downloads` and bump
   `lib/downloads.ts` so fresh downloads get the new version too.

## Notes
- Bundle identifier: `ai.clarix.app`.
- This folder is standalone from the Next.js web app; it is not built or deployed
  by Railway.
