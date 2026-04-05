const GroupOrder = require("../models/GroupOrder");

// helper to generate group code
const generateGroupCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// create group order
const createGroupOrder = async (req, res) => {
  try {
    const { title, createdBy, deadline } = req.body;

    if (!title || !createdBy) {
      return res.status(400).json({
        message: "Title and creator name are required",
      });
    }

    const groupCode = generateGroupCode();

    const newGroupOrder = new GroupOrder({
      groupCode,
      title,
      createdBy,
      members: [{ name: createdBy }],
      items: [],
      splitDetails: [],
      deadline,
      status: "Open",
    });

    const savedGroupOrder = await newGroupOrder.save();

    res.status(201).json({
      message: "Group order created successfully",
      groupOrder: savedGroupOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create group order",
      error: error.message,
    });
  }
};

const joinGroupOrder = async (req, res) => {
  try {
    const { groupCode, name } = req.body;

    const group = await GroupOrder.findOne({ groupCode });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const alreadyMember = group.members.find((m) => m.name === name);
    if (!alreadyMember) {
      group.members.push({ name });
    }

    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addItemToGroup = async (req, res) => {
  try {
    const { groupCode, item } = req.body;

    const group = await GroupOrder.findOne({ groupCode });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.items.push(item);

    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroupOrderByCode = async (req, res) => {
  try {
    const { groupCode } = req.params;

    const group = await GroupOrder.findOne({ groupCode });

    if (!group) {
      return res.status(404).json({ message: "Group order not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch group order",
      error: error.message,
    });
  }
};

const updateGroupItemQty = async (req, res) => {
  try {
    const { groupCode, itemId, action } = req.body;

    const group = await GroupOrder.findOne({ groupCode });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const item = group.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (action === "increase") {
      item.qty += 1;
    } else if (action === "decrease") {
      if (item.qty > 1) {
        item.qty -= 1;
      } else {
        item.deleteOne();
      }
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await group.save();
    res.json(group);
  } catch (error) {
    console.error("updateGroupItemQty error:", error);
    res.status(500).json({ message: error.message });
  }
};

const removeGroupItem = async (req, res) => {
  try {
    const { groupCode, itemId } = req.body;

    const group = await GroupOrder.findOne({ groupCode });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const item = group.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.deleteOne();

    await group.save();
    res.json(group);
  } catch (error) {
    console.error("removeGroupItem error:", error);
    res.status(500).json({ message: error.message });
  }
};

const finalizeGroupOrder = async (req, res) => {
  try {
    const { groupCode, paymentMethod } = req.body;

    const group = await GroupOrder.findOne({ groupCode });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.items || group.items.length === 0) {
      return res.status(400).json({ message: "Cannot finalize empty group order" });
    }

    const subTotal = group.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const deliveryFee = group.deliveryFee || 400;
    const finalTotal = subTotal + deliveryFee;

    const memberTotals = {};
    group.items.forEach((item) => {
      memberTotals[item.addedBy] = (memberTotals[item.addedBy] || 0) + item.price * item.qty;
    });

    const members = Object.keys(memberTotals);
    const deliveryShare = members.length > 0 ? deliveryFee / members.length : 0;

    group.splitDetails = members.map((member) => ({
      memberName: member,
      subTotal: memberTotals[member],
      deliveryShare,
      total: memberTotals[member] + deliveryShare,
    }));

    group.status = "Completed";
    group.paymentMethod = paymentMethod || "Cash on Delivery";
    group.paymentStatus =
      group.paymentMethod === "Card Payment" ? "Paid" : "Pending";
    group.finalTotal = finalTotal;

    await group.save();

    res.json({
      message: "Group order completed successfully",
      group,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllGroupOrders = async (req, res) => {
  try {
    const groups = await GroupOrder.find().sort({ createdAt: -1 });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch group orders",
      error: error.message,
    });
  }
};

const updateGroupOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, paymentMethod } = req.body;

    const updatedGroupOrder = await GroupOrder.findByIdAndUpdate(
      id,
      { status, paymentStatus, paymentMethod },
      { new: true }
    );

    if (!updatedGroupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    res.status(200).json({
      message: "Group order updated successfully",
      groupOrder: updatedGroupOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update group order",
      error: error.message,
    });
  }
};

const deleteGroupOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedGroupOrder = await GroupOrder.findByIdAndDelete(id);

    if (!deletedGroupOrder) {
      return res.status(404).json({ message: "Group order not found" });
    }

    res.status(200).json({
      message: "Group order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete group order",
      error: error.message,
    });
  }
};

module.exports = {
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
};