import React, { useEffect, useMemo, useState } from 'react';
import { LogOut, UserCircle } from 'lucide-react';
import { AUTH_CHANGE_EVENT, getUser } from '../../../lib/auth';

/** Resolve profile image URL from session user (same rules as profile card). */
function profilePhotoSrc(user) {
  const raw = user?.studentPhotoUrl || user?.photoUrl;
  if (typeof raw !== 'string' || !raw.trim()) return '';
  const t = raw.trim();
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('blob:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

/** First name for greeting (from fullName or email local-part). */
function firstNameFromUser(user) {
  const full = (user?.fullName && String(user.fullName).trim()) || '';
  if (full) return full.split(/\s+/)[0];
  const em = user?.email ? String(user.email).split('@')[0] : '';
  return em || 'User';
}

/** Human-readable role: staff job title, or account type label. */
function roleLabelFromUser(user) {
  if (!user) return '—';
  const at = String(user.accountType || '').toLowerCase();
  if (at === 'admin') return 'Administrator';
  if (at === 'staff') {
    const sr = String(user.staffRole || '').trim();
    return sr || 'Staff';
  }
  if (at === 'customer') return 'Customer';
  return user.accountType ? String(user.accountType) : 'User';
}

const UserMenuBar = ({ onLogout, onProfileClick }) => {
  const [user, setUser] = useState(() => getUser());
  const [avatarError, setAvatarError] = useState(false);
  const firstName = firstNameFromUser(user);
  const roleLabel = roleLabelFromUser(user);
  const photoSrc = useMemo(() => profilePhotoSrc(user), [user]);

  useEffect(() => {
    const sync = () => {
      setUser(getUser());
    };
    sync();
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, sync);
  }, []);

  useEffect(() => {
    setAvatarError(false);
  }, [photoSrc]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="relative mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-center px-3 py-2 sm:min-h-[76px] sm:px-6 md:px-8">
        {/* Left: role + Online status */}
        <div className="absolute left-3 top-1/2 z-10 max-w-[40%] -translate-y-1/2 sm:left-4 md:left-8">
          <div className="flex w-fit max-w-full flex-col gap-1">
            <span
              className="inline-block max-w-full truncate rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold leading-tight text-admin-accent sm:text-sm"
              title={roleLabel}
            >
              {roleLabel}
            </span>
            <span
              className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 sm:text-sm"
              title="Online"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              Online
            </span>
          </div>
        </div>

        {/* Center: branding (bold, larger, centered) */}
        <div className="w-full min-w-0 px-[4.5rem] text-center sm:px-28 md:px-36 lg:px-44">
          <p className="mx-auto max-w-5xl text-sm font-extrabold uppercase leading-tight tracking-tight text-[#0B8E3A] sm:text-base md:text-lg lg:text-xl">
            UNI EATS - FOOD ORDERING AND DELIVERY SYSTEM FOR UNIVERSITY BORDING STUDENTS
          </p>
        </div>

        {/* Right: greeting (opens profile) → Logout */}
        <div className="absolute right-3 top-1/2 z-10 flex max-w-[42%] -translate-y-1/2 shrink-0 items-center gap-1.5 sm:right-4 sm:gap-2 md:right-8 md:gap-3">
          <button
            type="button"
            onClick={onProfileClick}
            className="inline-flex min-w-0 items-center gap-2 rounded-md border-0 bg-transparent px-1.5 py-1 text-left text-slate-700 shadow-none outline-none ring-0 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/35 focus-visible:ring-offset-0"
            aria-label="Open user profile"
          >
            {photoSrc && !avatarError ? (
              <img
                src={photoSrc}
                alt=""
                width={36}
                height={36}
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-200 sm:h-9 sm:w-9"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <UserCircle
                className="h-5 w-5 shrink-0 text-slate-500 sm:h-6 sm:w-6"
                strokeWidth={2}
                aria-hidden
              />
            )}
            <span className="hidden min-w-0 text-sm sm:inline" title={firstName}>
              Hello,{' '}
              <span className="font-semibold text-admin-accent">{firstName}</span>
            </span>
            <span className="max-w-[4rem] truncate text-[11px] sm:hidden" title={firstName}>
              Hi, <span className="font-semibold text-admin-accent">{firstName}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onLogout) onLogout();
            }}
            className="inline-flex items-center gap-2 rounded-full border-0 bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600/50 sm:px-4 sm:py-2.5"
          >
            <LogOut className="h-4 w-4 shrink-0 text-white" strokeWidth={2} aria-hidden />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default UserMenuBar;
