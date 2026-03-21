import React, { useState, useMemo } from 'react';
import AdminPageShell from '../../components/AdminPageShell';
import { MOCK_CUSTOMER_MANAGEMENT } from '../../constants/adminTabs';

export default function CustomerManagementPage() {
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerManagementRows] = useState(() => MOCK_CUSTOMER_MANAGEMENT.map((r) => ({ ...r })));

  const filteredCustomerRows = useMemo(
    () =>
      customerManagementRows.filter((row) => {
        const q = customerSearchTerm.toLowerCase();
        return (
          row.name.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          String(row.studentId || '')
            .toLowerCase()
            .includes(q)
        );
      }),
    [customerManagementRows, customerSearchTerm],
  );

  return (
    <AdminPageShell title="Customer Management">
      <div className="mt-6">
        <div className="mb-4">
          <input
            type="text"
            value={customerSearchTerm}
            onChange={(e) => setCustomerSearchTerm(e.target.value)}
            placeholder="Search by customer name or email"
            className="w-full max-w-md rounded-lg border border-[#16a34a]/40 bg-white px-3 py-2 font-normal text-black text-sm outline-none focus:border-[#16a34a]"
          />
        </div>

        <div className="overflow-x-auto">
          {filteredCustomerRows.length > 0 ? (
            <table className="w-full border-collapse rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-[#d1fae5] to-[#dbeafe]">
                  <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Name</th>
                  <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Email</th>
                  <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Student ID</th>
                  <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Phone</th>
                  <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Role</th>
                  <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Status</th>
                  <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomerRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#16a34a]/10">
                    <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.name}</td>
                    <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.email}</td>
                    <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25 font-mono">{row.studentId}</td>
                    <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.phone}</td>
                    <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.currentRole}</td>
                    <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.status}</td>
                    <td className="p-3 border border-[#16a34a]/25">
                      <button
                        type="button"
                        title="UI only — not connected"
                        className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-normal text-white transition hover:bg-red-700 hover:border-red-700"
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

        {filteredCustomerRows.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-[#16a34a]/50 bg-[#16a34a]/10 p-3 text-sm font-normal text-black">
            No customers match your search.
          </div>
        ) : null}
      </div>
    </AdminPageShell>
  );
}
