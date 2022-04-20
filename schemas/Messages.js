// Packages imports
const mongoose = require("mongoose");

// These file extensions are supported by the application
const FileExtensions = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "video/mp4",
  "audio/mp3",
  "audio/m4a",
  "audio/wav",
  "audio/mpeg",
];

// messages Schema
const messagesSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  message: {
    type: String,
    default: "",
  },
  sender_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  reciever_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  message_type: {
    type: String,
    enum: ["text", "file"],
    default: "text",
  },
  message_datetime: { type: Date, default: Date.now },
  read: {
    type: Boolean,
    default: false,
  },
  message_file: {
    _id: String,
    public_id: String,
    mimeType: {
      type: String,
      enum: FileExtensions,
    },
    uri: String,
    height: Number,
    width: Number,
    duration: Number,
  },
});

// Exporting the messages schema
exports.messagesSchema = messagesSchema;
