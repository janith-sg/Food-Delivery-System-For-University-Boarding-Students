const express = require("express");
const router = express.Router();

const {
  createGroupOrder,
  joinGroupOrder,
  addItemToGroup,
  getGroupOrderByCode,
  updateGroupItemQty,
  removeGroupItem,
  finalizeGroupOrder,
  getAllGroupOrders,
  updateGroupOrder,
  deleteGroupOrder,
} = require("../controllers/groupOrderController");

router.post("/", createGroupOrder);
router.post("/join", joinGroupOrder);
router.post("/add-item", addItemToGroup);
router.put("/update-item", updateGroupItemQty);
router.put("/finalize", finalizeGroupOrder);
router.delete("/remove-item", removeGroupItem);

router.get("/", getAllGroupOrders);
router.get("/:groupCode", getGroupOrderByCode);

router.put("/:id", updateGroupOrder);
router.delete("/:id", deleteGroupOrder);

module.exports = router;