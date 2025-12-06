import { ApolloClient, InMemoryCache, split, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';

// PUBLIC_INTERFACE
// Resolve backend URL ensuring it points to the graphql endpoint
const getBackendUrl = () => {
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  // Dynamic default based on current window location
  // This ensures it works in different environments without hardcoding
  // We assume the backend is on port 3001 of the same host
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = '3001'; 
  return `${protocol}//${hostname}:${port}/graphql`;
};

let backendUrl = getBackendUrl();

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

// Determine WebSocket URL dynamically to handle http/https correctly
const getWsUrl = (httpUrl) => {
  if (process.env.REACT_APP_WS_URL) return process.env.REACT_APP_WS_URL;

  // Convert http(s) to ws(s)
  let url = httpUrl.replace(/^http/, 'ws');
  
  // CRITICAL: Force wss:// if the page is served over https://
  // This prevents SecurityError/Mixed Content issues
  if (window.location.protocol === 'https:' && url.startsWith('ws:')) {
    url = url.replace(/^ws:/, 'wss:');
  }
  
  return url;
};

const wsUrl = getWsUrl(backendUrl);
console.log('Apollo WebSocket connecting to:', wsUrl);

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
