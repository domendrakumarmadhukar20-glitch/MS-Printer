/**
 * MS PRINTERS - Audio & Voice Feedback Service
 * Uses Web Audio API for industrial chimes and Web SpeechSynthesis for announcements
 */

class SoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;

  constructor() {
    // AudioContext will be initialized on first user interaction or call
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Play payment confirmation chime: Uplifting major triad
   */
  public playPaymentSuccessChime() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.45);
    });
  }

  /**
   * Play printer feed mechanical sound / pulse
   */
  public playPrintStartChime() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Play Print Completed celebration bell
   */
  public playPrintCompletedChime() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659.25, 783.99, 1046.50, 1318.51]; // E5, G5, C6, E6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.28 * this.volume, now + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.85);
    });
  }

  /**
   * Play error / warning buzzer
   */
  public playErrorChime() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(196, now + 0.15);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Voice Announcement using Web Speech API
   */
  public speakAnnouncement(text: string, lang: 'en-IN' | 'en-US' | 'hi-IN' = 'en-IN') {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = lang;

      // Prefer Indian English voice if available for natural local accent
      const voices = window.speechSynthesis.getVoices();
      const inVoice = voices.find(v => v.lang.includes('IN') || v.name.includes('India'));
      if (inVoice) {
        utterance.voice = inVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis may be restricted before user gesture
    }
  }

  public announcePaymentConfirmed() {
    this.playPaymentSuccessChime();
    setTimeout(() => {
      this.speakAnnouncement('Payment verified. Your document is now queued for printing.');
    }, 450);
  }

  public announcePrintStarted(pageCount: number) {
    this.playPrintStartChime();
    setTimeout(() => {
      this.speakAnnouncement(`Printing on HP LaserJet Pro M126. Total ${pageCount} pages.`);
    }, 350);
  }

  public announcePrintCompleted() {
    this.playPrintCompletedChime();
    setTimeout(() => {
      this.speakAnnouncement('Print completed! Please collect your document from the output tray. Thank you for using MS Printers.');
    }, 500);
  }

  public announcePaperAlert(message: string) {
    this.playErrorChime();
    setTimeout(() => {
      this.speakAnnouncement(`Attention: ${message}`);
    }, 400);
  }
}

export const soundService = new SoundService();
