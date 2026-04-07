import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const statusConfig = {
  Open: { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Closed: { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Completed: { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
};

const paymentStatusConfig = {
  Pending: "bg-amber-100 text-amber-700",
  Paid: "bg-green-100 text-green-700",
};

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
      <p className="text-center font-bold text-gray-800 mb-1">Delete Group Order?</p>
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

const AdminGroupOrders = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchGroups = () => {
    setLoading(true);
    fetch(apiUrl("/api/group-orders"))
      .then((res) => res.json())
      .then((data) => setGroups(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleStatusChange = async (id, newStatus, currentGroup) => {
    setUpdatingId(id);
    try {
      const response = await fetch(apiUrl(`/api/group-orders/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: currentGroup.paymentStatus,
          paymentMethod: currentGroup.paymentMethod,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchGroups();
      } else {
        alert(data.message || "Failed to update group order");
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
      const response = await fetch(apiUrl(`/api/group-orders/${deleteTarget}`), {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        fetchGroups();
      } else {
        alert(data.message || "Failed to delete group order");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const statuses = ["All", "Open", "Closed", "Completed"];

  const filtered = filterStatus === "All" ? groups : groups.filter((g) => g.status === filterStatus);

  const statusCounts = { All: groups.length, Open: 0, Closed: 0, Completed: 0 };
  groups.forEach((g) => { if (statusCounts[g.status] !== undefined) statusCounts[g.status]++; });

  const getSubTotal = (items = []) =>
    items.reduce((s, i) => s + i.price * i.qty, 0);

  const calculateSplit = (group) => {
    if (!group.items?.length) return [];
    const memberTotals = {};
    group.items.forEach((item) => {
      memberTotals[item.addedBy] = (memberTotals[item.addedBy] || 0) + item.price * item.qty;
    });
    const members = Object.keys(memberTotals);
    const share = members.length > 0 ? (group.deliveryFee || 400) / members.length : 0;
    return members.map((m) => ({
      name: m,
      subTotal: memberTotals[m],
      delivery: share,
      total: memberTotals[m] + share,
    }));
  };

  return (
    <div className="font-sans rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {deleteTarget && (
        <ConfirmModal
          message="This will permanently remove the group order."
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
          <h1 className="text-xl font-extrabold text-white">Group Order Management</h1>
        </div>
        <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
          <span className="text-white font-extrabold text-lg">{groups.length}</span>
          <span className="text-green-100 text-xs font-semibold">Total Groups</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2">
        {statuses.map((s) => {
          const cfg = statusConfig[s];
          const count = statusCounts[s];
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
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl">👥</div>
            <p className="font-bold text-gray-700">No group orders found</p>
            <p className="text-sm text-gray-400">
              {filterStatus !== "All" ? `No "${filterStatus}" group orders yet.` : "Group orders will appear here once created."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((group) => {
              const cfg = statusConfig[group.status] || statusConfig["Open"];
              const isUpdating = updatingId === group._id;
              const isExpanded = expandedId === group._id;
              const subTotal = getSubTotal(group.items);
              const deliveryFee = group.deliveryFee || 400;
              const finalTotal = group.finalTotal || subTotal + deliveryFee;
              const splitData = calculateSplit(group);

              return (
                <div
                  key={group._id}
                  className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-extrabold text-green-700">
                        {group.title?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">{group.title}</p>
                        <p className="text-xs text-gray-400">
                          by {group.createdBy} · Code:{" "}
                          <span className="font-mono font-bold text-gray-600">{group.groupCode}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {group.status}
                      </span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : group._id)}
                        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 transition cursor-pointer border-none"
                      >
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Members & Info */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">👥 Members</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.members?.map((m, i) => (
                          <span key={i} className="bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                            {m.name}
                          </span>
                        ))}
                        {(!group.members || group.members.length === 0) && (
                          <span className="text-xs text-gray-400">No members yet</span>
                        )}
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-500">
                          💳 {group.paymentMethod || "N/A"}
                        </p>
                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${paymentStatusConfig[group.paymentStatus] || paymentStatusConfig["Pending"]}`}>
                          {group.paymentStatus || "Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Items & Total */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">🍗 Items</p>
                      {group.items?.length ? (
                        <div className="space-y-1">
                          {group.items.map((item) => (
                            <div key={item._id} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item.name} × {item.qty}</span>
                              <span className="text-gray-400 text-xs">{item.addedBy}</span>
                            </div>
                          ))}
                          <div className="border-t border-gray-100 pt-1 mt-1 flex justify-between">
                            <span className="text-xs text-gray-500">Final Total</span>
                            <span className="text-sm font-extrabold text-green-700">
                              Rs. {finalTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No items yet</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 justify-end">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">⚙️ Actions</p>
                      <select
                        value={group.status}
                        onChange={(e) => handleStatusChange(group._id, e.target.value, group)}
                        disabled={isUpdating}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-green-500 transition cursor-pointer disabled:opacity-60"
                      >
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button
                        onClick={() => setDeleteTarget(group._id)}
                        className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                      >
                        🗑️ Delete Group
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Bill Split */}
                  {isExpanded && splitData.length > 0 && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">💰 Bill Split</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {splitData.map((member, i) => (
                          <div key={i} className="rounded-xl bg-white border border-gray-200 px-3 py-2.5 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-bold text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-400">
                                Food Rs. {member.subTotal.toLocaleString()} + Delivery Rs. {member.delivery.toFixed(0)}
                              </p>
                            </div>
                            <span className="text-sm font-extrabold text-green-700">
                              Rs. {member.total.toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGroupOrders;
