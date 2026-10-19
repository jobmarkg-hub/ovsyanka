export interface TranscriptChunk {
  id: string;
  speaker: string;
  channel: 0 | 1; // 0 = User, 1 = Remote
  startMs: number;
  endMs: number;
  text: string;
}

export interface EnhancedCitation {
  chunkId: string;
  speaker: string;
  startMs: number;
  endMs: number;
  quote: string;
}

export interface Meeting {
  id: string;
  title: string;
  folderId?: string;
  folderName?: string;
  spaceId: string;
  ownerName: string;
  createdAt: string;
  durationSeconds: number;
  participants: string[];
  rawUserNotes: string;
  enhancedNotes: string;
  isEnhanced: boolean;
  transcript: TranscriptChunk[];
  audioUrl?: string;
  calendarEventId?: string;
  tags?: string[];
}

export interface Folder {
  id: string;
  spaceId: string;
  name: string;
  description?: string;
  meetingCount?: number;
}

export interface Space {
  id: string;
  name: string;
  isPrivate: boolean;
  folders: Folder[];
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  prompt: string;
}

export type ActiveView = 'home' | 'meeting' | 'my-notes' | 'space' | 'chat';
