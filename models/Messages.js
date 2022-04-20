// Packages imports
const mongoose = require("mongoose");

// Local imports
const { messagesSchema } = require("../schemas/Messages");

// Messages Model
const messages = mongoose.model("Messages", messagesSchema);

// Exporting the Messages model
exports.messages = messages;
