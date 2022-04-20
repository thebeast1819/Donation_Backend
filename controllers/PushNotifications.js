// Packages Imports
const { users } = require("../models/Users");
const { SendPushNotification } = require("../utils/PushNotification");

// Send a Push notification to a user if he/she has allowed it
async function send_push_to_user(user_id, body) {
  try {
    // Get user who posted the product
    const user = await users.findById(user_id);

    if (!user) return;

    if (!user.send_push_notification) return;

    let notification_payload = {
      push_token: user.push_notification_token,
      ...body,
    };

    const response = await SendPushNotification(notification_payload);

    return response;
  } catch (error) {}
}

exports.send_push_to_user = send_push_to_user;
