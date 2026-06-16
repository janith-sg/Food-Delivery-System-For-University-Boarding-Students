function DeliveryStatusBadge({ status }) {
  const statusStyles = {
    Assigned: "bg-yellow-100 text-yellow-800",
    "Picked Up": "bg-cyan-100 text-cyan-800",
    "On the Way": "bg-blue-100 text-blue-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

export default DeliveryStatusBadge;