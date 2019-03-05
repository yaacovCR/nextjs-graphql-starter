const { ApolloLink, split } = require('apollo-link');
const { getMainDefinition } = require('apollo-utilities');
const { HttpLink } = require('apollo-link-http');
const { WebSocketLink } = require('apollo-link-ws');
const { onError } = require('apollo-link-error');
const ws = require('websocket');
const fetch = require('node-fetch');
const {
  makeRemoteExecutableSchema,
  introspectSchema
} = require('apollo-server-express');

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
  uri: 'http://localhost:5000/v1alpha1/graphql', // Server URL (must be absolute)
  fetch
});

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:5000/v1alpha1/graphql',
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

const link = ApolloLink.from([errorLink, terminatingLink]);

const createDbSchema = async () => {
  try {
    const schema = await introspectSchema(link);
    const executableSchema = makeRemoteExecutableSchema({ schema, link });
    return executableSchema;
  } catch (err) {
    console.error(err);
  }
};

module.exports = { createDbSchema };
