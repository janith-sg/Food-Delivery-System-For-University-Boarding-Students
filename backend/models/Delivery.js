const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: String,
      default: "",
      trim: true,
    },
    deliveryPersonId: {
      type: String,
      default: "",
      trim: true,
    },
    deliveryPersonName: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryPersonPhone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Assigned", "Picked Up", "On the Way", "Delivered", "Cancelled"],
      default: "Assigned",
    },
    estimatedDeliveryTime: {
      type: Date,
      default: null,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    currentLocation: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
  type: Number,
  default: null,
},
longitude: {
  type: Number,
  default: null,
},

    notes: {
      type: String,
      default: "",
      trim: true,
    },
    
    deliveryDurationMinutes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);