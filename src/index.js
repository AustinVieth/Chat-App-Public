const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const Filter = require("bad-words");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const { createTimeStampedMessage } = require("./utils/messages");

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

let welcomeMessage = "Hello! Welcome To The Chat";

io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit(
      "updateMessage",
      createTimeStampedMessage("Admin", welcomeMessage)
    );

    socket.broadcast
      .to(user.room)
      .emit(
        "updateMessage",
        createTimeStampedMessage(
          "Admin",
          `${user.username} Has Joined The Channel`
        )
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callBack) => {
    const filter = new Filter();

    const user = getUser(socket.id);

    if (!user) {
      return callback({ error: 404 });
    }

    if (filter.isProfane(message)) {
      return callBack("Watch Your Profanity");
    }

    io.to(user.room).emit(
      "updateMessage",
      createTimeStampedMessage(user.username, message)
    );
    callBack();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "updateMessage",
        createTimeStampedMessage(
          user.username,
          `${user.username} Has Left The Channel`
        )
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("sendPosition", (position, callBack) => {
    const user = getUser(socket.id);

    if (!user) {
      callback({ error: 404 });
    }

    const { lat, long } = position;
    io.to(user.room).emit(
      "updateLocation",
      createTimeStampedMessage(
        user.username,
        `https://google.com/maps?q=${lat},${long}`
      )
    );
    callBack();
  });
});

app.use(express.static(publicDirectoryPath));

server.listen(port, () => {
  console.log("Server Listening on Port: " + port);
});
