// package and other modules
const bcrypt = require("bcrypt");
const express = require("express");
const multer = require("multer");

// Local imports
const { CreateOTP } = require("../controllers/OTP");
const { get_auth_token, get_encoded_data, get_dashboard_stats } = require("../controllers/Users");
const messages = require("../config/messages");
const { resetRequests } = require("../models/ResetPassword");
const { SendOTPEmail } = require("../utils/Mailer");
const { UploadToCloudinary, UploadToCloudinaryRemote } = require("../utils/Cloudinary");
const { users } = require("../models/Users");
const { UserAuth } = require("../middlewares/AuthValidator");
const { ValidateRegister } = require("../middlewares/RegisterValidator");
const { ValidateLogin } = require("../middlewares/LoginValidator");
const { VerifyTokenID } = require("../utils/GoogleSignIn");
const { ValidateEditProfile } = require("../middlewares/EditProfileValidator");
const { VERIFICATION_TYPES } = require("../schemas/OTP");

// Initialize router
const router = express.Router();

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint for Login
router.post("/login", ValidateLogin, async (req, res) => {
  try {
    // check if user exists
    const user = await users.findOne({
      email: req.body.email,
    });

    if (!user) return res.status(404).send({ message: messages.accountMissing, isLoggedIn: false });

    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

    if (!isPasswordCorrect)
      return res.status(400).send({ message: messages.invalidCredentials, isLoggedIn: false });

    // If request body has push_notification_token, update it in the database
    if (req.body.push_notification_token) {
      user.push_notification_token = req.body.push_notification_token;
      await user.save();
    }

    // Create userData
    const newUserData = get_encoded_data(user);

    // Return response
    return res.status(200).send({
      user_token: newUserData,
      message: "Login Successfull",
      isLoggedIn: true,
    });
  } catch (error) {
    // Error Response
    return res.status(500).send({ message: messages.serverError, isLoggedIn: false });
  }
});

// Login with Google
router.post("/google-login", async (req, res) => {
  try {
    const verifyResponse = await VerifyTokenID(req.body.id_token);

    if (!verifyResponse.ok) {
      return res.status(500).send({ message: "Invalid ID Token", isLoggedIn: false });
    }

    const user_details = verifyResponse.ticket.getPayload();

    const email = user_details?.email;

    if (!email) return res.status(500).send({ message: "Invalid Email", isLoggedIn: false });

    const user = await users.findOne({
      email: email,
    });

    if (!user)
      return res.status(200).send({
        message: messages.fillRestDetails,
        user_details: {
          email: user_details.email,
          name: user_details.name,
          profile_picture: user_details.picture,
        },
        isLoggedIn: false,
        partial_login: true,
      });

    // If request body has push_notification_token, update it in the database
    if (req.body.push_notification_token) {
      user.push_notification_token = req.body.push_notification_token;
      await user.save();
    }

    const userData = get_encoded_data(user);

    // Response
    return res.status(200).send({
      user_token: userData,
      message: "Logged in successfully..",
      isLoggedIn: true,
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError, isLoggedIn: false });
  }
});

