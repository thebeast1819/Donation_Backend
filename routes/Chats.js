// package and other modules
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

// Local imports
const { UserAuth } = require("../middlewares/AuthValidator");
const { chats } = require("../models/Chats");
const { messages } = require("../models/Messages");
const MESSAGES = require("../config/messages");
const { ValidateMessageReqBody } = require("../middlewares/MessagesValidator");

const {
  Get_or_Create_ChatRoom,
  UploadChatFile,
} = require("../controllers/Chats");

// Initialize router
const router = express.Router();

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Get or Create a chat room between two users
router.post("/get-or-create-chat-room", UserAuth, async (req, res) => {
  try {
    if (!req.body.reciever_id)
      return res.status(400).send({ message: "Reciever id is required" });

    const chatRoom = await Get_or_Create_ChatRoom(
      req.body.user_details._id,
      req.body.reciever_id,
      req.body.initial_message ?? null
    );

    return res.send({ ...chatRoom, message: "Chat Room Created" });
  } catch (error) {
    return res.status(500).send({ message: MESSAGES.serverError });
  }
});

// Get chats for a user
router.get("/get-chats", UserAuth, async (req, res) => {
  try {
    const user_id = req.body.user_details._id;
    // Get all chats of the user
    // Get objects in which the user_id is in participants array
    const allChats = await chats.aggregate([
      {
        $match: {
          participants: { $all: [user_id] },
        },
      },
      // Sort by last_modified
      {
        $sort: {
          last_modified: -1,
        },
      },
      {
        $addFields: {
          other_user: {
            $filter: {
              input: "$participants",
              as: "participant",
              cond: { $ne: ["$$participant", user_id] },
            },
          },
        },
      },
      // Change other_user to user_details
      {
        $lookup: {
          from: "users",
          localField: "other_user",
          foreignField: "_id",
          as: "chatting_with",
        },
      },
      // change chatting_with array to object
      {
        $unwind: {
          path: "$chatting_with",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Remove unnecessary fields from chatting_with object
      {
        $project: {
          _id: 1,
          last_message: 1,
          chatting_with: {
            _id: "$chatting_with._id",
            name: "$chatting_with.name",
            profile_picture: "$chatting_with.profile_picture",
            phone: "$chatting_with.phone",
          },
        },
      },
    ]);

    return res.send({ Chats: allChats, message: "List of all chats" });
  } catch (error) {
    return res.status(500).send({ message: MESSAGES.serverError });
  }
});

// Get messages for a chat room in batches
// If after _id is provided in query parameters, it will return messages after that _id
// Also get it in descending order of _id, i.e, from the latest message to the oldest message
router.get("/get-messages", UserAuth, async (req, res) => {
  try {
    // Check if chat room id is provided
    if (!req.query.room_id)
      return res.status(400).send({ message: "Chat room id is required" });

    let room_id = mongoose.Types.ObjectId(req.query.room_id);

    const chatRoom = await chats.findById(room_id);
    if (!chatRoom) return res.status(400).send({ message: "Chat Missing" });

    // count of messages to be returned
    const count = req.query.count ? parseInt(req.query.count) : 10;

    // no of messages to be skipped
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;

    // Write the same query using aggregation pipeline
    const messages_list = await messages.aggregate([
      {
        $match: { room_id: room_id },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: count,
      },
    ]);

    return res
      .status(200)
      .send({ messages_count: messages_list.length, messages: messages_list });
  } catch (error) {
    return res.status(500).send({ message: MESSAGES.serverError });
  }
});

// Create a message.
router.post(
  "/send-message",
  upload.single("file"),
  UserAuth,
  ValidateMessageReqBody,
  async (req, res) => {
    try {
      // Room ID
      let room_id = req.body.room_id;

      // Check if room exists
      let chatRoom = await chats.findById(room_id);
      if (!chatRoom)
        return res.status(400).send({ message: MESSAGES.chatMissing });

      let user_id = req.body.user_details._id;
      let participants = chatRoom.participants;

      // get reciever_id
      let reciever_id =
        participants[0].toString() === user_id.toString()
          ? participants[1]
          : participants[0];

      // create newMessage object
      const newMessage = new messages({
        ...req.body,
        sender_id: user_id,
        reciever_id: reciever_id,
      });

      if (req.body.message_type === "file") {
        const destination = `Kolegia/chats/${room_id}/`;

        const uploaded_file = await UploadChatFile(
          destination,
          req.body.message_file
        );

        if (uploaded_file.ok) {
          newMessage.message_file = uploaded_file.file;
        } else return res.status(500).send({ message: MESSAGES.serverError });
      }

      // update the message_file in chatRoom
      chatRoom.last_message = newMessage;

      // Save the message
      await newMessage.save();

      if (req.body.message_datetime) {
        chatRoom.last_modified = req.body.message_datetime;
      } else {
        chatRoom.last_modified = new Date();
      }

      // Save the chatRoom
      await chatRoom.save();

      return res
        .status(200)
        .send({ newMessage: newMessage, message: "Message sent" });
    } catch (error) {
      return res.status(500).send({ message: MESSAGES.serverError });
    }
  }
);

// Update all messages where reciever_id is equal to req.body.user_details._id as read, and chatRoom _id is req.body.room_id
router.put("/mark-as-read", UserAuth, async (req, res) => {
  try {
    let room_id = req.body.room_id;

    if (!room_id)
      return res.status(400).send({ message: "Room id is required" });

    const chatRoom = await chats.findOne({ _id: req.body.room_id });
    if (!chatRoom)
      return res.status(400).send({ message: MESSAGES.chatMissing });

    let user_id = req.body.user_details._id;
    let reciever_id = chatRoom.last_message.reciever_id;

    await messages.updateMany(
      {
        room_id: room_id,
        reciever_id: user_id,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    // Update the last_message.read to true field in the chatRoom document if user is the reciever
    if (reciever_id.toString() === user_id.toString()) {
      chatRoom.last_message = {
        ...chatRoom.last_message,
        read: true,
      };

      await chatRoom.save();
    }

    return res
      .status(200)
      .send({ message: "You have read all messages in this Chat Room." });
  } catch (error) {
    return res.status(500).send({ message: MESSAGES.serverError });
  }
});

// export router
module.exports = router;
