// Romantic Audio Engine - Full Mobile & Desktop Support
// Rock-solid HTML5 Audio with multi-track romantic playlist & generative ambient synth fallback

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  type: 'stream' | 'synth' | 'youtube';
  youtubeId?: string;
  durationLabel?: string;
}

export const ROMANTIC_PLAYLIST: AudioTrack[] = [
  {
    id: 'romantic-melody-1',
    title: 'Suksharmi Special Melody',
    artist: 'Mili & Sukhen Romance',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Claude_Debussy_-_Suite_bergamasque_-_3._Clair_de_lune.ogg',
    type: 'stream',
    durationLabel: '5:04',
  },
  {
    id: 'gymnopedie-1',
    title: 'Gymnopédie No. 1',
    artist: 'Erik Satie (Soft Ambient Piano)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Gymnopedie_No_1.ogg',
    type: 'stream',
    durationLabel: '3:08',
  },
  {
    id: 'canon-in-d',
    title: 'Canon in D Romance',
    artist: 'Johann Pachelbel (Acoustic Strings)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Pachelbel%27s_Canon.ogg',
    type: 'stream',
    durationLabel: '5:41',
  },
  {
    id: 'fur-elise',
    title: 'Für Elise (Romantic Piano)',
    artist: 'Ludwig van Beethoven',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Bagatelle_in_A_minor%2C_Op._59_%28%22F%C3%BCr_Elise%22%29_by_Ludwig_van_Beethoven_arranged_by_Mark_Avery.ogg',
    type: 'stream',
    durationLabel: '3:02',
  },
  {
    id: 'ambient-starlight-synth',
    title: 'Starlight Dream (Interactive Ambient)',
    artist: 'Suksharmi Web Synth',
    url: '',
    type: 'synth',
    durationLabel: 'Infinite Loop',
  },
];

export const MAIN_YOUTUBE_TRACK = ROMANTIC_PLAYLIST[0];

export type AudioSubscriber = (playing: boolean, track: AudioTrack) => void;

class RomanticAudioEngine {
  private isPlaying: boolean = false;
  private volume: number = 0.65;
  private currentTrackIndex: number = 0;
  private listeners: AudioSubscriber[] = [];
  
  // HTML5 Audio element
  private audioElement: HTMLAudioElement | null = null;
  private isAudioElementLoading: boolean = false;

  // WebAudio Synth Engine (Offline / Ambient Fallback)
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private synthInterval: any = null;
  private currentChordIdx: number = 0;

