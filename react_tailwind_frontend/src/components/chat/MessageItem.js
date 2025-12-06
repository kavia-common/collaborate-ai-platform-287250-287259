import React from 'react';
import { useAuth } from '../../context/AuthContext';

const MessageItem = ({ message, isLastMessage, showReadReceipt }) => {
  const { user } = useAuth();
  const isMe = message.sender.id === user?.id;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    // Handle both string ISO and number timestamp
    const date = new Date(isNaN(Number(timestamp)) ? timestamp : Number(timestamp));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
      <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        {/* Avatar */}
        {!isMe && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
            {message.sender.username ? message.sender.username.charAt(0).toUpperCase() : '?'}
          </div>
        )}

        {/* Bubble */}
        <div 
          className={`px-4 py-2 rounded-2xl shadow-sm relative group ${
            isMe 
              ? 'bg-primary text-white rounded-br-none' 
              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
          }`}
        >
          {/* Sender Name in Group Chats (if not me) */}
          {!isMe && (
             <div className="text-[10px] font-bold text-primary mb-0.5 opacity-80">
                {message.sender.username}
             </div>
          )}

          <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map(att => (
                <div key={att.id} className={`flex items-center gap-2 text-xs p-1.5 rounded ${isMe ? 'bg-white/20' : 'bg-gray-100'}`}>
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                   <span className="truncate max-w-[150px]">{att.filename}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className={`text-[10px] mt-1 text-right w-full ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>

      {/* Read Receipt */}
      {isMe && isLastMessage && showReadReceipt && (
        <div className="mt-1 mr-1 flex items-center gap-1">
           <span className="text-xs text-text-light">Read</span>
           <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
