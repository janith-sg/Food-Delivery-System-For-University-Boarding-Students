const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const User = require("../models/User");
const { isStaffRoleAllowed, getAllowedStaffRoleNames } = require("../lib/staffRolesAllowed");

const router = express.Router();

// --- validation  ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_ID_REGEX = /^[A-Za-z]{2}\d{8}$/;

function digitsOnlyMax10(value) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 10);
}

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_REGEX.test(value.trim());
}

function isPhone10Digits(value) {
  return digitsOnlyMax10(value).length === 10;
}

function isValidStudentId(value) {
  return typeof value === "string" && STUDENT_ID_REGEX.test(value.trim());
}

function isValidFullName(value) {
  if (typeof value !== "string") return false;
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2;
}

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
      return res.status(400).json({
        message: err.message || "File upload error.",
        field: "studentPhoto",
      });
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

    if (!fullName?.trim()) {
      return res.status(400).json({ message: "Full name is required.", field: "fullName" });
    }
    if (!isValidFullName(fullName)) {
      return res.status(400).json({
        message:
          "Enter first and last name (at least two words) (e.g. Senuri Perera).",
        field: "fullName",
      });
    }
    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required.", field: "email" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address.", field: "email" });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ message: "Phone is required.", field: "phone" });
    }
    if (!isPhone10Digits(phone)) {
      return res.status(400).json({
        message: "Phone must be exactly 10 digits (numbers only).",
        field: "phone",
      });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required.", field: "password" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
        field: "password",
      });
    }
    if (!["customer", "staff"].includes(accountType)) {
      return res.status(400).json({ message: "Invalid account type." });
    }

    if (accountType === "staff") {
      const role = String(staffRole ?? "").trim();
      if (!role) {
        return res.status(400).json({ message: "Staff role is required.", field: "staffRole" });
      }
      if (!(await isStaffRoleAllowed(role))) {
        const names = await getAllowedStaffRoleNames();
        return res.status(400).json({
          message: `Choose a valid staff role: ${names.join(", ") || "(none configured)"}.`,
          field: "staffRole",
        });
      }
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.status(409).json({
        message: "This email is already registered.",
        field: "email",
      });
    }

    let trimmedStudentId = "";
    if (accountType === "customer") {
      trimmedStudentId = String(studentId ?? "").trim();
      if (!trimmedStudentId) {
        return res.status(400).json({ message: "Student ID is required.", field: "studentId" });
      }
      if (!isValidStudentId(trimmedStudentId)) {
        return res.status(400).json({
          message:
            "Student ID must be 2 letters followed by 8 digits (e.g. IT23419314).",
          field: "studentId",
        });
      }
      if (!req.file) {
        return res.status(400).json({
          message: "Student ID photo is required.",
          field: "studentPhoto",
        });
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
      phone: digitsOnlyMax10(phone),
      accountType,
      studentId: accountType === "customer" ? trimmedStudentId : "",
      studentPhotoUrl,
      staffRole: accountType === "staff" ? String(staffRole || "").trim() : "",
      registrationStatus: "pending",
      emailVerified: false,
      phoneVerified: false,
    });

    return res.status(201).json({ message: "Your account has been submitted for review." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Registration failed." });
  }
});

module.exports = router;
