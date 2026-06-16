const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    seq: { type: Number, required: true, unique: true, index: true },
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
