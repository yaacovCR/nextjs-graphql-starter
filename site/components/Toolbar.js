import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Button from '@material-ui/core/Button';
import { LogoutMutation } from '../lib/mutations';

const styles = {
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

function MyToolbar(props) {
  const { classes } = props;
  return (
    <AppBar position="static">
      <Toolbar>
        {props.loggedInUser && (
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          align="center"
          color="inherit"
          className={classes.grow}
        >
          nextjs-graphql-starter
        </Typography>
        {props.loggedInUser && (
          <LogoutMutation>
            {(mutation) => (
              <Button color="inherit" onClick={mutation}>
                Logout
              </Button>
            )}
          </LogoutMutation>
        )}
      </Toolbar>
    </AppBar>
  );
}

MyToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  loggedInUser: PropTypes.object,
};

export default withStyles(styles)(MyToolbar);
