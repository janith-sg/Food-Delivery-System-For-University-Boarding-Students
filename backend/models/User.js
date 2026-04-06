const mongoose = require("mongoose");

/** Simple user document for registration (password stored hashed). */
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    accountType: { type: String, enum: ["customer", "staff", "admin"], required: true },
    studentId: { type: String, default: "" },
    studentPhotoUrl: { type: String, default: "" },
    staffRole: { type: String, default: "" },
    /** Matches `deliveryPersonId` on deliveries (e.g. RIDER001) — used by delivery drivers. */
    riderId: { type: String, default: "" },
    /** Shown in Admin → User Registration */
    registrationStatus: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
    /** Set true after inbox is proven (e.g. password reset via email). Cleared when email changes. */
    emailVerified: { type: Boolean, default: false },
    /** Reserved for SMS/OTP; false until implemented. */
    phoneVerified: { type: Boolean, default: false },
    /** Staff/customer login allowed; admins should stay true. */
    accountActive: { type: Boolean, default: true },
    /** When deactivated: "7" | "30" | "90" | "permanent" (admin UI). */
    deactivationPeriod: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
