// Function to validate a body of a request
const ValidateMessageReqBody = (req, res, next) => {
  // Check if room_id exits
  if (!req.body.room_id)
    return res.status(400).send({ message: "Room ID is required" });

  // trim the message
  let trimmed_message = req.body.message?.trim() || "";

  // If req.file exits then it is file otherwise text
  let message_type = req.file?.buffer ? "file" : "text";

  if (message_type === "text")
    if (trimmed_message.length === 0)
      return res.status(400).send({ message: "Message is required" });

  let newBody = {
    ...req.body,
    message: trimmed_message,
    message_type: message_type,
    ...(req.file?.buffer && {
      message_file: {
        mimeType: req.file.mimetype,
        buffer: req.file.buffer,
      },
    }),
  };

  req.body = newBody;

  next();
};

exports.ValidateMessageReqBody = ValidateMessageReqBody;
