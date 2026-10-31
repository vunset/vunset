import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDay,
  daysInMonth,
  endOfMonth,
  formatDate,
  formatDateRange,
  formatISO,
  formatSafeISO,
  isSameDay,
  isWithin,
  monthNames,
  presetRange,
  setDate,
  setDateRange,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
  subYears,
  toDate,
  weekDayNames,
  firstDayOfWeek
} from '../src/date';

describe('toDate', () => {
  it('reads a bare YYYY-MM-DD as a local day, not as UTC midnight', () => {
    const parsed = toDate('2026-09-23')!;

    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(8);
    expect(parsed.getDate()).toBe(23);
    expect(parsed.getHours()).toBe(0);
  });

  it('copies a Date rather than handing back the caller’s own', () => {
    const original = new Date(2026, 8, 23);
    const parsed = toDate(original)!;

    parsed.setFullYear(1999);

    expect(original.getFullYear()).toBe(2026);
  });

  it('is null for anything unusable', () => {
    expect(toDate(null)).toBeNull();
    expect(toDate(undefined)).toBeNull();
    expect(toDate('')).toBeNull();
    expect(toDate('not a date')).toBeNull();
    expect(toDate(new Date('not a date'))).toBeNull();
  });
});

describe('arithmetic', () => {
  it('clamps a month step to the length of the month it lands in', () => {
    expect(formatISO(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28');
    expect(formatISO(addMonths(new Date(2026, 2, 31), -1))).toBe('2026-02-28');
  });

  it('clamps a leap day to the 28th', () => {
    expect(formatISO(addYears(new Date(2024, 1, 29), 1))).toBe('2025-02-28');
  });

  it('crosses a month boundary by days', () => {
    expect(formatISO(addDays(new Date(2026, 8, 30), 1))).toBe('2026-10-01');
    expect(formatISO(addDays(new Date(2026, 8, 1), -1))).toBe('2026-08-31');
  });

  it('subtracts with sub*, as add* does with a negative amount', () => {
    expect(formatISO(subDays(new Date(2026, 9, 1), 1))).toBe('2026-09-30');
    expect(formatISO(subMonths(new Date(2026, 2, 31), 1))).toBe('2026-02-28');
    expect(formatISO(subYears(new Date(2024, 1, 29), 1))).toBe('2023-02-28');
  });

  it('takes a YYYY-MM-DD string as the local day', () => {
    expect(formatISO(subDays('2026-10-23', 1))).toBe('2026-10-22');
    expect(formatISO(addDays('2026-10-23', 9))).toBe('2026-11-01');
    expect(formatISO(startOfMonth('2026-10-23'))).toBe('2026-10-01');
    expect(isSameDay(new Date(2026, 9, 23, 18, 30), '2026-10-23')).toBe(true);
    expect(isWithin('2026-10-23', '2026-10-01', '2026-10-31')).toBe(true);
  });

  it('gives an Invalid Date for a string it cannot read, which formatDate shows as missing', () => {
    expect(Number.isNaN(addDays('not a date', 1).getTime())).toBe(true);
    expect(formatDate(subDays('not a date', 1))).toBe('N/A');
  });

  it('counts the days in a month, leap years included', () => {
    expect(daysInMonth(2024, 1)).toBe(29);
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2026, 8)).toBe(30);
  });

  it('compares days and ignores the time of day', () => {
    const morning = new Date(2026, 8, 23, 1);
    const evening = new Date(2026, 8, 23, 23);

    expect(compareDay(morning, evening)).toBe(0);
    expect(isSameDay(morning, evening)).toBe(true);
    expect(compareDay(morning, new Date(2026, 8, 24))).toBeLessThan(0);
  });

  it('ends a month on its last day', () => {
    expect(formatISO(endOfMonth(new Date(2026, 1, 10)))).toBe('2026-02-28');
  });
});

describe('bounds', () => {
  const min = new Date(2026, 8, 10);
  const max = new Date(2026, 8, 20);

  it('treats the bounds as inclusive days', () => {
    expect(isWithin(new Date(2026, 8, 10, 23), min, max)).toBe(true);
    expect(isWithin(new Date(2026, 8, 20, 0), min, max)).toBe(true);
    expect(isWithin(new Date(2026, 8, 9), min, max)).toBe(false);
    expect(isWithin(new Date(2026, 8, 21), min, max)).toBe(false);
  });

  it('is open on the side it has no bound for', () => {
    expect(isWithin(new Date(1900, 0, 1), null, max)).toBe(true);
    expect(isWithin(new Date(2200, 0, 1), min, null)).toBe(true);
  });

  it('clamps to the nearest bound', () => {
    expect(formatISO(clampDate(new Date(2026, 8, 1), min, max))).toBe('2026-09-10');
    expect(formatISO(clampDate(new Date(2026, 8, 30), min, max))).toBe('2026-09-20');
    expect(formatISO(clampDate(new Date(2026, 8, 15), min, max))).toBe('2026-09-15');
  });
});

