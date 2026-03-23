const Delivery = require("../models/Delivery");
const Notification = require("../models/Notification");


// Create a new delivery
const createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ message: "Failed to create delivery", error: error.message });
  }
};

// Get all deliveries
const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find().populate("orderId");
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch deliveries", error: error.message });
  }
};

// Get one delivery by ID
const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate("orderId");

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch delivery", error: error.message });
  }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, currentLocation, userId } = req.body;

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { status, currentLocation },
      { new: true }
    );

    if (!updatedDelivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    let notificationMessage = "";

    if (status === "Assigned") {
      notificationMessage = "Your order has been assigned to a delivery person.";
    } else if (status === "Picked Up") {
      notificationMessage = "Your order has been picked up.";
    } else if (status === "On the Way") {
      notificationMessage = "Your order is now on the way.";
    } else if (status === "Delivered") {
      notificationMessage = "Your order has been delivered.";
    } else if (status === "Cancelled") {
      notificationMessage = "Your delivery has been cancelled.";
    }

    if (userId && notificationMessage) {
      await Notification.create({
        userId,
        title: "Delivery Update",
        message: notificationMessage,
        type: "delivery",
      });
    }

    res.status(200).json(updatedDelivery);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update delivery",
      error: error.message,
    });
  }
};

// Delete delivery
const deleteDelivery = async (req, res) => {
  try {
    const deletedDelivery = await Delivery.findByIdAndDelete(req.params.id);

    if (!deletedDelivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({ message: "Delivery deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete delivery", error: error.message });
  }
};

module.exports = {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  deleteDelivery,
};