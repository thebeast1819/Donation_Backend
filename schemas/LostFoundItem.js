// Packages imports
const mongoose = require("mongoose");

// lostFoundSchema
const lostFoundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  posted_on: { type: Date, default: Date.now },
  files: {
    type: Array,
    default: [],
  },
  posted_by: { type: mongoose.Schema.ObjectId, ref: "users", required: true },
  found_by_someone: {
    type: Boolean,
    default: false,
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
  quantity:{
    type: Number,
    required : true
  },
  lost_date: {
    type: Date,
    default: null,
  },
  lost_time: {
    type: Date,
    default: null,
  },
  lost_location: {
    type: String,
    default: "",
  },
});

// Exporting the lostFoundSchema
exports.lostFoundSchema = lostFoundSchema;
