import {
  clearGuestMessages,
  loadGuestMessages,
  saveGuestMessages,
} from './chatStorage';

describe('chatStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saves and loads guest messages', () => {
    const messages = [{ id: 1, text: 'hello' }];
    saveGuestMessages(messages);

    expect(loadGuestMessages()).toEqual(messages);
  });

  test('clears guest messages', () => {
    saveGuestMessages([{ id: 1 }]);
    clearGuestMessages();

    expect(loadGuestMessages()).toEqual([]);
  });
});
