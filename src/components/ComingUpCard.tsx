import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Sparkles, X, CheckCircle2, Video } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export const ComingUpCard: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [briefing, setBriefing] = useState<any>(null);
  const [showBriefingModal, setShowBriefingModal] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      const data = await apiClient.getCalendarEvents();
      if (data && data.length > 0) {
        setEvents(data);
      }
    }
    loadEvents();
  }, []);

  const handleOpenBriefing = async (eventId: string) => {
    const data = await apiClient.getPreMeetingBriefing(eventId);
    if (data) {
      setBriefing(data);
      setShowBriefingModal(true);
    }
  };

  const nextEvent = events.length > 0 ? events[0] : null;

  return (
    <div className="mb-10">
      <h1 className="text-3xl font-serif font-normal text-textPrimary mb-5">
        Coming up
      </h1>

      <div className="bg-card border border-borderMuted rounded-2xl p-6 shadow-sm flex items-stretch">
        {/* Left Date Column */}
        <div className="w-48 pr-6 border-r border-borderMuted flex flex-col justify-start">
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-light text-textPrimary tracking-tight">19</span>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-semibold text-textPrimary">October</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              </div>
              <div className="text-[11px] text-textSecondary uppercase font-medium">Mon</div>
            </div>
          </div>
        </div>

        {/* Right Calendar Integration Box */}
        {nextEvent ? (
          <div className="flex-1 pl-6 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs text-textSecondary mb-1">
                  <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    {nextEvent.start_time} - {nextEvent.end_time}
                  </span>
                  <span>·</span>
                  <span>{nextEvent.source}</span>
                </div>
                <h3 className="text-sm font-semibold text-textPrimary mb-1">
                  {nextEvent.title}
                </h3>
                <div className="text-xs text-textSecondary">
                  {nextEvent.participants.join(', ')}
                </div>
              </div>

              {nextEvent.conference_link && (
                <a
                  href={nextEvent.conference_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-black transition shrink-0 ml-4 shadow-sm"
                >
                  <Video size={13} />
                  <span>Join Call</span>
                </a>
              )}
            </div>

            {/* Pre-Meeting Intelligence Badge */}
            <div className="mt-4 pt-3 border-t border-borderMuted/60 flex items-center justify-between">
              <button
                onClick={() => handleOpenBriefing(nextEvent.id)}
                className="flex items-center space-x-2 text-xs text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/60 px-3 py-1.5 rounded-xl font-medium transition"
              >
                <Sparkles size={13} className="text-indigo-600 animate-pulse" />
                <span>Pre-Meeting Intelligence (Подготовка брифа)</span>
              </button>

              <button className="text-[11px] font-medium text-textSecondary hover:text-textPrimary transition">
                Calendar settings
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 pl-6 flex flex-col items-center justify-center py-4 border border-dashed border-borderMuted/80 rounded-xl bg-background/50 text-center">
            <CalendarIcon className="text-textSecondary/60 mb-2 stroke-[1.5]" size={24} />
            <div className="text-xs font-semibold text-textPrimary">No upcoming events</div>
            <div className="text-[11px] text-textSecondary mb-3">Check your visible calendars</div>
            <button className="text-[11px] font-medium text-textPrimary px-3 py-1 bg-white hover:bg-neutral-50 border border-borderMuted rounded-full shadow-2xs transition">
              Calendar settings
            </button>
          </div>
        )}
      </div>

      {/* Pre-Meeting Briefing Modal (ТЗ 3.1) */}
      {showBriefingModal && briefing && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-borderMuted p-6 max-w-lg w-full animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-borderMuted mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h3 className="text-sm font-semibold text-textPrimary">
                  Pre-Meeting Briefing: {briefing.event_title}
                </h3>
              </div>
              <button
                onClick={() => setShowBriefingModal(false)}
                className="text-textSecondary hover:text-textPrimary p-1"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-textPrimary bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 leading-relaxed mb-4">
              {briefing.briefing_summary}
            </p>

            <div className="mb-4">
              <div className="text-xs font-semibold text-textSecondary mb-2">
                Предыдущие взаимные коммитменты и договоренности:
              </div>
              <div className="space-y-1.5">
                {briefing.previous_commitments.map((item: string, i: number) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-textPrimary">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-borderMuted">
              <button
                onClick={() => setShowBriefingModal(false)}
                className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-black transition"
              >
                Готово к созвону
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
