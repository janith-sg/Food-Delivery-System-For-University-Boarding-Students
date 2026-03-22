
const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const {
      customer,
      paymentMethod,
      items,
      subTotal,
      deliveryFee,
      total,
    } = req.body;

    if (!customer || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required order data" });
    }

    const newOrder = new Order({
      customer,
      paymentMethod,
      items,
      subTotal,
      deliveryFee,
      total,
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
};