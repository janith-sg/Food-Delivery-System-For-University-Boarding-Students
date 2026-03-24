import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Admin
import AdminDeliveryPage from "./features/delivery-managemnet/pages/AdminDeliveryPage";
import AdminNotificationPage from "./features/notification-management/pages/AdminNotificationPage";

// Rider
import RiderDashboardPage from "./features/delivery-managemnet/pages/RiderDashboardPage";

// Customer
import CustomerDashboardPage from "./features/delivery-managemnet/pages/CustomerDashboardPage";

function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/admin/deliveries" element={<AdminDeliveryPage />} />
        <Route path="/admin/notifications" element={<AdminNotificationPage />} />

        <Route path="/rider/dashboard" element={<RiderDashboardPage />} />

        <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />

        <Route path="/" element={<AdminDeliveryPage />} />
      </Routes>
    </div>
  );
}

export default App;