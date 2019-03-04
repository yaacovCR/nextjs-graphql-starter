const { ExtractField, WrapQuery } = require('graphql-tools');

class Stitcher {
  constructor({
    schema,
    operation,
    fieldName,
    args = {},
    context,
    info,
    transforms = []
  }) {
    this.stitchOptions = {
      schema,
      operation,
      fieldName,
      args,
      context,
      info,
      transforms
    };
  }

  from({ path, extractor }) {
    this.fromPath = path;
    this.fromExtractor = extractor;
    return this;
  }

  to({ operation, fieldName, args, selectionator, extractor, transforms }) {
    this.stitchOptions.operation = operation;
    this.stitchOptions.fieldName = fieldName;
    this.stitchOptions.args = args;

    if (this.fromPath) {
      this.stitchOptions.transforms = this.stitchOptions.transforms.concat(
        new ExtractField({
          from: [fieldName].concat(this.fromPath),
          to: [fieldName]
        })
      );
    }

    if (selectionator || extractor) {
      if (!selectionator) selectionator = subtree => subtree;
      if (!extractor) extractor = result => result;
      this.stitchOptions.transforms = this.stitchOptions.transforms.concat(
        new WrapQuery([fieldName], selectionator, extractor)
      );
    }

    if (transforms) {
      this.stitchOptions.transforms = this.stitchOptions.transforms.concat(
        transforms
      );
    }

    if (this.fromExtractor) return this.delegate().then(this.fromExtractor);

    return this.delegate();
  }

  delegate() {
    return this.stitchOptions.info.mergeInfo.delegateToSchema(
      this.stitchOptions
    );
  }

  stitch(options) {
    if (!options.info) options = { info: options };
    return new this.constructor({
      ...this.stitchOptions,
      ...options
    });
  }
}

module.exports = {
  Stitcher
};
