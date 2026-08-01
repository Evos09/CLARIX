# CLARIX Chrome Extension (MV3)

Records the audio of any meeting tab (Zoom, Google Meet, Teams, or any tab) and
sends it to CLARIX, which transcribes it and writes notes shaped by the meeting
type. No bot joins the call. This is an **unpacked** extension — no build step.

**The UI is a floating overlay injected into the page you're on — there is no
popup, no options page, and nothing ever opens a new tab.** Click the toolbar
icon (or press `Ctrl/Cmd+Shift+H`) to toggle it, and drag it anywhere on screen.

## How it works
- **content.js + styles.css** — injects `#clarix-hud-overlay`, a draggable
  frosted-glass card holding **everything**: connect/sign-out, Record this tab /
  Stop & save, live status, the meeting-memory ask box with cited answers, and
  links (dashboard, finished meeting, jump-to-moment).
- **background.js** (service worker) — auth (Clerk token via the hosted connect
  page), offscreen lifecycle, tab-capture handoff, `/api/memory/ask`, and the
  toolbar-icon / shortcut toggles. Broadcasts recording state to the overlay via
  `chrome.tabs.sendMessage`.
- **offscreen.js** — captures tab audio (+ mic, best-effort), records to webm,
  and runs the same 4-call upload the web app uses (`/api/upload` → Supabase PUT
  → `/api/meetings` → `/api/meetings/[id]/transcribe`).
- Auth is a **Clerk session token** sent as `Authorization: Bearer`. The token is
  issued by `https://clarixmeetings.com/extension/connect` and read back by
  `content-connect.js`.

### No-tab rule
Nothing in the extension calls `chrome.tabs.create`. Sign-in, the dashboard, and
meeting links all open through `chrome.windows.create({ type: "popup" })`, which
is a separate window — it also stays hidden from viewers when you share a single
tab.

## Shortcuts
| Shortcut | Action |
|---|---|
| **Toolbar icon** or **Ctrl/Cmd+Shift+H** | Show / hide the overlay (hide it before sharing your screen) |
| **Ctrl/Cmd+Shift+Y** | Click-through — clicks pass to the page underneath |

Rebind at `chrome://extensions/shortcuts`.

## Load it (development)
1. Deploy the web app first (the `/extension/connect` page and Phase 0 CORS must
   be live on `https://clarixmeetings.com`).
2. Open `chrome://extensions`, enable **Developer mode** (top right).
3. Click **Load unpacked** and select this `clarix-extension/` folder.
4. Pin the CLARIX icon and click it — the overlay appears on the current page.
   Click **Connect**, sign in via the popup window.
5. Open a meeting tab, click **Record this tab**, then **Stop & save**.

## Recommended: longer-lived token (optional but strongly advised)
Clerk's default session token lasts ~60s, so the extension reopens the connect
window to refresh. To avoid that, in the **Clerk Dashboard → JWT Templates**,
create a template named **`clarix-extension`** with a longer lifetime (e.g.
3600s). The connect page uses it automatically if present.

## Publishing to the Chrome Web Store (later)
- Zip the contents of this folder (not the folder itself).
- Create a Chrome Web Store developer account ($5 one-time).
- Upload the zip, fill in listing (use `marketing/` copy), submit for review.
- After the first publish, note the stable extension ID; nothing here hardcodes
  it, so no code change is needed.
- Note: the overlay requires broad host access (`<all_urls>` content script) so
  it can inject on any meeting page — expect to justify that in review.

## Known limitations (MVP)
- Token refresh briefly opens/closes the connect **window** unless the JWT
  template above is configured.
- Mic capture is best-effort; tab audio is always captured.
- The overlay can't inject on restricted pages (`chrome://`, the Web Store, the
  PDF viewer); there, the toolbar icon falls back to the standalone overlay
  window.
- The production-grade auth path is Clerk's `@clerk/chrome-extension` SDK (needs a
  bundler); this MVP intentionally avoids a build step.
