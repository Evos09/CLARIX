// CLARIX extension — service worker (MV3).
// Owns: auth (Clerk token via the hosted connect page), the offscreen document
// lifecycle, tab-audio capture handoff, and popup state. The actual recording +
// upload runs in the offscreen document (see offscreen.js); this worker hands it
// a captured-tab stream id and a fresh bearer token on request.

const CLARIX_ORIGIN = "https://www.clarixmeetings.com";
const CONNECT_URL = `${CLARIX_ORIGIN}/extension/connect`;

// ---- in-memory state (popup reads it via GET_STATE) ----
let state = { recording: false, status: "idle", tabId: null, meetingId: null, error: null };
const pendingConnect = []; // resolvers waiting for a token from the connect tab

/** Open a URL in a small borderless popup WINDOW (never a tab). Used for the
 *  sign-in page and for opening a meeting from the overlay. A popup window is
 *  also a separate surface, so it stays hidden when sharing a single tab. */
async function openPopupWindow(url, width = 420, height = 620) {
  try {
    return await chrome.windows.create({ url, type: "popup", width, height, focused: true });
  } catch {
    return null;
  }
}

function setState(patch) {
  state = { ...state, ...patch };
  // The overlay lives in content scripts, which runtime.sendMessage does NOT
  // reach — push state to every tab that has one.
  chrome.tabs.query({}, (tabs) => {
    for (const t of tabs) {
      if (t.id != null) chrome.tabs.sendMessage(t.id, { type: "STATE", state }).catch(() => {});
    }
  });
}

// ---- token helpers ----
async function getStoredToken() {
  const { clarixToken } = await chrome.storage.local.get("clarixToken");
  return clarixToken || null;
}
function jwtExpiring(token) {
  try {
    const [, payload] = token.split(".");
    const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return !exp || exp * 1000 - Date.now() < 15000; // refresh if <15s left
  } catch {
    return true;
  }
}

// Returns a valid bearer token, opening the connect page to (re)issue one if needed.
async function ensureToken() {
  const existing = await getStoredToken();
  if (existing && !jwtExpiring(existing)) return existing;
  return new Promise((resolve, reject) => {
    pendingConnect.push({ resolve, reject });
    // Popup WINDOW, never a tab — the overlay is the only in-page surface.
    openPopupWindow(CONNECT_URL, 480, 680);
    setTimeout(() => {
      const i = pendingConnect.findIndex((p) => p.reject === reject);
      if (i >= 0) {
        pendingConnect.splice(i, 1);
        reject(new Error("Timed out waiting for CLARIX sign-in."));
      }
    }, 120000);
  });
}

async function onTokenReceived(token, tabId) {
  await chrome.storage.local.set({ clarixToken: token });
  if (tabId) chrome.tabs.remove(tabId).catch(() => {});
  while (pendingConnect.length) pendingConnect.shift().resolve(token);
}

async function apiFetch(path, init = {}, token) {
  const t = token || (await ensureToken());
  const res = await fetch(`${CLARIX_ORIGIN}${path}`, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${t}` },
  });
  if (res.status === 401) {
    await chrome.storage.local.remove("clarixToken");
    throw new Error("Session expired — reconnect your CLARIX account.");
  }
  return res;
}

// ---- offscreen document ----
async function ensureOffscreen() {
  const has = await chrome.offscreen.hasDocument?.();
  if (has) return;
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["USER_MEDIA"],
    justification: "Record meeting tab audio for CLARIX notes.",
  });
}

// ---- recording control ----
async function startRecording() {
  setState({ error: null });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) throw new Error("No active tab to record.");
  if (!/^https?:/i.test(tab.url || "")) {
    throw new Error("Open the meeting tab (Zoom, Meet, Teams…) and click Record there — browser system pages like chrome:// can't be captured.");
  }
  await ensureToken(); // force sign-in before we start capturing
  await ensureOffscreen();
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
  const title = `Meeting — ${tab.title || "Untitled"}`.slice(0, 180);
  chrome.runtime.sendMessage({ target: "offscreen", type: "START", streamId, title });
  setState({ recording: true, status: "recording", tabId: tab.id, meetingId: null });
}

function stopRecording() {
  chrome.runtime.sendMessage({ target: "offscreen", type: "STOP" });
  setState({ status: "uploading" });
}

// ---- message router ----
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      switch (msg.type) {
        case "GET_STATE":
          sendResponse({ state });
          break;
        case "CONNECT": {
          const token = await ensureToken();
          const res = await apiFetch("/api/me", {}, token);
          sendResponse({ ok: res.ok, me: res.ok ? await res.json() : null });
          break;
        }
        case "CHECK_AUTH": {
          const token = await getStoredToken();
          if (!token || jwtExpiring(token)) return sendResponse({ signedIn: false });
          const res = await apiFetch("/api/me", {}, token).catch(() => null);
          sendResponse({ signedIn: !!res?.ok, me: res?.ok ? await res.json() : null });
          break;
        }
        case "SIGN_OUT":
          await chrome.storage.local.remove("clarixToken");
          sendResponse({ ok: true });
          break;
        case "START_RECORDING":
          await startRecording();
          sendResponse({ ok: true });
          break;
        case "STOP_RECORDING":
          stopRecording();
          sendResponse({ ok: true });
          break;

        // Every link in the card (meetings, connect, dashboard) routes here so we
        // open a popup window instead of a tab.
        case "OPEN_URL":
          await openPopupWindow(
            msg.url?.startsWith("http") ? msg.url : `${CLARIX_ORIGIN}${msg.url || "/"}`,
            msg.width || 900,
            msg.height || 720,
          );
          sendResponse({ ok: true });
          break;

        // from content-connect.js (runs on the connect page)
        case "CLARIX_TOKEN":
          await onTokenReceived(msg.token, sender.tab?.id);
          sendResponse({ ok: true });
          break;

        // from offscreen.js
        case "OFFSCREEN_GET_TOKEN":
          sendResponse({ token: await ensureToken() });
          break;
        case "OFFSCREEN_STATUS":
          setState({ status: msg.status });
          sendResponse({ ok: true });
          break;
        case "OFFSCREEN_DONE":
          setState({ recording: false, status: "done", meetingId: msg.meetingId });
          await chrome.offscreen.closeDocument().catch(() => {});
          sendResponse({ ok: true });
          break;
        case "OFFSCREEN_ERROR":
          setState({ recording: false, status: "error", error: msg.error });
          await chrome.offscreen.closeDocument().catch(() => {});
          sendResponse({ ok: true });
          break;
        default:
          sendResponse({ ok: false });
      }
    } catch (e) {
      setState({ status: "error", error: String(e.message || e) });
      sendResponse({ ok: false, error: String(e.message || e) });
    }
  })();
  return true; // async response
});

// ---- toolbar icon + global shortcuts → the injected overlay (content.js) ----
// There is no default_popup: the overlay IS the UI, so clicking the icon just
// toggles it inside the current page.
async function messageActiveTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.sendMessage(tab.id, message).catch(() => {});
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_VISIBILITY" }).catch(() => {
    // Restricted page (chrome://, Web Store, PDF viewer) — no content script to
    // inject into, so open the dashboard instead.
    openPopupWindow(`${CLARIX_ORIGIN}/dashboard`, 1100, 800);
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-overlay-visibility") messageActiveTab({ type: "TOGGLE_VISIBILITY" });
  else if (command === "toggle-click-through") messageActiveTab({ type: "TOGGLE_CLICK_THROUGH" });
});
