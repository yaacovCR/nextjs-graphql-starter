import React from 'react';
import PropTypes from 'prop-types';
import getApolloClient from './getApolloClient';
import Head from 'next/head';
import { getDataFromTree } from 'react-apollo';

function getCookies(req) {
  return req ? req.headers.cookie || undefined : undefined;
}

export default (App) => {
  return class withApollo extends React.Component {
    static propTypes = {
      apolloState: PropTypes.object.isRequired,
    };

    static async getInitialProps(ctx) {
      const {
        Component,
        router,
        ctx: { req, res },
      } = ctx;
      const apolloClient = getApolloClient(
        {},
        { getCookies: () => getCookies(req) }
      );
      ctx.ctx.apolloClient = apolloClient;

      let appProps = {};
      if (App.getInitialProps) {
        appProps = await App.getInitialProps(ctx);
      }

      // If the response is finished, skip rendering,
      // for example, when redirecting.
      if (res && res.finished) {
        return {};
      }

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      if (!process.browser) {
        try {
          // Run all GraphQL queries
          await getDataFromTree(
            <App
              {...appProps}
              Component={Component}
              router={router}
              apolloClient={apolloClient}
            />
          );
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components (on client side) via the data.error prop when using graphql():
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error

          // Similarly, when using Query or Mutation components, on error:
          // with SSR: data = {}, error = undefined, and the component should fail gracefully.
          // on client side: data = undefined, error = populated, error can then be handled properly.
          console.error('Error while running `getDataFromTree`', error);
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract();

      return {
        ...appProps,
        apolloState,
      };
    }

    constructor(props) {
      super(props);
      this.apolloClient = getApolloClient(props.apolloState, {});
    }

    render() {
      return <App {...this.props} apolloClient={this.apolloClient} />;
    }
  };
};
