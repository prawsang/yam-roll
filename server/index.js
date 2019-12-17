const express = require("express");
const Gpio = require('onoff').Gpio;
const socket = require("socket.io");
const app = express();
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cors = require('cors')
const webpush = require('web-push')
const fs = require('fs')
const cam = require('raspicam');
var c = new cam({ mode: "photo", output: "photo.jpg", w: 1920, h: 1080 });

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

// let on = 1;
let images = [];
let times = [];
io = socket(server);
let on = 0;

io.on("connection", socket => {
  let LEDPin = new Gpio(4, 'out'); //declare GPIO4 an output  

  socket.emit("SOCKET", socket.id);
  socket.emit("ON_VALUE", on);
  io.emit("IMAGES", images, times);

  // Check GPIO
  checkIO = () => {
    let previousIO = 0;
    setInterval(() => {
      if (on === 1) {
        // If on
        let UlPin = new Gpio(14, 'in');
        let currentIO = UlPin.readSync();
        if (currentIO != previousIO) {
          previousIO = currentIO
        }
        setTimeout(() => {
          if (currentIO == 1) {
            socket.emit("TAKE_PICTURE")
          }
        }, 1000)
      }
    }, 100)
  }
  checkIO();

  // Toggle power
  socket.on("TOGGLE_ON", () => {
    var Gpio = require('onoff').Gpio; //require onoff to control GPIO
    var LEDPin = new Gpio(4, 'out'); //declare GPIO4 an output 
    on = LEDPin.readSync();
    if (on === 0) {
      LEDPin.writeSync(1);
      on = 1;
    }
    else {
      LEDPin.writeSync(0);
      on = 0
    }
    // console.log(on);
    io.emit("ON_VALUE", on);
  });

  // Set Images
  socket.on("TAKE_PICTURE", () => {
    c.start();
    c.on("read", () => {
        var image = new Buffer(fs.readFileSync("./photo.jpg")).toString("base64");
        fn(image);
        c.stop();
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
    });
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

