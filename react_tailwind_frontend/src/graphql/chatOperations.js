import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query GetChats {
    getChats {
      id
      name
      type
      unreadCount
      lastMessage {
        id
        content
        createdAt
        sender {
          id
          username
        }
      }
      updatedAt
      participants {
        id
        username
        email
      }
    }
  }
`;

export const GET_CHAT = gql`
  query GetChat($chatId: ID!) {
    getChat(chatId: $chatId) {
      id
      name
      type
      participants {
        id
        username
        email
      }
    }
  }
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: ID!, $limit: Int, $offset: Int) {
    getChatMessages(chatId: $chatId, limit: $limit, offset: $offset) {
      id
      content
      createdAt
      attachments {
        id
        filename
        url
      }
      sender {
        id
        username
        email
      }
      readBy {
        id
        username
      }
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation CreateChat($name: String, $memberIds: [ID!]!, $type: String) {
    createChat(name: $name, memberIds: $memberIds, type: $type) {
      id
      name
      type
      participants {
        id
        username
      }
    }
  }
`;

export const SEND_CHAT_MESSAGE = gql`
  mutation SendChatMessage($chatId: ID!, $content: String!, $attachments: [Upload]) {
    sendChatMessage(chatId: $chatId, content: $content, attachments: $attachments) {
      id
      content
      createdAt
      sender {
        id
        username
      }
    }
  }
`;

export const MARK_CHAT_AS_READ = gql`
  mutation MarkChatAsRead($chatId: ID!, $messageId: ID) {
    markChatAsRead(chatId: $chatId, messageId: $messageId)
  }
`;

export const SET_TYPING = gql`
  mutation SetTyping($chatId: ID!, $isTyping: Boolean!) {
    setTyping(chatId: $chatId, isTyping: $isTyping)
  }
`;

export const MESSAGE_ADDED_TO_CHAT_SUBSCRIPTION = gql`
  subscription MessageAddedToChat($chatId: ID) {
    messageAddedToChat(chatId: $chatId) {
      chatId
      message {
        id
        content
        createdAt
        attachments {
            id
            filename
            url
        }
        sender {
          id
          username
          email
        }
      }
    }
  }
`;

export const TYPING_CHANGED_SUBSCRIPTION = gql`
  subscription TypingChanged($chatId: ID) {
    typingChanged(chatId: $chatId) {
      chatId
      userId
      username
      isTyping
    }
  }
`;

export const CHAT_UPDATED_SUBSCRIPTION = gql`
  subscription ChatUpdated {
    chatUpdated {
      id
      name
      lastMessage {
        id
        content
        createdAt
      }
      unreadCount
      updatedAt
    }
  }
`;

export const RECEIPT_UPDATED_SUBSCRIPTION = gql`
  subscription ReceiptUpdated($chatId: ID) {
    receiptUpdated(chatId: $chatId) {
      chatId
      messageId
      readBy {
        id
        username
      }
    }
  }
`;
