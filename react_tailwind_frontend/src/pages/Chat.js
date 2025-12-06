import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatList from '../components/chat/ChatList';
import ChatView from '../components/chat/ChatView';

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeChatId, setActiveChatId] = useState(searchParams.get('chatId') || null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Sync state with URL
  useEffect(() => {
    const id = searchParams.get('chatId');
    if (id && id !== activeChatId) {
      setActiveChatId(id);
    }
  }, [searchParams]); // eslint-disable-line

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setSearchParams({ chatId: id });
  };

  const handleBackToList = () => {
    setActiveChatId(null);
    setSearchParams({});
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
      {/* Sidebar / ChatList */}
      <div className={`
          absolute inset-0 z-10 bg-white transition-transform duration-300 md:relative md:translate-x-0 md:z-0 md:w-80 border-r border-gray-100
          ${isMobileView && activeChatId ? '-translate-x-full' : 'translate-x-0'}
      `}>
          <ChatList 
            activeChatId={activeChatId} 
            onSelectChat={handleSelectChat} 
          />
      </div>

      {/* Main Content / ChatView */}
      <div className={`
          absolute inset-0 z-10 bg-white transition-transform duration-300 md:relative md:translate-x-0 md:z-0 md:flex-1
          ${isMobileView && !activeChatId ? 'translate-x-full' : 'translate-x-0'}
      `}>
          <ChatView 
            chatId={activeChatId} 
            onBack={isMobileView ? handleBackToList : undefined}
          />
      </div>
    </div>
  );
};

export default Chat;
