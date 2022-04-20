// Import the required modules
const Joi = require("joi");

// List of valid categories
const Categories = [
  "Electronics and Mobiles",
  "Fashion",
  "Home and Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Health & Beauty",
  "Automotive",
  "Books & Audible",
  "Other",
];

// Exporting ELostItemSchema
const LostItemSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": `Name is required`,
    "string.empty": `Name cannot be an empty.`,
  }),
  description: Joi.string().required().messages({
    "any.required": `Description is required`,
    "string.empty": `Description cannot be an empty.`,
  }),
  brand: Joi.string().optional().allow(""),

  // Category must be one of the categories in the array
  category: Joi.string()
    .valid(...Categories)
    .messages({
      "string.empty": `Category cannot be an empty.`,
      "any.only": `Category must be valid. For Ex - ${Categories.join(", ")} `,
    })
    .allow(""),

  // If category is other, then other_category_name is required
  other_category_name: Joi.string().when("category", {
    is: Joi.string().exist().valid("Other"),
    then: Joi.string().required().messages({
      "any.required": `Other Category Field is required.`,
      "string.empty": `Other Category Field cannot be empty.`,
    }),
    otherwise: Joi.string().optional().allow(""),
  }),

  color: Joi.string().optional().allow(""),
  lost_date: Joi.date().iso().allow(null).optional().messages({
    "any.invalid": `Lost Date must be in ISO format`,
    "date.format": `Lost Date must be in ISO format`,
  }),
  lost_time: Joi.date().iso().allow(null).optional().messages({
    "any.invalid": `Lost Time must be in ISO format`,
    "date.format": `Lost Time must be in ISO format`,
  }),
  lost_location: Joi.string().optional().allow(""),

  user_details: Joi.any(),
  product_id: Joi.string().optional(),
}).options({ allowUnknown: true });

const ValidateLostFound = (req, res, next) => {
  let files = [];

  // If req.files is not empty, take the files and store it in an array
  if (req.files?.length > 0) files = req.files.map(file => file.buffer);

  let newBody = { ...req.body, files: files };

  if (!req.body.lost_date) req.body.lost_date = null;
  if (!req.body.lost_time) req.body.lost_time = null;

  const result = LostItemSchema.validate(req.body);

  if (result.error) return res.status(400).send({ message: result.error.details[0].message });

  req.body = newBody;

  next();
};

// Exports
exports.ValidateLostFound = ValidateLostFound;
