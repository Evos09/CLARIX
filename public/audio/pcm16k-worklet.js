/**
 * AudioWorkletProcessor: converts the browser's native-rate mic audio into
 * 16 kHz mono 16-bit PCM chunks for AssemblyAI v3 streaming STT.
 *
 * Why this exists: the old ScriptProcessorNode ran on the main thread, so any
 * UI work dropped audio frames and garbled the live transcript. A worklet runs
 * on the dedicated audio thread. We also resample here — browsers often deliver
 * 44.1/48 kHz even when 16 kHz is requested, and sending mismatched-rate audio
 * to a 16 kHz model produces gibberish. Linear resampling is plenty for speech.
 *
 * Registered as "pcm16k". Posts an ArrayBuffer of Int16 samples to the main
 * thread via `this.port`, batched to ~50 ms so we don't flood the WebSocket.
 */
const TARGET_RATE = 16000;
const FRAME_SAMPLES = 800; // 50 ms at 16 kHz

class Pcm16kProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // `sampleRate` is a global available inside the worklet scope (the context rate).
    this._ratio = sampleRate / TARGET_RATE;
    this._buffer = new Int16Array(FRAME_SAMPLES);
    this._filled = 0;
    this._pos = 0; // fractional read position into the incoming frame
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const channel = input[0];
    if (!channel || channel.length === 0) return true;

    // Downsample from the context rate to 16 kHz by linear interpolation.
    let pos = this._pos;
    while (pos < channel.length) {
      const i = Math.floor(pos);
      const frac = pos - i;
      const s0 = channel[i];
      const s1 = i + 1 < channel.length ? channel[i + 1] : s0;
      const sample = s0 + (s1 - s0) * frac;

      // Clamp and convert Float32 [-1,1] to Int16.
      const clamped = sample < -1 ? -1 : sample > 1 ? 1 : sample;
      this._buffer[this._filled++] = clamped * 0x7fff;

      if (this._filled === FRAME_SAMPLES) {
        // Copy so the transferred buffer isn't reused underneath the consumer.
        const out = this._buffer.slice(0);
        this.port.postMessage(out.buffer, [out.buffer]);
        this._filled = 0;
      }
      pos += this._ratio;
    }
    // Carry the fractional remainder into the next render quantum.
    this._pos = pos - channel.length;
    return true;
  }
}

registerProcessor("pcm16k", Pcm16kProcessor);
