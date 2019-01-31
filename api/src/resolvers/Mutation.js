const bcrypt = require('bcryptjs');

const Mutation = {
  signUp: async (parent, args, context) => {
    const {
      input: { email, password }
    } = args;
    const lowerCaseEmail = email.toLowerCase();

    const emailExists = await context.prisma.$exists.user({
      email: lowerCaseEmail
    });
    if (emailExists) {
      return {
        result: 'NONUNIQUE_EMAIL',
        user: undefined
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await context.prisma.createUser({
      email: lowerCaseEmail,
      password: hashedPassword
    });

    const { password: omit, ...sanitizedUser } = user;
    context.request.session.user = sanitizedUser;

    return {
      result: 'SUCCESS',
      session: {
        loggedInUser: user
      }
    };
  },

  login: async (parent, args, context) => {
    const {
      input: { email, password }
    } = args;
    const lowerCaseEmail = email.toLowerCase();
    const user = await context.prisma.user({ email: lowerCaseEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { result: 'INVALID_LOGIN_COMBINATION', user: undefined };
    }

    context.request.session.user = {
      id: user.id
    };

    return {
      result: 'SUCCESS',
      session: {
        loggedInUser: user
      }
    };
  },

  logout: (parent, args, context) => {
    if (!context.request.session.user) {
      throw new Error('Not authenticated');
    }

    context.request.session.user = undefined;

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
