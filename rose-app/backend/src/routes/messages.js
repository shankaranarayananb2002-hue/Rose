const express = require("express");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Fetch undelivered messages (used on app launch / reconnect for offline sync).
// The server hands back ciphertext + nonce only — it cannot read any of it.
router.get("/pending", requireAuth, async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { recipientId: req.userId, delivered: false },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { username: true, publicKey: true } } },
  });
  await prisma.message.updateMany({
    where: { recipientId: req.userId, delivered: false },
    data: { delivered: true },
  });
  res.json(messages);
});

// Full history with a given contact (for scroll-back on a new device).
router.get("/with/:userId", requireAuth, async (req, res) => {
  const otherId = req.params.userId;
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.userId, recipientId: otherId },
        { senderId: otherId, recipientId: req.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
  res.json(messages);
});

module.exports = router;
