// Packages imports
const mongoose = require("mongoose");

// Local imports
const { lostFoundSchema } = require("../schemas/LostFoundItem");

// lostFoundItems Model
const lostFoundItems = mongoose.model("LostFoundItems", lostFoundSchema);

// Exporting the lostFoundItems model
exports.lostFoundItems = lostFoundItems;
