/**
 * Web Audio API celebration chime for birthday wishes
 * Generates an upbeat 3-tone celebration chime without external audio assets.
 */
export function playCelebrationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.2 },  // C5
      { freq: 659.25, time: 0.15, duration: 0.25 }, // E5
      { freq: 783.99, time: 0.35, duration: 0.35 }, // G5
      { freq: 1046.50, time: 0.6, duration: 0.55 }, // C6
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

      gain.gain.setValueAtTime(0, ctx.currentTime + note.time);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + note.time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.time + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + note.time);
      osc.stop(ctx.currentTime + note.time + note.duration);
    });
  } catch (err) {
    console.debug('Audio chime disabled or blocked by browser autoplay policy:', err);
  }
}
