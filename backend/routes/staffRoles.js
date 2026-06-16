const express = require("express");
const User = require("../models/User");
const StaffRole = require("../models/StaffRole");

const router = express.Router();

/** List roles with display index and user counts */
router.get("/", async (req, res) => {
  try {
    const roles = await StaffRole.find().sort({ createdAt: 1 }).lean();
    const rows = await Promise.all(
      roles.map(async (r, i) => {
        const userCount = await User.countDocuments({
          accountType: "staff",
          registrationStatus: "approved",
          staffRole: r.name,
        });
        return {
          id: r._id.toString(),
          roleId: i + 1,
          roleName: r.name,
          description: r.description || "",
          createdAt: r.createdAt ? r.createdAt.toISOString() : null,
          userCount,
        };
      })
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not load roles." });
  }
});

/** Plain name list for dropdowns */
router.get("/names", async (req, res) => {
  try {
    const roles = await StaffRole.find().sort({ name: 1 }).select("name").lean();
    res.json(roles.map((r) => r.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not load role names." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body || {};
    const n = String(name || "").trim();
    if (!n) {
      return res.status(400).json({ message: "Role name is required." });
    }
    const doc = await StaffRole.create({
      name: n,
      description: String(description || "").trim(),
    });
    res.status(201).json({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A role with this name already exists." });
    }
    console.error(err);
    res.status(500).json({ message: err.message || "Could not create role." });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { name, description } = req.body || {};
    const role = await StaffRole.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    const oldName = role.name;
    if (name !== undefined) {
      const newName = String(name).trim();
      if (!newName) {
        return res.status(400).json({ message: "Role name cannot be empty." });
      }
      if (newName !== oldName) {
        if (newName.toLowerCase() === "customer") {
          return res.status(400).json({
            message: '"Customer" is reserved for student accounts and cannot be used as a staff role name.',
          });
        }
        const exists = await StaffRole.findOne({ name: newName, _id: { $ne: role._id } });
        if (exists) {
          return res.status(409).json({ message: "Another role already has this name." });
        }
        await User.updateMany(
          { accountType: "staff", staffRole: oldName },
          { $set: { staffRole: newName } }
        );
        role.name = newName;
      }
    }
    if (description !== undefined) {
      role.description = String(description).trim();
    }
    await role.save();
    res.json({
      message: "Role updated.",
      id: role._id.toString(),
      name: role.name,
      description: role.description,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not update role." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const role = await StaffRole.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }
    const count = await User.countDocuments({
      accountType: "staff",
      registrationStatus: "approved",
      staffRole: role.name,
    });
    if (count > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${count} staff member(s) still have this role. Reassign them first.`,
      });
    }
    await StaffRole.deleteOne({ _id: role._id });
    res.json({ message: "Role deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not delete role." });
  }
});

module.exports = router;