  private chords = [
    [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
    [349.23, 440.0, 523.25, 659.25],         // Fmaj7
    [220.0, 261.63, 329.63, 392.0, 493.88],  // Am9
    [196.0, 246.94, 293.66, 392.0, 440.0],   // Gsus4 / G6
    [174.61, 220.0, 261.63, 329.63],         // Fmaj7 low
    [164.81, 246.94, 329.63, 392.0],         // Em7
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (typeof window === 'undefined' || this.audioElement) return;

    try {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';
      this.audioElement.volume = this.volume;
      this.audioElement.crossOrigin = 'anonymous';

      const track = this.getCurrentTrack();
      if (track.url) {
        this.audioElement.src = track.url;
      }

      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
        this.notify();
      });

      this.audioElement.addEventListener('pause', () => {
        // Only set playing false if synth isn't running as primary
        if (this.getCurrentTrack().type !== 'synth') {
          this.isPlaying = false;
          this.notify();
        }
      });

      this.audioElement.addEventListener('ended', () => {
        this.nextTrack();
      });

      this.audioElement.addEventListener('error', (e) => {
        console.warn('Audio element error, falling back to ambient synth:', e);
        if (this.isPlaying) {
          this.startSynth();
        }
      });
    } catch (e) {
      console.warn('Could not initialize audio element:', e);
    }
  }

  public subscribe(cb: AudioSubscriber): () => void {
    this.listeners.push(cb);
    // Notify immediately with current state
    try {
      cb(this.isPlaying, this.getCurrentTrack());
    } catch (e) {
      console.error(e);
    }
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    const track = this.getCurrentTrack();
    this.listeners.forEach((cb) => {
      try {
        cb(this.isPlaying, track);
      } catch (e) {
        console.error(e);
      }
    });
  }

  public getCurrentTrack(): AudioTrack {
    return ROMANTIC_PLAYLIST[this.currentTrackIndex] || ROMANTIC_PLAYLIST[0];
  }

  public getPlaylist(): AudioTrack[] {
    return ROMANTIC_PLAYLIST;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public async play(): Promise<void> {
    this.isPlaying = true;
    this.notify();

    const track = this.getCurrentTrack();

    if (track.type === 'synth') {
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.startSynth();
      return;
    }

    this.stopSynth();
    this.initAudioElement();

    if (this.audioElement) {
      try {
        if (!this.audioElement.src || this.audioElement.src !== track.url) {
          this.audioElement.src = track.url;
          this.audioElement.load();
        }
        this.audioElement.volume = this.volume;
        await this.audioElement.play();
      } catch (err) {
        console.warn('HTML5 Audio play failed (e.g. mobile gesture needed), falling back to WebAudio Synth:', err);
        // Fallback to synth if stream playback is blocked
        this.startSynth();
      }
    } else {
      this.startSynth();
    }
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {}
    }
    this.stopSynth();
    this.notify();
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public nextTrack(): void {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % ROMANTIC_PLAYLIST.length;
    const wasPlaying = this.isPlaying;
    
    if (this.audioElement) {
      this.audioElement.pause();
      const track = this.getCurrentTrack();
      if (track.url) {
        this.audioElement.src = track.url;
      }
    }
    this.notify();

    if (wasPlaying) {
      this.play();
    }
  }

  public prevTrack(): void {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + ROMANTIC_PLAYLIST.length) % ROMANTIC_PLAYLIST.length;
    const wasPlaying = this.isPlaying;

    if (this.audioElement) {
      this.audioElement.pause();
      const track = this.getCurrentTrack();
      if (track.url) {
        this.audioElement.src = track.url;
      }
    }
    this.notify();

    if (wasPlaying) {
      this.play();
    }
  }

  public setTrack(trackId: string): void {
    const idx = ROMANTIC_PLAYLIST.findIndex((t) => t.id === trackId);
    if (idx !== -1) {
      this.currentTrackIndex = idx;
      const wasPlaying = this.isPlaying;
      
      if (this.audioElement) {
        this.audioElement.pause();
        const track = ROMANTIC_PLAYLIST[idx];
        if (track.url) {
          this.audioElement.src = track.url;
        }
      }
      this.notify();

      if (wasPlaying) {
        this.play();
      }
    }
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch {}
    }
  }

  // --- Web Audio Romantic Ambient Synthesizer ---
  private initWebAudio() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        console.warn('WebAudio initialization error:', e);
      }
    }
  }

  private async startSynth() {
    this.initWebAudio();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {}
    }

    this.playSynthChord();
    if (this.synthInterval) clearInterval(this.synthInterval);
    this.synthInterval = setInterval(() => {
      if (this.isPlaying) {
        this.playSynthChord();
      }
    }, 4500);
  }

  private playSynthChord() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const chord = this.chords[this.currentChordIdx];
    this.currentChordIdx = (this.currentChordIdx + 1) % this.chords.length;
    const now = this.ctx.currentTime;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 2.0);
    filter.frequency.exponentialRampToValueAtTime(500, now + 4.2);
    filter.connect(this.masterGain);

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 6, now);

        const attack = 1.0 + i * 0.25;
        const duration = 4.4;

        oscGain.gain.setValueAtTime(0.0001, now);
        oscGain.gain.exponentialRampToValueAtTime(0.12 / chord.length, now + attack);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      } catch {}
    });
  }

  private stopSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }
}

export const audioEngine = new RomanticAudioEngine();
