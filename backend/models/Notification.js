const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
  type: String,
  required: true,
  },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    deliveryId: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["order", "delivery", "payment", "general"],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);