import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_SESSION_QUERY = gql`
  query {
    getSession {
      loggedInUser {
        email
      }
    }
  }
`;

function makeQuery(query, displayName) {
  function MyQuery(props) {
    const { children, ...other } = props;
    return (
      <Query query={query} {...other}>
        {children}
      </Query>
    );
  }

  if (displayName) MyQuery.displayName = displayName;

  MyQuery.propTypes = {
    children: PropTypes.func.isRequired
  };

  return MyQuery;
}

const GetSessionQuery = makeQuery(GET_SESSION_QUERY, 'GetSessionQuery');

export { GetSessionQuery };
