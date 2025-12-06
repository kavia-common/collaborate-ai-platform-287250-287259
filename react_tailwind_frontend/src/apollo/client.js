import { ApolloClient, InMemoryCache, split, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';

// PUBLIC_INTERFACE
// Resolve backend URL ensuring it points to the graphql endpoint
let backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://vscode-internal-12711-beta.beta01.cloud.kavia.ai:3001/graphql';

// Ensure requests go to the exact '/graphql' path
// This fixes issues where the environment variable might lack the path
if (!backendUrl.endsWith('/graphql')) {
  // Remove trailing slash if present
  backendUrl = backendUrl.replace(/\/+$/, '');
  backendUrl = `${backendUrl}/graphql`;
}

console.log('Apollo Client connecting to:', backendUrl);

const httpLink = new HttpLink({
  uri: backendUrl,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const wsUrl = process.env.REACT_APP_WS_URL || backendUrl.replace(/^http/, 'ws');

const wsLink = new GraphQLWsLink(createClient({
  url: wsUrl,
  connectionParams: () => {
     const token = localStorage.getItem('token');
     return {
         authToken: token ? `Bearer ${token}` : "",
     };
  },
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const client = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache(),
});

export default client;
