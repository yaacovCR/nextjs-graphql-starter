const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const { introspectSchema } = require('apollo-server-express');

const httpLink = new HttpLink({
  uri: 'http://localhost:5000/v1alpha1/graphql', // Server URL (must be absolute)
  fetch
});

const createDbSchema = async () => {
  try {
    return await introspectSchema(httpLink);
  } catch (err) {
    console.error(err);
  }
};

module.exports = { createDbSchema };
