'use strict';

require('dotenv-load')();

// Use redis for session management and subscriptions
const redisOptions = { host: process.env.REDIS_HOST };
const sessionName = 'id';
const { Server } = require('./Server');

const myServer = new Server({
  sessionName,
  redisOptions
});

async function startServer() {
  try {
    await myServer.prepare();
  } catch (err) {
    console.log(err);
  }
  myServer.start();
}

startServer();
