import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createChatSession,
  fetchChatMessages,
  fetchChatSessions,
  sendChatMessage,
} from '../../../services/chatService';
import {
  createGreetingMessage,
  createUserMessage,
  mapApiResponseToMessage,
  mapHistoryMessageToMessage,
} from '../../../utils/chatResponseMapper';

/**
 * Custom hook quản lý toàn bộ logic chat session:
 * - Load/tạo/chọn session
 * - Gửi/nhận tin nhắn
 * - Quản lý lịch sử hội thoại
 */
const useChatSession = (isOpen) => {
  const [messages, setMessages] = useState([createGreetingMessage()]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionTitle, setSessionTitle] = useState('Trợ lý AgriAI');
  const [isTyping, setIsTyping] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Track số tin nhắn user đã gửi trong session hiện tại
  const userMessageCountRef = useRef(0);

  // Load session gần nhất khi widget mở
  useEffect(() => {
    if (!isOpen) return;
    if (activeSessionId) return;

    let cancelled = false;

    const loadConversation = async () => {
      try {
        const sessionsPage = await fetchChatSessions({ page: 0, size: 10 });
        const validSession = sessionsPage?.content?.find((s) => s.lastMessage);

        if (!validSession) {
          if (cancelled) return;
          setActiveSessionId(null);
          setSessionTitle('Trợ lý AgriAI');
          userMessageCountRef.current = 0;
          setMessages([createGreetingMessage()]);
          return;
        }

        if (cancelled) return;

        setActiveSessionId(validSession.id);
        setSessionTitle(validSession.sessionTitle || 'Trợ lý AgriAI');
        userMessageCountRef.current = 0;

        const messagesPage = await fetchChatMessages(validSession.id, { page: 0, size: 50 });
        if (cancelled) return;

        const mappedMessages = (messagesPage?.content || []).map(mapHistoryMessageToMessage);
        setMessages(mappedMessages.length > 0 ? mappedMessages : [createGreetingMessage()]);
        userMessageCountRef.current = mappedMessages.filter((m) => m.sender === 'user').length;
      } catch (error) {
        console.error('Failed to load chat session:', error);
        setMessages([createGreetingMessage()]);
      }
    };

    loadConversation();
    return () => { cancelled = true; };
  }, [isOpen, activeSessionId]);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const page = await fetchChatSessions({ page: 0, size: 20 });
      setSessions(page?.content || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const selectSession = async (session) => {
    if (isLoadingSession || session.id === activeSessionId) return;
    setIsLoadingSession(true);
    try {
      const messagesPage = await fetchChatMessages(session.id, { page: 0, size: 50 });
      const mappedMessages = (messagesPage?.content || []).map(mapHistoryMessageToMessage);
      setActiveSessionId(session.id);
      setSessionTitle(session.sessionTitle || 'Trợ lý AgriAI');
      setMessages(mappedMessages.length > 0 ? mappedMessages : [createGreetingMessage()]);
      userMessageCountRef.current = mappedMessages.filter((m) => m.sender === 'user').length;
    } catch (err) {
      console.error('Failed to load session messages:', err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const createNewSession = async () => {
    try {
      const createdSession = await createChatSession({});
      setActiveSessionId(createdSession.id);
      setSessionTitle(createdSession.sessionTitle || 'Trợ lý AgriAI');
      setMessages([createGreetingMessage()]);
      userMessageCountRef.current = 0;
      setSessions((prev) => [createdSession, ...prev.filter((s) => s.id !== createdSession.id)]);
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const ensureSession = async () => {
    if (activeSessionId) return activeSessionId;
    const createdSession = await createChatSession({});
    setActiveSessionId(createdSession.id);
    userMessageCountRef.current = 0;
    setSessions((prev) => [createdSession, ...prev.filter((s) => s.id !== createdSession.id)]);
    return createdSession.id;
  };

  const sendMessage = async (messageContent, selectedSkill) => {
    if (!messageContent || isTyping) return;

    const userMessage = createUserMessage(messageContent);
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const sessionId = await ensureSession();
      const payload = { messageContent };
      if (selectedSkill) payload.selectedSkill = selectedSkill;

      const response = await sendChatMessage(sessionId, payload);
      const assistantMessage = mapApiResponseToMessage(response);
      setMessages((prev) => [...prev, assistantMessage]);

      if (userMessageCountRef.current === 0) {
        const refreshed = await fetchChatSessions({ page: 0, size: 20 });
        const currentSession = refreshed?.content?.find((s) => s.id === sessionId);
        const updatedTitle = currentSession?.sessionTitle;
        if (updatedTitle) setSessionTitle(updatedTitle);
        if (refreshed?.content) setSessions(refreshed.content);
      } else {
        setSessions((prev) => {
          const now = new Date().toISOString();
          const updated = prev.map((s) =>
            s.id === sessionId
              ? { ...s, lastMessage: messageContent, lastMessageAt: now }
              : s,
          );
          return [...updated].sort((a, b) => {
            const aTime = a.lastMessageAt || a.createdAt || '';
            const bTime = b.lastMessageAt || b.createdAt || '';
            return bTime.localeCompare(aTime);
          });
        });
      }
      userMessageCountRef.current += 1;
    } catch (error) {
      console.error('Failed to send chat message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'ai',
          text: 'Mình đang gặp lỗi tạm thời khi xử lý câu hỏi. Bạn vui lòng thử lại sau ít phút.',
          responseType: 'OUT_OF_SCOPE',
          references: [],
          suggestedAction: null,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    activeSessionId,
    sessionTitle,
    isTyping,
    sessions,
    isLoadingHistory,
    isLoadingSession,
    loadHistory,
    selectSession,
    createNewSession,
    sendMessage,
  };
};

export default useChatSession;
