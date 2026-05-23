import api from './api';

/**
 * Creates a new chat session.
 */
export const createChatSession = async (payload = {}) => {
  const response = await api.post('/api/chat/sessions', payload);
  return response.data;
};

/**
 * Fetches paginated chat sessions for the current user.
 */
export const fetchChatSessions = async ({ page = 0, size = 10 } = {}) => {
  const response = await api.get('/api/chat/sessions', {
    params: { page, size },
  });
  return response.data;
};

/**
 * Fetches paginated chat messages for a specific session.
 */
export const fetchChatMessages = async (sessionId, { page = 0, size = 50 } = {}) => {
  const response = await api.get(`/api/chat/sessions/${sessionId}/messages`, {
    params: { page, size },
  });
  return response.data;
};

/**
 * Sends a message in a specific chat session.
 */
export const sendChatMessage = async (sessionId, payload) => {
  const response = await api.post(`/api/chat/sessions/${sessionId}/messages`, payload);
  return response.data;
};
