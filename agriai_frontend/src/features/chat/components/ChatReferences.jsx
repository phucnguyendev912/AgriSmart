import React from 'react';

/**
 * ChatReferences Component
 * Renders list of document sources or references cited in AI chatbot answers.
 * @param {Object} props - Component props.
 * @param {Object[]} props.references - Array of reference objects.
 */
const ChatReferences = ({ references }) => (
  <div className="flex flex-wrap gap-2">
    {references.map((reference, index) => (
      <span
        key={`${reference.sourceType}-${reference.sourceId || index}`}
        className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200"
      >
        {reference.sourceType}: {reference.title}
      </span>
    ))}
  </div>
);

export default ChatReferences;
