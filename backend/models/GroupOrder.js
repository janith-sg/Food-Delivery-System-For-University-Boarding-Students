
const mongoose = require("mongoose");

// each member in group
const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

// each item added by a member
const groupItemSchema = new mongoose.Schema({
  addedBy: {
    type: String, // member name
    required: true,
  },
  itemId: Number,
  name: String,
  price: Number,
  qty: Number,
});

// bill splitting per member
const splitSchema = new mongoose.Schema({
  memberName: String,
  subTotal: Number,
  deliveryShare: Number,
  total: Number,
});

const groupOrderSchema = new mongoose.Schema(
  {
    groupCode: {
      type: String,
      required: true,
      unique: true,
    },

    title: {
      type: String, // e.g. "Friday Dinner Order"
      required: true,
    },

    createdBy: {
      type: String,
      required: true,
    },

    members: [memberSchema],

    items: [groupItemSchema],

    deliveryFee: {
      type: Number,
      default: 200,
    },

    splitDetails: [splitSchema],

    deadline: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Open", "Closed", "Completed"],
      default: "Open",
    },

    paymentMethod: {
  type: String,
  default: "Cash on Delivery",
},
paymentStatus: {
  type: String,
  default: "Pending",
},
finalTotal: {
  type: Number,
  default: 0,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GroupOrder", groupOrderSchema);
