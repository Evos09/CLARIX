# CLARIX HUD — page-injected overlay extension

A premium, Manifest V3 Chrome extension that injects a floating, glassmorphic AI
helper into any web page. It answers from your CLARIX meeting memory, cites the
source, and jumps to the exact moment — with screen-share privacy controls.

## Files
- `manifest.json` — MV3 manifest, content script + global command shortcuts.
- `background.js` — service worker: shortcuts, cross-origin `/api/memory/ask` fetch (with your cookies), and the borderless popup fallback.
- `content.js` — injects `#clarix-hud-overlay`, wires the ask box, drag, and toggle messages.
- `styles.css` — scoped glassmorphism (brand purple `#7c4fe8`, pulsing green “active” dot).

## Load it (unpacked)
1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select this `clarix-hud-extension/` folder.
4. Visit any page — the glass card appears top-right.

> No icon files are bundled, so Chrome shows a default toolbar icon. Drop
> `icon16/48/128.png` here and add an `icons` key to `manifest.json` to brand it.

## Shortcuts (screen-share privacy)
| Shortcut | Action |
|---|---|
| **Ctrl/Cmd + Shift + H** | Show / hide the overlay — hide it before you share your screen. |
| **Ctrl/Cmd + Shift + Y** | Toggle click-through (`pointer-events`) so clicks pass to the page. Toggle back with the same keys. |

Rebind them at `chrome://extensions/shortcuts`.

## Controls on the card
- **Ask box** → calls `/api/memory/ask` on `clarixmeetings.com` using your signed-in session. If you’re not signed in, it shows a “Sign in to CLARIX” link.
- **⇱ Pop out** → opens the overlay in a separate borderless popup window. When you share a *single tab*, that window is a different surface and stays hidden from viewers.
- **⇅ Click-through** and **✕ Hide** mirror the shortcuts.
- Drag the header to reposition.

## Notes
- Requires being signed in to `https://www.clarixmeetings.com` for live answers (the service worker sends your session cookie via `host_permissions`).
- This is separate from the `clarix-extension/` record-and-ask extension; they can coexist.
