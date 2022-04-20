// Packages imports
const bcrypt = require("bcrypt");
const { random } = require("lodash");

// Local Imports
const { OTP } = require("../models/OTP");
const { VERIFICATION_TYPES } = require("../schemas/OTP");

// Create an OTP instance
async function CreateOTP(verification_type) {
  try {
    // Check if the verification type is valid
    if (!Object.values(VERIFICATION_TYPES).includes(verification_type))
      return { ok: false };

    // Create new OTP instance
    const newOtp = new OTP({
      verification_type: VERIFICATION_TYPES[verification_type],
    });

    // Genereate OTP
    const OTP_Random = random(100000, 999999).toString();

    // Hash the otp
    const salt = await bcrypt.genSalt(10);
    newOtp.otp = await bcrypt.hash(OTP_Random, salt);

    // Save the OTP instance
    await newOtp.save();

    return { otp_id: newOtp._id, otp: OTP_Random, ok: true };
  } catch (error) {
    return { ok: false };
  }
}

exports.CreateOTP = CreateOTP;
