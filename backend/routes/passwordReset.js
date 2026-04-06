const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const PasswordResetCode = require("../models/PasswordResetCode");
const { getSmtpTransport } = require("../lib/email");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_REGEX.test(value.trim());
}

function make6DigitCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

/** Step 1: Request a code */
router.post("/request", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required.", field: "email" });
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address.", field: "email" });
    }

    const user = await User.findOne({ email }).select("_id email");
    if (!user) {
      // Requirement: show invalid email in form if not registered
      return res.status(400).json({ message: "Invalid email.", field: "email" });
    }

    const code = make6DigitCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await PasswordResetCode.create({
      email,
      userId: user._id,
      codeHash,
      expiresAt,
    });

    const transport = await getSmtpTransport();
    if (!transport) {
      // If SMTP isn't configured, fail clearly (so you can set env vars)
      return res.status(500).json({
        message:
          "Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in backend/.env.",
      });
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    await transport.sendMail({
      from,
      to: email,
      subject: "Reset your UNI EATS password",
      text: `Your UNI EATS password reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn’t request this, you can ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; background:#ffffff; padding:24px; color:#111;">
          <div style="background:#0B8E3A; color:#fff; padding:14px 16px; border-radius:12px; font-weight:700; font-size:16px;">
            UNI EATS
          </div>
          <h2 style="margin:18px 0 8px; font-size:18px;">Password reset code</h2>
          <p style="margin:0 0 14px; color:#333; line-height:1.5;">
            Use the code below to reset your UNI EATS password.
          </p>
          <div style="display:inline-block; background:#f5f5f5; border:1px solid #e5e5e5; padding:14px 16px; border-radius:12px;">
            <div style="font-size:26px; letter-spacing:6px; font-weight:700; color:#111;">
              ${code}
            </div>
          </div>
          <p style="margin:14px 0 0; color:#444;">
            This code expires in <b>10 minutes</b>.
          </p>
          <p style="margin:12px 0 0; color:#666; font-size:12px; line-height:1.5;">
            If you didn’t request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return res.json({ message: "Verification code sent." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Could not send code." });
  }
});

/** Step 2: Verify code */
router.post("/verify", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const code = String(req.body?.code || "").replace(/\D/g, "").slice(0, 6);

    if (!email) return res.status(400).json({ message: "Email is required.", field: "email" });
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address.", field: "email" });
    }
    if (code.length !== 6) {
      return res.status(400).json({ message: "Enter the 6-digit code.", field: "code" });
    }

    const latest = await PasswordResetCode.findOne({
      email,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!latest) {
      return res.status(400).json({ message: "Code expired or not found. Please resend.", field: "code" });
    }

    const ok = await bcrypt.compare(code, latest.codeHash);
    if (!ok) {
      return res.status(400).json({ message: "Invalid code.", field: "code" });
    }

    return res.json({ message: "Code verified." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Verification failed." });
  }
});

/** Step 3: Reset password */
router.post("/reset", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const code = String(req.body?.code || "").replace(/\D/g, "").slice(0, 6);
    const newPassword = String(req.body?.newPassword || "");

    if (!email) return res.status(400).json({ message: "Email is required.", field: "email" });
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address.", field: "email" });
    }
    if (code.length !== 6) {
      return res.status(400).json({ message: "Enter the 6-digit code.", field: "code" });
    }
    if (!newPassword.trim()) {
      return res.status(400).json({ message: "New password is required.", field: "newPassword" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters.", field: "newPassword" });
    }

    const latest = await PasswordResetCode.findOne({
      email,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!latest) {
      return res.status(400).json({ message: "Code expired or not found. Please resend.", field: "code" });
    }

    const ok = await bcrypt.compare(code, latest.codeHash);
    if (!ok) {
      return res.status(400).json({ message: "Invalid code.", field: "code" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email.", field: "email" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.emailVerified = true;
    await user.save();

    latest.usedAt = new Date();
    await latest.save();

    return res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Reset failed." });
  }
});

module.exports = router;

