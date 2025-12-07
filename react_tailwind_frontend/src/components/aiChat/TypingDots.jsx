import React from 'react';

// PUBLIC_INTERFACE
const TypingDots = () => {
  return (
    <div className="flex space-x-1.5 px-2 py-1 items-center h-6">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-slow" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-slow" style={{ animationDelay: '300ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-slow" style={{ animationDelay: '600ms' }}></div>
    </div>
  );
};

export default TypingDots;
