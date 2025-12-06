import { gql } from '@apollo/client';

export const GET_MY_COMPANY = gql`
  query GetMyCompany {
    myCompany {
      id
      name
      description
      website
      industry
    }
  }
`;

export const CREATE_COMPANY = gql`
  mutation CreateCompany($name: String!, $description: String, $website: String, $industry: String) {
    createCompany(name: $name, description: $description, website: $website, industry: $industry) {
      id
      name
      description
      website
      industry
    }
  }
`;
