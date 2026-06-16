import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllNotifications,
  getUserNotifications,
  markNotificationAsRead,
} from "../features/notification-management/api/notificationApi";

function NotificationBell({ role = "customer", userId = "USER001" }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const defaultPreferences = useMemo(
    () => ({
      deliveryUpdates: true,
      orderUpdates: role === "customer",
      riderAssignments: role === "rider",
      promotional: false,
    }),
    [role]
  );
  const [preferences, setPreferences] = useState(defaultPreferences);

  const wrapperRef = useRef(null);
  const latestNotificationIdRef = useRef(null);
  const preferencesStorageKey = useMemo(() => {
    const safeUserId = (userId || "guest").trim() || "guest";
    return `notificationPrefs:${role}:${safeUserId}`;
  }, [role, userId]);

  const fetchNotifications = async (showToast = false) => {
    try {
      let response;

      if (role === "admin") {
        response = await getAllNotifications();
      } else if (role === "customer" || role === "rider") {
        const normalizedUserId = String(userId || "").trim();
        const fallbackIds = role === "customer" ? ["USER001"] : [];
        const idsToTry = [normalizedUserId, ...fallbackIds].filter(Boolean);

        let resolvedData = [];
        for (const id of idsToTry) {
          const candidateResponse = await getUserNotifications(id);
          const candidateData = Array.isArray(candidateResponse.data)
            ? candidateResponse.data
            : [];

          if (candidateData.length > 0) {
            resolvedData = candidateData;
            break;
          }

          if (resolvedData.length === 0) {
            resolvedData = candidateData;
          }
        }

        response = { data: resolvedData };
      } else {
        response = { data: [] };
      }

      const data = Array.isArray(response.data) ? response.data : [];

      if (
        showToast &&
        data.length > 0 &&
        latestNotificationIdRef.current &&
        data[0]._id !== latestNotificationIdRef.current
      ) {
        setToastNotification(data[0]);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
      }

      if (data.length > 0) {
        latestNotificationIdRef.current = data[0]._id;
      }

      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications(false);

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [role, userId]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(preferencesStorageKey);

      if (!stored) {
        setPreferences(defaultPreferences);
        return;
      }

      const parsed = JSON.parse(stored);
      setPreferences({
        ...defaultPreferences,
        ...parsed,
      });
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
      setPreferences(defaultPreferences);
    }
  }, [defaultPreferences, preferencesStorageKey]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const handleMarkAsRead = async (event, id) => {
    event.stopPropagation();

    try {
      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
      // Notify other parts of the app (e.g., dashboard) that notifications changed
      try {
        window.dispatchEvent(new Event("notificationsUpdated"));
      } catch (e) {
        // ignore in non-browser or if dispatch fails
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((item) => !item.isRead);

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      await Promise.all(
        unreadNotifications.map((item) => markNotificationAsRead(item._id))
      );

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      try {
        window.dispatchEvent(new Event("notificationsUpdated"));
      } catch (e) {
        // ignore in non-browser or if dispatch fails
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      alert("Failed to mark all notifications as read");
    }
  };

  const handleNotificationClick = async (event, notification) => {
    await handleMarkAsRead(event, notification._id);

    if (
      role === "customer" &&
      notification.title === "Rate Your Order" &&
      notification.deliveryId
    ) {
      setIsOpen(false);
      navigate(`/customer/dashboard?rateDelivery=${notification.deliveryId}`);
    }
  };

  const handlePreferenceToggle = (event) => {
    const { name, checked } = event.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(preferencesStorageKey, JSON.stringify(preferences));
      setIsPreferencesOpen(false);
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
      alert("Failed to save notification preferences");
    }
  };

  const handleResetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const preferenceLabel = role === "rider" ? "Rider Notification Settings" : "Customer Notification Settings";
  const showPreferencesButton = role === "customer" || role === "rider";

  return (
    <div className="fixed bottom-6 right-6 z-[250]" ref={wrapperRef}>
      {toastVisible && (
        <div className="fixed right-6 top-20 z-[100] rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-xl">
          <p className="font-semibold">{toastNotification?.title || "New Notification"}</p>
          <p className="mt-1 text-xs text-gray-200">
            {toastNotification?.message || "You have a new notification"}
          </p>
          {role === "customer" && toastNotification?.title === "Rate Your Order" && (
            <button
              type="button"
              onClick={() => {
                const targetDeliveryId = toastNotification?.deliveryId;
                if (targetDeliveryId) {
                  navigate(`/customer/dashboard?rateDelivery=${targetDeliveryId}`);
                } else {
                  navigate("/customer/dashboard");
                }
              }}
              className="mt-2 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
            >
              Rate now
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="relative rounded-full bg-slate-800 p-3 text-white shadow-xl transition hover:bg-slate-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full right-0 z-[260] mb-3 w-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <p className="text-xs text-gray-500">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Read All
                </button>
                {showPreferencesButton && (
                  <button
                    type="button"
                    onClick={() => setIsPreferencesOpen(true)}
                    className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Preferences
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No notifications found
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`w-full cursor-pointer border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${
                    notification.isRead ? "bg-white" : "bg-orange-50"
                  }`}
                  onClick={(e) => handleNotificationClick(e, notification)}
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </h4>

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
              ))
            )}
          </div>
        </div>
      )}

      {isPreferencesOpen && showPreferencesButton && (
        <div
          className="absolute bottom-full right-0 z-[300] mb-3 w-[28rem] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{preferenceLabel}</h3>
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(false)}
                className="rounded-md px-2 py-1 text-xs font-semibold text-gray-500 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">User: {userId}</p>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Alert Types</p>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="deliveryUpdates"
                    checked={preferences.deliveryUpdates}
                    onChange={handlePreferenceToggle}
                  />
                  Delivery updates
                </label>
                {role === "customer" && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="orderUpdates"
                      checked={preferences.orderUpdates}
                      onChange={handlePreferenceToggle}
                    />
                    Order updates
                  </label>
                )}
                {role === "rider" && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="riderAssignments"
                      checked={preferences.riderAssignments}
                      onChange={handlePreferenceToggle}
                    />
                    Rider assignment alerts
                  </label>
                )}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="promotional"
                    checked={preferences.promotional}
                    onChange={handlePreferenceToggle}
                  />
                  Promotional alerts
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={handleResetPreferences}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSavePreferences}
              className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-900"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;