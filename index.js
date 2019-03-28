const path = require("path");
const sequencer = require("./sequencer");
const express = require("express");
const app = express();
const http = require("http").Server(app);
// const io = require("socket.io")(http);
const convertRange = require("./convertRange");
const port = 5000;
const testSequence2 = require("./testSequence2");
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "public")));

app.post("/toggle", (req, res) => {
  sequencer.toggle();
  res.json(sequencer.info());
});

app.post("/seq", (req, res) => {
  res.json({});
});

http.listen(port, console.log(`listening on *:${port}`));

sequencer.setSequence(testSequence2);
sequencer.toggle();
