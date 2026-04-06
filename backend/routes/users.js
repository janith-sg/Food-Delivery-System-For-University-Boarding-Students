const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const User = require("../models/User");
const { requireAdmin } = require("../middleware/requireAdmin");
const Notification = require("../models/Notification");
const { sendRegistrationApprovedEmail } = require("../lib/email");
const { toAuthUserPayload } = require("../lib/authUserPayload");

const router = express.Router();

const StaffRole = require("../models/StaffRole");
const { isStaffRoleAllowed, getAllowedStaffRoleNames } = require("../lib/staffRolesAllowed");

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

function isPhone10Digits(value) {
  return digitsOnlyMax10(value).length === 10;
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
      .select(
        "fullName email phone studentId studentPhotoUrl registrationStatus createdAt updatedAt emailVerified phoneVerified"
      )
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
      emailVerified: Boolean(u.emailVerified),
      phoneVerified: Boolean(u.phoneVerified),
      createdAt: u.createdAt ? u.createdAt.toISOString() : null,
      updatedAt: u.updatedAt ? u.updatedAt.toISOString() : null,
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
      .select(
        "fullName email phone staffRole registrationStatus createdAt updatedAt riderId emailVerified phoneVerified studentPhotoUrl accountActive deactivationPeriod"
      )
      .sort({ createdAt: -1 })
      .lean();

    const rows = users.map((u) => {
      const rider = String(u.riderId || "").trim();
      const fallbackNum = (parseInt(u._id.toString().slice(-6), 16) % 998) + 1;
      const staffId = rider || `STF${String(fallbackNum).padStart(3, "0")}`;
      const isActive = u.accountActive !== false;
      return {
        id: u._id.toString(),
        staffId,
        name: u.fullName,
        email: u.email,
        phone: u.phone,
        currentRole: u.staffRole || "Staff",
        assignRole: u.staffRole || "Delivery Manager",
        accountActive: isActive,
        deactivationPeriod: String(u.deactivationPeriod || "").trim(),
        status: isActive ? "Active" : "Deactive",
        emailVerified: Boolean(u.emailVerified),
        phoneVerified: Boolean(u.phoneVerified),
        createdAt: u.createdAt ? u.createdAt.toISOString() : null,
        updatedAt: u.updatedAt ? u.updatedAt.toISOString() : null,
        photoUrl: u.studentPhotoUrl || "",
      };
    });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not load staff." });
  }
});

/** Admin: create an approved staff account directly (no registration queue). */
router.post("/staff/manual", requireAdmin, async (req, res) => {
  try {
    const { fullName, email, password, phone, staffRole, riderId } = req.body || {};

    if (!fullName?.trim()) {
      return res.status(400).json({ message: "Full name is required.", field: "fullName" });
    }
    if (!isValidFullName(fullName)) {
      return res.status(400).json({
        message: "Enter first and last name (at least two words).",
        field: "fullName",
      });
    }
    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required.", field: "email" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address.", field: "email" });
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
    if (!phone?.trim()) {
      return res.status(400).json({ message: "Phone is required.", field: "phone" });
    }
    if (!isPhone10Digits(phone)) {
      return res.status(400).json({
        message: "Phone must be exactly 10 digits (numbers only).",
        field: "phone",
      });
    }

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

    const mail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: mail });
    if (exists) {
      return res.status(409).json({ message: "This email is already registered.", field: "email" });
    }

    const phoneDigits = digitsOnlyMax10(phone);
    const passwordHash = await bcrypt.hash(String(password), 10);

    let rider = String(riderId || "").trim();
    if (role === "Delivery Driver") {
      if (!rider) {
        rider = "RIDER001";
      }
    } else {
      rider = "";
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: mail,
      passwordHash,
      phone: phoneDigits,
      accountType: "staff",
      staffRole: role,
      riderId: rider,
      studentId: "",
      studentPhotoUrl: "",
      registrationStatus: "approved",
      emailVerified: true,
      phoneVerified: false,
    });

    const emailResult = await sendRegistrationApprovedEmail({
      to: user.email,
      fullName: user.fullName,
      accountType: user.accountType,
    });

    return res.status(201).json({
      message: "Staff member created.",
      id: user._id.toString(),
      staffRole: user.staffRole,
      riderId: user.riderId || "",
      registrationApprovedEmailSent: emailResult.sent,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Could not create staff member." });
  }
});

