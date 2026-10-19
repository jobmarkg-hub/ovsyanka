import React from 'react';
import {
  Home,
  Users,
  MessageSquare,
  Lock,
  Folder as FolderIcon,
  Search,
  PanelLeftClose,
  ChevronDown,
  Plus,
  Settings,
  HelpCircle,
  Smartphone,
  Sliders,
  Check,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    selectedSpaceId,
    spaces,
    setActiveView,
    isWorkspaceMenuOpen,
    toggleWorkspaceMenu,
    toggleSecurityModal,
  } = useAppStore();

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-borderMuted flex flex-col justify-between select-none shrink-0 relative">
      {/* Top Header Icons */}
      <div className="pt-3 px-3">
        <div className="flex items-center space-x-2 text-textSecondary mb-4">
          <button className="p-1 hover:bg-black/5 rounded text-gray-500 hover:text-textPrimary transition">
            <PanelLeftClose size={18} />
          </button>
          <button className="p-1 hover:bg-black/5 rounded text-gray-500 hover:text-textPrimary transition">
            <Search size={18} />
          </button>
        </div>

        {/* Primary Nav */}
        <nav className="space-y-0.5">
          <button
            onClick={() => setActiveView('home')}
            className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition ${
              activeView === 'home'
                ? 'bg-black/5 text-textPrimary font-semibold'
                : 'text-textSecondary hover:bg-black/5 hover:text-textPrimary'
            }`}
          >
            <Home size={16} />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveView('space', 'shared')}
            className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition ${
              activeView === 'space' && selectedSpaceId === 'shared'
                ? 'bg-black/5 text-textPrimary font-semibold'
                : 'text-textSecondary hover:bg-black/5 hover:text-textPrimary'
            }`}
          >
            <Users size={16} />
            <span>Shared with me</span>
          </button>

          <button
            onClick={() => setActiveView('chat')}
            className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition ${
              activeView === 'chat'
                ? 'bg-black/5 text-textPrimary font-semibold'
                : 'text-textSecondary hover:bg-black/5 hover:text-textPrimary'
            }`}
          >
            <MessageSquare size={16} />
            <span>Chat</span>
          </button>
        </nav>

        {/* Spaces Section */}
        <div className="mt-6">
          <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider px-2.5 mb-2">
            Spaces
          </div>

          <div className="space-y-0.5">
            {spaces.map((space) => {
              const isSelected =
                (space.id === 'my-notes' && activeView === 'my-notes') ||
                (activeView === 'space' && selectedSpaceId === space.id);

              return (
                <button
                  key={space.id}
                  onClick={() => {
                    if (space.id === 'my-notes') {
                      setActiveView('my-notes');
                    } else {
                      setActiveView('space', space.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition ${
                    isSelected
                      ? 'bg-black/5 text-textPrimary font-semibold'
                      : 'text-textSecondary hover:bg-black/5 hover:text-textPrimary'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {space.isPrivate ? (
                      <Lock size={15} className="text-textSecondary" />
                    ) : space.name.includes('HQ') ? (
                      <span className="w-4 h-4 rounded bg-pink-100 text-pink-600 text-[10px] font-bold flex items-center justify-center">
                        M
                      </span>
                    ) : (
                      <FolderIcon size={15} className="text-textSecondary" />
                    )}
                    <span className="truncate">{space.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workspace Menu Popover (When opened) */}
      {isWorkspaceMenuOpen && (
        <div className="absolute bottom-14 left-3 w-64 bg-white rounded-xl shadow-2xl border border-borderMuted p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center space-x-2.5 p-2 border-b border-borderMuted">
            <div className="w-7 h-7 rounded bg-pink-100 text-pink-600 font-bold flex items-center justify-center text-xs">
              M
            </div>
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-textPrimary">Malcom's workspace</div>
              <div className="text-[11px] text-textSecondary">1 member</div>
            </div>
          </div>

          <div className="py-2 border-b border-borderMuted">
            <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-textSecondary hover:bg-black/5 rounded-lg">
              <Users size={14} />
              <span>Invite teammates</span>
            </button>
          </div>

          <div className="py-2 border-b border-borderMuted text-xs">
            <div className="px-2 py-1 text-[11px] text-textSecondary truncate">southwell855@gmail.com</div>
            <div className="flex items-center justify-between px-2 py-1.5 bg-black/5 rounded-lg font-medium">
              <div className="flex items-center space-x-2">
                <span className="text-pink-600 font-bold">M</span>
                <span>Malcom's workspace</span>
              </div>
              <Check size={14} className="text-textPrimary" />
            </div>
            <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-textSecondary hover:bg-black/5 rounded-lg mt-1">
              <Plus size={14} />
              <span>Add workspace</span>
            </button>
          </div>

          <div className="pt-2 space-y-0.5 text-xs">
            <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-textSecondary hover:bg-black/5 rounded-lg">
              <Sliders size={14} />
              <span>Manage templates</span>
            </button>
            <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-textSecondary hover:bg-black/5 rounded-lg">
              <Smartphone size={14} />
              <span>Get Ovsyanka for Mobile</span>
            </button>
            <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-textSecondary hover:bg-black/5 rounded-lg">
              <HelpCircle size={14} />
              <span>Help center</span>
            </button>
            <button
              onClick={() => {
                toggleWorkspaceMenu(false);
                toggleSecurityModal(true);
              }}
              className="w-full flex items-center space-x-2 px-2 py-1.5 text-textSecondary hover:bg-black/5 rounded-lg"
            >
              <Settings size={14} />
              <span>Settings (Безопасность & NDA)</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Workspace Selector */}
      <div className="p-3 border-t border-borderMuted">
        <button
          onClick={() => toggleWorkspaceMenu()}
          className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-black/5 transition text-left"
        >
          <div className="flex items-center space-x-2 truncate">
            <div className="w-5 h-5 rounded bg-pink-100 text-pink-600 font-bold flex items-center justify-center text-[10px]">
              M
            </div>
            <span className="text-xs font-medium text-textPrimary truncate">
              Malcom's workspace
            </span>
          </div>
          <ChevronDown size={14} className="text-textSecondary shrink-0" />
        </button>
      </div>
    </aside>
  );
};
