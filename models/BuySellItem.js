// Packages imports
const mongoose = require("mongoose");

// Local imports
const { buySellItemSchema } = require("../schemas/BuySellItem");

// buySellItems Model
const buySellItems = mongoose.model("BuySellItems", buySellItemSchema);

// Exporting the buySellItems model
exports.buySellItems = buySellItems;
