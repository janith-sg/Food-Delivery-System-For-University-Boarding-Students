import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, Plus, Search, X } from 'lucide-react';
import AdminPageShell from '../../components/AdminPageShell';
import FeedbackModal from '../../components/FeedbackModal';
import { useFeedbackModal } from '../../hooks/useFeedbackModal';

function formatDisplayPhone(phone) {
  const p = String(phone || '').replace(/\s/g, '');
  if (!p) return '—';
  if (/^\d{10}$/.test(p) && p.startsWith('0')) {
    return `+94 ${p.slice(1, 3)} ${p.slice(3, 6)} ${p.slice(6)}`;
  }
  return p;
}

function digitsPhone(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
}

export default function RoleManagementPage() {
  const navigate = useNavigate();
  const { feedback, dismissFeedback, showFeedback } = useFeedbackModal();
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [staff, setStaff] = useState([]);
  const [staffRoleNames, setStaffRoleNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [addFullName, setAddFullName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addStaffRole, setAddStaffRole] = useState('');
  const [addRiderId, setAddRiderId] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [addFormError, setAddFormError] = useState('');
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/users/registered/staff');
      setStaff(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load staff.');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/api/staff-roles/names');
        setStaffRoleNames(Array.isArray(data) ? data : []);
      } catch {
        setStaffRoleNames([]);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    let list = staff;
    if (roleFilter !== 'all') {
      list = list.filter((r) => (r.currentRole || '') === roleFilter);
    }
    const s = q.toLowerCase().trim();
    if (!s) return list;
    return list.filter((r) => {
      const sid = String(r.staffId || r.id || '').toLowerCase();
      const phone = String(r.phone || '').toLowerCase();
      return (
        sid.includes(s) ||
        (r.name || '').toLowerCase().includes(s) ||
        (r.email || '').toLowerCase().includes(s) ||
        phone.includes(s)
      );
    });
  }, [q, roleFilter, staff]);

  useEffect(() => {
    if (addOpen && staffRoleNames.length && !addStaffRole) {
      setAddStaffRole(staffRoleNames[0]);
    }
  }, [addOpen, staffRoleNames, addStaffRole]);

  const closeAddModal = () => {
    setAddOpen(false);
    setAddFormError('');
    setAddFullName('');
    setAddEmail('');
    setAddPassword('');
    setAddPhone('');
    setAddRiderId('');
    setAddStaffRole(staffRoleNames[0] || '');
  };

  const submitAddStaff = async (e) => {
    e.preventDefault();
    setAddFormError('');
    const role = addStaffRole.trim();
    if (!role) {
      setAddFormError('Select a staff role.');
      return;
    }
    setAddSaving(true);
    try {
      const body = {
        fullName: addFullName.trim(),
        email: addEmail.trim(),
        password: addPassword,
        phone: digitsPhone(addPhone),
        staffRole: role,
      };
      if (role === 'Delivery Driver' && addRiderId.trim()) {
        body.riderId = addRiderId.trim();
      }
      await axios.post('/api/users/staff/manual', body);
      await fetchStaff();
      closeAddModal();
      showFeedback('success', 'Staff added', 'The new staff member can sign in with the email and password you set.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not create staff member.';
      setAddFormError(msg);
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <AdminPageShell
      title="Staff Management"
      titleClassName="text-2xl md:text-[1.75rem]"
      actions={
        <button
          type="button"
          onClick={() => {
            setAddFormError('');
            setAddStaffRole(staffRoleNames[0] || '');
            setAddOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600/50"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
          Add User
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

      {addOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget && !addSaving) closeAddModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-staff-title"
            className="max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="add-staff-title" className="text-lg font-bold text-slate-900">
                  Add staff member
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Creates an approved staff account. They can log in immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !addSaving && closeAddModal()}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={submitAddStaff} className="space-y-4">
              <div>
                <label htmlFor="add-staff-name" className="mb-1 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  id="add-staff-name"
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  autoComplete="name"
                  required
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
                  placeholder="e.g. Senuri Perera"
                />
              </div>
              <div>
                <label htmlFor="add-staff-email" className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="add-staff-email"
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label htmlFor="add-staff-password" className="mb-1 block text-sm font-medium text-slate-700">
                  Temporary password
                </label>
                <input
                  id="add-staff-password"
                  type="password"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label htmlFor="add-staff-phone" className="mb-1 block text-sm font-medium text-slate-700">
                  Phone (10 digits)
                </label>
                <input
                  id="add-staff-phone"
                  inputMode="numeric"
                  value={addPhone}
                  onChange={(e) => setAddPhone(digitsPhone(e.target.value))}
                  required
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
                  placeholder="0771234567"
                />
              </div>
              <div>
                <label htmlFor="add-staff-role" className="mb-1 block text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  id="add-staff-role"
                  value={addStaffRole}
                  onChange={(e) => setAddStaffRole(e.target.value)}
                  required
                  className="w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
                >
                  {staffRoleNames.length === 0 ? (
                    <option value="">Loading roles…</option>
                  ) : (
                    staffRoleNames.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))
                  )}
                </select>
              </div>
              {addStaffRole === 'Delivery Driver' ? (
                <div>
                  <label htmlFor="add-staff-rider" className="mb-1 block text-sm font-medium text-slate-700">
                    Rider ID <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="add-staff-rider"
                    value={addRiderId}
                    onChange={(e) => setAddRiderId(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
                    placeholder="Leave blank to use RIDER001"
                  />
                </div>
              ) : null}

              {addFormError ? <p className="text-sm text-red-600">{addFormError}</p> : null}

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={addSaving}
                  onClick={closeAddModal}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSaving || staffRoleNames.length === 0}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {addSaving ? 'Creating…' : 'Create staff account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by staff ID, name, or email..."
              className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
              aria-label="Search staff"
            />
          </div>
          <div className="relative shrink-0 sm:w-44">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-slate-800 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
              aria-label="Filter by role"
            >
              <option value="all">All Users</option>
              {staffRoleNames.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['Staff ID', 'Name', 'Email', 'Phone', 'Role', 'Status'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!loading && rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                        No staff found.
                      </td>
                    </tr>
                  ) : null}
                  {rows.map((row) => {
                    const roleLabel = row.currentRole || 'Staff';
                    const isStaffActive = row.accountActive !== false;
                    return (
                      <tr
                        key={row.id}
                        className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                        onClick={() => navigate(`/admin/staff-management/${row.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/admin/staff-management/${row.id}`);
                          }
                        }}
                        tabIndex={0}
                        role="link"
                        aria-label={`Open staff details for ${row.name}`}
                      >
                        <td className="px-5 py-5 text-sm font-bold text-slate-900">
                          {row.staffId || '—'}
                        </td>
                        <td className="px-5 py-5 text-sm font-normal text-slate-900">{row.name}</td>
                        <td className="max-w-[220px] truncate px-5 py-5 text-sm font-normal text-slate-600">
                          {row.email}
                        </td>
                        <td className="whitespace-nowrap px-5 py-5 text-sm font-normal text-slate-600">
                          {formatDisplayPhone(row.phone)}
                        </td>
                        <td className="px-5 py-5">
                          <span className="inline-flex max-w-full rounded-full bg-blue-50 px-3 py-1 text-xs font-medium leading-tight text-admin-accent">
                            {roleLabel}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          {isStaffActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
                              Deactive
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}
