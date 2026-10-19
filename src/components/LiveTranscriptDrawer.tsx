import React, { useState, useEffect } from 'react';
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
  Square,
  Check,
  MoreHorizontal,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { audioCaptureService } from '../services/audioCaptureService';

export const LiveTranscriptDrawer: React.FC = () => {
  const {
    isRecording,
    isPaused,
    liveTranscript,
    pauseRecording,
    resumeRecording,
    startRecording,
    stopRecording,
    toggleTranscriptDrawer,
    togglePermissionsModal,
    activeMeetingId,
    meetings,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [devices, setDevices] = useState<{ deviceId: string; label: string }[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('AB13X USB Audio');
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>('Multi');
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    async function loadDevices() {
      const audioDevices = await audioCaptureService.getAudioInputDevices();
      setDevices(audioDevices);
      if (audioDevices.length > 0) {
        setSelectedDevice(audioDevices[0].label);
      }
    }
    loadDevices();
  }, []);

  const activeMeeting = meetings.find((m) => m.id === activeMeetingId);
  const transcriptToDisplay =
    liveTranscript.length > 0
      ? liveTranscript
      : activeMeeting?.transcript && activeMeeting.transcript.length > 0
      ? activeMeeting.transcript
      : [
          {
            id: 'c1',
            speaker: 'Sam Stephenson',
            channel: 1 as const,
            startMs: 6000,
            endMs: 12000,
            text: 'Granola combines audio transcript capture with your manual notes in real-time.',
          },
          {
            id: 'c2',
            speaker: 'You',
            channel: 0 as const,
            startMs: 13000,
            endMs: 18500,
            text: 'Got it. So I can write short scrappy notes while the app captures full context in the background.',
          },
          {
            id: 'c3',
            speaker: 'Sam Stephenson',
            channel: 1 as const,
            startMs: 19000,
            endMs: 25000,
            text: 'Yes! At the end of the meeting, the AI auto-synthesizes and produces enhanced notes.',
          },
          {
            id: 'c4',
            speaker: 'You',
            channel: 0 as const,
            startMs: 26000,
            endMs: 31000,
            text: 'And each statement gets matched with the exact timecode in the audio.',
          },
        ];

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
            className="p-1.5 hover:bg-black/5 rounded-md transition text-textSecondary hover:text-textPrimary"
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

      {/* Transcript Text Bubbles (Screenshots 2 & 3) */}
      <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs leading-relaxed text-textPrimary max-h-[300px]">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-2xl transition border ${
              item.speaker === 'You' || item.channel === 0
                ? 'bg-neutral-50/80 border-borderMuted'
                : 'bg-emerald-50/40 border-emerald-100/70'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-textSecondary">
              <span className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.speaker === 'You' || item.channel === 0
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="text-textPrimary font-semibold">{item.speaker}</span>
              </span>
              <span className="font-mono text-[11px] text-textSecondary/70 font-normal">
                {formatMs(item.startMs)}
              </span>
            </div>
            <p className="text-textPrimary text-xs leading-relaxed font-normal">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Bottom Floating Control Bar (Screenshots 2 & 3) */}
      <div className="px-4 py-3 border-t border-borderMuted flex items-center justify-between bg-white relative">
        {/* Dancing Green Bars + Pause / Stop */}
        <div className="flex items-center space-x-3">
          {/* Left waveform bars */}
          <div className="flex items-center space-x-0.5 h-4 px-1 cursor-pointer">
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
            <ChevronDown size={12} className="text-textSecondary ml-1" />
          </div>

          {/* Action: Stop square or Pause button */}
          {isRecording ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={stopRecording}
                className="w-5 h-5 rounded bg-neutral-600 hover:bg-neutral-800 text-white flex items-center justify-center transition"
                title="Stop recording"
              >
                <Square size={10} fill="currentColor" />
              </button>

              {isPaused ? (
                <button
                  onClick={resumeRecording}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
                >
                  <Pause size={12} fill="currentColor" />
                  <span>Pause</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={startRecording}
              className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
            >
              <Play size={12} fill="currentColor" />
              <span>Record</span>
            </button>
          )}
        </div>

        {/* Center: Audio Device Selector (Screenshot 3: AB13X USB Audio v) */}
        <div className="relative">
          <button
            onClick={() => setShowDeviceMenu(!showDeviceMenu)}
            className="flex items-center space-x-1 text-xs text-textPrimary hover:text-black font-medium px-2.5 py-1 rounded-lg hover:bg-neutral-100 transition"
          >
            <span className="truncate max-w-[160px]">{selectedDevice}</span>
            <ChevronDown size={13} className="text-textSecondary shrink-0" />
          </button>

          {showDeviceMenu && (
            <div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-56 bg-white border border-borderMuted rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 text-xs">
              <div className="px-2 py-1 text-[10px] font-semibold text-textSecondary uppercase">
                Аудиовход микрофона
              </div>
              {devices.map((d) => (
                <button
                  key={d.deviceId}
                  onClick={() => {
                    setSelectedDevice(d.label);
                    audioCaptureService.switchAudioDevice(d.deviceId);
                    setShowDeviceMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-neutral-100 rounded-lg flex items-center justify-between text-textPrimary"
                >
                  <span className="truncate">{d.label}</span>
                  {selectedDevice === d.label && <Check size={13} className="text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Settings & Language */}
        <div className="flex items-center space-x-3 relative">
          <button
            onClick={() => togglePermissionsModal(true)}
            className="text-textSecondary hover:text-textPrimary transition p-1 hover:bg-neutral-100 rounded-lg"
            title="Audio & Permission Settings"
          >
            <Sliders size={14} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-1 text-xs text-textSecondary hover:text-textPrimary transition px-1.5 py-1 hover:bg-neutral-100 rounded-lg"
            >
              <Languages size={14} />
              <span>{currentLang}</span>
              <ChevronDown size={12} />
            </button>

            {showLangMenu && (
              <div className="absolute bottom-9 right-0 w-36 bg-white border border-borderMuted rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 text-xs">
                {[
                  { id: 'Multi', label: 'Multi (RU / EN)', code: 'ru-RU' },
                  { id: 'RU', label: 'Русский', code: 'ru-RU' },
                  { id: 'EN', label: 'English', code: 'en-US' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setCurrentLang(l.id);
                      audioCaptureService.setLanguage(l.code);
                      setShowLangMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-100 rounded-lg flex items-center justify-between text-textPrimary"
                  >
                    <span>{l.label}</span>
                    {currentLang === l.id && <Check size={13} className="text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
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
