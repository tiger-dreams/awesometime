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
};

export function strings(locale) {
  return STRINGS[locale] || STRINGS.en;
}
