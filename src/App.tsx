import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { MeetingView } from './components/MeetingView';
import { MyNotesView } from './components/MyNotesView';
import { GlobalChatView } from './components/GlobalChatView';
import { IntegrationsModal } from './components/IntegrationsModal';
import { SecuritySettingsModal } from './components/SecuritySettingsModal';
import { useAppStore } from './store/useAppStore';

export const App: React.FC = () => {
  const {
    activeView,
    activeMeetingId,
    meetings,
    isIntegrationsModalOpen,
    isSecurityModalOpen,
    toggleIntegrationsModal,
    toggleSecurityModal,
  } = useAppStore();

  const currentMeeting = meetings.find((m) => m.id === activeMeetingId) || meetings[0];

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'meeting':
        return <MeetingView />;
      case 'my-notes':
        return <MyNotesView />;
      case 'chat':
        return <GlobalChatView />;
      case 'space':
        return <HomeView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-textPrimary antialiased relative">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden relative">
          {renderContent()}
        </div>
      </main>

      {/* Global Integrations Modal */}
      {isIntegrationsModalOpen && (
        <IntegrationsModal
          meetingTitle={currentMeeting?.title || 'Meeting Notes'}
          summaryText={currentMeeting?.enhancedNotes || currentMeeting?.rawUserNotes || ''}
          onClose={() => toggleIntegrationsModal(false)}
        />
      )}

      {/* Global Security & NDA Settings Modal */}
      {isSecurityModalOpen && (
        <SecuritySettingsModal
          onClose={() => toggleSecurityModal(false)}
        />
      )}
    </div>
  );
};

export default App;
