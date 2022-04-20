// Packages imports
const mongoose = require("mongoose");

// Local imports
const { requirementSchema } = require("../schemas/Requirements");

// Product Model
const requirements = mongoose.model("Requirement", requirementSchema);

// Exporting the Product model
exports.requirements = requirements;
