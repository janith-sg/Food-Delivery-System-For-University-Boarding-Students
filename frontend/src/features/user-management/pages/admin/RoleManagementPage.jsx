import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdminPageShell from '../../components/AdminPageShell';
import { STAFF_ROLES } from '../../constants/adminTabs';

export default function RoleManagementPage() {
  const [q, setQ] = useState('');
  const [staff, setStaff] = useState([]);
  const [assignRoleById, setAssignRoleById] = useState({});
  const [savingById, setSavingById] = useState({});
  const [removingById, setRemovingById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/users/registered/staff');
      const rows = Array.isArray(data) ? data : [];
      setStaff(rows);
      setAssignRoleById((prev) => {
        const next = { ...prev };
        rows.forEach((r) => {
          if (!next[r.id]) {
            next[r.id] = r.assignRole || r.currentRole || 'Delivery Manager';
          }
        });
        return next;
      });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load staff.');
      setStaff([]);
      setAssignRoleById({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const rows = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return staff;
    return staff.filter(
      (r) => r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s),
    );
  }, [q, staff]);

  const handleSaveRole = async (row) => {
    const selected = assignRoleById[row.id] || row.assignRole || row.currentRole || 'Delivery Manager';
    setSavingById((p) => ({ ...p, [row.id]: true }));
    setError('');
    try {
      await axios.patch(`/api/users/${row.id}/staff-role`, { staffRole: selected });
      await fetchStaff();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not update role.');
    } finally {
      setSavingById((p) => ({ ...p, [row.id]: false }));
    }
  };

  const handleRemoveUser = async (row) => {
    if (!window.confirm(`Remove staff user "${row.name}"? This cannot be undone.`)) return;
    setRemovingById((p) => ({ ...p, [row.id]: true }));
    setError('');
    try {
      await axios.delete(`/api/users/${row.id}`);
      await fetchStaff();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not remove user.');
    } finally {
      setRemovingById((p) => ({ ...p, [row.id]: false }));
    }
  };

  return (
    <AdminPageShell title="Role Management">
      <div className="mt-6 space-y-6">
        <div className="overflow-x-auto">
          <h3 className="mb-2 text-lg font-normal font-sans text-black">Staff</h3>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search staff by name or email…"
              className="w-full rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-normal text-black outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15 sm:max-w-[420px]"
            />
            <button
              type="button"
              onClick={fetchStaff}
              disabled={loading}
              className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold text-black shadow-sm transition hover:bg-black/5 disabled:opacity-60"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
          {loading ? <p className="mb-3 text-sm text-black">Loading…</p> : null}
          <table className="w-full border-collapse rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-[#d1fae5] to-[#dbeafe]">
                <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Name</th>
                <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Email</th>
                <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Current Role</th>
                <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Change Role</th>
                <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Status</th>
                <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-sm font-normal text-black border border-[#16a34a]/25">
                    No staff found.
                  </td>
                </tr>
              ) : null}
              {rows.map((row) => {
                const selected = assignRoleById[row.id] || row.assignRole || row.currentRole || 'Delivery Manager';
                const saving = Boolean(savingById[row.id]);
                const removing = Boolean(removingById[row.id]);
                return (
                  <tr key={row.id} className="hover:bg-[#16a34a]/10">
                    <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.name}</td>
                    <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.email}</td>
                    <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.currentRole}</td>
                    <td className="p-3 text-sm border border-[#16a34a]/25">
                      <select
                        value={selected}
                        onChange={(e) => {
                          const v = e.target.value;
                          setAssignRoleById((p) => ({ ...p, [row.id]: v }));
                        }}
                        className="w-full rounded-lg border border-[#16a34a]/40 bg-white px-3 py-1.5 font-normal text-black text-sm outline-none"
                      >
                        {STAFF_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.status}</td>
                    <td className="p-3 border border-[#16a34a]/25">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={saving || removing}
                          onClick={() => handleSaveRole(row)}
                          className="rounded-full bg-[#16a34a] px-4 py-2 text-xs font-normal text-white shadow-sm transition hover:bg-[#15803d] disabled:opacity-60"
                        >
                          {saving ? 'Saving…' : 'Save Role'}
                        </button>
                        <button
                          type="button"
                          disabled={saving || removing}
                          onClick={() => handleRemoveUser(row)}
                          className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-normal text-white transition hover:bg-red-700 hover:border-red-700 disabled:opacity-60"
                        >
                          {removing ? 'Removing…' : 'Remove this user'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageShell>
  );
}
