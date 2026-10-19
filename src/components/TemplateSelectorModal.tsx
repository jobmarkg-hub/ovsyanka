import React from 'react';
import {
  Briefcase,
  Cpu,
  UserCheck,
  CheckSquare,
  Sparkles,
  Plus,
  X,
  Check,
} from 'lucide-react';

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    description: 'Контекст, ключевые договоренности, развилки решений, блокеры.',
    icon: 'Briefcase',
  },
  {
    id: 'engineering-sync',
    title: 'Engineering Sync',
    description: 'Статус сервисов, технический долг, архитектурные изменения, ревью задач.',
    icon: 'Cpu',
  },
  {
    id: 'one-on-one',
    title: '1-on-1 Framework',
    description: 'Эмоциональное состояние, успехи, сложности, взаимные коммитменты (Lead ↔ Report).',
    icon: 'UserCheck',
  },
  {
    id: 'action-items',
    title: 'Action Items Extraction',
    description: 'Таблица: Задача | Ответственный | Срок | Критерий готовности.',
    icon: 'CheckSquare',
  },
];

interface TemplateSelectorModalProps {
  currentTemplateId: string;
  onSelect: (templateId: string) => void;
  onOpenPromptBuilder: () => void;
  onClose: () => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  currentTemplateId,
  onSelect,
  onOpenPromptBuilder,
  onClose,
}) => {
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase size={16} className="text-blue-600" />;
      case 'Cpu':
        return <Cpu size={16} className="text-purple-600" />;
      case 'UserCheck':
        return <UserCheck size={16} className="text-emerald-600" />;
      case 'CheckSquare':
        return <CheckSquare size={16} className="text-amber-600" />;
      default:
        return <Sparkles size={16} className="text-pink-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-borderMuted p-6 max-w-lg w-full animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-borderMuted mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-textPrimary">
              Выберите шаблон саммари (Recipes)
            </h3>
          </div>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary p-1">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {TEMPLATES.map((tmpl) => {
            const isSelected = tmpl.id === currentTemplateId;
            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  onSelect(tmpl.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                  isSelected
                    ? 'bg-neutral-50 border-neutral-900 shadow-2xs'
                    : 'border-borderMuted hover:border-neutral-400 hover:bg-neutral-50/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-neutral-100 shrink-0 mt-0.5">
                    {renderIcon(tmpl.icon)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-textPrimary mb-0.5">
                      {tmpl.title}
                    </div>
                    <div className="text-[11px] text-textSecondary leading-normal">
                      {tmpl.description}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Check size={16} className="text-textPrimary shrink-0 mt-1 ml-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Prompt Builder Link */}
        <div className="pt-2 border-t border-borderMuted flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenPromptBuilder();
            }}
            className="flex items-center space-x-1.5 text-xs text-textPrimary hover:text-black font-medium transition"
          >
            <Plus size={14} />
            <span>Конструктор пользовательских шаблонов (Prompt Builder)</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-textPrimary rounded-lg text-xs font-medium transition"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
