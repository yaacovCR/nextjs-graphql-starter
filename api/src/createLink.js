const { ApolloLink, split } = require('apollo-link');
const { getMainDefinition } = require('apollo-utilities');
const { HttpLink } = require('apollo-link-http');
const { WebSocketLink } = require('apollo-link-ws');
const { onError } = require('apollo-link-error');
const ws = require('websocket');
const fetch = require('node-fetch');

function createLink({ httpUri, wsUri }) {
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
    uri: httpUri, // Server URL (must be absolute)
    fetch,
  });

  const wsLink = new WebSocketLink({
    uri: wsUri,
    options: {
      reconnect: true,
    },
    webSocketImpl: ws.client,
  });

  const terminatingLink = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink
  );

  return ApolloLink.from([errorLink, terminatingLink]);
}

module.exports = { createLink };
