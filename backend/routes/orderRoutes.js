const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  downloadOrderAnalyticsPdf,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/report/pdf", downloadOrderAnalyticsPdf);
router.get("/", getAllOrders);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router;