import React from 'react';
import App, { Container } from 'next/app';
import Head from 'next/head';
import withApollo from '../lib/withApollo';
import { ApolloProvider, compose } from 'react-apollo';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../lib/theme';

class MyApp extends App {
  constructor() {
    super();
  }

  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps, apolloClient } = this.props;
    return (
      <Container>
        <Head>
          <title>nextjs-graphql-starter</title>
        </Head>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ApolloProvider client={apolloClient}>
            <Component {...pageProps} />
          </ApolloProvider>
        </ThemeProvider>
      </Container>
    );
  }
}

export default withApollo(MyApp);
