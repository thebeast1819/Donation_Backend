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
const BuySellSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": `Name is required`,
    "string.empty": `Name cannot be an empty.`,
  }),
  description: Joi.string().required().messages({
    "any.required": `Description is required`,
    "string.empty": `Description cannot be an empty.`,
  }),
  price: Joi.string().required().messages({
    "any.required": `Price is required`,
    "string.empty": `Price cannot be an empty.`,
  }),
  brand: Joi.string().required().messages({
    "any.required": `Brand is required`,
    "string.empty": `Brand cannot be an empty.`,
  }),

  // Category must be one of the categories in the array
  category: Joi.string()
    .valid(...Categories)
    .messages({
      "string.empty": `Category cannot be an empty.`,
      "any.only": `Category must be valid. For Ex - ${Categories.join(", ")} `,
    })
    .required(),

  // If category is other, then other_category_name is required
  other_category_name: Joi.string().when("category", {
    is: Joi.string().exist().valid("Other"),
    then: Joi.string().required().messages({
      "any.required": `Other Category Field is required.`,
      "string.empty": `Other Category Field cannot be empty.`,
    }),
    otherwise: Joi.string().optional().allow(""),
  }),

  color: Joi.string().required().messages({
    "any.required": `Color is required`,
    "string.empty": `Color cannot be an empty.`,
  }),

  bought_datetime: Joi.date().iso().required().messages({
    "any.invalid": `Lost Date must be in ISO format`,
    "date.format": `Lost Date must be in ISO format`,
  }),

  warranty_till: Joi.date().iso().required().messages({
    "any.invalid": `Warranty Date must be in ISO format`,
    "date.format": `Warranty Date must be in ISO format`,
  }),

  user_details: Joi.any(),
  product_id: Joi.string().optional(),
}).options({ allowUnknown: true });

// Validate Buy Sell Body and arrange buffer files
const ValidateBuySell = (req, res, next) => {
  let files = [];

  // If there are no files, send the error
  const isNewProduct = req.route.path === "/create-new-buysell-product";
  const containsFiles = req.files ? req.files.length > 0 : false;

  if (isNewProduct && !containsFiles)
    return res.status(400).send({ message: "Atleast one product image is required." });

  // If req.files is not empty, take the files and store it in an array
  if (containsFiles) files = req.files.map(file => file.buffer);

  let newBody = { ...req.body, files: files };

  req.body = newBody;

  next();
};

// Exports
exports.ValidateBuySell = ValidateBuySell;
