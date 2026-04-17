const mongoose = require("mongoose");

const supportConversationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    guestId: { type: String, default: "", trim: true, index: true },
    guestName: { type: String, default: "", trim: true },
    displayName: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastMessagePreview: { type: String, default: "", trim: true },
    unreadForAdmin: { type: Number, default: 0, min: 0 },
    unreadForUser: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

supportConversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("SupportConversation", supportConversationSchema);
