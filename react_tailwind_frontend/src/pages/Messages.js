import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MESSAGES, SEND_MESSAGE } from '../graphql/messageOperations';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery(GET_MESSAGES, {
      pollInterval: 5000 // Simple polling for new messages for now
  });
  const [sendMessage] = useMutation(SEND_MESSAGE, { onCompleted: refetch });

  const [messageContent, setMessageContent] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    
    sendMessage({ variables: { content: messageContent } });
    setMessageContent('');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">Error loading messages: {error.message}</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-4">
            <h1 className="text-2xl font-bold text-text">Team Chat</h1>
            <p className="text-text-secondary text-sm">Real-time collaboration</p>
        </div>
        
        <div className="flex-1 bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {data.messages && data.messages.length > 0 ? (
                // Sort messages by creation time
                [...data.messages]
                .sort((a, b) => parseInt(a.createdAt) - parseInt(b.createdAt))
                .map(msg => {
                    const isMe = msg.sender.id === user?.id || msg.sender.email === user?.email;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-5 py-3 rounded-2xl shadow-sm ${
                                isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white text-text rounded-bl-none border border-gray-100'
                            }`}>
                                {!isMe && <div className="text-xs font-bold text-primary mb-1">{msg.sender.username}</div>}
                                <p className="leading-relaxed">{msg.content}</p>
                                <div className={`text-[10px] mt-2 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {new Date(parseInt(msg.createdAt)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-light">
                    <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="flex gap-3">
                <input
                    type="text"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    placeholder="Type a message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                />
                <button 
                    type="submit" 
                    disabled={!messageContent.trim()}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    <span className="hidden md:inline">Send Message</span>
                    <span className="md:hidden">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </span>
                </button>
            </form>
          </div>
        </div>
    </div>
  );
};

export default Messages;
