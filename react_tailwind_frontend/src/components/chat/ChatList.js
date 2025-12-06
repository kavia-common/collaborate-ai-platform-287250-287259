import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CHATS, CHAT_UPDATED_SUBSCRIPTION } from '../../graphql/chatOperations';

const ChatList = ({ activeChatId, onSelectChat }) => {
  const { data, loading, error, subscribeToMore, refetch } = useQuery(GET_CHATS, {
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: CHAT_UPDATED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        // The simple strategy is to refetch to get sorted order and updated info
        // Alternatively, we could manually update the list in cache
        refetch(); 
        return prev; 
      }
    });
    return () => unsubscribe();
  }, [subscribeToMore, refetch]);

  if (loading && !data) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
      <div className="p-4 text-center text-red-500 text-sm">
          Failed to load chats. <button onClick={() => refetch()} className="underline">Retry</button>
      </div>
  );

  const chats = data?.getChats || [];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-full md:w-80">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-800 text-lg">Messages</h2>
            <button className="text-primary hover:bg-blue-50 p-2 rounded-full transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                    No conversations yet. Start a new chat!
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                    {chats.map(chat => {
                        const isActive = activeChatId === chat.id;
                        return (
                            <div 
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors relative group ${isActive ? 'bg-blue-50/60' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-semibold text-sm truncate pr-2 ${isActive ? 'text-primary' : 'text-gray-900'}`}>
                                        {chat.name || chat.participants?.map(p => p.username).join(', ') || 'Untitled Chat'}
                                    </h3>
                                    {chat.lastMessage && (
                                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                                            {new Date(Number(chat.lastMessage.createdAt)).toLocaleDateString(undefined, { month:'short', day:'numeric' })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-500 truncate max-w-[80%]">
                                        {chat.lastMessage 
                                            ? `${chat.lastMessage.sender.username}: ${chat.lastMessage.content}` 
                                            : <span className="italic text-gray-400">No messages</span>
                                        }
                                    </p>
                                    {chat.unreadCount > 0 && (
                                        <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
};

export default ChatList;
