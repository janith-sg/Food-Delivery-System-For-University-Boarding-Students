// Simple helpers for forms (beginner-friendly)

/** Basic email check: must look like name@domain.tld */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_REGEX.test(value.trim());
}

/** Keep only digits, max length 10 (for phone fields) */
export function digitsOnlyMax10(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
}

export function isPhone10Digits(value) {
  return digitsOnlyMax10(value).length === 10;
}
