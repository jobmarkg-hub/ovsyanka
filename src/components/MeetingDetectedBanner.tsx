import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface MeetingDetectedBannerProps {
  appName?: string;
}

export const MeetingDetectedBanner: React.FC<MeetingDetectedBannerProps> = ({
  appName = 'Chrome',
}) => {
  const { startRecording, createNewMeeting, isRecording, togglePermissionsModal } = useAppStore();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || isRecording) return null;

  const handleTakeNotes = () => {
    const micGranted = localStorage.getItem('ovsyanka_mic_granted') === 'true';
    if (!micGranted) {
      togglePermissionsModal(true);
    }
    createNewMeeting();
    startRecording();
    setIsVisible(false);
  };

  return (
    <div className="fixed top-4 right-8 z-40 animate-in slide-in-from-top-3 duration-200">
      <div className="bg-white border border-borderMuted shadow-xl rounded-2xl p-1.5 pl-3.5 flex items-center space-x-3 transition hover:shadow-2xl">
        {/* Left Indicator and App Info */}
        <div className="flex items-center space-x-2.5">
          <div className="w-1 h-5 rounded-full bg-lime-500 animate-pulse" />
          <div>
            <div className="text-xs font-semibold text-textPrimary leading-tight">
              Meeting detected
            </div>
            <div className="text-[11px] text-textSecondary">{appName}</div>
          </div>
        </div>

        {/* Take Notes Action Button */}
        <div className="flex items-center space-x-0.5 border border-borderMuted/80 rounded-xl bg-white shadow-2xs overflow-hidden">
          <button
            onClick={handleTakeNotes}
            className="flex items-center space-x-2 px-3.5 py-1.5 hover:bg-neutral-50 transition text-xs font-medium text-textPrimary"
          >
            {/* Green Granola Swirl / Spiral icon */}
            <span className="w-5 h-5 rounded-lg bg-lime-100 text-lime-700 flex items-center justify-center font-bold text-xs">
              🌀
            </span>
            <span>Take notes</span>
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-1.5 py-1.5 hover:bg-neutral-100 text-textSecondary border-l border-borderMuted/80 transition"
            title="Dismiss"
          >
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
