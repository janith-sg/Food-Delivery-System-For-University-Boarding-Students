import { useEffect, useState } from "react";
import { getUserNotifications } from "../api/notificationApi";
import NotificationList from "../components/NotificationList";

function CustomerNotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await getUserNotifications("USER001");
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-2 text-sm text-orange-100">
            View delivery updates and important order-related alerts.
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Notification History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            This page shows delivery-related notifications for the customer.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading notifications...
          </div>
        ) : (
          <NotificationList notifications={notifications} />
        )}
      </div>
    </div>
  );
}

export default CustomerNotificationPage;