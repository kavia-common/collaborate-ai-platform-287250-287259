import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      startDate
      endDate
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $description: String, $status: String, $startDate: String, $endDate: String) {
    createProject(name: $name, description: $description, status: $status, startDate: $startDate, endDate: $endDate) {
      id
      name
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
