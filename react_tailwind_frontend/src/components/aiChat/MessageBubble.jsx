import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Volume2, VolumeX, User, Bot } from 'lucide-react';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; // Optional for better highlighting if needed later

// PUBLIC_INTERFACE
const MessageBubble = ({ message, onCopy, onSpeak, isSpeaking }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3 items-start`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ring-1 ring-white
          ${isUser ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-white text-blue-600 border border-gray-100'}
        `}>
          {isUser ? <User size={16} /> : <Bot size={18} />}
        </div>

        {/* Bubble */}
        <div className={`
          relative group px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed transition-all duration-200
          ${isUser 
            ? 'bg-blue-50 text-blue-900 rounded-tr-none border border-blue-100/50' 
            : 'bg-white text-gray-800 rounded-tl-none border border-gray-200/60 ring-1 ring-gray-50'
          }
        `}>
          <div className={`prose prose-sm max-w-none break-words ${isUser ? 'prose-blue' : 'prose-slate'}`}>
             {isUser ? (
               <p className="whitespace-pre-wrap m-0 font-medium">{message.content}</p>
             ) : (
               <ReactMarkdown 
                  components={{
                    // Style code blocks specifically if needed, otherwise prose handles it well
                    code({node, inline, className, children, ...props}) {
                      return !inline ? (
                        <code className={`${className} block bg-gray-50 p-2 rounded-lg text-xs font-mono border border-gray-200 my-2 overflow-x-auto`} {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={`${className} bg-gray-100 px-1 py-0.5 rounded text-xs font-mono`} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
               >
                 {message.content}
               </ReactMarkdown>
             )}
          </div>

          {/* Voice Visualizer (Simple Bars) */}
          {isSpeaking && !isUser && (
            <div className="absolute top-3 right-3 flex items-end space-x-[2px] h-3">
               <div className="w-[2px] bg-blue-500 animate-pulse h-2"></div>
               <div className="w-[2px] bg-blue-500 animate-pulse h-3 animation-delay-75"></div>
               <div className="w-[2px] bg-blue-500 animate-pulse h-1 animation-delay-150"></div>
            </div>
          )}

          {/* Actions */}
          {!isUser && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Copy text"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              
              <div className="h-3 w-px bg-gray-200 mx-1"></div>

              <button 
                onClick={() => onSpeak(message.content)}
                className={`
                  flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors
                  ${isSpeaking ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}
                `}
                title="Read aloud"
              >
                {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
