// Romantic Audio Engine with Background YouTube Player & High-Quality Fallbacks
// 100% Mobile, Desktop & Background Playback Compatible

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  type: 'youtube' | 'stream' | 'synth';
  youtubeId?: string;
}

export const MAIN_YOUTUBE_TRACK: AudioTrack = {
  id: 'romantic-song-1',
  title: 'Romantic Melody',
  artist: 'Suksharmi Special',
  url: 'https://youtu.be/3-buUW3gmtU',
  type: 'youtube',
  youtubeId: '3-buUW3gmtU',
};

export const ROMANTIC_PLAYLIST: AudioTrack[] = [
  MAIN_YOUTUBE_TRACK,
  {
    id: 'clair-de-lune',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Claude_Debussy_-_Suite_bergamasque_-_3._Clair_de_lune.ogg',
    type: 'stream',
  },
];

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, any>;
          events?: {
            onReady?: (event: { target: any }) => void;
            onStateChange?: (event: { data: number; target: any }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => any;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

class RomanticAudioEngine {
  private isPlaying: boolean = false;
  private volume: number = 0.55;
  private playlist: AudioTrack[] = [...ROMANTIC_PLAYLIST];
  private currentTrackIndex: number = 0;
  private currentTrack: AudioTrack = ROMANTIC_PLAYLIST[0] || MAIN_YOUTUBE_TRACK;
  private listeners: ((playing: boolean, track: AudioTrack) => void)[] = [];
  
  // YouTube Player State
  private ytPlayer: any = null;
  private isYtReady: boolean = false;
  private isYtLoading: boolean = false;
  private pendingPlay: boolean = false;

  // Fallback Audio & Synth Elements
  private audioElement: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private synthTimer: NodeJS.Timeout | null = null;

  private chordProgressions = [
    [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
    [349.23, 440.0, 523.25, 659.25], // Fmaj7
    [220.0, 261.63, 329.63, 392.0, 493.88], // Am9
    [196.0, 261.63, 293.66, 392.0], // Gsus4
  ];
  private currentChordIndex = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      // Delay initialization slightly to let the DOM settle
      setTimeout(() => {
        this.initYouTubeEngine();
      }, 500);
    }
  }

  public subscribe(cb: (playing: boolean, track: AudioTrack) => void) {
    this.listeners.push(cb);
    cb(this.isPlaying, this.currentTrack);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isPlaying, this.currentTrack));
  }

  public getCurrentTrack(): AudioTrack {
    return this.currentTrack;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getPlaylist(): AudioTrack[] {
    return this.playlist;
  }

  public setPlaylist(tracks: AudioTrack[]) {
    this.playlist = tracks;
    if (this.currentTrackIndex >= this.playlist.length) {
      this.currentTrackIndex = 0;
    }
  }

  // --- YouTube IFrame API Initialization ---
  private initYouTubeEngine() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    try {
      if (!document.body) {
        setTimeout(() => this.initYouTubeEngine(), 500);
        return;
      }

      // 1. Create hidden iframe container
      let container = document.getElementById('youtube-bg-audio-engine');
      if (!container) {
        container = document.createElement('div');
        container.id = 'youtube-bg-audio-engine';
        container.style.position = 'fixed';
        container.style.width = '1px';
        container.style.height = '1px';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.opacity = '0';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '-9999';
        document.body.appendChild(container);
      }

      // 2. Load YouTube IFrame Script if not present
      if (!window.YT && !document.getElementById('yt-iframe-api-script')) {
        this.isYtLoading = true;
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else if (document.head) {
          document.head.appendChild(tag);
        }

        const prevCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          try {
            if (prevCallback) prevCallback();
            this.createYouTubePlayer();
          } catch {}
        };
      } else if (window.YT && window.YT.Player) {
        this.createYouTubePlayer();
      }
    } catch (e) {
      console.warn('YouTube audio engine initialization skipped safely:', e);
    }
  }

  private createYouTubePlayer() {
    if (!window.YT || !window.YT.Player || this.ytPlayer) return;

    try {
      const videoId = this.currentTrack.youtubeId || '3-buUW3gmtU';
      this.ytPlayer = new window.YT.Player('youtube-bg-audio-engine', {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          loop: 1,
          playlist: videoId, // Required for loop to repeat the same video
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event: any) => {
            this.isYtReady = true;
            this.isYtLoading = false;
            try {
              event.target.setVolume(Math.round(this.volume * 100));
            } catch {}

            if (this.pendingPlay) {
              this.pendingPlay = false;
              this.play();
            }
          },
          onStateChange: (event: any) => {
            // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
            if (event.data === 1) {
              this.isPlaying = true;
              this.notify();
            } else if (event.data === 2) {
              this.isPlaying = false;
              this.notify();
            } else if (event.data === 0) {
              // Auto-play next track if playlist has multiple songs, else restart
              if (this.playlist.length > 1) {
                this.nextTrack();
              } else {
                try {
                  event.target.playVideo();
                } catch {
                  this.isPlaying = false;
                  this.notify();
                }
              }
            }
          },
          onError: (err: any) => {
            console.warn('YouTube Player encountered an issue, falling back:', err);
            this.fallbackToAudioStream();
          },
        },
      });
    } catch (e) {
      console.warn('Failed to construct YT.Player:', e);
      this.isYtReady = false;
    }
  }

  public async play() {
    this.initYouTubeEngine();
    this.isPlaying = true;
    this.notify();

    // If YouTube Player is ready, play video
    if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.playVideo === 'function') {
      try {
        this.ytPlayer.setVolume(Math.round(this.volume * 100));
        this.ytPlayer.playVideo();
        return;
      } catch (e) {
        console.warn('YouTube playVideo error:', e);
      }
    }

    // If YouTube player is still initializing, mark pending
    this.pendingPlay = true;

    // Safety fallback check after 3.5 seconds if YouTube didn't start
    setTimeout(() => {
      if (this.isPlaying && (!this.isYtReady || !this.ytPlayer)) {
        this.fallbackToAudioStream();
      }
    }, 3500);
  }

  public pause() {
    this.pendingPlay = false;
    this.isPlaying = false;

    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
      } catch {}
    }

    if (this.audioElement) {
      this.audioElement.pause();
    }

    this.stopSynth();
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public playTrackIndex(index: number) {
    if (!this.playlist || this.playlist.length === 0) return;
    this.currentTrackIndex = (index + this.playlist.length) % this.playlist.length;
    this.currentTrack = this.playlist[this.currentTrackIndex];

    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynth();

    this.isPlaying = true;
    this.notify();

    if (this.currentTrack.type === 'youtube' && this.currentTrack.youtubeId) {
      if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.loadVideoById === 'function') {
        try {
          this.ytPlayer.loadVideoById(this.currentTrack.youtubeId);
          this.ytPlayer.setVolume(Math.round(this.volume * 100));
          this.ytPlayer.playVideo();
          return;
        } catch (e) {
          console.warn('YouTube loadVideoById error:', e);
        }
      } else {
        this.pendingPlay = true;
        this.initYouTubeEngine();
      }
    } else if (this.currentTrack.type === 'stream') {
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        try {
          this.ytPlayer.pauseVideo();
        } catch {}
      }
      this.fallbackToAudioStream(this.currentTrack.url);
    }
  }

  public nextTrack() {
    if (this.playlist.length <= 1 && this.ytPlayer && this.isYtReady) {
      try {
        this.ytPlayer.seekTo(0, true);
        this.play();
      } catch {}
      return;
    }
    this.playTrackIndex(this.currentTrackIndex + 1);
  }

  public prevTrack() {
    if (this.playlist.length <= 1 && this.ytPlayer && this.isYtReady) {
      try {
        this.ytPlayer.seekTo(0, true);
        this.play();
      } catch {}
      return;
    }
    this.playTrackIndex(this.currentTrackIndex - 1);
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));

    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      try {
        this.ytPlayer.setVolume(Math.round(this.volume * 100));
      } catch {}
    }

    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }

    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch {}
    }
  }

  private fallbackToAudioStream(streamUrl?: string) {
    if (typeof window === 'undefined') return;
    const url =
      streamUrl ||
      (this.currentTrack.type === 'stream'
        ? this.currentTrack.url
        : 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Claude_Debussy_-_Suite_bergamasque_-_3._Clair_de_lune.ogg');

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';
      this.audioElement.volume = this.volume;
      this.audioElement.addEventListener('ended', () => {
        if (this.isPlaying) {
          if (this.playlist.length > 1) {
            this.nextTrack();
          } else {
            this.audioElement?.play();
          }
        }
      });
      this.audioElement.addEventListener('error', () => {
        this.playSynth();
      });
    }

    this.audioElement.src = url;
    if (this.isPlaying) {
      this.audioElement
        .play()
        .then(() => {
          this.stopSynth();
        })
        .catch(() => {
          this.playSynth();
        });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      if (this.synthTimer) clearInterval(this.synthTimer);
      this.synthTimer = setInterval(() => {
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

        const attack = 1.2 + i * 0.2;
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
    if (this.synthTimer) {
      clearInterval(this.synthTimer);
      this.synthTimer = null;
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
