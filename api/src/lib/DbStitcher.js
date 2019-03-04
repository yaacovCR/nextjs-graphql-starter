const { Stitcher } = require('./Stitcher');
const { Kind } = require('graphql');

class DbStitcher extends Stitcher {
  constructor(options) {
    super(options);
  }

  toUserExists(args) {
    return this.to({
      operation: 'query',
      fieldName: 'user_by_pk',
      args,
      selectionator: () => ({
        kind: Kind.FIELD,
        name: {
          kind: Kind.NAME,
          value: 'email'
        }
      }),
      extractor: result => !!result
    });
  }

  toGetUser(args) {
    return this.to({
      operation: 'query',
      fieldName: 'user_by_pk',
      args,
      selectionator: subtree => {
        return {
          kind: Kind.SELECTION_SET,
          selections: subtree.selections.concat({
            kind: Kind.FIELD,
            name: {
              kind: Kind.NAME,
              value: 'password'
            }
          })
        };
      }
    });
  }

  fromLoginToGetUser(args) {
    return this.from({
      path: ['session', 'loggedInUser'],
      extractor: result =>
        result && {
          result: 'SUCCESS',
          session: {
            loggedInUser: result
          }
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
      selectionator: subtree => ({
        kind: Kind.FIELD,
        name: {
          kind: Kind.NAME,
          value: 'returning'
        },
        selectionSet: subtree
      }),
      extractor: result => result && result.returning && result.returning[0]
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
