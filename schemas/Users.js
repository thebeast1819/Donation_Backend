// Packages imports
const mongoose = require("mongoose");



// Create Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  phone: {
    type: String,
    required: true,
    length: 10,
  },
  address: {
    type: String,
    required: true,
  },
  dob:{
type: Date,
required: true,

  },
  gender: {
    type: String,
    required: true,
   
  },
  typeofuser: {
    type: String,
    required: true,
   
  },
  year: {
    type: String,
    required: true,
    
  },
  roll_number: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
   
  },
  hostel: {
    type: String,
    required: true,
    
  },
  room_number: {
    type: String,
    required: true,
  },
  profile_picture: {
    type: String,
    default: process.env.default_profile_picture,
  },
  auth_token: {
    type: String,
    default: "",
  },
  push_notification_token: {
    type: String,
    default: "",
  },
  send_push_notification: {
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
    required: true,
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
});

// Exports
exports.userSchema = userSchema;
