// Import the required modules
const Joi = require("joi");

// Exporting Register Schema
const RequirementSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
}).options({ allowUnknown: true });

// function to validate the body
const ValidateRequirement = (req, res, next) => {
  const result = RequirementSchema.validate(req.body);

  if (result.error)
    return res.status(400).send({ message: result.error.details[0].message });

  next();
};

// Exports
exports.ValidateRequirement = ValidateRequirement;
