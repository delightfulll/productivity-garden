
// * Short completion chime (C–E–G sparkle) via Web Audio — no sound files required.

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!sharedCtx || sharedCtx.state === "closed") {
      sharedCtx = new AC();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

export function playTaskCompleteSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  void ctx.resume().catch(() => {});

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.11, ctx.currentTime);
  master.connect(ctx.destination);

  const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
  const stagger = 0.042;

  freqs.forEach((freq, i) => {
    const t0 = ctx.currentTime + i * stagger;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.95, t0 + 0.018);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + 0.35);
  });
}
