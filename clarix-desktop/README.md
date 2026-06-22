# CLARIX Desktop

Wraps the CLARIX web app in a native Mac/Windows window (Tauri v2).

## Prerequisites
- Rust (https://rustup.rs)
- Node.js 18+
- Mac: Xcode Command Line Tools. Windows: MS C++ Build Tools + WebView2.

## Development
cd clarix-desktop
npm install
npm run dev

By default it points at https://clarix.ai. To test against local dev, change
the window url in src-tauri/tauri.conf.json to http://localhost:3000.

## Building
npm run build:mac-universal   # .dmg (Intel + Apple Silicon)
npm run build:windows         # .msi / .exe

Add real icons under src-tauri/icons (icon.png, icon.icns, icon.ico) before building.
