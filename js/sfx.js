// Tiny WebAudio sound effects — no audio files needed.
let ctx = null;
let muted = false;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur = 0.12, type = 'sine', vol = 0.18, when = 0) {
  if (muted) return;
  try {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, a.currentTime + when);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + when + dur);
    o.connect(g).connect(a.destination);
    o.start(a.currentTime + when);
    o.stop(a.currentTime + when + dur + 0.02);
  } catch { /* audio unavailable */ }
}

export const sfx = {
  setMuted(m) { muted = m; },
  isMuted() { return muted; },
  tap() { tone(420, 0.06, 'triangle', 0.12); },
  place() { tone(220, 0.1, 'triangle', 0.2); tone(330, 0.12, 'triangle', 0.14, 0.05); },
  tile() { tone(170 + Math.random() * 60, 0.09, 'triangle', 0.1); },
  dice() {
    // rattle while the cubes tumble (~1s), then a landing knock
    for (let i = 0; i < 9; i++) tone(120 + Math.random() * 220, 0.045, 'square', 0.07 - i * 0.004, i * 0.1);
    tone(95, 0.12, 'sine', 0.16, 1.0);
    tone(180, 0.06, 'triangle', 0.1, 1.02);
  },
  card() { tone(620, 0.08, 'sine', 0.12); tone(820, 0.1, 'sine', 0.1, 0.06); },
  rob() { tone(160, 0.25, 'sawtooth', 0.12); tone(120, 0.3, 'sawtooth', 0.1, 0.1); },
  bad() { tone(200, 0.15, 'square', 0.08); tone(150, 0.2, 'square', 0.08, 0.1); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.16, i * 0.16)); },
};
