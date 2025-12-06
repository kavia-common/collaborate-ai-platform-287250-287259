import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/graphql';

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

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
