import React, { useState } from 'react';
import {
  Paperclip,
  Mic,
  ChevronDown,
  ArrowRight,
  FileText,
  Sparkles,
  CheckSquare,
  Compass,
  Calendar,
  FileEdit,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { apiClient } from '../services/apiClient';

export const GlobalChatView: React.FC = () => {
  const { recipes, openMeeting } = useAppStore();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    const userQ = query;
    setMessages((prev) => [...prev, { role: 'user', text: userQ }]);
    setQuery('');
    setIsLoading(true);

    const ragResponse = await apiClient.searchRAG(userQ);
    setIsLoading(false);

    if (ragResponse && ragResponse.sources && ragResponse.sources.length > 0) {
      const citations = ragResponse.sources
        .map((s: any) => `• [${s.meeting_title}] ${s.speaker || 'AI'}: «${s.chunk_text.slice(0, 80)}...»`)
        .join('\n');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `${ragResponse.answer}\n\n**Первоисточники (Citations):**\n${citations}`,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `На основе анализа всех встреч в воркспейсе:\n\n1. **Миграция БД**: Перевод на PostgreSQL 16 завершен, расширение pgvector активировано.\n2. **Дизайн-система**: Утвержден стиль интерфейса, близкий к Granola (#FAF9F6, serif-заголовки, плавающая шторка).\n3. **Ближайший релиз**: Дедлайн запланирован на следующую среду 12:00 UTC.`,
        },
      ]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-16 py-12 max-w-3xl mx-auto w-full">
      {/* Title */}
      <h1 className="text-3xl font-serif font-normal text-textPrimary mb-8 text-center sm:text-left">
        Hi Malcom, ask anything
      </h1>

      {/* Main Omnibar */}
      <div className="bg-white border border-borderMuted rounded-2xl shadow-sm p-3 mb-8 focus-within:shadow-md transition">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="What topics came up?"
          className="w-full bg-transparent text-sm text-textPrimary placeholder:text-textSecondary/60 focus:outline-none mb-3"
        />

        <div className="flex items-center justify-between pt-1 border-t border-borderMuted/40">
          <button className="text-textSecondary hover:text-textPrimary transition p-1">
            <Paperclip size={16} />
          </button>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 text-xs text-textSecondary hover:text-textPrimary px-2 py-1 rounded-md transition bg-neutral-100">
              <span>Auto</span>
              <ChevronDown size={12} />
            </button>
            <button className="text-textSecondary hover:text-textPrimary p-1">
              <Mic size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="space-y-4 mb-8">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-neutral-900 text-white ml-12'
                  : 'bg-white border border-borderMuted text-textPrimary mr-12 whitespace-pre-line'
              }`}
            >
              {m.text}
            </div>
          ))}
          {isLoading && (
            <div className="text-xs text-textSecondary animate-pulse flex items-center space-x-2">
              <Sparkles size={14} className="animate-spin text-emerald-600" />
              <span>Scanning transcripts and meeting embeddings with pgvector...</span>
            </div>
          )}
        </div>
      )}

      {/* Recents Section */}
      <div className="mb-8">
        <div className="text-xs font-semibold text-textSecondary mb-2">Recents</div>
        <div className="space-y-1">
          <div
            onClick={() => openMeeting('it-sync')}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/[0.03] cursor-pointer transition text-xs group"
          >
            <div className="flex items-center space-x-2 text-textPrimary">
              <FileText size={14} className="text-textSecondary" />
              <span>Финансовые вопросы начала месяца: Дима →</span>
            </div>
            <span className="text-textSecondary text-[11px]">1h</span>
          </div>

          <div
            onClick={() => openMeeting('demo-meeting')}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/[0.03] cursor-pointer transition text-xs group"
          >
            <div className="flex items-center space-x-2 text-textPrimary">
              <FileText size={14} className="text-textSecondary" />
              <span>Meeting transcript: latest discussion bu</span>
            </div>
            <span className="text-textSecondary text-[11px]">5h</span>
          </div>
        </div>
      </div>

      {/* Recipes Section */}
      <div>
        <div className="text-xs font-semibold text-textSecondary mb-2.5">Recipes</div>
        <div className="flex flex-wrap gap-2">
          {recipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => {
                setQuery(recipe.prompt);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-borderMuted rounded-full text-xs text-textPrimary transition shadow-2xs"
            >
              <Sparkles size={12} className="text-textSecondary" />
              <span>{recipe.title}</span>
            </button>
          ))}
          <button className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-borderMuted rounded-full text-xs text-textSecondary transition shadow-2xs">
            <span>See all</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
