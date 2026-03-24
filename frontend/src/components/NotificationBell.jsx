import { useEffect, useMemo, useRef, useState } from "react";
import {
  getAllNotifications,
  getUserNotifications,
  markNotificationAsRead,
} from "../features/notification-management/api/notificationApi";

function NotificationBell({ role = "customer", userId = "USER001" }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const wrapperRef = useRef(null);
  const latestNotificationIdRef = useRef(null);

  const fetchNotifications = async (showToast = false) => {
    try {
      let response;

      if (role === "admin") {
  response = await getAllNotifications();
} else if (role === "customer" || role === "rider") {
  response = await getUserNotifications(userId);
}

      const data = Array.isArray(response.data) ? response.data : [];

      if (
        showToast &&
        data.length > 0 &&
        latestNotificationIdRef.current &&
        data[0]._id !== latestNotificationIdRef.current
      ) {
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
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {toastVisible && (
        <div className="fixed right-6 top-20 z-[100] rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-xl">
          You have a new notification
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="relative rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
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
          className="absolute right-0 z-[200] mt-3 w-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-500">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
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
                  onClick={(e) => handleMarkAsRead(e, notification._id)}
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
    </div>
  );
}

export default NotificationBell;