// Packages imports
const mongoose = require("mongoose");

// Local imports
const { resetPasswordSchema } = require("../schemas/ResetPassword");

// resetRequests Model
const resetRequests = mongoose.model("resetrequests", resetPasswordSchema);

// Exporting the resetRequests model
exports.resetRequests = resetRequests;
