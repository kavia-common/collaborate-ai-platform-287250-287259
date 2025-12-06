import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MESSAGES, SEND_MESSAGE, MESSAGE_ADDED_SUBSCRIPTION } from '../graphql/messageOperations';
import { GET_PROJECTS } from '../graphql/projectOperations';
import { GET_EVENTS } from '../graphql/eventOperations';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  
  // Context Selection State
  const [contextType, setContextType] = useState('GENERAL'); // GENERAL, PROJECT, EVENT
  const [selectedContextId, setSelectedContextId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef(null);

  // Data Queries for Selector
  const { data: projectsData } = useQuery(GET_PROJECTS);
  const { data: eventsData } = useQuery(GET_EVENTS);

  // Messages Query variables
  const queryVariables = {
    projectId: contextType === 'PROJECT' ? selectedContextId : null,
    eventId: contextType === 'EVENT' ? selectedContextId : null,
  };

  const { data, loading, error, subscribeToMore } = useQuery(GET_MESSAGES, {
    variables: queryVariables,
    fetchPolicy: "cache-and-network"
  });

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: MESSAGE_ADDED_SUBSCRIPTION,
      variables: queryVariables,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newMessage = subscriptionData.data.messageAdded;
        
        // Prevent duplicate messages
        if (prev.messages.find(m => m.id === newMessage.id)) {
            return prev;
        }

        return {
          ...prev,
          messages: [...prev.messages, newMessage],
        };
      },
    });

    return () => unsubscribe();
  }, [subscribeToMore, queryVariables]);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (data?.messages) {
      scrollToBottom();
    }
  }, [data?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      await sendMessage({
        variables: {
          content: messageContent,
          ...queryVariables
        }
      });
      setMessageContent('');
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Helper to get Context Title for display
  const getContextTitle = () => {
    if (contextType === 'PROJECT' && selectedContextId) {
       const p = projectsData?.getProjects?.find(p => p.id === selectedContextId);
       return p ? `Project: ${p.title}` : 'Project Chat';
    }
    if (contextType === 'EVENT' && selectedContextId) {
        const e = eventsData?.getEvents?.find(ev => ev.id === selectedContextId);
        return e ? `Event: ${e.title}` : 'Event Chat';
    }
    return 'General Team Chat';
  };

  // Group messages by date
  const groupMessages = (messages) => {
      const groups = {};
      messages.forEach(msg => {
          const date = new Date(parseInt(msg.createdAt)).toLocaleDateString();
          if (!groups[date]) groups[date] = [];
          groups[date].push(msg);
      });
      return groups;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header & Filters */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-text truncate">{getContextTitle()}</h1>
                <p className="text-text-secondary text-sm">Real-time collaboration</p>
            </div>
            
            <div className="flex gap-2">
                <select 
                    className="bg-white border border-gray-200 text-sm rounded-lg p-2.5 focus:ring-primary focus:border-primary outline-none"
                    value={contextType}
                    onChange={(e) => {
                        setContextType(e.target.value);
                        setSelectedContextId('');
                    }}
                >
                    <option value="GENERAL">General</option>
                    <option value="PROJECT">Project</option>
                    <option value="EVENT">Event</option>
                </select>

                {contextType === 'PROJECT' && (
                    <select
                        className="bg-white border border-gray-200 text-sm rounded-lg p-2.5 focus:ring-primary focus:border-primary outline-none max-w-[150px]"
                        value={selectedContextId}
                        onChange={(e) => setSelectedContextId(e.target.value)}
                    >
                        <option value="">Select Project...</option>
                        {projectsData?.getProjects?.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                )}

                {contextType === 'EVENT' && (
                    <select
                        className="bg-white border border-gray-200 text-sm rounded-lg p-2.5 focus:ring-primary focus:border-primary outline-none max-w-[150px]"
                        value={selectedContextId}
                        onChange={(e) => setSelectedContextId(e.target.value)}
                    >
                        <option value="">Select Event...</option>
                        {eventsData?.getEvents?.map(e => (
                            <option key={e.id} value={e.id}>{e.title}</option>
                        ))}
                    </select>
                )}
            </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50">
            {loading && !data ? (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-full text-red-500">
                    <p>Error loading messages. Please try again.</p>
                </div>
            ) : data?.messages?.length > 0 ? (
                Object.entries(groupMessages([...data.messages].sort((a, b) => parseInt(a.createdAt) - parseInt(b.createdAt)))).map(([date, msgs]) => (
                    <div key={date}>
                        <div className="flex justify-center mb-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">{date}</span>
                        </div>
                        <div className="space-y-3">
                            {msgs.map(msg => {
                                const isMe = msg.sender.id === user?.id || msg.sender.email === user?.email;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm md:text-base ${
                                                isMe 
                                                ? 'bg-primary text-white rounded-br-none' 
                                                : 'bg-white text-text rounded-bl-none border border-gray-100'
                                            }`}>
                                                {!isMe && <div className="text-xs font-bold text-primary mb-1">{msg.sender.username}</div>}
                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                {new Date(parseInt(msg.createdAt)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-light opacity-60">
                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <p>No messages yet in this channel.</p>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            {((contextType !== 'GENERAL' && selectedContextId) || contextType === 'GENERAL') ? (
                <form onSubmit={handleSend} className="flex gap-3">
                    <input
                        type="text"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder={`Message ${contextType === 'GENERAL' ? 'everyone' : 'group'}...`}
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        disabled={sending}
                    />
                    <button 
                        type="submit" 
                        disabled={!messageContent.trim() || sending}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2 min-w-[100px] justify-center"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="hidden md:inline">Send</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="text-center text-gray-500 py-3 bg-gray-50 rounded-lg text-sm">
                    Select a {contextType.toLowerCase()} to start chatting
                </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default Messages;
