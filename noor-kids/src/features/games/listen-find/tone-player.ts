export async function playTonePattern(notes: readonly number[]): Promise<void> {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") {
    throw new Error("এই ব্রাউজারে ডেমো সাউন্ড চালানো যাচ্ছে না।");
  }

  const context = new window.AudioContext();
  const noteDuration = 0.17;
  const noteGap = 0.11;

  try {
    await context.resume();
    const startAt = context.currentTime + 0.04;

    notes.forEach((frequency, index) => {
      const start = startAt + index * (noteDuration + noteGap);
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + noteDuration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + noteDuration);
    });

    const totalDuration = notes.length * (noteDuration + noteGap);
    await new Promise<void>((resolve) => window.setTimeout(resolve, totalDuration * 1000));
  } finally {
    await context.close();
  }
}
