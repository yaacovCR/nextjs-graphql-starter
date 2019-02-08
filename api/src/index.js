'use strict';

require('dotenv-load')();

const COOKIE_SESSION_NAME = 'id';

const { RedisPubSub } = require('graphql-redis-subscriptions');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const cookie = require('cookie');
const signature = require('cookie-signature');
const util = require('util');
const http = require('http');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./typeDefs');
const { resolvers } = require('./resolvers');
const { dataSources } = require('./dataSources');
const morgan = require('morgan');

// Use redis for session management and subscriptions
const redisOptions = { host: process.env.REDIS_HOST };
const pubsub = new RedisPubSub({ connection: redisOptions });
const sessionStore = new RedisStore(redisOptions);

// Set up Apollo Server subscription options
const subscriptions = {
  // Use base path for subscriptions on websocket protocol
  path: '/',
  // Supplement subscription context with function allowing dynamic session access
  onConnect: (connectionParams, webSocket, connectionContext) => {
    const header = connectionContext.request.headers.cookie;
    if (!header) return {};
    const raw = cookie.parse(header)[COOKIE_SESSION_NAME];
    const sid = signature.unsign(raw.slice(2), process.env.SECRET);
    return {
      getSession: util.promisify(callback => sessionStore.get(sid, callback))
    };
  }
};

// For this hybrid websocket deploymnent, see
// https://www.apollographql.com/docs/apollo-server/features/subscriptions.html#Context-with-Subscriptions
// The argument for the context creation function includes connection for subscription,
// and req & res for queries and mutations (with express integration). Subscriptions
// requires dynamic session access, while queries and mutations can be supplied actual
// session.
const context = async ({ req, connection }) => {
  const context = {
    pubsub
  };

  if (connection) {
    return {
      ...context,
      ...connection.context
    };
  }

  return {
    ...context,
    session: req.session
  };
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  subscriptions,
  context
});

const app = express();
app.use(
  morgan('dev', {
    skip: function(req, res) {
      return res.statusCode < 400;
    },
    stream: process.stderr
  }),
  morgan('dev', {
    skip: function(req, res) {
      return res.statusCode >= 400;
    },
    stream: process.stdout
  }),
  session({
    name: COOKIE_SESSION_NAME,
    store: sessionStore,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  })
);

// Set up http server for queries and mutations
const path = process.env.ENDPOINT ? process.env.ENDPOINT : '/';
server.applyMiddleware({ app, path });
const httpServer = http.createServer(app);

// Add websocket server for subscriptions
// See https://www.apollographql.com/docs/apollo-server/features/subscriptions.html
server.installSubscriptionHandlers(httpServer);

// Start server
const port = process.env.PORT ? process.env.PORT : 4000;
httpServer.listen(port, () => {
  console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  console.log(
    `Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
  );
});
