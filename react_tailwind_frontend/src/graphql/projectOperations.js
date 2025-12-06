import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects {
    getProjects {
      id
      title
      description
      status
      startDate
      endDate
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      title
      description
      status
      startDate
      endDate
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      id
      title
      description
      status
      startDate
      endDate
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export const PROJECT_CREATED = gql`
  subscription OnProjectCreated {
    projectCreated {
      id
      title
      description
      status
      startDate
      endDate
    }
  }
`;

export const PROJECT_UPDATED = gql`
  subscription OnProjectUpdated {
    projectUpdated {
      id
      title
      description
      status
      startDate
      endDate
    }
  }
`;

export const PROJECT_DELETED = gql`
  subscription OnProjectDeleted {
    projectDeleted
  }
`;
