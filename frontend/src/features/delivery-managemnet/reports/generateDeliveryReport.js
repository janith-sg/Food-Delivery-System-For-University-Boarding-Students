import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateDeliveryReport = (deliveries) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Delivery Report", 14, 20);

  doc.setFontSize(12);
  doc.text(`Total Deliveries: ${deliveries.length}`, 14, 30);

  const tableData = deliveries.map((d) => [
    d.orderId,
    d.deliveryPersonName,
    d.deliveryPersonPhone,
    d.status,
    d.currentLocation,
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["Order ID", "Person", "Phone", "Status", "Location"]],
    body: tableData,
  });

  doc.save("delivery_report.pdf");
};