import React from 'react';
import AdminPageShell from '../../components/AdminPageShell';
import { MOCK_ROLE_MGMT_STAFF } from '../../constants/adminTabs';

export default function RoleManagementPage() {
  return (
    <AdminPageShell title="Role Management">
      <div className="mt-6 space-y-6">
        <div className="overflow-x-auto">
          <h3 className="mb-2 text-lg font-normal font-serif text-black">Staff</h3>
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
              {MOCK_ROLE_MGMT_STAFF.map((row) => (
                <tr key={row.email} className="hover:bg-[#16a34a]/10">
                  <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.name}</td>
                  <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.email}</td>
                  <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.currentRole}</td>
                  <td className="p-3 text-sm border border-[#16a34a]/25">
                    <select
                      defaultValue={row.assignRole}
                      className="w-full rounded-lg border border-[#16a34a]/40 bg-white px-3 py-1.5 font-normal text-black text-sm outline-none"
                    >
                      <option>Delivery Manager</option>
                      <option>Order Manager</option>
                      <option>Food Menu Manager</option>
                      <option>Customer</option>
                    </select>
                  </td>
                  <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.status}</td>
                  <td className="p-3 border border-[#16a34a]/25">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="rounded-full bg-[#16a34a] px-4 py-2 text-xs font-normal text-white shadow-sm transition hover:bg-[#15803d]">
                        Save Role
                      </button>
                      <button
                        type="button"
                        title="UI only — not connected"
                        className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-normal text-white transition hover:bg-red-700 hover:border-red-700"
                      >
                        Remove this user
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageShell>
  );
}
