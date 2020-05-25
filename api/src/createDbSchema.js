const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const { introspectSchema } = require('apollo-server-express');

const createDbSchema = async (uri) => {
  const httpLink = new HttpLink({
    uri, // Server URL (must be absolute)
    fetch,
  });
  try {
    return await introspectSchema(httpLink);
  } catch (err) {
    console.error(err);
  }
};

module.exports = { createDbSchema };
