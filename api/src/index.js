'use strict';

require('dotenv-load')();

const { GraphQLServer, PubSub } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');
const { resolvers } = require('./resolvers');
const session = require('express-session');
const morgan = require('morgan');

const pubsub = new PubSub();
const context = req => ({
  request: req.request,
  prisma,
  pubsub
});

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context
});

server.express.use(
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
    name: 'id',
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false
  })
);

const endpoint = process.env.ENDPOINT ? process.env.ENDPOINT : '/';
const port = process.env.PORT ? process.env.PORT : 4000;
const opts = {
  port,
  endpoint
};

server.start(opts, ({ endpoint, port }) =>
  console.log(
    `Server started, listening at endpoint ${endpoint} on port ${port} for incoming requests.`
  )
);
