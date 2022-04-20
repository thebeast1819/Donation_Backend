// Packages imports
const mongoose = require("mongoose");

// BuySellItemSchema
const buySellItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "",
  },
  other_category_name: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "",
  },
  bought_datetime: {
    type: Date,
    default: null,
  },
  warranty_till: {
    type: Date,
    default: null,
  },
  posted_on: { type: Date, default: Date.now },
  files: {
    type: Array,
    default: [],
  },
  posted_by: { type: mongoose.Schema.ObjectId, ref: "users", required: true },
});

// Exporting the BuySellItemSchema
exports.buySellItemSchema = buySellItemSchema;
