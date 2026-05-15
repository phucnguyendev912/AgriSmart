import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  { value: 'DISEASE',     label: '🌿 Bệnh' },
  { value: 'TREATMENT',  label: '💊 Phác đồ điều trị' },
  { value: 'CONFLICT',   label: '⚠️ Xung đột thuốc' },
  { value: 'CULTIVATION',label: '🌾 Kỹ thuật canh tác' },
];

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

const ChatBotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('DISEASE');
  const [messages, setMessages] = useState([createGreetingMessage()]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionTitle, setSessionTitle] = useState('Trợ lý AgriAI');
  const [isTyping, setIsTyping] = useState(false);

  // history panel state
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // load most recent session on open
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const loadConversation = async () => {
      try {
        const sessionsPage = await fetchChatSessions({ page: 0, size: 1 });
        const firstSession = sessionsPage?.content?.[0];
        let sessionId = firstSession?.id ?? null;

        if (!sessionId) {
          const createdSession = await createChatSession({});
          sessionId = createdSession.id;
        }
        if (cancelled) return;

        setActiveSessionId(sessionId);
        setSessionTitle(firstSession?.sessionTitle || 'Trợ lý AgriAI');

        const messagesPage = await fetchChatMessages(sessionId, { page: 0, size: 50 });
        if (cancelled) return;

        const mappedMessages = (messagesPage?.content || []).map(mapHistoryMessageToMessage);
        setMessages(mappedMessages.length > 0 ? mappedMessages : [createGreetingMessage()]);
      } catch (error) {
        console.error('Failed to load chat session:', error);
        setMessages([createGreetingMessage()]);
      }
    };

    loadConversation();
    return () => { cancelled = true; };
  }, [isOpen]);

  // load history sessions list
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

  const handleToggleHistory = () => {
    if (!showHistory) loadHistory();
    setShowHistory((prev) => !prev);
  };

  // switch to a session from history
  const handleSelectSession = async (session) => {
    if (isLoadingSession || session.id === activeSessionId) {
      setShowHistory(false);
      return;
    }
    setIsLoadingSession(true);
    try {
      const messagesPage = await fetchChatMessages(session.id, { page: 0, size: 50 });
      const mappedMessages = (messagesPage?.content || []).map(mapHistoryMessageToMessage);
      setActiveSessionId(session.id);
      setSessionTitle(session.sessionTitle || 'Trợ lý AgriAI');
      setMessages(mappedMessages.length > 0 ? mappedMessages : [createGreetingMessage()]);
      setInput('');
      setShowHistory(false);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const createdSession = await createChatSession({});
      setActiveSessionId(createdSession.id);
      setSessionTitle(createdSession.sessionTitle || 'Trợ lý AgriAI');
      setMessages([createGreetingMessage()]);
      setInput('');
      setSelectedSkill('DISEASE');
      // prepend new session to history list
      setSessions((prev) => [createdSession, ...prev.filter((s) => s.id !== createdSession.id)]);
      setShowHistory(false);
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const ensureSession = async () => {
    if (activeSessionId) return activeSessionId;
    const createdSession = await createChatSession({});
    setActiveSessionId(createdSession.id);
    return createdSession.id;
  };

  const handleSend = async (text) => {
    const messageContent = (text || input).trim();
    if (!messageContent || isTyping) return;

    const userMessage = createUserMessage(messageContent);
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const sessionId = await ensureSession();
      const response = await sendChatMessage(sessionId, { messageContent, selectedSkill });
      const assistantMessage = mapApiResponseToMessage(response);
      setMessages((prev) => [...prev, assistantMessage]);

      // refresh title after first message
      if (messages.filter((m) => m.sender === 'user').length === 0) {
        const refreshed = await fetchChatSessions({ page: 0, size: 1 });
        const updatedTitle = refreshed?.content?.[0]?.sessionTitle;
        if (updatedTitle) {
          setSessionTitle(updatedTitle);
          setSessions((prev) =>
            prev.map((s) => (s.id === sessionId ? { ...s, sessionTitle: updatedTitle } : s)),
          );
        }
      }

      // update last message in history list
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, lastMessage: messageContent, lastMessageAt: new Date().toISOString() }
            : s,
        ),
      );
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


  return (
    <>
      {/* FAB button */}
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
          <div className="relative w-full max-w-5xl h-full max-h-[870px] bg-white rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">

            {/* ── Login prompt (unauthenticated) ── */}
            {!user ? (
              <>
                <header className="bg-[#00A651] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-white shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-base md:text-lg leading-tight">Trợ lý AgriAI</h2>
                      <p className="text-xs text-white/80">Tư vấn nông nghiệp thông minh</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-white/10 p-2 rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 bg-slate-50">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-slate-800">Đăng nhập để chat với AgriBot</h3>
                    <p className="text-sm text-slate-500 max-w-xs">
                      Bạn cần đăng nhập để sử dụng tính năng tư vấn nông nghiệp AI.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                    <a
                      href="/login"
                      className="flex-1 bg-[#00A651] text-white text-center py-3 rounded-full font-semibold hover:brightness-95 transition-all shadow-md"
                    >
                      Đăng nhập
                    </a>
                    <a
                      href="/register"
                      className="flex-1 border border-[#00A651] text-[#00A651] text-center py-3 rounded-full font-semibold hover:bg-primary/5 transition-all"
                    >
                      Đăng ký
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <>
            {/* ── Header ── */}
            <header className="bg-[#00A651] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-white shrink-0">
              {/* left: back + title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      eco
                    </span>
                  </div>
                  <div>
                    <h2 className="font-bold text-base md:text-lg leading-tight line-clamp-1 max-w-[180px] md:max-w-xs">
                      {sessionTitle}
                    </h2>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                      {' Đang hoạt động'}
                    </p>
                  </div>
                </div>
              </div>

              {/* right: new session + history + close */}
              <div className="flex items-center gap-1">
                {/* New session */}
                <button
                  onClick={handleNewSession}
                  disabled={isTyping}
                  title="Tạo cuộc trò chuyện mới"
                  className="hover:bg-white/10 p-2 rounded-full transition-colors disabled:opacity-40"
                >
                  <span className="material-symbols-outlined">add_comment</span>
                </button>

                {/* History toggle */}
                <button
                  onClick={handleToggleHistory}
                  title="Lịch sử hội thoại"
                  className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-white/20' : 'hover:bg-white/10'}`}
                >
                  <span className="material-symbols-outlined">history</span>
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/10 p-2 rounded-full transition-colors ml-1"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
            </header>

            {/* ── History Panel (slide-in overlay inside card) ── */}
            {showHistory && (
              <div className="absolute inset-0 z-20 flex mt-[64px] md:mt-[72px] rounded-b-2xl overflow-hidden">
                {/* backdrop */}
                <div
                  className="absolute inset-0 bg-black/30"
                  onClick={() => setShowHistory(false)}
                />
                {/* panel */}
                <div className="relative ml-auto w-full max-w-xs md:max-w-sm h-full bg-white shadow-2xl flex flex-col overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Lịch sử hội thoại</h3>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg text-slate-500">close</span>
                    </button>
                  </div>

                  {/* scrollable session list */}
                  <div className="flex-1 overflow-y-auto">
                    {isLoadingHistory ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                        <div className="w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                        <span className="text-sm">Đang tải...</span>
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                        <span className="material-symbols-outlined text-4xl">chat_bubble_outline</span>
                        <span className="text-sm">Chưa có cuộc trò chuyện nào</span>
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {sessions.map((session) => (
                          <li key={session.id}>
                            <button
                              disabled={isLoadingSession}
                              onClick={() => handleSelectSession(session)}
                              className={`w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 disabled:opacity-50 ${
                                session.id === activeSessionId ? 'bg-primary/5 border-l-2 border-primary' : ''
                              }`}
                            >
                              <p className={`text-sm font-semibold line-clamp-1 ${session.id === activeSessionId ? 'text-primary' : 'text-slate-800'}`}>
                                {session.sessionTitle || 'Phiên tư vấn'}
                              </p>
                              {session.lastMessage && (
                                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                  {session.lastMessage}
                                </p>
                              )}
                              <p className="text-[10px] text-slate-300 mt-1">
                                {formatRelativeTime(session.lastMessageAt || session.createdAt)}
                              </p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Message area ── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6 relative"
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
                        <ChatGreeting message={message} onSuggestionClick={handleSend} />
                      ) : (
                        <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
                      )}
                    </div>

                    {message.references?.length > 0 && (
                      <ChatReferences references={message.references} />
                    )}

                    {message.suggestedAction && (
                      <button
                        onClick={() => { window.location.href = message.suggestedAction.path; }}
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
                    <span className="material-symbols-outlined text-on-primary-container">smart_toy</span>
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

            {/* ── Input bar ── */}
            <div className="p-4 md:p-6 bg-white border-t border-outline-variant/20 space-y-3">
              {/* skill selector row */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-full px-4 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer"
                >
                  {SKILL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* input + send */}
              <div className="relative flex items-center gap-3">
                <input
                  disabled={isTyping}
                  className="flex-1 bg-surface-container-low border-none rounded-full px-5 md:px-6 py-3 md:py-4 focus:ring-2 focus:ring-primary/20 text-on-surface text-sm md:text-base placeholder:text-outline disabled:opacity-50"
                  placeholder="Nhập câu hỏi về bệnh lúa, thuốc, phác đồ hoặc kỹ thuật canh tác..."
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isTyping}
                  className="w-10 h-10 md:w-12 md:h-12 bg-[#00A651] text-white rounded-full flex items-center justify-center hover:brightness-95 active:scale-95 transition-all shadow-lg shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    send
                  </span>
                </button>
              </div>
            </div>
            </>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotWidget;
