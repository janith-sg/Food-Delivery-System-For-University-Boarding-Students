import { useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, CheckCircle, Clock } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const statusConfig = {
  Pending: { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Confirmed: { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Preparing: { color: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  "Out for Delivery": { color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  Delivered: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

const paymentStatusConfig = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
    <div className="w-full max-w-sm rounded-2xl border border-rose-100 bg-white p-6 shadow-2xl">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-lg font-black text-rose-600">
        !
      </div>
      <p className="mb-1 text-center text-base font-extrabold text-slate-800">Delete Order?</p>
      <p className="mb-6 text-center text-sm text-slate-500">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 cursor-pointer rounded-xl border-none bg-rose-600 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700"
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/60 font-sans">
      {deleteTarget && (
        <ConfirmModal
          message="This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-base font-black text-emerald-700">
                OM
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700/80">Admin Panel</p>
                <h1 className="text-2xl font-extrabold text-slate-900">Order Management</h1>
              </div>
            </div>
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 sm:block">
              Live Orders: {orders.length}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-extrabold text-slate-900">Overview</h2>
          <p className="text-sm text-slate-600">Track order progress, payment status, and update fulfillment in one place.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="mb-2 text-sm font-semibold text-slate-500">Total Orders</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-extrabold text-slate-900">{orders.length}</p>
              <ShoppingCart className="h-8 w-8 text-emerald-500/40" />
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="mb-2 text-sm font-semibold text-slate-500">Pending Orders</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-extrabold text-slate-900">{statusCounts.Pending}</p>
              <Clock className="h-8 w-8 text-blue-500/40" />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="mb-2 text-sm font-semibold text-slate-500">Delivered Orders</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-extrabold text-slate-900">{statusCounts.Delivered}</p>
              <CheckCircle className="h-8 w-8 text-emerald-500/40" />
            </div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="mb-2 text-sm font-semibold text-slate-500">Completion Rate</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-extrabold text-slate-900">
                {orders.length > 0 ? Math.round((statusCounts.Delivered / orders.length) * 100) : 0}%
              </p>
              <TrendingUp className="h-8 w-8 text-violet-500/40" />
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-extrabold text-slate-900">Order Status Distribution</h3>
            <div className="flex flex-col gap-4">
              {Object.entries(statusCounts).map(([status, count]) => {
                const total = orders.length || 1;
                const percentage = Math.round((count / total) * 100);
                const colors = {
                  Pending: "bg-amber-500",
                  Confirmed: "bg-blue-500",
                  Preparing: "bg-violet-500",
                  "Out for Delivery": "bg-orange-500",
                  Delivered: "bg-emerald-500",
                };

                return (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">{status}</span>
                      <span className="text-sm font-bold text-slate-600">{count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className={`${colors[status] || "bg-slate-500"} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-extrabold text-slate-900">Payment Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Paid Orders</p>
                  <p className="text-xs text-emerald-600">{orders.filter((o) => o.paymentStatus === "Paid").length} completed</p>
                </div>
                <p className="text-2xl font-extrabold text-emerald-700">{orders.filter((o) => o.paymentStatus === "Paid").length}</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-amber-700">Pending Payment</p>
                  <p className="text-xs text-amber-600">{orders.filter((o) => o.paymentStatus === "Pending" || !o.paymentStatus).length} awaiting</p>
                </div>
                <p className="text-2xl font-extrabold text-amber-700">{orders.filter((o) => o.paymentStatus === "Pending" || !o.paymentStatus).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900">All Orders</h2>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => {
                const cfg = statusConfig[s];
                const count = s === "All" ? orders.length : statusCounts[s];
                const isActive = filterStatus === s;

                return (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? s === "All"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : `${cfg?.color} border-current`
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {cfg && <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />}
                    {s}
                    <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-extrabold ${isActive && s === "All" ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <svg className="h-7 w-7 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-500">
                O
              </div>
              <p className="font-bold text-slate-700">No orders found</p>
              <p className="text-sm text-slate-400">
                {filterStatus !== "All" ? `No "${filterStatus}" orders yet.` : "Orders will appear here once placed."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => {
                const cfg = statusConfig[order.orderStatus] || statusConfig.Pending;
                const paymentCfg = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.Pending;
                const isUpdating = updatingId === order._id;
                const customerName = order?.customer?.fullName || "Unknown Customer";
                const customerPhone = order?.customer?.phone || "N/A";
                const customerAddress = order?.customer?.address || "No address provided";
                const customerNote = order?.customer?.note || "";
                const items = Array.isArray(order?.items) ? order.items : [];

                return (
                  <div
                    key={order._id}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-700">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{customerName}</p>
                          <p className="text-xs text-slate-400">{customerPhone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${cfg.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {order.orderStatus}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${paymentCfg}`}>
                          {order.paymentStatus || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                          Address
                        </p>
                        <p className="text-sm text-slate-700">{customerAddress}</p>
                        {customerNote && (
                          <p className="mt-1 text-xs italic text-slate-400">"{customerNote}"</p>
                        )}
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                          Items
                        </p>
                        <div className="space-y-1">
                          {items.map((item, idx) => (
                            <div key={item._id || `${order._id}-${idx}`} className="flex justify-between text-sm">
                              <span className="text-slate-700">
                                {item.name} x {item.qty}
                              </span>
                              <span className="text-slate-500">
                                Rs. {(item.price * item.qty).toLocaleString()}
                              </span>
                            </div>
                          ))}

                          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500">
                                {order.paymentMethod || "Cash on Delivery"}
                              </span>
                              <span className="text-xs font-semibold text-slate-600">
                                Payment: {order.paymentStatus || "Pending"}
                              </span>
                            </div>
                            <span className="text-sm font-extrabold text-emerald-700">
                              Rs. {order.total?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-end gap-2">
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                          Actions
                        </p>

                        <p className="text-xs font-semibold text-slate-500">Order Status</p>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value, order)}
                          disabled={isUpdating}
                          className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-emerald-500 disabled:opacity-60"
                        >
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>Preparing</option>
                          <option>Out for Delivery</option>
                          <option>Delivered</option>
                        </select>

                        <p className="mt-1 text-xs font-semibold text-slate-500">Payment Status</p>
                        <select
                          value={order.paymentStatus || "Pending"}
                          onChange={(e) => handlePaymentStatusChange(order._id, e.target.value, order)}
                          disabled={isUpdating}
                          className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-emerald-500 disabled:opacity-60"
                        >
                          <option>Pending</option>
                          <option>Paid</option>
                        </select>

                        <button
                          onClick={() => setDeleteTarget(order._id)}
                          className="w-full cursor-pointer rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                        >
                          Delete Order
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

