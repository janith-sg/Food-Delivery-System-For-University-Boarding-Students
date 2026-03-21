import React from 'react';

const tabs = [
  'Dashboard',
  'Customer Registration',
  'Staff Registration',
  'Role Management',
  'Customer Management',
  'User Profile',
  'Support Chatbot',
];

const AdminSidebar = ({ activeTab, onTabClick }) => {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-[#bbf7d0]/70 bg-gradient-to-b from-white via-[#f0fdf4]/40 to-[#eff6ff]/50 p-2 shadow-lg backdrop-blur sm:p-3">
      <p className="mb-1.5 shrink-0 px-1.5 text-[10px] font-normal uppercase tracking-wider text-black sm:mb-2">
        Navigation
      </p>
      <nav className="flex min-h-0 flex-1 flex-col gap-1.5 md:py-0.5" aria-label="Admin sidebar tabs">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          const baseBtn =
            'group flex w-full min-h-0 min-w-0 items-center rounded-xl px-2.5 py-2 text-left text-xs font-normal leading-snug sm:px-3 sm:text-sm md:flex-1 md:py-2.5';
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabClick(tab)}
              className={
                isActive
                  ? `${baseBtn} border border-[#16a34a]/35 bg-gradient-to-r from-[#dcfce7] via-[#ecfdf5] to-[#dbeafe] text-black shadow-md ring-1 ring-[#93c5fd]/40`
                  : `${baseBtn} border border-transparent text-black transition hover:border-[#86efac]/60 hover:bg-gradient-to-r hover:from-[#f0fdf4]/80 hover:to-[#eff6ff]/80`
              }
            >
              <span className="inline-flex min-w-0 w-full flex-1 items-start gap-2">
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#354A3F] ring-2 ring-white/90"
                  aria-hidden
                />
                <span className="min-w-0 flex-1 break-words">{tab}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
