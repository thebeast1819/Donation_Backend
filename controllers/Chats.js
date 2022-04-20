// Local imports
const { chats } = require("../models/Chats");
const { messages } = require("../models/Messages");
const { UploadToCloudinary } = require("../utils/Cloudinary");

// Fucntion to returnn chatRoom between two users
// or create a chatRoom if it does not exist
async function Get_or_Create_ChatRoom(user_one, user_two, initialMessage) {
  try {
    // Check if Room already exists
    // Check if user_one and user_two is present in the participants array
    let chatRoom = await chats.findOne({
      participants: {
        $all: [user_one, user_two],
      },
    });

    // if chatRoom is not found, create a new chatRoom
    if (!chatRoom) {
      chatRoom = new chats({
        participants: [user_one, user_two],
      });

      await chatRoom.save();
    }

    // If chatRoom exists, then create a new message if initialMessage is not null
    if (initialMessage !== null) {
      let message = new messages({
        room_id: chatRoom._id,
        sender_id: user_one,
        reciever_id: user_two,
        ...initialMessage,
      });

      chatRoom.last_message = message;

      await message.save();
      await chatRoom.save();
    }

    return { room: chatRoom };
  } catch (error) {
    return error;
  }
}

// Upload a file for a chat room and return a payload with desired format
async function UploadChatFile(destination, message_file) {
  try {
    const fileUploadResponse = await UploadToCloudinary(
      message_file.buffer,
      destination
    );

    if (fileUploadResponse?.secure_url) {
      let payload = {
        _id: fileUploadResponse.asset_id,
        uri: fileUploadResponse.secure_url,
        public_id: fileUploadResponse.public_id,
        width: fileUploadResponse.width,
        height: fileUploadResponse.height,
        mimeType: message_file.mimeType,
      };

      // If file type is audio, then add duration property to the payload
      if (message_file?.mimeType?.slice(0, 5) === "audio")
        payload.duration = fileUploadResponse.duration * 1000;

      return { file: payload, message: "File upload Successfull", ok: true };
    } else {
      return { message: "File upload failed", ok: false };
    }
  } catch (error) {
    return { message: "File upload failed", ok: false };
  }
}

// Exports
exports.Get_or_Create_ChatRoom = Get_or_Create_ChatRoom;
exports.UploadChatFile = UploadChatFile;
