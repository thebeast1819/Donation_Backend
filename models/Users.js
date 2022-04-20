// Packages imports
const mongoose = require("mongoose");

// Local imports
const { userSchema } = require("../schemas/Users");

// Create Model
const users = mongoose.model("users", userSchema);

// Exports
exports.users = users;
