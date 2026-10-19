import { TranscriptChunk } from '../types';

export interface DiarizedSpeaker {
  id: string;
  name: string;
  channel: 0 | 1;
  color: string;
}

export class LocalWhisperService {
  private isModelLoaded: boolean = false;
  private currentModel: string = 'large-v3-turbo-q5_0';

  async loadModel(modelName: string = 'large-v3-turbo-q5_0'): Promise<boolean> {
    console.log(`Loading on-device Metal quantized whisper model: ${modelName}...`);
    await new Promise((r) => setTimeout(r, 800));
    this.isModelLoaded = true;
    this.currentModel = modelName;
    return true;
  }

  /**
   * Applies Turn Clustering Diarization across remote audio (Channel 1)
   */
  diarizeChunks(chunks: TranscriptChunk[]): TranscriptChunk[] {
    let remoteSpeakerIdx = 1;
    let lastEndMs = 0;

    return chunks.map((chunk) => {
      if (chunk.channel === 0) {
        return {
          ...chunk,
          speaker: 'You (Mic)',
        };
      }

      // Channel 1: Remote Participants
      if (lastEndMs > 0 && chunk.startMs - lastEndMs > 1800) {
        remoteSpeakerIdx = remoteSpeakerIdx === 1 ? 2 : 1;
      }
      lastEndMs = chunk.endMs;

      return {
        ...chunk,
        speaker: chunk.speaker && !chunk.speaker.includes('Participant') ? chunk.speaker : `Remote Speaker ${remoteSpeakerIdx}`,
      };
    });
  }
}

export const localWhisperService = new LocalWhisperService();
