export type DateInput = Date | string | number | null | undefined;

/** What the day helpers take: a `Date`, or anything {@link toDate} reads. */
export type DateLike = Date | string | number;

export const DAYS_IN_WEEK = 7;
export const MONTHS_IN_YEAR = 12;

/** `0` is Sunday, matching `Date.prototype.getDay`. */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * A bare `YYYY-MM-DD` is parsed by the platform as UTC midnight, so west of
 * Greenwich `new Date('2026-09-23')` is the 22nd all evening. Matched here and
 * read as a local day instead, which is what a date without a time means.
 */
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Normalizes any input into a `Date`, or `null` when there is nothing usable.
 */
export function toDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : new Date(input.getTime());
  }

  if (typeof input === 'string') {
    const parts = DATE_ONLY.exec(input);
    if (parts) {
      return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
    }
  }

  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** A copy of `date`; an Invalid Date when it can't be read, as `new Date('junk')` is. */
function read(date: DateLike): Date {
  return toDate(date) ?? new Date(Number.NaN);
}

/** Midnight on the same local day. */
export function startOfDay(date: DateLike): Date {
  const result = read(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** The last representable millisecond of the same local day. */
export function endOfDay(date: DateLike): Date {
  const result = read(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function startOfMonth(date: DateLike): Date {
  const day = read(date);
  return new Date(day.getFullYear(), day.getMonth(), 1);
}

/** Day zero of the next month is the last day of this one. */
export function endOfMonth(date: DateLike): Date {
  const day = read(date);
  return new Date(day.getFullYear(), day.getMonth() + 1, 0);
}

export function startOfYear(date: DateLike): Date {
  const day = read(date);
  return new Date(day.getFullYear(), 0, 1);
}

export function endOfYear(date: DateLike): Date {
  const day = read(date);
  return new Date(day.getFullYear(), 11, 31);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function addDays(date: DateLike, amount: number): Date {
  const result = read(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMonths(date: DateLike, amount: number): Date {
  const result = read(date);
  const day = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + amount);
  result.setDate(Math.min(day, daysInMonth(result.getFullYear(), result.getMonth())));

  return result;
}

/** The 29th of February clamps to the 28th, for the same reason as above. */
export function addYears(date: DateLike, amount: number): Date {
  return addMonths(date, amount * MONTHS_IN_YEAR);
}

export function subDays(date: DateLike, amount: number): Date {
  return addDays(date, -amount);
}

export function subMonths(date: DateLike, amount: number): Date {
  return addMonths(date, -amount);
}

export function subYears(date: DateLike, amount: number): Date {
  return addYears(date, -amount);
}

export function compareDay(a: DateLike, b: DateLike): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export function isSameDay(a: DateLike, b: DateLike): boolean {
  return compareDay(a, b) === 0;
}

export function isSameMonth(a: DateLike, b: DateLike): boolean {
  const first = read(a);
  const second = read(b);
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
}

export function isToday(date: DateLike): boolean {
  return isSameDay(date, new Date());
}

export function isWeekend(date: DateLike): boolean {
  const day = read(date).getDay();
  return day === 0 || day === 6;
}

/** Whether `date` falls in `[min, max]`, comparing days. Absent bounds are open. */
export function isWithin(date: DateLike, min?: DateLike | null, max?: DateLike | null): boolean {
  if (min && compareDay(date, min) < 0) return false;
  if (max && compareDay(date, max) > 0) return false;
  return true;
}

/** The nearest date inside `[min, max]`, keeping the time of day. */
export function clampDate(date: DateLike, min?: DateLike | null, max?: DateLike | null): Date {
  if (min && compareDay(date, min) < 0) return read(min);
  if (max && compareDay(date, max) > 0) return read(max);
  return read(date);
}

export function monthNames(locale?: Intl.LocalesArgument, format: 'long' | 'short' | 'narrow' = 'long'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: format });
  return Array.from({ length: MONTHS_IN_YEAR }, (_, month) => formatter.format(new Date(2021, month, 1)));
}

/** A Sunday, used as the origin when walking a week out of `Intl`. */
const REFERENCE_SUNDAY = new Date(2021, 7, 1);

export interface WeekDayName {
  /** `0`–`6`, as `Date.prototype.getDay` reports it, whatever the week starts on. */
  index: WeekDay;
  long: string;
  short: string;
  narrow: string;
}

type WeekInfoLocale = Intl.Locale & { getWeekInfo?(): { firstDay: number }; weekInfo?: { firstDay: number } };

/** The day a week starts on where `locale` is used: `0` is Sunday. Monday where the runtime can't tell. */
export function firstDayOfWeek(locale?: Intl.LocalesArgument): WeekDay {
  try {
    const resolved = new Intl.Locale(new Intl.DateTimeFormat(locale).resolvedOptions().locale) as WeekInfoLocale;
    // `getWeekInfo()` is the standard; older engines shipped it as a `weekInfo` getter.
    const info = resolved.getWeekInfo?.() ?? resolved.weekInfo;
    if (info) return (info.firstDay % DAYS_IN_WEEK) as WeekDay;
  } catch {
    // an unknown locale tag: fall through
  }
  return 1;
}

export function weekDayNames(locale?: Intl.LocalesArgument, first: WeekDay = firstDayOfWeek(locale)): WeekDayName[] {
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  const short = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const narrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });

  return Array.from({ length: DAYS_IN_WEEK }, (_, offset) => {
    const date = addDays(REFERENCE_SUNDAY, (first + offset) % DAYS_IN_WEEK);
    return {
      index: date.getDay() as WeekDay,
      long: long.format(date),
      short: short.format(date),
      narrow: narrow.format(date)
    };
  });
}

export interface FormatDateOptions {
  /** `iso` bypasses `Intl` entirely and returns `YYYY-MM-DD`. @default 'short' */
  format?: 'short' | 'long' | 'iso';
  /** Append the time. @default false */
  time?: boolean;
  /** Include the year. @default true */
  year?: boolean;
  /** Read the date out in UTC rather than locally. @default false */
  utc?: boolean;
  /** See {@link formatSafeISO}. @default false */
  safe?: boolean;
  /** Which fields to show. */
  options?: Intl.DateTimeFormatOptions;
  /** @default 'en-US' */
  locale?: Intl.LocalesArgument;
  /** @default 'h23' */
  hourCycle?: Intl.DateTimeFormatOptions['hourCycle'];
  /** Returned for a missing date. @default 'N/A' */
  fallback?: string;
}

export function formatDate(date: DateInput, options: FormatDateOptions = {}): string {
  const {
    format = 'short',
    time = false,
    year = true,
    utc = false,
    safe = false,
    options: overrides,
    locale = 'en-US',
    hourCycle = 'h23',
    fallback = 'N/A'
  } = options;

  const parsed = toDate(date);

  if (!parsed) return fallback;

  if (format === 'iso') return safe ? formatSafeISO(parsed) : formatISO(parsed);

  const chosen: Intl.DateTimeFormatOptions = overrides ?? {
    hourCycle,
    month: format === 'long' ? 'long' : 'short',
    day: 'numeric',
    ...(time ? { hour: 'numeric', minute: 'numeric' } : {}),
    ...(year ? { year: 'numeric' } : {})
  };

  return new Intl.DateTimeFormat(locale, {
    ...chosen,
    ...(utc ? { timeZone: 'UTC' } : {})
  }).format(safe ? toSafeDate(parsed) : parsed);
}

/** Two days as one span, `Oct 3 – Oct 9, 2026`: the year once when both share it. */
export function formatDateRange(
  from: DateInput,
  to: DateInput,
  options: Pick<FormatDateOptions, 'locale' | 'format' | 'fallback'> = {}
): string {
  const start = toDate(from);
  const end = toDate(to);
  if (!start || !end) return options.fallback ?? 'N/A';

  const sameYear = start.getFullYear() === end.getFullYear();
  return `${formatDate(start, { ...options, year: !sameYear })} – ${formatDate(end, options)}`;
}

/** `YYYY-MM-DD` for the local day. */
export function formatISO(date: DateInput): string {
  const parsed = toDate(date);

  if (!parsed) return 'N/A';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Today, stepped back while UTC is still on yesterday: east of Greenwich just
 * after midnight. West of it, UTC runs ahead, and today is left alone.
 */
function toSafeDate(date: DateInput): Date {
  const now = new Date();
  const parsed = toDate(date) ?? now;

  const localDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utcDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  return isSameDay(parsed, now) && utcDay < localDay ? subDays(parsed, 1) : parsed;
}

/** {@link formatISO}, stepped back a day inside the window {@link toSafeDate} describes. */
export function formatSafeISO(date: DateInput): string {
  const parsed = toDate(date);
  return parsed ? formatISO(toSafeDate(parsed)) : 'N/A';
}

/**
 * A date `offset` days away, defaulting to today when given nothing.
 *
 * @deprecated Prefer {@link addDays} or {@link subDays}, which say what they
 * do; `new Date()` for today. Kept because it is the name the application already calls.
 */
export function setDate(date?: DateInput, offset: number = 0): Date {
  return addDays(toDate(date) ?? new Date(), offset);
}

/** Every day from `start` to `end` inclusive. Empty if either is missing. */
export function setDateRange(start: DateInput, end: DateInput): Date[] {
  const from = toDate(start);
  const to = toDate(end);

  if (!from || !to) return [];

  const dates: Date[] = [];

  for (let day = startOfDay(from); compareDay(day, to) <= 0; day = addDays(day, 1)) {
    dates.push(day);
  }

  return dates;
}

/** The ranges a date filter offers as one press. */
export type DatePresetKey =
  | 'today'
  | 'yesterday'
  | 'last-7'
  | 'last-30'
  | 'this-month'
  | 'last-month'
  | 'this-year'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4';

export interface PresetRangeOptions {
  /** What "today" means. Defaults to now, and exists so this can be tested. */
  reference?: DateInput;
  /** Whether a rolling window ends today or yesterday. @default false */
  includeToday?: boolean;
}

/** The two ends of a named range, always in order, always whole days. */
export function presetRange(key: DatePresetKey, options: PresetRangeOptions = {}): [Date, Date] {
  const today = startOfDay(toDate(options.reference) ?? new Date());
  const includeToday = options.includeToday ?? false;
  const last = includeToday ? today : subDays(today, 1);

  switch (key) {
    case 'today':
      return [today, today];
    case 'yesterday': {
      const yesterday = subDays(today, 1);
      return [yesterday, yesterday];
    }
    case 'last-7':
      return [subDays(last, 6), last];
    case 'last-30':
      return [subDays(last, 29), last];
    case 'this-month':
      return [startOfMonth(today), endOfMonth(today)];
    case 'last-month': {
      const previous = subMonths(startOfMonth(today), 1);
      return [previous, endOfMonth(previous)];
    }
    case 'this-year':
      return [startOfYear(today), endOfYear(today)];
    default: {
      // `q1`–`q4`, each three months from the start of the year.
      const quarter = Number(key.slice(1)) - 1;
      const start = new Date(today.getFullYear(), quarter * 3, 1);
      return [start, endOfMonth(addMonths(start, 2))];
    }
  }
}
