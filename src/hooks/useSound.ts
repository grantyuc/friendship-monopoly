import { useRef, useCallback } from 'react';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx(): AudioContext {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  const tone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.25, startDelay = 0) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(gainVal, ctx.currentTime + startDelay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + duration + 0.01);
    } catch {
      // silently ignore audio errors
    }
  }, []);

  const playRoll = useCallback(() => {
    // Rapid rattling dice sound
    for (let i = 0; i < 10; i++) {
      const freq = 150 + Math.random() * 250;
      tone(freq, 0.055, 'square', 0.08, i * 0.065);
    }
  }, [tone]);

  const playStep = useCallback(() => {
    // Soft pop for each move step
    tone(520, 0.07, 'triangle', 0.18);
  }, [tone]);

  const playLandYellow = useCallback(() => {
    // Warm friendly chime
    tone(523, 0.12, 'sine', 0.3, 0);
    tone(659, 0.12, 'sine', 0.25, 0.1);
    tone(784, 0.2, 'sine', 0.25, 0.2);
  }, [tone]);

  const playLandRed = useCallback(() => {
    // Dramatic tense sound
    tone(220, 0.25, 'sawtooth', 0.18, 0);
    tone(185, 0.3, 'sawtooth', 0.15, 0.15);
  }, [tone]);

  const playLandGreen = useCallback(() => {
    // Soft calming sound
    tone(392, 0.18, 'sine', 0.22, 0);
    tone(494, 0.18, 'sine', 0.2, 0.14);
    tone(587, 0.25, 'sine', 0.18, 0.28);
  }, [tone]);

  const playChance = useCallback(() => {
    // Bright sparkle whoosh
    tone(880, 0.08, 'sine', 0.25, 0);
    tone(1047, 0.1, 'sine', 0.25, 0.08);
    tone(1319, 0.08, 'sine', 0.25, 0.16);
    tone(1568, 0.2, 'sine', 0.3, 0.24);
  }, [tone]);

  const playDestiny = useCallback(() => {
    // Mysterious swirling sound
    tone(330, 0.22, 'triangle', 0.22, 0);
    tone(415, 0.22, 'triangle', 0.22, 0.18);
    tone(494, 0.3, 'triangle', 0.22, 0.35);
  }, [tone]);

  const playSuccess = useCallback(() => {
    // Happy ascending jingle
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'sine', 0.28, i * 0.1));
  }, [tone]);

  const playFail = useCallback(() => {
    // Low descending thud
    [300, 240, 180].forEach((f, i) => tone(f, 0.22, 'sawtooth', 0.18, i * 0.1));
  }, [tone]);

  const playScoreUp = useCallback(() => {
    // Coin collect sound
    tone(784, 0.08, 'sine', 0.22, 0);
    tone(1047, 0.14, 'sine', 0.25, 0.07);
  }, [tone]);

  const playScoreDown = useCallback(() => {
    // Penalty sound
    tone(330, 0.22, 'triangle', 0.2, 0);
    tone(220, 0.28, 'triangle', 0.18, 0.12);
  }, [tone]);

  const playHouse = useCallback(() => {
    // Building construction sound
    tone(880, 0.06, 'sine', 0.28, 0);
    tone(1047, 0.06, 'sine', 0.28, 0.06);
    tone(1319, 0.12, 'sine', 0.3, 0.12);
  }, [tone]);

  const playNextTurn = useCallback(() => {
    // Turn transition sound
    tone(440, 0.08, 'triangle', 0.2, 0);
    tone(550, 0.1, 'triangle', 0.2, 0.08);
  }, [tone]);

  const playPassStart = useCallback(() => {
    // Passing start bonus jingle
    [523, 784, 1047].forEach((f, i) => tone(f, 0.12, 'sine', 0.28, i * 0.08));
  }, [tone]);

  return {
    playRoll,
    playStep,
    playLandYellow,
    playLandRed,
    playLandGreen,
    playChance,
    playDestiny,
    playSuccess,
    playFail,
    playScoreUp,
    playScoreDown,
    playHouse,
    playNextTurn,
    playPassStart,
  };
}
