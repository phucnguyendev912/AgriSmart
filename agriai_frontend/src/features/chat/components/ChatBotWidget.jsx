import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ChatGreeting from './ChatGreeting';
import ChatReferences from './ChatReferences';
import {
  createChatSession,
  fetchChatMessages,
  fetchChatSessions,
  sendChatMessage,
} from '../../../services/chatApi';
import {
  createGreetingMessage,
  createUserMessage,
  mapApiResponseToMessage,
  mapHistoryMessageToMessage,
} from '../../../utils/chatResponseMapper';



const SKILL_OPTIONS = [
  { value: 'DISEASE',     label: '🌿 Nhận diện bệnh' },
  { value: 'TREATMENT',  label: '💊 Phác đồ điều trị' },
  { value: 'CONFLICT',   label: '⚠️ Xung đột thuốc' },
  { value: 'CULTIVATION',label: '🌾 Kỹ thuật canh tác' },
];

const ChatBotWidget = () => {
  const isAuthenticated = Boolean(useAuth().user);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('DISEASE');
  const [messages, setMessages] = useState([createGreetingMessage()]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const loadConversation = async () => {
      if (!isAuthenticated) return;
      try {
        const sessionsPage = await fetchChatSessions({ page: 0, size: 1 });
        const firstSession = sessionsPage?.content?.[0];
        let sessionId = firstSession?.id ?? null;

        if (!sessionId) {
          const createdSession = await createChatSession({});
          sessionId = createdSession.id;
        }

        if (cancelled) {
          return;
        }

        setActiveSessionId(sessionId);

        const messagesPage = await fetchChatMessages(sessionId, {
          page: 0,
          size: 50,
        });

        if (cancelled) {
          return;
        }

        const mappedMessages = (messagesPage?.content || []).map(
          mapHistoryMessageToMessage,
        );
        setMessages(
          mappedMessages.length > 0
            ? mappedMessages
            : [createGreetingMessage()],
        );
      } catch (error) {
        console.error('Failed to load chat session:', error);
        setMessages([createGreetingMessage()]);
      }
    };

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isOpen]);

  const handleNewSession = async () => {
    try {
      const createdSession = await createChatSession({});
      setActiveSessionId(createdSession.id);
      setMessages([createGreetingMessage()]);
      setInput('');
      setSelectedSkill('DISEASE');
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const ensureSession = async () => {
    if (activeSessionId) {
      return activeSessionId;
    }
    const createdSession = await createChatSession({});
    setActiveSessionId(createdSession.id);
    return createdSession.id;
  };

  const handleSend = async (text) => {
    if (!isAuthenticated) return;
    const messageContent = (text || input).trim();
    if (!messageContent || isTyping) {
      return;
    }

    const userMessage = createUserMessage(messageContent);
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const sessionId = await ensureSession();
      const response = await sendChatMessage(sessionId, { messageContent, selectedSkill });
      const assistantMessage = mapApiResponseToMessage(response);
      setMessages((prev) => [...prev, assistantMessage]);
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

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[100]">
        <button
          onClick={() => setIsOpen(true)}
          className={`w-14 h-14 md:w-16 md:h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group relative ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        >
          <span
            className="material-symbols-outlined text-2xl md:text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            chat
          </span>
          <span className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
            Chat với AgriBot
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-8 bg-on-surface/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-full max-h-[870px] bg-white rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <header className="bg-[#00A651] px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleClose}
                  className="hover:bg-white/10 p-2 rounded-full transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      eco
                    </span>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg leading-tight">
                      Trợ lý AgriAI
                    </h2>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                      {' Đang hoạt động'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="hover:bg-white/10 p-1 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
              </div>
            </header>

            {/* Auth gate — show login prompt if not authenticated */}
            {!isAuthenticated ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 bg-slate-50">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-primary text-4xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-on-surface">Yêu cầu đăng nhập</h3>
                  <p className="text-sm text-outline max-w-xs leading-relaxed">
                    Vui lòng đăng nhập để sử dụng trợ lý AgriAI và lưu lịch sử hội thoại của bạn.
                  </p>
                </div>
                <a
                  href="/login"
                  className="px-6 py-3 bg-[#00A651] text-white rounded-full font-semibold text-sm hover:brightness-95 active:scale-95 transition-all shadow-md"
                >
                  Đăng nhập ngay
                </a>
              </div>
            ) : (
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse max-w-[85%] ml-auto' : 'max-w-[85%]'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${message.sender === 'ai' ? 'bg-primary-container' : 'bg-slate-200'}`}
                  >
                    <span
                      className={`material-symbols-outlined ${message.sender === 'ai' ? 'text-on-primary-container' : 'text-slate-500'}`}
                    >
                      {message.sender === 'ai' ? 'smart_toy' : 'person'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div
                      className={`p-4 rounded-2xl shadow-sm border border-outline-variant/10 ${message.sender === 'ai' ? 'bg-white rounded-tl-none text-on-surface-variant' : 'bg-slate-200 rounded-tr-none text-on-surface font-medium'}`}
                    >
                      {message.isGreeting ? (
                        <ChatGreeting
                          message={message}
                          onSuggestionClick={handleSend}
                        />
                      ) : (
                        <p className="text-sm md:text-base leading-relaxed">
                          {message.text}
                        </p>
                      )}
                    </div>

                    {message.references?.length > 0 && (
                      <ChatReferences references={message.references} />
                    )}

                    {message.suggestedAction && (
                      <button
                        onClick={() => {
                          window.location.href = message.suggestedAction.path;
                        }}
                        className="px-4 py-2 border border-primary text-primary text-xs md:text-sm font-medium rounded-full hover:bg-primary/5 transition-colors"
                      >
                        {message.suggestedAction.label}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-primary-container">
                      smart_toy
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/10">
                    <div className="flex gap-1 items-center py-1">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            )} {/* end auth gate */}


            {isAuthenticated && (
            <div className="p-4 md:p-6 bg-white border-t border-outline-variant/20 space-y-3">
              {/* skill selector + new session row */}
              <div className="flex items-center justify-between gap-2">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-full px-4 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer"
                >
                  {SKILL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleNewSession}
                  disabled={isTyping}
                  title="Tạo cuộc trò chuyện mới"
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/30 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">add_comment</span>
                  <span className="hidden md:inline">Mới</span>
                </button>
              </div>
              {/* message input row */}
              <div className="relative flex items-center gap-3">
                <input
                  disabled={isTyping}
                  className="flex-1 bg-surface-container-low border-none rounded-full px-5 md:px-6 py-3 md:py-4 focus:ring-2 focus:ring-primary/20 text-on-surface text-sm md:text-base placeholder:text-outline disabled:opacity-50"
                  placeholder="Nhập câu hỏi về bệnh lúa, thuốc, phác đồ hoặc kỹ thuật canh tác..."
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSend();
                    }
                  }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isTyping}
                  className="w-10 h-10 md:w-12 md:h-12 bg-[#00A651] text-white rounded-full flex items-center justify-center hover:brightness-95 active:scale-95 transition-all shadow-lg shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    send
                  </span>
                </button>
              </div>
            </div>
            )} {/* end isAuthenticated input bar */}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotWidget;
