import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LockIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import { SignUpMutation, LoginMutation } from '../lib/mutations';

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme
      .spacing.unit * 3}px`
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit * 3
  },
  buttons: {
    display: 'flex',
    marginTop: theme.spacing.unit * 3
  },
  button: {
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2
  }
});

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: ''
    };
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  handleSignUpMutationResponse = data => {
    if (data.signUp.response !== 'SUCCESS')
      this.setState({ error: data.signUp.response });
  };

  handleLoginMutationResponse = data => {
    if (data.login.response !== 'SUCCESS')
      this.setState({ error: data.login.response });
  };

  render() {
    const { classes } = this.props;

    return (
      <main className={classes.main}>
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockIcon />
          </Avatar>
          <Typography variant="h5">Sign In</Typography>
          <form className={classes.form}>
            <TextField
              required
              label="Email Address"
              autoComplete="email"
              value={this.state.email}
              onChange={this.handleChange('email')}
              margin="normal"
              fullWidth
              autoFocus
              error={this.state.error === 'NONUNIQUE_EMAIL'}
              helperText={
                this.state.error === 'NONUNIQUE_EMAIL' ? (
                  'Account already created for this e-mail address. Please log in.'
                ) : (
                  <></>
                )
              }
            />
            <TextField
              required
              type="password"
              label="Password"
              autoComplete="current-password"
              value={this.state.password}
              onChange={this.handleChange('password')}
              margin="normal"
              fullWidth
              error={this.state.error === 'INVALID_LOGIN_COMBINATION'}
              helperText={
                this.state.error === 'INVALID_LOGIN_COMBINATION' ? (
                  'Invalid email address/password combination. Please try again.'
                ) : (
                  <></>
                )
              }
            />
            <div className={classes.buttons}>
              <SignUpMutation
                variables={{
                  email: this.state.email,
                  password: this.state.password
                }}
                onCompleted={this.handleSignUpMutationResponse}
              >
                {mutation => (
                  <Button
                    className={classes.button}
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={mutation}
                  >
                    Sign Up
                  </Button>
                )}
              </SignUpMutation>
              <LoginMutation
                variables={{
                  email: this.state.email,
                  password: this.state.password
                }}
                onCompleted={this.handleLoginMutationResponse}
              >
                {mutation => (
                  <Button
                    className={classes.button}
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={mutation}
                  >
                    Login
                  </Button>
                )}
              </LoginMutation>
            </div>
          </form>
        </Paper>
      </main>
    );
  }
}

SignIn.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SignIn);
