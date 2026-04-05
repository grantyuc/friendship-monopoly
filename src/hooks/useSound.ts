import { useCallback } from 'react';

// Shared AudioContext — reuse to avoid creating hundreds
let _ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  try {
    if (!_ctx || _ctx.state === 'closed') {
      _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch { return null; }
}

// --- primitives ---

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.25, delay = 0) {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur);
}

function noise(dur: number, vol = 0.15, delay = 0) {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime + delay;
  const bufferSize = ctx.sampleRate * dur;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  // Bandpass for color
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 3000;
  filter.Q.value = 0.7;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + dur);
}

function chord(freqs: number[], dur: number, type: OscillatorType = 'sine', vol = 0.12, delay = 0) {
  freqs.forEach(f => tone(f, dur, type, vol / freqs.length, delay));
}

// --- sound effects ---

export function useSound() {
  // Dice shaking: rapid rattling ticks with noise
  const playRoll = useCallback(() => {
    for (let i = 0; i < 8; i++) {
      const f = 200 + Math.random() * 400;
      tone(f, 0.04, 'square', 0.08, i * 0.05);
      noise(0.03, 0.06, i * 0.05 + 0.01);
    }
  }, []);

  // Dice lands: solid thunk + short chord
  const playDiceLand = useCallback(() => {
    // Impact thud
    tone(80, 0.15, 'sine', 0.35);
    noise(0.08, 0.2);
    // Bright confirm ping after 100ms
    tone(880, 0.12, 'sine', 0.18, 0.1);
    tone(1100, 0.1, 'sine', 0.12, 0.12);
  }, []);

  // Step movement: cute bouncy pop
  const playStep = useCallback(() => {
    tone(600, 0.04, 'sine', 0.15);
    tone(900, 0.03, 'sine', 0.1, 0.02);
    noise(0.02, 0.04, 0.01);
  }, []);

  // Task success: triumphant fanfare (major arpeggio + shimmer)
  const playSuccess = useCallback(() => {
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      tone(f, 0.2, 'sine', 0.2, i * 0.1);
      tone(f * 1.005, 0.2, 'sine', 0.08, i * 0.1); // slight detune for shimmer
    });
    // Final bright chord
    chord([1047, 1319, 1568], 0.4, 'sine', 0.25, 0.45);
    noise(0.15, 0.06, 0.45);
  }, []);

  // Task fail: sad descending minor
  const playFail = useCallback(() => {
    [440, 370, 330, 262].forEach((f, i) => {
      tone(f, 0.22, 'sawtooth', 0.12, i * 0.12);
    });
    tone(130, 0.3, 'sine', 0.1, 0.48); // low rumble
  }, []);

  // Land on yellow (cooperation): warm cheerful double-ding
  const playLandYellow = useCallback(() => {
    tone(660, 0.12, 'sine', 0.2);
    tone(880, 0.12, 'sine', 0.2, 0.08);
    tone(1100, 0.1, 'sine', 0.12, 0.16);
    noise(0.06, 0.04, 0.08);
  }, []);

  // Land on red (challenge): dramatic tension sting
  const playLandRed = useCallback(() => {
    // Low ominous tone
    tone(150, 0.25, 'sawtooth', 0.15);
    tone(160, 0.25, 'sawtooth', 0.1); // dissonance
    // Sharp accent
    noise(0.06, 0.12, 0.05);
    tone(300, 0.08, 'square', 0.15, 0.1);
    // Suspenseful trail
    tone(200, 0.3, 'triangle', 0.1, 0.2);
  }, []);

  // Land on green (heart/comfort): gentle harp-like ascending
  const playLandGreen = useCallback(() => {
    [523, 587, 659, 784, 880].forEach((f, i) => {
      tone(f, 0.18, 'sine', 0.14, i * 0.06);
    });
  }, []);

  // Chance card: magical sparkle cascade
  const playChance = useCallback(() => {
    const sparkle = [800, 1200, 1600, 2000, 1600, 1200, 800];
    sparkle.forEach((f, i) => {
      tone(f, 0.06, 'sine', 0.15, i * 0.05);
      tone(f * 1.5, 0.04, 'sine', 0.06, i * 0.05 + 0.02); // overtone
    });
    noise(0.3, 0.03); // background shimmer
  }, []);

  // Destiny card: mysterious deep reveal
  const playDestiny = useCallback(() => {
    // Deep gong
    tone(120, 0.6, 'sine', 0.2);
    tone(180, 0.5, 'triangle', 0.12, 0.05);
    // Eerie overtones
    [360, 540].forEach((f, i) => {
      tone(f, 0.35, 'sine', 0.06, 0.1 + i * 0.1);
    });
    // Suspense noise
    noise(0.25, 0.05, 0.15);
  }, []);

  // Next turn: clean switch chime
  const playNextTurn = useCallback(() => {
    tone(520, 0.06, 'sine', 0.15);
    tone(650, 0.08, 'sine', 0.18, 0.07);
    noise(0.03, 0.04, 0.05);
  }, []);

  // Build house: construction hammering + success ding
  const playHouse = useCallback(() => {
    // Hammer taps
    [0, 0.08, 0.16].forEach(d => {
      noise(0.04, 0.12, d);
      tone(300, 0.04, 'square', 0.1, d);
    });
    // Success chime
    chord([523, 659, 784], 0.25, 'sine', 0.2, 0.28);
  }, []);

  // Destroy building: explosive crash + collapse rumble
  const playDestroy = useCallback(() => {
    // Initial impact burst
    noise(0.08, 0.25);
    tone(120, 0.12, 'sawtooth', 0.2);
    // Crumble noise cascade
    [0.05, 0.12, 0.2, 0.3].forEach(d => {
      noise(0.06, 0.18 - d * 0.3, d);
      tone(80 + d * 60, 0.08, 'square', 0.08, d);
    });
    // Low rumble settling
    tone(60, 0.35, 'sine', 0.12, 0.25);
    noise(0.2, 0.06, 0.3);
  }, []);

  // Step on opponent territory: alarm buzz
  const playPenalty = useCallback(() => {
    tone(200, 0.08, 'sawtooth', 0.2);
    tone(180, 0.08, 'sawtooth', 0.2, 0.08);
    tone(160, 0.15, 'sawtooth', 0.15, 0.16);
    noise(0.05, 0.1, 0.05);
  }, []);

  // Pass start: coin collect jingle
  const playPassStart = useCallback(() => {
    [880, 1047, 1319, 1568].forEach((f, i) => {
      tone(f, 0.08, 'sine', 0.18, i * 0.06);
    });
    noise(0.1, 0.04, 0.05);
  }, []);

  // Game over: grand finale
  const playGameOver = useCallback(() => {
    // Drum roll
    for (let i = 0; i < 12; i++) {
      noise(0.04, 0.08 + i * 0.005, i * 0.04);
    }
    // Triumphant chord progression
    chord([262, 330, 392], 0.3, 'sine', 0.2, 0.5);  // C major
    chord([349, 440, 523], 0.3, 'sine', 0.2, 0.85); // F major
    chord([392, 494, 587], 0.3, 'sine', 0.2, 1.2);  // G major
    chord([523, 659, 784], 0.5, 'sine', 0.3, 1.55); // C major high
    // Final sparkle
    [1047, 1319, 1568, 2093].forEach((f, i) => {
      tone(f, 0.15, 'sine', 0.1, 1.9 + i * 0.08);
    });
  }, []);

  // Skip turn: sad trombone
  const playSkipTurn = useCallback(() => {
    [392, 370, 349, 262].forEach((f, i) => {
      tone(f, 0.25, 'triangle', 0.15, i * 0.15);
    });
  }, []);

  return {
    playRoll,
    playDiceLand,
    playStep,
    playSuccess,
    playFail,
    playLandYellow,
    playLandRed,
    playLandGreen,
    playChance,
    playDestiny,
    playNextTurn,
    playHouse,
    playDestroy,
    playPenalty,
    playPassStart,
    playGameOver,
    playSkipTurn,
  };
}
