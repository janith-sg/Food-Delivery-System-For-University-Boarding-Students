import React from "react";
import AdminOrders from "./features/order-managemnt/pages/AdminOrders";
import AdminGroupOrders from "./features/order-managemnt/pages/AdminGroupOrders";
import "./App.css";

function AdminApp() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <AdminOrders />
      <AdminGroupOrders />
    </div>
  );
}

export default AdminApp;