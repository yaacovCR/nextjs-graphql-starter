import React from 'react';
import Toolbar from '../components/Toolbar';
import SignIn from '../components/SignIn';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_SESSION_QUERY = gql`
  query {
    getSession {
      loggedInUser {
        id
        email
      }
    }
  }
`;

export default Component => {
  return class withAuth extends React.Component {
    static async getInitialProps(ctx) {
      let pageProps = {};
      if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx);
      }

      return pageProps;
    }

    constructor(props) {
      super(props);
    }

    render() {
      return (
        <Query query={GET_SESSION_QUERY}>
          {({ data }) => {
            return (
              <>
                {data && data.getSession && data.getSession.loggedInUser ? (
                  <Component
                    loggedInUser={data.getSession.loggedInUser}
                    {...this.props}
                  />
                ) : (
                  <>
                    <Toolbar />
                    <SignIn />
                  </>
                )}
              </>
            );
          }}
        </Query>
      );
    }
  };
};
