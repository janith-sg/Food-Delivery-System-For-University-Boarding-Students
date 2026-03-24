import React from 'react';
import AdminPageShell from '../../components/AdminPageShell';
import { useAdminRegistrations } from '../../hooks/useAdminRegistrations';

export default function StaffRegistrationPage() {
  const {
    registrationLoading,
    registrationError,
    handleRegistrationApprove,
    handleRegistrationDecline,
    handleDeleteDeclinedRecord,
    pendingStaffRows,
    declinedStaffRows,
  } = useAdminRegistrations();

  return (
    <AdminPageShell title="Staff Registration">
      <div className="mt-6 space-y-10">
        <div>
          <h2 className="text-lg font-normal font-sans text-black">Pending staff review</h2>
          <div className="mt-4 overflow-x-auto">
            {registrationLoading ? <p className="text-sm font-normal text-black">Loading…</p> : null}
            {registrationError ? <p className="text-sm text-red-600 mb-2">{registrationError}</p> : null}
            {!registrationLoading && !registrationError && pendingStaffRows.length === 0 ? (
              <p className="text-sm font-normal text-black">No pending staff registrations.</p>
            ) : null}
            {!registrationLoading && pendingStaffRows.length > 0 ? (
              <table className="w-full border-collapse rounded-xl overflow-hidden min-w-[520px]">
                <thead>
                  <tr className="bg-gradient-to-r from-[#d1fae5] to-[#dbeafe]">
                    <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Name</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Email</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Phone</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStaffRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#16a34a]/10">
                      <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.name}</td>
                      <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.email}</td>
                      <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.phone}</td>
                      <td className="p-3 border border-[#16a34a]/25">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleRegistrationApprove(row)}
                            className="rounded-full bg-[#16a34a] px-4 py-2 text-xs font-normal text-white shadow-sm transition hover:bg-[#15803d]"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRegistrationDecline(row.id)}
                            className="rounded-lg border border-[#16a34a]/35 bg-white px-3 py-1.5 text-xs font-normal text-black transition hover:bg-[#ecfdf5]"
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#16a34a]/30 pt-8">
          <h2 className="text-lg font-normal font-sans text-black">Declined staff registrations</h2>
          <p className="mt-1 text-sm font-normal text-black">Declined staff accounts. Delete a record to remove it from the database.</p>
          <div className="mt-4 overflow-x-auto">
            {registrationLoading ? <p className="text-sm font-normal text-black">Loading…</p> : null}
            {!registrationLoading && !registrationError && declinedStaffRows.length === 0 ? (
              <p className="text-sm font-normal text-black">No declined staff.</p>
            ) : null}
            {!registrationLoading && declinedStaffRows.length > 0 ? (
              <table className="w-full border-collapse rounded-xl overflow-hidden min-w-[680px]">
                <thead>
                  <tr className="bg-red-50">
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Name</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Email</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Phone</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Requested role</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Declined on</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {declinedStaffRows.map((row) => (
                    <tr key={row.id} className="hover:bg-red-50/50">
                      <td className="p-3 text-sm font-normal text-black border border-red-100">{row.name}</td>
                      <td className="p-3 text-sm font-normal text-black border border-red-100">{row.email}</td>
                      <td className="p-3 text-sm font-normal text-black border border-red-100">{row.phone}</td>
                      <td className="p-3 text-sm font-normal text-black border border-red-100">{row.staffRole || '—'}</td>
                      <td className="p-3 text-sm font-normal text-black border border-red-100 whitespace-nowrap">
                        {row.declinedAt
                          ? new Date(row.declinedAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </td>
                      <td className="p-3 border border-red-100">
                        <button
                          type="button"
                          onClick={() => handleDeleteDeclinedRecord(row.id, row.name)}
                          className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-normal text-white transition hover:bg-red-700 hover:border-red-700"
                        >
                          Delete record
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
