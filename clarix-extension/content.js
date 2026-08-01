// CLARIX HUD — content script. Injects the floating glass overlay into the page,
// wires the ask box to the background worker, and responds to the global
// visibility / click-through shortcuts.

(() => {
  const OVERLAY_ID = "clarix-hud-overlay";
  const CLARIX_ORIGIN = "https://www.clarixmeetings.com";

  // Guard against double injection (e.g. if the script is re-run).
  if (document.getElementById(OVERLAY_ID) || window.__clarixHudInjected) return;
  window.__clarixHudInjected = true;

  const state = { visible: true, clickThrough: false };

  // ── tiny DOM helper ──
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v; // only used for trusted inline SVG
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (v != null) n.setAttribute(k, v);
    }
    for (const kid of kids) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return n;
  };

  const SEARCH_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  function citationHref(c) {
    if (typeof c.t === "number") return `${CLARIX_ORIGIN}/meetings/${c.id}?tab=transcript&t=${c.t}`;
    if (c.hl) return `${CLARIX_ORIGIN}/meetings/${c.id}?tab=transcript&hl=${encodeURIComponent(c.hl)}`;
    return `${CLARIX_ORIGIN}/meetings/${c.id}`;
  }

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
    catch { return ""; }
  }

  // ── Build the overlay ──
  const input = el("input", {
    type: "text",
    placeholder: "Ask your meetings…",
    "aria-label": "Ask your meetings",
    onkeydown: (e) => { if (e.key === "Enter") void ask(); },
  });

  const response = el("div", { class: "clarix-response" },
    el("span", { class: "clarix-muted" }, "Ask across your recorded meetings — answers cite the source and jump to the moment."));

  const dot = el("span", { class: "clarix-dot" });

  const btnClickThrough = el("button", {
    class: "clarix-iconbtn", title: "Toggle click-through (Ctrl/Cmd+Shift+Y)",
    onclick: () => setClickThrough(!state.clickThrough),
  }, "⇅");

  const header = el("div", { class: "clarix-hud-header" },
    el("span", { class: "clarix-mark" }),
    el("span", { class: "clarix-brand" }, "CLAR", el("span", { class: "ix" }, "IX")),
    el("span", { class: "clarix-status" }, dot, "Active"),
    el("span", { class: "clarix-spacer" }),
    el("button", { class: "clarix-iconbtn", title: "Pop out to a separate window (hidden when sharing a tab)", onclick: popOut }, "⇱"),
    btnClickThrough,
    el("button", { class: "clarix-iconbtn", title: "Hide (Ctrl/Cmd+Shift+H)", onclick: () => setVisible(false) }, "✕"),
  );

  const body = el("div", { class: "clarix-hud-body" },
    el("div", { class: "clarix-ask" },
      el("span", { class: "clarix-searchicon", html: SEARCH_SVG }),
      input,
      el("span", { class: "clarix-kbd" }, "↵"),
    ),
    response,
  );

  const footer = el("div", { class: "clarix-hud-footer" },
    el("span", { class: "clarix-hint" },
      el("span", {}, el("kbd", {}, "⌘⇧H"), " hide"),
      el("span", {}, el("kbd", {}, "⌘⇧Y"), " click-through"),
    ),
    el("span", {}, "workspace only"),
  );

  const overlay = el("div", { id: OVERLAY_ID, role: "complementary", "aria-label": "CLARIX helper" }, header, body, footer);
  document.body.appendChild(overlay);

  // ── Ask flow ──
  async function ask() {
    const query = input.value.trim();
    if (!query) return;
    response.replaceChildren(
      el("span", { class: "clarix-muted" }, el("span", { class: "clarix-spin" }), " Searching your meetings…"),
    );
    try {
      const r = await chrome.runtime.sendMessage({ type: "ASK", query });
      if (!r?.ok) {
        renderError(r?.error || "Something went wrong.", r?.status);
        return;
      }
      renderAnswer(r.data);
    } catch {
      renderError("Couldn't reach the extension worker. Reload the page.");
    }
  }

  function renderError(message, status) {
    const kids = [el("div", { class: "clarix-muted" }, message)];
    if (status === 401 || status === 403) {
      // This extension authenticates with a Bearer token issued by the connect
      // page — send the user there (also reachable from the toolbar popup).
      kids.push(el("a", {
        href: `${CLARIX_ORIGIN}/extension/connect`, target: "_blank", rel: "noreferrer",
        style: "color:#7c4fe8;font-weight:600;text-decoration:none;display:inline-block;margin-top:6px",
      }, "Connect your CLARIX account →"));
    }
    response.replaceChildren(...kids);
  }

  function renderAnswer(data) {
    const kids = [];
    kids.push(el("div", { class: "clarix-eyebrow" },
      data?.range ? `From your meetings · ${data.range}` : "From your meetings"));
    kids.push(el("div", { class: "clarix-answer" }, data?.answer || "No answer."));

    const cites = Array.isArray(data?.citations) ? data.citations : [];
    if (cites.length) {
      const sources = el("div", { class: "clarix-sources" });
      for (const c of cites) {
        const jump = typeof c.t === "number"
          ? el("span", { class: "clarix-jump" }, `▶ ${fmtTime(c.t)}`)
          : c.hl ? el("span", { class: "clarix-jump" }, "↳ jump") : null;
        sources.append(el("a", { class: "clarix-source", href: citationHref(c), target: "_blank", rel: "noreferrer" },
          el("span", { class: "clarix-src-title" }, c.title || "Meeting"),
          el("span", { class: "clarix-src-meta" }, [c.type, fmtDate(c.date)].filter(Boolean).join(" · ")),
          jump,
        ));
      }
      kids.push(sources);
    }
    response.replaceChildren(...kids);
  }

  async function popOut() {
    try { await chrome.runtime.sendMessage({ type: "POPOUT" }); } catch {}
  }

  // ── Visibility & click-through (also driven by global shortcuts) ──
  function setVisible(v) {
    state.visible = v;
    overlay.classList.toggle("clarix-hidden", !v);
    if (v && !state.clickThrough) input.focus();
  }
  function setClickThrough(v) {
    state.clickThrough = v;
    overlay.classList.toggle("clarix-click-through", v);
    btnClickThrough.style.color = v ? "#7c4fe8" : "";
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "TOGGLE_VISIBILITY") setVisible(!state.visible);
    else if (msg?.type === "TOGGLE_CLICK_THROUGH") setClickThrough(!state.clickThrough);
  });

  // ── Drag by the header ──
  (() => {
    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    header.addEventListener("mousedown", (e) => {
      if (e.target.closest(".clarix-iconbtn")) return; // don't drag when hitting a button
      dragging = true;
      const rect = overlay.getBoundingClientRect();
      // Switch to left/top positioning so dragging is intuitive.
      overlay.style.left = `${rect.left}px`;
      overlay.style.top = `${rect.top}px`;
      overlay.style.right = "auto";
      sx = e.clientX; sy = e.clientY; ox = rect.left; oy = rect.top;
      e.preventDefault();
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const nx = Math.max(0, Math.min(window.innerWidth - overlay.offsetWidth, ox + e.clientX - sx));
      const ny = Math.max(0, Math.min(window.innerHeight - 40, oy + e.clientY - sy));
      overlay.style.left = `${nx}px`;
      overlay.style.top = `${ny}px`;
    });
    window.addEventListener("mouseup", () => { dragging = false; });
  })();
})();
