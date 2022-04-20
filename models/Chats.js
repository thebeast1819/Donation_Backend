// Packages imports
const mongoose = require("mongoose");

// Local imports
const { chatsSchema } = require("../schemas/Chats");

// chats Model
const chats = mongoose.model("Chats", chatsSchema);

// Exporting the chats model
exports.chats = chats;
