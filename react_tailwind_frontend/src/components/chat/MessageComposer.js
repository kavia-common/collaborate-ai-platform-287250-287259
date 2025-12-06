import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { SET_TYPING } from '../../graphql/chatOperations';

const MessageComposer = ({ chatId, onSend }) => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const [setTypingMutation] = useMutation(SET_TYPING);

  // Handle typing indicator logic
  useEffect(() => {
    if (content.length > 0 && !isTyping) {
      setIsTyping(true);
      setTypingMutation({ variables: { chatId, isTyping: true } }).catch(console.error);
    }

    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingMutation({ variables: { chatId, isTyping: false } }).catch(console.error);
      }, 1500);
    }

    return () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [content, chatId, isTyping, setTypingMutation]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim()) return;
    
    onSend(content);
    setContent('');
    
    // Stop typing immediately on send
    if (isTyping) {
        setIsTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setTypingMutation({ variables: { chatId, isTyping: false } }).catch(console.error);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100 flex gap-2 items-end">
        <button 
            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
            title="Attach file (Coming Soon)"
            disabled
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
        </button>

        <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full bg-transparent px-4 py-3 outline-none resize-none max-h-32 min-h-[48px] text-sm md:text-base"
                rows={1}
                style={{ height: 'auto', minHeight: '48px' }} 
                // A simple auto-grow implementation would go here, for now fixed rows or scroll
            />
        </div>

        <button 
            onClick={handleSend}
            disabled={!content.trim()}
            className="p-3 bg-primary text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform active:scale-95"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
    </div>
  );
};

export default MessageComposer;
