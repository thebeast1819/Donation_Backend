// Packages Imports
const { omit } = require("lodash");
const { chats } = require("../models/Chats");
const { buySellItems } = require("../models/BuySellItem");
const { lostFoundItems } = require("../models/LostFoundItem");
const { raisedHands } = require("../models/RaisedHands");
const { requirements } = require("../models/Requirements");
const { users } = require("../models/Users");

// Local imports
const { JWT_Sign } = require("./JWT");

// function to get the user data while logging in
function get_login_payload_data(user = {}) {
  // Create payload
  const payload = omit(user.toObject(), ["password", "admin", "__v", "push_notification_token"]);

  return payload;
}

// encode the user data using JWT key
function get_encoded_data(user = {}) {
  // Create payload
  const payload = get_login_payload_data(user);

  // Return the encoded data
  return JWT_Sign(payload);
}

// create an auth_token by encoding the _id for a user
function get_auth_token(_id) {
  const auth_token = JWT_Sign({ _id });

  return auth_token;
}

// get Dashboard Stats
async function get_dashboard_stats(req) {
  try {
    const user_id = req.body?.user_details?._id;

    // get total lost items
    const lost_items_count = await lostFoundItems.countDocuments({
      found_by_someone: false,
    });

    // get total found items
    const found_items_count = await lostFoundItems.countDocuments({
      found_by_someone: true,
    });

    // get total buy items
    const buy_sell_items_count = await buySellItems.countDocuments();

    // get total required items
    const required_items_count = await requirements.countDocuments();

    // get total users
    const users_count = await users.countDocuments({});

    // get responses count
    const raised_hands_count = await raisedHands.countDocuments({
      product_owner_id: user_id,
      raised_by: { $ne: user_id },
    });

    // get unread messages count
    const unread_messages_count = await chats.countDocuments({
      participants: { $all: [user_id] },
      "last_message.read": false,
      "last_message.reciever_id": user_id,
    });

    // Create Payload
    let payload = {
      lost_items_count,
      found_items_count,
      users_count,
      raised_hands_count,
      unread_messages_count,
      buy_sell_items_count,
      required_items_count,
    };

    return payload;
  } catch (error) {
    return null;
  }
}

// exports
exports.get_login_payload_data = get_login_payload_data;
exports.get_encoded_data = get_encoded_data;
exports.get_auth_token = get_auth_token;
exports.get_dashboard_stats = get_dashboard_stats;
