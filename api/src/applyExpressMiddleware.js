const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const morgan = require('morgan');

const applyExpressMiddleware = ({ app, sessionName, redisOptions }) => {
  app.use(
    morgan('dev', {
      skip: function (req, res) {
        return res.statusCode < 400;
      },
      stream: process.stderr,
    }),
    morgan('dev', {
      skip: function (req, res) {
        return res.statusCode >= 400;
      },
      stream: process.stdout,
    }),
    session({
      name: sessionName,
      store: new RedisStore(redisOptions),
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
};

module.exports = { applyExpressMiddleware };
