import React, { useState } from 'react';
import { Sparkles, CheckSquare, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const HomeOmnibar: React.FC = () => {
  const [query, setQuery] = useState('');
  const { setActiveView } = useAppStore();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      setActiveView('chat');
    }
  };

  return (
    <div className="fixed bottom-8 left-64 right-0 flex justify-center pointer-events-none z-20 px-8">
      <div className="w-full max-w-2xl bg-white border border-borderMuted shadow-lg rounded-2xl p-2 flex items-center justify-between pointer-events-auto transition hover:shadow-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything"
          className="flex-1 bg-transparent px-3 text-sm text-textPrimary placeholder:text-textSecondary/60 focus:outline-none"
        />

        <button
          onClick={() => setActiveView('chat')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-textPrimary rounded-xl text-xs font-medium transition shrink-0"
        >
          <CheckSquare size={13} className="text-textSecondary" />
          <span>List recent todos</span>
        </button>
      </div>
    </div>
  );
};
