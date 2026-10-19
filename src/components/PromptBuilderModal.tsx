import React, { useState } from 'react';
import { X, Sparkles, Plus, Code2, Check, Copy } from 'lucide-react';

interface PromptBuilderModalProps {
  onSave: (template: { title: string; prompt: string }) => void;
  onClose: () => void;
}

export const PromptBuilderModal: React.FC<PromptBuilderModalProps> = ({
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('My Custom Template');
  const [promptText, setPromptText] = useState(
    `# Итоги созвона: {{meeting_title}}\n**Участники:** {{participants}}\n\n### Главные тезисы\n{{user_notes}}\n\n### Выжимка из транскрипта\n{{transcript}}\n\n### Команда в Jira\n/jira-ticket`
  );

  const variables = [
    { label: '{{transcript}}', desc: 'Полный транскрипт встречи' },
    { label: '{{user_notes}}', desc: 'Ручные заметки пользователя' },
    { label: '{{participants}}', desc: 'Список участников встречи' },
    { label: '{{meeting_title}}', desc: 'Название созвона' },
    { label: '{{folder_context}}', desc: 'Контекст папки/спейса' },
  ];

  const handleInsertVariable = (variable: string) => {
    setPromptText((prev) => prev + `\n${variable}`);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-borderMuted p-6 max-w-xl w-full animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-borderMuted mb-4">
          <div className="flex items-center space-x-2">
            <Code2 size={16} className="text-purple-600" />
            <h3 className="text-sm font-semibold text-textPrimary">
              Конструктор шаблонов (Prompt Builder)
            </h3>
          </div>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary p-1">
            <X size={15} />
          </button>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-textSecondary mb-1">
            Название шаблона
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs p-2.5 bg-neutral-50 border border-borderMuted rounded-xl text-textPrimary focus:outline-none focus:border-neutral-900"
          />
        </div>

        {/* Variable Pills */}
        <div className="mb-3">
          <div className="text-[11px] font-semibold text-textSecondary mb-1.5">
            Переменные контекста (кликните для вставки):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((v) => (
              <button
                key={v.label}
                onClick={() => handleInsertVariable(v.label)}
                title={v.desc}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-mono transition flex items-center space-x-1"
              >
                <span>+</span>
                <span>{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Textarea */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-textSecondary mb-1">
            Тело шаблона (Markdown + переменные)
          </label>
          <textarea
            rows={8}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full text-xs font-mono p-3 bg-neutral-50 border border-borderMuted rounded-xl text-textPrimary focus:outline-none focus:border-neutral-900 leading-relaxed"
          />
          <div className="text-[11px] text-textSecondary mt-1">
            Поддерживаются слеш-команды: <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">/jira-ticket</code>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-borderMuted">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-textPrimary rounded-lg text-xs font-medium transition"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              onSave({ title, prompt: promptText });
              onClose();
            }}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            Сохранить шаблон
          </button>
        </div>
      </div>
    </div>
  );
};
