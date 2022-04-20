// packages Imports
const jwt = require("jsonwebtoken");

// function to encode an object
function JWT_Sign(payload) {
  // Return the encoded data
  return jwt.sign(payload, process.env.JWT_Key);
}

// function to verify a JWT Token
function JWT_Verify(token) {
  const isTokenValid = jwt.verify(token, process.env.JWT_Key);

  return isTokenValid;
}

// Exports
exports.JWT_Sign = JWT_Sign;
exports.JWT_Verify = JWT_Verify;
