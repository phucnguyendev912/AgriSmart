import React from 'react';

const SKILL_OPTIONS = [
  { value: 'DISEASE', label: '🌿 Bệnh' },
  { value: 'TREATMENT', label: '💊 Phác đồ điều trị' },
  { value: 'CONFLICT', label: '⚠️ Xung đột thuốc' },
  { value: 'CULTIVATION', label: '🌾 Kỹ thuật canh tác' },
];

/**
 * Input bar gồm skill selector và ô nhập tin nhắn.
 */
const ChatInputBar = ({ input, selectedSkill, isTyping, onInputChange, onSkillChange, onSend }) => {
  return (
    <div className="p-4 md:p-6 bg-white border-t border-outline-variant/20 space-y-3">
      {/* skill selector row */}
      <div className="flex items-center gap-2">
        <select
          aria-label="Chọn chủ đề hỏi đáp"
          value={selectedSkill}
          onChange={(e) => onSkillChange(e.target.value)}
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
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
        />
        <button
          onClick={onSend}
          disabled={isTyping}
          className="w-10 h-10 md:w-12 md:h-12 bg-[#00A651] text-white rounded-full flex items-center justify-center hover:brightness-95 active:scale-95 transition-all shadow-lg shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            send
          </span>
        </button>
      </div>
    </div>
  );
};

export default ChatInputBar;