/** Aggregate counts for admin dashboard cards */
router.get("/dashboard/stats", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      registeredCustomers,
      pendingRegistrations,
      pendingCustomers,
      pendingStaff,
      registeredStaff,
      approvedThisMonth,
      unreadNotifications,
      staffRoleDefinitionsCount,
    ] = await Promise.all([
      User.countDocuments({ accountType: "customer", registrationStatus: "approved" }),
      User.countDocuments({
        accountType: { $in: ["customer", "staff"] },
        registrationStatus: "pending",
      }),
      User.countDocuments({ accountType: "customer", registrationStatus: "pending" }),
      User.countDocuments({ accountType: "staff", registrationStatus: "pending" }),
      User.countDocuments({ accountType: "staff", registrationStatus: "approved" }),
      User.countDocuments({
        accountType: { $in: ["customer", "staff"] },
        registrationStatus: "approved",
        updatedAt: { $gte: startOfMonth },
      }),
      Notification.countDocuments({ isRead: false }),
      StaffRole.countDocuments(),
    ]);

    const monthlyTarget = Number(process.env.MONTHLY_NEW_USER_TARGET || "120") || 120;
    const monthlyGoalPercent =
      monthlyTarget > 0 ? Math.min(100, Math.round((approvedThisMonth / monthlyTarget) * 100)) : 0;
    const slotsRemainingTowardGoal = Math.max(0, monthlyTarget - approvedThisMonth);

    const customersTotal = registeredCustomers + pendingCustomers;
    const customerActivationPercent =
      customersTotal > 0 ? Math.round((registeredCustomers / customersTotal) * 100) : 0;

    const staffTotal = registeredStaff + pendingStaff;
    const staffActivationPercent =
      staffTotal > 0 ? Math.round((registeredStaff / staffTotal) * 100) : 0;

    const userRolesCount = staffRoleDefinitionsCount;

    res.json({
      registeredCustomers,
      pendingRegistrations,
      pendingCustomers,
      pendingStaff,
      registeredStaff,
      approvedThisMonth,
      monthlyTarget,
      monthlyGoalPercent,
      slotsRemainingTowardGoal,
      unreadNotifications,
      userRolesCount,
      customerActivationPercent,
      staffActivationPercent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not load dashboard stats." });
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
    const { fullName, email, phone, clearPhoto } = req.body || {};
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

    const prevEmail = user.email;
    const prevPhone = user.phone || "";

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
    if (mail !== prevEmail) {
      user.emailVerified = false;
    }
    if (phoneDigits !== prevPhone) {
      user.phoneVerified = false;
    }
    const shouldClearPhoto =
      String(clearPhoto || "").toLowerCase() === "true" || clearPhoto === true;
    if (shouldClearPhoto) {
      user.studentPhotoUrl = "";
    } else if (req.file) {
      user.studentPhotoUrl = `/uploads/profile-photos/${req.file.filename}`;
    }
    await user.save();

    return res.json({
      message: "Profile updated.",
      user: toAuthUserPayload(user),
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
        if (!(await isStaffRoleAllowed(role))) {
          const names = await getAllowedStaffRoleNames();
          return res.status(400).json({
            message: `When approving staff, choose a valid role: ${names.join(", ") || "(none configured)"}.`,
          });
        }
        user.staffRole = role;
        if (role === "Delivery Driver" && !String(user.riderId || "").trim()) {
          user.riderId = "RIDER001";
        }
      }
      user.registrationStatus = "approved";
      user.emailVerified = true;
      await user.save();

      const emailResult = await sendRegistrationApprovedEmail({
        to: user.email,
        fullName: user.fullName,
        accountType: user.accountType,
      });

      return res.json({
        message: "Updated.",
        id: user._id,
        registrationStatus: user.registrationStatus,
        staffRole: user.staffRole,
        registrationApprovedEmailSent: emailResult.sent,
      });
    }

    // declined
    if (user.accountType === "customer") {
      const removedId = user._id.toString();
      await User.deleteOne({ _id: user._id });
      return res.json({
        message: "Customer registration declined and removed from the system.",
        deleted: true,
        id: removedId,
      });
    }

    user.registrationStatus = "declined";
    await user.save();

    res.json({
      message: "Updated.",
      id: user._id,
      registrationStatus: user.registrationStatus,
      staffRole: user.staffRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Update failed." });
  }
});

/** Activate / deactivate approved staff (admin). Deactivating requires a deactivation period. */
router.patch("/:id/account-active", requireAdmin, async (req, res) => {
  try {
    const { accountActive, deactivationPeriod } = req.body || {};
    const toActive = accountActive !== false && accountActive !== "false";

    const user = await User.findOne({
      _id: req.params.id,
      accountType: "staff",
      registrationStatus: "approved",
    });

    if (!user) {
      return res.status(404).json({ message: "Staff user not found or not approved." });
    }

    if (!toActive) {
      const p = String(deactivationPeriod ?? "").trim();
      if (!["7", "30", "90", "permanent"].includes(p)) {
        return res.status(400).json({
          message: "Select a deactivation period before deactivating this account.",
          field: "deactivationPeriod",
        });
      }
      user.accountActive = false;
      user.deactivationPeriod = p;
    } else {
      user.accountActive = true;
      user.deactivationPeriod = "";
    }

    await user.save();

    res.json({
      message: "Account status updated.",
      id: user._id.toString(),
      accountActive: user.accountActive !== false,
      deactivationPeriod: user.deactivationPeriod || "",
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
    if (!(await isStaffRoleAllowed(role))) {
      const names = await getAllowedStaffRoleNames();
      return res.status(400).json({ message: `staffRole must be one of: ${names.join(", ") || "(none)"}.` });
    }

    const user = await User.findOne({
      _id: req.params.id,
      accountType: "staff",
      registrationStatus: "approved",
    });

    if (!user) {
      return res.status(404).json({ message: "Staff user not found or not approved." });
    }

    user.staffRole = role;
    if (role === "Delivery Driver" && !String(user.riderId || "").trim()) {
      user.riderId = "RIDER001";
    }
    await user.save();

    res.json({ message: "Role updated.", id: user._id, staffRole: user.staffRole, riderId: user.riderId || "" });
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
