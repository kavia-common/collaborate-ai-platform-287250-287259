// PUBLIC_INTERFACE
class ChatService {
  constructor(apiKey) {
    // apiKey is no longer needed for frontend as we proxy through backend
    this.isInitialized = false;
    this.systemInstruction = '';
  }

  startChat(systemInstruction) {
    this.systemInstruction = systemInstruction;
    this.isInitialized = true;
  }

  getBackendUrl() {
    if (process.env.REACT_APP_BACKEND_URL) {
      return process.env.REACT_APP_BACKEND_URL;
    }
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = '3001'; 
    return `${protocol}//${hostname}:${port}`;
  }

  async sendMessageStream(text, history = []) {
    if (!this.isInitialized) {
      throw new Error("Chat session not initialized.");
    }

    const backendUrl = this.getBackendUrl();
    
    // Construct messages payload
    const messages = [];

    // 1. Add system instruction if present (as a user message for context)
    if (this.systemInstruction) {
       messages.push({ role: 'user', content: this.systemInstruction });
       messages.push({ role: 'model', content: "Understood. I am ready to assist." });
    }

    // 2. Add conversation history
    history.forEach(msg => {
        // Filter out internal system messages or init messages if necessary
        if (msg.role !== 'system' && msg.id !== 'init') {
             messages.push({ role: msg.role, content: msg.content });
        }
    });

    // 3. Add current message
    messages.push({ role: 'user', content: text });

    try {
      const response = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify({
          messages: messages,
          // Context is already embedded in systemInstruction by ChatBot.jsx, 
          // but we can pass it separately if needed. For now, we rely on messages.
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      return this.streamGenerator(reader);

    } catch (error) {
      console.error("Error sending message to Backend:", error);
      throw error;
    }
  }

  async *streamGenerator(reader) {
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      // Match the interface expected by ChatBot: chunk.text()
      yield { text: () => text };
    }
  }
}

export default ChatService;
