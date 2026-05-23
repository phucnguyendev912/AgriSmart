import React from 'react';

/**
 * ChatGreeting Component
 * Displays the initial chatbot greeting message and pre-defined quick action button suggestions.
 * @param {Object} props - Component props.
 * @param {Object} props.message - The message object containing greeting text and suggestion tags.
 * @param {Function} props.onSuggestionClick - Callback function triggered when a suggestion is clicked.
 */
const ChatGreeting = ({ message, onSuggestionClick }) => (
  <div className="space-y-3">
    <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
    <div className="flex flex-wrap gap-2">
      {(message.suggestions || []).map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-4 py-2 border border-primary text-primary text-xs md:text-sm font-medium rounded-full hover:bg-primary/5 transition-colors whitespace-nowrap"
        >
          {suggestion}
        </button>
      ))}
    </div>
  </div>
);

export default ChatGreeting;
