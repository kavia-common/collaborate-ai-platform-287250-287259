import React from 'react';

const TypingIndicator = ({ typingUsers = [] }) => {
  if (typingUsers.length === 0) return null;

  const text = typingUsers.length === 1 
    ? `${typingUsers[0]} is typing...`
    : typingUsers.length === 2 
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
      : 'Several people are typing...';

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 animate-fade-in">
       <div className="flex gap-1">
         <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
         <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
         <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
       </div>
       <span>{text}</span>
    </div>
  );
};

export default TypingIndicator;
