// Packages imports
const mongoose = require("mongoose");

// Local imports
const { feedbackSchema } = require("../schemas/Feedback");

// feedback Model
const feedback = mongoose.model("feedback", feedbackSchema);

// Exporting the feedback model
exports.feedback = feedback;
