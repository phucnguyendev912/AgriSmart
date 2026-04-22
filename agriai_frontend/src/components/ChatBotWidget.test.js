import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ChatBotWidget from './ChatBotWidget';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../services/chatApi', () => ({
  createChatSession: jest.fn(),
  fetchChatMessages: jest.fn(),
  fetchChatSessions: jest.fn(),
  sendChatMessage: jest.fn(),
  sendGuestChatMessage: jest.fn(),
}));

const { useAuth } = require('../context/AuthContext');
const {
  createChatSession,
  fetchChatMessages,
  fetchChatSessions,
  sendChatMessage,
  sendGuestChatMessage,
} = require('../services/chatApi');

describe('ChatBotWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('shows greeting when widget opens', async () => {
    useAuth.mockReturnValue({ accessToken: null });
    render(<ChatBotWidget />);

    fireEvent.click(screen.getByRole('button', { name: /chat/i }));

    expect(
      await screen.findByText(/Chào bạn! Mình là trợ lý AgriAI/i),
    ).toBeInTheDocument();
  });

  test('guest can send message and response is stored locally', async () => {
    useAuth.mockReturnValue({ accessToken: null });
    sendGuestChatMessage.mockResolvedValue({
      messageId: 9,
      senderType: 'AI',
      messageContent: 'Bạn nên chuyển sang chẩn đoán bằng ảnh.',
      responseType: 'TEXT_DIAGNOSIS_REDIRECT',
      references: [],
      suggestedAction: {
        label: 'Chuyển sang chẩn đoán bằng ảnh',
        path: '/diagnosis',
      },
    });

    render(<ChatBotWidget />);
    fireEvent.click(screen.getByRole('button', { name: /chat/i }));

    fireEvent.change(
      screen.getByPlaceholderText(/Nhập câu hỏi về bệnh lúa/i),
      { target: { value: 'Lúa vàng lá bị bệnh gì?' } },
    );
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByText(/Bạn nên chuyển sang chẩn đoán bằng ảnh/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('agriai_guest_chat_messages')).length).toBeGreaterThan(1);
    });
  });

  test('logged-in user loads server session flow', async () => {
    useAuth.mockReturnValue({ accessToken: 'token' });
    fetchChatSessions.mockResolvedValue({ content: [{ id: 3 }] });
    fetchChatMessages.mockResolvedValue({
      content: [{ id: 1, senderType: 'AI', messageContent: 'Lịch sử cũ' }],
    });

    render(<ChatBotWidget />);
    fireEvent.click(screen.getByRole('button', { name: /chat/i }));

    expect(await screen.findByText('Lịch sử cũ')).toBeInTheDocument();
    expect(fetchChatSessions).toHaveBeenCalled();
    expect(fetchChatMessages).toHaveBeenCalledWith(3, { page: 0, size: 50 });
  });
});
