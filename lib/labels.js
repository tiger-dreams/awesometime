const PERIOD_TITLES_EN = {
  day: () => 'Today',
  week: () => 'This Week',
  month: (now) => now.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }),
  quarter: (now) => `Q${Math.floor(now.getUTCMonth() / 3) + 1} ${now.getUTCFullYear()}`,
  year: (now) => `${now.getUTCFullYear()} Progress`,
};

const PERIOD_TITLES_KO = {
  day: () => '오늘',
  week: () => '이번 주',
  month: (now) => `${now.getUTCMonth() + 1}월`,
  quarter: (now) => `${now.getUTCFullYear()}년 ${Math.floor(now.getUTCMonth() / 3) + 1}분기`,
  year: (now) => `${now.getUTCFullYear()}년 진행률`,
};

const PERIOD_TITLES_ZH = {
  day: () => '今天',
  week: () => '本周',
  month: (now) => `${now.getUTCMonth() + 1}月`,
  quarter: (now) => `${now.getUTCFullYear()}年第${Math.floor(now.getUTCMonth() / 3) + 1}季度`,
  year: (now) => `${now.getUTCFullYear()}年进度`,
};

const PERIOD_TITLES_JA = {
  day: () => '今日',
  week: () => '今週',
  month: (now) => `${now.getUTCMonth() + 1}月`,
  quarter: (now) => `${now.getUTCFullYear()}年第${Math.floor(now.getUTCMonth() / 3) + 1}四半期`,
  year: (now) => `${now.getUTCFullYear()}年の進捗`,
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const PERIOD_TITLES_ES = {
  day: () => 'Hoy',
  week: () => 'Esta semana',
  month: (now) => capitalize(now.toLocaleString('es-ES', { month: 'long', timeZone: 'UTC' })),
  quarter: (now) => `T${Math.floor(now.getUTCMonth() / 3) + 1} ${now.getUTCFullYear()}`,
  year: (now) => `Progreso de ${now.getUTCFullYear()}`,
};

const PERIOD_TITLES_PT = {
  day: () => 'Hoje',
  week: () => 'Esta semana',
  month: (now) => capitalize(now.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' })),
  quarter: (now) => `T${Math.floor(now.getUTCMonth() / 3) + 1} ${now.getUTCFullYear()}`,
  year: (now) => `Progresso de ${now.getUTCFullYear()}`,
};

const STRINGS = {
  en: {
    yearProgressTitle: (year) => `${year} Progress`,
    periodTitle: (period, now) => (PERIOD_TITLES_EN[period] || PERIOD_TITLES_EN.year)(now),
    elapsed: (n, unit = 'days') => `${n} ${unit} elapsed`,
    remaining: (n, unit = 'days') => `${n} ${unit} left`,
    countdownTitlePast: (label) => `${label} was`,
    countdownTitleFuture: (label) => `${label} in`,
  },
  ko: {
    yearProgressTitle: (year) => `${year}년 진행률`,
    periodTitle: (period, now) => (PERIOD_TITLES_KO[period] || PERIOD_TITLES_KO.year)(now),
    elapsed: (n, unit = 'days') => `${n}${unit === 'hours' ? '시간' : '일'} 지남`,
    remaining: (n, unit = 'days') => `${n}${unit === 'hours' ? '시간' : '일'} 남음`,
    countdownTitlePast: (label) => `${label} 지남`,
    countdownTitleFuture: (label) => `${label}까지`,
  },
  zh: {
    yearProgressTitle: (year) => `${year}年进度`,
    periodTitle: (period, now) => (PERIOD_TITLES_ZH[period] || PERIOD_TITLES_ZH.year)(now),
    elapsed: (n, unit = 'days') => `已过${n}${unit === 'hours' ? '小时' : '天'}`,
    remaining: (n, unit = 'days') => `剩余${n}${unit === 'hours' ? '小时' : '天'}`,
    countdownTitlePast: (label) => `${label}已过`,
    countdownTitleFuture: (label) => `距${label}还有`,
  },
  ja: {
    yearProgressTitle: (year) => `${year}年の進捗`,
    periodTitle: (period, now) => (PERIOD_TITLES_JA[period] || PERIOD_TITLES_JA.year)(now),
    elapsed: (n, unit = 'days') => `${n}${unit === 'hours' ? '時間' : '日'}経過`,
    remaining: (n, unit = 'days') => `残り${n}${unit === 'hours' ? '時間' : '日'}`,
    countdownTitlePast: (label) => `${label}から`,
    countdownTitleFuture: (label) => `${label}まで`,
  },
  es: {
    yearProgressTitle: (year) => `Progreso de ${year}`,
    periodTitle: (period, now) => (PERIOD_TITLES_ES[period] || PERIOD_TITLES_ES.year)(now),
    elapsed: (n, unit = 'days') => `${n} ${unit === 'hours' ? 'horas transcurridas' : 'días transcurridos'}`,
    remaining: (n, unit = 'days') => `${n} ${unit === 'hours' ? 'horas restantes' : 'días restantes'}`,
    countdownTitlePast: (label) => `${label} pasó`,
    countdownTitleFuture: (label) => `${label} en`,
  },
  pt: {
    yearProgressTitle: (year) => `Progresso de ${year}`,
    periodTitle: (period, now) => (PERIOD_TITLES_PT[period] || PERIOD_TITLES_PT.year)(now),
    elapsed: (n, unit = 'days') => `${n} ${unit === 'hours' ? 'horas passadas' : 'dias passados'}`,
    remaining: (n, unit = 'days') => `${n} ${unit === 'hours' ? 'horas restantes' : 'dias restantes'}`,
    countdownTitlePast: (label) => `${label} passou`,
    countdownTitleFuture: (label) => `${label} em`,
  },
};

export function strings(locale) {
  return STRINGS[locale] || STRINGS.en;
}

export const SUPPORTED_LOCALES = Object.keys(STRINGS);
