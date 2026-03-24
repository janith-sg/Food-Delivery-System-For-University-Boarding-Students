import { useEffect, useState } from "react";

const statusConfig = {
  Pending: { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Confirmed: { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Preparing: { color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  "Out for Delivery": { color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  Delivered: { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
};

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
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
    fetch("http://localhost:5000/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      fetchOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`http://localhost:5000/api/orders/${deleteTarget}`, { method: "DELETE" });
      fetchOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const statuses = ["All", "Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];
  const filtered = filterStatus === "All" ? orders : orders.filter((o) => o.orderStatus === filterStatus);

  const statusCounts = statuses.slice(1).reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.orderStatus === s).length;
    return acc;
  }, {});

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {deleteTarget && (
        <ConfirmModal
          message="This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="bg-green-600 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-green-100 text-xs font-semibold uppercase tracking-widest mb-1">
            Admin Panel
          </p>
          <h1 className="text-xl font-extrabold text-white">Order Management</h1>
        </div>
        <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
          <span className="text-white font-extrabold text-lg">{orders.length}</span>
          <span className="text-green-100 text-xs font-semibold">Total Orders</span>
        </div>
      </div>

      {/* Status Summary Pills */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2">
        {statuses.map((s) => {
          const cfg = statusConfig[s];
          const count = s === "All" ? orders.length : statusCounts[s];
          const isActive = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition cursor-pointer
                ${isActive
                  ? s === "All"
                    ? "bg-green-600 text-white border-green-600"
                    : `${cfg?.color} border-current`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
            >
              {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
              {s}
              <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-extrabold
                ${isActive && s === "All" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl">📋</div>
            <p className="font-bold text-gray-700">No orders found</p>
            <p className="text-sm text-gray-400">
              {filterStatus !== "All" ? `No "${filterStatus}" orders yet.` : "Orders will appear here once placed."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const cfg = statusConfig[order.orderStatus] || statusConfig["Pending"];
              const isUpdating = updatingId === order._id;
              return (
                <div
                  key={order._id}
                  className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Card Top Bar */}
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
                    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Address */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">📍 Address</p>
                      <p className="text-sm text-gray-700">{order.customer.address}</p>
                      {order.customer.note && (
                        <p className="text-xs text-gray-400 mt-1 italic">"{order.customer.note}"</p>
                      )}
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">🍗 Items</p>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item._id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.name} × {item.qty}</span>
                            <span className="text-gray-500">Rs. {(item.price * item.qty).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-100 pt-1 mt-1 flex justify-between">
                          <span className="text-xs text-gray-500">{order.paymentMethod || "Cash on Delivery"}</span>
                          <span className="text-sm font-extrabold text-green-700">
                            Rs. {order.total?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 justify-end">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">⚙️ Actions</p>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={isUpdating}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-green-500 transition cursor-pointer disabled:opacity-60"
                      >
                        <option>Pending</option>
                        <option>Confirmed</option>
                        <option>Preparing</option>
                        <option>Out for Delivery</option>
                        <option>Delivered</option>
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
  );
};

export default AdminOrders;
