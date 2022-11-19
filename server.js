const express = require("express");
const { ExpressPeerServer } = require("peer");

const app = express();
const server = require("http").Server(app);
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomID: req.params.room });
});

const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

io.on("connection", (socket) => {
  socket.on("join-room", (ROOMID, userId) => {
    socket.join(ROOMID);
    socket.broadcast.to(ROOMID).emit("user-connected", userId);
    socket.on("disconnect", () => {
      socket.broadcast.to(ROOMID).emit("user-disconnect", userId);
    });
  });
});
server.listen(process.env.PORT || 5000);
