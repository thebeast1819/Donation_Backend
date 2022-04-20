// Packages imports
const mongoose = require("mongoose");

// Local imports
const { raisedHandsSchema } = require("../schemas/RaisedHands");

// Product Model
const raisedHands = mongoose.model("RaisedHands", raisedHandsSchema);

// Exporting the Product model
exports.raisedHands = raisedHands;
