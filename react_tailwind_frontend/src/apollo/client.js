import { ApolloClient, InMemoryCache, split, HttpLink, from, makeVar } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';

// Track WebSocket connection status
export const isWsConnected = makeVar(false);

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
  let url = process.env.REACT_APP_WS_URL;
  
  if (!url) {
    // Convert http(s) to ws(s)
    url = httpUrl.replace(/^http/, 'ws');
  }
  
  // CRITICAL: Force wss:// if the page is served over https://
  // This prevents SecurityError/Mixed Content issues
  // We apply this even to REACT_APP_WS_URL in case it was set to ws:// in a secure environment
  if (window.location.protocol === 'https:' && url.startsWith('ws:')) {
    url = url.replace(/^ws:/, 'wss:');
  }
  
  return url;
};

const wsUrl = getWsUrl(backendUrl);
console.log('Apollo WebSocket connecting to:', wsUrl);

const wsClient = createClient({
  url: wsUrl,
  connectionParams: () => {
     const token = localStorage.getItem('token');
     return {
         authToken: token ? `Bearer ${token}` : "",
     };
  },
  on: {
    connected: () => {
      console.log('WS Connected');
      isWsConnected(true);
    },
    closed: () => {
      console.log('WS Closed');
      isWsConnected(false);
    },
    error: (err) => {
      console.error('WS Error', err);
      isWsConnected(false);
    },
  },
  // Add heartbeats/keepalive if needed, but defaults are usually fine
});

const wsLink = new GraphQLWsLink(wsClient);

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
