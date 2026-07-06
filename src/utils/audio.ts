// Web Audio API Synthesizer for premium sound effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play a subtle click/tick sound for successful keystrokes
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Small random variation to make it sound natural and less mechanical
    osc.frequency.setValueAtTime(800 + Math.random() * 300, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {
    // Fail silently if audio context is blocked
  }
}

// Play a low error buzz for mistakes
export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    // Apply lowpass filter to make it warmer, less harsh
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (e) {
    // Fail silently
  }
}

// Play countdown sound (beep for 3, 2, 1; high chirp for GO)
export function playCountdownSound(isFinal: boolean) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    if (isFinal) {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 (Chirp for Go)
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4 (Beep)
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (isFinal ? 0.32 : 0.17));
  } catch (e) {
    // Fail silently
  }
}

// Play a celebratory win melody when the user completes the paragraph
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a happy major arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    const duration = 0.12;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * duration);
      
      gain.gain.setValueAtTime(0.1, now + idx * duration);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * duration + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * duration);
      osc.stop(now + idx * duration + 0.32);
    });
  } catch (e) {
    // Fail silently
  }
}
