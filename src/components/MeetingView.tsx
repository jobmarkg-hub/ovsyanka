import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  FolderPlus,
  ChevronDown,
  Mail,
  Loader2,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TipTapEditor } from './TipTapEditor';
import { InteractiveNotesDoc } from './InteractiveNotesDoc';
import { LiveTranscriptDrawer } from './LiveTranscriptDrawer';
import { TemplateSelectorModal } from './TemplateSelectorModal';
import { PromptBuilderModal } from './PromptBuilderModal';
import { AudioPlayerBar } from './AudioPlayerBar';

export const MeetingView: React.FC = () => {
  const {
    activeMeetingId,
    meetings,
    updateMeetingNotes,
    enhanceCurrentMeeting,
    isEnhancing,
    isTranscriptDrawerOpen,
    toggleTranscriptDrawer,
    isRecording,
    startRecording,
    stopRecording,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'enhanced' | 'raw'>('enhanced');
  const [currentTemplateId, setCurrentTemplateId] = useState('executive-summary');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPromptBuilder, setShowPromptBuilder] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Audio Player Bar State for Source Zoom-In
  const [activeAudioProof, setActiveAudioProof] = useState<{
    open: boolean;
    startMs: number;
    durationMs: number;
    speaker: string;
    quote: string;
  } | null>(null);

  const meeting = meetings.find((m) => m.id === activeMeetingId);

  if (!meeting) {
    return (
      <div className="flex-1 flex items-center justify-center text-textSecondary text-sm">
        Select or create a note
      </div>
    );
  }

  const handleNotesChange = (text: string) => {
    if (viewMode === 'raw') {
      updateMeetingNotes(meeting.id, text);
    }
  };

  const handleTimecodeClick = (ms: number) => {
    setActiveAudioProof({
      open: true,
      startMs: ms || 14000,
      durationMs: (meeting.durationSeconds || 185) * 1000,
      speaker: 'Sam Stephenson',
      quote:
        'During the meeting you just type brief notes, and at meeting end it auto-detects and blends transcript content with anything typed in the notepad.',
    });
  };

  const handleSelectTemplate = (templateId: string) => {
    setCurrentTemplateId(templateId);

    // Dynamic re-synthesis according to selected template
    let newEnhanced = meeting.enhancedNotes;
    if (templateId === 'engineering-sync') {
      newEnhanced = `# Engineering Sync: ${meeting.title}\n\n### 🛠 Статус сервисов и релизов\n- База данных переведена на PostgreSQL 16 с расширением pgvector\n- Кластер Redis 7.2 работает в штатном режиме (задержка <2ms)\n\n### 🏛 Архитектурные изменения\n- Внедрена No-Bot модель аудиозахвата через ScreenCaptureKit и AVAudioEngine\n- Двухканальная буферизация 16kHz PCM (Ch0: User, Ch1: Remote)\n\n### ⚠️ Технический долг\n- Настроить локальный whisper.cpp для слабых машин и фоллбек на Groq/Deepgram`;
    } else if (templateId === 'action-items') {
      newEnhanced = `# Action Items: ${meeting.title}\n\n| Задача | Ответственный | Срок | Критерий готовности |\n| :--- | :--- | :--- | :--- |\n| Тестирование ScreenCaptureKit | DevOps / Me | Пятница | Звук системы пишется без KEXT |\n| Подключение pgvector RAG | Backend | Среда | Векторный поиск по встречам работает |\n| Согласование бюджета $10k | Lead | 25 окт | Подписана спецификация |\n\n### Исходные тезисы\n${meeting.rawUserNotes}`;
    } else if (templateId === 'one-on-one') {
      newEnhanced = `# 1-on-1 Framework: ${meeting.title}\n\n### 1. Эмоциональное состояние и мотивация\n- Высокая вовлеченность в проект Ovsyanka, спринт идет по плану\n\n### 2. Успехи за период\n- Развернут нативный UI Granola и backend PostgreSQL 16\n\n### 3. Взаимные коммитменты\n- [ ] Протестировать офлайн-режим Whisper\n- [ ] Подготовить релиз MVP`;
    }

    const updated = meetings.map((m) =>
      m.id === meeting.id ? { ...m, enhancedNotes: newEnhanced, isEnhanced: true } : m
    );
    localStorage.setItem('ovsyanka_meetings_v1', JSON.stringify(updated));
    useAppStore.setState({ meetings: updated });
    setViewMode('enhanced');
  };

  const activeContent =
    viewMode === 'enhanced' && meeting.isEnhanced && meeting.enhancedNotes
      ? meeting.enhancedNotes
      : meeting.rawUserNotes;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-56px)] overflow-hidden relative bg-background">
      {/* Scrollable Note Content */}
      <div className="flex-1 overflow-y-auto px-20 py-10 pb-44 max-w-4xl mx-auto w-full">
        {/* Title */}
        <h1 className="text-4xl font-serif font-normal text-textPrimary tracking-tight mb-4">
          {meeting.title}
        </h1>

        {/* Meta Chips Bar */}
        <div className="flex items-center space-x-2.5 mb-8 text-xs text-textSecondary flex-wrap gap-y-2">
          {/* Enhanced / Template selector chip */}
          <div className="relative inline-block">
            <button
              onClick={() => setShowTemplateModal(true)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition font-medium ${
                viewMode === 'enhanced' && meeting.isEnhanced
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs hover:bg-emerald-100'
                  : 'bg-white text-textPrimary border-borderMuted hover:bg-neutral-50'
              }`}
            >
              <Sparkles size={13} className={viewMode === 'enhanced' ? 'text-emerald-600' : ''} />
              <span className="capitalize">
                {viewMode === 'enhanced' && meeting.isEnhanced
                  ? currentTemplateId.replace('-', ' ')
                  : 'Raw Notes'}
              </span>
              <ChevronDown size={12} className="opacity-60" />
            </button>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-borderMuted rounded-lg">
            <Calendar size={13} className="text-textSecondary/70" />
            <span>Today</span>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-borderMuted rounded-lg">
            <Users size={13} className="text-textSecondary/70" />
            <span>{meeting.participants.length} participants</span>
          </div>

          <button className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-neutral-50 border border-borderMuted rounded-lg transition">
            <FolderPlus size={13} className="text-textSecondary/70" />
            <span>Add to folder</span>
          </button>

          {/* Enhance Trigger Button */}
          {!meeting.isEnhanced && (
            <button
              onClick={enhanceCurrentMeeting}
              disabled={isEnhancing}
              className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg shadow-sm transition ml-2"
            >
              {isEnhancing ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Enhancing notes...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Enhance with AI</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Document view (Interactive hover proofs in Enhanced mode, TipTap in raw mode) */}
        {viewMode === 'enhanced' ? (
          <InteractiveNotesDoc
            content={activeContent}
            isEnhanced={true}
            onTimecodeClick={(startMs, quote, speaker) => {
              setActiveAudioProof({
                open: true,
                startMs,
                durationMs: (meeting.durationSeconds || 420) * 1000,
                speaker,
                quote,
              });
            }}
          />
        ) : (
          <TipTapEditor
            content={activeContent}
            isEnhanced={false}
            onChange={handleNotesChange}
            onTimecodeClick={handleTimecodeClick}
          />
        )}

        {/* Divider and Transcript Link */}
        <div className="mt-12 pt-6 border-t border-borderMuted/70 text-xs text-textSecondary flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span>Chat with meeting transcript:</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toggleTranscriptDrawer(true);
              }}
              className="text-textPrimary underline underline-offset-2 flex items-center space-x-1 hover:text-black"
            >
              <span>https://notes.ovsyanka.ai/t/{meeting.id}</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Quick Record/Stop Indicator */}
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="text-xs px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md font-medium transition"
            >
              Stop recording
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="text-xs px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-textPrimary rounded-md font-medium transition"
            >
              + Record audio
            </button>
          )}
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center pointer-events-none z-30 px-8">
        <div className="w-full max-w-2xl bg-white border border-borderMuted shadow-xl rounded-2xl p-2 flex items-center justify-between pointer-events-auto transition hover:shadow-2xl">
          {/* Waveform Dancing Bars toggle button */}
          <button
            onClick={() => toggleTranscriptDrawer()}
            className="p-2 hover:bg-neutral-100 rounded-xl transition flex items-center space-x-1 text-emerald-600"
            title="Open Live Transcript"
          >
            <div className="flex items-center space-x-0.5 h-4">
              <span className={`w-0.5 rounded-full bg-emerald-500 ${isRecording ? 'animate-pulse h-3' : 'h-2'}`} />
              <span className={`w-0.5 rounded-full bg-emerald-500 ${isRecording ? 'animate-bounce h-4' : 'h-3'}`} />
              <span className={`w-0.5 rounded-full bg-emerald-500 ${isRecording ? 'animate-pulse h-2' : 'h-2'}`} />
            </div>
            <span className="text-[10px] text-textSecondary font-mono ml-0.5">^</span>
          </button>

          {/* Continue Chat Input */}
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Continue chat or type /jira-ticket"
            className="flex-1 bg-transparent px-3 text-xs text-textPrimary placeholder:text-textSecondary/60 focus:outline-none"
          />

          {/* Write follow up email action button */}
          <button
            onClick={() => {
              alert('Follow-up email draft generated based on meeting decisions.');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-textPrimary rounded-xl text-xs font-medium transition shrink-0"
          >
            <Mail size={13} className="text-textSecondary" />
            <span>Write follow up email</span>
          </button>
        </div>

        {/* Disclaimer */}
        <div className="text-[10px] text-textSecondary/60 mt-1.5">
          Ovsyanka uses AI and can make mistakes.
        </div>
      </div>

      {/* Live Transcript Drawer */}
      {isTranscriptDrawerOpen && <LiveTranscriptDrawer />}

      {/* Template Selector Modal */}
      {showTemplateModal && (
        <TemplateSelectorModal
          currentTemplateId={currentTemplateId}
          onSelect={handleSelectTemplate}
          onOpenPromptBuilder={() => setShowPromptBuilder(true)}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      {/* Prompt Builder Modal */}
      {showPromptBuilder && (
        <PromptBuilderModal
          onSave={({ title, prompt }) => {
            alert(`Шаблон «${title}» сохранен в пользовательские рецепты!`);
          }}
          onClose={() => setShowPromptBuilder(false)}
        />
      )}

      {/* Source Zoom-In Audio Scrubber Bar */}
      {activeAudioProof && activeAudioProof.open && (
        <AudioPlayerBar
          currentMs={activeAudioProof.startMs}
          durationMs={activeAudioProof.durationMs}
          speaker={activeAudioProof.speaker}
          quoteText={activeAudioProof.quote}
          onClose={() => setActiveAudioProof(null)}
          onSeek={(ms) => console.log('Audio seeked to:', ms)}
        />
      )}
    </div>
  );
};
