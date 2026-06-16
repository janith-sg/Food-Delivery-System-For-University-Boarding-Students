import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { clearAuthWithAudit, getUser } from '../../../../lib/auth';
import { getPostLoginPath } from '../../../../lib/postLoginRedirect';
import AdminPageShell from '../../components/AdminPageShell';
import { UserProfileCard } from '../../components/UserProfileCard';

function workspaceHomeLabel(user) {
  const t = user?.accountType;
  if (t === 'admin') return 'Admin dashboard';
  if (t === 'staff') return 'Back to workspace';
  return 'Back to menu';
}

/** Full-page profile (no admin sidebar): matches dashboard typography and accent. */
export default function AdminProfilePage() {
  const navigate = useNavigate();
  const user = getUser();
  const appHomePath = getPostLoginPath(user);
  const appHomeLabel = workspaceHomeLabel(user);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-admin-surface font-admin text-slate-900 antialiased">
      <header className="shrink-0 border-b border-slate-200/90 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to={appHomePath}
            className="text-sm font-medium text-admin-accent underline-offset-2 hover:underline"
          >
            ← {appHomeLabel}
          </Link>
          <button
            type="button"
            onClick={async () => {
              await clearAuthWithAudit();
              navigate('/login');
            }}
            className="inline-flex items-center gap-2 rounded-full border-0 bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600/50 sm:text-sm sm:px-4 sm:py-2"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <AdminPageShell
          title="User Profile"
          description="View and update your account details and security."
          titleClassName="text-2xl md:text-[1.75rem]"
          descriptionClassName="!mt-1.5"
        />
        <div className="mt-6">
          <UserProfileCard />
        </div>
      </main>
    </div>
  );
}
