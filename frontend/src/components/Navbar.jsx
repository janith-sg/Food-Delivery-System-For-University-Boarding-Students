import { NavLink, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const location = useLocation();

  let role = "customer";
  let userId = "USER001";

  if (location.pathname.startsWith("/admin")) {
    role = "admin";
    userId = "";
  } else if (location.pathname.startsWith("/customer")) {
    role = "customer";
    userId = "USER001";
  } else if (location.pathname.startsWith("/rider")) {
    role = "rider";
    userId = "RIDER001";
  }

  const navClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 transition ${
      isActive
        ? "bg-white/20 font-semibold text-yellow-300"
        : "text-white hover:bg-white/10 hover:text-orange-300"
    }`;

  return (
    <div className="bg-gray-900 px-6 py-4 text-white shadow-md">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-bold">Food Delivery System</h1>

        <div className="flex items-center gap-3 text-sm">
          <NavLink to="/admin/deliveries" className={navClass}>
            Admin Deliveries
          </NavLink>

          <NavLink to="/admin/notifications" className={navClass}>
            Admin Notifications
          </NavLink>

          <NavLink to="/rider/dashboard" className={navClass}>
            Rider Dashboard
          </NavLink>

          <NavLink to="/customer/dashboard" className={navClass}>
            Customer Dashboard
          </NavLink>

          <NotificationBell role={role} userId={userId} />
        </div>
      </div>
    </div>
  );
}

export default Navbar;