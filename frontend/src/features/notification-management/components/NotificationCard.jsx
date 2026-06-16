function NotificationCard({ notification }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
        notification.isRead
          ? "border-gray-200 bg-white"
          : "border-orange-200 bg-orange-50"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {notification.title}
          </h3>
          <p className="text-sm text-gray-500">{notification.type}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            notification.isRead
              ? "bg-gray-100 text-gray-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {notification.isRead ? "Read" : "Unread"}
        </span>
      </div>

      <p className="text-sm text-gray-700">{notification.message}</p>

      <div className="mt-4 text-xs text-gray-500">
        {new Date(notification.createdAt).toLocaleString()}
      </div>
    </div>
  );
}

export default NotificationCard;