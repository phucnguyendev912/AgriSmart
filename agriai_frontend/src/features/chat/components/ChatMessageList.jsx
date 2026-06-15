import React, { useEffect, useRef } from 'react';
import ChatGreeting from './ChatGreeting';
import ChatReferences from './ChatReferences';

/**
 * Khu vực hiển thị danh sách tin nhắn + typing indicator.
 */
const ChatMessageList = ({ messages, isTyping, onSuggestionClick }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
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
                <ChatGreeting message={message} onSuggestionClick={onSuggestionClick} />
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">{message.text}</p>
                  {message.sender === 'ai' && (
                    <p className="text-[10px] text-on-surface-variant italic pt-2 border-t border-outline-variant/10">
                      * Thông tin chỉ mang tính chất tham khảo.
                    </p>
                  )}
                </div>
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
  );
};

export default ChatMessageList;
