import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminPageShell from '../../components/AdminPageShell';

const salesHeights = [82, 95, 76, 88, 110, 72, 105, 84, 98, 120, 90, 0];
const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const salesBarGreen = '#354A3F';

const emptyStats = {
  registeredCustomers: 0,
  pendingRegistrations: 0,
  pendingCustomers: 0,
  pendingStaff: 0,
  registeredStaff: 0,
  approvedThisMonth: 0,
  monthlyTarget: 120,
  monthlyGoalPercent: 0,
  slotsRemainingTowardGoal: 0,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      setLoading(true);
      try {
        const { data } = await axios.get('/api/users/dashboard/stats');
        if (!cancelled && data) {
          setStats({
            registeredCustomers: Number(data.registeredCustomers) || 0,
            pendingRegistrations: Number(data.pendingRegistrations) || 0,
            pendingCustomers: Number(data.pendingCustomers) || 0,
            pendingStaff: Number(data.pendingStaff) || 0,
            registeredStaff: Number(data.registeredStaff) || 0,
            approvedThisMonth: Number(data.approvedThisMonth) || 0,
            monthlyTarget: Number(data.monthlyTarget) || 120,
            monthlyGoalPercent: Number(data.monthlyGoalPercent) || 0,
            slotsRemainingTowardGoal: Number(data.slotsRemainingTowardGoal) || 0,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || e.message || 'Could not load dashboard stats.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fmt = (n) => (loading ? '…' : new Intl.NumberFormat().format(n));

  return (
    <AdminPageShell
      title="Admin Dashboard"
      description="Overview of current user system activity."
      stripClassName="mx-auto"
      titleClassName="text-center text-3xl md:text-4xl"
      descriptionClassName="text-center"
    >
      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="rounded-xl border border-[#86efac]/70 bg-gradient-to-br from-[#ecfdf5] to-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#4ade80]/35">
              <div className="text-sm font-normal text-black">Registered customers</div>
              <div className="mt-2 text-4xl font-normal text-black">{fmt(stats.registeredCustomers)}</div>
              <div className="mt-2 inline-block rounded-full bg-[#bbf7d0] px-3 py-1 text-xs font-normal text-black ring-1 ring-[#16a34a]/25 transition-all duration-300 hover:scale-105">
                {loading ? 'Loading…' : `${fmt(stats.registeredStaff)} approved staff`}
              </div>
            </div>

            <div className="rounded-xl border border-[#93c5fd]/60 bg-gradient-to-br from-[#eff6ff] to-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#60a5fa]/40">
              <div className="text-sm font-normal text-black">Pending registrations</div>
              <div className="mt-2 text-4xl font-normal text-black">{fmt(stats.pendingRegistrations)}</div>
              <div className="mt-2 inline-block rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-normal text-black transition-all duration-300 hover:scale-105">
                {loading
                  ? 'Loading…'
                  : `${fmt(stats.pendingCustomers)} customers · ${fmt(stats.pendingStaff)} staff`}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#a7f3d0]/60 bg-gradient-to-br from-white to-[#f0fdf4]/80 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#354A3F]/20">
            <h2 className="text-xl font-normal font-sans text-black">Monthly Sales</h2>
            <div className="mt-4 h-[210px] rounded-xl border border-[#bfdbfe]/50 bg-gradient-to-b from-[#f8fafc]/95 to-[#eff6ff]/60 px-3 py-3">
              <div className="h-[160px] flex items-end gap-2">
                {salesHeights.map((height, index) => (
                  <div key={months[index]} className="flex-1 flex flex-col items-center justify-end gap-2">
                    <div
                      className={
                        height > 0
                          ? 'w-full max-w-[22px] rounded-t-md shadow-sm transition-all duration-300 hover:scale-105 hover:brightness-110'
                          : 'w-full max-w-[22px]'
                      }
                      style={{
                        height: `${height}px`,
                        backgroundColor: height > 0 ? salesBarGreen : 'transparent',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-12 gap-2 text-[11px] font-normal text-black">
                {months.map((month) => (
                  <div key={month} className="text-center">
                    {month}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-xl border border-[#93c5fd]/50 bg-gradient-to-b from-[#eff6ff]/90 via-white to-[#f0fdf4]/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#3b82f6]/25">
          <h2 className="text-xl font-normal font-sans text-black">Monthly target — new users</h2>
          <p className="mt-1 text-sm font-normal text-black/80">
            Goal for approved customer and staff accounts this month (based on recent account updates).
          </p>

          <div className="mt-6 px-2">
            <div className="mx-auto h-3 max-w-xs overflow-hidden rounded-full bg-slate-200/90">
              <div
                className="h-full rounded-full bg-[#354A3F] transition-all duration-500"
                style={{ width: loading ? '0%' : `${stats.monthlyGoalPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-5xl font-normal text-black">
              {loading ? '…' : `${stats.monthlyGoalPercent}%`}
            </div>
            <div className="mt-2 inline-block rounded-full bg-gradient-to-r from-[#dcfce7] to-[#dbeafe] px-3 py-1 text-xs font-normal text-black ring-1 ring-[#3b82f6]/25 transition-all duration-300 hover:scale-105">
              of monthly new-user goal
            </div>
          </div>

          <p className="mt-5 text-center text-sm font-normal text-black">
            {loading ? (
              'Loading totals…'
            ) : (
              <>
                <span className="font-medium">{fmt(stats.approvedThisMonth)}</span> customer and staff accounts
                counted toward this month&apos;s progress.
                <br />
                {stats.slotsRemainingTowardGoal > 0 ? (
                  <>
                    <span className="font-medium">{fmt(stats.slotsRemainingTowardGoal)}</span> approvals left to
                    reach the <span className="font-medium">{fmt(stats.monthlyTarget)}</span> target.
                  </>
                ) : (
                  <>Monthly target of <span className="font-medium">{fmt(stats.monthlyTarget)}</span> reached or exceeded.</>
                )}
              </>
            )}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-[#86efac]/50 bg-[#ecfdf5]/90 p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="text-xs font-normal text-black">Monthly target</div>
              <div className="text-xl font-normal text-black">{fmt(stats.monthlyTarget)}</div>
            </div>
            <div className="rounded-lg border border-[#93c5fd]/50 bg-[#eff6ff]/90 p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="text-xs font-normal text-black">Approved (MTD)</div>
              <div className="text-xl font-normal text-black">{fmt(stats.approvedThisMonth)}</div>
            </div>
            <div className="rounded-lg border border-[#5eead4]/45 bg-[#f0fdfa]/90 p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="text-xs font-normal text-black">Pending review</div>
              <div className="text-xl font-normal text-black">{fmt(stats.pendingRegistrations)}</div>
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
