import React, { useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { clearAuth } from '../../../lib/auth';
import UserMenuBar from '../components/UserMenuBar';
import AdminSidebar from '../components/AdminSidebar';
import LandingLeafIcon from '../components/LandingLeafIcon';
import { TAB_PATHS, pathToTab } from '../constants/adminTabs';
import { USER_PROFILE_PATH } from '../../../lib/postLoginRedirect';

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
      if (tabLabel === 'User Profile') {
        navigate(USER_PROFILE_PATH);
        return;
      }
      const path = TAB_PATHS[tabLabel];
      if (path) navigate(`/admin/${path}`);
    },
    [navigate],
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans font-normal text-black">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 min-h-[45vh]"
        style={{
          background:
            'linear-gradient(155deg, rgba(187, 247, 208, 0.55) 0%, #ecfdf5 20%, #eff6ff 45%, #f0fdf4 70%, #f8fafc 100%)',
        }}
      />
      <div className="pointer-events-none fixed left-4 top-24 h-28 w-28 text-black/15 md:left-10">
        <LandingLeafIcon className="h-full w-full" />
      </div>
      <div className="pointer-events-none fixed right-6 top-36 h-20 w-20 rotate-12 text-black/15 md:right-16">
        <LandingLeafIcon className="h-full w-full" />
      </div>

      <UserMenuBar
        onLogout={() => {
          clearAuth();
          navigate('/login');
        }}
        onProfileClick={() => navigate(USER_PROFILE_PATH)}
      />

      <main className="relative mx-auto max-w-[1600px] p-4 md:p-6">
        <div className="grid min-h-[calc(100vh-104px)] grid-cols-1 items-stretch gap-4 md:grid-cols-[minmax(240px,280px)_1fr] md:gap-6">
          <div className="flex h-full min-h-0 flex-col">
            <AdminSidebar activeTab={activeTab} onTabClick={goToTab} />
          </div>

          <section className="min-h-full rounded-2xl border border-[#bbf7d0]/60 bg-gradient-to-br from-white/98 via-[#f0fdf4]/50 to-[#eff6ff]/40 p-5 shadow-xl backdrop-blur transition-all duration-300 hover:border-[#93c5fd]/40 hover:shadow-2xl md:p-6">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
}
