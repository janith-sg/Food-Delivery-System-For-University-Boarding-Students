import React from 'react';
import { Link } from 'react-router-dom';
import { getUser } from '../../../lib/auth';
import LandingLeafIcon from './LandingLeafIcon';

const UserMenuBar = ({ onLogout, onProfileClick }) => {
  const user = getUser();
  const displayName = (user?.fullName && String(user.fullName).trim()) || user?.email || 'Admin';
  const email = user?.email ? String(user.email).trim() : '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#bbf7d0]/60 bg-gradient-to-r from-[#f0fdf4]/95 via-white/90 to-[#eff6ff]/95 backdrop-blur-md">
      <div className="h-0.5 w-full bg-gradient-to-r from-[#16a34a] via-[#4ade80] to-[#2563eb]" aria-hidden />
      <div className="mx-auto flex h-[64px] max-w-[1600px] items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#dcfce7] to-[#a7f3d0] text-black ring-2 ring-white/90 shadow-sm">
            <LandingLeafIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-xl font-bold tracking-tight text-black md:text-2xl">UNI EATS</span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-black sm:block">
              Admin
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onProfileClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#93c5fd]/50 bg-gradient-to-br from-[#dbeafe] to-[#dcfce7] text-black shadow-sm transition hover:from-[#bfdbfe] hover:to-[#bbf7d0]"
            aria-label="Open user profile"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="3" />
            </svg>
          </button>

          <div className="hidden max-w-[200px] leading-tight sm:block md:max-w-[280px]">
            <div className="text-[11px] font-bold uppercase tracking-wide text-black">Hello</div>
            <div className="truncate text-sm font-bold text-black" title={displayName}>
              {displayName}
            </div>
            {email ? (
              <div className="truncate text-[10px] font-normal text-black/65" title={email}>
                {email}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onLogout) onLogout();
            }}
            className="rounded-full border border-[#86efac]/70 bg-gradient-to-r from-white to-[#ecfdf5] px-3 py-2 text-xs font-bold text-black shadow-sm transition hover:border-[#60a5fa]/50 hover:from-[#eff6ff] hover:to-white md:px-4 md:text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default UserMenuBar;
