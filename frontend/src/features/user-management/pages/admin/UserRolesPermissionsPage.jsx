import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AdminPageShell from '../../components/AdminPageShell';
import FeedbackModal from '../../components/FeedbackModal';
import ConfirmModal from '../../components/ConfirmModal';
import { useFeedbackModal } from '../../hooks/useFeedbackModal';

function formatDateDMY(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function UserRolesPermissionsPage() {
  const { feedback, dismissFeedback, showFeedback } = useFeedbackModal();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [savingAdd, setSavingAdd] = useState(false);

  const [editRow, setEditRow] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteRow, setDeleteRow] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/staff-roles');
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load roles.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return rows;
    return rows.filter((r) => {
      const idStr = String(r.roleId ?? '');
      return (
        idStr.includes(s) ||
        (r.roleName || '').toLowerCase().includes(s) ||
        (r.description || '').toLowerCase().includes(s)
      );
    });
  }, [rows, q]);

  const submitAdd = async () => {
    const name = addName.trim();
    if (!name) {
      showFeedback('error', 'Required', 'Enter a role name.');
      return;
    }
    setSavingAdd(true);
    try {
      await axios.post('/api/staff-roles', {
        name,
        description: addDescription.trim(),
      });
      setAddOpen(false);
      setAddName('');
      setAddDescription('');
      await fetchRoles();
      showFeedback('success', 'Created', 'Role added successfully.');
    } catch (e) {
      showFeedback(
        'error',
        'Could not add',
        e.response?.data?.message || 'Could not create role.',
      );
    } finally {
      setSavingAdd(false);
    }
  };

  const openEdit = (r) => {
    setEditRow(r);
    setEditName(r.roleName || '');
    setEditDescription(r.description || '');
  };

  const submitEdit = async () => {
    if (!editRow) return;
    const name = editName.trim();
    if (!name) {
      showFeedback('error', 'Required', 'Enter a role name.');
      return;
    }
    setSavingEdit(true);
    try {
      await axios.patch(`/api/staff-roles/${editRow.id}`, {
        name,
        description: editDescription.trim(),
      });
      setEditRow(null);
      await fetchRoles();
      showFeedback('success', 'Updated', 'Role updated successfully.');
    } catch (e) {
      showFeedback(
        'error',
        'Could not update',
        e.response?.data?.message || 'Could not update role.',
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    const id = deleteRow.id;
    setDeleteRow(null);
    try {
      await axios.delete(`/api/staff-roles/${id}`);
      await fetchRoles();
      showFeedback('success', 'Deleted', 'Role removed.');
    } catch (e) {
      showFeedback(
        'error',
        'Could not delete',
        e.response?.data?.message || 'Could not delete role.',
      );
    }
  };

  return (
    <AdminPageShell
      title="User Roles & Permissions"
      titleClassName="text-2xl md:text-[1.75rem]"
      actions={
        <button
          type="button"
          onClick={() => {
            setAddName('');
            setAddDescription('');
            setAddOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600/50"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
          Add User Role
        </button>
      }
    >
      <FeedbackModal
        open={Boolean(feedback)}
        variant={feedback?.variant ?? 'success'}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        onClose={dismissFeedback}
      />
      <ConfirmModal
        open={Boolean(deleteRow)}
        title="Delete role?"
        message={
          deleteRow
            ? `Delete role "${deleteRow.roleName}"? This cannot be undone if no staff use it.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRow(null)}
        danger
      />

      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative min-w-0 max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by role ID or role name..."
              className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
              aria-label="Search roles"
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['Role ID', 'Role name', 'Description', 'Created date', 'User count', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                        No roles loaded. Check your connection or try again.
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                        No roles match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">{r.roleId}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex max-w-full rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-admin-accent">
                            {r.roleName}
                          </span>
                        </td>
                        <td className="max-w-xs px-5 py-4 text-sm text-admin-ink">{r.description || '—'}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                          {formatDateDMY(r.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {r.userCount} {r.userCount === 1 ? 'user' : 'users'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(r)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-admin-accent transition hover:bg-admin-hover"
                            >
                              <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                              Change role
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteRow(r)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add modal */}
      {addOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-role-title"
          onClick={() => !savingAdd && setAddOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="add-role-title" className="text-lg font-semibold text-slate-900">
              Add user role
            </h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Role name
                <input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20"
                  placeholder="e.g. Order Manager"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20"
                  placeholder="What this role can do"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={savingAdd}
                onClick={submitAdd}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {savingAdd ? 'Saving…' : 'Add role'}
              </button>
              <button
                type="button"
                disabled={savingAdd}
                onClick={() => setAddOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit modal */}
      {editRow ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-role-title"
          onClick={() => !savingEdit && setEditRow(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="edit-role-title" className="text-lg font-semibold text-slate-900">
              Change role
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Renaming updates all staff assigned to this role.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Role name
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={savingEdit}
                onClick={submitEdit}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {savingEdit ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => setEditRow(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
