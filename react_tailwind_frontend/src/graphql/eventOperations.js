import { gql } from '@apollo/client';

export const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      title
      description
      date
      location
      type
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($title: String!, $description: String, $date: String!, $location: String, $type: String) {
    createEvent(title: $title, description: $description, date: $date, location: $location, type: $type) {
      id
      title
      description
      date
      location
      type
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;
