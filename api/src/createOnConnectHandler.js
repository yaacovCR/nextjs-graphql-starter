const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const cookie = require('cookie');
const signature = require('cookie-signature');
const util = require('util');

// Set up Apollo Server subscription options
const createOnConnectHandler = ({ sessionName, redisOptions }) => {
  const sessionStore = new RedisStore(redisOptions);
  return (connectionParams, webSocket, connectionContext) => {
    const header = connectionContext.request.headers.cookie;
    if (!header) return {};
    const raw = cookie.parse(header)[sessionName];
    const sid = signature.unsign(raw.slice(2), process.env.SECRET);
    return {
      getSession: util.promisify(callback => sessionStore.get(sid, callback))
    };
  };
};

module.exports = { createOnConnectHandler };
