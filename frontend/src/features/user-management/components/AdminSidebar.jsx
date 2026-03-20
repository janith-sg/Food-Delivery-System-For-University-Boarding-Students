import React from 'react';

const tabs = [
  'Dashboard',
  'User Registration',
  'Role Management',
  'Staff Management',
  'Customer Management',
  'User Profile',
  'Support Chatbot',
];

const AdminSidebar = ({ activeTab, onTabClick }) => {
  return (
    <aside className="bg-white border border-[#48A111]/45 rounded-2xl p-3 h-full min-h-full flex flex-col">
      <nav className="flex flex-col gap-2 flex-1" aria-label="Admin sidebar tabs">
        {tabs.map((tab, index) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabClick(tab)}
              className={
                isActive
                  ? 'w-full flex-1 text-left px-3 py-3 rounded-xl border border-[#48A111]/50 bg-[#48A111]/35 text-black font-bold'
                  : 'w-full flex-1 text-left px-3 py-3 rounded-xl border border-transparent text-black font-bold hover:bg-[#48A111]/20'
              }
            >
              {tab}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;

