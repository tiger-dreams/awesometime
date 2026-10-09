// Type declarations for @jeongpd/awesometime.

export type Period = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface YearProgress {
  year: number;
  daysInYear: number;
  daysElapsed: number;
  daysRemaining: number;
  percent: number;
}
export function yearProgress(year: number, now?: Date): YearProgress;

export interface PeriodProgress {
  period: Period;
  unitLabel: string;
  unitsElapsed: number;
  unitsRemaining: number;
  unitsTotal: number;
  percent: number;
}
export function periodProgress(period: Period, now?: Date): PeriodProgress;

export interface Countdown {
  isPast: boolean;
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
export function countdown(target: Date, now?: Date): Countdown;

export function parseDateParam(str: string, tz?: string): Date | null;
export function isValidTimeZone(tz: string): boolean;

export interface ColorOverrides {
  accent?: string;
  accent2?: string;
  bg?: string;
  border?: string;
  text?: string;
  dim?: string;
  barBg?: string;
}

export interface ProgressRenderOptions {
  title: string;
  percent: number;
  elapsedLabel: string;
  remainingLabel: string;
  theme?: string;
  colors?: ColorOverrides;
  font?: string;
}
export function renderTerminalProgress(options: ProgressRenderOptions): string;
export function renderGradientProgress(options: ProgressRenderOptions): string;

export interface MinimalRenderOptions {
  title: string;
  percent: number;
  theme?: string;
  colors?: ColorOverrides;
  font?: string;
}
export function renderMinimalProgress(options: MinimalRenderOptions): string;

export interface CountdownCardOptions {
  title: string;
  days: number;
  hours: number;
  minutes: number;
  seconds?: number;
  isPast: boolean;
  theme?: string;
  colors?: ColorOverrides;
  font?: string;
  reduceMotion?: boolean;
}
export function renderCountdownCard(options: CountdownCardOptions): string;

export interface CountdownBadgeOptions {
  title: string;
  days: number;
  isPast: boolean;
  theme?: string;
  colors?: ColorOverrides;
  font?: string;
}
export function renderCountdownBadge(options: CountdownBadgeOptions): string;

export interface SafetySignOptions {
  title: string;
  days: number;
  isPast?: boolean;
  colors?: ColorOverrides;
  font?: string;
}
export function renderSafetySign(options: SafetySignOptions): string;

export function renderFromQuery(
  query?: Record<string, string>,
  now?: Date,
): { svg: string; status: number };

export interface Labels {
  yearProgressTitle: (year: number) => string;
  periodTitle: (period: Period, now: Date) => string;
  elapsed: (n: number, unit?: string) => string;
  remaining: (n: number, unit?: string) => string;
  countdownTitlePast: (label: string) => string;
  countdownTitleFuture: (label: string) => string;
}
export function strings(locale: string): Labels;

export const SUPPORTED_LOCALES: string[];
