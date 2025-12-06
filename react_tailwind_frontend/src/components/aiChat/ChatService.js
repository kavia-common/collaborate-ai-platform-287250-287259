import { GoogleGenerativeAI } from "@google/generative-ai";

// PUBLIC_INTERFACE
class ChatService {
  constructor(apiKey) {
    if (!apiKey) {
      console.warn("Google Gemini API key is missing.");
      this.model = null;
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.chatSession = null;
  }

  startChat(systemInstruction) {
    if (!this.model) return;
    
    this.chatSession = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to assist as the Collaborate AI Facilitator." }],
        }
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
  }

  async sendMessageStream(message) {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized.");
    }

    try {
      const result = await this.chatSession.sendMessageStream(message);
      return result.stream;
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  }
}

export default ChatService;
