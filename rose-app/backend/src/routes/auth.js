const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db");

const router = express.Router();

// Register: client generates an X25519 keypair on-device FIRST,
// keeps the private key in secure storage, and only sends the public key here.
router.post("/register", async (req, res) => {
  const { username, email, password, publicKey } = req.body;
  if (!username || !email || !password || !publicKey) {
    return res.status(400).json({ error: "username, email, password, publicKey are required" });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, publicKey },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Username or email already taken" });
    }
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

module.exports = router;
