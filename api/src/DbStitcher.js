const { Stitcher } = require('apollo-stitcher');

class DbStitcher extends Stitcher {
  userExists(args) {
    return this.execute({
      operation: 'query',
      fieldName: 'user_by_pk',
      args,
      selectionSet: `{
        email
      }`,
      result: result => !!result
    });
  }

  delegateToGetUser(args) {
    return this.delegateTo({
      operation: 'query',
      fieldName: 'user_by_pk',
      args
    });
  }

  delegateToInsertUser(args) {
    return this.transform({
      selectionSet: `{
        affected_rows
        returning {
          ...PreStitch
        }
      }`,
      result: result =>
        result && result.affected_rows ? result.returning[0] : null
    }).delegateTo({
      operation: 'mutation',
      fieldName: 'insert_user',
      args: {
        objects: [args]
      }
    });
  }
}

module.exports = {
  DbStitcher
};
