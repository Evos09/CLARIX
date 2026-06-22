"use client";

/**
 * Streams microphone audio to AssemblyAI v3 realtime STT and emits transcript
 * updates. Display-only — the final processed transcript still comes from the
 * standard upload pipeline.
 */
export class RealtimeTranscriptionClient {
  private socket: WebSocket | null = null;
  private ctx: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onUpdate: (text: string, isFinal: boolean) => void;

  constructor(onUpdate: (text: string, isFinal: boolean) => void) {
    this.onUpdate = onUpdate;
  }

  async start(stream: MediaStream): Promise<void> {
    const res = await fetch("/api/transcribe/realtime-token");
    if (!res.ok) throw new Error("Could not start live captions");
    const { token } = await res.json();

    this.socket = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&format_turns=true&token=${token}`);
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

    this.ctx = new AudioContext({ sampleRate: 16000 });
    this.source = this.ctx.createMediaStreamSource(stream);
    this.processor = this.ctx.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (ev) => {
      const input = ev.inputBuffer.getChannelData(0);
      const pcm = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) pcm[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
      if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(pcm.buffer);
    };
    this.source.connect(this.processor);
    this.processor.connect(this.ctx.destination);
  }

  stop(): void {
    try { this.processor?.disconnect(); } catch { /* */ }
    try { this.source?.disconnect(); } catch { /* */ }
    try { void this.ctx?.close(); } catch { /* */ }
    try { this.socket?.close(); } catch { /* */ }
    this.processor = null;
    this.source = null;
    this.ctx = null;
    this.socket = null;
  }
}
