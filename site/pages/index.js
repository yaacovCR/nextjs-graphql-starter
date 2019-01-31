import React, { Component } from 'react';
import Toolbar from '../components/Toolbar';
import withAuth from '../lib/withAuth';

class Index extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { loggedInUser } = this.props;
    return (
      <>
        <Toolbar loggedInUser={loggedInUser} />
      </>
    );
  }
}

export default withAuth(Index);
