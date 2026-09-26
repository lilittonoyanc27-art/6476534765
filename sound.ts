// Sound synthesizer and Speech synthesis using Web Audio API & Web Speech API

class SoundEffects {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Check saved sound preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pasapalabra_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      }
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(mute: boolean) {
    this.muted = mute;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pasapalabra_muted', String(mute));
      if (mute) {
        this.stopSpeaking();
      }
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playCorrect() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Harmonic chime: E5, G#5, B5, E6
    const freqs = [659.25, 830.61, 987.77, 1318.51];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.65);
    });
  }

  playWrong() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.28);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  playPass() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  playClick() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playVictory() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { f: 523.25, d: 0.15, offset: 0 },
      { f: 659.25, d: 0.15, offset: 0.15 },
      { f: 783.99, d: 0.15, offset: 0.3 },
      { f: 1046.5, d: 0.5, offset: 0.45 },
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.offset);

      gain.gain.setValueAtTime(0, now + n.offset);
      gain.gain.linearRampToValueAtTime(0.25, now + n.offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.offset + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.offset);
      osc.stop(now + n.offset + n.d + 0.05);
    });
  }

  speakSpanish(text: string, onEnd?: () => void) {
    if (this.muted) {
      if (onEnd) onEnd();
      return;
    }
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find((v) => v.lang.startsWith('es'));
    if (esVoice) {
      utterance.voice = esVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
  }
}

export const sound = new SoundEffects();
