require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const { initSocket } = require("./socket");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
initSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Rose backend listening on :${PORT}`));
