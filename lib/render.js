import { yearProgress, periodProgress, countdown, parseDateParam } from './time.js';
import { strings, SUPPORTED_LOCALES } from './labels.js';
import {
  renderTerminalProgress,
  renderGradientProgress,
  renderMinimalProgress,
  renderCountdownCard,
  renderSafetySign,
} from './svg.js';

const PROGRESS_STYLES = {
  terminal: renderTerminalProgress,
  gradient: renderGradientProgress,
  minimal: renderMinimalProgress,
};

const PERIODS = new Set(['day', 'week', 'month', 'quarter', 'year']);

/**
 * Builds the SVG for a request's parsed query params. Pure function of
 * (query, now) — no I/O — so it's directly unit-testable and reusable by
 * anyone who imports the package instead of hitting the hosted API.
 * @param {Record<string,string>} query
 * @param {Date} [now]
 * @returns {{ svg: string, status: number } }
 */
export function renderFromQuery(query = {}, now = new Date()) {
  const type = ['countdown', 'dayssince'].includes(query.type) ? query.type : 'year-progress';
  const theme = ['light', 'auto'].includes(query.theme) ? query.theme : 'dark';
  const locale = SUPPORTED_LOCALES.includes(query.locale) ? query.locale : 'en';
  const style = PROGRESS_STYLES[query.style] ? query.style : 'terminal';
  const colors = { accent: query.color, accent2: query.accent2, bg: query.bg };
  const font = query.font;
  const s = strings(locale);

  if (type === 'countdown' || type === 'dayssince') {
    const target = parseDateParam(query.date, query.tz);
    if (!target) {
      const hint = query.date && query.tz
        ? 'Invalid "date" or unrecognized "tz" (expected an IANA zone like Asia/Seoul) param.'
        : 'Invalid or missing "date" param — expected YYYY-MM-DD.';
      return { status: 400, svg: errorSvg(hint) };
    }
    const label = query.label || query.date;
    const { isPast, days, hours, minutes, seconds } = countdown(target, now);

    if (type === 'dayssince') {
      return {
        status: 200,
        svg: renderSafetySign({ title: label, days, isPast, colors, font }),
      };
    }

    const title = isPast ? s.countdownTitlePast(label) : s.countdownTitleFuture(label);
    return {
      status: 200,
      svg: renderCountdownCard({ title, days, hours, minutes, seconds, isPast, theme, colors, font }),
    };
  }

  // 'year-progress' type, generalized across day/week/month/quarter/year via `period=`.
  const period = PERIODS.has(query.period) ? query.period : 'year';
  const render = PROGRESS_STYLES[style];

  if (period === 'year') {
    // 'year' always goes through yearProgress() (not periodProgress()) so
    // the `year=YYYY` param keeps working, whether `period=year` was
    // explicit or is just the default.
    const year = Number.isInteger(+query.year) && +query.year > 0 ? +query.year : now.getUTCFullYear();
    const { daysElapsed, daysRemaining, percent } = yearProgress(year, now);
    return {
      status: 200,
      svg: render({
        title: query.label || s.yearProgressTitle(year),
        percent,
        elapsedLabel: s.elapsed(daysElapsed),
        remainingLabel: s.remaining(daysRemaining),
        theme,
        colors,
        font,
      }),
    };
  }

  const { unitsElapsed, unitsRemaining, percent, unitLabel } = periodProgress(period, now);
  return {
    status: 200,
    svg: render({
      title: query.label || s.periodTitle(period, now),
      percent,
      elapsedLabel: s.elapsed(unitsElapsed, unitLabel),
      remainingLabel: s.remaining(unitsRemaining, unitLabel),
      theme,
      colors,
      font,
    }),
  };
}

function errorSvg(message) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="60" viewBox="0 0 480 60">
  <rect width="480" height="60" rx="8" fill="#2d0d0d" stroke="#7f1d1d"/>
  <text x="16" y="35" font-family="monospace" font-size="13" fill="#fca5a5">${message.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</text>
</svg>`;
}
