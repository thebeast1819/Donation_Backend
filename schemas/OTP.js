// Packages imports
const mongoose = require("mongoose");

const OTP_TIME_LIMIT = 600; // 10 minutes

const VERIFICATION_TYPES = {
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
};

// Generate an Array for the verification types
const TYPE_ENUM = Object.keys(VERIFICATION_TYPES).map(
  (key) => VERIFICATION_TYPES[key]
);

// OTP Schema Schema
const otpSchema = new mongoose.Schema({
  verification_type: {
    type: String,
    enum: TYPE_ENUM,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
    expires: OTP_TIME_LIMIT,
  },
  otp: {
    type: String,
    required: true,
  },
});

// Exporting the OTP Schema schema
exports.otpSchema = otpSchema;
exports.VERIFICATION_TYPES = VERIFICATION_TYPES;
