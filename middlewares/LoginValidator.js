// Import the required modules
const Joi = require("joi");

// Schema for Login
const LoginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
  push_notification_token: Joi.string().allow(""),
}).options({ allowUnknown: true });

// function to validate the login post body
const ValidateLogin = (req, res, next) => {
  const result = LoginSchema.validate(req.body);

  if (result.error)
    return res.status(400).send({ message: result.error.details[0].message });

  next();
};

// Exports
exports.LoginSchema = LoginSchema;
exports.ValidateLogin = ValidateLogin;
