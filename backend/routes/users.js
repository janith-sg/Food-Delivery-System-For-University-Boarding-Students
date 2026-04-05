const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const User = require("../models/User");
const { sendRegistrationApprovedEmail } = require("../lib/email");

const router = express.Router();

const STAFF_ROLES = ["Delivery Manager", "Order Manager", "Food Menu Manager"];

// Basic validators (kept here for uni project simplicity)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function digitsOnlyMax10(value) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 10);
}
function isValidEmail(value) {
  return typeof value === "string" && EMAIL_REGEX.test(value.trim());
}
function isValidFullName(value) {
  if (typeof value !== "string") return false;
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2;
}

// Upload config for profile photos
const profileUploadDir = path.join(__dirname, "..", "uploads", "profile-photos");
fs.mkdirSync(profileUploadDir, { recursive: true });

const profileUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, profileUploadDir),
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

function mapRow(u) {
  const reg = u.registrationStatus || "pending";
  const statusLabel =
    reg === "approved" ? "Approved" : reg === "declined" ? "Declined" : "Pending";
  return {
    id: u._id.toString(),
    name: u.fullName,
    email: u.email,
    studentId: u.studentId?.trim() ? u.studentId : "—",
    phone: u.phone,
    accountType: u.accountType,
    role: u.accountType === "customer" ? "Student" : u.staffRole || "Staff",
    staffRole: u.staffRole || "",
    photoUrl: u.studentPhotoUrl || "",
    status: statusLabel,
  };
}

/** Pending registrations only (User Registration tab) */
router.get("/registrations/pending", async (req, res) => {
  try {
    const users = await User.find({
      accountType: { $in: ["customer", "staff"] },
      registrationStatus: "pending",
    })
      .select(
        "fullName email phone accountType studentId studentPhotoUrl staffRole registrationStatus createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json(users.map(mapRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not load registrations." });
  }
});

/** Declined registrations (read-only history on User Registration tab) */
router.get("/registrations/declined", async (req, res) => {
  try {
    const users = await User.find({
      accountType: { $in: ["customer", "staff"] },
      registrationStatus: "declined",
    })
      .select(
        "fullName email phone accountType studentId studentPhotoUrl staffRole registrationStatus createdAt updatedAt"
      )
      .sort({ updatedAt: -1 })
      .lean();

    const rows = users.map((u) => ({
      ...mapRow(u),
      createdAt: u.createdAt,
      declinedAt: u.updatedAt,
    }));

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not load declined registrations." });
  }
});

/** Approved customers (Customer Management) */
router.get("/registered/customers", async (req, res) => {
  try {
    const users = await User.find({
      accountType: "customer",
      registrationStatus: "approved",
    })
      .select("fullName email phone studentId studentPhotoUrl registrationStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const rows = users.map((u) => ({
      id: u._id.toString(),
      name: u.fullName,
      email: u.email,
      phone: u.phone,
      studentId: u.studentId?.trim() ? u.studentId : "—",
      photoUrl: u.studentPhotoUrl || "",
      currentRole: "Customer",
      status: "Active",
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not load customers." });
  }
});

/** Approved staff (Staff Management) */
router.get("/registered/staff", async (req, res) => {
  try {
    const users = await User.find({
      accountType: "staff",
      registrationStatus: "approved",
    })
      .select("fullName email phone staffRole registrationStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const rows = users.map((u) => ({
      id: u._id.toString(),
      name: u.fullName,
      email: u.email,
      phone: u.phone,
      currentRole: u.staffRole || "Staff",
      assignRole: u.staffRole || "Delivery Manager",
      status: "Active",
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not load staff." });
  }
});

/** Update basic profile fields (admin dashboard profile screen). Supports optional profile photo upload. */
router.patch("/:id/profile", (req, res, next) => {
  profileUpload.single("profilePhoto")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || "File upload error.",
        field: "photo",
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body || {};
    const name = String(fullName ?? "").trim();
    const mail = String(email ?? "").trim().toLowerCase();
    const phoneDigits = digitsOnlyMax10(phone);

    if (!name) return res.status(400).json({ message: "Full name is required.", field: "fullName" });
    if (!isValidFullName(name)) {
      return res.status(400).json({
        message: "Enter first and last name (at least two words).",
        field: "fullName",
      });
    }
    if (!mail) return res.status(400).json({ message: "Email is required.", field: "email" });
    if (!isValidEmail(mail)) return res.status(400).json({ message: "Enter a valid email address.", field: "email" });
    if (!phoneDigits) return res.status(400).json({ message: "Phone is required.", field: "phone" });
    if (phoneDigits.length !== 10) {
      return res.status(400).json({ message: "Phone must be exactly 10 digits.", field: "phone" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // If email changes, ensure uniqueness
    if (user.email !== mail) {
      const exists = await User.findOne({ email: mail });
      if (exists) {
        return res.status(409).json({ message: "This email is already registered.", field: "email" });
      }
    }

    user.fullName = name;
    user.email = mail;
    user.phone = phoneDigits;
    if (req.file) {
      user.studentPhotoUrl = `/uploads/profile-photos/${req.file.filename}`;
    }
    await user.save();

    return res.json({
      message: "Profile updated.",
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        accountType: user.accountType,
        phone: user.phone || "",
        studentPhotoUrl: user.studentPhotoUrl || "",
        staffRole: user.staffRole || "",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Update failed." });
  }
});

/** Approve or decline a registration */
router.patch("/:id/registration-status", async (req, res) => {
  try {
    const { status, staffRole } = req.body;
    if (!["approved", "declined"].includes(status)) {
      return res.status(400).json({ message: "status must be approved or declined." });
    }

    const user = await User.findOne({
      _id: req.params.id,
      accountType: { $in: ["customer", "staff"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (status === "approved") {
      if (user.accountType === "staff") {
        const role = String(staffRole || "").trim();
        if (!STAFF_ROLES.includes(role)) {
          return res.status(400).json({
            message: `When approving staff, choose a valid role: ${STAFF_ROLES.join(", ")}.`,
          });
        }
        user.staffRole = role;
      }
      user.registrationStatus = "approved";
    } else {
      user.registrationStatus = "declined";
    }

    await user.save();

    let registrationApprovedEmailSent = null;
    if (status === "approved") {
      const emailResult = await sendRegistrationApprovedEmail({
        to: user.email,
        fullName: user.fullName,
        accountType: user.accountType,
      });
      registrationApprovedEmailSent = emailResult.sent;
    }

    res.json({
      message: "Updated.",
      id: user._id,
      registrationStatus: user.registrationStatus,
      staffRole: user.staffRole,
      ...(registrationApprovedEmailSent !== null && {
        registrationApprovedEmailSent,
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Update failed." });
  }
});

/** Update assigned role for approved staff */
router.patch("/:id/staff-role", async (req, res) => {
  try {
    const { staffRole } = req.body;
    const role = String(staffRole || "").trim();
    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({ message: `staffRole must be one of: ${STAFF_ROLES.join(", ")}.` });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, accountType: "staff", registrationStatus: "approved" },
      { staffRole: role },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.status(404).json({ message: "Staff user not found or not approved." });
    }

    res.json({ message: "Role updated.", id: user._id, staffRole: user.staffRole });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Update failed." });
  }
});

/** Remove customer or staff account (admin) */
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      accountType: { $in: ["customer", "staff"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User removed.", id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Delete failed." });
  }
});

module.exports = router;
