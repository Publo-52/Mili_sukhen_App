// WebAudio Ambient Soundscape Generator for Romantic Atmosphere

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private timer: NodeJS.Timeout | null = null;
  private volume: number = 0.35;
  private activeOscillators: OscillatorNode[] = [];

  // Romantic Pentatonic Chords (C Major 9, Fmaj7, Am9, Gsus4)
  private chordProgressions = [
    [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9 (C4, E4, G4, B4, D5)
    [349.23, 440.00, 523.25, 659.25],         // Fmaj7 (F4, A4, C5, E5)
    [220.00, 261.63, 329.63, 392.00, 493.88], // Am9 (A3, C4, E4, G4, B4)
    [196.00, 261.63, 293.66, 392.00],         // Gsus4 (G3, C4, D4, G4)
  ];
  private currentChordIndex = 0;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
  }

  public play() {
    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(this.volume, this.ctx.currentTime + 2.5);

    this.playNextChord();
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.isPlaying) {
        this.playNextChord();
      }
    }, 4500);
  }

  private playNextChord() {
    if (!this.ctx || !this.gainNode || !this.isPlaying) return;

    const chord = this.chordProgressions[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chordProgressions.length;

    const now = this.ctx.currentTime;

    // Create a gentle filter for warm, dreamy sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 2);
    filter.frequency.exponentialRampToValueAtTime(600, now + 4);
    filter.connect(this.gainNode);

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Dreamy sine + triangle mix
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle detune for lush chorus feeling
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

      // Envelope: gentle attack, long sustain, soft release
      const attack = 1.2 + (i * 0.2);
      const duration = 4.2;

      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.exponentialRampToValueAtTime(0.12 / (chord.length * 0.7), now + attack);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start(now);
      osc.stop(now + duration + 0.1);

      this.activeOscillators.push(osc);
      setTimeout(() => {
        const idx = this.activeOscillators.indexOf(osc);
        if (idx > -1) this.activeOscillators.splice(idx, 1);
      }, (duration + 0.2) * 1000);
    });
  }

  public pause() {
    if (!this.ctx || !this.gainNode) return;
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }
}

export const audioEngine = new RomanticAudioEngine();
