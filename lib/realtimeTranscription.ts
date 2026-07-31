"use client";

/**
 * Streams microphone audio to AssemblyAI v3 realtime STT and emits transcript
 * updates. Display-only — the final processed transcript still comes from the
 * standard upload pipeline.
 */
export class RealtimeTranscriptionClient {
  private socket: WebSocket | null = null;
  private ctx: AudioContext | null = null;
  private worklet: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onUpdate: (text: string, isFinal: boolean) => void;

  constructor(onUpdate: (text: string, isFinal: boolean) => void) {
    this.onUpdate = onUpdate;
  }

  async start(stream: MediaStream): Promise<void> {
    // The token route optionally attaches the org's custom vocabulary (names,
    // acronyms) as AssemblyAI keyterms so live captions spell them correctly.
    const res = await fetch("/api/transcribe/realtime-token");
    if (!res.ok) throw new Error("Could not start live captions");
    const { token, keyterms } = await res.json();

    const params = new URLSearchParams({
      sample_rate: "16000",
      format_turns: "true",
      token,
    });
    // AssemblyAI v3 streaming biases recognition toward domain terms via a
    // single `keyterms_prompt` query param holding a JSON array (max 100 terms).
    if (Array.isArray(keyterms)) {
      const terms = keyterms
        .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        .map((t) => t.trim())
        .slice(0, 100);
      if (terms.length) params.set("keyterms_prompt", JSON.stringify(terms));
    }

    this.socket = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?${params.toString()}`);
    this.socket.binaryType = "arraybuffer";
    this.socket.onmessage = (e) => {
      try {
        const m = JSON.parse(e.data);
        if (m.type === "Turn" && typeof m.transcript === "string") {
          this.onUpdate(m.transcript, Boolean(m.end_of_turn));
        }
      } catch {
        /* ignore */
      }
    };
    await new Promise<void>((resolve, reject) => {
      if (!this.socket) return reject();
      this.socket.onopen = () => resolve();
      this.socket.onerror = () => reject(new Error("WebSocket error"));
    });

    // Native-rate context; the worklet resamples to 16 kHz off the main thread,
    // which avoids the dropped samples (and garbled words) the old
    // main-thread ScriptProcessorNode produced under UI load.
    this.ctx = new AudioContext();
    await this.ctx.audioWorklet.addModule("/audio/pcm16k-worklet.js");
    this.source = this.ctx.createMediaStreamSource(stream);
    this.worklet = new AudioWorkletNode(this.ctx, "pcm16k");
    this.worklet.port.onmessage = (ev: MessageEvent<ArrayBuffer>) => {
      if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(ev.data);
    };
    this.source.connect(this.worklet);
    // The worklet writes no output, so routing it to the destination is silent;
    // it just keeps the node scheduled in the graph across browsers.
    this.worklet.connect(this.ctx.destination);
  }

  stop(): void {
    try { if (this.worklet) this.worklet.port.onmessage = null; } catch { /* */ }
    try { this.worklet?.disconnect(); } catch { /* */ }
    try { this.source?.disconnect(); } catch { /* */ }
    try { void this.ctx?.close(); } catch { /* */ }
    try { this.socket?.close(); } catch { /* */ }
    this.worklet = null;
    this.source = null;
    this.ctx = null;
    this.socket = null;
  }
}
