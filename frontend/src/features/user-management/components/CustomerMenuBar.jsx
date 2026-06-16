import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ShoppingCart, UserCircle } from 'lucide-react';
import { AUTH_CHANGE_EVENT, getUser } from '../../../lib/auth';
import NotificationBell from '../../../components/NotificationBell';

function scrollToAllProducts() {
  const el = document.getElementById('all-products');
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const path = window.location.pathname + window.location.search;
  window.history.replaceState(null, '', `${path}#all-products`);
  return true;
}

/** Resolve profile image URL from session user (same rules as profile card). */
function profilePhotoSrc(user) {
  const raw = user?.studentPhotoUrl || user?.photoUrl;
  if (typeof raw !== 'string' || !raw.trim()) return '';
  const t = raw.trim();
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('blob:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function firstNameFromUser(user) {
  const full = (user?.fullName && String(user.fullName).trim()) || '';
  if (full) return full.split(/\s+/)[0];
  const em = user?.email ? String(user.email).split('@')[0] : '';
  return em || 'User';
}

function roleLabelFromUser(user) {
  if (!user) return '—';
  const at = String(user.accountType || '').toLowerCase();
  if (at === 'customer') return 'Customer';
  return user.accountType ? String(user.accountType) : 'User';
}

/**
 * Top bar for logged-in customers: role + nav (Home, Our Menu, Group Order, My Orders) + cart + profile + logout.
 * Replaces the long UNI EATS branding used in {@link UserMenuBar}.
 */
const CustomerMenuBar = ({ onLogout, onProfileClick, cartItemsCount = 0, onCartClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => getUser());
  const [avatarError, setAvatarError] = useState(false);
  const firstName = firstNameFromUser(user);
  const roleLabel = roleLabelFromUser(user);
  const photoSrc = useMemo(() => profilePhotoSrc(user), [user]);

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, sync);
  }, []);

  useEffect(() => {
    setAvatarError(false);
  }, [photoSrc]);

  const count = Number(cartItemsCount) || 0;
  const notificationUserId =
    String(user?.userId || user?.id || user?.studentId || user?._id || '').trim() || 'USER001';

  const handleOurMenuClick = (event) => {
    event.preventDefault();

    const isMenuPage = location.pathname.startsWith('/menu');
    if (!isMenuPage) {
      navigate('/menu#all-products');
      return;
    }

    const scrolled = scrollToAllProducts();
    if (!scrolled) {
      window.setTimeout(scrollToAllProducts, 200);
      window.setTimeout(scrollToAllProducts, 500);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="relative mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-center px-3 py-2 sm:min-h-[76px] sm:px-6 md:px-8">
        {/* Left: role + Online */}
        <div className="absolute left-3 top-1/2 z-10 max-w-[34%] -translate-y-1/2 sm:left-4 md:left-8">
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

        {/* Center: Home, Our Menu, Group Order, My Orders */}
        <nav
          className="flex w-full min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-2 px-16 text-center sm:gap-x-5 sm:px-24 md:gap-x-8 md:px-32 lg:px-40"
          aria-label="Main navigation"
        >
          <Link
            to="/"
            className="text-xs font-semibold text-slate-700 no-underline transition hover:text-[#0B8E3A] sm:text-sm md:text-base"
          >
            Home
          </Link>
          <a
            href="#all-products"
            className="text-xs font-semibold text-slate-700 no-underline transition hover:text-[#0B8E3A] sm:text-sm md:text-base"
            onClick={handleOurMenuClick}
          >
            Our Menu
          </a>
          <Link
            to="/group-order"
            className="text-xs font-semibold text-slate-700 no-underline transition hover:text-[#0B8E3A] sm:text-sm md:text-base"
          >
            Group Order
          </Link>
          <Link
            to="/customer/dashboard"
            className="text-xs font-semibold text-slate-700 no-underline transition hover:text-[#0B8E3A] sm:text-sm md:text-base"
          >
            My Orders
          </Link>
        </nav>

        {/* Right: cart → profile → logout */}
        <div className="absolute right-3 top-1/2 z-10 flex max-w-[45%] -translate-y-1/2 shrink-0 items-center gap-1.5 sm:right-4 sm:gap-2 md:right-8 md:gap-3">
          <button
            type="button"
            onClick={onCartClick}
            className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-emerald-50 text-emerald-700 shadow-none outline-none ring-0 transition hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-0 sm:h-9 sm:w-9"
            aria-label={`Open cart (${count} items)`}
          >
            <ShoppingCart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2} aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.125rem] items-center justify-center rounded-full border-0 bg-emerald-600 px-1 text-[9px] font-bold leading-none text-white shadow-none ring-0 sm:text-[10px]">
              {count}
            </span>
          </button>

          <button
            type="button"
            onClick={onProfileClick}
            className="inline-flex min-w-0 items-center gap-2 rounded-md border-0 bg-transparent px-1 py-1 text-left text-slate-700 shadow-none outline-none ring-0 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/35 focus-visible:ring-offset-0 sm:px-1.5"
            aria-label="Open user profile"
          >
            {photoSrc && !avatarError ? (
              <img
                src={photoSrc}
                alt=""
                width={36}
                height={36}
                className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-slate-200 sm:h-8 sm:w-8 md:h-9 md:w-9"
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

      <NotificationBell role="customer" userId={notificationUserId} />
    </>
  );
};

export default CustomerMenuBar;
