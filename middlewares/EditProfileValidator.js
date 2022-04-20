// Import the required modules
const Joi = require("joi");

// Local Imports
// const { Hostels } = require("../schemas/Users");

// Exporting EditProfile Schema
const EditProfileSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required",
    "string.empty": "Name is required",
  }),

  phone: Joi.string().required().length(10).messages({
    "string.length": "Phone must be valid 10 digit number",
    "any.required": `Phone is required`,
    "string.empty": `Phone cannot be an empty.`,
  }),
  room_number: Joi.string().required().messages({
    "any.required": `Room Number is required`,
    "string.empty": `Room Number cannot be an empty.`,
  }),
  user_details: Joi.optional(),
  profile_picture: Joi.optional(),
}).options({ allowUnknown: true });

const ValidateEditProfile = (req, res, next) => {
  let newBody = {
    ...req.body,
    ...(req.file?.buffer && {
      profile_picture: req.file.buffer,
    }),
  };

  const result = EditProfileSchema.validate(req.body);

  if (result.error) return res.status(400).send({ message: result.error.details[0].message });

  req.body = newBody;

  next();
};

// Exports
exports.ValidateEditProfile = ValidateEditProfile;
exports.EditProfileSchema = EditProfileSchema;
