const express = require("express");
const socket = require("socket.io");

const app = express();

server = app.listen(5000, () => console.log("server is running on port 5000"));

let on = 0;
io = socket(server);

io.on("connection", socket => {
  socket.emit("SOCKET", socket.id);
  socket.on("TOGGLE_ON", () => {
    if (on === 0) on = 1;
    else on = 0;
    socket.emit("ON_VALUE", on);
  });
});