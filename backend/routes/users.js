const express = require("express");
const User = require("../models/User");

const router = express.Router();

const STAFF_ROLES = ["Delivery Manager", "Order Manager", "Food Menu Manager"];

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
      { new: true }
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
