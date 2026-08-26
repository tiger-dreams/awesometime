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
};

export function strings(locale) {
  return STRINGS[locale] || STRINGS.en;
}

export const SUPPORTED_LOCALES = Object.keys(STRINGS);
