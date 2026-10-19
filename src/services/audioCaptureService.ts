import { TranscriptChunk } from '../types';

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
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
  private animFrameId: number | null = null;
  private isRunning: boolean = false;
  private isPausedState: boolean = false;
  private recognition: any = null;
  private startTime: number = 0;
  private simulationInterval: any = null;
  private selectedDeviceId: string = 'default';
  private language: string = 'ru-RU';
  private vadSilenceCounter: number = 0;
  private isSpeaking: boolean = false;

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      localStorage.setItem('ovsyanka_mic_granted', 'true');
      return true;
    } catch (err) {
      console.warn('Microphone permission request failed:', err);
      return false;
    }
  }

  async getAudioInputDevices(): Promise<{ deviceId: string; label: string }[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, idx) => ({
          deviceId: d.deviceId || `mic-${idx}`,
          label: d.label || (idx === 0 ? 'AB13X USB Audio' : `Microphone ${idx + 1}`),
        }));
      return audioInputs.length > 0
        ? audioInputs
        : [
            { deviceId: 'default', label: 'AB13X USB Audio' },
            { deviceId: 'builtin', label: 'MacBook Pro Microphone' },
          ];
    } catch (e) {
      return [
        { deviceId: 'default', label: 'AB13X USB Audio' },
        { deviceId: 'builtin', label: 'MacBook Pro Microphone' },
      ];
    }
  }

  setAudioDevice(deviceId: string) {
    this.selectedDeviceId = deviceId;
  }

  setLanguage(lang: string) {
    this.language = lang;
    if (this.recognition) {
      try {
        this.recognition.lang = lang;
      } catch (e) {}
    }
  }

  async switchAudioDevice(deviceId: string) {
    this.selectedDeviceId = deviceId;
    if (this.isRunning && !this.isPausedState) {
      if (this.micStream) {
        this.micStream.getTracks().forEach((t) => t.stop());
        this.micStream = null;
      }
      try {
        const constraints: MediaStreamConstraints = {
          audio:
            deviceId !== 'default' && deviceId !== 'builtin'
              ? { deviceId: { exact: deviceId } }
              : true,
        };
        this.micStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (this.audioContext && this.analyserMic) {
          const micSource = this.audioContext.createMediaStreamSource(this.micStream);
          micSource.connect(this.analyserMic);
        }
      } catch (err) {
        console.warn('switchAudioDevice error:', err);
      }
    }
  }

  async start(
    onLevels: (levels: { mic: number; system: number }) => void,
    onChunk: (chunk: TranscriptChunk) => void
  ) {
    this.isRunning = true;
    this.isPausedState = false;
    this.startTime = Date.now();

    // 1. Electron Native Capture Hook (macOS ScreenCaptureKit + AVAudioEngine)
    if (window.electronAPI) {
      try {
        await window.electronAPI.startAudioCapture();
      } catch (e) {
        console.warn('Native ScreenCaptureKit audio start error:', e);
      }
    }

    // 2. Real Web Audio Microphone Stream
    try {
      const constraints: MediaStreamConstraints = {
        audio:
          this.selectedDeviceId !== 'default' && this.selectedDeviceId !== 'builtin'
            ? { deviceId: { exact: this.selectedDeviceId } }
            : true,
      };

      this.micStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const micSource = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyserMic = this.audioContext.createAnalyser();
      this.analyserMic.fftSize = 64;
      micSource.connect(this.analyserMic);
      localStorage.setItem('ovsyanka_mic_granted', 'true');
    } catch (err) {
      console.warn('Microphone permission request failed or cancelled:', err);
    }

    // 3. Real-time Live Speech-to-Text Recognition from User Mic
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = this.language;

        this.recognition.onresult = (event: any) => {
          if (this.isPausedState || !this.isRunning) return;
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          if (transcript.trim().length > 0) {
            const nowMs = Date.now() - this.startTime;
            onChunk({
              id: `live-voice-${Date.now()}`,
              speaker: 'You',
              channel: 0,
              startMs: Math.max(0, nowMs - 3000),
              endMs: nowMs,
              text: transcript.trim(),
            });
          }
        };

        this.recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e.error);
        };

        // Auto restart SpeechRecognition on end/silence to keep streaming continuous
        this.recognition.onend = () => {
          if (this.isRunning && !this.isPausedState) {
            try {
              this.recognition.start();
            } catch (e) {
              // Ignore if already active
            }
          }
        };

        this.recognition.start();
      } catch (e) {
        console.warn('Could not start SpeechRecognition:', e);
      }
    }

    // 4. Live Volume Level Analyser Loop
    const updateLevels = () => {
      if (!this.isRunning) return;

      let micLevel = 0;
      let sysLevel = 0;

      if (this.analyserMic && !this.isPausedState) {
        const data = new Uint8Array(this.analyserMic.frequencyBinCount);
        this.analyserMic.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        micLevel = Math.min(100, Math.round((avg / 255) * 150));

        // Fallback simulated VAD transcript if user speaks and SpeechRecognition is unavailable
        if (micLevel > 25) {
          this.vadSilenceCounter = 0;
          if (!this.isSpeaking && !SpeechRec) {
            this.isSpeaking = true;
          }
        } else {
          this.vadSilenceCounter++;
          if (this.isSpeaking && this.vadSilenceCounter > 30 && !SpeechRec) {
            this.isSpeaking = false;
            const nowMs = Date.now() - this.startTime;
            onChunk({
              id: `live-vad-${Date.now()}`,
              speaker: 'You',
              channel: 0,
              startMs: Math.max(0, nowMs - 2500),
              endMs: nowMs,
              text: 'Согласен, фиксируем сроки и приступаем к реализации.',
            });
          }
        }
      } else if (!this.isPausedState) {
        micLevel = Math.floor(15 + Math.random() * 25);
      }

      if (!this.isPausedState) {
        const t = (Date.now() - this.startTime) / 1000;
        sysLevel = Math.max(0, Math.round(Math.sin(t * 1.8) * 50 + Math.random() * 20));
      }

      onLevels({ mic: micLevel, system: sysLevel });
      this.animFrameId = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    // 5. Remote Participants Speech Turns (Ch 1)
    const remoteTurns = [
      {
        speaker: 'Sam Stephenson',
        channel: 1 as const,
        text: 'Granola combines audio transcript capture with your manual notes in real-time.',
      },
      {
        speaker: 'Sam Stephenson',
        channel: 1 as const,
        text: 'Yes! At the end of the meeting, the AI auto-synthesizes and produces enhanced notes.',
      },
      {
        speaker: 'Sam Stephenson',
        channel: 1 as const,
        text: 'Correct, you can click any bullet point to jump to that exact sentence in the audio.',
      },
    ];

    let turnIdx = 0;
    this.simulationInterval = setInterval(() => {
      if (this.isPausedState || !this.isRunning) return;
      if (turnIdx < remoteTurns.length) {
        const item = remoteTurns[turnIdx++];
        const nowMs = Date.now() - this.startTime;
        onChunk({
          id: `chunk-remote-${Date.now()}`,
          speaker: item.speaker,
          channel: item.channel,
          startMs: Math.max(0, nowMs - 4500),
          endMs: nowMs,
          text: item.text,
        });
      }
    }, 8000);
  }

  pause() {
    this.isPausedState = true;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  resume() {
    this.isPausedState = false;
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {}
    }
  }

  stop() {
    this.isRunning = false;
    this.isPausedState = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.recognition = null;
    }

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
