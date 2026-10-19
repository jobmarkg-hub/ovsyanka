import React from 'react';
import { UserPlus, Plus, ChevronLeft, Share2, MoreHorizontal, Lock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Header: React.FC = () => {
  const { activeView, setActiveView, createNewMeeting, toggleIntegrationsModal } = useAppStore();

  if (activeView === 'meeting') {
    return (
      <header className="h-14 px-8 flex items-center justify-between border-b border-borderMuted/40 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center space-x-1 text-xs text-textSecondary hover:text-textPrimary bg-black/5 hover:bg-black/10 px-2 py-1 rounded-md transition"
        >
          <ChevronLeft size={14} />
          <span>Home</span>
        </button>

        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-textSecondary hover:text-textPrimary hover:bg-black/5 rounded-md transition">
            <MoreHorizontal size={16} />
          </button>
          <button
            onClick={() => toggleIntegrationsModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 text-white hover:bg-black rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Lock size={12} />
            <span>Share</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="h-14 px-8 flex items-center justify-end space-x-3 bg-background">
      <button className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-textPrimary hover:bg-black/5 rounded-lg transition font-medium border border-borderMuted">
        <UserPlus size={14} className="text-textSecondary" />
        <span>Invite</span>
      </button>

      <button
        onClick={() => createNewMeeting()}
        className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs bg-neutral-900 text-white hover:bg-black rounded-lg transition font-medium shadow-sm"
      >
        <Plus size={14} />
        <span>New note</span>
      </button>
    </header>
  );
};
