import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import useChatSession from '../hooks/useChatSession';
import ChatHeader from './ChatHeader';
import ChatHistoryPanel from './ChatHistoryPanel';
import ChatMessageList from './ChatMessageList';
import ChatInputBar from './ChatInputBar';
import ChatLoginPrompt from './ChatLoginPrompt';

/**
 * ChatBotWidget — Floating chat widget composer.
 * Chỉ quản lý UI state (open/closed, history panel, input, skill),
 * toàn bộ logic session/API được delegate sang hook useChatSession.
 */
const ChatBotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('DISEASE');
  const [showHistory, setShowHistory] = useState(false);

  const {
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
  } = useChatSession(isOpen);

  const handleToggleHistory = () => {
    if (!showHistory) loadHistory();
    setShowHistory((prev) => !prev);
  };

  const handleSelectSession = async (session) => {
    await selectSession(session);
    setShowHistory(false);
  };

  const handleNewSession = async () => {
    await createNewSession();
    setInput('');
    setSelectedSkill('DISEASE');
    setShowHistory(false);
  };

  const handleSend = async (text) => {
    const content = (text || input).trim();
    if (!content) return;
    setInput('');
    await sendMessage(content, selectedSkill);
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

            {!user ? (
              <ChatLoginPrompt onClose={() => setIsOpen(false)} />
            ) : (
              <>
                <ChatHeader
                  sessionTitle={sessionTitle}
                  isTyping={isTyping}
                  showHistory={showHistory}
                  onClose={() => setIsOpen(false)}
                  onNewSession={handleNewSession}
                  onToggleHistory={handleToggleHistory}
                />

                {showHistory && (
                  <ChatHistoryPanel
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    isLoadingHistory={isLoadingHistory}
                    isLoadingSession={isLoadingSession}
                    onSelectSession={handleSelectSession}
                    onClose={() => setShowHistory(false)}
                  />
                )}

                <ChatMessageList
                  messages={messages}
                  isTyping={isTyping}
                  onSuggestionClick={handleSend}
                />

                <ChatInputBar
                  input={input}
                  selectedSkill={selectedSkill}
                  isTyping={isTyping}
                  onInputChange={setInput}
                  onSkillChange={setSelectedSkill}
                  onSend={() => handleSend()}
                />
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotWidget;
