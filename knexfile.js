// Update with your config settings.

require('dotenv-load')();

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      user: 'dev',
      password: 'dev',
      database: 'dev'
    }
  }
};
