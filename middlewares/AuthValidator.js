// Imported local modules
const { JWT_Verify } = require("../controllers/JWT");
const messages = require("../config/messages");
const { users } = require("../models/Users");

// function to check if the request has user authorization
const UserAuth = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization;

    if (authToken) {
      let result = authToken.split(" ");

      if (result.length !== 2)
        return res.status(403).send({ message: messages.tokenMissing });

      const Token = JWT_Verify(result[1]);

      if (Token) {
        const user = await users.findById(Token._id);

        if (!user)
          return res.status(403).send({ message: messages.unauthorized });

        req.body.user_details = {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile_picture: user.profile_picture,
        };

        next();
      } else return res.status(403).send({ message: messages.unauthorized });
    } else return res.status(403).send({ message: messages.tokenMissing });
  } catch (error) {
    return res.status(501).send({ message: messages.serverError });
  }
};

// Exports
exports.UserAuth = UserAuth;
