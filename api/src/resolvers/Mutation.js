const bcrypt = require('bcryptjs');
const { stitch } = require('apollo-stitcher');

const extractLoggedInUser = {
  selectionSet: stitch`{
    ...PreStitch @extract(path: ["session", "loggedInUser"])          
  }`
};

const addPassword = {
  selectionSet: stitch`{
    ...PreStitch
    password          
  }`
};

const Mutation = {
  signUp: async (parent, args, context, info) => {
    const {
      input: { email, password }
    } = args;
    const lowerCaseEmail = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (await context.dataSources.db.userExists({ email: lowerCaseEmail })) {
      return { response: 'NONUNIQUE_EMAIL', user: null };
    }

    const user = await context.dataSources.db
      .from(info)
      .transform(extractLoggedInUser)
      .delegateToInsertUser({
        email: lowerCaseEmail,
        password: hashedPassword
      });

    if (user) {
      context.session.user = {
        id: lowerCaseEmail
      };
    }

    return {
      response: 'SUCCESS',
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
      .from(info)
      .transform(extractLoggedInUser)
      .transform(addPassword)
      .delegateToGetUser({ email: lowerCaseEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { response: 'INVALID_LOGIN_COMBINATION', user: null };
    }

    context.session.user = {
      id: lowerCaseEmail
    };

    return {
      response: 'SUCCESS',
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
      response: 'SUCCESS',
      session: {
        loggedInUser: null
      }
    };
  }
};

module.exports = {
  Mutation
};
