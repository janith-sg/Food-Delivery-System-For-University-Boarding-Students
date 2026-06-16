const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      default: "",
      trim: true,
    },
    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },
    deliveryAddress: {
      type: String,
      default: "",
      trim: true,
    },
    paymentMethod: {
      type: String,
      default: "",
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

    pickupLocation: {
      lat: Number,
      lng: Number
    },
    deliveryLocation: {
      lat: Number,
      lng: Number
    },
    riderLocation: {
      lat: Number,
      lng: Number
    },
    
    deliveryDurationMinutes: {
      type: Number,
      default: 0,
    },
    customerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    customerFeedback: {
      type: String,
      default: "",
      trim: true,
    },
    ratedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);