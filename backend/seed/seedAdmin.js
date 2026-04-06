const bcrypt = require("bcryptjs");
const User = require("../models/User");

/**
 * Syncs the admin user from .env on every server start.
 * Ensures ADMIN_EMAIL always has accountType "admin" and password from ADMIN_PASSWORD
 * (fixes cases where the same email was registered earlier as student/staff).
 */
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD != null ? String(process.env.ADMIN_PASSWORD).trim() : "";

  if (!email || !password) {
    console.warn("[seedAdmin] Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to enable admin login.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const phoneRaw = (process.env.ADMIN_PHONE || "0000000000").replace(/\D/g, "").slice(0, 10);
  const phone = phoneRaw.length === 10 ? phoneRaw : "0000000000";

  const result = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        fullName: process.env.ADMIN_NAME?.trim() || "System Admin",
        passwordHash,
        phone,
        accountType: "admin",
        studentId: "",
        studentPhotoUrl: "",
        staffRole: "",
        registrationStatus: "approved",
        emailVerified: true,
        phoneVerified: false,
        accountActive: true,
        deactivationPeriod: "",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log("[seedAdmin] Admin user synced:", result.email, "(accountType: admin)");
}

module.exports = seedAdmin;
