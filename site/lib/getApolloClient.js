import { ApolloClient } from 'apollo-client';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';
import { ApolloLink, split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import ws from 'websocket';
import fetch from 'isomorphic-unfetch';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

function createApolloClient(initialState, { getCookies }) {
  const authLink = setContext((_, { headers }) => {
    if (!getCookies) return { headers };
    const cookie = getCookies();
    return {
      headers: {
        ...headers,
        cookie
      }
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  const httpLink = new HttpLink({
    uri: publicRuntimeConfig.GRAPHQL_ENDPOINT, // Server URL (must be absolute)
    credentials: 'same-origin' // Additional fetch() options like `credentials` or `headers`
  });

  const wsLink = new WebSocketLink({
    uri: publicRuntimeConfig.WS_ENDPOINT,
    options: {
      reconnect: true
    },
    webSocketImpl: ws.client
  });

  const terminatingLink = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink
  );

  const link = ApolloLink.from([errorLink, authLink, terminatingLink]);

  const cache = new InMemoryCache({
    dataIdFromObject: object => {
      switch (object.__typename) {
        case 'Session':
          return 'Session'; // Singleton
        case 'User':
          return `User:${object.email}`;
        default:
          return defaultDataIdFromObject(object); // fall back to default handling
      }
    }
  }).restore(initialState || {});

  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link,
    cache
  });
}

let apolloClient = null;

export default function getApolloClient(initialState, options) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return createApolloClient(initialState, options);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = createApolloClient(initialState, options);
  }

  return apolloClient;
}
