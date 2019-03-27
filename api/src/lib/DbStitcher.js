const { Stitcher } = require('./Stitcher');

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
      extractor: result => {
        if (!result || !result.affected_rows) return null;
        if (result.returning) return result.returning[0];
        return {};
      }
    });
  }

}

module.exports = {
  DbStitcher
};
