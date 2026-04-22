const STORAGE_KEY = 'agriai_guest_chat_messages';

export const loadGuestMessages = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load guest chat history:', error);
    return [];
  }
};

export const saveGuestMessages = (messages) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save guest chat history:', error);
  }
};

export const clearGuestMessages = () => {
  localStorage.removeItem(STORAGE_KEY);
};
