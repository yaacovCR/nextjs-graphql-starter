const bcrypt = require('bcryptjs');

const Mutation = {
  signUp: async (parent, args, context, info) => {
    const {
      input: { email, password }
    } = args;
    const lowerCaseEmail = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (await context.dataSources.db.userExists({ email: lowerCaseEmail })) {
      return { result: 'NONUNIQUE_EMAIL', user: undefined };
    }

    const user = await context.dataSources.db
      .stitch(info)
      .from({ path: ['session', 'loggedInUser'] })
      .toInsertUser({
        email: lowerCaseEmail,
        password: hashedPassword
      });

    if (user) {
      context.session.user = {
        id: lowerCaseEmail
      };
    }

    return {
      result: 'SUCCESS',
      session: {
        loggedInUser: user
      }
    };
  },

  login: async (parent, args, context, info) => {
    const {
      input: { email, password }
    } = args;
    const lowerCaseEmail = email.toLowerCase();

    const user = await context.dataSources.db
      .stitch(info)
      .from({
        path: ['session', 'loggedInUser'],
        selectionSet: `{
            ...PreStitch
            password
          }`
      })
      .toGetUser({ email: lowerCaseEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { result: 'INVALID_LOGIN_COMBINATION', user: undefined };
    }

    context.session.user = {
      id: lowerCaseEmail
    };

    return {
      result: 'SUCCESS',
      session: {
        loggedInUser: user
      }
    };
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
