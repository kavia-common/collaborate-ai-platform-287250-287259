import React from 'react';
import { Bot } from 'lucide-react';

// PUBLIC_INTERFACE
const SkeletonBubble = () => {
  return (
    <div className="flex w-full mb-4 justify-start motion-safe:animate-pulse">
      <div className="flex max-w-[85%] flex-row gap-3 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-white shadow-sm ring-1 ring-gray-50">
          <Bot size={16} className="text-gray-300" />
        </div>

        {/* Bubble */}
        <div className="relative px-5 py-4 rounded-2xl rounded-tl-none border border-gray-100 bg-white shadow-sm w-64">
           <div className="space-y-2.5">
             <div className="h-4 bg-gray-100 rounded w-3/4"></div>
             <div className="h-4 bg-gray-100 rounded w-full"></div>
             <div className="h-4 bg-gray-100 rounded w-5/6"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonBubble;
