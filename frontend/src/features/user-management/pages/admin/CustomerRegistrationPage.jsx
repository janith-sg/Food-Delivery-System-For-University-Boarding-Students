import React from 'react';
import AdminPageShell from '../../components/AdminPageShell';
import { useAdminRegistrations } from '../../hooks/useAdminRegistrations';

export default function CustomerRegistrationPage() {
  const {
    registrationLoading,
    registrationError,
    handleRegistrationApprove,
    handleRegistrationDecline,
    handleDeleteDeclinedRecord,
    pendingCustomerRows,
    declinedCustomerRows,
  } = useAdminRegistrations();

  return (
    <AdminPageShell title="Customer Registration">
      <div className="mt-6 space-y-10">
        <div>
          <h2 className="text-lg font-normal font-serif text-black">Pending customer review</h2>
          <div className="mt-4 overflow-x-auto">
            {registrationLoading ? <p className="text-sm font-normal text-black">Loading…</p> : null}
            {registrationError ? <p className="text-sm text-red-600 mb-2">{registrationError}</p> : null}
            {!registrationLoading && !registrationError && pendingCustomerRows.length === 0 ? (
              <p className="text-sm font-normal text-black">No pending customer registrations.</p>
            ) : null}
            {!registrationLoading && pendingCustomerRows.length > 0 ? (
              <table className="w-full border-collapse rounded-xl overflow-hidden min-w-[720px]">
                <thead>
                  <tr className="bg-gradient-to-r from-[#d1fae5] to-[#dbeafe]">
                    <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Name</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Email</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Student ID</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Phone</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">ID Photo</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-[#16a34a]/35">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCustomerRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#16a34a]/10">
                      <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.name}</td>
                      <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.email}</td>
                      <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25 font-mono">{row.studentId}</td>
                      <td className="p-3 text-sm font-normal text-black border border-[#16a34a]/25">{row.phone}</td>
                      <td className="p-3 border border-[#16a34a]/25">
                        <div className="w-16 h-16">
                          {row.photoUrl ? (
                            <img
                              src={row.photoUrl}
                              alt={`${row.name} ID`}
                              className="w-16 h-16 rounded-lg object-cover border border-[#16a34a]/35 transition-transform duration-200 hover:scale-[3.2] hover:z-20 relative cursor-zoom-in"
                            />
                          ) : (
                            <span className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-[#16a34a]/40 text-[10px] text-black/50 font-normal">
                              No photo
                            </span>
                          )}
                        </div>
                      </td>
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
          <h2 className="text-lg font-normal font-serif text-black">Declined customer registrations</h2>
          
          <div className="mt-4 overflow-x-auto">
            {registrationLoading ? <p className="text-sm font-normal text-black">Loading…</p> : null}
            {!registrationLoading && !registrationError && declinedCustomerRows.length === 0 ? (
              <p className="text-sm font-normal text-black">No declined customers.</p>
            ) : null}
            {!registrationLoading && declinedCustomerRows.length > 0 ? (
              <table className="w-full border-collapse rounded-xl overflow-hidden min-w-[800px]">
                <thead>
                  <tr className="bg-red-50">
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Name</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Email</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Student ID</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Phone</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">ID Photo</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Declined on</th>
                    <th className="text-left p-3 text-sm font-normal text-black border border-red-200/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {declinedCustomerRows.map((row) => (
                    <tr key={row.id} className="hover:bg-red-50/50">
                      <td className="p-3 text-sm font-normal text-black border border-red-100">{row.name}</td>
                      <td className="p-3 text-sm font-normal text-black border border-red-100">{row.email}</td>
                      <td className="p-3 text-sm font-normal text-black border border-red-100 font-mono">{row.studentId}</td>
                      <td className="p-3 text-sm font-normal text-black border border-red-100">{row.phone}</td>
                      <td className="p-3 border border-red-100">
                        <div className="w-14 h-14">
                          {row.photoUrl ? (
                            <img src={row.photoUrl} alt="" className="w-14 h-14 rounded-lg object-cover border border-red-200/80" />
                          ) : (
                            <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-red-200 text-[9px] font-normal text-black/45">
                              —
                            </span>
                          )}
                        </div>
                      </td>
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
