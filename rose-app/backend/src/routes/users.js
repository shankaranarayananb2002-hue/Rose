const express = require("express");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Look up a contact's public key by username, so a client can encrypt to them.
router.get("/lookup/:username", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: { id: true, username: true, publicKey: true },
  });
  if (!user) return res.status(404).json({ error: "No user with that username" });
  res.json(user);
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, username: true, email: true, publicKey: true },
  });
  res.json(user);
});

module.exports = router;
