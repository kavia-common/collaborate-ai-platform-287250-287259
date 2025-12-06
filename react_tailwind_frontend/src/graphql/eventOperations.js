import { gql } from '@apollo/client';

export const GET_EVENTS = gql`
  query GetEvents($projectId: ID) {
    getEvents(projectId: $projectId) {
      id
      title
      description
      startTime
      endTime
      location
      isVirtual
      meetingUrl
      organizer {
        id
        username
      }
    }
  }
`;

export const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    getEvent(id: $id) {
      id
      title
      description
      startTime
      endTime
      location
      isVirtual
      meetingUrl
      organizer {
        id
        username
      }
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      description
      startTime
      endTime
      location
      isVirtual
      meetingUrl
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($input: UpdateEventInput!) {
    updateEvent(input: $input) {
      id
      title
      description
      startTime
      endTime
      location
      isVirtual
      meetingUrl
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export const EVENT_CREATED = gql`
  subscription OnEventCreated {
    eventCreated {
      id
      title
      description
      startTime
      endTime
      location
      isVirtual
      meetingUrl
      organizer {
        id
        username
      }
    }
  }
`;

export const EVENT_UPDATED = gql`
  subscription OnEventUpdated {
    eventUpdated {
      id
      title
      description
      startTime
      endTime
      location
      isVirtual
      meetingUrl
      organizer {
        id
        username
      }
    }
  }
`;

export const EVENT_DELETED = gql`
  subscription OnEventDeleted {
    eventDeleted
  }
`;
