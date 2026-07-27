# Tier B — Native system-audio capture (implementation spec)

The differentiator for the desktop app: record audio the **browser can't reach**
— in-person meetings (via the mic + speakers) and native Zoom/Teams desktop apps
(system output). The webview alone can't do this; it needs native OS audio APIs.

This spec is the build plan. It is NOT yet implemented. It requires a working
Rust toolchain and a compile-fix loop (the audio APIs need iteration).

---

## Architecture (reuse everything that already works)

```
[native capture: WASAPI loopback + mic]  (Rust, new)
        │  writes  meeting.wav
        ▼
[encode + 4-call upload]  (Rust, new — mirrors lib/uploadClient.ts)
        │  Authorization: Bearer <token>
        ▼
[existing CLARIX API]  /api/upload → PUT Supabase → /api/meetings → /transcribe
        ▲
        │ token
[token bridge]  web DesktopBridge.tsx → invoke("store_bearer_token") → Rust store
```

The backend pipeline and bearer-token auth already exist (built for the Chrome
extension). Tier B only adds the **native capture** and the **native upload**,
and reuses the **token bridge** already staged on the web side.

---

## Pieces to build

### 1. Auth / token bridge  (web side already staged)
- Web: `components/desktop/DesktopBridge.tsx` (exists, unmounted) pushes a
  ~1h bearer token via `invoke("store_bearer_token", { token })`.
- Rust: a `store_bearer_token(token: String)` command that saves it in app state
  (`Mutex<Option<String>>` in `tauri::State`). Read it at upload time.
- **Capability (security-critical):** the web app is a REMOTE origin
  (`https://www.clarixmeetings.com`). Tauri v2 does NOT grant remote origins
  command access by default. Add a capability with a `remote` block scoped to
  exactly that origin and ONLY the one command:
  ```json
  {
    "identifier": "remote-token-bridge",
    "remote": { "urls": ["https://www.clarixmeetings.com"] },
    "windows": ["main"],
    "permissions": ["clarix:allow-store-bearer-token"]
  }
  ```
  Do not grant broad permissions to the remote origin — only `store_bearer_token`.
- To mount the web side: add `<DesktopBridge />` to the dashboard layout
  (`app/(dashboard)/layout.tsx`). It is a no-op in a normal browser.

### 2. Native capture  (`src-tauri/src/audio.rs`, new)
- Crate: **`cpal`** for cross-platform device I/O.
  - Windows: WASAPI **loopback** on the default output device (captures system
    audio — the other participants). `cpal` supports loopback capture; confirm
    the API/version at build time.
  - Also open the default **input** (mic) so the user's voice is captured.
  - macOS: system-output capture needs **ScreenCaptureKit** (macOS 13+) or an
    audio-capture entitlement; `cpal` covers mic but not system output on macOS.
    Ship Windows first; treat macOS system capture as a follow-up.
- Mix mic + loopback into one stream (resample to a common rate, e.g. 48kHz),
  buffer to a temp file.
- Encode: **WAV** via `hound` (simplest, lossless) or Opus/webm if size matters.
  WAV is the safe first target; the API accepts what AssemblyAI ingests.

### 3. Native upload  (`src-tauri/src/upload.rs`, new)
- Crate: **`reqwest`** (multipart/JSON) + `serde`.
- Replicate the exact 4-call sequence from `lib/uploadClient.ts` /
  `clarix-extension/offscreen.js`:
  1. `POST /api/upload` → `{ path, signedUrl }`
  2. `PUT signedUrl` (raw bytes, `Content-Type: audio/wav`, `x-upsert: true`)
  3. `POST /api/meetings` (`{ title, meetingType: "GENERAL", autoDetect: true,
     consentAcknowledged: true, storagePath, audioSize, audioFilename }`)
  4. `POST /api/meetings/{id}/transcribe`  — check `res.ok`, surface failures.
- Auth: `Authorization: Bearer <token from store_bearer_token>`. If no token,
  summon the window and prompt sign-in.

### 4. Tray + UX  (`main.rs`)
- Tray items: **Start recording** / **Stop & upload** (toggle), reflecting state.
- On stop: notify "Uploading…", then on success notify "Notes are processing"
  with the meeting URL; open `…/meetings/{id}` in the webview.
- Optional global shortcut to start/stop.

---

## Cargo dependencies to add
```
cpal = "0.15"
hound = "3"
reqwest = { version = "0.12", features = ["json", "multipart", "stream"] }
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["full"] }   # if not already pulled by tauri
```

## Build/verify loop (needs Rust installed)
1. `cd clarix-desktop && npm run dev` — confirm Tier A + updater compile first.
2. Add `audio.rs` capture; log device list; verify a WAV file is written with
   real audio (play it back).
3. Add `upload.rs`; verify a meeting appears in the web app with transcript.
4. Wire the tray Start/Stop and the token bridge; test end-to-end with the
   browser closed.

## Open decisions
- **Consent/legal:** recording system audio of a call raises the same
  consent-law issues as the extension. Add an explicit consent affordance before
  the first recording (mirror the extension's privacy stance).
- **Windows-only first?** Recommended — WASAPI loopback via `cpal` is
  well-trodden; macOS system capture (ScreenCaptureKit) is a separate effort.
- **WAV vs Opus:** start WAV (simple, reliable); optimize to Opus/webm later if
  upload size is a problem.
- **Token delivery:** the staged `DesktopBridge` reuses the `clarix-extension`
  Clerk JWT template (~1h). Fine for MVP; revisit refresh timing if uploads
  outlive the token.
