const jwt = require("jsonwebtoken");
const User = require("../models/User");

/** Express middleware: valid Bearer JWT for any user (customer, staff, admin). */
async function requireAuthUser(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server misconfigured." });
    }
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }
    req.authUserDoc = user;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized." });
  }
}

module.exports = { requireAuthUser };
