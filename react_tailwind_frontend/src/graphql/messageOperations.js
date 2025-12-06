import { gql } from '@apollo/client';

export const GET_MESSAGES = gql`
  query GetMessages($projectId: ID) {
    messages(projectId: $projectId) {
      id
      content
      createdAt
      sender {
        id
        username
        email
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($content: String!, $projectId: ID) {
    sendMessage(content: $content, projectId: $projectId) {
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
