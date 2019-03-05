const Query = {
  getSession: async (parent, args, context, info) => {
    if (!context.session.user) {
      return {
        loggedInUser: undefined
      };
    }

    const session = await context.db.stitch(info).fromGetSessionToGetUser({
      email: context.session.user.id
    });

    return session;
  }
};

module.exports = {
  Query
};
