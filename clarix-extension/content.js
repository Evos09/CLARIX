// CLARIX — the whole extension UI, injected into the page.
//
// There is no popup and no options page: this floating overlay is the only
// surface. It holds account/connect, tab recording, the meeting-memory ask box,
// and every link — and nothing here ever opens a tab (links go to the service
// worker, which opens a popup WINDOW instead).

(() => {
  const OVERLAY_ID = "clarix-hud-overlay";
  const CLARIX_ORIGIN = "https://www.clarixmeetings.com";
  const VIS_KEY = "clarixHudVisible";

  if (document.getElementById(OVERLAY_ID) || window.__clarixHudInjected) return;
  if (!document.body) return; // e.g. XML/SVG documents
  window.__clarixHudInjected = true;

  const ui = { visible: false, clickThrough: false };
  let auth = { signedIn: false, me: null };

  // ── tiny DOM helper ──
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v; // trusted inline SVG only
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (v != null) n.setAttribute(k, v);
    }
    for (const kid of kids) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return n;
  };

  const SEARCH_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';

  const send = (msg) => chrome.runtime.sendMessage(msg).catch(() => null);
  /** Never open a tab — the worker opens a popup window instead. */
  const openUrl = (url, width, height) => send({ type: "OPEN_URL", url, width, height });

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
    catch { return ""; }
  };
  function citationPath(c) {
    if (typeof c.t === "number") return `/meetings/${c.id}?tab=transcript&t=${c.t}`;
    if (c.hl) return `/meetings/${c.id}?tab=transcript&hl=${encodeURIComponent(c.hl)}`;
    return `/meetings/${c.id}`;
  }

  /* ─────────────── Header ─────────────── */
  const dot = el("span", { class: "clarix-dot" });
  const statusLabel = el("span", {}, "Ready");

  const btnClickThrough = el("button", {
    class: "clarix-iconbtn", title: "Click-through (Ctrl/Cmd+Shift+Y)",
    onclick: () => setClickThrough(!ui.clickThrough),
  }, "⇅");

  const header = el("div", { class: "clarix-hud-header" },
    el("span", { class: "clarix-mark" }),
    el("span", { class: "clarix-brand" }, "CLAR", el("span", { class: "ix" }, "IX")),
    el("span", { class: "clarix-status" }, dot, statusLabel),
    el("span", { class: "clarix-spacer" }),
    el("button", { class: "clarix-iconbtn", title: "Open in a separate window", onclick: () => send({ type: "POPOUT" }) }, "⇱"),
    btnClickThrough,
    el("button", { class: "clarix-iconbtn", title: "Hide (Ctrl/Cmd+Shift+H)", onclick: () => setVisible(false) }, "✕"),
  );

  /* ─────────────── Account row ─────────────── */
  const whoText = el("span", { class: "clarix-who-text" }, "Not connected");
  const planBadge = el("span", { class: "clarix-badge" });
  const btnConnect = el("button", { class: "clarix-btn clarix-btn-ghost", onclick: connect }, "Connect");
  const accountRow = el("div", { class: "clarix-row" }, whoText, planBadge, el("span", { class: "clarix-spacer" }), btnConnect);

  /* ─────────────── Record row ─────────────── */
  const btnRecord = el("button", { class: "clarix-btn clarix-btn-primary", onclick: () => send({ type: "START_RECORDING" }) },
    el("span", { class: "clarix-rec-dot" }), "Record this tab");
  const btnStop = el("button", { class: "clarix-btn clarix-btn-danger", onclick: () => send({ type: "STOP_RECORDING" }) }, "Stop & save");
  btnStop.style.display = "none";
  const recordNote = el("div", { class: "clarix-muted clarix-note" });
  const btnOpenMeeting = el("button", { class: "clarix-link", onclick: () => meetingId && openUrl(`/meetings/${meetingId}`) }, "Open meeting →");
  btnOpenMeeting.style.display = "none";
  let meetingId = null;

  const recordRow = el("div", { class: "clarix-record" }, btnRecord, btnStop, recordNote, btnOpenMeeting);

  /* ─────────────── Ask ─────────────── */
  const input = el("input", {
    type: "text", placeholder: "Ask your meetings…", "aria-label": "Ask your meetings",
    onkeydown: (e) => { if (e.key === "Enter") void ask(); },
  });
  const response = el("div", { class: "clarix-response" },
    el("span", { class: "clarix-muted" }, "Ask across every meeting — answers cite the source and jump to the moment."));

  const body = el("div", { class: "clarix-hud-body" },
    accountRow,
    recordRow,
    el("div", { class: "clarix-ask" },
      el("span", { class: "clarix-searchicon", html: SEARCH_SVG }),
      input,
      el("span", { class: "clarix-kbd" }, "↵"),
    ),
    response,
  );

  /* ─────────────── Footer ─────────────── */
  const footer = el("div", { class: "clarix-hud-footer" },
    el("span", { class: "clarix-hint" },
      el("button", { class: "clarix-link", onclick: () => openUrl("/dashboard", 1100, 800) }, "Dashboard"),
      el("button", { class: "clarix-link", onclick: signOut }, "Sign out"),
    ),
    el("span", {}, el("kbd", {}, "⌘⇧H"), " hide"),
  );

  const overlay = el("div", { id: OVERLAY_ID, role: "complementary", "aria-label": "CLARIX" }, header, body, footer);
  overlay.classList.add("clarix-hidden"); // starts hidden; the toolbar icon reveals it
  document.body.appendChild(overlay);

  /* ─────────────── Auth ─────────────── */
  async function refreshAuth() {
    const r = await send({ type: "CHECK_AUTH" });
    auth = { signedIn: !!r?.signedIn, me: r?.me || null };
    renderAuth();
  }
  function renderAuth() {
    const email = auth.me?.user?.email;
    whoText.textContent = auth.signedIn ? (email || "Signed in") : "Not connected";
    planBadge.textContent = auth.me?.plan?.name || "";
    planBadge.style.display = auth.me?.plan?.name ? "" : "none";
    btnConnect.style.display = auth.signedIn ? "none" : "";
    btnRecord.disabled = !auth.signedIn;
    btnRecord.title = auth.signedIn ? "" : "Connect your account first";
  }
  async function connect() {
    btnConnect.textContent = "Connecting…";
    await send({ type: "CONNECT" }); // opens the sign-in popup WINDOW
    btnConnect.textContent = "Connect";
    refreshAuth();
  }
  async function signOut() {
    await send({ type: "SIGN_OUT" });
    refreshAuth();
  }

  /* ─────────────── Recording state ─────────────── */
  function renderState(s) {
    if (!s) return;
    btnRecord.style.display = s.recording ? "none" : "";
    btnStop.style.display = s.recording ? "" : "none";
    const labels = {
      idle: "", recording: "Recording this tab…", uploading: "Uploading & transcribing…",
      done: "Done — your notes are processing.", error: s.error || "Something went wrong.",
    };
    recordNote.textContent = labels[s.status] ?? "";
    statusLabel.textContent = s.recording ? "Recording" : auth.signedIn ? "Ready" : "Connect";
    overlay.classList.toggle("clarix-recording", !!s.recording);
    meetingId = s.meetingId || null;
    btnOpenMeeting.style.display = s.status === "done" && meetingId ? "" : "none";
  }

  /* ─────────────── Ask flow ─────────────── */
  async function ask() {
    const query = input.value.trim();
    if (!query) return;
    response.replaceChildren(el("span", { class: "clarix-muted" }, el("span", { class: "clarix-spin" }), " Searching your meetings…"));
    const r = await send({ type: "ASK", query });
    if (!r?.ok) return renderError(r?.error || "Something went wrong.", r?.status);
    renderAnswer(r.data);
  }
  function renderError(message, status) {
    const kids = [el("div", { class: "clarix-muted" }, message)];
    if (status === 401 || status === 403) {
      kids.push(el("button", { class: "clarix-link", onclick: connect }, "Connect your CLARIX account →"));
    }
    response.replaceChildren(...kids);
  }
  function renderAnswer(data) {
    const kids = [
      el("div", { class: "clarix-eyebrow" }, data?.range ? `From your meetings · ${data.range}` : "From your meetings"),
      el("div", { class: "clarix-answer" }, data?.answer || "No answer."),
    ];
    const cites = Array.isArray(data?.citations) ? data.citations : [];
    if (cites.length) {
      const sources = el("div", { class: "clarix-sources" });
      for (const c of cites) {
        const jump = typeof c.t === "number" ? el("span", { class: "clarix-jump" }, `▶ ${fmtTime(c.t)}`)
          : c.hl ? el("span", { class: "clarix-jump" }, "↳ jump") : null;
        sources.append(el("button", { class: "clarix-source", onclick: () => openUrl(citationPath(c)) },
          el("span", { class: "clarix-src-title" }, c.title || "Meeting"),
          el("span", { class: "clarix-src-meta" }, [c.type, fmtDate(c.date)].filter(Boolean).join(" · ")),
          jump,
        ));
      }
      kids.push(sources);
    }
    response.replaceChildren(...kids);
  }

  /* ─────────────── Visibility / click-through ─────────────── */
  function setVisible(v) {
    ui.visible = v;
    overlay.classList.toggle("clarix-hidden", !v);
    chrome.storage?.local?.set({ [VIS_KEY]: v });
    if (v) { refreshAuth(); send({ type: "GET_STATE" }).then((r) => renderState(r?.state)); input.focus(); }
  }
  function setClickThrough(v) {
    ui.clickThrough = v;
    overlay.classList.toggle("clarix-click-through", v);
    btnClickThrough.style.color = v ? "#7c4fe8" : "";
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "TOGGLE_VISIBILITY") setVisible(!ui.visible);
    else if (msg?.type === "TOGGLE_CLICK_THROUGH") setClickThrough(!ui.clickThrough);
    else if (msg?.type === "STATE") renderState(msg.state);
  });

  // Restore the last visibility choice so it persists across pages.
  chrome.storage?.local?.get(VIS_KEY).then((r) => { if (r?.[VIS_KEY]) setVisible(true); }).catch(() => {});

  /* ─────────────── Drag anywhere ─────────────── */
  (() => {
    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    const onDown = (e) => {
      if (e.target.closest("button, input, a")) return;
      dragging = true;
      const rect = overlay.getBoundingClientRect();
      overlay.style.left = `${rect.left}px`;
      overlay.style.top = `${rect.top}px`;
      overlay.style.right = "auto";
      overlay.style.bottom = "auto";
      sx = e.clientX; sy = e.clientY; ox = rect.left; oy = rect.top;
      overlay.classList.add("clarix-dragging");
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging) return;
      // Free movement anywhere on screen; only keep a sliver on-screen so the
      // card can always be grabbed again.
      const margin = 40;
      const nx = Math.max(margin - overlay.offsetWidth, Math.min(window.innerWidth - margin, ox + e.clientX - sx));
      const ny = Math.max(0, Math.min(window.innerHeight - margin, oy + e.clientY - sy));
      overlay.style.left = `${nx}px`;
      overlay.style.top = `${ny}px`;
    };
    const onUp = () => { dragging = false; overlay.classList.remove("clarix-dragging"); };
    header.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseup", onUp, true);
  })();
})();
