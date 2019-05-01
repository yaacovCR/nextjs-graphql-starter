const { ApolloServer } = require('apollo-server-express');
const { RedisPubSub } = require('graphql-redis-subscriptions');
const { createDbSchema } = require('./createDbSchema');
const {
  makeRemoteExecutableSchema,
  ApolloClientLink
} = require('apollo-stitcher');
const { createLink } = require('./createLink');
const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { DbStitcher } = require('./DbStitcher');
const { typeDefs } = require('./typeDefs');
const { resolvers } = require('./resolvers');
const { createOnConnectHandler } = require('./createOnConnectHandler');
const express = require('express');
const { applyExpressMiddleware } = require('./applyExpressMiddleware');
const http = require('http');
const httpUri = 'http://localhost:5000/v1alpha1/graphql';
const wsUri = 'ws://localhost:5000/v1alpha1/graphql';

class Server {
  constructor(options) {
    this.options = options;
  }

  async prepare() {
    const pubsub = new RedisPubSub({ connection: this.options.redisOptions });
    const schema = makeRemoteExecutableSchema({
      schema: await createDbSchema(httpUri),
      dispatcher: context => context.link
    });

    this.server = new ApolloServer({
      typeDefs,
      resolvers,
      subscriptions: {
        // Use base path for subscriptions on websocket protocol
        path: '/',
        // Supplement subscription context with function allowing dynamic session access
        onConnect: createOnConnectHandler({
          sessionName: this.options.sessionName,
          redisOptions: this.options.redisOptions
        })
      },

      context: ({ req, connection }) => {
        // add pubsub and a context-specific link to context
        const context = {
          pubsub,
          link: new ApolloClientLink({
            client: new ApolloClient({
              cache: new InMemoryCache(),
              link: createLink({ httpUri, wsUri }),
              ssrMode: true
            })
          })
        };

        // In hybrid websocket deployments, subscriptions supply connection argument instead of
        // the req & res arguments (supplied when using the express integration).
        // See
        // https://www.apollographql.com/docs/apollo-server/features/subscriptions.html#Context-with-Subscriptions
        //
        // Subscriptions require dynamic session access, set up within the onConnectHandler,
        // while queries and mutations can be supplied actual session from the request.

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
      },

      dataSources: () => {
        return {
          db: new DbStitcher({ schema })
        };
      }
    });
  }

  start() {
    // Mount Apollo Server within an Express app
    const app = express();
    applyExpressMiddleware({
      app,
      sessionName: this.options.sessionName,
      redisOptions: this.options.redisOptions
    });
    const path = process.env.ENDPOINT ? process.env.ENDPOINT : '/api';
    this.server.applyMiddleware({ app, path });

    // Set up http server for queries and mutations
    const httpServer = http.createServer(app);

    // Add websocket server for subscriptions
    // See https://www.apollographql.com/docs/apollo-server/features/subscriptions.html
    this.server.installSubscriptionHandlers(httpServer);

    // Start listening
    const port = process.env.PORT ? process.env.PORT : 4000;
    httpServer.listen(port, () => {
      console.log(
        `Server ready at http://localhost:${port}${this.server.graphqlPath}`
      );
      console.log(
        `Subscriptions ready at ws://localhost:${port}${
          this.server.subscriptionsPath
        }`
      );
    });
  }
}

module.exports = {
  Server
};
