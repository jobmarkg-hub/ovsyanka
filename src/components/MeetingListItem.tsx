import React from 'react';
import { FileText, Folder as FolderIcon } from 'lucide-react';
import { Meeting } from '../types';
import { useAppStore } from '../store/useAppStore';

interface MeetingListItemProps {
  meeting: Meeting;
}

export const MeetingListItem: React.FC<MeetingListItemProps> = ({ meeting }) => {
  const { openMeeting } = useAppStore();

  const isDemo = meeting.id === 'demo-meeting';

  return (
    <div
      onClick={() => openMeeting(meeting.id)}
      className="group flex items-center justify-between p-3 rounded-xl hover:bg-black/[0.03] cursor-pointer transition border border-transparent hover:border-borderMuted/60"
    >
      <div className="flex items-center space-x-3.5 truncate">
        {/* Avatar / Doc Icon */}
        {isDemo ? (
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-medium flex items-center justify-center text-sm shrink-0">
            S
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-neutral-200/60 text-textSecondary flex items-center justify-center shrink-0">
            <FileText size={16} />
          </div>
        )}

        {/* Title and Author */}
        <div className="truncate">
          <div className="text-sm font-medium text-textPrimary truncate group-hover:text-black">
            {meeting.title}
          </div>
          <div className="text-xs text-textSecondary flex items-center space-x-1.5 mt-0.5">
            <span>{meeting.ownerName}</span>
          </div>
        </div>
      </div>

      {/* Meta on the Right */}
      <div className="flex items-center space-x-4 shrink-0 text-xs text-textSecondary">
        {meeting.folderName && (
          <div className="flex items-center space-x-1 text-textSecondary/80">
            <FolderIcon size={13} />
          </div>
        )}
        <span className="font-mono text-[11px]">{meeting.createdAt}</span>
      </div>
    </div>
  );
};
