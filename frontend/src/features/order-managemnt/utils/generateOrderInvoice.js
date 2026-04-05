import jsPDF from "jspdf";

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`;

const C = {
  headerBg:  [220, 252, 231], // green-100
  accent:    [34,  197, 94],  // green-500
  darkGreen: [22,  101, 52],  // green-800
  midGreen:  [21,  128, 61],  // green-700
  rowAlt:    [240, 253, 244], // green-50
  border:    [187, 247, 208], // green-200
  bodyText:  [30,  41,  59],
  mutedText: [100, 116, 139],
  white:     [255, 255, 255],
};

const generateOrderInvoice = (orderData) => {
  const doc = new jsPDF();

  const {
    customer = {},
    items = [],
    paymentMethod = "Cash on Delivery",
    paymentStatus = "Pending",
    subTotal = 0,
    deliveryFee = 0,
    total = 0,
    orderStatus = "Pending",
    _id,
    createdAt,
  } = orderData;

  const invoiceNo = _id ? `INV-${String(_id).slice(-6).toUpperCase()}` : `INV-${Date.now()}`;
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
  doc.text("Order Invoice", 15, 31);

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

  let y = 46;

  // ── Customer Details ──────────────────────────────────────────────────────────
  sectionTitle("Customer Details", y);
  y += 5;
  card(13, y, 184, 26);
  field("Name:  ", customer.fullName, 18, y + 8);
  field("Phone:  ", customer.phone, 18, y + 16);
  field("Address:  ", customer.address, 18, y + 23);
  y += 32;

  // ── Order Information ─────────────────────────────────────────────────────────
  sectionTitle("Order Information", y);
  y += 5;
  card(13, y, 90, 20);
  card(107, y, 90, 20);
  field("Status:  ", orderStatus, 18, y + 8);
  field("Method:  ", paymentMethod, 18, y + 16);
  field("Payment:  ", paymentStatus, 112, y + 8);
  y += 28;

  // ── Ordered Items ─────────────────────────────────────────────────────────────
  sectionTitle("Ordered Items", y);
  y += 5;

  // Table header row
  doc.setFillColor(...C.accent);
  doc.roundedRect(13, y, 184, 9, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.white);
  doc.text("Item", 18, y + 6);
  doc.text("Qty", 142, y + 6);
  doc.text("Amount", 192, y + 6, { align: "right" });
  y += 11;

  const tableStartY = y;

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
      doc.text(String(item.qty), 142, y + 5.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.midGreen);
      doc.text(formatCurrency(item.price * item.qty), 192, y + 5.5, { align: "right" });
      y += 9;
    });
  }

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(13, tableStartY - 11, 184, y - tableStartY + 11, 2, 2, "S");
  doc.setLineWidth(0.2);
  y += 8;

  // ── Payment Summary ───────────────────────────────────────────────────────────
  sectionTitle("Payment Summary", y);
  y += 5;
  card(13, y, 184, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.mutedText);
  doc.text("Subtotal", 18, y + 9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.bodyText);
  doc.text(formatCurrency(subTotal), 192, y + 9, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.mutedText);
  doc.text("Delivery Fee", 18, y + 17);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.bodyText);
  doc.text(formatCurrency(deliveryFee), 192, y + 17, { align: "right" });

  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.4);
  doc.line(18, y + 21, 192, y + 21);
  doc.setLineWidth(0.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.darkGreen);
  doc.text("Total", 18, y + 28);
  doc.text(formatCurrency(total), 192, y + 28, { align: "right" });
  y += 38;

  // ── Note ─────────────────────────────────────────────────────────────────────
  if (customer.note) {
    sectionTitle("Note", y);
    y += 5;
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(13, y, 184, 14, 3, 3, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 80, 10);
    doc.text(customer.note, 18, y + 9);
    y += 20;
  }

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
  doc.text("Thank you for ordering with Uni Eats!", 105, 285, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(...C.mutedText);
  doc.text("Powered by Uni Eats", 105, 292, { align: "center" });

  doc.save(`UniEats_Invoice_${invoiceNo}.pdf`);
};

export default generateOrderInvoice;