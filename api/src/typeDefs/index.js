const { gql } = require('apollo-server-express');

const typeDefs = [
  gql`
    type Query {
      getSession: Session!
    }

    type Mutation {
      signUp(input: SignUpInput!): SignUpResponse!
      login(input: LoginInput!): LoginResponse!
      logout: LogoutResponse!
    }

    """
    Input for signUp mutation
    """
    input SignUpInput {
      email: String!
      password: String!
    }

    """
    Result of signUp mutation
    """
    enum SignUpResult {
      SUCCESS
      NONUNIQUE_EMAIL
    }

    """
    Response for signUp mutation
    """
    type SignUpResponse {
      result: SignUpResult!
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
    Result for login mutation
    """
    enum LoginResult {
      SUCCESS
      INVALID_LOGIN_COMBINATION
    }

    """
    Response to login Mutation
    """
    type LoginResponse {
      result: LoginResult!
      session: Session
    }

    """
    Response to login Mutation
    """
    type Session {
      loggedInUser: User
    }

    """
    Result for logout mutation
    """
    enum LogoutResult {
      SUCCESS
    }

    """
    Response to login Mutation
    """
    type LogoutResponse {
      result: LogoutResult!
      session: Session
    }

    type User {
      id: ID!
      email: String!
    }
  `
];

module.exports = {
  typeDefs
};
