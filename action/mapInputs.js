/**
 * Maps GitHub Action inputs (flat string map, Actions Toolkit style — every
 * value is a string, '' when not provided) to the query object
 * renderFromQuery expects. Empty values are dropped so renderFromQuery's own
 * fallback logic (theme -> 'dark', style -> 'terminal', etc.) applies,
 * exactly like an omitted query param on the hosted API.
 * @param {Record<string,string>} inputs
 * @returns {Record<string,string>}
 */
export function buildQuery(inputs) {
  const query = {};
  const passthrough = [
    'type', 'date', 'label', 'theme', 'style', 'period',
    'locale', 'tz', 'font', 'color', 'accent2', 'bg',
    'border', 'text', 'dim', 'motion',
  ];
  for (const key of passthrough) {
    if (inputs[key]) query[key] = inputs[key];
  }
  if (inputs['bar-bg']) query.barBg = inputs['bar-bg'];
  return query;
}
