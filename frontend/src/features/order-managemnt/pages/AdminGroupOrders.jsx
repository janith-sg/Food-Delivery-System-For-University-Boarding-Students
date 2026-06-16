import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const statusConfig = {
  Open: { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Closed: { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Completed: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

const paymentStatusConfig = {
  Pending: "bg-amber-100 text-amber-700",
  Paid: "bg-emerald-100 text-emerald-700",
};

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl"></div>
      <p className="mb-1 text-center font-bold text-gray-800">Delete Group Order?</p>
      <p className="mb-6 text-center text-sm text-gray-500">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 cursor-pointer rounded-xl border-none bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
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

  useEffect(() => {
    fetchGroups();
  }, []);

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
      if (response.ok) fetchGroups();
      else alert(data.message || "Failed to update group order");
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(apiUrl(`/api/group-orders/${deleteTarget}`), { method: "DELETE" });
      const data = await response.json();
      if (response.ok) fetchGroups();
      else alert(data.message || "Failed to delete group order");
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const statuses = ["All", "Open", "Closed", "Completed"];
  const filtered = filterStatus === "All" ? groups : groups.filter((g) => g.status === filterStatus);

  const statusCounts = { All: groups.length, Open: 0, Closed: 0, Completed: 0 };
  groups.forEach((g) => {
    if (statusCounts[g.status] !== undefined) statusCounts[g.status]++;
  });

  const getSubTotal = (items = []) => items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0);

  const calculateSplit = (group) => {
    const items = Array.isArray(group?.items) ? group.items : [];
    if (!items.length) return [];

    const memberTotals = {};
    items.forEach((item) => {
      const addedBy = item?.addedBy || "Unknown";
      memberTotals[addedBy] = (memberTotals[addedBy] || 0) + (item?.price || 0) * (item?.qty || 0);
    });

    const members = Object.keys(memberTotals);
    const share = members.length > 0 ? (group?.deliveryFee || 200) / members.length : 0;

    return members.map((name) => ({
      name,
      subTotal: memberTotals[name],
      delivery: share,
      total: memberTotals[name] + share,
    }));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/60 to-white font-sans shadow-sm">
      {deleteTarget && (
        <ConfirmModal
          message="This will permanently remove the group order."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex items-center justify-between border-b border-emerald-200 bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-100">Admin Panel</p>
          <h1 className="text-xl font-extrabold text-white">Group Order Management</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2">
          <span className="text-lg font-extrabold text-white">{groups.length}</span>
          <span className="text-xs font-semibold text-emerald-100">Total Groups</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-emerald-100 bg-white/70 px-6 py-4">
        {statuses.map((s) => {
          const cfg = statusConfig[s];
          const count = statusCounts[s];
          const isActive = filterStatus === s;

          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                isActive
                  ? s === "All"
                    ? "border-green-600 bg-green-600 text-white"
                    : `${cfg?.color} border-current`
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {cfg && <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />}
              {s}
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-extrabold ${
                  isActive && s === "All" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="h-7 w-7 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl"></div>
            <p className="font-bold text-gray-700">No group orders found</p>
            <p className="text-sm text-gray-400">
              {filterStatus !== "All" ? `No "${filterStatus}" group orders yet.` : "Group orders will appear here once created."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((group) => {
              const cfg = statusConfig[group?.status] || statusConfig.Open;
              const isUpdating = updatingId === group?._id;
              const isExpanded = expandedId === group?._id;

              const title = group?.title || "Untitled Group";
              const createdBy = group?.createdBy || "Unknown";
              const code = group?.groupCode || "N/A";
              const members = Array.isArray(group?.members) ? group.members : [];
              const items = Array.isArray(group?.items) ? group.items : [];

              const subTotal = getSubTotal(items);
              const deliveryFee = group?.deliveryFee || 200;
              const finalTotal = group?.finalTotal || subTotal + deliveryFee;
              const splitData = calculateSplit(group);

              return (
                <div key={group?._id || code} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-extrabold text-green-700">
                        {title.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">{title}</p>
                        <p className="text-xs text-gray-400">
                          by {createdBy}  Code: <span className="font-mono font-bold text-gray-600">{code}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${cfg.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {group?.status || "Open"}
                      </span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : group?._id)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-gray-200 text-xs font-bold text-gray-600 transition hover:bg-gray-300"
                      >
                        {isExpanded ? "" : ""}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Members</p>
                      <div className="flex flex-wrap gap-1.5">
                        {members.map((m, i) => (
                          <span key={`${m?.name || "member"}-${i}`} className="rounded-full border border-green-100 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                            {m?.name || "Unknown"}
                          </span>
                        ))}
                        {!members.length && <span className="text-xs text-gray-400">No members yet</span>}
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-500">{group?.paymentMethod || "N/A"}</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${paymentStatusConfig[group?.paymentStatus] || paymentStatusConfig.Pending}`}>
                          {group?.paymentStatus || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Items</p>
                      {items.length ? (
                        <div className="space-y-1">
                          {items.map((item, idx) => (
                            <div key={item?._id || `${group?._id}-${idx}`} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item?.name || "Item"} x {item?.qty || 0}</span>
                              <span className="text-xs text-gray-400">{item?.addedBy || "Unknown"}</span>
                            </div>
                          ))}
                          <div className="mt-1 flex justify-between border-t border-gray-100 pt-1">
                            <span className="text-xs text-gray-500">Final Total</span>
                            <span className="text-sm font-extrabold text-green-700">Rs. {finalTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No items yet</p>
                      )}
                    </div>

                    <div className="flex flex-col justify-end gap-2">
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">Actions</p>
                      <select
                        value={group?.status || "Open"}
                        onChange={(e) => handleStatusChange(group?._id, e.target.value, group)}
                        disabled={isUpdating}
                        className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-green-500 disabled:opacity-60"
                      >
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button
                        onClick={() => setDeleteTarget(group?._id)}
                        className="w-full cursor-pointer rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                      >
                        Delete Group
                      </button>
                    </div>
                  </div>

                  {isExpanded && splitData.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 pb-4 pt-3">
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Bill Split</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {splitData.map((member, i) => (
                          <div key={`${member.name}-${i}`} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                            <div>
                              <p className="text-sm font-bold text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-400">
                                Food Rs. {member.subTotal.toLocaleString()} + Delivery Rs. {member.delivery.toFixed(0)}
                              </p>
                            </div>
                            <span className="text-sm font-extrabold text-green-700">Rs. {member.total.toFixed(0)}</span>
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
