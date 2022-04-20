// package and other modules
const express = require("express");

// Local imports
const { UserAuth } = require("../middlewares/AuthValidator");
const { Get_or_Create_ChatRoom } = require("../controllers/Chats");
const { lostFoundItems } = require("../models/LostFoundItem");
const messages = require("../config/messages");
const { raisedHands } = require("../models/RaisedHands");
const { users } = require("../models/Users");
const { send_push_to_user } = require("../controllers/PushNotifications");

// Initialize router
const router = express.Router();

// raise a hand endpoint
router.post("/raise-hand-on-an-item", UserAuth, async (req, res) => {
  try {
    if (!req.body.product_id)
      return res.status(400).send({ message: messages.product_id_required });

    // Check if product exists
    const product = await lostFoundItems.findById(req.body.product_id);
    if (!product)
      return res.status(400).send({ message: messages.product_id_required });

    // Raised hand user and owner should not be same
    if (req.body.user_details._id.toString() === product.posted_by.toString())
      return res
        .status(400)
        .send({ message: "You cannot raise your own hand" });

    // Check if user has already raised a hand on this product
    const checkRaise = await raisedHands.findOne({
      product_id: req.body.product_id,
      raised_by: req.body.user_details._id,
    });
    if (checkRaise)
      return res.status(400).send({ message: messages.already_raised_hands });

    // Else create the raised hand
    const raisedHand = await raisedHands(req.body);
    raisedHand.raised_by = req.body.user_details._id;
    raisedHand.product_owner_id = product.posted_by;

    await raisedHand.save();

    let payload = raisedHand.toObject();

    let product_details = {
      _id: product._id,
      name: product.name,
      description: product.description,
      files: product.files,
    };
    payload.product_details = product_details;

    let notification_payload = {
      title: `Response Raised`,
      body: `${req.body.user_details.name} has raised a hand on your product with title ${product.name}`,
      imageUrl: process.env.default_product_image,
    };

    if (product.files.length > 0)
      notification_payload.imageUrl = product.files[0].uri;

    await send_push_to_user(product.posted_by, notification_payload);

    // return the raised hand
    return res.send({
      raisedHand: payload,
      message: "Sucessfully raised a hand on this item",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get all responses for a Lost and Found Item you posted.
router.get("/get-raised-responses", UserAuth, async (req, res) => {
  try {
    let user_id = req.body.user_details._id;

    // Get all raised hands for this user by the field of product_owner_id in raisedHands model
    const raisedHandsList = await raisedHands.aggregate([
      // Match product_owner_id with the user_id
      // and raised_by is not equal to the user_id
      {
        $match: {
          product_owner_id: user_id,
          raised_by: { $ne: user_id },
        },
      },
      // Join with the product model
      {
        $lookup: {
          from: "lostfounditems",
          localField: "product_id",
          foreignField: "_id",
          as: "product_details",
        },
      },
      // Get raisedBy details
      {
        $lookup: {
          from: "users",
          localField: "raised_by",
          foreignField: "_id",
          as: "raised_by_details",
        },
      },
      // Unwind the raised_by_details array
      {
        $unwind: "$raised_by_details",
      },
      // Unwind the product_details array
      {
        $unwind: "$product_details",
      },
      // Keep only the required fields
      {
        $project: {
          _id: 1,
          product_id: 1,
          raised_by: 1,
          raised_datetime: 1,
          note: 1,
          product_details: 1,
          raised_by_details: {
            name: 1,
            profile_picture: 1,
          },
        },
      },
    ]);

    return res.send({
      raised_hands: raisedHandsList,
      message: "Successfully fetched raised hands",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get all products on which I raised hand
router.get("/get-raised_by-me-responses", UserAuth, async (req, res) => {
  try {
    let user_id = req.body.user_details._id;

    // Get all raised hands for this user by the field of product_owner_id in raisedHands model
    const raisedHandsList = await raisedHands.aggregate([
      // Match product_owner_id with the user_id
      // and raised_by is not equal to the user_id
      {
        $match: {
          raised_by: user_id,
        },
      },
      // Join with the product model
      {
        $lookup: {
          from: "lostfounditems",
          localField: "product_id",
          foreignField: "_id",
          as: "product_details",
        },
      },
      // unwind the product_details array
      {
        $unwind: "$product_details",
      },
      {
        $project: {
          _id: 1,
          product_id: 1,
          raised_by: 1,
          raised_datetime: 1,
          note: 1,
          product_details: 1,
        },
      },
    ]);

    return res.send({
      raised_hands: raisedHandsList,
      message: "Successfully fetched raised hands by you.",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Accept the raised hand
router.post("/accept-raised-hand", UserAuth, async (req, res) => {
  try {
    // Check if Raised hand request exists
    const raisedHand = await raisedHands.findById(req.body._id);
    if (!raisedHand)
      return res.status(400).send({ message: messages.raised_hand_not_found });

    // Constants
    const owner = req.body.user_details._id;
    const raised_by = raisedHand.raised_by;
    const product_owner_id = raisedHand.product_owner_id;

    // Raised hand owner and user should not be same
    if (owner.toString() === raised_by.toString())
      return res
        .status(400)
        .send({ message: "You cannot accept your own request" });

    if (owner.toString() !== product_owner_id.toString())
      return res
        .status(400)
        .send({ message: "You cannot accept this request" });

    // Get the Product
    const product = await lostFoundItems.findById(raisedHand.product_id);
    if (!product)
      return res
        .status(400)
        .send({ message: "Product ID invalid or maybe deleted." });

    // Construct a message with Item name and Description
    // Also add the note that raisedhand has
    let message = `Lost Found Raised Hand Details\nI\nItem Name - ${product.name}\nDescription - ${product.description}\n\nNote - ${raisedHand.note}`;

    // get_or_create the chatRoom
    const getChatRoom = await Get_or_Create_ChatRoom(raised_by, owner, {
      message,
    });

    // get the details of the person who raised hands
    const raised_by_details = await users.findById(raised_by);
    if (!raised_by_details)
      return res.status(400).send({ message: "User not Found" });

    // Delete the raised hand request as soon as it is accepted
    await raisedHand.delete();

    // return the chat room
    return res.send({
      room_id: getChatRoom.room._id,
      raised_by_details: {
        _id: raised_by,
        name: raised_by_details.name,
        profile_picture: raised_by_details.profile_picture,
        phone: raised_by_details.phone,
      },
      message: "Accepted the Raised hand request",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Reject the raised hand
router.delete("/reject-raised-hand", UserAuth, async (req, res) => {
  try {
    // Check if Raised hand request exists
    const raisedHand = await raisedHands.findById(req.body._id);
    if (!raisedHand)
      return res.status(400).send({ message: messages.raised_hand_not_found });

    let user_id = req.body.user_details._id.toString();
    let raised_by = raisedHand.raised_by.toString();
    let product_owner_id = raisedHand.product_owner_id.toString();

    // Check if user_id is equal to raised_by or product_owner_id
    if (user_id !== raised_by && user_id !== product_owner_id)
      return res.status(400).send({ message: messages.unauthorized });

    // Delete the raised hand request
    await raisedHand.delete();

    return res.send({ message: "Request Deleted" });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// export router
module.exports = router;
