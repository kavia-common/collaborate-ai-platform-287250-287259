import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { MessageSquare, X, Minimize2 } from 'lucide-react';
import ChatService from './ChatService';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import TypingDots from './TypingDots';
import useSpeech from './useSpeech';
import { GET_PROJECTS } from '../../graphql/projectOperations';
import { GET_EVENTS } from '../../graphql/eventOperations';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// PUBLIC_INTERFACE
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Context Data
  const { data: projectsData } = useQuery(GET_PROJECTS);
  const { data: eventsData } = useQuery(GET_EVENTS);

  const chatServiceRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { speak, cancel, isSpeaking } = useSpeech();
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  useEffect(() => {
    chatServiceRef.current = new ChatService(GEMINI_API_KEY);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const initializeChat = () => {
    if (!chatServiceRef.current) return;

    // Build context string
    const projects = projectsData?.getProjects || [];
    const events = eventsData?.getEvents || [];
    
    const contextString = `
      Current Date: ${new Date().toDateString()}
      
      Projects:
      ${projects.slice(0, 5).map(p => `- ${p.title} (${p.status}): ${p.description}`).join('\n')}
      
      Events:
      ${events.slice(0, 5).map(e => `- ${e.title} at ${e.location} (${new Date(e.startTime).toLocaleDateString()})`).join('\n')}
    `;

    const systemPrompt = `
      You are the AI Facilitator for the Collaborate AI Platform. 
      Your tone is professional, helpful, and slightly witty.
      Keep responses concise and focused on helping the user manage their projects and events.
      Use the provided context to answer questions. If you don't know, admit it.
      
      Context:
      ${contextString}
    `;

    chatServiceRef.current.startChat(systemPrompt);
    
    if (messages.length === 0) {
      setMessages([
        { 
          id: 'init', 
          role: 'model', 
          content: "Hello! I'm your AI Facilitator. I can help you catch up on projects or events. What's on your mind?" 
        }
      ]);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!chatServiceRef.current?.isInitialized) {
      initializeChat();
    }
  };

  const handleSend = async (text) => {
    const userMsgId = Date.now();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: text }]);
    setIsTyping(true);

    try {
      // Pass current history + new text implicitly via ChatService logic or explicitly here
      // We pass 'messages' (current history before this new one) and let ChatService append the new text
      const stream = await chatServiceRef.current.sendMessageStream(text, messages);
      
      const botMsgId = Date.now() + 1;
      let fullText = '';
      
      // Add placeholder for bot message
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', content: '' }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, content: fullText } : msg
        ));
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { id: Date.now(), role: 'model', content: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSpeak = (text, msgId) => {
    if (isSpeaking && speakingMessageId === msgId) {
      cancel();
      setSpeakingMessageId(null);
    } else {
      speak(text);
      setSpeakingMessageId(msgId);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300 animate-bounce-subtle flex items-center justify-center"
          aria-label="Open AI Chat"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden
        ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}
        `}
        style={{ height: '600px', maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="font-semibold">AI Facilitator</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
               <Minimize2 size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              onCopy={handleCopy}
              onSpeak={(text) => handleSpeak(text, msg.id)}
              isSpeaking={isSpeaking && speakingMessageId === msg.id}
            />
          ))}
          {isTyping && (
             <div className="flex items-center gap-2 animate-fade-in">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-sm">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="bg-white p-2 rounded-xl rounded-tl-none shadow-sm border border-gray-100">
                   <TypingDots />
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <InputBar onSend={handleSend} disabled={isTyping} />
      </div>
    </>
  );
};

export default ChatBot;