// Endpoint for Register
router.post("/register", upload.single("profile_picture"), ValidateRegister, async (req, res) => {
  try {
    // Check if user with same email already exists
    const user = await users
      .findOne()
      .or([
        { email: req.body.email },
        { phone: req.body.phone },
        { roll_number: req.body.roll_number },
      ]);

    if (user)
      return res.status(400).send({
        message: "Email, Phone and Roll Number should be unique",
        isLoggedIn: false,
      });

    // Else create new user instance
    const newUser = new users(req.body);
    newUser.email_verified = true;

    // Destination for profile_picture
    const destination = `Kolegia/users/${newUser._id}/profile_picture`;
    const isRemoteImage = req.body.remote_profile_picture ?? false;
    const isLocalImage = req.body.profile_picture ?? false;

    if (isRemoteImage || isLocalImage) {
      let uploadResponse;
      // Upload profile_picture if present it req.body
      if (req.body.remote_profile_picture) {
        // Upload to Cloudinary if profile_picture is a url
        uploadResponse = await UploadToCloudinaryRemote(
          req.body.remote_profile_picture,
          destination
        );
      } else if (req.body.profile_picture) {
        // Upload profile_picture to cloudinary if file is buffer
        uploadResponse = await UploadToCloudinary(req.body.profile_picture, destination);
      }

      // If response is ok, update profile_picture in the database
      if (uploadResponse?.secure_url?.length) newUser.profile_picture = uploadResponse.secure_url;
      else return res.status(500).send({ message: messages.serverError, isLoggedIn: false });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    // Create auth_token for a user
    const auth_token = get_auth_token(newUser._id);

    // Assign the auth_token for the user
    newUser.auth_token = auth_token;

    // Save the user
    await newUser.save();

    // Create userData
    const newUserData = get_encoded_data(newUser);

    // Return response
    return res.status(200).send({
      user_token: newUserData,
      message: "Your account has been created successfully..",
      isLoggedIn: true,
    });
  } catch (error) {
    // Error response
    return res.status(500).send({ message: messages.serverError, isLoggedIn: false });
  }
});

// Logout endpoint
router.delete("/logout", UserAuth, async (req, res) => {
  try {
    const user = await users.findOne({ _id: req.body.user_details._id });
    if (!user) return res.status(404).send({ message: messages.accountMissing });

    user.push_notification_token = "";
    await user.save();

    return res.send({ message: messages.loggedtOut });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Change Password endpoint
router.put("/change-password", UserAuth, async (req, res) => {
  try {
    // if CurrentPassword & NewPassword is not present in req.body return error
    if (!req.body.CurrentPassword || !req.body.NewPassword)
      return res.status(400).send({
        message: "Both current password and new password is required",
      });

    let user = await users.findOne({ _id: req.body.user_details._id });
    if (!user) return res.status(404).send({ message: messages.accountMissing });

    const CheckPassword = await bcrypt.compare(req.body.CurrentPassword, user.password);

    if (!CheckPassword) return res.status(400).send({ message: messages.currentPasswordError });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.NewPassword, salt);
    await user.save();

    return res.status(200).send({ message: messages.passwordChanged });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Edit Profile Endpoint
router.put(
  "/edit-profile",
  upload.single("profile_picture"),
  UserAuth,
  ValidateEditProfile,
  async (req, res) => {
    try {
      // Get the user_id
      const user_id = req.body.user_details._id;

      // find the user
      const profile = await users.findById(user_id);
      if (!profile) return res.status(404).send({ message: messages.accountMissing });

      // Check if phone is already taken
      const checkPhone = await users.findOne({
        _id: { $ne: user_id },
        phone: req.body.phone,
      });
      if (checkPhone) return res.status(400).send({ message: `Phone already in use.` });

      // Check if room_number is already in use
      const checkRoomNumber = await users.findOne({
        _id: { $ne: user_id },
        hostel: req.body.hostel,
        room_number: req.body.room_number,
      });
      if (checkRoomNumber)
        return res.status(400).send({
          message: `Room number ${req.body.room_number} for Hostel ${req.body.hostel} already in use with another account. `,
        });

      // Incase we changed to search all together

      // const user = await users.findOne({
      //   _id: { $ne: user_id },
      //   $or: [
      //     { $and: [{ hostel: req.body.hostel }, { room_number: req.body.room_number }] },
      //     { phone: req.body.phone },
      //   ],
      // });

      // Destination for profile_picture
      const destination = `Kolegia/users/${user_id.toString()}/profile_picture`;

      // Map all the fields to update if they exist
      if (req.body.name) profile.name = req.body.name;
      if (req.body.hostel) profile.hostel = req.body.hostel;
      if (req.body.phone) profile.phone = req.body.phone;
      if (req.body.room_number) profile.room_number = req.body.room_number;

      // Upload profile_picture if present it req.body
      if (req.body.profile_picture) {
        let uploadResponse = await UploadToCloudinary(req.body.profile_picture, destination);

        // If response is ok, update profile_picture in the database
        if (uploadResponse?.secure_url?.length) profile.profile_picture = uploadResponse.secure_url;
        else return res.status(500).send({ message: messages.serverError });
      }

      // Create user_token
      const user_token = get_encoded_data(profile);

      // Save the user
      await profile.save();

      return res.send({
        user_token: user_token,
        message: "Updated Profile Successfully.",
      });
    } catch (error) {
      return res.status(500).send({ message: messages.serverError });
    }
  }
);

// Send Email Register First OTP endpoint
router.post("/send-email-register-otp", async (req, res) => {
  try {
    // Check if Body consists of email
    if (!req.body.email) return res.status(400).send({ message: messages.emailRequired });

    // Check if email is already in use
    const user = await users.findOne({ email: req.body.email });
    if (user)
      return res.status(401).send({
        message: messages.associatedAccount,
      });

    // Create new OTP instance
    const newOtp = await CreateOTP(VERIFICATION_TYPES.EMAIL_VERIFICATION);
    if (!newOtp.ok) return res.status(500).send({ message: messages.serverError });

    // Send Email
    const sendMail = await SendOTPEmail({
      to: req.body.email,
      subject: "Email Verification",
      locals: {
        OTP: newOtp.otp,
        operation: "to verify your email address.",
      },
    });

    // If email has been sent successfully
    if (sendMail.ok) {
      return res.send({
        message: "OTP has been sent to your email",
        otp_id: newOtp.otp_id,
      });
    }

    return res.status(500).send({
      message: "Error in sending OTP. Server Error",
    });
  } catch (error) {
    return res.status(500).send({
      message: messages.serverError,
    });
  }
});

// Send Forgot Password OTP Endpoint
router.post("/send-forgot-password-otp", async (req, res) => {
  try {
    // Check if Body consists of email
    if (!req.body.email) return res.status(400).send({ message: messages.emailRequired });

    // Check if email is already in use
    const user = await users.findOne({ email: req.body.email });
    if (!user)
      return res.status(401).send({
        response: "Account with this email does not exist",
      });

    // Create new OTP instance
    const newOtp = await CreateOTP(VERIFICATION_TYPES.FORGOT_PASSWORD);
    if (!newOtp.ok) return res.status(500).send({ message: messages.serverError });

    // Send Email
    const sendMail = await SendOTPEmail({
      to: req.body.email,
      subject: "Password Reset Verification",
      locals: {
        OTP: newOtp.otp,
        operation: "to reset your password.",
      },
    });

    // If email has been sent successfully
    if (sendMail.ok) {
      return res.send({
        message: "OTP has been sent to your email",
        otp_id: newOtp.otp_id,
      });
    }

    return res.status(500).send({
      message: "Error in sending OTP. Server Error",
    });
  } catch (error) {
    return res.status(500).send({
      message: messages.serverError,
    });
  }
});

// Turn off/on push notification for a User depending on the status
router.put("/toggle-push-notifications", UserAuth, async (req, res) => {
  try {
    const user_id = req.body.user_details._id;

    // find the user
    const user = await users.findById(user_id);

    // Update send_push_notification status to opposite
    user.send_push_notification = !user.send_push_notification;

    // Save the user
    await user.save();

    return res.send({
      current_status: user.send_push_notification,
      message: "Status has been updated successfully.",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Reset Password endpoint
router.post("/reset-password", async (req, res) => {
  try {
    if (!req.body.reset_request_id)
      return res.status(400).send({ message: "Reset Request ID is required" });

    if (!req.body.password) return res.status(400).send({ message: "Password is required" });

    if (!req.body.email) return res.status(400).send({ message: "Email is required" });

    // Check if request is valid
    const check_request = await resetRequests.findById(req.body.reset_request_id);
    if (!check_request) return res.status(400).send({ message: "Invalid Request" });

    // Find user
    const user = await users.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({ message: "User does not exist with this Email." });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Delete the request
    await check_request.delete();

    // If request body has push_notification_token, update it in the database
    if (req.body.push_notification_token)
      user.push_notification_token = req.body.push_notification_token;

    // Save the user
    await user.save();

    // Create userData
    const newUserData = get_encoded_data(user);

    // Return response
    return res.status(200).send({
      user_token: newUserData,
      message: "Login Successfull",
      isLoggedIn: true,
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get dashboard Stats
router.get("/get-dashboard-statistics", UserAuth, async (req, res) => {
  try {
    const statsData = await get_dashboard_stats(req);

    return res.send({ stats: statsData, message: "Dashboard Statistics" });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// export router
module.exports = router;
