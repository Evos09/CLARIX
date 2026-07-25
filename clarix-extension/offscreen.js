// CLARIX extension — offscreen document.
// Captures the meeting tab's audio (plus mic, best-effort), records it to a
// single webm blob, then runs the same 4-call upload the web app uses:
//   POST /api/upload -> PUT signed URL -> POST /api/meetings -> POST transcribe
// The bearer token is fetched from the service worker on demand.

const CLARIX_ORIGIN = "https://clarixmeetings.com";

let recorder = null;
let chunks = [];
let audioContext = null;
let pendingTitle = "Meeting";

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.target !== "offscreen") return;
  if (msg.type === "START") start(msg.streamId, msg.title);
  if (msg.type === "STOP") stop();
});

async function start(streamId, title) {
  pendingTitle = title || "Meeting";
  chunks = [];
  try {
    // Tab audio via the stream id minted by the service worker.
    const tabStream = await navigator.mediaDevices.getUserMedia({
      audio: { mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId } },
    });

    // Mic is best-effort — some environments block it without a gesture.
    let micStream = null;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      micStream = null;
    }

    // Mix tab + mic into one stream, and keep the tab audible to the user.
    audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();
    const tabSrc = audioContext.createMediaStreamSource(tabStream);
    tabSrc.connect(dest);
    tabSrc.connect(audioContext.destination); // passthrough so the call stays audible
    if (micStream) audioContext.createMediaStreamSource(micStream).connect(dest);

    recorder = new MediaRecorder(dest.stream, { mimeType: "audio/webm" });
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = async () => {
      [tabStream, micStream].forEach((s) => s && s.getTracks().forEach((t) => t.stop()));
      await audioContext?.close();
      await finishAndUpload();
    };
    recorder.start();
    report("recording");
  } catch (e) {
    fail(`Could not start capture: ${e.message || e}`);
  }
}

function stop() {
  if (recorder && recorder.state !== "inactive") recorder.stop();
}

async function finishAndUpload() {
  try {
    report("uploading");
    const blob = new Blob(chunks, { type: "audio/webm" });
    if (!blob.size) return fail("Recording was empty.");
    const meetingId = await upload(blob, pendingTitle);
    chrome.runtime.sendMessage({ type: "OFFSCREEN_DONE", meetingId });
  } catch (e) {
    fail(String(e.message || e));
  }
}

async function getToken() {
  const res = await chrome.runtime.sendMessage({ type: "OFFSCREEN_GET_TOKEN" });
  if (!res?.token) throw new Error("Not signed in to CLARIX.");
  return res.token;
}

async function upload(blob, title) {
  const token = await getToken();
  const auth = { Authorization: `Bearer ${token}` };
  const filename = `clarix-recording-${Date.now()}.webm`;

  // 1. signed upload URL
  const signRes = await fetch(`${CLARIX_ORIGIN}/api/upload`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ filename, contentType: "audio/webm", size: blob.size }),
  });
  if (!signRes.ok) throw new Error((await signRes.json()).error || "Could not start upload");
  const { path, signedUrl } = await signRes.json();

  // 2. bytes straight to storage
  const put = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": "audio/webm", "x-upsert": "true" },
    body: blob,
  });
  if (!put.ok) throw new Error(`Storage upload failed (${put.status})`);

  // 3. create the meeting row (auto-detect the meeting type)
  const createRes = await fetch(`${CLARIX_ORIGIN}/api/meetings`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      meetingType: "GENERAL",
      autoDetect: true,
      consentAcknowledged: true,
      storagePath: path,
      audioSize: blob.size,
      audioFilename: filename,
    }),
  });
  if (!createRes.ok) throw new Error((await createRes.json()).error || "Could not create meeting");
  const meeting = await createRes.json();

  // 4. kick off transcription
  await fetch(`${CLARIX_ORIGIN}/api/meetings/${meeting.id}/transcribe`, { method: "POST", headers: auth });
  return meeting.id;
}

function report(status) {
  chrome.runtime.sendMessage({ type: "OFFSCREEN_STATUS", status });
}
function fail(error) {
  chrome.runtime.sendMessage({ type: "OFFSCREEN_ERROR", error });
}
