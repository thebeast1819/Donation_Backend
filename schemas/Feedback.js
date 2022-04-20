// Packages imports
const mongoose = require("mongoose");

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  feedback: {
    type: String,
    required: true,
  },
  owner_id: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: true,
  },
  feedback_datetime: { type: Date, default: Date.now, required: true },
});

// Exporting the Feedback schema
exports.feedbackSchema = feedbackSchema;
