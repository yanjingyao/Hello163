class AudioPlayerService {
  private audio: HTMLAudioElement | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupEventListeners();
    }
  }

  private setupEventListeners() {
    if (!this.audio) return;

    const events = {
      'timeupdate': this.handleTimeUpdate.bind(this),
      'ended': this.handleEnded.bind(this),
      'loadedmetadata': this.handleLoadedMetadata.bind(this),
      'error': this.handleError.bind(this),
      'play': this.handlePlay.bind(this),
      'pause': this.handlePause.bind(this),
    };

    Object.entries(events).forEach(([event, handler]) => {
      this.audio?.addEventListener(event, handler);
    });
  }

  private handleTimeUpdate() {
    if (this.audio) {
      const currentTime = this.audio.currentTime;
      this.emit('timeupdate', currentTime);
    }
  }

  private handleEnded() {
    this.emit('ended');
  }

  private handleLoadedMetadata() {
    if (this.audio) {
      const duration = this.audio.duration;
      this.emit('loadedmetadata', duration);
    }
  }

  private handleError(error: Event) {
    console.error('Audio error:', error);
    this.emit('error', error);
  }

  private handlePlay() {
    this.emit('play');
  }

  private handlePause() {
    this.emit('pause');
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  load(url: string) {
    if (!this.audio) return;

    this.audio.src = url;
    this.audio.load();
  }

  play() {
    if (!this.audio) return;

    const playPromise = this.audio.play();
    playPromise.catch(error => {
      console.error('Play error:', error);
    });
  }

  pause() {
    if (!this.audio) return;

    this.audio.pause();
  }

  stop() {
    if (!this.audio) return;

    this.audio.pause();
    this.audio.currentTime = 0;
  }

  seek(time: number) {
    if (!this.audio) return;

    this.audio.currentTime = time;
  }

  setVolume(volume: number) {
    if (!this.audio) return;

    this.audio.volume = Math.max(0, Math.min(1, volume / 100));
  }

  getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  getDuration(): number {
    return this.audio?.duration || 0;
  }

  isPlaying(): boolean {
    return !this.audio?.paused;
  }

  destroy() {
    if (!this.audio) return;

    const events = ['timeupdate', 'ended', 'loadedmetadata', 'error', 'play', 'pause'];
    events.forEach(event => {
      this.audio?.removeEventListener(event, this as any);
    });
    this.audio = null;
    this.listeners.clear();
  }
}

export const audioPlayer = new AudioPlayerService();
