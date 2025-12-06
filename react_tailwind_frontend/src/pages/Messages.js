import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
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

  if (loading) return <div className="p-8">Loading messages...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading messages: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
       <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
        <div className="p-6 border-b">
           <Link to="/dashboard" className="text-xl font-bold text-blue-600">Collaborate AI</Link>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Dashboard</Link>
          <Link to="/projects" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Projects</Link>
          <Link to="/events" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Events</Link>
          <Link to="/messages" className="block px-4 py-2 rounded bg-blue-50 text-blue-700 font-medium">Messages</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 flex flex-col h-screen max-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Team Chat</h1>
        
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {data.messages && data.messages.length > 0 ? (
                // Sort messages by creation time
                [...data.messages]
                .sort((a, b) => parseInt(a.createdAt) - parseInt(b.createdAt))
                .map(msg => {
                    const isMe = msg.sender.id === user?.id || msg.sender.email === user?.email;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                                isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                                {!isMe && <div className="text-xs font-bold text-gray-600 mb-1">{msg.sender.username}</div>}
                                <p>{msg.content}</p>
                                <div className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {new Date(parseInt(msg.createdAt)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                    No messages yet. Start the conversation!
                </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Type a message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                />
                <button 
                    type="submit" 
                    disabled={!messageContent.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
