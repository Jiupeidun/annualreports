let audioContext: AudioContext | null = null;

function shouldSkipSound(): boolean {
  return (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContext();
  }

  return audioContext;
}

export function playCoverSound(): void {
  if (shouldSkipSound()) {
    return;
  }

  try {
    const context = getAudioContext();
    const startAt = context.currentTime;
    const master = context.createGain();
    const filter = context.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, startAt);
    master.gain.setValueAtTime(0.0001, startAt);
    master.gain.exponentialRampToValueAtTime(0.052, startAt + 0.018);
    master.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.18);
    filter.connect(master);
    master.connect(context.destination);

    [
      { frequency: 520, type: "sine" as OscillatorType, gain: 0.62, delay: 0 },
      { frequency: 760, type: "triangle" as OscillatorType, gain: 0.24, delay: 0.035 }
    ].forEach(({ frequency, type, gain, delay }) => {
      const oscillator = context.createOscillator();
      const toneGain = context.createGain();
      const toneStart = startAt + delay;
      const toneEnd = toneStart + 0.13;

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, toneStart);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.86, toneEnd);
      toneGain.gain.setValueAtTime(gain, toneStart);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, toneEnd);
      oscillator.connect(toneGain);
      toneGain.connect(filter);
      oscillator.start(toneStart);
      oscillator.stop(toneEnd + 0.02);
    });

    if (context.state !== "running") {
      void context.resume();
    }
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.warn("[audio] Failed to play cover sound:", error);
    }
  }
}
