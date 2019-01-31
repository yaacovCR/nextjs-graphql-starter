import React from 'react';
import getPageContext from './getPageContext';

export default App => {
  return class withMui extends React.Component {
    static async getInitialProps(ctx) {
      let appProps = {};
      if (App.getInitialProps) {
        appProps = await App.getInitialProps(ctx);
      }
      return appProps;
    }

    constructor(props) {
      super(props);
      this.pageContext = getPageContext();
    }

    render() {
      return <App {...this.props} pageContext={this.pageContext} />;
    }
  };
};
