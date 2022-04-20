// Packages imports
const mongoose = require("mongoose");

const TIME_LIMTI = 600; // 10 minutes

// ResetPassword Schema
const resetPasswordSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
    expires: TIME_LIMTI,
  },
});

// Exporting the ResetPassword schema
exports.resetPasswordSchema = resetPasswordSchema;
