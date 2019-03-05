const { delegateToSchema } = require('graphql-tools');
const { Kind, visit } = require('graphql');
const gql = require('graphql-tag');

function combineRootFields(fieldNodes, rootFieldName) {
  let selections = [];
  let args = [];

  fieldNodes.forEach(fieldNode => {
    const fieldSelections = fieldNode.selectionSet
      ? fieldNode.selectionSet.selections
      : [];
    selections = selections.concat(fieldSelections);
    args = args.concat(fieldNode.arguments || []);
  });

  let selectionSet = null;
  if (selections.length > 0) {
    selectionSet = {
      kind: Kind.SELECTION_SET,
      selections: selections
    };
  }

  const rootField = {
    kind: Kind.FIELD,
    name: {
      kind: Kind.NAME,
      value: rootFieldName
    },
    arguments: args,
    selectionSet
  };

  return rootField;
}

function extractOneLevelOfFields(fieldNodes, fieldName, fragments) {
  const newFieldNodes = fieldNodes
    .map(selection => {
      switch (selection.kind) {
        case Kind.INLINE_FRAGMENT:
          return selection.selectionSet.selections;
        case Kind.FRAGMENT_SPREAD:
          return fragments[selection.name.value].selectionSet.selections;
        case Kind.FIELD:
        default:
          return selection;
      }
    })
    .flat()
    .filter(
      selection =>
        selection.kind === Kind.FIELD &&
        selection.name.value === fieldName &&
        selection.selectionSet &&
        selection.selectionSet.selections
    )
    .map(selection => selection.selectionSet.selections)
    .flat();
  
  return newFieldNodes;
}

function extractFields(fieldNodes, fromPath, fragments) {
  const newFieldNodes = fromPath.reduce(
    (acc, fieldName) => extractOneLevelOfFields(acc, fieldName, fragments),
    fieldNodes
  );

  return newFieldNodes;
}

function mergeSelectionSets(oldSelectionSet, newSelectionSet, fragmentName) {
  const mergedSelectionSet = visit(newSelectionSet, {
    [Kind.SELECTION_SET]: node => {
      let foundFragment = false;
      for (let selection of node.selections) {
        if (
          selection.kind === Kind.FRAGMENT_SPREAD &&
          selection.name.value === fragmentName
        ) {
          foundFragment = true;
          break;
        }
      }
      if (foundFragment)
        node.selections = node.selections.concat(oldSelectionSet.selections);
      return node;
    },
    [Kind.FRAGMENT_SPREAD]: node => {
      if (node.name.value === fragmentName) return null;
    }
  });

  return mergedSelectionSet;
}

function updateSelectionSet(oldSelectionSet, selectionSet, fragmentName) {
  switch (typeof selectionSet) {
    case 'function':
      return selectionSet(oldSelectionSet);
    case 'string':
      const document = gql(selectionSet);
      selectionSet = document.definitions[0].selectionSet;
    default:
      return mergeSelectionSets(oldSelectionSet, selectionSet, fragmentName);
  }
}

class Stitcher {
  constructor({
    schema,
    context,
    info,
    fragmentName = 'PreStitch',
    transforms = []
  }) {
    this.stitchOptions = {
      schema,
      context,
      info: {
        ...info
      },
      transforms
    };
    this.fragmentName = fragmentName;
    this.fromStitches = [];
  }

  from(options) {
    this.fromStitches.push(options);
    return this;
  }

  to({ operation, fieldName, args, selectionSet, extractor, transforms }) {
    this.stitchOptions.operation = operation;
    this.stitchOptions.fieldName = fieldName;
    this.stitchOptions.args = args;

    const rootField = combineRootFields(
      this.stitchOptions.info.fieldNodes,
      fieldName
    );

    for (let i = 0; i < this.fromStitches.length; i++) {
      const fromStitch = this.fromStitches[i];
      if (fromStitch.path && rootField.selectionSet) {
        rootField.selectionSet.selections = extractFields(
          rootField.selectionSet.selections,
          fromStitch.path,
          this.stitchOptions.info.fragments
        );
      }
      if (fromStitch.selectionSet) {
        rootField.selectionSet = updateSelectionSet(
          rootField.selectionSet,
          fromStitch.selectionSet,
          this.fragmentName
        );
      }
    }

    if (selectionSet) {
      rootField.selectionSet = updateSelectionSet(
        rootField.selectionSet,
        selectionSet,
        this.fragmentName
      );
    }

    this.stitchOptions.info.fieldNodes = [rootField];

    if (transforms) {
      this.stitchOptions.transforms = this.stitchOptions.transforms.concat(
        transforms
      );
    }

    let result = this.delegate();
    if (extractor) result = result.then(extractor);
    for (let i = this.fromStitches.length - 1; i > -1; i--) {
      let fromExtractor = this.fromStitches[i].extractor;
      if (fromExtractor) result = result.then(fromExtractor);
    }

    return result;
  }

  delegate() {
    return delegateToSchema(this.stitchOptions);
  }

  stitch(options) {
    if (!options || !options.info) options = { info: options };
    return new this.constructor({
      ...this.stitchOptions,
      ...options
    });
  }
}

module.exports = {
  Stitcher
};
