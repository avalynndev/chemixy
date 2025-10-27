declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

class SoundManager {
  private enabled: boolean = true;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.enabled = localStorage.getItem("soundEnabled") !== "false";
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext!;
      this.audioContext = new AudioContextClass();
    }
    return this.audioContext;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume: number = 0.3,
  ) {
    if (!this.enabled) return;

    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + duration,
      );

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  playDrop() {
    this.playTone(400, 0.1, "sine");
  }

  playBubble() {
    this.playTone(300, 0.2, "sine");
    setTimeout(() => this.playTone(350, 0.15, "sine"), 100);
  }

  playSparkle() {
    this.playTone(800, 0.15, "square");
    setTimeout(() => this.playTone(1000, 0.1, "square"), 50);
    setTimeout(() => this.playTone(1200, 0.1, "square"), 100);
  }

  playClick() {
    this.playTone(600, 0.05, "triangle");
  }

  playNotification() {
    this.playTone(500, 0.2, "sine");
    setTimeout(() => this.playTone(600, 0.2, "sine"), 200);
  }

  playSuccess() {
    this.playTone(700, 0.1, "sine");
    setTimeout(() => this.playTone(900, 0.1, "sine"), 120);
  }

  playError() {
    this.playTone(200, 0.2, "square");
    setTimeout(() => this.playTone(150, 0.25, "square"), 150);
  }

  playWin() {
    this.playTone(700, 0.15, "triangle");
    setTimeout(() => this.playTone(900, 0.15, "triangle"), 150);
    setTimeout(() => this.playTone(1200, 0.15, "triangle"), 300);
  }

  playLose() {
    this.playTone(400, 0.15, "square");
    setTimeout(() => this.playTone(300, 0.2, "square"), 200);
  }

  playPop() {
    this.playTone(700, 0.05, "square");
    setTimeout(() => this.playTone(900, 0.05, "square"), 80);
  }

  playPing() {
    this.playTone(1000, 0.15, "sine");
  }

  toggle() {
    this.enabled = !this.enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("soundEnabled", String(this.enabled));
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
