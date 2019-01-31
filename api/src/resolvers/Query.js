const Query = {
  getSession: async (parent, args, context) => {
    if (!context.request.session.user) {
      return {
        loggedInUser: undefined
      };
    }

    const user = await context.prisma.user({
      id: context.request.session.user.id
    });

    return {
      loggedInUser: user
    };
  }
};

module.exports = {
  Query
};
