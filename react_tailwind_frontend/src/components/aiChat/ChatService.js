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
    // 1. Prefer environment variable
    if (process.env.REACT_APP_BACKEND_URL) {
      // Remove trailing slash if present
      return process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '');
    }

    // 2. Fallback: Construct based on current location, assuming standard dev ports
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = '3001'; // Standard backend port
    
    const url = `${protocol}//${hostname}:${port}`;
    console.warn('ChatService: REACT_APP_BACKEND_URL not set. Fallback to:', url);
    return url;
  }

  async sendMessageStream(text, history = []) {
    if (!this.isInitialized) {
      throw new Error("Chat session not initialized.");
    }

    const backendUrl = this.getBackendUrl();
    console.log(`ChatService: Sending message to ${backendUrl}/api/ai/chat`);

    // Construct messages payload
    const messages = [];

    // 1. Add system instruction if present (as a user message for context)
    if (this.systemInstruction) {
       messages.push({ role: 'user', content: this.systemInstruction });
       messages.push({ role: 'model', content: "Understood. I am ready to assist." });
    }

    // 2. Add conversation history
    history.forEach(msg => {
        // Filter out internal system messages, init messages, or error messages
        if (msg.role !== 'system' && msg.id !== 'init' && !msg.content.startsWith('Error:')) {
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
        })
      });

      if (!response.ok) {
        // Try to read error details from response
        let errorDetails = response.statusText;
        try {
            const errorJson = await response.json();
            if (errorJson && errorJson.error) {
                errorDetails = errorJson.error;
            }
        } catch (e) {
            // If JSON parse fails, try text
            try {
                 const errorText = await response.text();
                 if (errorText) errorDetails = errorText;
            } catch (e2) {
                // Ignore
            }
        }
        throw new Error(errorDetails || `Server Error (${response.status})`);
      }

      const reader = response.body.getReader();
      return this.streamGenerator(reader);

    } catch (error) {
      console.error("ChatService: Error sending message:", error);
      throw error;
    }
  }

  async *streamGenerator(reader) {
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        // Match the interface expected by ChatBot: chunk.text()
        yield { text: () => text };
      }
    } catch (e) {
      console.error("ChatService: Stream reading error", e);
      throw e;
    }
  }
}

export default ChatService;
