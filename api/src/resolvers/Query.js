const Query = {
  getSession: async (parent, args, context) => {
    if (!context.session.user) {
      return {
        loggedInUser: undefined
      };
    }

    const user = await context.prisma.user({
      id: context.session.user.id
    });

    return {
      loggedInUser: user
    };
  }
};

module.exports = {
  Query
};
