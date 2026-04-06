import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check, Pencil, Trash2, User, X } from 'lucide-react';
import FeedbackModal from '../../components/FeedbackModal';
import ConfirmModal from '../../components/ConfirmModal';
import { useFeedbackModal } from '../../hooks/useFeedbackModal';

function formatDisplayPhone(phone) {
  const p = String(phone || '').replace(/\s/g, '');
  if (!p) return '—';
  if (/^\d{10}$/.test(p) && p.startsWith('0')) {
    return `+94 ${p.slice(1, 3)} ${p.slice(3, 6)} ${p.slice(6)}`;
  }
  return p;
}

function formatDateDMY(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function photoSrc(photoUrl) {
  const u = String(photoUrl || '').trim();
  if (!u) return null;
  if (u.startsWith('http')) return u;
  return u;
}

export default function StaffDetailPage() {
  const { staffId: routeStaffId } = useParams();
  const navigate = useNavigate();
  const { feedback, dismissFeedback, showFeedback } = useFeedbackModal();

  const [staff, setStaff] = useState([]);
  const [staffRoleNames, setStaffRoleNames] = useState([]);
  const [assignRoleById, setAssignRoleById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingById, setSavingById] = useState({});
  const [removingById, setRemovingById] = useState({});
  const [removeStaffPending, setRemoveStaffPending] = useState(null);

  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [deactivationPeriod, setDeactivationPeriod] = useState('');
  const [activeToggle, setActiveToggle] = useState(true);
  const [savingAccountActive, setSavingAccountActive] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

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

  const row = useMemo(
    () => staff.find((s) => s.id === routeStaffId) ?? null,
    [staff, routeStaffId],
  );

  useEffect(() => {
    if (!row) return;
    setShowRoleEditor(false);
    setActiveToggle(row.accountActive !== false);
    setDeactivationPeriod(
      row.accountActive === false && row.deactivationPeriod ? String(row.deactivationPeriod) : '',
    );
    setEditOpen(false);
  }, [row?.id, row?.accountActive, row?.deactivationPeriod]);

  const handleAccountActiveToggle = async () => {
    if (!row || savingAccountActive) return;
    const goingInactive = activeToggle === true;
    if (goingInactive && !deactivationPeriod) {
      showFeedback(
        'error',
        'Deactivation period required',
        'Choose a deactivation period before disabling this account.',
      );
      return;
    }
    const next = !activeToggle;
    setSavingAccountActive(true);
    try {
      await axios.patch(`/api/users/${row.id}/account-active`, {
        accountActive: next,
        ...(next ? {} : { deactivationPeriod }),
      });
      await fetchStaff();
      showFeedback(
        'success',
        'Success',
        next ? 'Staff account is active.' : 'Staff account has been deactivated. Login is disabled for this user.',
      );
    } catch (e) {
      showFeedback(
        'error',
        'Could not update',
        e.response?.data?.message || e.message || 'Update failed.',
      );
    } finally {
      setSavingAccountActive(false);
    }
  };

  const openEditDetails = () => {
    if (!row) return;
    setEditName(row.name || '');
    setEditEmail(row.email || '');
    setEditPhone(String(row.phone || '').replace(/\D/g, '').slice(0, 10));
    setEditOpen(true);
  };

  const handleSaveRole = async () => {
    if (!row) return;
    const selected = assignRoleById[row.id] || row.assignRole || row.currentRole || 'Delivery Manager';
    setSavingById((p) => ({ ...p, [row.id]: true }));
    try {
      await axios.patch(`/api/users/${row.id}/staff-role`, { staffRole: selected });
      await fetchStaff();
      showFeedback('success', 'Success', `Role for "${row.name}" is now ${selected}.`);
    } catch (e) {
      showFeedback(
        'error',
        'Could not update role',
        e.response?.data?.message || e.message || 'Could not update role.',
      );
    } finally {
      setSavingById((p) => ({ ...p, [row.id]: false }));
    }
  };

  const saveRoleAndCloseEditor = async () => {
    await handleSaveRole();
    setShowRoleEditor(false);
  };

  const confirmRemoveStaffUser = async () => {
    if (!removeStaffPending) return;
    const u = removeStaffPending;
    setRemoveStaffPending(null);
    setRemovingById((p) => ({ ...p, [u.id]: true }));
    try {
      await axios.delete(`/api/users/${u.id}`);
      showFeedback('success', 'Removed', `Staff user "${u.name}" has been removed.`);
      navigate('/admin/staff-management', { replace: true });
    } catch (e) {
      showFeedback(
        'error',
        'Could not remove',
        e.response?.data?.message || e.message || 'Could not remove user.',
      );
    } finally {
      setRemovingById((p) => ({ ...p, [u.id]: false }));
    }
  };

  const handleSaveProfile = async () => {
    if (!row) return;
    const name = editName.trim();
    const email = editEmail.trim().toLowerCase();
    const phoneDigits = String(editPhone || '').replace(/\D/g, '').slice(0, 10);
    if (!name || !email || phoneDigits.length !== 10) {
      showFeedback('error', 'Invalid details', 'Enter full name, valid email, and a 10-digit phone number.');
      return;
    }
    setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append('fullName', name);
      fd.append('email', email);
      fd.append('phone', phoneDigits);
      await axios.patch(`/api/users/${row.id}/profile`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditOpen(false);
      await fetchStaff();
      showFeedback('success', 'Saved', 'Staff details were updated.');
    } catch (e) {
      showFeedback(
        'error',
        'Could not save',
        e.response?.data?.message || e.message || 'Update failed.',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const savingRole = row ? Boolean(savingById[row.id]) : false;
  const removing = row ? Boolean(removingById[row.id]) : false;

  if (loading) {
    return (
      <div className="text-slate-800">
        <Link
          to="/admin/staff-management"
          className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to staff list
        </Link>
        <p className="text-base text-slate-500">Loading…</p>
      </div>
    );
  }

  if (error && !staff.length) {
    return (
      <div className="text-slate-800">
        <Link
          to="/admin/staff-management"
          className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to staff list
        </Link>
        <p className="text-base text-red-600">{error}</p>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="text-slate-800">
        <Link
          to="/admin/staff-management"
          className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to staff list
        </Link>
        <p className="text-base text-slate-600">This staff member could not be found.</p>
      </div>
    );
  }

  const roleLabel = row.currentRole || 'Staff';
  const selectedRole = assignRoleById[row.id] || row.currentRole || 'Delivery Manager';
  const imgUrl = photoSrc(row.photoUrl);

  return (
    <div className="flex min-h-0 flex-1 flex-col text-slate-900">
      <FeedbackModal
        open={Boolean(feedback)}
        variant={feedback?.variant ?? 'success'}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        onClose={dismissFeedback}
      />
      <ConfirmModal
        open={Boolean(removeStaffPending)}
        title="Remove staff user?"
        message={
          removeStaffPending
            ? `Remove "${removeStaffPending.name}" from the system? This cannot be undone.`
            : ''
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemoveStaffUser}
        onCancel={() => setRemoveStaffPending(null)}
        danger
      />

      <Link
        to="/admin/staff-management"
        className="mb-2 inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to staff list
      </Link>

      <article className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
        <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight text-black md:text-2xl">Staff Details</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            Active
          </span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row lg:items-stretch lg:gap-4 lg:p-4">
          <aside className="flex shrink-0 flex-row items-center gap-3 border-b border-slate-100 pb-3 lg:w-48 lg:flex-col lg:items-center lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4 lg:text-center">
            <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 ring-2 ring-slate-100 lg:h-[5.25rem] lg:w-[5.25rem]">
              {imgUrl ? (
                <img src={imgUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-sky-600 lg:h-11 lg:w-11" strokeWidth={1.15} aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1 text-left lg:text-center">
              <h2 className="truncate text-lg font-bold text-black lg:text-xl">{row.name}</h2>
              <p className="truncate text-sm text-slate-600 lg:text-base">{roleLabel}</p>
              <p className="mt-1 text-sm text-slate-500">
                ID <span className="font-semibold text-slate-700">{row.staffId || '—'}</span>
              </p>
            </div>
          </aside>

          <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 md:grid-rows-2 md:items-stretch md:gap-3">
            <section className="flex min-h-0 flex-col rounded-lg border border-slate-200/80 bg-slate-50 p-4 md:min-h-[158px]">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Contact
              </h3>
              <div className="mt-3 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-800">{row.email}</p>
                  <p
                    className={`mt-1 inline-flex items-center gap-1 text-sm font-medium ${
                      row.emailVerified ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {row.emailVerified ? (
                      <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <X className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                    )}
                    {row.emailVerified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
                <div className="min-w-0 border-t border-slate-200/80 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Phone
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDisplayPhone(row.phone)}
                  </p>
                  <p
                    className={`mt-1 inline-flex items-center gap-1 text-sm font-medium ${
                      row.phoneVerified ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {row.phoneVerified ? (
                      <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <X className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                    )}
                    {row.phoneVerified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
              </div>
            </section>

            <section className="flex min-h-0 flex-col rounded-lg border border-slate-200/80 bg-slate-50 p-4 md:min-h-[158px]">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Dates</h3>
              <dl className="mt-3 flex flex-1 flex-col justify-center gap-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Created</dt>
                  <dd className="font-semibold text-slate-900">{formatDateDMY(row.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Updated</dt>
                  <dd className="font-semibold text-slate-900">{formatDateDMY(row.updatedAt)}</dd>
                </div>
              </dl>
            </section>

            <section className="flex min-h-0 flex-col rounded-lg border border-slate-200/80 bg-slate-50 p-4 md:min-h-[158px]">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Roles</h3>
              {showRoleEditor ? (
                <div className="mt-3 flex flex-1 flex-col justify-center gap-3">
                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setAssignRoleById((p) => ({ ...p, [row.id]: e.target.value }))
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25"
                  >
                    {staffRoleNames.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={savingRole || removing}
                      onClick={saveRoleAndCloseEditor}
                      className="rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                    >
                      {savingRole ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      disabled={savingRole}
                      onClick={() => setShowRoleEditor(false)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-1 flex-col justify-center gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-900">{roleLabel}</p>
                  <button
                    type="button"
                    disabled={removing}
                    onClick={() => setShowRoleEditor(true)}
                    className="w-fit shrink-0 rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-60"
                  >
                    Change Role
                  </button>
                </div>
              )}
            </section>

            <section className="flex min-h-0 flex-col rounded-lg border border-slate-200/80 bg-slate-50 p-4 md:min-h-[158px]">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Stats</h3>
              <div className="mt-3 flex flex-1 flex-col justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                <label className="sr-only" htmlFor="staff-deactivation-period">
                  Deactivation period
                </label>
                <select
                  id="staff-deactivation-period"
                  value={deactivationPeriod}
                  onChange={(e) => setDeactivationPeriod(e.target.value)}
                  disabled={!activeToggle || savingAccountActive}
                  title={
                    !activeToggle
                      ? 'Reactivate the account to change the period'
                      : 'Required before turning Active off'
                  }
                  className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600"
                >
                  <option value="">Deactivation period…</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="permanent">Permanent</option>
                </select>
                <div className="flex shrink-0 items-center gap-2.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={activeToggle}
                    disabled={savingAccountActive}
                    title={
                      activeToggle && !deactivationPeriod
                        ? 'Select a deactivation period before disabling this account'
                        : undefined
                    }
                    onClick={handleAccountActiveToggle}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                      activeToggle ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                        activeToggle ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-slate-900">Active</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap gap-3 border-t border-slate-100 bg-white px-4 py-3">
          <button
            type="button"
            disabled={removing || savingRole}
            onClick={openEditDetails}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600/50"
          >
            <Pencil className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
            Edit Details
          </button>
          <button
            type="button"
            disabled={removing || savingRole}
            onClick={() => setRemoveStaffPending(row)}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
            Remove User
          </button>
        </footer>
      </article>

      {editOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-staff-title"
          onClick={() => !savingProfile && setEditOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="edit-staff-title" className="text-xl font-semibold text-slate-900">
              Edit staff details
            </h3>
            <p className="mt-2 text-base text-slate-500">Name, email, and phone for this account.</p>
            <div className="mt-4 space-y-4">
              <label className="block text-base font-medium text-slate-700">
                Full name
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/25"
                />
              </label>
              <label className="block text-base font-medium text-slate-700">
                Email
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/25"
                />
              </label>
              <label className="block text-base font-medium text-slate-700">
                Phone (10 digits)
                <input
                  inputMode="numeric"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/25"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={savingProfile}
                onClick={handleSaveProfile}
                className="rounded-md bg-admin-accent px-4 py-2.5 text-base font-semibold text-white hover:bg-admin-accent-hover disabled:opacity-60"
              >
                {savingProfile ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                disabled={savingProfile}
                onClick={() => setEditOpen(false)}
                className="rounded-md border border-slate-200 px-4 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
