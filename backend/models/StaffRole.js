const mongoose = require("mongoose");

/** Configurable staff job titles (replaces hard-coded STAFF_ROLES list). */
const staffRoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StaffRole", staffRoleSchema);
