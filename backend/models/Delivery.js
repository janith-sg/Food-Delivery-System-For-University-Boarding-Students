const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
  type: String,
  required: true,
  unique: true,
  },
    deliveryPersonName: {
      type: String,
      required: true,
    },
    deliveryPersonPhone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Assigned", "Picked Up", "On the Way", "Delivered", "Cancelled"],
      default: "Assigned",
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    pickedUpAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    currentLocation: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);