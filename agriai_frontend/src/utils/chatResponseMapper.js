const GREETING_TEXT =
  'Chào bạn! Mình là trợ lý AgriAI. Mình có thể hỗ trợ về bệnh lúa, phác đồ xử lý, kỹ thuật canh tác và các lưu ý nông nghiệp liên quan.';

const DEFAULT_SUGGESTIONS = [
  'Bệnh đạo ôn nên dùng thuốc gì?',
  'Khô vằn ảnh hưởng gì đến cây lúa?',
  'Tôi muốn chẩn đoán bằng ảnh',
];

export const createGreetingMessage = () => ({
  id: 'greeting-message',
  sender: 'ai',
  text: GREETING_TEXT,
  isGreeting: true,
  suggestions: DEFAULT_SUGGESTIONS,
  responseType: 'AGRI_KNOWLEDGE',
  references: [],
  suggestedAction: null,
  createdAt: new Date().toISOString(),
});

export const createUserMessage = (text) => ({
  id: `user-${Date.now()}`,
  sender: 'user',
  text,
  references: [],
  suggestedAction: null,
  createdAt: new Date().toISOString(),
});

export const mapApiResponseToMessage = (response) => ({
  id: response.messageId || `ai-${Date.now()}`,
  sender: response.senderType === 'USER' ? 'user' : 'ai',
  text: response.messageContent,
  responseType: response.responseType,
  references: response.references || [],
  suggestedAction: response.suggestedAction || null,
  attachment: response.attachment || null,
  createdAt: response.createdAt || new Date().toISOString(),
});

export const mapHistoryMessageToMessage = (response) => ({
  id: response.id,
  sender: response.senderType === 'USER' ? 'user' : 'ai',
  text: response.messageContent,
  responseType: response.senderType === 'AI' ? 'AGRI_KNOWLEDGE' : null,
  references: [],
  suggestedAction: null,
  attachment: response.attachment || null,
  createdAt: response.createdAt,
});
