import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const SIGNUP_MUTATION = gql`
  mutation SignUpMutation($email: String!, $password: String!)
    @connection(key: "login", filter: ["input"]) {
    signUp(input: { email: $email, password: $password })
      @connection(key: "signUp") {
      result
      session {
        loggedInUser {
          email
        }
      }
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(input: { email: $email, password: $password })
      @connection(key: "login") {
      result
      session {
        loggedInUser {
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
          email
        }
      }
    }
  }
`;

function makeMutation(mutation, displayName) {
  function MyMutation(props) {
    const { children, ...other } = props;
    return (
      <Mutation mutation={mutation} {...other}>
        {children}
      </Mutation>
    );
  }

  if (displayName) MyMutation.displayName = displayName;

  MyMutation.propTypes = {
    children: PropTypes.func.isRequired
  };

  return MyMutation;
}

const SignUpMutation = makeMutation(SIGNUP_MUTATION, 'SignUpMutation');
const LoginMutation = makeMutation(LOGIN_MUTATION, 'LoginMutation');
const LogoutMutation = makeMutation(LOGOUT_MUTATION, 'LogoutMutation');

export { SignUpMutation, LoginMutation, LogoutMutation };
