import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const SIGNUP_MUTATION = gql`
  mutation SignUpMutation($email: String!, $password: String!) @connection(key: "login", filter: ["input"]) {
    signUp(input: { email: $email, password: $password }) @connection(key: "signUp") {
      result
      session {
        loggedInUser {
          id
          email
        }
      }
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) @connection(key: "login") {
      result
      session {
        loggedInUser {
          id
          email
        }
      }
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation {
    logout {
      result
      session {
        loggedInUser {
          id
          email
        }
      }
    }
  }
`;

function makeSimpleMutation(MUTATION, displayName) {
  function SimpleMutation(props) {
    const { children } = props;
    return (
      <Mutation mutation={MUTATION}>{mutation => children(mutation)}</Mutation>
    );
  }

  if (displayName) SimpleMutation.displayName = displayName;

  return SimpleMutation;
}

function makeCompleMutation(MUTATION, displayName) {
  function ComplexMutation(props) {
    const { variables, onCompleted, children } = props;
    return (
      <Mutation
        mutation={MUTATION}
        variables={variables}
        onCompleted={onCompleted}
      >
        {mutation => children(mutation)}
      </Mutation>
    );
  }

  if (displayName) ComplexMutation.displayName = displayName;

  ComplexMutation.propTypes = {
    variables: PropTypes.object.isRequired,
    onCompleted: PropTypes.func.isRequired
  };

  return ComplexMutation;
}

const SignUpMutation = makeCompleMutation(SIGNUP_MUTATION, 'SignUpMutation');
const LoginMutation = makeCompleMutation(LOGIN_MUTATION, 'LoginMutation');
const LogoutMutation = makeSimpleMutation(LOGOUT_MUTATION, 'LogoutMutation');

export { SignUpMutation, LoginMutation, LogoutMutation };
