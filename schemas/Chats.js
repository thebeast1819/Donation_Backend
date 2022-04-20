const mongoose = require("mongoose");

// chatsSchema
const chatsSchema = new mongoose.Schema({
  participants: {
    type: [mongoose.Schema.ObjectId],
    required: true,
  },
  last_message: {
    type: Object,
    default: null,
  },
  last_modified: {
    type: Date,
    default: Date.now,
  },
});

exports.chatsSchema = chatsSchema;
