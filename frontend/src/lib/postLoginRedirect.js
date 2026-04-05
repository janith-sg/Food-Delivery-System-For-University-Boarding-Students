/**
 * Default landing path after login (and when a logged-in user hits /login or /register).
 * Keep in sync with backend `constants/staffRoles.js` and staff routes in App.jsx.
 */

const STAFF_ROLE_HOME = {
  'food menu manager': '/food-menu',
  'order manager': '/staff/orders',
  'delivery driver': '/staff/delivery',
  'delivery manager': '/',
};

function normalizedStaffRole(user) {
  return String(user?.staffRole || '')
    .trim()
    .toLowerCase();
}

export function getPostLoginPath(user) {
  if (!user) return '/';

  if (user.accountType === 'admin') {
    return '/admin/dashboard';
  }

  if (user.accountType === 'customer') {
    return '/';
  }

  if (user.accountType === 'staff') {
    const key = normalizedStaffRole(user);
    if (STAFF_ROLE_HOME[key] !== undefined) {
      return STAFF_ROLE_HOME[key];
    }
  }

  return '/';
}

/**
 * After login: use `from` only when it is a real deep link — not `/login`, `/register`,
 * or `/` for non-customers (otherwise staff/admin would stay on the public home).
 */
export function resolvePostLoginDestination(user, fromPathname) {
  const home = getPostLoginPath(user);
  const from = typeof fromPathname === 'string' ? fromPathname : '';
  if (!from || from === '/login' || from === '/register') return home;
  if (from === '/' && user?.accountType && user.accountType !== 'customer') return home;
  return from;
}
