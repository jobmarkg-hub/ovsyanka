import { create } from 'zustand';
import { Meeting, Space, ActiveView, TranscriptChunk, Recipe } from '../types';
import { INITIAL_MEETINGS, INITIAL_SPACES, INITIAL_RECIPES } from '../data/mockData';
import { enhanceNotesWithTranscript } from '../services/jotEnhanceService';
import { audioCaptureService } from '../services/audioCaptureService';

interface AppState {
  // Navigation
  activeView: ActiveView;
  selectedSpaceId: string | null;
  activeMeetingId: string | null;

  // Data
  meetings: Meeting[];
  spaces: Space[];
  recipes: Recipe[];

  // Recording & Live Audio
  isRecording: boolean;
  isPaused: boolean;
  recordingDurationSeconds: number;
  isTranscriptDrawerOpen: boolean;
  liveAudioLevels: { mic: number; system: number };
  liveTranscript: TranscriptChunk[];

  // UI state
  isEnhancing: boolean;
  isWorkspaceMenuOpen: boolean;
  isIntegrationsModalOpen: boolean;
  isSecurityModalOpen: boolean;
  isPermissionsModalOpen: boolean;
  searchQuery: string;

  // Actions
  setActiveView: (view: ActiveView, spaceId?: string) => void;
  openMeeting: (meetingId: string) => void;
  createNewMeeting: () => string;
  updateMeetingNotes: (meetingId: string, notes: string) => void;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<void>;
  toggleTranscriptDrawer: (open?: boolean) => void;
  enhanceCurrentMeeting: () => Promise<void>;
  toggleWorkspaceMenu: (open?: boolean) => void;
  toggleIntegrationsModal: (open?: boolean) => void;
  toggleSecurityModal: (open?: boolean) => void;
  togglePermissionsModal: (open?: boolean) => void;
  setSearchQuery: (query: string) => void;
  addLiveChunk: (chunk: TranscriptChunk) => void;
}

const STORAGE_KEY = 'ovsyanka_meetings_v1';

export const useAppStore = create<AppState>((set, get) => {
  // Load saved meetings or use defaults
  const saved = localStorage.getItem(STORAGE_KEY);
  const initialMeetings = saved ? JSON.parse(saved) : INITIAL_MEETINGS;

  return {
    activeView: 'home',
    selectedSpaceId: null,
    activeMeetingId: 'seo-infrastructure-sync',
    meetings: INITIAL_MEETINGS,
    spaces: INITIAL_SPACES,
    recipes: INITIAL_RECIPES,

    isRecording: false,
    isPaused: false,
    recordingDurationSeconds: 0,
    isTranscriptDrawerOpen: false,
    liveAudioLevels: { mic: 0, system: 0 },
    liveTranscript: [],

    isEnhancing: false,
    isWorkspaceMenuOpen: false,
    isIntegrationsModalOpen: false,
    isSecurityModalOpen: false,
    isPermissionsModalOpen: false,
    searchQuery: '',

    setActiveView: (view, spaceId) => {
      set({ activeView: view, selectedSpaceId: spaceId || null });
    },

    openMeeting: (meetingId) => {
      set({ activeMeetingId: meetingId, activeView: 'meeting' });
    },

    createNewMeeting: () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMeeting: Meeting = {
        id: `meeting-${Date.now()}`,
        title: `Quick Note ${now.toLocaleDateString()}`,
        spaceId: 'my-notes',
        ownerName: 'Me',
        createdAt: timeStr,
        durationSeconds: 0,
        participants: ['Me'],
        rawUserNotes: `# Meeting Notes\n- `,
        enhancedNotes: '',
        isEnhanced: false,
        transcript: [],
      };

      const updated = [newMeeting, ...get().meetings];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      set({
        meetings: updated,
        activeMeetingId: newMeeting.id,
        activeView: 'meeting',
      });

      return newMeeting.id;
    },

    updateMeetingNotes: (meetingId, notes) => {
      const updated = get().meetings.map((m) =>
        m.id === meetingId ? { ...m, rawUserNotes: notes } : m
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      set({ meetings: updated });
    },

    startRecording: async () => {
      let currentMeetingId = get().activeMeetingId;
      if (!currentMeetingId) {
        currentMeetingId = get().createNewMeeting();
      }

      set({
        isRecording: true,
        isPaused: false,
        recordingDurationSeconds: 0,
        isTranscriptDrawerOpen: true,
        liveTranscript: [],
      });

      // Start audio capture service
      await audioCaptureService.start(
        // On level update
        (levels) => set({ liveAudioLevels: levels }),
        // On new transcript chunk
        (chunk) => {
          get().addLiveChunk(chunk);
        }
      );
    },

    pauseRecording: () => {
      audioCaptureService.pause();
      set({ isPaused: true });
    },

    resumeRecording: () => {
      audioCaptureService.resume();
      set({ isPaused: false });
    },

    stopRecording: async () => {
      audioCaptureService.stop();
      const currentId = get().activeMeetingId;
      const transcript = get().liveTranscript;

      if (currentId && transcript.length > 0) {
        const updated = get().meetings.map((m) =>
          m.id === currentId
            ? { ...m, transcript: [...(m.transcript || []), ...transcript], durationSeconds: get().recordingDurationSeconds }
            : m
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        set({ meetings: updated });
      }

      set({
        isRecording: false,
        isPaused: false,
      });
    },

    toggleTranscriptDrawer: (open) => {
      set((state) => ({
        isTranscriptDrawerOpen: open !== undefined ? open : !state.isTranscriptDrawerOpen,
      }));
    },

    enhanceCurrentMeeting: async () => {
      const { activeMeetingId, meetings } = get();
      const meeting = meetings.find((m) => m.id === activeMeetingId);
      if (!meeting) return;

      set({ isEnhancing: true });

      try {
        const enhancedResult = await enhanceNotesWithTranscript(
          meeting.rawUserNotes,
          meeting.transcript && meeting.transcript.length > 0 ? meeting.transcript : INITIAL_MEETINGS[0].transcript
        );

        const updated = meetings.map((m) =>
          m.id === activeMeetingId
            ? { ...m, enhancedNotes: enhancedResult, isEnhanced: true }
            : m
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        set({ meetings: updated, isEnhancing: false });
      } catch (err) {
        console.error('Enhance failed:', err);
        set({ isEnhancing: false });
      }
    },

    toggleWorkspaceMenu: (open) => {
      set((state) => ({
        isWorkspaceMenuOpen: open !== undefined ? open : !state.isWorkspaceMenuOpen,
      }));
    },

    toggleIntegrationsModal: (open) => {
      set((state) => ({
        isIntegrationsModalOpen: open !== undefined ? open : !state.isIntegrationsModalOpen,
      }));
    },

    toggleSecurityModal: (open) => {
      set((state) => ({
        isSecurityModalOpen: open !== undefined ? open : !state.isSecurityModalOpen,
      }));
    },

    togglePermissionsModal: (open) => {
      set((state) => ({
        isPermissionsModalOpen: open !== undefined ? open : !state.isPermissionsModalOpen,
      }));
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    addLiveChunk: (chunk) => {
      set((state) => ({
        liveTranscript: [...state.liveTranscript, chunk],
      }));
    },
  };
});
