import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateNotificationReport = (notifications) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Notification Report", 14, 20);

  doc.setFontSize(12);
  doc.text(`Total Notifications: ${notifications.length}`, 14, 30);

  const tableData = notifications.map((n) => [
    n.userId,
    n.title,
    n.message,
    n.type,
    n.isRead ? "Read" : "Unread",
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["User", "Title", "Message", "Type", "Status"]],
    body: tableData,
  });

  doc.save("notification_report.pdf");
};