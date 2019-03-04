const bcrypt = require('bcryptjs');

const Mutation = {
  signUp: async (parent, args, context, info) => {
    const {
      input: { email, password }
    } = args;
    const lowerCaseEmail = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (await context.db.stitch(info).toUserExists({ email: lowerCaseEmail })) {
      return { result: 'NONUNIQUE_EMAIL', user: undefined };
    }

    const response = await context.db.stitch(info).fromSignUpToInsertUser({
      email: lowerCaseEmail,
      password: hashedPassword
    });

    context.session.user = {
      id: response.session.loggedInUser.email
    };

    return response;
  },

  login: async (parent, args, context, info) => {
    const {
      input: { email, password }
    } = args;
    const lowerCaseEmail = email.toLowerCase();
    const response = await context.db.stitch(info).fromLoginToGetUser({ email: lowerCaseEmail });
    
    if (!response || !(await bcrypt.compare(password, response.session.loggedInUser.password))) {
      return { result: 'INVALID_LOGIN_COMBINATION', user: undefined };
    }

    context.session.user = {
      id: response.session.loggedInUser.email
    };

    return response;
  },

  logout: (parent, args, context) => {
    if (!context.session.user) {
      throw new Error('Not authenticated');
    }

    context.session.destroy();

    return {
      result: 'SUCCESS',
      session: {
        loggedInUser: null
      }
    };
  }
};

module.exports = {
  Mutation
};
