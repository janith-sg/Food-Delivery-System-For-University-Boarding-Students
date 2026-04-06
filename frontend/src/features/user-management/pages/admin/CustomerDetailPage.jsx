import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check, Pencil, Trash2, User, X } from 'lucide-react';
import FeedbackModal from '../../components/FeedbackModal';
import ConfirmModal from '../../components/ConfirmModal';
import IdPhotoLightbox from '../../components/IdPhotoLightbox';
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

function photoUrlSrc(photoUrl) {
  const u = String(photoUrl || '').trim();
  if (!u) return null;
  if (u.startsWith('http')) return u;
  return u.startsWith('/') ? u : `/${u}`;
}

export default function CustomerDetailPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { feedback, dismissFeedback, showFeedback } = useFeedbackModal();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(false);
  const [removePending, setRemovePending] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/users/registered/customers');
      setCustomers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load customers.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const row = useMemo(
    () => customers.find((c) => c.id === customerId) ?? null,
    [customers, customerId],
  );

  useEffect(() => {
    if (!row) return;
    setEditOpen(false);
  }, [row?.id]);

  const openEditDetails = () => {
    if (!row) return;
    setEditName(row.name || '');
    setEditEmail(row.email || '');
    setEditPhone(String(row.phone || '').replace(/\D/g, '').slice(0, 10));
    setEditOpen(true);
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
      await fetchCustomers();
      showFeedback('success', 'Saved', 'Customer details were updated.');
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

  const confirmRemove = async () => {
    if (!removePending) return;
    const u = removePending;
    setRemovePending(null);
    setRemoving(true);
    try {
      await axios.delete(`/api/users/${u.id}`);
      showFeedback('success', 'Removed', `Customer "${u.name}" has been removed.`);
      navigate('/admin/customer-management', { replace: true });
    } catch (e) {
      showFeedback(
        'error',
        'Could not remove',
        e.response?.data?.message || e.message || 'Could not remove customer.',
      );
    } finally {
      setRemoving(false);
    }
  };

  const imgUrl = row ? photoUrlSrc(row.photoUrl) : null;

  if (loading) {
    return (
      <div className="text-slate-800">
        <Link
          to="/admin/customer-management"
          className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to customer list
        </Link>
        <p className="text-base text-slate-500">Loading…</p>
      </div>
    );
  }

  if (error && !customers.length) {
    return (
      <div className="text-slate-800">
        <Link
          to="/admin/customer-management"
          className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to customer list
        </Link>
        <p className="text-base text-red-600">{error}</p>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="text-slate-800">
        <Link
          to="/admin/customer-management"
          className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to customer list
        </Link>
        <p className="text-base text-slate-600">This customer could not be found.</p>
      </div>
    );
  }

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
        open={Boolean(removePending)}
        title="Remove customer?"
        message={
          removePending
            ? `Remove "${removePending.name}" from the system? This cannot be undone.`
            : ''
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={() => setRemovePending(null)}
        danger
      />

      <Link
        to="/admin/customer-management"
        className="mb-2 inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to customer list
      </Link>

      <article className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
        <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Customer details</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
            {row.status || 'Active'}
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
              <h2 className="truncate text-lg font-bold text-slate-900 lg:text-xl">{row.name}</h2>
              <p className="truncate text-sm text-slate-600 lg:text-base">{row.currentRole || 'Customer'}</p>
              <p className="mt-1 text-sm text-slate-500">
                Student ID{' '}
                <span className="font-mono font-semibold text-slate-700">{row.studentId || '—'}</span>
              </p>
            </div>
          </aside>

          <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 md:gap-3">
            <section className="flex min-h-0 flex-col rounded-lg border border-slate-200/80 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contact</h3>
              <div className="mt-3 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{formatDisplayPhone(row.phone)}</p>
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

            <section className="flex min-h-0 flex-col rounded-lg border border-slate-200/80 bg-slate-50 p-4">
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

            <section className="md:col-span-2 flex min-h-0 flex-col rounded-lg border border-slate-200/80 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Student ID photo</h3>
              <div className="mt-3 flex justify-start">
                {imgUrl ? (
                  <IdPhotoLightbox src={imgUrl} alt={`${row.name} student ID`}>
                    <img
                      src={imgUrl}
                      alt="Student ID"
                      className="h-32 w-auto max-w-full rounded-lg border border-slate-200 object-cover"
                    />
                  </IdPhotoLightbox>
                ) : (
                  <span className="flex h-28 w-40 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
                    No photo on file
                  </span>
                )}
              </div>
            </section>
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap gap-3 border-t border-slate-100 bg-white px-4 py-3">
          <button
            type="button"
            disabled={removing}
            onClick={openEditDetails}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600/50"
          >
            <Pencil className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
            Edit details
          </button>
          <button
            type="button"
            disabled={removing}
            onClick={() => setRemovePending(row)}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
            Remove customer
          </button>
        </footer>
      </article>

      {editOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-customer-title"
          onClick={() => !savingProfile && setEditOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="edit-customer-title" className="text-xl font-semibold text-slate-900">
              Edit customer details
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
