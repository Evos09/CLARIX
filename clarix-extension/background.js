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

function setState(patch) {
  state = { ...state, ...patch };
  chrome.runtime.sendMessage({ type: "STATE", state }).catch(() => {});
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
    chrome.tabs.create({ url: CONNECT_URL, active: true });
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
