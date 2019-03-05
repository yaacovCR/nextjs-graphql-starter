const { Stitcher } = require('./Stitcher');

class DbStitcher extends Stitcher {
  constructor(options) {
    super(options);
  }

  toUserExists(args) {
    return this.to({
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

  fromLoginToGetUser(args) {
    return this.from({
      path: ['session', 'loggedInUser'],
      selectionSet: `{
        ...PreStitch
        password
      }`,
      extractor: result =>
        result && {
          result: 'SUCCESS',
          session: {
            loggedInUser: result
          }
        }
    }).toGetUser(args);
  }

  fromGetSessionToGetUser(args) {
    return this.from({
      path: ['loggedInUser'],
      extractor: result =>
        result && {
          loggedInUser: result
        }
    }).toGetUser(args);
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

  fromSignUpToInsertUser(args) {
    return this.from({
      path: ['session', 'loggedInUser'],
      extractor: result =>
        result && {
          result: 'SUCCESS',
          session: {
            loggedInUser: result
          }
        }
    }).toInsertUser(args);
  }
}

module.exports = {
  DbStitcher
};
