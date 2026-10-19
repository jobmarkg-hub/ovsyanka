import React, { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';

export interface TranscriptQuote {
  speaker: string;
  timestamp: string;
  startMs: number;
  text: string;
}

export interface TranscriptSummaryData {
  summary: string;
  quotes: TranscriptQuote[];
  conclusion?: string;
}

interface TranscriptSummaryPopoverProps {
  data: TranscriptSummaryData;
  isLoading?: boolean;
  onClose: () => void;
  onPlayTimestamp?: (startMs: number, quote: string, speaker: string) => void;
}

export const TranscriptSummaryPopover: React.FC<TranscriptSummaryPopoverProps> = ({
  data,
  isLoading = false,
  onClose,
  onPlayTimestamp,
}) => {
  const [internalLoading, setInternalLoading] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setInternalLoading(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-[380px] bg-white border border-borderMuted rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left select-text max-h-[500px] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">
          Transcript Summary
        </span>
        <button
          onClick={onClose}
          className="text-textSecondary/60 hover:text-textPrimary p-0.5 rounded transition"
        >
          <X size={13} />
        </button>
      </div>

      {internalLoading ? (
        /* Skeleton Loading State (Screenshot 2) */
        <div className="space-y-2 py-2 animate-pulse">
          <div className="h-3 bg-neutral-200/70 rounded-full w-full" />
          <div className="h-3 bg-neutral-200/70 rounded-full w-5/6" />
          <div className="h-3 bg-neutral-200/70 rounded-full w-4/6" />
          <div className="pt-3 space-y-2">
            <div className="h-10 bg-neutral-100 rounded-lg w-full" />
            <div className="h-10 bg-neutral-100 rounded-lg w-full" />
          </div>
        </div>
      ) : (
        /* Full Content State (Screenshots 1 & 3) */
        <div className="space-y-4 text-xs text-textPrimary leading-relaxed">
          {/* Summary Rationale */}
          <p className="font-normal text-textPrimary/90">
            {data.summary}
          </p>

          {/* Direct Verbatim Quotes */}
          <div className="space-y-3 pt-1">
            {data.quotes.map((quote, idx) => (
              <div
                key={idx}
                className="pl-3 border-l-2 border-emerald-500/80 space-y-1.5 py-0.5"
              >
                <p className="text-textPrimary/85 italic leading-normal">
                  «{quote.text}»
                </p>
                <div className="flex items-center space-x-1.5 text-[11px] text-textSecondary font-medium">
                  <span>{quote.speaker}</span>
                  <span>·</span>
                  <button
                    onClick={() =>
                      onPlayTimestamp &&
                      onPlayTimestamp(quote.startMs, quote.text, quote.speaker)
                    }
                    className="font-mono text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center space-x-1"
                    title="Play audio from this timestamp"
                  >
                    <Play size={10} fill="currentColor" />
                    <span>{quote.timestamp}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Optional Conclusion */}
          {data.conclusion && (
            <p className="pt-2 border-t border-borderMuted/60 text-textSecondary/90 text-[11px] leading-relaxed">
              {data.conclusion}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
