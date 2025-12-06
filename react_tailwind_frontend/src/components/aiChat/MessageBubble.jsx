import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Volume2, VolumeX, User, Bot } from 'lucide-react';

// PUBLIC_INTERFACE
const MessageBubble = ({ message, onCopy, onSpeak, isSpeaking }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-2 items-start`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'} shadow-sm`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div className={`relative group p-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
          isUser 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
        }`}>
          <div className="prose prose-sm max-w-none dark:prose-invert break-words">
             {/* Simple text or Markdown */}
             {isUser ? (
               <p className="whitespace-pre-wrap m-0">{message.content}</p>
             ) : (
               <ReactMarkdown>{message.content}</ReactMarkdown>
             )}
          </div>

          {/* Actions (only for bot messages or if desired for user too, but usually bot) */}
          {!isUser && (
            <div className="absolute -bottom-6 left-0 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button 
                onClick={() => onCopy(message.content)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Copy text"
              >
                <Copy size={14} />
              </button>
              <button 
                onClick={() => onSpeak(message.content)}
                className={`p-1 transition-colors ${isSpeaking ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                title="Read aloud"
              >
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
