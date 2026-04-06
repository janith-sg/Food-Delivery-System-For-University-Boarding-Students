const StaffRole = require("../models/StaffRole");
const STAFF_ROLES = require("../constants/staffRoles");

const DESCRIPTIONS = {
  "Delivery Manager": "Coordinate deliveries and rider assignments.",
  "Order Manager": "Manage customer orders and order workflows.",
  "Food Menu Manager": "Maintain menus, items, and pricing.",
  "Delivery Driver": "Fulfill deliveries to customers.",
};

/**
 * Seeds StaffRole documents from legacy constants if collection is empty.
 */
async function seedStaffRoles() {
  try {
    const n = await StaffRole.countDocuments();
    if (n > 0) return;
    for (const name of STAFF_ROLES) {
      await StaffRole.create({
        name,
        description: DESCRIPTIONS[name] || `Staff role: ${name}`,
      });
    }
    console.log("StaffRole seed: inserted default roles.");
  } catch (err) {
    console.error("StaffRole seed failed:", err.message);
  }
}

module.exports = seedStaffRoles;
