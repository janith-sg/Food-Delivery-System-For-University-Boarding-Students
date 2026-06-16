const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema(
  {
    conversationRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportConversation",
      required: true,
      index: true,
    },
    senderType: { type: String, enum: ["user", "guest", "admin"], required: true },
    senderRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    senderName: { type: String, default: "", trim: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

supportMessageSchema.index({ conversationRef: 1, createdAt: 1 });

module.exports = mongoose.model("SupportMessage", supportMessageSchema);
