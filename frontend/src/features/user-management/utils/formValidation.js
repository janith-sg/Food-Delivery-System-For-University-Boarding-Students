// Small client-side helpers used by `LoginPage.jsx`.
// For real security, the backend (`backend/routes/login.js`, `backend/routes/register.js`) validates again.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_REGEX.test(value.trim());
}

export function digitsOnlyMax10(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
}

export function isPhone10Digits(value) {
  return digitsOnlyMax10(value).length === 10;
}

// Two English letters + exactly 8 digits (e.g. IT23419314)
const STUDENT_ID_REGEX = /^[A-Za-z]{2}\d{8}$/;

export function isValidStudentId(value) {
  return typeof value === 'string' && STUDENT_ID_REGEX.test(value.trim());
}

