import React, { useState } from 'react';
import { ZoomIn, Sparkles } from 'lucide-react';
import { TranscriptSummaryPopover, TranscriptSummaryData } from './TranscriptSummaryPopover';
import { PROOF_DATA_BY_BULLET } from '../data/mockData';

interface InteractiveNotesDocProps {
  content: string;
  isEnhanced: boolean;
  onTimecodeClick?: (startMs: number, quote: string, speaker: string) => void;
}

export const InteractiveNotesDoc: React.FC<InteractiveNotesDocProps> = ({
  content,
  isEnhanced,
  onTimecodeClick,
}) => {
  const [activePopover, setActivePopover] = useState<{
    lineIdx: number;
    data: TranscriptSummaryData;
  } | null>(null);

  const lines = content.split('\n');

  const getProofForLine = (line: string): TranscriptSummaryData => {
    const lower = line.toLowerCase();
    if (lower.includes('seo') || lower.includes('альберт') || lower.includes('домен')) {
      return PROOF_DATA_BY_BULLET['seo-bot'];
    }
    if (lower.includes('discord') || lower.includes('звонк')) {
      return PROOF_DATA_BY_BULLET['discord-bot'];
    }

    // Default synthesized proof for other bullets
    return {
      summary: `Пункт сформирован на основе обсуждения договоренностей команды. Участники согласовали распределение ответственности и сроки исполнения.`,
      quotes: [
        {
          speaker: 'Someone else',
          timestamp: '04:12',
          startMs: 252000,
          text: `Давайте зафиксируем эту задачу в списке следующих шагов и вернемся к ней на следующем синк-созвоне.`
        }
      ],
      conclusion: 'Договоренность внесена в протокол встречи без возражений.'
    };
  };

  return (
    <div className="space-y-1 font-sans text-sm text-textPrimary leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('# ')) {
          return (
            <h1
              key={idx}
              className="text-2xl font-serif font-normal text-textPrimary mt-7 mb-3"
            >
              {trimmed.replace('# ', '')}
            </h1>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className="text-xl font-serif font-normal text-textPrimary mt-5 mb-2"
            >
              {trimmed.replace('## ', '')}
            </h2>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="text-base font-semibold text-textPrimary mt-4 mb-2"
            >
              {trimmed.replace('### ', '')}
            </h3>
          );
        }

        if (trimmed.length === 0) {
          return <div key={idx} className="h-2" />;
        }

        // Bullet or Indented Line
        const isSubBullet = line.startsWith('  ') || line.startsWith('\t') || trimmed.startsWith('◦');
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');

        const proofData = getProofForLine(trimmed);
        const isOpen = activePopover?.lineIdx === idx;

        return (
          <div
            key={idx}
            className={`group relative flex items-start justify-between rounded-lg px-2 py-1 transition-colors duration-150 ${
              isSubBullet ? 'ml-5 text-textSecondary' : ''
            } hover:bg-[#F0EFEA]`}
          >
            {/* Text Content */}
            <div className="flex-1 pr-4">
              <span className={isBullet && !isSubBullet ? 'font-medium text-textPrimary' : ''}>
                {trimmed}
              </span>
            </div>

            {/* Inspect Source Icon Button (🔍+) */}
            <div className="relative shrink-0 flex items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopover(isOpen ? null : { lineIdx: idx, data: proofData });
                }}
                className={`opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 text-textSecondary hover:text-textPrimary rounded-md hover:bg-black/5 ${
                  isOpen ? 'opacity-100 bg-black/10 text-textPrimary' : ''
                }`}
                title="Inspect source / Transcript summary"
              >
                <ZoomIn size={14} className="stroke-[1.8]" />
              </button>

              {/* Floating Transcript Summary Popover */}
              {isOpen && (
                <div className="absolute right-0 top-7 z-50">
                  <TranscriptSummaryPopover
                    data={activePopover.data}
                    isLoading={false}
                    onClose={() => setActivePopover(null)}
                    onPlayTimestamp={(startMs, quote, speaker) => {
                      if (onTimecodeClick) {
                        onTimecodeClick(startMs, quote, speaker);
                      }
                      setActivePopover(null);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
