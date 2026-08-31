// Romantic Audio Engine supporting high-quality romantic piano streams with WebAudio fallback
// 100% mobile and desktop compatible

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  type: 'stream' | 'synth';
}

export const ROMANTIC_PLAYLIST: AudioTrack[] = [
  {
    id: 'clair-de-lune',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Claude_Debussy_-_Suite_bergamasque_-_3._Clair_de_lune.ogg',
    type: 'stream',
  },
  {
    id: 'gymnopedie-1',
    title: 'Gymnopédie No. 1',
    artist: 'Erik Satie',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Erik_Satie_-_gymnopedie_no_1.ogg',
    type: 'stream',
  },
  {
    id: 'chopin-nocturne',
    title: 'Nocturne in E-flat (Op. 9 No. 2)',
    artist: 'Frédéric Chopin',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Chopin_Nocturne_Op9_No2.ogg',
    type: 'stream',
  },
  {
    id: 'dreamy-chords',
    title: 'Celestial Romance',
    artist: 'Suksharmi Ambient Synth',
    url: '',
    type: 'synth',
  },
];

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private timer: NodeJS.Timeout | null = null;
  private volume: number = 0.45;
  private currentTrackIndex: number = 0;
  private audioElement: HTMLAudioElement | null = null;
  private listeners: ((playing: boolean, track: AudioTrack) => void)[] = [];

  // Romantic Pentatonic Chords Fallback (C Major 9, Fmaj7, Am9, Gsus4)
  private chordProgressions = [
    [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
    [349.23, 440.00, 523.25, 659.25],         // Fmaj7
    [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
    [196.00, 261.63, 293.66, 392.00],         // Gsus4
  ];
  private currentChordIndex = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (this.audioElement || typeof window === 'undefined') return;
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    this.audioElement.volume = this.volume;

    this.audioElement.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.audioElement.addEventListener('error', () => {
      // If streaming error occurs, fallback seamlessly to synth
      this.playSynth();
    });
  }

  public subscribe(cb: (playing: boolean, track: AudioTrack) => void) {
    this.listeners.push(cb);
    cb(this.isPlaying, this.getCurrentTrack());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    const track = this.getCurrentTrack();
    this.listeners.forEach((l) => l(this.isPlaying, track));
  }

  public getCurrentTrack(): AudioTrack {
    return ROMANTIC_PLAYLIST[this.currentTrackIndex] || ROMANTIC_PLAYLIST[0];
  }

  public async play(trackIndex?: number) {
    if (typeof trackIndex === 'number') {
      this.currentTrackIndex = (trackIndex + ROMANTIC_PLAYLIST.length) % ROMANTIC_PLAYLIST.length;
    }

    this.initAudioElement();
    const track = this.getCurrentTrack();
    this.isPlaying = true;
    this.notify();

    if (track.type === 'stream' && track.url && this.audioElement) {
      try {
        if (this.audioElement.src !== track.url) {
          this.audioElement.src = track.url;
        }
        this.audioElement.volume = this.volume;
        await this.audioElement.play();
        this.stopSynth();
        return;
      } catch {
        // Autoplay policy or format fallback
        this.playSynth();
      }
    } else {
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.playSynth();
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynth();
    this.notify();
  }

  public nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % ROMANTIC_PLAYLIST.length;
    if (this.isPlaying) {
      this.play();
    } else {
      this.notify();
    }
  }

  public prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + ROMANTIC_PLAYLIST.length) % ROMANTIC_PLAYLIST.length;
    if (this.isPlaying) {
      this.play();
    } else {
      this.notify();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
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

  // --- SYNTHESIZER ENGINE (Romantic Chords) ---
  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      } catch {}
    }
  }

  private async playSynth() {
    this.initContext();
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch {}
      }
      if (this.gainNode) {
        this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(this.volume, this.ctx.currentTime + 1.8);
      }

      this.playNextChord();
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (this.isPlaying) {
          this.playNextChord();
        }
      }, 4200);
    }
  }

  private playNextChord() {
    if (!this.ctx || !this.gainNode || !this.isPlaying) return;
    const chord = this.chordProgressions[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chordProgressions.length;
    const now = this.ctx.currentTime;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 2);
    filter.frequency.exponentialRampToValueAtTime(600, now + 4);
    filter.connect(this.gainNode);

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

        const attack = 1.2 + (i * 0.2);
        const duration = 4.0;

        oscGain.gain.setValueAtTime(0.0001, now);
        oscGain.gain.exponentialRampToValueAtTime(0.14 / (chord.length * 0.7), now + attack);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start(now);
        osc.stop(now + duration + 0.1);
      } catch {}
    });
  }

  private stopSynth() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx && this.gainNode) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    }
  }
}

export const audioEngine = new RomanticAudioEngine();
