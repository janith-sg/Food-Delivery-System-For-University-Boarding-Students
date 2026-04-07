import { NavLink, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const location = useLocation();

  let role = "customer";
  let userId = "USER001";

  if (location.pathname.startsWith("/admin")) {
    role = "admin";
    userId = "";
  } else if (location.pathname.startsWith("/rider")) {
    role = "rider";
    userId = "RIDER001";
  } else if (location.pathname.startsWith("/customer")) {
    role = "customer";
    userId = "USER001";
  }

  const navClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 transition ${
      isActive
        ? "bg-white/20 font-semibold text-lime-200"
        : "text-white hover:bg-white/10 hover:text-emerald-200"
    }`;

  return (
    <div className="bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 px-6 py-4 text-white shadow-md">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-bold">Food Delivery System</h1>

        <div className="flex items-center gap-3 text-sm">
          <NavLink to="/admin/deliveries" className={navClass}>
            Admin Deliveries
          </NavLink>

          <NavLink to="/admin/notifications" className={navClass}>
            Admin Notifications
          </NavLink>

          <NotificationBell role={role} userId={userId} />
        </div>
      </div>
    </div>
  );
}

export default Navbar;