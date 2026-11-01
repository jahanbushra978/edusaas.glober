export async function playSuccessChime(context: AudioContext): Promise<void> {
  await context.resume();
  const startAt = context.currentTime + 0.025;
  const notes = [659.25, 783.99, 987.77, 1318.51];

  notes.forEach((frequency, index) => {
    const start = startAt + index * 0.16;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.055, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.34);
  });

  await new Promise<void>((resolve) => window.setTimeout(resolve, 850));
}
