import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, X, Sparkles } from 'lucide-react';

interface AudioPlayerBarProps {
  currentMs: number;
  durationMs: number;
  speaker: string;
  quoteText: string;
  onClose: () => void;
  onSeek: (ms: number) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentMs,
  durationMs,
  speaker,
  quoteText,
  onClose,
  onSeek,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackTime, setPlaybackTime] = useState(currentMs);

  useEffect(() => {
    setPlaybackTime(currentMs);
    setIsPlaying(true);
  }, [currentMs]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= durationMs) {
            setIsPlaying(false);
            return durationMs;
          }
          return prev + 200;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, durationMs]);

  const progressPercent = Math.min(100, Math.max(0, (playbackTime / durationMs) * 100));

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xl bg-neutral-900 text-white rounded-2xl shadow-2xl p-4 z-50 border border-neutral-700 animate-in slide-in-from-bottom-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">Source Zoom-In Proof: {speaker}</span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white transition p-1"
        >
          <X size={14} />
        </button>
      </div>

      <p className="text-xs text-neutral-200 italic mb-3 line-clamp-2 bg-neutral-800/80 p-2 rounded-lg border border-neutral-700">
        «{quoteText}»
      </p>

      {/* Scrubber Track */}
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = clickX / rect.width;
          const newTime = Math.round(ratio * durationMs);
          setPlaybackTime(newTime);
          onSeek(newTime);
        }}
        className="h-1.5 w-full bg-neutral-700 rounded-full cursor-pointer relative overflow-hidden mb-3"
      >
        <div
          className="h-full bg-emerald-400 transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition font-bold"
          >
            {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
          </button>

          <button
            onClick={() => {
              setPlaybackTime(currentMs);
              setIsPlaying(true);
            }}
            className="text-neutral-400 hover:text-white transition"
            title="Replay snippet"
          >
            <RotateCcw size={14} />
          </button>

          <span className="font-mono text-[11px] text-neutral-400">
            {formatTime(playbackTime)} / {formatTime(durationMs)}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-neutral-400 text-[11px]">
          <Volume2 size={13} />
          <span>No-Bot Audio Stream</span>
        </div>
      </div>
    </div>
  );
};

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
