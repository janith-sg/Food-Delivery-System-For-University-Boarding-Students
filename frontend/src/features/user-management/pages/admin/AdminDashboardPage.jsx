import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageSquare, Shield, UserCheck, Users } from 'lucide-react';
import AdminPageShell from '../../components/AdminPageShell';

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
  unreadNotifications: 0,
  userRolesCount: 0,
  customerActivationPercent: 0,
  staffActivationPercent: 0,
};

const ARC_PATH = 'M 20 80 A 60 60 0 0 1 140 80';

function StatCard({ accent, label, value, icon: Icon, footer, footerClassName = 'text-slate-500' }) {
  const accentMap = {
    blue: { bar: 'border-l-admin-accent', iconBg: 'bg-admin-hover', icon: 'text-admin-accent' },
    green: { bar: 'border-l-emerald-500', iconBg: 'bg-emerald-50', icon: 'text-emerald-600' },
    purple: { bar: 'border-l-violet-500', iconBg: 'bg-violet-50', icon: 'text-violet-600' },
    orange: { bar: 'border-l-orange-500', iconBg: 'bg-orange-50', icon: 'text-orange-600' },
  };
  const a = accentMap[accent] || accentMap.blue;

  return (
    <div
      className={`relative rounded-xl border border-slate-200/90 border-l-4 ${a.bar} bg-white p-5 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-base font-bold leading-snug text-slate-800 sm:text-lg">{label}</span>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${a.iconBg} ${a.icon}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      {footer ? <p className={`mt-2 text-xs font-medium ${footerClassName}`}>{footer}</p> : null}
    </div>
  );
}

function ActivationGauge({ title, percent, loading, variant = 'emerald' }) {
  const p = loading ? 0 : Math.min(100, Math.max(0, Number(percent) || 0));
  const strokeActive = variant === 'admin' ? '#1e5eff' : '#22c55e';
  const legendDot =
    variant === 'admin' ? 'bg-admin-accent' : 'bg-emerald-500';

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mx-auto mt-2 flex justify-center" style={{ maxWidth: 220 }}>
        <svg viewBox="0 0 160 92" className="h-auto w-full" aria-hidden>
          <path
            d={ARC_PATH}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100 0"
          />
          <path
            d={ARC_PATH}
            fill="none"
            stroke={strokeActive}
            strokeWidth="14"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${p} ${100 - p}`}
            className={loading ? 'opacity-40' : ''}
            style={{ transition: 'stroke-dasharray 0.6s ease-out' }}
          />
        </svg>
      </div>
      <div className="mt-1 text-center text-2xl font-bold text-slate-900">
        {loading ? '…' : `${p}%`}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2 text-sm text-admin-ink">
        <span className={`h-2.5 w-2.5 rounded-sm ${legendDot}`} aria-hidden />
        <span>Active</span>
      </div>
    </div>
  );
}

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
            unreadNotifications: Number(data.unreadNotifications) || 0,
            userRolesCount: Number(data.userRolesCount) || 0,
            customerActivationPercent: Number(data.customerActivationPercent) || 0,
            staffActivationPercent: Number(data.staffActivationPercent) || 0,
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
    <AdminPageShell title="Overview" titleClassName="text-2xl md:text-[1.75rem]">
      {error ? (
        <p className="mt-4 rounded-lg border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            accent="blue"
            label="Total Staff"
            value={fmt(stats.registeredStaff)}
            icon={Users}
          />
          <StatCard
            accent="green"
            label="Total Customers"
            value={fmt(stats.registeredCustomers)}
            icon={UserCheck}
          />
          <StatCard
            accent="purple"
            label="User Roles"
            value={fmt(stats.userRolesCount)}
            icon={Shield}
          />
          <StatCard
            accent="orange"
            label="Unread Messages"
            value={fmt(stats.unreadNotifications)}
            icon={MessageSquare}
            footer={stats.unreadNotifications > 0 ? 'Needs attention' : 'All caught up'}
            footerClassName={
              stats.unreadNotifications > 0 ? 'text-orange-600' : 'text-slate-500'
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ActivationGauge
            title="Customer Activation Status"
            percent={stats.customerActivationPercent}
            loading={loading}
          />
          <ActivationGauge
            title="Staff Activation Status"
            percent={stats.staffActivationPercent}
            loading={loading}
            variant="admin"
          />
        </div>
      </div>
    </AdminPageShell>
  );
}
