const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const User = require("../models/User");

const router = express.Router();

/** Two English letters + exactly 8 digits (e.g. IT23419314). */
const STUDENT_ID_REGEX = /^[A-Za-z]{2}\d{8}$/;

const uploadDir = path.join(__dirname, "..", "uploads", "student-ids");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
  },
});

router.post("/", (req, res, next) => {
  upload.single("studentPhoto")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "File upload error." });
    }
    next();
  });
}, async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      accountType,
      studentId,
      staffRole,
    } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password || !phone?.trim()) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    if (!["customer", "staff"].includes(accountType)) {
      return res.status(400).json({ message: "Invalid account type." });
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    let trimmedStudentId = "";
    if (accountType === "customer") {
      trimmedStudentId = String(studentId ?? "").trim();
      if (!trimmedStudentId) {
        return res.status(400).json({ message: "Student ID is required." });
      }
      if (!STUDENT_ID_REGEX.test(trimmedStudentId)) {
        return res.status(400).json({
          message:
            "Student ID must be 2 letters followed by 8 digits (e.g. IT23419314).",
        });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Student ID photo is required." });
      }
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    let studentPhotoUrl = "";
    if (req.file) {
      studentPhotoUrl = `/uploads/student-ids/${req.file.filename}`;
    }

    await User.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      phone: phone.trim(),
      accountType,
      studentId: accountType === "customer" ? trimmedStudentId : "",
      studentPhotoUrl,
      staffRole: accountType === "staff" ? String(staffRole || "").trim() : "",
      registrationStatus: "pending",
    });

    return res.status(201).json({ message: "Your account has been submitted for review." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Registration failed." });
  }
});

module.exports = router;
