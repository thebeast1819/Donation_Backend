// Packages imports
const mongoose = require("mongoose");

// 30 days in seconds
const MAX_LIFE = 2592000;

// Requirement Schema
const requirementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  posted_on: {
    type: Date,
    default: Date.now,
    expires: MAX_LIFE,
  },
  posted_by: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: true,
  },
});

// Exporting the Requirement schema
exports.requirementSchema = requirementSchema;
