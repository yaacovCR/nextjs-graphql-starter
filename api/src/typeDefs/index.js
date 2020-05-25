const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    getSession: Session!
  }

  type Mutation {
    signUp(input: SignUpInput!): SignUpPayload!
    login(input: LoginInput!): LoginPayload!
    logout: LogoutPayload!
  }

  """
  Input for signUp mutation
  """
  input SignUpInput {
    email: String!
    password: String!
  }

  """
  Response for signUp mutation
  """
  enum SignUpResponse {
    SUCCESS
    NONUNIQUE_EMAIL
  }

  """
  Payload for signUp mutation
  """
  type SignUpPayload {
    response: SignUpResponse!
    session: Session
  }

  """
  Input for login mutation
  """
  input LoginInput {
    email: String!
    password: String!
  }

  """
  Response for login mutation
  """
  enum LoginResponse {
    SUCCESS
    INVALID_LOGIN_COMBINATION
  }

  """
  Payload to login Mutation
  """
  type LoginPayload {
    response: LoginResponse!
    session: Session
  }

  """
  Session data
  """
  type Session {
    loggedInUser: User
  }

  """
  Payload to login Mutation
  """
  type LogoutPayload {
    session: Session
  }

  """
  User data
  """
  type User {
    email: String!
  }
`;

module.exports = {
  typeDefs,
};
