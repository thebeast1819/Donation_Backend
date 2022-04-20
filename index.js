// Importing Packages
const express = require("express");
const favicon = require("serve-favicon");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Utils/Configs imports
const config = require("./config/config");
const { CreateIndexes } = require("./config/ModelIndexes");
const messages = require("./config/messages");

// Socket Setup
const http = require("http");
const socketio = require("socket.io");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/Socket");

// Routes imports
const BuySellItem = require("./routes/BuySellItem");
const Chats = require("./routes/Chats");
const Feedbacks = require("./routes/Feedback");
const OTP = require("./routes/OTP");
const LostFoundItems = require("./routes/LostFoundItems");
const RaisedHands = require("./routes/RaisedHands");
const Requirements = require("./routes/Requirements");
const User = require("./routes/Users");

// Connect to MongoDB
mongoose
  .connect(config.db_url, config.db_config)
  .then(() => {
    console.log(`Connected to ${process.env.DB_Name} Mongo DB...`);
    CreateIndexes();
  })
  .catch(error => console.error(messages.serverError, error));

// Express app initialization
const app = express();

// Configuring Express to use static files
app.use(express.static(path.join(__dirname, "/public")));
app.use(favicon(__dirname + "/favicon.ico"));

// Configuring Express app for production
require("./config/Production")(app);

// Wrapping Express app with Socket.io
const server = http.createServer(app);
const io = socketio(server);

// Socket listeners
io.on("connection", socket => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", msg);
  });

  socket.on("type-update", msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("type-update-emitter", msg);
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// Add routes
app.use(process.env.apiVersion + process.env.buysell, BuySellItem);
app.use(process.env.apiVersion + process.env.chats, Chats);
app.use(process.env.apiVersion + process.env.feedback, Feedbacks);
app.use(process.env.apiVersion + process.env.otp, OTP);
app.use(process.env.apiVersion + process.env.lostfound, LostFoundItems);
app.use(process.env.apiVersion + process.env.raisedhands, RaisedHands);
app.use(process.env.apiVersion + process.env.requirements, Requirements);
app.use(process.env.apiVersion + process.env.auth, User);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname + "/views/404.html"));
});

// Server listening on port
server.listen(config.Port, () =>
  console.log(`Mode = ${process.env.NODE_ENV} and Listening on ${config.Port}..`)
);
