// Runs only on https://clarixmeetings.com/extension/connect.
// The page (rendered for a signed-in user) drops a fresh Clerk token into a
// hidden #clarix-ext-token node; we relay it to the service worker, which stores
// it and closes this tab.

function grab() {
  const el = document.getElementById("clarix-ext-token");
  const token = el && el.dataset ? el.dataset.token : null;
  if (token) {
    chrome.runtime.sendMessage({ type: "CLARIX_TOKEN", token });
    return true;
  }
  return false;
}

if (!grab()) {
  const obs = new MutationObserver(() => {
    if (grab()) obs.disconnect();
  });
  obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
}
