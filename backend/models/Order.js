
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      fullName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      note: {
        type: String,
        default: "",
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash on Delivery", "Card Payment"],
      default: "Cash on Delivery",
    },
    items: [orderItemSchema],
    subTotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 400,
    },
    total: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);