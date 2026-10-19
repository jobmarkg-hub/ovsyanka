import React, { useState } from 'react';
import {
  Search,
  ThumbsDown,
  Copy,
  Minus,
  Sliders,
  Languages,
  ChevronDown,
  Play,
  Pause,
  Check,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const LiveTranscriptDrawer: React.FC = () => {
  const {
    isRecording,
    isPaused,
    liveTranscript,
    liveAudioLevels,
    pauseRecording,
    resumeRecording,
    startRecording,
    toggleTranscriptDrawer,
    activeMeetingId,
    meetings,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const activeMeeting = meetings.find((m) => m.id === activeMeetingId);
  const transcriptToDisplay =
    liveTranscript.length > 0
      ? liveTranscript
      : activeMeeting?.transcript || [];

  const handleCopy = () => {
    const text = transcriptToDisplay.map((t) => `${t.speaker}: ${t.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = transcriptToDisplay.filter(
    (item) =>
      item.text.toLowerCase().includes(search.toLowerCase()) ||
      item.speaker.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border border-borderMuted rounded-2xl shadow-2xl z-40 overflow-hidden flex flex-col max-h-[460px] animate-in slide-in-from-bottom-4 duration-150">
      {/* Top Header */}
      <div className="px-4 py-2.5 border-b border-borderMuted flex items-center justify-between bg-neutral-50/50">
        <div className="flex items-center space-x-2 flex-1 mr-4">
          <Search size={15} className="text-textSecondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transcript..."
            className="w-full bg-transparent text-xs text-textPrimary placeholder:text-textSecondary/60 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-1 text-textSecondary">
          <button className="p-1.5 hover:bg-black/5 rounded-md transition text-textSecondary hover:text-textPrimary">
            <ThumbsDown size={14} />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-black/5 rounded-md transition text-textSecondary hover:text-textPrimary relative"
            title="Copy transcript"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => toggleTranscriptDrawer(false)}
            className="p-1.5 hover:bg-black/5 rounded-md transition text-textSecondary hover:text-textPrimary"
          >
            <Minus size={14} />
          </button>
        </div>
      </div>

      {/* Transcript Text Scroll Area */}
      <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs leading-relaxed text-textPrimary max-h-[300px]">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-textSecondary/70 text-xs">
            {isRecording
              ? 'Listening for dual-channel audio (ScreenCaptureKit + Microphone)...'
              : 'No transcript recorded yet. Click Resume or Record to start.'}
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl transition ${
                item.channel === 0
                  ? 'bg-neutral-100/70 border border-neutral-200/50'
                  : 'bg-emerald-50/40 border border-emerald-100/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-textSecondary">
                <span className="flex items-center space-x-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.channel === 0 ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                  />
                  <span>{item.speaker}</span>
                </span>
                <span className="font-mono text-[10px] text-textSecondary/60">
                  {formatMs(item.startMs)}
                </span>
              </div>
              <p className="text-textPrimary leading-normal">{item.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="px-4 py-3 border-t border-borderMuted flex items-center justify-between bg-white">
        {/* Dancing Green Bars + Resume/Pause */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 h-5 px-1">
            <span
              className={`w-0.5 rounded-full bg-emerald-500 transition-all duration-75 ${
                isRecording && !isPaused ? 'animate-pulse h-4' : 'h-2 bg-neutral-300'
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-emerald-500 transition-all duration-75 ${
                isRecording && !isPaused ? 'animate-bounce h-5' : 'h-3 bg-neutral-300'
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-emerald-500 transition-all duration-75 ${
                isRecording && !isPaused ? 'animate-pulse h-3' : 'h-2 bg-neutral-300'
              }`}
            />
            <ChevronDown size={12} className="text-textSecondary ml-0.5" />
          </div>

          {isRecording ? (
            isPaused ? (
              <button
                onClick={resumeRecording}
                className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
              >
                <Play size={13} fill="currentColor" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="flex items-center space-x-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
              >
                <Pause size={13} fill="currentColor" />
                <span>Pause</span>
              </button>
            )
          ) : (
            <button
              onClick={startRecording}
              className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
            >
              <Play size={13} fill="currentColor" />
              <span>Record</span>
            </button>
          )}
        </div>

        {/* Right Settings & Language */}
        <div className="flex items-center space-x-3">
          <button
            className="text-textSecondary hover:text-textPrimary transition"
            title="Audio Source Settings (ScreenCaptureKit / WASAPI)"
          >
            <Sliders size={14} />
          </button>

          <button className="flex items-center space-x-1 text-xs text-textSecondary hover:text-textPrimary transition">
            <Languages size={14} />
            <span>Multi</span>
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
