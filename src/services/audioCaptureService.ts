import { TranscriptChunk } from '../types';

declare global {
  interface Window {
    electronAPI?: {
      startAudioCapture: () => Promise<{ success: boolean; mode: string }>;
      stopAudioCapture: () => Promise<{ success: boolean }>;
      getDesktopSources: () => Promise<any[]>;
      onAudioChunk: (callback: (data: Uint8Array) => void) => void;
      removeAudioChunkListener: () => void;
    };
  }
}

class AudioCaptureService {
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private analyserMic: AnalyserNode | null = null;
  private analyserSystem: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isRunning: boolean = false;
  private isPausedState: boolean = false;
  private simulationInterval: any = null;
  private startTime: number = 0;

  async start(
    onLevels: (levels: { mic: number; system: number }) => void,
    onChunk: (chunk: TranscriptChunk) => void
  ) {
    this.isRunning = true;
    this.isPausedState = false;
    this.startTime = Date.now();

    // Check if running in Electron with native ScreenCaptureKit
    if (window.electronAPI) {
      try {
        const res = await window.electronAPI.startAudioCapture();
        console.log('Native audio capture started:', res);
      } catch (e) {
        console.warn('Native capture start error, falling back to WebAudio', e);
      }
    }

    // Initialize Web Audio API for visualizer & mic
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const micSource = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyserMic = this.audioContext.createAnalyser();
      this.analyserMic.fftSize = 64;
      micSource.connect(this.analyserMic);
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported, using simulation mode', err);
    }

    // Volume level loop
    const updateLevels = () => {
      if (!this.isRunning) return;

      let micLevel = 0;
      let sysLevel = 0;

      if (this.analyserMic && !this.isPausedState) {
        const data = new Uint8Array(this.analyserMic.frequencyBinCount);
        this.analyserMic.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        micLevel = Math.min(100, Math.round((avg / 255) * 120));
      } else if (!this.isPausedState) {
        // Subtle ambient oscillation
        micLevel = Math.floor(20 + Math.random() * 35);
      }

      if (!this.isPausedState) {
        // Simulated remote participant speech activity periodically
        const t = (Date.now() - this.startTime) / 1000;
        sysLevel = Math.max(0, Math.round(Math.sin(t * 1.5) * 60 + Math.random() * 25));
      }

      onLevels({ mic: micLevel, system: sysLevel });
      this.animFrameId = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    // Live speech chunks simulation engine (if no cloud API configured yet)
    const samplePhrases = [
      { speaker: 'Sam Stephenson', channel: 1 as const, text: "Granola combines audio transcript capture with your manual notes in real-time." },
      { speaker: 'You', channel: 0 as const, text: "Got it. So I can write short scrappy notes while the app captures full context in the background." },
      { speaker: 'Sam Stephenson', channel: 1 as const, text: "Yes! At the end of the meeting, the AI auto-synthesizes and produces enhanced notes." },
      { speaker: 'You', channel: 0 as const, text: "And each statement gets matched with the exact timecode in the audio." },
      { speaker: 'Sam Stephenson', channel: 1 as const, text: "Correct, you can click any bullet point to jump to that exact sentence in the audio." },
    ];

    let phraseIdx = 0;
    this.simulationInterval = setInterval(() => {
      if (this.isPausedState || !this.isRunning) return;
      if (phraseIdx < samplePhrases.length) {
        const item = samplePhrases[phraseIdx++];
        const nowMs = Date.now() - this.startTime;
        onChunk({
          id: `chunk-${Date.now()}`,
          speaker: item.speaker,
          channel: item.channel,
          startMs: nowMs - 4000,
          endMs: nowMs,
          text: item.text,
        });
      }
    }, 6500);
  }

  pause() {
    this.isPausedState = true;
  }

  resume() {
    this.isPausedState = false;
  }

  stop() {
    this.isRunning = false;
    this.isPausedState = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (window.electronAPI) {
      window.electronAPI.stopAudioCapture().catch(() => {});
    }
  }
}

export const audioCaptureService = new AudioCaptureService();
