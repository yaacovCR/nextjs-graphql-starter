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
      extractor: result => !!result
    });
  }

  toGetUser(args) {
    return this.to({
      operation: 'query',
      fieldName: 'user_by_pk',
      args
    });
  }

  toInsertUser(args) {
    return this.to({
      operation: 'mutation',
      fieldName: 'insert_user',
      args: {
        objects: [args]
      },
      selectionSet: `{
        affected_rows
        returning {
          ...PreStitch
        }
      }`,
      extractor: result =>
        result && result.affected_rows ? result.returning[0] : null
    });
  }

}

module.exports = {
  DbStitcher
};
