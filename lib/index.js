// Public library surface. Everything the hosted API uses internally is
// exported here too, so you can build your own badge service, a custom
// endpoint, or a static-site generator plugin instead of depending on
// https://awesometime.vercel.app.
export { yearProgress, countdown, parseDateParam } from './time.js';
export {
  renderTerminalProgress,
  renderGradientProgress,
  renderMinimalProgress,
  renderCountdownCard,
} from './svg.js';
export { renderFromQuery } from './render.js';
export { strings } from './labels.js';
