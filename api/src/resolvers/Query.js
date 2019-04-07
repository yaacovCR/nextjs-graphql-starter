const Query = {
  getSession: async (parent, args, context, info) => {
    if (!context.session.user) {
      return {
        loggedInUser: null
      };
    }

    const user = await context.dataSources.db
      .stitch(info)
      .from({ path: ['loggedInUser'] })
      .toGetUser({ email: context.session.user.id });

    return {
      loggedInUser: user
    };
  }
};

module.exports = {
  Query
};
