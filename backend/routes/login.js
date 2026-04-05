const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server missing JWT_SECRET." });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, role: user.accountType },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        accountType: user.accountType,
        phone: user.phone || "",
        studentPhotoUrl: user.studentPhotoUrl || "",
        staffRole: user.staffRole || "",
        riderId: user.riderId || "",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Login failed." });
  }
});

module.exports = router;
