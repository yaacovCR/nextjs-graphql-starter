const { Stitcher, stitch } = require('apollo-stitcher');

const wrapInsert = {
  selectionSet: stitch`{
    affected_rows
    returning {
      ...PreStitch
    }
  }`,
  result: result =>
    result && result.affected_rows ? result.returning[0] : null
};

class DbStitcher extends Stitcher {
  async userExists(args) {
    return !!(await this.execute({
      operation: 'query',
      fieldName: 'user_by_pk',
      args,
      selectionSet: stitch`{
        email
      }`,
    }));
  }

  delegateToGetUser(args) {
    return this.delegateTo({
      operation: 'query',
      fieldName: 'user_by_pk',
      args
    });
  }

  delegateToInsertUser(args) {
    return this.transform(wrapInsert).delegateTo({
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
