import { useEffect, useMemo, useState } from "react";
import { getAllDeliveries } from "../api/deliveryApi";
import { getUserNotifications } from "../../notification-management/api/notificationApi";
import DeliveryStatusBadge from "../components/DeliveryStatusBadge";

function CustomerDashboardPage() {
  const userId = "USER001";
  const [deliveries, setDeliveries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const deliveriesPerPage = 5;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [deliveryRes, notificationRes] = await Promise.all([
        getAllDeliveries(),
        getUserNotifications(userId),
      ]);

      const allDeliveries = Array.isArray(deliveryRes.data) ? deliveryRes.data : [];

      const userDeliveries = allDeliveries
        .filter((delivery) => delivery.studentId === userId || delivery.studentId === "")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setDeliveries(userDeliveries);
      setNotifications(Array.isArray(notificationRes.data) ? notificationRes.data : []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to load customer dashboard:", error);
      alert("Failed to load customer dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const totalPages = Math.ceil(deliveries.length / deliveriesPerPage);

  const paginatedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * deliveriesPerPage;
    const endIndex = startIndex + deliveriesPerPage;
    return deliveries.slice(startIndex, endIndex);
  }, [deliveries, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow-sm">
          Loading customer dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Customer Dashboard</h1>
          <p className="mt-2 text-sm text-orange-100">
            Track your deliveries, rider details, ETA, and recent updates in one place.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">My Deliveries</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {deliveries.length}
            </p>
          </div>

          <div className="rounded-2xl bg-orange-50 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Unread Notifications</p>
            <p className="mt-2 text-3xl font-bold text-orange-700">
              {unreadCount}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active Deliveries</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {
                deliveries.filter((d) =>
                  ["Assigned", "Picked Up", "On the Way"].includes(d.status)
                ).length
              }
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Deliveries</h2>
              <p className="mt-1 text-sm text-gray-500">
                Your current and past delivery records.
              </p>
            </div>

            {deliveries.length > 0 && (
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages || 1}
              </div>
            )}
          </div>

          {deliveries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              No deliveries found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5">
                {paginatedDeliveries.map((delivery) => (
                  <div
                    key={delivery._id}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Order ID: {delivery.orderId}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Rider: {delivery.deliveryPersonName}
                        </p>
                      </div>

                      <DeliveryStatusBadge status={delivery.status} />
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2">
                      <p>
                        <span className="font-semibold text-gray-900">Rider Phone:</span>{" "}
                        {delivery.deliveryPersonPhone}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">Current Location:</span>{" "}
                        {delivery.currentLocation}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">ETA:</span>{" "}
                        {delivery.estimatedDeliveryTime
                          ? new Date(delivery.estimatedDeliveryTime).toLocaleString()
                          : "Not available"}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">Assigned At:</span>{" "}
                        {delivery.assignedAt
                          ? new Date(delivery.assignedAt).toLocaleString()
                          : "Not available"}
                      </p>
                      <p className="md:col-span-2">
                        <span className="font-semibold text-gray-900">Notes:</span>{" "}
                        {delivery.notes || "No notes"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="rounded-xl bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Recent Notifications</h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest delivery-related updates for your account.
            </p>
          </div>

          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              No notifications available.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification._id}
                  className={`rounded-2xl border p-4 ${
                    notification.isRead
                      ? "border-gray-200 bg-white"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </h3>

                    {!notification.isRead && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                        New
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboardPage;