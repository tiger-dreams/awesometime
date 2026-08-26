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

function startOfUTCDay(d) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

// Monday-start ISO week boundary for the UTC day containing `d`.
function startOfISOWeek(d) {
  const day = startOfUTCDay(d);
  const dow = new Date(day).getUTCDay(); // 0=Sun..6=Sat
  const daysSinceMonday = (dow + 6) % 7;
  return day - daysSinceMonday * ONE_DAY_MS;
}

/**
 * Progress through the current day/week/month/quarter/year, generalizing
 * `yearProgress`. Day is measured in hours elapsed of 24; every other
 * period is measured in whole days elapsed of the period's total days.
 * @param {'day'|'week'|'month'|'quarter'|'year'} period
 * @param {Date} now
 */
export function periodProgress(period, now = new Date()) {
  if (period === 'day') {
    const start = startOfUTCDay(now);
    const elapsedMs = now.getTime() - start;
    const hoursElapsed = Math.min(24, elapsedMs / (60 * 60 * 1000));
    const percent = Math.round((hoursElapsed / 24) * 1000) / 10;
    return {
      period, unitLabel: 'hours',
      unitsElapsed: Math.floor(hoursElapsed),
      unitsRemaining: Math.ceil(24 - hoursElapsed),
      unitsTotal: 24,
      percent,
    };
  }

  let start;
  let end;
  if (period === 'week') {
    start = startOfISOWeek(now);
    end = start + 7 * ONE_DAY_MS;
  } else if (period === 'month') {
    start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
    end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  } else if (period === 'quarter') {
    const qStartMonth = Math.floor(now.getUTCMonth() / 3) * 3;
    start = Date.UTC(now.getUTCFullYear(), qStartMonth, 1);
    end = Date.UTC(now.getUTCFullYear(), qStartMonth + 3, 1);
  } else {
    // 'year' — delegate-equivalent logic, kept in sync with yearProgress().
    start = Date.UTC(now.getUTCFullYear(), 0, 1);
    end = Date.UTC(now.getUTCFullYear() + 1, 0, 1);
  }

  const total = Math.round((end - start) / ONE_DAY_MS);
  const nowDay = startOfUTCDay(now);
  const clamped = Math.min(Math.max(nowDay, start), end - ONE_DAY_MS);
  const unitsElapsed = Math.round((clamped - start) / ONE_DAY_MS) + 1;
  const unitsRemaining = total - unitsElapsed;
  const percent = Math.round((unitsElapsed / total) * 1000) / 10;

  return { period, unitLabel: 'days', unitsElapsed, unitsRemaining, unitsTotal: total, percent };
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
