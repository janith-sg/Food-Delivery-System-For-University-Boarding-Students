import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString();
};

export const generateRiderStatsReport = (stats, deliveries = []) => {
  if (!stats) {
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Rider Performance Report", 14, 20);

  doc.setFontSize(11);
  doc.text(`Rider ID: ${stats.riderId || "N/A"}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);

  autoTable(doc, {
    startY: 44,
    head: [["Metric", "Value"]],
    body: [
      ["Total Assigned", stats.totalAssigned ?? 0],
      ["Active", stats.active ?? 0],
      ["Delivered", stats.delivered ?? 0],
      ["Cancelled", stats.cancelled ?? 0],
      ["Average Delivery Time (min)", stats.averageDeliveryTime ?? 0],
      ["Average Rating", stats.averageRating ?? 0],
      ["Total Ratings", stats.totalRatings ?? 0],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [16, 185, 129] },
  });

  const rideTableData = deliveries.map((delivery) => [
    delivery.orderId || "-",
    delivery.status || "-",
    delivery.deliveryDurationMinutes ?? 0,
    Number.isInteger(delivery.customerRating) ? delivery.customerRating : "-",
    formatDateTime(delivery.createdAt),
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Order ID", "Status", "Duration (min)", "Rating", "Created At"]],
    body: rideTableData.length > 0 ? rideTableData : [["-", "-", "-", "-", "-"]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [13, 148, 136] },
  });

  const safeRiderId = (stats.riderId || "rider").replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`rider_stats_${safeRiderId}.pdf`);
};
