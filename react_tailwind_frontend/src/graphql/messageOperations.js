import { gql } from '@apollo/client';

export const GET_MESSAGES = gql`
  query GetMessages($projectId: ID, $eventId: ID) {
    messages(projectId: $projectId, eventId: $eventId) {
      id
      content
      createdAt
      sender {
        id
        username
        email
      }
      projectId
      eventId
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($content: String!, $projectId: ID, $eventId: ID) {
    sendMessage(content: $content, projectId: $projectId, eventId: $eventId) {
      id
      content
      createdAt
      sender {
        id
        username
        email
      }
      projectId
      eventId
    }
  }
`;

export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded($projectId: ID, $eventId: ID) {
    messageAdded(projectId: $projectId, eventId: $eventId) {
      id
      content
      createdAt
      sender {
        id
        username
        email
      }
      projectId
      eventId
    }
  }
`;
