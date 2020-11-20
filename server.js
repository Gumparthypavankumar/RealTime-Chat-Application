const path = require("path");
const http = require("http");
const express = require("express");
const app = express();
const socketio = require("socket.io");
const formatMessage = require("./utils/formatMessage");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const server = http.createServer(app);
const io = socketio(server);
const AppName = "Chat app";

//Middleware
app.use(express.json());

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Run when client is connected
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // Socket.emit will just emit to the user who is connected
    socket.emit(
      "message",
      formatMessage(AppName, "Welcome to the chat application")
    );

    // BroadCast when a user connects
    // Socket.broadcast.emit will emit the event to evryone expect the user who is connected
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(AppName, `${username} has Joined a chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for ChatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //When client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      // If you want to emit an event to everyone using application then use io.emit()
      io.to(user.room).emit(
        "message",
        formatMessage(AppName, `${user.username} has left the chat`)
      );
    }

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
