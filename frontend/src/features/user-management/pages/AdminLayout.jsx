import React, { useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { clearAuthWithAudit } from '../../../lib/auth';
import UserMenuBar from '../components/UserMenuBar';
import AdminSidebar from '../components/AdminSidebar';
import { TAB_PATHS, pathToTab } from '../constants/adminTabs';
import { getProfilePath } from '../../../lib/postLoginRedirect';
import { getUser } from '../../../lib/auth';

/** Must match UserMenuBar header height (centered branding + padding) */
const HEADER_H_PX = 96;

function getSlugFromPath(pathname) {
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean);
  if (parts[0] !== 'admin') return '';
  return parts[1] || '';
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const slug = getSlugFromPath(location.pathname);
  const activeTab = pathToTab[slug] || 'Dashboard';

  useEffect(() => {
    if (slug && !pathToTab[slug]) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [slug, navigate]);

  const goToTab = useCallback(
    (tabLabel) => {
      const path = TAB_PATHS[tabLabel];
      if (path) navigate(`/admin/${path}`);
    },
    [navigate],
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 font-admin text-slate-900 antialiased">
      <UserMenuBar
        onLogout={async () => {
          await clearAuthWithAudit();
          navigate('/login');
        }}
        onProfileClick={() => navigate(getProfilePath(getUser()))}
      />

      <div
        className="flex min-h-0 w-full flex-1 flex-col bg-slate-100 md:flex-row"
        style={{ minHeight: `calc(100vh - ${HEADER_H_PX}px)` }}
      >
        {/* height in calc must match HEADER_H_PX — white sidebar; ash gap shows in main section padding */}
        <div className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white md:h-[calc(100vh-96px)] md:min-h-0 md:w-[260px] md:border-b-0 lg:w-[280px]">
          <AdminSidebar activeTab={activeTab} onTabClick={goToTab} />
        </div>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-slate-100 px-4 pb-4 pt-4 md:px-6 md:pb-6 md:pt-6">
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm md:p-8">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
