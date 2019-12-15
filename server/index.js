const express = require("express");
const socket = require("socket.io");
// const path = require('path');
const app = express();
// const fs = require('fs');
// const multer = require("multer");

server = app.listen(5000, () => console.log("server is running on port 5000"));

const getTimestamp = () => {
  let today = new Date();
  let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return date + " " + time
}

let on = 1;
let images = [];
let times = [];
io = socket(server);

io.on("connection", socket => {
  socket.emit("SOCKET", socket.id);
  socket.emit("ON_VALUE", on);
  io.emit("IMAGES", images, times);

  // Toggle power
  socket.on("TOGGLE_ON", () => {
    if (on === 0) on = 1;
    else on = 0;
    io.emit("ON_VALUE", on);
  });

  // Set Images
  socket.on("TAKE_PICTURE", image => {
    if (images.length < 10) {
      images.unshift(image);
      times.unshift(getTimestamp());
    } else {
      images = images.shift();
      images.unshift(image);
      times = times.shift();
      times.unshift(getTimestamp());
    }
    io.emit("IMAGES", images, times);
  })

  socket.on("CLEAR_IMAGES", () => {
    images = [];
    io.emit("IMAGES", []);
  })
});

