const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  introspectSchema,
  mergeSchemas
} = require('apollo-server-express');
const { typeDefs } = require('./typeDefs');
const { resolvers } = require('./resolvers');

const link = new HttpLink({
  uri: 'http://localhost:5000/v1alpha1/graphql',
  fetch
});

const createHasuraSchema = async () => {
  const schema = await introspectSchema(link);

  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link
  });

  return executableSchema;
};

const gql = require('graphql-tag');

const createSchema = async () => {
  const hasuraSchema = await createHasuraSchema();
  const localSchema = makeExecutableSchema({ typeDefs, resolvers });
  const schema = mergeSchemas({
    schemas: [
      hasuraSchema,
      localSchema
    ]
  });
  return schema;
};

module.exports = { createSchema };
