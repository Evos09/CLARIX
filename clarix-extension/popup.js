// CLARIX popup — pure UI. All work happens in the service worker (background.js);
// the popup just sends messages and renders state.

const CLARIX_ORIGIN = "https://www.clarixmeetings.com";
const $ = (id) => document.getElementById(id);
const send = (msg) => chrome.runtime.sendMessage(msg);

function show(view) {
  ["view-loading", "view-signed-out", "view-ready"].forEach((v) => ($(v).hidden = v !== view));
}

async function refresh() {
  const auth = await send({ type: "CHECK_AUTH" });
  if (!auth?.signedIn) return show("view-signed-out");
  const me = auth.me || {};
  $("email").textContent = me.user?.email || "Signed in";
  $("plan").textContent = me.plan?.name || "";
  show("view-ready");
  const { state } = (await send({ type: "GET_STATE" })) || {};
  renderState(state);
}

function renderState(state) {
  if (!state) return;
  const recording = state.recording;
  $("btn-record").hidden = recording;
  $("btn-stop").hidden = !recording;
  const map = {
    idle: "",
    recording: "● Recording this tab…",
    uploading: "Uploading & transcribing…",
    done: "Done! Your notes are processing.",
    error: state.error || "Something went wrong.",
  };
  const s = $("status");
  s.textContent = map[state.status] ?? "";
  s.className = state.status === "recording" ? "rec" : "muted";

  const link = $("open-meeting");
  if (state.status === "done" && state.meetingId) {
    link.hidden = false;
    link.href = `${CLARIX_ORIGIN}/meetings/${state.meetingId}`;
  } else {
    link.hidden = true;
  }
}

$("btn-connect").addEventListener("click", async () => {
  show("view-loading");
  await send({ type: "CONNECT" });
  refresh();
});
$("btn-record").addEventListener("click", () => send({ type: "START_RECORDING" }));
$("btn-stop").addEventListener("click", () => send({ type: "STOP_RECORDING" }));
$("btn-signout").addEventListener("click", async () => {
  await send({ type: "SIGN_OUT" });
  refresh();
});

// Live updates pushed from the service worker while the popup is open.
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "STATE") renderState(msg.state);
});

refresh();
