# CLARIX — Chrome Web Store submission kit

Everything you need to publish the CLARIX extension. The **$5 developer account,
the zip upload, and accepting Google's terms are yours to do** — I can't create
accounts or accept agreements for you. Copy below is ready to paste.

---

## 0. One-time setup
1. Go to the **[Chrome Web Store Developer Dashboard](https://chromewebstore.google.com/devconsole)**.
2. Sign in with the Google account that should **own** the listing (use a company
   account you won't lose access to — not a personal throwaway).
3. Pay the **one-time $5 registration fee**.
4. Complete the developer identity verification Google prompts for.

## 1. Build the upload zip
From the repo root, zip the **contents** of `clarix-extension/` so `manifest.json`
sits at the root of the zip (not inside a subfolder):

```bash
cd clarix-extension
zip -r ../clarix-extension.zip . -x "*.DS_Store"
```

Upload `clarix-extension.zip` in the dashboard under **Items → New item**.

> Before zipping, bump `"version"` in `manifest.json` for every new upload —
> the Web Store rejects a re-upload with the same version number.

---

## 2. Listing copy (paste-ready)

**Item name**
```
CLARIX — AI Meeting Notes
```

**Short description** (132 char max)
```
Record any meeting tab — Zoom, Meet, Teams — and get AI notes shaped by the meeting type. No bot joins your call.
```

**Detailed description**
```
CLARIX turns any meeting in your browser into structured, shareable notes — without sending a bot into the call.

HOW IT WORKS
1. Open your Zoom, Google Meet, or Microsoft Teams call in a tab.
2. Click the CLARIX icon and press Record.
3. Press Stop. CLARIX transcribes the audio and writes notes shaped by the type of meeting it was — a standup surfaces blockers, a sales call surfaces objections and next steps.

WHY CLARIX
- No bot in the call. Nothing shows up in the participant list. The recording happens on your side, in the tab you're already in.
- Captures everyone. It records the tab's audio — every participant, not just your microphone.
- Notes that fit the meeting. CLARIX detects the meeting type and tailors the summary, decisions, and action items to it.
- Your existing account. Sign in with the CLARIX account you already use on the web — no separate login.

PRIVACY
The extension only records when you press Record. Audio is sent over an encrypted connection to your own CLARIX workspace and is never used to train AI models. You can delete any meeting at any time.

Recording responsibly is on you: recording laws vary by location and some require consent from participants. Record only where you're permitted to.

Requires a free CLARIX account — create one at clarixmeetings.com.
```

**Category:** Productivity
**Language:** English

---

## 3. Permission justifications (Google asks for each)

Paste these in the **Privacy practices** tab. Be specific — vague answers get
rejected.

| Permission | Justification |
|---|---|
| `tabCapture` | Core function: captures the audio of the meeting tab the user explicitly chooses to record, so CLARIX can transcribe it. |
| `activeTab` | Identifies the tab the user is recording and reads its title to name the meeting. |
| `offscreen` | MV3 requires an offscreen document to run MediaRecorder and assemble the captured audio into a file. |
| `tabs` | Reads the active tab's title/URL to label the recording and to open the finished meeting on clarixmeetings.com. |
| `storage` | Stores a short-lived sign-in token locally so the user doesn't reconnect on every recording. |
| Microphone (via getUserMedia) | Optional: mixes in the user's own voice alongside other participants (best-effort). |
| Host permission `clarixmeetings.com` | The extension uploads recordings and authenticates only against the CLARIX API on this domain. |

**"Are you using remote code?"** → No.
**"Does this item collect user data?"** → Yes: authentication info (the sign-in token) and user-generated content (the audio the user records). Both are used only to provide the CLARIX service; not sold; not used for anything unrelated.

**Privacy policy URL** (required):
```
https://www.clarixmeetings.com/extension/privacy
```

---

## 4. Assets to attach
- **Store icon:** 128×128 PNG — reuse `clarix-extension/icons/icon128.png`.
- **Screenshots:** at least one 1280×800 or 640×400 PNG. Good shots: the popup on
  a Google Meet tab (Record button), and a finished meeting page on the web app.
- **Small promo tile (optional):** 440×280 PNG.
- Marketing copy/visuals can be pulled from `marketing/` and the live
  `/extension` page.

---

## 5. After approval
1. Copy the approved listing URL (looks like
   `https://chromewebstore.google.com/detail/<name>/<extension-id>`).
2. Paste it into `lib/extension.ts` → `CHROME_STORE_URL`.
3. Commit + push. The `/extension` page's "Coming soon" state flips to a live
   **Add to Chrome** button automatically, and the footer link already points to it.

---

## 6. Review timeline & tips
- Review often takes a few days; audio-capture + broad permissions can draw a
  longer manual review. Don't resubmit repeatedly — that resets the queue.
- The most common rejection is a permission whose justification doesn't match
  observed behavior. The table above is written to match exactly what the code does.
- If rejected, Google emails the specific reason; fix, bump the version, re-zip,
  and re-upload.
