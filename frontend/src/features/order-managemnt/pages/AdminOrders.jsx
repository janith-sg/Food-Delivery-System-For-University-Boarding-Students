import { useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, CheckCircle, Clock } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const statusConfig = {
  Pending: { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Confirmed: { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Preparing: { color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  "Out for Delivery": { color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  Delivered: { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
};

const paymentStatusConfig = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Paid: "bg-green-100 text-green-700 border-green-200",
};

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
        🗑️
      </div>
      <p className="text-center font-bold text-gray-800 mb-1">Delete Order?</p>
      <p className="text-center text-sm text-gray-500 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer bg-white"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition cursor-pointer border-none"
        >
          Yes, Delete
        </button>
      </div>
    </div>
  </div>
);

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch(apiUrl("/api/orders"))
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus, currentOrder) => {
    setUpdatingId(id);
    try {
      const response = await fetch(apiUrl(`/api/orders/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: newStatus,
          paymentStatus: currentOrder.paymentStatus,
        }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (id, newPaymentStatus, currentOrder) => {
    setUpdatingId(id);
    try {
      const response = await fetch(apiUrl(`/api/orders/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: currentOrder.orderStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(apiUrl(`/api/orders/${deleteTarget}`), {
        method: "DELETE",
      });
      fetchOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const statuses = ["All", "Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];
  const filtered =
    filterStatus === "All" ? orders : orders.filter((o) => o.orderStatus === filterStatus);

  const statusCounts = statuses.slice(1).reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.orderStatus === s).length;
    return acc;
  }, {});

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      {deleteTarget && (
        <ConfirmModal
          message="This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg font-bold text-green-700">
              📦
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Admin Panel</p>
              <h1 className="text-2xl font-extrabold text-gray-900">Order Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">📊 Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-green-500 p-6 hover:shadow-md transition">
              <p className="text-sm font-semibold text-gray-500 mb-2">Total Orders</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-extrabold text-gray-900">{orders.length}</p>
                <ShoppingCart className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-blue-500 p-6 hover:shadow-md transition">
              <p className="text-sm font-semibold text-gray-500 mb-2">Pending Orders</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-extrabold text-gray-900">{statusCounts["Pending"]}</p>
                <Clock className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-green-500 p-6 hover:shadow-md transition">
              <p className="text-sm font-semibold text-gray-500 mb-2">Delivered Orders</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-extrabold text-gray-900">{statusCounts["Delivered"]}</p>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-purple-500 p-6 hover:shadow-md transition">
              <p className="text-sm font-semibold text-gray-500 mb-2">Completion Rate</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-extrabold text-gray-900">
                  {orders.length > 0 ? Math.round((statusCounts["Delivered"] / orders.length) * 100) : 0}%
                </p>
                <TrendingUp className="h-8 w-8 text-purple-500 opacity-20" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-extrabold text-gray-900 mb-6">Order Status Distribution</h3>
              <div className="flex flex-col gap-4">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const total = orders.length || 1;
                  const percentage = Math.round((count / total) * 100);
                  const colors = {
                    "Pending": "bg-amber-500",
                    "Confirmed": "bg-blue-500",
                    "Preparing": "bg-purple-500",
                    "Out for Delivery": "bg-orange-500",
                    "Delivered": "bg-green-500",
                  };

                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">{status}</span>
                        <span className="text-sm font-bold text-gray-600">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${colors[status] || "bg-gray-500"} h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-extrabold text-gray-900 mb-6">Payment Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-200">
                  <div>
                    <p className="text-sm font-semibold text-green-700">Paid Orders</p>
                    <p className="text-xs text-green-600">{orders.filter(o => o.paymentStatus === "Paid").length} completed</p>
                  </div>
                  <p className="text-2xl font-extrabold text-green-700">✓</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Pending Payment</p>
                    <p className="text-xs text-amber-600">{orders.filter(o => o.paymentStatus === "Pending" || !o.paymentStatus).length} awaiting</p>
                  </div>
                  <p className="text-2xl font-extrabold text-amber-700">⏳</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">📋 All Orders</h2>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => {
                const cfg = statusConfig[s];
                const count = s === "All" ? orders.length : statusCounts[s];
                const isActive = filterStatus === s;

                return (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition cursor-pointer ${
                      isActive
                        ? s === "All"
                          ? "bg-green-600 text-white border-green-600"
                          : `${cfg?.color} border-current`
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                    {s}
                    <span className={`ml-0.5 text-xs font-extrabold ${isActive && s === "All" ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <svg className="animate-spin h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center bg-white rounded-2xl border border-gray-100">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                📋
              </div>
              <p className="font-bold text-gray-700">No orders found</p>
              <p className="text-sm text-gray-400">
                {filterStatus !== "All" ? `No "${filterStatus}" orders yet.` : "Orders will appear here once placed."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => {
                const cfg = statusConfig[order.orderStatus] || statusConfig["Pending"];
                const paymentCfg = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig["Pending"];
                const isUpdating = updatingId === order._id;

                return (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-extrabold text-green-700">
                          {order.customer.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-gray-900">{order.customer.fullName}</p>
                          <p className="text-xs text-gray-400">{order.customer.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {order.orderStatus}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold border ${paymentCfg}`}>
                          {order.paymentStatus || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                          📍 Address
                        </p>
                        <p className="text-sm text-gray-700">{order.customer.address}</p>
                        {order.customer.note && (
                          <p className="text-xs text-gray-400 mt-1 italic">"{order.customer.note}"</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                          🍗 Items
                        </p>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item._id} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {item.name} × {item.qty}
                              </span>
                              <span className="text-gray-500">
                                Rs. {(item.price * item.qty).toLocaleString()}
                              </span>
                            </div>
                          ))}

                          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">
                                {order.paymentMethod || "Cash on Delivery"}
                              </span>
                              <span className="text-xs font-semibold text-gray-600">
                                Payment: {order.paymentStatus || "Pending"}
                              </span>
                            </div>
                            <span className="text-sm font-extrabold text-green-700">
                              Rs. {order.total?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 justify-end">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                          ⚙️ Actions
                        </p>

                        <p className="text-xs text-gray-500 font-semibold">Order Status</p>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value, order)}
                          disabled={isUpdating}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-green-500 transition cursor-pointer disabled:opacity-60"
                        >
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>Preparing</option>
                          <option>Out for Delivery</option>
                          <option>Delivered</option>
                        </select>

                        <p className="text-xs text-gray-500 font-semibold mt-1">Payment Status</p>
                        <select
                          value={order.paymentStatus || "Pending"}
                          onChange={(e) => handlePaymentStatusChange(order._id, e.target.value, order)}
                          disabled={isUpdating}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-green-500 transition cursor-pointer disabled:opacity-60"
                        >
                          <option>Pending</option>
                          <option>Paid</option>
                        </select>

                        <button
                          onClick={() => setDeleteTarget(order._id)}
                          className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                        >
                          🗑️ Delete Order
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;