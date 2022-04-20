// Packages Imports
const { buySellItems } = require("../models/BuySellItem");
const { lostFoundItems } = require("../models/LostFoundItem");

// Create Indexes for Models
async function CreateIndexes() {
  // Create index for BuySellItem
  buySellItems.collection.createIndex({
    name: "text",
    description: "text",
  });

  // Create index for LostFoundItem
  lostFoundItems.collection.createIndex({
    name: "text",
    description: "text",
    brand: "text",
    category: "text",
    color: "text",
  });
}

// exports
exports.CreateIndexes = CreateIndexes;
