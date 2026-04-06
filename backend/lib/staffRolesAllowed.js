const StaffRole = require("../models/StaffRole");

/**
 * @param {string} name
 * @returns {Promise<boolean>}
 */
async function isStaffRoleAllowed(name) {
  const n = String(name || "").trim();
  if (!n) return false;
  const doc = await StaffRole.findOne({ name: n });
  return Boolean(doc);
}

/**
 * @returns {Promise<string[]>}
 */
async function getAllowedStaffRoleNames() {
  const roles = await StaffRole.find().sort({ name: 1 }).select("name").lean();
  return roles.map((r) => r.name);
}

module.exports = { isStaffRoleAllowed, getAllowedStaffRoleNames };
