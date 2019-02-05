import React from 'react';
import { GetSessionQuery } from './queries';
import Toolbar from '../components/Toolbar';
import SignIn from '../components/SignIn';

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
        <GetSessionQuery>
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
        </GetSessionQuery>
      );
    }
  };
};
