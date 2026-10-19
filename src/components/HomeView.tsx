import React from 'react';
import { ComingUpCard } from './ComingUpCard';
import { MeetingListItem } from './MeetingListItem';
import { HomeOmnibar } from './HomeOmnibar';
import { useAppStore } from '../store/useAppStore';

export const HomeView: React.FC = () => {
  const { meetings } = useAppStore();

  return (
    <div className="flex-1 overflow-y-auto px-16 py-8 pb-32 max-w-4xl mx-auto w-full">
      <ComingUpCard />

      {/* Today Section */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2 px-1">
          Today
        </div>
        <div className="space-y-1">
          {meetings.map((meeting) => (
            <MeetingListItem key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </div>

      <HomeOmnibar />
    </div>
  );
};
