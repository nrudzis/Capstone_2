/** Middleware to handle json schema validation in routes. */

const jsonschema = require("jsonschema");
const { ExpressError } = require("../expressError");


/** Validate schema.
 */

function validateSchema(schema) {
  return (req, res, next) => {
    try {
      const data = { ...req.body, ...req.params }
      const result = jsonschema.validate(data, schema);
      if (!result.valid) {
        const errorStack = result.errors.map(err => err.stack);
        throw new ExpressError(errorStack, 400);
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = {
  validateSchema,
};
