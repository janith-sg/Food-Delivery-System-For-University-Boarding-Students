const mongoose = require("mongoose");

const passwordResetCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// TTL: MongoDB will automatically delete expired docs (runs in background)
passwordResetCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PasswordResetCode", passwordResetCodeSchema);

