// function to validate the feedback post body
const FeedbackValidate = (req, res, next) => {
  if (!req.body.feedback) return res.status(400).send({ message: "Feedback is required" });

  if (typeof req.body.feedback !== "string")
    return res.status(400).send({ message: "Feedback must be a string" });

  const wordsCount = req.body.feedback.split(" ").length;

  if (wordsCount < 2 || wordsCount > 200)
    return res.status(400).send({ message: "Feedback must be between 5 and 200 words" });

  next();
};

// Exports
exports.FeedbackValidate = FeedbackValidate;
