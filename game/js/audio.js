// Warung Kilat — audio.js
// Semua bunyi disintesis dengan WebAudio: tanpa file suara eksternal, tanpa
// network. Satu AudioContext malas (dibuat saat interaksi pertama, sesuai
// aturan autoplay browser), plus nada pendek untuk tiap aksi dapur.

let ctx = null;
let master = null;

export function ensureAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.35;
  master.connect(ctx.destination);
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst(dur, vol, filterFreq, when = 0) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + when;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(t0);
}

export function setMuted(muted) {
  if (master) master.gain.value = muted ? 0 : 0.35;
}

export const sfx = {
  pickup() { tone(520, 0.07, 'triangle', 0.25); },
  drop() { tone(340, 0.08, 'triangle', 0.22, 0, 240); },
  chop() { noiseBurst(0.09, 0.5, 1800); tone(180, 0.06, 'square', 0.12); },
  sizzleStart() { noiseBurst(0.35, 0.25, 5200); },
  ding() { tone(880, 0.35, 'sine', 0.3); tone(1318, 0.4, 'sine', 0.2, 0.08); },
  coin() { tone(987, 0.1, 'square', 0.16); tone(1318, 0.22, 'square', 0.16, 0.09); },
  serve() { tone(659, 0.12, 'triangle', 0.28); tone(880, 0.12, 'triangle', 0.28, 0.1); tone(1174, 0.25, 'triangle', 0.28, 0.2); },
  error() { tone(220, 0.22, 'sawtooth', 0.18, 0, 140); },
  angry() { tone(196, 0.3, 'sawtooth', 0.2, 0, 110); tone(147, 0.35, 'sawtooth', 0.18, 0.18, 90); },
  rush() { tone(523, 0.12, 'square', 0.2); tone(659, 0.12, 'square', 0.2, 0.12); tone(784, 0.2, 'square', 0.22, 0.24); },
  dayEnd() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 'triangle', 0.25, i * 0.13)); },
  click() { tone(700, 0.05, 'triangle', 0.15); },
};
