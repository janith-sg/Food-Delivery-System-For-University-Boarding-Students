import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';
import AdminPageShell from '../../components/AdminPageShell';
import FeedbackModal from '../../components/FeedbackModal';
import ConfirmModal from '../../components/ConfirmModal';
import { useFeedbackModal } from '../../hooks/useFeedbackModal';

export default function CustomerManagementPage() {
  const navigate = useNavigate();
  const { feedback, dismissFeedback, showFeedback } = useFeedbackModal();
  const [q, setQ] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removeCustomerPending, setRemoveCustomerPending] = useState(null);

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

  const rows = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return customers;
    return customers.filter(
      (row) =>
        row.name.toLowerCase().includes(s) ||
        row.email.toLowerCase().includes(s) ||
        String(row.studentId || '').toLowerCase().includes(s),
    );
  }, [customers, q]);

  const confirmRemoveCustomer = async () => {
    if (!removeCustomerPending) return;
    const row = removeCustomerPending;
    setRemoveCustomerPending(null);
    try {
      await axios.delete(`/api/users/${row.id}`);
      await fetchCustomers();
      showFeedback('success', 'Removed', `Customer "${row.name}" has been removed from the system.`);
    } catch (e) {
      showFeedback(
        'error',
        'Could not remove',
        e.response?.data?.message || 'Could not remove customer.',
      );
    }
  };

  return (
    <AdminPageShell title="Customer Management" titleClassName="text-2xl md:text-[1.75rem]">
      <FeedbackModal
        open={Boolean(feedback)}
        variant={feedback?.variant ?? 'success'}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        onClose={dismissFeedback}
      />
      <ConfirmModal
        open={Boolean(removeCustomerPending)}
        title="Remove customer?"
        message={
          removeCustomerPending
            ? `Remove "${removeCustomerPending.name}" from the system? This cannot be undone.`
            : ''
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemoveCustomer}
        onCancel={() => setRemoveCustomerPending(null)}
        danger
      />
      <div className="mt-8 space-y-4">
        <div className="relative min-w-0 max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, or student ID"
            className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
            aria-label="Search customers"
          />
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error && rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['Name', 'Email', 'Student ID', 'Phone', 'Role', 'Status', 'Action'].map((h) => (
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
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                      onClick={() => navigate(`/admin/customer-management/${row.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/admin/customer-management/${row.id}`);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={`Open customer details for ${row.name}`}
                    >
                      <td className="px-5 py-5 text-sm text-slate-900">{row.name}</td>
                      <td className="max-w-[220px] truncate px-5 py-5 text-sm text-slate-600">{row.email}</td>
                      <td className="px-5 py-5 font-mono text-sm text-slate-900">{row.studentId}</td>
                      <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-600">{row.phone}</td>
                      <td className="px-5 py-5 text-sm text-slate-900">{row.currentRole}</td>
                      <td className="px-5 py-5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                          {row.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRemoveCustomerPending(row);
                          }}
                          className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-red-700 hover:bg-red-700"
                        >
                          Remove Customer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {!loading && !error && customers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-admin-ink">
            No approved customers yet. Approve customer registrations to see them here.
          </div>
        ) : null}

        {!loading && !error && customers.length > 0 && rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-admin-ink">
            No customers match your search.
          </div>
        ) : null}
      </div>
    </AdminPageShell>
  );
}
