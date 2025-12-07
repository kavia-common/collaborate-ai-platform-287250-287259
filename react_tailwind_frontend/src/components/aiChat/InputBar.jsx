import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

// PUBLIC_INTERFACE
const InputBar = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  return (
    <div className="p-3 border-t border-gray-100 bg-white rounded-b-xl pb-safe-area-bottom">
      <form 
        onSubmit={handleSubmit} 
        className="flex items-end gap-2 bg-gray-50 p-1.5 rounded-[24px] border border-gray-200 focus-within:border-blue-400/60 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all shadow-inner"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none max-h-32 py-2.5 px-3 text-gray-700 placeholder-gray-400 leading-relaxed"
          rows={1}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className={`
            p-2.5 rounded-full flex-shrink-0 transition-all duration-200 
            ${text.trim() && !disabled 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 active:translate-y-0' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          <Send size={18} className={text.trim() ? "ml-0.5" : ""} />
        </button>
      </form>
    </div>
  );
};

export default InputBar;
