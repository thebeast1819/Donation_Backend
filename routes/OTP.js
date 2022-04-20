// packages imports
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

// Local imports
const messages = require("../config/messages");
const { OTP } = require("../models/OTP");
const { ValidateOTPBody } = require("../middlewares/OTPValidators");
const { resetRequests } = require("../models/ResetPassword");

// Verify OTP
router.post("/verify-otp", ValidateOTPBody, async (req, res) => {
  try {
    let otpObject = await OTP.findById(req.body.otp_id);

    // if otpObject is not found
    if (!otpObject)
      return res.status(400).send({
        isVerified: false,
        message: "OTP has been expired",
      });

    // If verification type is not matching
    if (otpObject.verification_type !== req.body.verification_type)
      return res.status(400).send({
        isVerified: false,
        message: "OTP Verification Type is Invalid",
      });

    // If OTP is not matching
    const check_otp = await bcrypt.compare(
      req.body.otp.toString(),
      otpObject.otp
    );
    if (!check_otp)
      return res.status(400).send({
        isVerified: false,
        message: "OTP is invalid",
      });

    // Delete the OTP
    await otpObject.delete();

    // Create a ResetRequests Object
    const resetRequestsObj = new resetRequests();
    await resetRequestsObj.save();

    // response
    return res.status(200).send({
      isVerified: true,
      message: "OTP is correct and Email has been verified",
      reset_request_id: resetRequestsObj._id,
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

module.exports = router;
