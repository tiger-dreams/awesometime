const STRINGS = {
  en: {
    yearProgressTitle: (year) => `${year} Progress`,
    elapsed: (n) => `${n} days elapsed`,
    remaining: (n) => `${n} days left`,
    countdownTitlePast: (label) => `${label} was`,
    countdownTitleFuture: (label) => `${label} in`,
  },
  ko: {
    yearProgressTitle: (year) => `${year}년 진행률`,
    elapsed: (n) => `${n}일 지남`,
    remaining: (n) => `${n}일 남음`,
    countdownTitlePast: (label) => `${label} 지남`,
    countdownTitleFuture: (label) => `${label}까지`,
  },
};

export function strings(locale) {
  return STRINGS[locale] || STRINGS.en;
}
