import { Injectable, signal } from '@angular/core';

interface AnalyserEntry {
  analyser: AnalyserNode;
  source: MediaStreamAudioSourceNode;
  data: Uint8Array<ArrayBuffer>;
}

@Injectable({
  providedIn: 'root',
})
export class AudioLevelService {
  levels = signal<Record<string, number>>({});

  private audioCtx: AudioContext | null = null;
  private analysers = new Map<string, AnalyserEntry>();
  private rafId: number | null = null;

  track(id: string, stream: MediaStream) {
    if (this.analysers.has(id) || !stream.getAudioTracks().length) return;

    try {
      const ctx = this.context();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);

      this.analysers.set(id, {
        analyser,
        source,
        data: new Uint8Array(analyser.frequencyBinCount),
      });
      this.ensureLoop();
    } catch (e) {
      console.error('audio level tracking error:', e);
    }
  }

  untrack(id: string) {
    const entry = this.analysers.get(id);
    if (!entry) return;
    entry.source.disconnect();
    this.analysers.delete(id);
    this.levels.update(({ [id]: _removed, ...rest }) => rest);
  }

  retain(ids: Set<string>) {
    for (const id of this.analysers.keys()) {
      if (!ids.has(id)) this.untrack(id);
    }
  }

  reset() {
    this.analysers.forEach((entry) => entry.source.disconnect());
    this.analysers.clear();
    this.levels.set({});

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.audioCtx) {
      void this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }

  private context() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private ensureLoop() {
    if (this.rafId !== null) return;

    const tick = () => {
      const next: Record<string, number> = {};
      this.analysers.forEach((entry, id) => {
        entry.analyser.getByteTimeDomainData(entry.data);
        let sumSquares = 0;
        for (let i = 0; i < entry.data.length; i++) {
          const normalized = (entry.data[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        next[id] = Math.sqrt(sumSquares / entry.data.length);
      });
      this.levels.set(next);
      this.rafId = this.analysers.size ? requestAnimationFrame(tick) : null;
    };

    this.rafId = requestAnimationFrame(tick);
  }
}
