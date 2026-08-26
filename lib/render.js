import { yearProgress, countdown, parseDateParam } from './time.js';
import { strings } from './labels.js';
import {
  renderTerminalProgress,
  renderGradientProgress,
  renderMinimalProgress,
  renderCountdownCard,
} from './svg.js';

const PROGRESS_STYLES = {
  terminal: renderTerminalProgress,
  gradient: renderGradientProgress,
  minimal: renderMinimalProgress,
};

/**
 * Builds the SVG for a request's parsed query params. Pure function of
 * (query, now) — no I/O — so it's directly unit-testable and reusable by
 * anyone who imports the package instead of hitting the hosted API.
 * @param {Record<string,string>} query
 * @param {Date} [now]
 * @returns {{ svg: string, status: number } }
 */
export function renderFromQuery(query = {}, now = new Date()) {
  const type = query.type === 'countdown' ? 'countdown' : 'year-progress';
  const theme = query.theme === 'light' ? 'light' : 'dark';
  const locale = query.locale === 'ko' ? 'ko' : 'en';
  const style = PROGRESS_STYLES[query.style] ? query.style : 'terminal';
  const colors = { accent: query.color, accent2: query.accent2, bg: query.bg };
  const s = strings(locale);

  if (type === 'countdown') {
    const target = parseDateParam(query.date);
    if (!target) {
      return {
        status: 400,
        svg: errorSvg('Invalid or missing "date" param — expected YYYY-MM-DD.'),
      };
    }
    const label = query.label || query.date;
    const { isPast, days, hours, minutes } = countdown(target, now);
    const title = isPast ? s.countdownTitlePast(label) : s.countdownTitleFuture(label);
    return {
      status: 200,
      svg: renderCountdownCard({ title, days, hours, minutes, isPast, theme, colors }),
    };
  }

  const year = Number.isInteger(+query.year) && +query.year > 0 ? +query.year : now.getUTCFullYear();
  const { daysElapsed, daysRemaining, percent } = yearProgress(year, now);
  const render = PROGRESS_STYLES[style];
  return {
    status: 200,
    svg: render({
      title: query.label || s.yearProgressTitle(year),
      percent,
      elapsedLabel: s.elapsed(daysElapsed),
      remainingLabel: s.remaining(daysRemaining),
      theme,
      colors,
    }),
  };
}

function errorSvg(message) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="60" viewBox="0 0 480 60">
  <rect width="480" height="60" rx="8" fill="#2d0d0d" stroke="#7f1d1d"/>
  <text x="16" y="35" font-family="monospace" font-size="13" fill="#fca5a5">${message.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</text>
</svg>`;
}
