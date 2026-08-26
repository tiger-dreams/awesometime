const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * Progress through a given calendar year as of `now`.
 * @param {number} year
 * @param {Date} now
 */
export function yearProgress(year, now = new Date()) {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const nowMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const total = daysInYear(year);

  const clamped = Math.min(Math.max(nowMs, start), end - ONE_DAY_MS);
  const daysElapsed = Math.round((clamped - start) / ONE_DAY_MS) + 1;
  const daysRemaining = total - daysElapsed;
  const percent = Math.round((daysElapsed / total) * 1000) / 10;

  return { year, daysInYear: total, daysElapsed, daysRemaining, percent };
}

/**
 * Time remaining (or elapsed, if in the past) until a target date.
 * @param {Date} target
 * @param {Date} now
 */
export function countdown(target, now = new Date()) {
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const abs = Math.abs(diffMs);

  const days = Math.floor(abs / ONE_DAY_MS);
  const hours = Math.floor((abs % ONE_DAY_MS) / (60 * 60 * 1000));
  const minutes = Math.floor((abs % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((abs % (60 * 1000)) / 1000);

  return { isPast, totalMs: abs, days, hours, minutes, seconds };
}

/**
 * Parse a `YYYY-MM-DD` (optionally with time) date string as UTC.
 * Returns null for anything that doesn't parse to a valid date.
 * @param {string} str
 */
export function parseDateParam(str) {
  if (!str || typeof str !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(str.trim());
  if (!match) return null;
  const [, y, mo, d, h = '0', mi = '0', s = '0'] = match;
  const date = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  if (Number.isNaN(date.getTime())) return null;
  // Reject overflowed components (e.g. 2026-13-40 rolling over to a valid Date)
  if (date.getUTCFullYear() !== +y || date.getUTCMonth() !== +mo - 1 || date.getUTCDate() !== +d) {
    return null;
  }
  return date;
}
