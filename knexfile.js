// Update with your config settings.

require('dotenv-load')();

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_USER
    }
  }
};
