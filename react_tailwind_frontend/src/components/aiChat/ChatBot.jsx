import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { MessageSquare, X, Minimize2, Sparkles } from 'lucide-react';
import ChatService from './ChatService';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import SkeletonBubble from './SkeletonBubble';
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
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
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
      const stream = await chatServiceRef.current.sendMessageStream(text, messages);
      
      const botMsgId = Date.now() + 1;
      let fullText = '';
      let isFirstChunk = true;

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        if (isFirstChunk) {
            // Once first chunk arrives, stop "typing" skeleton and show real message
            setIsTyping(false); 
            setMessages(prev => [...prev, { id: botMsgId, role: 'model', content: fullText }]);
            isFirstChunk = false;
        } else {
            setMessages(prev => prev.map(msg => 
              msg.id === botMsgId ? { ...msg, content: fullText } : msg
            ));
        }
      }
    } catch (error) {
      console.error("ChatBot: Chat error", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        role: 'model', 
        content: `I'm having trouble connecting. (${error.message})` 
      }]);
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
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full shadow-lg shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all duration-300 motion-safe:animate-bounce-subtle flex items-center justify-center group"
          aria-label="Open AI Chat"
        >
          <Sparkles size={24} className="group-hover:rotate-12 transition-transform text-secondary-100" />
        </button>
      )}

      {/* Chat Window */}
      <div className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-[95vw] md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden
        ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8 pointer-events-none'}
        `}
        style={{ height: 'min(600px, 85vh)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500/5 to-gray-50 p-4 flex items-center justify-between border-b border-gray-100/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center text-white shadow-sm">
                 <Sparkles size={16} className="text-secondary-100" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">AI Facilitator</h3>
              <p className="text-xs text-primary-600 font-medium">Ocean Professional</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1.5 text-gray-400 hover:bg-white hover:text-gray-600 rounded-lg transition-all"
              aria-label="Minimize chat"
            >
               <Minimize2 size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white/30 space-y-4 scroll-smooth">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              onCopy={handleCopy}
              onSpeak={(text) => handleSpeak(text, msg.id)}
              isSpeaking={isSpeaking && speakingMessageId === msg.id}
            />
          ))}
          
          {isTyping && <SkeletonBubble />}
          
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Input Area */}
        <InputBar onSend={handleSend} disabled={isTyping} />
      </div>
    </>
  );
};

export default ChatBot;
