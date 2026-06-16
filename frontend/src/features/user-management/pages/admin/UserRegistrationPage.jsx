import React from 'react';
import AdminPageShell from '../../components/AdminPageShell';
import IdPhotoLightbox from '../../components/IdPhotoLightbox';
import FeedbackModal from '../../components/FeedbackModal';
import { useAdminRegistrations } from '../../hooks/useAdminRegistrations';

export default function UserRegistrationPage() {
  const {
    registrationLoading,
    registrationError,
    handleRegistrationApprove,
    handleRegistrationDecline,
    pendingCustomerRows,
    pendingStaffRows,
    feedback,
    dismissFeedback,
  } = useAdminRegistrations();

  return (
    <AdminPageShell title="User Registration" titleClassName="text-2xl md:text-[1.75rem]">
      <FeedbackModal
        open={Boolean(feedback)}
        variant={feedback?.variant ?? 'success'}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        onClose={dismissFeedback}
      />

      <div className="mt-8 space-y-10">
        {registrationLoading ? <p className="text-sm text-slate-500">Loading…</p> : null}
        {registrationError ? <p className="text-sm text-red-600">{registrationError}</p> : null}

        {/* Staff requests */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Staff requests</h2>
          {!registrationLoading && !registrationError && pendingStaffRows.length === 0 ? (
            <p className="text-sm text-admin-ink">No pending staff registrations.</p>
          ) : null}
          {!registrationLoading && pendingStaffRows.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {['Name', 'Email', 'Phone', 'Requested role', 'Actions'].map((h) => (
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
                    {pendingStaffRows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                        <td className="px-5 py-5 text-sm text-slate-900">{row.name}</td>
                        <td className="max-w-[220px] truncate px-5 py-5 text-sm text-slate-600">{row.email}</td>
                        <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-600">{row.phone}</td>
                        <td className="px-5 py-5">
                          <span className="inline-flex max-w-full rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-admin-accent">
                            {row.staffRole?.trim() || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleRegistrationApprove(row)}
                              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRegistrationDecline(row.id, row)}
                              className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600/50"
                            >
                              Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        {/* Customer (student) requests */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Customer (student) requests</h2>
          {!registrationLoading && !registrationError && pendingCustomerRows.length === 0 ? (
            <p className="text-sm text-admin-ink">No pending student registrations.</p>
          ) : null}
          {!registrationLoading && pendingCustomerRows.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {['Name', 'Email', 'Student ID', 'Phone', 'ID Photo', 'Actions'].map((h) => (
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
                    {pendingCustomerRows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                        <td className="px-5 py-5 text-sm text-slate-900">{row.name}</td>
                        <td className="max-w-[220px] truncate px-5 py-5 text-sm text-slate-600">{row.email}</td>
                        <td className="px-5 py-5 font-mono text-sm text-slate-900">{row.studentId}</td>
                        <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-600">{row.phone}</td>
                        <td className="px-5 py-5">
                          <div className="flex h-16 w-16 items-center">
                            {row.photoUrl ? (
                              <IdPhotoLightbox src={row.photoUrl} alt={`${row.name} student ID`}>
                                <img
                                  src={row.photoUrl}
                                  alt=""
                                  className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                                />
                              </IdPhotoLightbox>
                            ) : (
                              <span className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[10px] font-normal text-slate-400">
                                No photo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleRegistrationApprove(row)}
                              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRegistrationDecline(row.id, row)}
                              className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600/50"
                            >
                              Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AdminPageShell>
  );
}
