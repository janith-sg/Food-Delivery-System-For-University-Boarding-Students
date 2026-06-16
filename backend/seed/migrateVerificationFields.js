const User = require("../models/User");

/**
 * Legacy users had no verification fields. Treat them as email-verified (they already
 * signed up with that email); phone stays unverified until a real SMS flow exists.
 */
async function migrateVerificationFields() {
  const result = await User.updateMany(
    { emailVerified: { $exists: false } },
    { $set: { emailVerified: true, phoneVerified: false } }
  );
  if (result.modifiedCount > 0) {
    console.log(`[migrateVerificationFields] Backfilled flags on ${result.modifiedCount} user(s).`);
  }
}

module.exports = migrateVerificationFields;
