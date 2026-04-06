import { useEffect, useMemo, useState } from "react";
import { getAllNotifications } from "../api/notificationApi";
import NotificationList from "../components/NotificationList";
import { generateNotificationReport } from "../reports/generateNotificationReport";
import { getAllDeliveries } from "../../delivery-managemnet/api/deliveryApi";
import AdminNotificationForm from "../components/AdminNotificationForm";

function AdminNotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await getAllNotifications();
      const allNotifications = Array.isArray(res.data) ? res.data : [];
      setNotifications(allNotifications);
    } catch (error) {
      console.error(error);
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const res = await getAllDeliveries();
      const allDeliveries = Array.isArray(res.data) ? res.data : [];
      setDeliveries(allDeliveries);
    } catch (error) {
      console.error(error);
      setDeliveries([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchDeliveries();
  }, []);

  const customerRecipients = useMemo(() => {
    const seen = new Set();

    return deliveries
      .map((item) => (item.studentId || "").trim())
      .filter((id) => {
        if (!id || seen.has(id)) {
          return false;
        }

        seen.add(id);
        return true;
      })
      .map((id) => ({
        id,
        label: `Customer - ${id}`,
      }));
  }, [deliveries]);

  const riderRecipients = useMemo(() => {
    const seen = new Set();

    return deliveries
      .map((item) => ({
        id: (item.deliveryPersonId || "").trim(),
        name: (item.deliveryPersonName || "").trim(),
      }))
      .filter((item) => {
        if (!item.id || seen.has(item.id)) {
          return false;
        }

        seen.add(item.id);
        return true;
      })
      .map((item) => ({
        id: item.id,
        label: item.name ? `${item.name} (${item.id})` : `Rider - ${item.id}`,
      }));
  }, [deliveries]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Admin Notifications</h1>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                All Notifications
              </h2>
            </div>

            <button
              onClick={() => generateNotificationReport(notifications)}
              className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Download Notification Report
            </button>
          </div>
        </div>

        <AdminNotificationForm
          customerRecipients={customerRecipients}
          riderRecipients={riderRecipients}
          onCreated={fetchNotifications}
        />

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-4 text-center shadow">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold">{notifications.length}</p>
          </div>

          <div className="rounded-xl bg-orange-50 p-4 text-center shadow">
            <p className="text-sm text-gray-500">Unread</p>
            <p className="text-xl font-bold text-orange-600">
              {notifications.filter((n) => !n.isRead).length}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 p-4 text-center shadow">
            <p className="text-sm text-gray-500">Read</p>
            <p className="text-xl font-bold text-green-600">
              {notifications.filter((n) => n.isRead).length}
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-4 text-center shadow">
            <p className="text-sm text-gray-500">Delivery Type</p>
            <p className="text-xl font-bold text-blue-600">
              {notifications.filter((n) => n.type === "delivery").length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-6 text-center shadow">
            Loading notifications...
          </div>
        ) : (
          <NotificationList notifications={notifications} />
        )}
      </div>
    </div>
  );
}

export default AdminNotificationPage;