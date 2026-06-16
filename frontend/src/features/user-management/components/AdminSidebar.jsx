import React from 'react';
import { LayoutDashboard, MessageCircle, ScrollText, Shield, UserPlus, Users, UsersRound } from 'lucide-react';
import { TAB_PATHS } from '../constants/adminTabs';

const tabs = Object.keys(TAB_PATHS);

const TAB_ICONS = {
  Dashboard: LayoutDashboard,
  'User Registration': UserPlus,
  'Customer Management': Users,
  'Staff Management': UsersRound,
  'User Roles & Permissions': Shield,
  'Logs & Monitoring': ScrollText,
  Chat: MessageCircle,
};

const AdminSidebar = ({ activeTab, onTabClick }) => {
  return (
    <aside className="flex min-h-0 w-full flex-col overflow-hidden pb-4 pl-0 pr-2 pt-4 sm:pr-3 md:h-full">
      <nav className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto" aria-label="Admin sidebar">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          const Icon = TAB_ICONS[tab] || LayoutDashboard;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabClick(tab)}
              className={[
                'group flex min-h-0 w-full flex-1 items-center gap-3 rounded-r-xl rounded-l-none border border-transparent bg-transparent px-4 py-2 pr-3 text-left text-sm transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600/35',
                'hover:border-emerald-200/90 hover:bg-emerald-50 hover:text-[#14532d]',
                isActive ? 'font-semibold text-slate-900' : 'font-medium text-slate-600',
              ].join(' ')}
            >
              <Icon
                className={`h-[22px] w-[22px] shrink-0 ${isActive ? 'text-slate-900 group-hover:text-emerald-700' : 'text-slate-600 group-hover:text-emerald-700'}`}
                strokeWidth={2}
                aria-hidden
              />
              <span className="min-w-0 flex-1 leading-snug">{tab}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
