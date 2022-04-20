// Packages imports
const mongoose = require("mongoose");

// Local imports
const { otpSchema } = require("../schemas/OTP");

// OTP Model
const OTP = mongoose.model("otp", otpSchema);

// Exporting the OTP model
exports.OTP = OTP;
