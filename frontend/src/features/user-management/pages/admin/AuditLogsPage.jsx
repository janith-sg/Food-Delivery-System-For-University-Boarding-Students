import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Search } from 'lucide-react';
import { syncAxiosAuth } from '../../../../lib/auth';
import AdminPageShell from '../../components/AdminPageShell';

function formatDateLine(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTimeLine(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mi}:${ss}`;
}

const REFRESH_MS = 3 * 60 * 1000;

export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const fetchLogs = useCallback(async (opts = { silent: false }) => {
    const silent = Boolean(opts.silent);
    if (!silent) setLoading(true);
    setError('');
    try {
      syncAxiosAuth();
      const params = {};
      const s = debouncedQ.trim();
      if (s) params.q = s;
      if (dateFilter) params.date = dateFilter;
      const { data } = await axios.get('/api/audit-logs', { params });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      const status = e.response?.status;
      const serverMsg = e.response?.data?.message;
      if (status === 401) {
        setError(
          'Unauthorized — your login session may have expired, or the server could not verify your token. Log out and log in again as an admin.',
        );
      } else {
        setError(serverMsg || e.message || 'Could not load audit logs.');
      }
      setRows([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [debouncedQ, dateFilter]);

  useEffect(() => {
    fetchLogs({ silent: false });
  }, [fetchLogs]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchLogs({ silent: true });
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchLogs]);

  return (
    <AdminPageShell
      title="Audit Logs"
      actions={
        <div
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm"
          title="List refreshes automatically every 3 minutes"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
          Auto-refresh: 3 min
        </div>
      }
    >
      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1 max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, user ID, or action..."
              className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
              aria-label="Search audit logs"
            />
          </div>
          <div className="relative shrink-0 sm:min-w-[180px]">
            <Calendar
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/35"
              aria-label="Filter by date"
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['Log ID', 'User', 'Timestamp', 'Action', 'IP address'].map((h) => (
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
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                        No audit logs yet. Sign in and out to generate entries.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          #{r.logId ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-slate-800">
                          <div className="font-medium text-slate-900">{r.userName || r.userId || '—'}</div>
                          {r.userName && r.userId && r.userName !== r.userId ? (
                            <div className="mt-0.5 text-xs text-slate-500">{r.userId}</div>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-slate-800">
                          <div className="leading-tight">
                            <div>{formatDateLine(r.timestamp)}</div>
                            <div className="text-xs text-slate-500">{formatTimeLine(r.timestamp)}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                            {r.action || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-700">
                          {r.ipAddress || '—'}
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
    </AdminPageShell>
  );
}
