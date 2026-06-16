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
  updateDeliveryRating,
  assignRiderToDelivery,
} = require("../controllers/deliveryController");

router.post("/", createDelivery);
router.get("/", getAllDeliveries);
router.get("/stats", getDeliveryStats);
router.get("/rider/:riderId", getDeliveriesByRider);
router.get("/rider/:riderId/stats", getRiderStats);
router.get("/:id", getDeliveryById);
router.put("/:id/status", updateDeliveryStatus);
router.put("/:id/location", updateDeliveryLocation);
router.put("/:id/rating", updateDeliveryRating);
router.put("/:id/assign-rider", assignRiderToDelivery);
router.delete("/:id", deleteDelivery);

module.exports = router;