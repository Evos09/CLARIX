# CLARIX Chrome Extension (MV3)

Records the audio of any meeting tab (Zoom, Google Meet, Teams, or any tab) and
sends it to CLARIX, which transcribes it and writes notes shaped by the meeting
type. No bot joins the call. This is an **unpacked** extension — no build step.

## How it works
- **popup** — sign-in + Record/Stop UI.
- **background.js** (service worker) — auth (Clerk token via the hosted connect
  page), offscreen lifecycle, tab-capture handoff.
- **offscreen.js** — captures tab audio (+ mic, best-effort), records to webm,
  and runs the same 4-call upload the web app uses (`/api/upload` → Supabase PUT
  → `/api/meetings` → `/api/meetings/[id]/transcribe`).
- Auth is a **Clerk session token** sent as `Authorization: Bearer`. The token is
  issued by `https://clarixmeetings.com/extension/connect` and read back by
  `content-connect.js`.

## Load it (development)
1. Deploy the web app first (the `/extension/connect` page and Phase 0 CORS must
   be live on `https://clarixmeetings.com`).
2. Open `chrome://extensions`, enable **Developer mode** (top right).
3. Click **Load unpacked** and select this `clarix-extension/` folder.
4. Pin the CLARIX icon, open the popup, click **Connect account**, sign in.
5. Open a meeting tab, click **Record this tab**, then **Stop & save**. The
   finished meeting opens on the web app.

## Recommended: longer-lived token (optional but strongly advised)
Clerk's default session token lasts ~60s, so the extension reopens the connect
tab to refresh. To avoid that, in the **Clerk Dashboard → JWT Templates**, create
a template named **`clarix-extension`** with a longer lifetime (e.g. 3600s). The
connect page uses it automatically if present.

## Publishing to the Chrome Web Store (later)
- Zip the contents of this folder (not the folder itself).
- Create a Chrome Web Store developer account ($5 one-time).
- Upload the zip, fill in listing (use `marketing/` copy), submit for review.
- After the first publish, note the stable extension ID; nothing here hardcodes
  it, so no code change is needed.

## Known limitations (MVP)
- Token refresh briefly opens/closes the connect tab unless the JWT template above
  is configured.
- Mic capture is best-effort; tab audio is always captured.
- The production-grade auth path is Clerk's `@clerk/chrome-extension` SDK (needs a
  bundler); this MVP intentionally avoids a build step.
