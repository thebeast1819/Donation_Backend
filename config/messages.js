const messages = {
  // General
  serverError: "Server Error. Please try again Later",
  unauthorized:
    "You are not authorized to access this link. Contact the admin of the Kolegia for more information.",
  tokenMissing: "Authentication Token Required",

  // Product
  product_not_found: "Product Not Found",
  product_deleted: "Product Deleted",
  product_id_required: "Product ID Required",
  product_not_LOST_FOUND: "Product is NOT a LOST_FOUND item",
  prod_marked_already: "Product is already marked as found",
  prod_marked_as_found: "Product marked as found",

  // Raised Hands
  raised_hand_not_found: "Raised hand request does not exist",
  already_raised_hands:
    "You have already raised a hand on this product. Wait for the owner to respond",

  // Auth
  accountMissing: "Account with this Email does not exist!",
  emailRequired: "Email is Required",
  currentPasswordError: "Invalid Current Password",
  invalidCredentials: "Invalid Credentials",
  emailAlreadyInUse: "Account with this Email already exist.",
  UsernameAlreadyInUse: "Account with this Username already exist.",
  passwordChanged: "Password Changed Successfully",
  accountDeleted: "Account Deleted Successfully",
  loggedtOut: "Logged Out Successfully",
  associatedAccount: `There's an account associated with this email. Proceed to login.`,
  fillRestDetails: "Get all other details filled",

  // Files
  fileMissing: "File Missing",
  filerequired: "Atleast one file is required",
  fileArrayRequired: "File Array Required",

  // chats
  chatMissing: "Chat Not Found",
  invalidChatCreation: "Cannot Create a chat room with yourself",
  chatDeleted: "Chat Deleted Successfully",
};

module.exports = messages;
