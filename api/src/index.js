'use strict';

require('dotenv-load')();
const { Server } = require('./Server');

// Use redis for session management and subscriptions
const redisOptions = {
  client: require('redis').createClient({ host: process.env.REDIS_HOST }),
};
const sessionName = 'id';

const myServer = new Server({
  sessionName,
  redisOptions,
});

async function startServer() {
  await myServer.prepare();
  myServer.start();
}

startServer().catch((err) => {
  console.log(err);
});
