const API_BASE = 'http://127.0.0.1:8000/api/v1';

export const apiClient = {
  async getCalendarEvents() {
    try {
      const res = await fetch(`${API_BASE}/calendar/events`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend calendar API unavailable, using local calendar mock', e);
    }
    return null;
  },

  async getPreMeetingBriefing(eventId: string) {
    try {
      const res = await fetch(`${API_BASE}/calendar/briefing/${eventId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend briefing API unavailable', e);
    }
    return null;
  },

  async searchRAG(query: string) {
    try {
      const res = await fetch(`${API_BASE}/search/rag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 4 }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend RAG search unavailable', e);
    }
    return null;
  },

  async enhanceMeeting(meetingId: string) {
    try {
      const res = await fetch(`${API_BASE}/meetings/${meetingId}/enhance`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend enhance API unavailable', e);
    }
    return null;
  },
};
