const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.googleApiClientID);

async function VerifyTokenID(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: [
        process.env.googleApiClientID,
        process.env.googleApiClientID_Mobile,
      ],
    });

    return {
      ok: true,
      ticket: ticket,
      message: "Ticket Verified",
    };
  } catch (error) {
    return {
      ok: false,
      message: "Some Error Occured",
      error: error,
    };
  }
}

exports.VerifyTokenID = VerifyTokenID;
