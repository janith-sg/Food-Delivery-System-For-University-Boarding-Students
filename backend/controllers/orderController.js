const Order = require("../models/Order");
const PDFDocument = require("pdfkit");

const createOrder = async (req, res) => {
  try {
    const {
  customer,
  paymentMethod,
  paymentStatus,
  items,
  subTotal,
  deliveryFee,
  total,
} = req.body;

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
  paymentStatus: paymentStatus || (paymentMethod === "Card Payment" ? "Paid" : "Pending"),
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

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const downloadOrderAnalyticsPdf = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};

      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) {
          filter.createdAt.$gte = fromDate;
        }
      }

      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = toDate;
        }
      }

      if (Object.keys(filter.createdAt).length === 0) {
        delete filter.createdAt;
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    const dailyIncomeMap = orders.reduce((acc, order) => {
      const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
      acc[dateKey] = (acc[dateKey] || 0) + Number(order.total || 0);
      return acc;
    }, {});

    const dailyIncome = Object.entries(dailyIncomeMap)
      .map(([date, income]) => ({ date, income }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    const filenameDate = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="order-analytics-report-${filenameDate}.pdf"`
    );

    const doc = new PDFDocument({ margin: 34, size: "A4", bufferPages: true });
    doc.pipe(res);

    const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`;
    const formatDateTime = (value) => {
      const date = new Date(value);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const ensurePageSpace = (required = 70) => {
      if (doc.y + required > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
      }
    };

    const colors = {
      ink: "#0F172A",
      muted: "#64748B",
      line: "#E2E8F0",
      emerald: "#059669",
      emeraldSoft: "#ECFDF5",
      sky: "#0284C7",
      skySoft: "#EFF6FF",
      amber: "#D97706",
      amberSoft: "#FFFBEB",
      violet: "#7C3AED",
      violetSoft: "#F5F3FF",
      rose: "#E11D48",
      roseSoft: "#FFF1F2",
      slateSoft: "#F8FAFC",
      white: "#FFFFFF",
    };

    const statusAccent = (status) => {
      if (status === "Delivered") return { bar: colors.emerald, soft: colors.emeraldSoft };
      if (status === "Out for Delivery") return { bar: colors.amber, soft: colors.amberSoft };
      if (status === "Preparing") return { bar: colors.violet, soft: colors.violetSoft };
      if (status === "Confirmed") return { bar: colors.sky, soft: colors.skySoft };
      return { bar: colors.rose, soft: colors.roseSoft };
    };

    const drawTopBand = () => {
      doc.save();
      doc.rect(0, 0, doc.page.width, 18).fill(colors.ink);
      doc.restore();
    };

    const drawHeader = () => {
      drawTopBand();
      doc.fillColor(colors.ink);
      doc.fontSize(22).font("Helvetica-Bold").text("Order Analytics Report", 34, 32);
      doc.fontSize(10).fillColor(colors.muted).text("Daily income and full order details export", 34, 58);

      const badgeX = 360;
      const badgeY = 28;
      doc.roundedRect(badgeX, badgeY, 198, 38, 10).fill(colors.slateSoft).stroke(colors.line);
      doc.fillColor(colors.ink).fontSize(8).font("Helvetica-Bold").text("REPORT RANGE", badgeX + 14, badgeY + 9);
      doc.fillColor(colors.muted).fontSize(9).font("Helvetica").text(`${from || "All"} to ${to || "All"}`, badgeX + 14, badgeY + 21);
      doc.fillColor(colors.muted).fontSize(8).text(formatDateTime(new Date()), badgeX + 118, badgeY + 21, { align: "right", width: 66 });

      doc.moveDown(2.8);
    };

    const drawStatCard = (x, y, w, h, accent, soft, label, value, hint, iconLabel) => {
      doc.save();
      doc.roundedRect(x, y, w, h, 14).fill(colors.white).stroke(colors.line);
      doc.roundedRect(x, y, w, 6, 14).fill(accent);
      doc.roundedRect(x + w - 46, y + 14, 32, 32, 10).fill(soft).stroke(soft);
      doc.fillColor(accent).fontSize(11).font("Helvetica-Bold").text(iconLabel, x + w - 46, y + 23, { width: 32, align: "center" });
      doc.fillColor(colors.muted).fontSize(9).font("Helvetica-Bold").text(label, x + 14, y + 18);
      doc.fillColor(colors.ink).fontSize(20).font("Helvetica-Bold").text(value, x + 14, y + 36);
      doc.fillColor(colors.muted).fontSize(8.5).font("Helvetica").text(hint, x + 14, y + 60, { width: w - 60 });
      doc.restore();
    };

    const drawSectionTitle = (title, subtitle, y) => {
      doc.roundedRect(34, y, 527, 28, 10).fill(colors.slateSoft).stroke(colors.line);
      doc.fillColor(colors.ink).fontSize(12).font("Helvetica-Bold").text(title, 48, y + 8);
      if (subtitle) {
        doc.fillColor(colors.muted).fontSize(8.3).font("Helvetica").text(subtitle, 210, y + 9, {
          width: 330,
          align: "right",
        });
      }
    };

    const drawKeyValueRow = (label, value, x, y, width = 250, labelWidth = 78) => {
      doc.fillColor(colors.muted).fontSize(8).font("Helvetica-Bold").text(label, x, y, { width: labelWidth });
      doc.fillColor(colors.ink).fontSize(9.2).font("Helvetica").text(value || "—", x + labelWidth, y, {
        width: width - labelWidth,
      });
    };

    const drawOrderCard = (order, index) => {
      const accent = statusAccent(order.orderStatus);
      const items = Array.isArray(order.items) ? order.items : [];
      const customer = order.customer || {};
      const baseHeight = 142 + Math.min(items.length, 4) * 14 + (customer.note ? 18 : 0);

      ensurePageSpace(baseHeight + 20);

      const startY = doc.y;
      doc.save();
      doc.roundedRect(34, startY, 527, baseHeight, 14).fill(colors.white).stroke(colors.line);
      doc.roundedRect(34, startY, 527, 6, 14).fill(accent.bar);
      doc.restore();

      doc.fillColor(colors.ink).fontSize(10.5).font("Helvetica-Bold").text(`Order #${index + 1}`, 48, startY + 16);
      doc.fillColor(colors.muted).fontSize(8.5).font("Helvetica").text(`ID: ${order._id}`, 100, startY + 16);

      doc.roundedRect(470, startY + 12, 76, 22, 8).fill(accent.soft).stroke(accent.bar);
      doc.fillColor(accent.bar).fontSize(8).font("Helvetica-Bold").text(order.orderStatus || "Pending", 470, startY + 18, { width: 76, align: "center" });

      doc.fillColor(colors.muted).fontSize(8.4).font("Helvetica").text(`Placed: ${formatDateTime(order.createdAt)}`, 48, startY + 34);

      const leftX = 48;
      const rightX = 298;
      const colWidth = 224;

      drawKeyValueRow("Customer", customer.fullName || "N/A", leftX, startY + 52, colWidth);
      drawKeyValueRow("Phone", customer.phone || "N/A", leftX, startY + 66, colWidth);
      drawKeyValueRow("Address", customer.address || "N/A", leftX, startY + 80, 450);

      drawKeyValueRow("Payment", order.paymentMethod || "Cash on Delivery", rightX, startY + 52, colWidth);
      drawKeyValueRow("Payment Status", order.paymentStatus || "Pending", rightX, startY + 66, colWidth);
      drawKeyValueRow("Subtotal", formatCurrency(order.subTotal), rightX, startY + 80, colWidth);

      doc.fillColor(colors.muted).fontSize(8).font("Helvetica-Bold").text("Items", leftX, startY + 102);

      if (items.length === 0) {
        doc.fillColor(colors.muted).fontSize(8.5).font("Helvetica").text("No items in this order.", 84, startY + 102);
      } else {
        const visibleItems = items.slice(0, 4);
        visibleItems.forEach((item, itemIndex) => {
          const itemY = startY + 102 + itemIndex * 14;
          const qty = Number(item.qty || 0);
          const price = Number(item.price || 0);
          doc.fillColor(colors.ink).fontSize(8.5).font("Helvetica").text(`• ${item.name || "Unnamed Item"}`, 84, itemY, { width: 250 });
          doc.fillColor(colors.muted).fontSize(8).text(`Qty ${qty}`, 334, itemY, {
            width: 45,
            align: "right",
          });
          doc.fillColor(colors.muted).fontSize(8).text(formatCurrency(price), 382, itemY, {
            width: 68,
            align: "right",
          });
          doc.fillColor(colors.ink).fontSize(8).font("Helvetica-Bold").text(formatCurrency(qty * price), 458, itemY, {
            width: 194,
            align: "right",
          });
        });

        if (items.length > 4) {
          doc.fillColor(colors.muted).fontSize(8).font("Helvetica-Oblique").text(`+ ${items.length - 4} more items`, 84, startY + 102 + 4 * 14);
        }
      }

      if (customer.note) {
        const noteY = startY + baseHeight - 30;
        doc.roundedRect(48, noteY - 2, 495, 20, 8).fill(colors.amberSoft).stroke("#FCD34D");
        doc.fillColor("#92400E").fontSize(8).font("Helvetica").text(`Note: ${customer.note}`, 56, noteY + 4, { width: 479 });
      }

      const totalsY = startY + baseHeight - 24;
      doc.roundedRect(360, totalsY - 4, 182, 22, 8).fill(colors.slateSoft).stroke(colors.line);
      doc.fillColor(colors.muted).fontSize(7.8).font("Helvetica-Bold").text("Delivery Fee", 372, totalsY + 2, { width: 70 });
      doc.fillColor(colors.ink).fontSize(8.2).font("Helvetica").text(formatCurrency(order.deliveryFee), 442, totalsY + 2, {
        width: 46,
        align: "right",
      });
      doc.fillColor(colors.emerald).fontSize(8.2).font("Helvetica-Bold").text("Total", 490, totalsY + 2, { width: 28 });
      doc.fillColor(colors.emerald).fontSize(10.2).font("Helvetica-Bold").text(formatCurrency(order.total), 520, totalsY + 1, {
        width: 34,
        align: "right",
      });

      doc.y = startY + baseHeight + 12;
    };

    drawHeader();

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    ensurePageSpace(120);
    const statsY = doc.y;
    const cardWidth = 125;
    const cardGap = 13;
    const cardX1 = 34;
    const cardX2 = cardX1 + cardWidth + cardGap;
    const cardX3 = cardX2 + cardWidth + cardGap;
    const cardX4 = cardX3 + cardWidth + cardGap;

    drawStatCard(cardX1, statsY, cardWidth, 82, colors.sky, colors.skySoft, "Total Orders", String(totalOrders), "All orders in the selected range", "#");
    drawStatCard(cardX2, statsY, cardWidth, 82, colors.emerald, colors.emeraldSoft, "Revenue", formatCurrency(totalRevenue), "Gross total order value", "₹");
    drawStatCard(cardX3, statsY, cardWidth, 82, colors.violet, colors.violetSoft, "Daily Income", String(dailyIncome.length), "Dates with recorded income", "D");
    drawStatCard(cardX4, statsY, cardWidth, 82, colors.amber, colors.amberSoft, "Avg Order", formatCurrency(averageOrderValue), "Average order value", "A");
    doc.y = statsY + 98;

    drawSectionTitle("Daily Income Breakdown", "Grouped by order date", doc.y);
    doc.y += 40;

    if (dailyIncome.length === 0) {
      doc.fillColor(colors.muted).fontSize(9).font("Helvetica").text("No data available for selected date range.", 48, doc.y);
      doc.y += 18;
    } else {
      dailyIncome.forEach((entry, index) => {
        ensurePageSpace(24);
        const isEven = index % 2 === 0;
        const maxIncome = Math.max(...dailyIncome.map((d) => d.income), 1);
        const barWidth = Math.max(120, Math.min(360, (entry.income / maxIncome) * 360));
        doc.roundedRect(34, doc.y, 527, 18, 8).fill(isEven ? colors.slateSoft : colors.white).stroke(colors.line);
        doc.fillColor(colors.ink).fontSize(9).font("Helvetica-Bold").text(entry.date, 48, doc.y + 5, { width: 110 });
        doc.roundedRect(174, doc.y + 4, barWidth, 10, 5).fill(colors.emerald);
        doc.fillColor(colors.ink).fontSize(8.6).font("Helvetica-Bold").text(formatCurrency(entry.income), 480, doc.y + 5, {
          width: 70,
          align: "right",
        });
        doc.y += 24;
      });
    }

    doc.y += 6;
    drawSectionTitle("All Order Details", "Every order included in the export", doc.y);
    doc.y += 40;

    if (orders.length === 0) {
      doc.roundedRect(34, doc.y, 527, 48, 14).fill(colors.slateSoft).stroke(colors.line);
      doc.fillColor(colors.muted).fontSize(10).font("Helvetica").text("No orders found.", 48, doc.y + 18);
      doc.y += 60;
    } else {
      orders.forEach((order, index) => {
        drawOrderCard(order, index);
      });
    }

    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i += 1) {
      doc.switchToPage(pages.start + i);
      const pageNumber = i + 1;
      doc
        .fontSize(8)
        .fillColor(colors.muted)
        .text(`Page ${pageNumber} of ${pages.count}`, 34, doc.page.height - 24, { width: 527, align: "center" });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate order analytics PDF",
      error: error.message,
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const updateData = {};
    if (orderStatus !== undefined) updateData.orderStatus = orderStatus;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order",
      error: error.message,
    });
  }
};
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  downloadOrderAnalyticsPdf,
  updateOrder,
  deleteOrder,
};