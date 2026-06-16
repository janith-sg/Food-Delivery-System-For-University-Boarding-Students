import NotificationCard from "./NotificationCard";

function NotificationList({ notifications }) {
  if (!notifications.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
        No notifications found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification._id}
          notification={notification}
        />
      ))}
    </div>
  );
}

export default NotificationList;