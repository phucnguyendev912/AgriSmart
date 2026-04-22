import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const createChatSession = async (payload = {}) => {
  const response = await axios.post(`${API_URL}/api/chat/sessions`, payload, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchChatSessions = async ({ page = 0, size = 10 } = {}) => {
  const response = await axios.get(`${API_URL}/api/chat/sessions`, {
    params: { page, size },
    withCredentials: true,
  });
  return response.data;
};

export const fetchChatMessages = async (sessionId, { page = 0, size = 50 } = {}) => {
  const response = await axios.get(`${API_URL}/api/chat/sessions/${sessionId}/messages`, {
    params: { page, size },
    withCredentials: true,
  });
  return response.data;
};

export const sendChatMessage = async (sessionId, payload) => {
  const response = await axios.post(`${API_URL}/api/chat/sessions/${sessionId}/messages`, payload, {
    withCredentials: true,
  });
  return response.data;
};

export const sendGuestChatMessage = async (payload) => {
  const response = await axios.post(`${API_URL}/api/chat/guest/messages`, payload, {
    withCredentials: true,
  });
  return response.data;
};
