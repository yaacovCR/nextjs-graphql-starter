const Query = {
  getSession: async (parent, args, context, info) => {
    if (!context.session.user) {
      return {
        loggedInUser: null,
      };
    }

    const user = await context.dataSources.db
      .from(info)
      .transform({
        selectionSet: `{
          ...PreStitch @extract(path: "loggedInUser")
        }`,
      })
      .delegateToGetUser({ email: context.session.user.id });

    return {
      loggedInUser: user,
    };
  },
};

module.exports = {
  Query,
};
