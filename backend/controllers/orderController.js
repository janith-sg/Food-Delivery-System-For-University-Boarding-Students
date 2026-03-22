const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const { customer, paymentMethod, items, subTotal, deliveryFee, total } = req.body;

    if (!customer || !customer.fullName || !customer.phone || !customer.address) {
      return res.status(400).json({ message: "Customer details are required" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
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

module.exports = { createOrder };