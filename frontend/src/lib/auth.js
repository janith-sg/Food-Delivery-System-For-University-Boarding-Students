import axios from 'axios';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/** Fired on same-tab login, profile update, or logout so UI (e.g. UserMenuBar) can re-read the user. */
export const AUTH_CHANGE_EVENT = 'uni-eats-auth-change';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Call after successful login */
export function setAuth(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  syncAxiosAuth();
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

/** Call on logout */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete axios.defaults.headers.common.Authorization;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

/** Records "Logged Out" server-side before clearing the session (fire-and-forget safe). */
export async function clearAuthWithAudit() {
  const token = getToken();
  if (token) {
    try {
      await axios.post(
        '/api/audit-logs/logout-event',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      /* ignore — still log out locally */
    }
  }
  clearAuth();
}

/** Attach Bearer token to all axios requests (e.g. after page refresh) */
export function syncAxiosAuth() {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}

export function isAuthenticated() {
  return Boolean(getToken() && getUser());
}