describe('Intl names', () => {
  it('names the months January first', () => {
    const names = monthNames('en-US');

    expect(names).toHaveLength(12);
    expect(names[0]).toBe('January');
    expect(names[11]).toBe('December');
  });

  it('starts the week where it is told to', () => {
    const monday = weekDayNames('en-US', 1);
    const sunday = weekDayNames('en-US', 0);

    expect(monday[0]!.index).toBe(1);
    expect(monday[0]!.short).toBe('Mon');
    expect(monday[6]!.index).toBe(0);
    expect(sunday[0]!.index).toBe(0);
    expect(sunday.map((day) => day.index)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

describe('firstDayOfWeek', () => {
  it('starts the week where the locale does', () => {
    expect(firstDayOfWeek('en-US')).toBe(0);
    expect(firstDayOfWeek('de-DE')).toBe(1);
    expect(firstDayOfWeek('ar-EG')).toBe(6);
  });

  it('falls back to Monday where the runtime has no week info', () => {
    const proto = Intl.Locale.prototype as any;
    const own = Object.getOwnPropertyDescriptors(proto);
    delete proto.getWeekInfo;
    delete proto.weekInfo;
    try {
      expect(firstDayOfWeek('en-US')).toBe(1);
    } finally {
      Object.defineProperties(proto, own);
    }
  });
});

describe('formatDateRange', () => {
  it('writes the year once when both ends share it', () => {
    expect(formatDateRange(new Date(2026, 9, 3), new Date(2026, 9, 9))).toBe('Oct 3 – Oct 9, 2026');
  });

  it('writes it on both ends when they differ', () => {
    expect(formatDateRange(new Date(2025, 11, 30), new Date(2026, 0, 2))).toBe('Dec 30, 2025 – Jan 2, 2026');
  });

  it('follows the locale and the format', () => {
    expect(formatDateRange(new Date(2026, 9, 3), new Date(2026, 9, 9), { locale: 'de-DE', format: 'long' })).toBe(
      '3. Oktober – 9. Oktober 2026'
    );
  });

  it('falls back on a missing end', () => {
    expect(formatDateRange(null, new Date(2026, 9, 9), { fallback: '—' })).toBe('—');
  });
});

describe('formatDate', () => {
  const date = new Date(2026, 8, 23, 14, 30);

  it('is a short date with the year by default', () => {
    expect(formatDate(date)).toBe('Sep 23, 2026');
  });

  it('spells the month out when asked', () => {
    expect(formatDate(date, { format: 'long' })).toBe('September 23, 2026');
  });

  it('drops the year and adds the time on request', () => {
    expect(formatDate(date, { year: false })).toBe('Sep 23');
    expect(formatDate(date, { time: true })).toContain('14:30');
  });

  it('returns the fallback for a missing date', () => {
    expect(formatDate(null)).toBe('N/A');
    expect(formatDate(undefined, { fallback: '—' })).toBe('—');
  });

  it('lets `options` replace the fields rather than add to them', () => {
    expect(formatDate(date, { options: { year: 'numeric' } })).toBe('2026');
  });

  it('routes the iso format through formatISO', () => {
    expect(formatDate(date, { format: 'iso' })).toBe('2026-09-23');
  });
});

describe('formatISO', () => {
  it('reads the local calendar fields, not the UTC ones', () => {
    // Late evening is already tomorrow in UTC east of Greenwich, and yesterday
    // in UTC west of it. Neither is what the date on screen says.
    expect(formatISO(new Date(2026, 8, 23, 23, 30))).toBe('2026-09-23');
    expect(formatISO(new Date(2026, 8, 23, 0, 30))).toBe('2026-09-23');
  });

  it('pads to four-two-two', () => {
    expect(formatISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('returns the fallback for a missing date', () => {
    expect(formatISO(null)).toBe('N/A');
  });
});

describe('formatSafeISO', () => {
  it('leaves any day but today alone', () => {
    const past = new Date(2026, 8, 23);

    expect(formatSafeISO(past)).toBe('2026-09-23');
    expect(formatSafeISO(addDays(new Date(), -3))).toBe(formatISO(addDays(new Date(), -3)));
  });

  describe('around midnight', () => {
    const zone = process.env.TZ;

    // `today` at the instant `utc`, in `tz`.
    function safeToday(tz: string, utc: number): string {
      process.env.TZ = tz;
      vi.setSystemTime(utc);
      return formatSafeISO(new Date());
    }

    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
      vi.useRealTimers();
      if (zone === undefined) delete process.env.TZ;
      else process.env.TZ = zone;
    });

    it('steps today back while UTC is still on yesterday', () => {
      // 05:00 on the 24th in Tokyo, 20:00 on the 23rd in UTC.
      expect(safeToday('Asia/Tokyo', Date.UTC(2026, 9, 23, 20))).toBe('2026-10-23');
    });

    it('leaves today alone while UTC is already on tomorrow', () => {
      // 22:00 on the 23rd in New York, 02:00 on the 24th in UTC.
      expect(safeToday('America/New_York', Date.UTC(2026, 9, 24, 2))).toBe('2026-10-23');
    });

    it('leaves today alone while both are on the same day', () => {
      expect(safeToday('Asia/Tokyo', Date.UTC(2026, 9, 24, 2))).toBe('2026-10-24');
      expect(safeToday('America/New_York', Date.UTC(2026, 9, 23, 20))).toBe('2026-10-23');
    });

    it('steps back across a month and a year', () => {
      // 01:00 on Jan 1 in Kyiv, 23:00 on Dec 31 in UTC.
      expect(safeToday('Europe/Kyiv', Date.UTC(2026, 11, 31, 23))).toBe('2026-12-31');
    });
  });
});

describe('setDate and setDateRange', () => {
  it('moves by whole local days', () => {
    expect(formatISO(setDate('2026-09-23', -1))).toBe('2026-09-22');
    expect(formatISO(setDate('2026-09-23', 8))).toBe('2026-10-01');
  });

  it('defaults to today', () => {
    expect(formatISO(setDate())).toBe(formatISO(new Date()));
  });

  it('walks a range inclusively', () => {
    const days = setDateRange('2026-09-23', '2026-09-26');

    expect(days.map((day) => formatISO(day))).toEqual(['2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26']);
  });

  it('is empty when either end is missing', () => {
    expect(setDateRange(null, '2026-09-26')).toEqual([]);
    expect(setDateRange('2026-09-23', undefined)).toEqual([]);
  });

  it('does not run away when the ends are the wrong way round', () => {
    expect(setDateRange('2026-09-26', '2026-09-23')).toEqual([]);
  });
});

describe('presetRange', () => {
  const reference = '2026-09-23';
  const iso = (key: Parameters<typeof presetRange>[0], includeToday = false) =>
    presetRange(key, { reference, includeToday }).map((date) => formatISO(date));

  it('stops a rolling window at the last complete day', () => {
    expect(iso('last-7')).toEqual(['2026-09-16', '2026-09-22']);
    expect(iso('last-30')).toEqual(['2026-08-24', '2026-09-22']);
  });

  it('includes today when told to, keeping the window the same length', () => {
    expect(iso('last-7', true)).toEqual(['2026-09-17', '2026-09-23']);
    expect(iso('last-30', true)).toEqual(['2026-08-25', '2026-09-23']);
  });

  it('covers a single day for today and yesterday', () => {
    expect(iso('today')).toEqual(['2026-09-23', '2026-09-23']);
    expect(iso('yesterday')).toEqual(['2026-09-22', '2026-09-22']);
  });

  it('covers whole months, quarters and years', () => {
    expect(iso('this-month')).toEqual(['2026-09-01', '2026-09-30']);
    expect(iso('last-month')).toEqual(['2026-08-01', '2026-08-31']);
    expect(iso('this-year')).toEqual(['2026-01-01', '2026-12-31']);
    expect(iso('q1')).toEqual(['2026-01-01', '2026-03-31']);
    expect(iso('q3')).toEqual(['2026-07-01', '2026-09-30']);
    expect(iso('q4')).toEqual(['2026-10-01', '2026-12-31']);
  });

  it('is always whole days, whatever time the reference carries', () => {
    const [start] = presetRange('today', { reference: new Date(2026, 8, 23, 17, 45) });

    expect(start.getHours()).toBe(0);
    expect(startOfDay(start).getTime()).toBe(start.getTime());
  });
});
