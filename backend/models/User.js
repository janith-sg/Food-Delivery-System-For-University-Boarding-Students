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
    /** Shown in Admin → User Registration */
    registrationStatus: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
