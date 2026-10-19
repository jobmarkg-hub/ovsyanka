import React, { useState } from 'react';
import {
  Lock,
  Folder as FolderIcon,
  X,
  Paperclip,
  Mic,
  ChevronDown,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { MeetingListItem } from './MeetingListItem';

export const MyNotesView: React.FC = () => {
  const { meetings, recipes } = useAppStore();
  const [showBanner, setShowBanner] = useState(true);
  const [search, setSearch] = useState('');

  return (
    <div className="flex-1 overflow-y-auto px-16 py-10 pb-32 max-w-4xl mx-auto w-full">
      {/* Centered Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-8 h-8 rounded-full bg-neutral-200/50 flex items-center justify-center text-textSecondary mb-3">
          <Lock size={15} />
        </div>
        <h1 className="text-3xl font-serif font-normal text-textPrimary tracking-tight mb-1">
          My notes
        </h1>
        <div className="text-xs text-textSecondary mb-2">
          Notes from all of your private folders.
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-textSecondary">
          <span className="flex items-center space-x-1">
            <Lock size={11} />
            <span>Your private notes and folders</span>
          </span>
          <span>·</span>
          <span className="flex items-center space-x-1">
            <FolderIcon size={11} />
            <span>4 folders</span>
          </span>
        </div>
      </div>

      {/* Blue Banner */}
      {showBanner && (
        <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 mb-8 flex items-start justify-between text-xs text-sky-900 animate-in fade-in">
          <div>
            <div className="font-semibold mb-0.5">Your private space</div>
            <div className="text-sky-800/80 leading-relaxed">
              Your notes live here by default. Nothing gets shared until you choose to share it.
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-sky-600 hover:text-sky-900 p-1 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Omnibar */}
      <div className="bg-white border border-borderMuted rounded-2xl shadow-sm p-3 mb-6 focus-within:shadow-md transition">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ask anything"
          className="w-full bg-transparent text-sm text-textPrimary placeholder:text-textSecondary/60 focus:outline-none mb-2"
        />

        <div className="flex items-center justify-end space-x-2 pt-1 border-t border-borderMuted/30">
          <button className="flex items-center space-x-1 text-xs text-textSecondary hover:text-textPrimary px-2 py-1 rounded-md transition bg-neutral-100">
            <span>Auto</span>
            <ChevronDown size={12} />
          </button>
          <button className="text-textSecondary hover:text-textPrimary p-1">
            <Paperclip size={15} />
          </button>
          <button className="text-textSecondary hover:text-textPrimary p-1">
            <Mic size={15} />
          </button>
        </div>
      </div>

      {/* Recipe Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-10 text-xs">
        {recipes.slice(0, 3).map((r) => (
          <button
            key={r.id}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-borderMuted rounded-full text-textSecondary hover:text-textPrimary transition shadow-2xs"
          >
            <Sparkles size={11} />
            <span>{r.title}</span>
          </button>
        ))}
        <button className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-borderMuted rounded-full text-textSecondary transition shadow-2xs">
          <span>All recipes</span>
        </button>
      </div>

      {/* Notes Tab */}
      <div className="border-t border-borderMuted pt-6">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-black/5 rounded-lg text-xs font-semibold text-textPrimary inline-flex mb-4">
          <FileText size={13} />
          <span>Notes</span>
        </div>

        <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2 px-1">
          Today
        </div>

        <div className="space-y-1">
          {meetings.map((meeting) => (
            <MeetingListItem key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </div>
    </div>
  );
};
