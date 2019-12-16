const express = require("express");
const socket = require("socket.io");
const app = express();
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cors = require('cors')
const webpush = require('web-push')

dotenv.config()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

webpush.setVapidDetails(process.env.WEB_PUSH_CONTACT, process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY)

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
    io.emit("PICTURE_TAKEN", "");
    io.emit("IMAGES", images, times);
  })

  socket.on("CLEAR_IMAGES", () => {
    images = [];
    io.emit("IMAGES", []);
  })
});

// Notifications
app.post('/notifications/subscribe', (req, res) => {
  const data = req.body;

  const payload = JSON.stringify({
    title: data.title,
    body: data.body
  });

  webpush.sendNotification(data.subscription, payload)
    .then(result => console.log(result))
    .catch(e => console.log(e.stack))

  res.status(200).json({'success': true})
});

