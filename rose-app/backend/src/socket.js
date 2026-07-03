const jwt = require("jsonwebtoken");
const prisma = require("./db");

// userId -> socket.id, kept in memory. Fine for a single server instance;
// for multiple instances behind a load balancer, back this with Redis pub/sub instead.
const online = new Map();

function initSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    online.set(socket.userId, socket.id);

    socket.on("message:send", async (msg, ack) => {
      // msg = { recipientId, ciphertext, nonce }
      // The server never decrypts this — it only relays and stores ciphertext.
      try {
        const saved = await prisma.message.create({
          data: {
            senderId: socket.userId,
            recipientId: msg.recipientId,
            ciphertext: msg.ciphertext,
            nonce: msg.nonce,
            delivered: false,
          },
        });

        const recipientSocketId = online.get(msg.recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("message:new", {
            id: saved.id,
            senderId: saved.senderId,
            ciphertext: saved.ciphertext,
            nonce: saved.nonce,
            createdAt: saved.createdAt,
          });
          await prisma.message.update({ where: { id: saved.id }, data: { delivered: true } });
        }
        ack?.({ ok: true, id: saved.id });
      } catch (err) {
        console.error(err);
        ack?.({ ok: false, error: "send failed" });
      }
    });

    socket.on("disconnect", () => {
      if (online.get(socket.userId) === socket.id) online.delete(socket.userId);
    });
  });
}

module.exports = { initSocket };
