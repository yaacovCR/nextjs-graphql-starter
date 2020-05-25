import React from 'react';
import { GetSessionQuery } from './queries';
import Toolbar from '../components/Toolbar';
import SignIn from '../components/SignIn';

export default (Component) => {
  class WithAuth extends React.Component {
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
  }
  if (Component.getInitialProps) {
    return class extends WithAuth {
      static async getInitialProps(ctx) {
        return await Component.getInitialProps(ctx);
      }
    };
  } else {
    return WithAuth;
  }
};
