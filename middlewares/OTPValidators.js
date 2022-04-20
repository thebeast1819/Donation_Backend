// Import the required modules
const Joi = require("joi");

// Exporting OTP Schema
const OTPSchema = Joi.object({
  otp_id: Joi.string().required().messages({
    "any.required": `OTP ID is required`,
    "string.empty": `OTP ID cannot be an empty field`,
  }),
  otp: Joi.string().required().messages({
    "any.required": `OTP is required`,
    "string.empty": `OTP cannot be an empty field`,
  }),
}).options({ allowUnknown: true });

// function to validate the body
const ValidateOTPBody = (req, res, next) => {
  const result = OTPSchema.validate(req.body);

  if (result.error)
    return res
      .status(400)
      .send({ message: result.error.details[0].message, isVerified: false });

  next();
};

// Exports
exports.ValidateOTPBody = ValidateOTPBody;
