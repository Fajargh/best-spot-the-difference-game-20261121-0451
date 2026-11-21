// sound.js — tiny WebAudio bleeps for Kopi Senja Lane.
// No audio files are loaded: every sound is a synthesized oscillator tone,
// so the game plays with zero network requests.

let audioCtx = null;
let muted = false;

/** Lazily create the shared AudioContext (browsers require a user gesture first). */
function ctx() {
  if (audioCtx === null) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

/** Play one tone: `freq` Hz for `dur` seconds, sine by default. */
export function tone(freq, dur = 0.12, type = 'sine', vol = 0.12, when = 0) {
  if (muted) return;
  const ac = ctx();
  if (ac === null) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** A happy two-note chime when a difference is found. */
export function playFound() {
  tone(660, 0.1, 'sine', 0.14);
  tone(880, 0.16, 'sine', 0.14, 0.09);
}

/** A dull thud for a wrong click. */
export function playMiss() {
  tone(160, 0.14, 'triangle', 0.12);
  tone(110, 0.18, 'triangle', 0.1, 0.05);
}

/** A soft sparkle for a hint. */
export function playHint() {
  tone(1046, 0.09, 'sine', 0.08);
  tone(1318, 0.12, 'sine', 0.08, 0.08);
}

/** A little fanfare when a level is cleared. */
export function playLevelClear() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'sine', 0.13, i * 0.11));
}

/** A longer fanfare for winning the whole game. */
export function playWin() {
  [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, 0.18, 'sine', 0.13, i * 0.12));
}

/** A low warning tick when the timer runs short. */
export function playTick() {
  tone(440, 0.06, 'square', 0.05);
}

/** Toggle sound on/off. Returns the new muted state. */
export function toggleMute() {
  muted = !muted;
  return muted;
}
