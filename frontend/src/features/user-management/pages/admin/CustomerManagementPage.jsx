import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import AdminPageShell from '../../components/AdminPageShell';

export default function CustomerManagementPage() {
  const [q, setQ] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleRemove = async (row) => {
    if (!window.confirm(`Remove customer "${row.name}" from the system? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/users/${row.id}`);
      await fetchCustomers();
    } catch (e) {
      window.alert(e.response?.data?.message || 'Could not remove customer.');
    }
  };

  return (
    <AdminPageShell title="Customer Management">
      <div className="mt-6">
        <p className="mb-4 text-sm font-normal text-black/80">
          Approved student (customer) accounts from registration. 
        </p>

        <div className="mb-4">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, or student ID"
            className="w-full max-w-md rounded-lg border border-[#16a34a]/40 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[#16a34a]"
          />
        </div>

        {loading ? <p className="text-sm font-normal text-black">Loading…</p> : null}
        {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}

        <div className="overflow-x-auto">
          {!loading && !error && rows.length > 0 ? (
            <table className="w-full border-collapse rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-[#d1fae5] to-[#dbeafe]">
                  <th className="border border-[#16a34a]/35 p-3 text-left text-sm font-normal text-black">Name</th>
                  <th className="border border-[#16a34a]/35 p-3 text-left text-sm font-normal text-black">Email</th>
                  <th className="border border-[#16a34a]/35 p-3 text-left text-sm font-normal text-black">Student ID</th>
                  <th className="border border-[#16a34a]/35 p-3 text-left text-sm font-normal text-black">Phone</th>
                  <th className="border border-[#16a34a]/35 p-3 text-left text-sm font-normal text-black">Role</th>
                  <th className="border border-[#16a34a]/35 p-3 text-left text-sm font-normal text-black">Status</th>
                  <th className="border border-[#16a34a]/35 p-3 text-left text-sm font-normal text-black">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#16a34a]/10">
                    <td className="border border-[#16a34a]/25 p-3 text-sm font-normal text-black">{row.name}</td>
                    <td className="border border-[#16a34a]/25 p-3 text-sm font-normal text-black">{row.email}</td>
                    <td className="border border-[#16a34a]/25 p-3 font-mono text-sm font-normal text-black">{row.studentId}</td>
                    <td className="border border-[#16a34a]/25 p-3 text-sm font-normal text-black">{row.phone}</td>
                    <td className="border border-[#16a34a]/25 p-3 text-sm font-normal text-black">{row.currentRole}</td>
                    <td className="border border-[#16a34a]/25 p-3 text-sm font-normal text-black">{row.status}</td>
                    <td className="border border-[#16a34a]/25 p-3">
                      <button
                        type="button"
                        onClick={() => handleRemove(row)}
                        className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-normal text-white transition hover:border-red-700 hover:bg-red-700"
                      >
                        Remove Customer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>

        {!loading && !error && customers.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-[#16a34a]/50 bg-[#16a34a]/10 p-3 text-sm font-normal text-black">
            No approved customers yet. Approve customer registrations to see them here.
          </div>
        ) : null}

        {!loading && !error && customers.length > 0 && rows.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-[#16a34a]/50 bg-[#16a34a]/10 p-3 text-sm font-normal text-black">
            No customers match your search.
          </div>
        ) : null}
      </div>
    </AdminPageShell>
  );
}
