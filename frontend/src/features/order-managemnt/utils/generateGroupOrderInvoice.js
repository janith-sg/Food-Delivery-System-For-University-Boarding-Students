import jsPDF from "jspdf";

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`;

const C = {
  headerBg:  [220, 252, 231],
  accent:    [34,  197, 94],
  darkGreen: [22,  101, 52],
  midGreen:  [21,  128, 61],
  rowAlt:    [240, 253, 244],
  border:    [187, 247, 208],
  bodyText:  [30,  41,  59],
  mutedText: [100, 116, 139],
  white:     [255, 255, 255],
};

const generateGroupOrderInvoice = (groupData) => {
  const doc = new jsPDF();

  const {
    title = "Group Order",
    groupCode = "-",
    createdBy = "-",
    members = [],
    items = [],
    splitDetails = [],
    paymentMethod = "Cash on Delivery",
    paymentStatus = "Pending",
    status = "Completed",
    deliveryFee = 0,
    finalTotal = 0,
    createdAt,
    _id,
  } = groupData;

  const invoiceNo = _id ? `GRP-${String(_id).slice(-6).toUpperCase()}` : `GRP-${Date.now()}`;
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString();

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, 210, 36, "F");
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(1);
  doc.line(0, 36, 210, 36);
  doc.setLineWidth(0.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...C.darkGreen);
  doc.text("Uni Eats", 15, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.midGreen);
  doc.text("Fresh • Fast • Delicious", 15, 23);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.darkGreen);
  doc.text("Group Order Invoice", 15, 31);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.mutedText);
  doc.text(invoiceNo, 195, 22, { align: "right" });
  doc.text(date, 195, 30, { align: "right" });

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const sectionTitle = (label, y) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.midGreen);
    doc.text(label, 15, y);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(15, y + 2, 195, y + 2);
    doc.setLineWidth(0.2);
  };

  const field = (label, value, x, y) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.mutedText);
    doc.text(label, x, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.bodyText);
    doc.text(value || "—", x + doc.getTextWidth(label) + 1, y);
  };

  const card = (x, y, w, h) => {
    doc.setFillColor(...C.rowAlt);
    doc.setDrawColor(...C.border);
    doc.roundedRect(x, y, w, h, 3, 3, "FD");
  };

  const tableHeader = (y, cols) => {
    doc.setFillColor(...C.accent);
    doc.roundedRect(13, y, 184, 9, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.white);
    cols.forEach(([label, x, align]) => doc.text(label, x, y + 6, { align: align || "left" }));
  };

  let y = 46;

  // ── Group Details ─────────────────────────────────────────────────────────────
  sectionTitle("Group Details", y);
  y += 5;
  card(13, y, 90, 28);
  card(107, y, 90, 28);

  field("Title:  ", title, 18, y + 8);
  field("Code:  ", groupCode, 18, y + 16);
  field("Created by:  ", createdBy, 18, y + 24);

  field("Status:  ", status, 112, y + 8);
  field("Method:  ", paymentMethod, 112, y + 16);
  field("Payment:  ", paymentStatus, 112, y + 24);
  y += 36;

  // ── Members ───────────────────────────────────────────────────────────────────
  sectionTitle(`Members (${members.length})`, y);
  y += 5;

  const memberH = Math.max(16, Math.ceil(members.length / 3) * 8 + 8);
  card(13, y, 184, memberH);

  if (members.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.mutedText);
    doc.text("No members found.", 105, y + 10, { align: "center" });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.bodyText);
    members.forEach((m, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      doc.text(`• ${m.name}`, 18 + col * 62, y + 9 + row * 8);
    });
  }
  y += memberH + 8;

  // ── Shared Items ──────────────────────────────────────────────────────────────
  sectionTitle("Shared Items", y);
  y += 5;

  tableHeader(y, [["Item", 18], ["Added By", 108], ["Qty", 150], ["Amount", 192, "right"]]);
  y += 11;

  const itemsStartY = y;
  if (items.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.mutedText);
    doc.text("No items found.", 105, y + 6, { align: "center" });
    y += 10;
  } else {
    items.forEach((item, i) => {
      if (i % 2 !== 0) {
        doc.setFillColor(...C.rowAlt);
        doc.rect(13, y - 1, 184, 9, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.bodyText);
      doc.text(`${i + 1}.  ${item.name}`, 18, y + 5.5);
      doc.setTextColor(...C.mutedText);
      doc.text(item.addedBy || "—", 108, y + 5.5);
      doc.setTextColor(...C.bodyText);
      doc.text(String(item.qty), 150, y + 5.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.midGreen);
      doc.text(formatCurrency(item.price * item.qty), 192, y + 5.5, { align: "right" });
      y += 9;
    });
  }
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(13, itemsStartY - 11, 184, y - itemsStartY + 11, 2, 2, "S");
  doc.setLineWidth(0.2);
  y += 8;

  // ── Bill Split ────────────────────────────────────────────────────────────────
  sectionTitle("Bill Split", y);
  y += 5;

  tableHeader(y, [["Member", 18], ["Food", 95], ["Delivery", 133], ["Total", 192, "right"]]);
  y += 11;

  const splitStartY = y;
  if (splitDetails.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.mutedText);
    doc.text("No split details available.", 105, y + 6, { align: "center" });
    y += 10;
  } else {
    splitDetails.forEach((split, i) => {
      if (i % 2 !== 0) {
        doc.setFillColor(...C.rowAlt);
        doc.rect(13, y - 1, 184, 9, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.bodyText);
      doc.text(split.memberName, 18, y + 5.5);
      doc.setTextColor(...C.mutedText);
      doc.text(formatCurrency(split.subTotal), 95, y + 5.5);
      doc.text(formatCurrency(split.deliveryShare), 133, y + 5.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.midGreen);
      doc.text(formatCurrency(split.total), 192, y + 5.5, { align: "right" });
      y += 9;
    });
  }
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(13, splitStartY - 11, 184, y - splitStartY + 11, 2, 2, "S");
  doc.setLineWidth(0.2);
  y += 8;

  // ── Final Summary ─────────────────────────────────────────────────────────────
  sectionTitle("Final Summary", y);
  y += 5;
  card(13, y, 184, 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.mutedText);
  doc.text("Total Delivery Fee", 18, y + 10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.bodyText);
  doc.text(formatCurrency(deliveryFee), 192, y + 10, { align: "right" });

  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.4);
  doc.line(18, y + 15, 192, y + 15);
  doc.setLineWidth(0.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.darkGreen);
  doc.text("Final Total", 18, y + 23);
  doc.text(formatCurrency(finalTotal), 192, y + 23, { align: "right" });

  // ── Footer ────────────────────────────────────────────────────────────────────
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 276, 210, 21, "F");
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.8);
  doc.line(0, 276, 210, 276);
  doc.setLineWidth(0.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.midGreen);
  doc.text("Thank you for using Uni Eats Group Ordering!", 105, 285, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(...C.mutedText);
  doc.text("Powered by Uni Eats", 105, 292, { align: "center" });

  doc.save(`UniEats_Group_Invoice_${invoiceNo}.pdf`);
};

export default generateGroupOrderInvoice;