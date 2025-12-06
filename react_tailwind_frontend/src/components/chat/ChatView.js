import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
    GET_CHAT, 
    GET_CHAT_MESSAGES, 
    SEND_CHAT_MESSAGE, 
    MESSAGE_ADDED_TO_CHAT_SUBSCRIPTION, 
    TYPING_CHANGED_SUBSCRIPTION,
    RECEIPT_UPDATED_SUBSCRIPTION,
    MARK_CHAT_AS_READ 
} from '../../graphql/chatOperations';
import MessageItem from './MessageItem';
import MessageComposer from './MessageComposer';
import TypingIndicator from './TypingIndicator';

const ChatView = ({ chatId, onBack }) => {
  const bottomRef = useRef(null);
  
  // Queries
  const { data: chatData, loading: chatLoading } = useQuery(GET_CHAT, {
    variables: { chatId },
    skip: !chatId
  });

  const { data: msgsData, loading: msgsLoading, subscribeToMore, fetchMore } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatId, limit: 50, offset: 0 },
    skip: !chatId,
    fetchPolicy: 'cache-and-network'
  });

  const [sendChatMessage] = useMutation(SEND_CHAT_MESSAGE);
  const [markAsRead] = useMutation(MARK_CHAT_AS_READ);

  // Local State
  const [typingUsers, setTypingUsers] = useState({});

  // Subscriptions
  useEffect(() => {
    if (!chatId) return;

    // 1. Message Added Subscription
    const unsubscribeMsgs = subscribeToMore({
      document: MESSAGE_ADDED_TO_CHAT_SUBSCRIPTION,
      variables: { chatId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newMsgWrapper = subscriptionData.data.messageAddedToChat;
        
        // Filter out if not this chat (though variables should handle it)
        if (newMsgWrapper.chatId !== chatId) return prev;
        
        const newMsg = newMsgWrapper.message;

        // Dedup
        if (prev.getChatMessages.find(m => m.id === newMsg.id)) return prev;

        // Mark as read immediately if we are viewing
        markAsRead({ variables: { chatId, messageId: newMsg.id } });

        return {
          ...prev,
          getChatMessages: [...prev.getChatMessages, newMsg]
        };
      }
    });

    // 2. Typing Subscription
    const unsubscribeTyping = subscribeToMore({
        document: TYPING_CHANGED_SUBSCRIPTION,
        variables: { chatId },
        updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) return prev;
            const { userId, username, isTyping } = subscriptionData.data.typingChanged;
            
            setTypingUsers(current => {
                const next = { ...current };
                if (isTyping) {
                    next[userId] = username;
                } else {
                    delete next[userId];
                }
                return next;
            });
            return prev;
        }
    });

    // 3. Receipt Subscription (Optional: could update message read status)
    const unsubscribeReceipt = subscribeToMore({
        document: RECEIPT_UPDATED_SUBSCRIPTION,
        variables: { chatId },
        // We usually don't need to update query for receipts unless we show detailed info per message
        // For now, just let it trigger simple updates if needed
    });

    return () => {
        unsubscribeMsgs();
        unsubscribeTyping();
        unsubscribeReceipt();
    };
  }, [chatId, subscribeToMore, markAsRead]);

  // Initial Read Mark and Scroll
  useEffect(() => {
      if (chatId && msgsData?.getChatMessages?.length > 0) {
          const lastMsg = msgsData.getChatMessages[msgsData.getChatMessages.length - 1];
          markAsRead({ variables: { chatId, messageId: lastMsg.id } }).catch(() => {});
          scrollToBottom();
      }
  }, [chatId, msgsData, markAsRead]);

  // Clear typing state on chat change
  useEffect(() => {
      setTypingUsers({});
  }, [chatId]);

  const scrollToBottom = (behavior = 'smooth') => {
      bottomRef.current?.scrollIntoView({ behavior });
  };

  const handleSendMessage = async (content) => {
    try {
        await sendChatMessage({
            variables: {
                chatId,
                content
            }
        });
        scrollToBottom();
    } catch (err) {
        console.error("Error sending message:", err);
    }
  };

  if (!chatId) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 text-gray-400">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <p>Select a chat to start messaging</p>
          </div>
      );
  }

  if (chatLoading || (msgsLoading && !msgsData)) {
      return (
        <div className="h-full flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
  }

  const messages = msgsData?.getChatMessages || [];
  const chatName = chatData?.getChat?.name || chatData?.getChat?.participants.map(p => p.username).join(', ');

  return (
    <div className="flex flex-col h-full bg-surface">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10">
            {onBack && (
                <button onClick={onBack} className="md:hidden p-1 text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
            )}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold">
                {chatName ? chatName.charAt(0).toUpperCase() : '#'}
            </div>
            <div>
                <h2 className="font-bold text-gray-800">{chatName}</h2>
                <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Active
                </p>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/30">
            {messages.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                    No messages here yet. Say hello!
                </div>
            ) : (
                messages.map((msg, idx) => (
                    <MessageItem 
                        key={msg.id || idx} 
                        message={msg} 
                        isLastMessage={idx === messages.length - 1}
                        showReadReceipt={true} 
                    />
                ))
            )}
            <div ref={bottomRef} />
        </div>

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={Object.values(typingUsers)} />

        {/* Composer */}
        <MessageComposer chatId={chatId} onSend={handleSendMessage} />
    </div>
  );
};

export default ChatView;
