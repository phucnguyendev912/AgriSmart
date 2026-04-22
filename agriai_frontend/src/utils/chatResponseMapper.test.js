import {
  createGreetingMessage,
  createUserMessage,
  mapApiResponseToMessage,
  mapHistoryMessageToMessage,
} from './chatResponseMapper';

describe('chatResponseMapper', () => {
  test('creates greeting message with suggestions', () => {
    const message = createGreetingMessage();

    expect(message.isGreeting).toBe(true);
    expect(message.suggestions.length).toBeGreaterThan(0);
  });

  test('maps API response to assistant message', () => {
    const mapped = mapApiResponseToMessage({
      messageId: 12,
      senderType: 'AI',
      messageContent: 'Xin chào',
      responseType: 'AGRI_KNOWLEDGE',
      references: [{ sourceType: 'DISEASE', title: 'Đạo ôn' }],
    });

    expect(mapped.id).toBe(12);
    expect(mapped.sender).toBe('ai');
    expect(mapped.references).toHaveLength(1);
  });

  test('maps history response to user message', () => {
    const mapped = mapHistoryMessageToMessage({
      id: 5,
      senderType: 'USER',
      messageContent: 'Tôi cần tư vấn',
      createdAt: '2026-04-21T00:00:00',
    });

    expect(mapped.sender).toBe('user');
    expect(mapped.text).toBe('Tôi cần tư vấn');
  });

  test('creates user message', () => {
    const message = createUserMessage('hello');
    expect(message.sender).toBe('user');
    expect(message.text).toBe('hello');
  });
});
