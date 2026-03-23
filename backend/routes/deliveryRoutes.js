const express = require("express");
const router = express.Router();

const {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  deleteDelivery,
  getDeliveryStats,
  getDeliveriesByRider,
  updateDeliveryLocation,
  getRiderStats,
} = require("../controllers/deliveryController");

router.post("/", createDelivery);
router.get("/", getAllDeliveries);
router.get("/:id", getDeliveryById);
router.put("/:id/status", updateDeliveryStatus);
router.delete("/:id", deleteDelivery);
router.get("/stats", getDeliveryStats);
router.get("/rider/:riderId", getDeliveriesByRider);
router.put("/:id/location", updateDeliveryLocation);
router.get("/rider/:riderId/stats", getRiderStats);

module.exports = router;