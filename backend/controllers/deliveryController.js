const Delivery = require("../models/Delivery");
const Notification = require("../models/Notification");

// Simulated delivery staff pool
const deliveryStaffPool = [
  { id: "RIDER001", name: "Kamal Perera", phone: "0771234567" },
  { id: "RIDER002", name: "Nimal Silva", phone: "0719876543" },
  { id: "RIDER003", name: "Saman Kumara", phone: "0755551234" },
];

// Create a new delivery
const createDelivery = async (req, res) => {
  try {
    const { orderId, studentId, currentLocation, notes } = req.body;

    const randomStaff = deliveryStaffPool[0];

    const now = new Date();
    const eta = new Date(now.getTime() + 30 * 60000);

    const delivery = await Delivery.create({
      orderId,
      studentId: studentId || "",
      deliveryPersonId: randomStaff.id,
      deliveryPersonName: randomStaff.name,
      deliveryPersonPhone: randomStaff.phone,
      status: "Assigned",
      estimatedDeliveryTime: eta,
      assignedAt: now,
      currentLocation,
      notes: notes || "",
    });

    // Notify the rider when a delivery is assigned
    await Notification.create({
      userId: randomStaff.id,
      title: "New Delivery Assigned",
      message: `A new delivery (${orderId}) has been assigned to you.`,
      type: "delivery",
    });

    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create delivery",
      error: error.message,
    });
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
    const { status, currentLocation } = req.body;

    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    delivery.status = status || delivery.status;
    delivery.currentLocation = currentLocation || delivery.currentLocation;

    if (status === "Picked Up" && !delivery.pickedUpAt) {
      delivery.pickedUpAt = new Date();
    }

    if (status === "Delivered" && !delivery.deliveredAt) {
      delivery.deliveredAt = new Date();

      if (delivery.pickedUpAt) {
        const durationMs = delivery.deliveredAt - delivery.pickedUpAt;
        delivery.deliveryDurationMinutes = Math.round(durationMs / 60000);
      }
    }

    await delivery.save();

    let customerMessage = "";

    if (status === "Picked Up") {
      customerMessage = "Your order has been picked up by the rider.";
    } else if (status === "On the Way") {
      customerMessage = "Your order is now on the way.";
    } else if (status === "Delivered") {
      customerMessage = "Your order has been delivered.";
    } else if (status === "Cancelled") {
      customerMessage = "Your delivery has been cancelled.";
    }

    // Notify customer only for delivery progress updates
    if (delivery.studentId && customerMessage) {
      await Notification.create({
        userId: delivery.studentId,
        title: "Delivery Update",
        message: customerMessage,
        type: "delivery",
      });
    }

    res.status(200).json(delivery);
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

// Get deliveries by rider ID
const getDeliveriesByRider = async (req, res) => {
  try {
    const { riderId } = req.params;

    const deliveries = await Delivery.find({
      deliveryPersonId: riderId,
    }).sort({ createdAt: -1 });

    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch rider deliveries",
      error: error.message,
    });
  }
};

// Update delivery location
const updateDeliveryLocation = async (req, res) => {
  try {
    const { currentLocation, latitude, longitude } = req.body;

    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    delivery.currentLocation = currentLocation || delivery.currentLocation;
    delivery.latitude = latitude ?? delivery.latitude;
    delivery.longitude = longitude ?? delivery.longitude;

    await delivery.save();

    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update delivery location",
      error: error.message,
    });
  }
};

// Get rider performance stats
const getRiderStats = async (req, res) => {
  try {
    const { riderId } = req.params;

    const riderDeliveries = await Delivery.find({
      deliveryPersonId: riderId,
    });

    const totalAssigned = riderDeliveries.length;
    const active = riderDeliveries.filter((d) =>
      ["Assigned", "Picked Up", "On the Way"].includes(d.status)
    ).length;
    const delivered = riderDeliveries.filter(
      (d) => d.status === "Delivered"
    ).length;
    const cancelled = riderDeliveries.filter(
      (d) => d.status === "Cancelled"
    ).length;

    const completedWithDuration = riderDeliveries.filter(
      (d) => d.status === "Delivered" && d.deliveryDurationMinutes > 0
    );

    const averageDeliveryTime =
      completedWithDuration.length > 0
        ? Math.round(
            completedWithDuration.reduce(
              (sum, d) => sum + d.deliveryDurationMinutes,
              0
            ) / completedWithDuration.length
          )
        : 0;

    res.status(200).json({
      riderId,
      totalAssigned,
      active,
      delivered,
      cancelled,
      averageDeliveryTime,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch rider stats",
      error: error.message,
    });
  }
};

// Get overall delivery stats
const getDeliveryStats = async (req, res) => {
  try {
    const deliveries = await Delivery.find();

    const total = deliveries.length;
    const assigned = deliveries.filter((d) => d.status === "Assigned").length;
    const pickedUp = deliveries.filter((d) => d.status === "Picked Up").length;
    const onTheWay = deliveries.filter((d) => d.status === "On the Way").length;
    const delivered = deliveries.filter((d) => d.status === "Delivered").length;
    const cancelled = deliveries.filter((d) => d.status === "Cancelled").length;

    const completedDeliveries = deliveries.filter(
      (d) => d.status === "Delivered" && d.deliveryDurationMinutes > 0
    );

    const averageDeliveryTime =
      completedDeliveries.length > 0
        ? Math.round(
            completedDeliveries.reduce(
              (sum, d) => sum + d.deliveryDurationMinutes,
              0
            ) / completedDeliveries.length
          )
        : 0;

    res.status(200).json({
      total,
      assigned,
      pickedUp,
      onTheWay,
      delivered,
      cancelled,
      averageDeliveryTime,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch delivery stats",
      error: error.message,
    });
  }
};

module.exports = {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  deleteDelivery,
  getDeliveryStats,
  getDeliveriesByRider,
  updateDeliveryLocation,
  getRiderStats,
};