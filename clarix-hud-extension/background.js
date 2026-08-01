// CLARIX HUD — background service worker (Manifest V3).
// Owns the global command shortcuts, the cross-origin ask request (a service
// worker with host_permissions can call the API with the user's cookies,
// bypassing page CORS), and the separate-window privacy fallback.

const CLARIX_ORIGIN = "https://www.clarixmeetings.com";

/** Send a message to the active tab's content script, ignoring pages we can't
 *  inject into (chrome://, the Web Store, PDF viewer, etc.). */
async function messageActiveTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, message);
  } catch {
    // No content script on this page (restricted URL). Offer the popup instead
    // for the visibility toggle so the shortcut still does something useful.
    if (message.type === "TOGGLE_VISIBILITY") openHudPopup();
  }
}

// ── Global shortcuts ──
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-overlay-visibility") messageActiveTab({ type: "TOGGLE_VISIBILITY" });
  else if (command === "toggle-click-through") messageActiveTab({ type: "TOGGLE_CLICK_THROUGH" });
});

// Clicking the toolbar icon also toggles the overlay.
chrome.action.onClicked.addListener(() => messageActiveTab({ type: "TOGGLE_VISIBILITY" }));

// ── Separate, borderless popup window (screen-share fallback) ──
// If the user shares a single tab, this floating popup window is a different
// surface and stays hidden from viewers. It loads the full /overlay experience.
async function openHudPopup() {
  try {
    await chrome.windows.create({
      url: `${CLARIX_ORIGIN}/overlay?solid=1`,
      type: "popup",
      width: 360,
      height: 500,
      focused: true,
    });
  } catch (e) {
    console.warn("CLARIX HUD: could not open popup window", e);
  }
}

// ── Messages from the injected content script ──
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "POPOUT") {
    openHudPopup();
    sendResponse({ ok: true });
    return; // sync response
  }

  if (msg?.type === "ASK") {
    // Async: keep the message channel open by returning true below.
    (async () => {
      try {
        const res = await fetch(`${CLARIX_ORIGIN}/api/memory/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // send the clarixmeetings.com session cookie
          body: JSON.stringify({
            query: msg.query,
            ...(msg.range ? { range: msg.range } : {}),
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          sendResponse({
            ok: false,
            status: res.status,
            error: data?.error || (res.status === 401 || res.status === 403
              ? "Sign in to CLARIX first."
              : "Something went wrong."),
          });
          return;
        }
        sendResponse({ ok: true, data });
      } catch {
        sendResponse({ ok: false, error: "Couldn't reach CLARIX. Check your connection." });
      }
    })();
    return true; // keep the port open for the async sendResponse
  }
});
