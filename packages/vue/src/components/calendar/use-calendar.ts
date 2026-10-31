import type { ModelModifiers } from '../../shared/model-modifiers';
import {
  computed,
  nextTick,
  ref,
  shallowRef,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type WritableComputedRef
} from 'vue';
import { createContext } from '../../shared/context';
import { useControlled } from '../../shared/use-controlled';
import { dataAttrs } from '../../shared/data-attrs';
import { useFieldValue, useOptionalFieldContext } from '../../shared/use-field';
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDay,
  daysInMonth,
  endOfMonth,
  endOfYear,
  formatISO,
  formatSafeISO,
  isSameDay,
  isSameMonth,
  isToday,
  isWeekend,
  isWithin,
  monthNames,
  presetRange,
  setDateRange,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  toDate,
  weekDayNames,
  firstDayOfWeek as localeFirstDayOfWeek,
  DAYS_IN_WEEK,
  MONTHS_IN_YEAR,
  type DateInput,
  type DatePresetKey,
  type WeekDay,
  type WeekDayName
} from '@vunset/utils';

export type CalendarSelectionMode = 'single' | 'range' | 'multiple';
export type CalendarView = 'day' | 'month' | 'year';
export type CalendarValue = Date | Date[] | null;
export type CalendarValueInput = DateInput | DateInput[];

/**
 * `v-model.iso` emits `YYYY-MM-DD` strings; `.safe` steps today back while UTC is still on yesterday;
 * `.optional` writes `undefined` once emptied.
 */
export interface CalendarModelModifiers extends ModelModifiers {
  iso?: boolean;
  safe?: boolean;
}

/** The value as `v-model` receives it: dates, or `YYYY-MM-DD` strings with `.iso`. */
export type CalendarModelValue = CalendarValue | string | string[];

export const YEARS_PER_PAGE = 12;

export interface CalendarState {
  /** `single`, `range` or `multiple`. */
  mode: CalendarSelectionMode;
  /** Which grid is showing: days, months or years. */
  view: CalendarView;
  /**
   * The month on screen, `0`–`11`.
   * @attribute none
   */
  month: number;
  /**
   * The year on screen.
   * @attribute none
   */
  year: number;
  /**
   * The month's name, in the calendar's locale.
   * @attribute none
   */
  monthLabel: string;
  /**
   * The year, as written in the calendar's locale.
   * @attribute none
   */
  yearLabel: string;
  /**
   * Every selected day, in order.
   * @attribute none
   */
  selected: Date[];
  /** Whether a range has its start picked and waits for its end. */
  selecting: boolean;
  /** Whether nothing is selected. */
  empty: boolean;
  /** Whether it ignores interaction. */
  disabled: boolean;
  /** Whether it can be walked but nothing picked. */
  readOnly: boolean;
  /** Whether a day must be picked. Announced, not enforced: the page validates. */
  required: boolean;
  /** Whether the value is invalid. */
  invalid: boolean;
}

export interface CalendarDayState {
  /**
   * The day itself.
   * @attribute none
   */
  date: Date;
  /** Whether it is picked: a single day, either end of a range, or one of several. */
  selected: boolean;
  /**
   * Whether it starts the range.
   * @attribute `data-range-start` while true
   */
  rangeStart: boolean;
  /**
   * Whether it ends the range.
   * @attribute `data-range-end` while true
   */
  rangeEnd: boolean;
  /**
   * Whether it lies between the range's ends.
   * @attribute `data-in-range` while true
   */
  inRange: boolean;
  /** Whether it is in the range the pointer would make, while a range waits for its end. */
  preview: boolean;
  /** Whether it belongs to the month before or after the one on screen. */
  outside: boolean;
  /** Whether it is today. */
  today: boolean;
  /** Whether it is a Saturday or Sunday. */
  weekend: boolean;
  /** Whether it can't be picked: outside `min`/`max`, or ruled out. */
  disabled: boolean;
  /** Whether it holds the keyboard's place in the grid. */
  highlighted: boolean;
}

export interface CalendarMonthState {
  /**
   * `0`–`11`.
   * @attribute none
   */
  month: number;
  /**
   * Its name, in the calendar's locale.
   * @attribute none
   */
  label: string;
  /** Whether it is the month on screen. */
  selected: boolean;
  /** Whether it is this month. */
  current: boolean;
  /** Whether none of its days can be picked. */
  disabled: boolean;
  /** Whether it holds the keyboard's place in the grid. */
  highlighted: boolean;
}

export interface CalendarYearState {
  /**
   * The year.
   * @attribute none
   */
  year: number;
  /** Whether it is the year on screen. */
  selected: boolean;
  /** Whether it is this year. */
  current: boolean;
  /** Whether none of its days can be picked. */
  disabled: boolean;
  /** Whether it holds the keyboard's place in the grid. */
  highlighted: boolean;
}

export interface CalendarWeekDayState extends WeekDayName {
  weekend: boolean;
}

export interface CalendarPresetOption {
  key: string;
  label?: string;
  range?: () => [DateInput, DateInput];
}

export type CalendarPresetInput = DatePresetKey | CalendarPresetOption;

/** `base`: today, yesterday, the last 7 and 30 days, this and last month. `all`: those, this year and the quarters. */
export type CalendarPresetGroup = 'base' | 'all';

/** A group, or a list of presets and groups (`['base', 'this-year']`). A key listed twice shows once. */
export type CalendarPresetsInput = (CalendarPresetInput | CalendarPresetGroup)[] | CalendarPresetGroup;

export interface CalendarPresetItem {
  /**
   * Which preset it is.
   * @attribute `data-value="…"`
   */
  key: string;
  /**
   * What it is called.
   * @attribute none
   */
  label: string;
  /**
   * The first and last day it selects.
   * @attribute none
   */
  range: [Date, Date];
  /** Whether it can't be applied: its days fall outside `min`/`max`, or it is a quarter yet to start. */
  disabled: boolean;
}

export interface UseCalendarOptions {
  /** @default 'single' */
  mode?: MaybeRefOrGetter<CalendarSelectionMode | undefined>;
  /** The selection. Supplying this makes the value controlled. */
  value?: MaybeRefOrGetter<CalendarValueInput | undefined>;
  /** The selection while uncontrolled. */
  defaultValue?: MaybeRefOrGetter<CalendarValueInput | undefined>;
  /** Which month opens, when nothing is selected to open on. */
  defaultMonth?: MaybeRefOrGetter<DateInput>;
  /** Nothing before this day can be picked, and the arrows stop at it. */
  min?: MaybeRefOrGetter<DateInput>;
  /** Nothing after this day can be picked. `new Date()` for "up to today". */
  max?: MaybeRefOrGetter<DateInput>;
  /** Nothing after today can be picked; the earlier of the two with `max`. */
  maxToday?: MaybeRefOrGetter<boolean | undefined>;
  /** Individual days to rule out. */
  disabledDates?: MaybeRefOrGetter<DateInput[] | undefined>;
  /** Rules out days a list cannot express — every weekend, every holiday. */
  isDateDisabled?: (date: Date) => boolean;
  /** `0` is Sunday. Defaults to the locale's. */
  firstDayOfWeek?: MaybeRefOrGetter<WeekDay | undefined>;
  /**
   * Always draw six rows, so the calendar does not change height between a
   * 28-day February and a month that spills into a sixth week
   *
   * @default false
   */
  fixedWeeks?: MaybeRefOrGetter<boolean | undefined>;
  /** Names the months and the weekdays. Defaults to the runtime's locale. */
  locale?: MaybeRefOrGetter<Intl.LocalesArgument>;
  /** The presets offered: a list, or `base` / `all`. @default `base` */
  presets?: MaybeRefOrGetter<CalendarPresetsInput | undefined>;
  /** A preset key whose days are the starting value, used while the value is empty. */
  preset?: MaybeRefOrGetter<string | undefined>;
  /** Whether the rolling presets — last 7 days, last 30 — end today or yesterday. @default false */
  includeToday?: MaybeRefOrGetter<boolean | undefined>;
  /** Everything is inert and announced as off. Also read from a surrounding field. */
  disabled?: MaybeRefOrGetter<boolean | undefined>;
  /** Also read from a surrounding field. */
  readOnly?: MaybeRefOrGetter<boolean | undefined>;
  /** Also read from a surrounding field. */
  required?: MaybeRefOrGetter<boolean | undefined>;
  /** Also read from a surrounding field. */
  invalid?: MaybeRefOrGetter<boolean | undefined>;
  /** The form field name the days are submitted under. Also read from a surrounding field. */
  name?: MaybeRefOrGetter<string | undefined>;
  /** The id of a `<form>` to submit with. */
  form?: MaybeRefOrGetter<string | undefined>;
  /** Marks the day Tab reaches `autofocus`, so a popup that opens around it starts there. */
  autofocusDay?: MaybeRefOrGetter<boolean | undefined>;
  /** Called whenever the selection changes. */
  onChange?: (value: CalendarValue) => void;
}

export interface UseCalendarReturn {
  value: WritableComputedRef<CalendarValue>;
  state: ComputedRef<CalendarState>;
  selection: Ref<Date[]>;
  weeks: ComputedRef<Date[][]>;
  weekDays: ComputedRef<WeekDayName[]>;
  months: ComputedRef<string[]>;
  years: ComputedRef<number[]>;
  presets: ComputedRef<CalendarPresetItem[]>;

  rootProps: ComputedRef<Record<string, unknown>>;
  /** One hidden input per submitted day, `YYYY-MM-DD`. */
  hiddenInputs: ComputedRef<Array<{ name: string; value: string; form: string | undefined }>>;
  gridProps: ComputedRef<Record<string, unknown>>;
  rowProps: ComputedRef<Record<string, unknown>>;
  prevProps: ComputedRef<Record<string, unknown>>;
  nextProps: ComputedRef<Record<string, unknown>>;
  presetsProps: ComputedRef<Record<string, unknown>>;

  getDayProps: (date: Date) => Record<string, unknown>;
  getDayState: (date: Date) => CalendarDayState;
  getWeekDayProps: (index: WeekDay) => Record<string, unknown>;
  getWeekDayState: (index: WeekDay) => CalendarWeekDayState;
  getMonthProps: (month: number) => Record<string, unknown>;
  getMonthState: (month: number) => CalendarMonthState;
  getYearProps: (year: number) => Record<string, unknown>;
  getYearState: (year: number) => CalendarYearState;
  getViewTriggerProps: (view: Exclude<CalendarView, 'day'>) => Record<string, unknown>;
  getPresetProps: (key: string) => Record<string, unknown>;
  getPresetState: (key: string) => CalendarPresetItem | undefined;

  /** Picks a day, exactly as pressing it would. */
  select: (date: Date) => void;
  /** Drops the selection. */
  clear: () => void;
  /** Applies a preset by key. */
  applyPreset: (key: string) => void;
  /** Closes a range that has only one end onto that same day. */
  completeRange: () => void;
  setView: (view: CalendarView) => void;
  /** Moves the month, year or year-page on screen, as the arrows do. */
  goto: (direction: 1 | -1) => void;

  /** @internal Shared with the parts. */ isDayDisabled: (date: Date) => boolean;
  /** @internal */ cursor: Ref<Date>;
}

const DEFAULT_PRESETS: DatePresetKey[] = ['today', 'yesterday', 'last-7', 'last-30', 'this-month', 'last-month'];

const PRESET_GROUPS: Record<CalendarPresetGroup, DatePresetKey[]> = {
  base: DEFAULT_PRESETS,
  all: [...DEFAULT_PRESETS, 'this-year', 'q1', 'q2', 'q3', 'q4']
};

const PRESET_LABELS: Record<DatePresetKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  'last-7': 'Last 7 Days',
  'last-30': 'Last 30 Days',
  'this-month': 'This Month',
  'last-month': 'Last Month',
  'this-year': 'This Year',
  q1: 'Q1',
  q2: 'Q2',
  q3: 'Q3',
  q4: 'Q4'
};

const QUARTERS = new Set<string>(['q1', 'q2', 'q3', 'q4']);

function isPresetKey(key: string): key is DatePresetKey {
  return Object.prototype.hasOwnProperty.call(PRESET_LABELS, key);
}

export function useCalendar(options: UseCalendarOptions = {}): UseCalendarReturn {
  const mode = () => toValue(options.mode) ?? 'single';
  const locale = () => toValue(options.locale);
  const localeFirstDay = computed(() => localeFirstDayOfWeek(locale()));
  const firstDayOfWeek = () => toValue(options.firstDayOfWeek) ?? localeFirstDay.value;
  const fixedWeeks = () => toValue(options.fixedWeeks) ?? false;
  const includeToday = () => toValue(options.includeToday) ?? false;
  const field = useOptionalFieldContext();
  const disabled = () => (toValue(options.disabled) ?? false) || (field?.state.value.disabled ?? false);
  const readOnly = () => (toValue(options.readOnly) ?? false) || (field?.state.value.readOnly ?? false);
  const required = () => (toValue(options.required) ?? false) || (field?.required() ?? false);
  const invalid = () => (toValue(options.invalid) ?? false) || (field?.state.value.invalid ?? false);

  const min = computed(() => boundary(toValue(options.min)));
  const max = computed(() => {
    const given = boundary(toValue(options.max));
    if (!toValue(options.maxToday)) return given;

    const today = startOfDay(new Date());
    return given && compareDay(given, today) < 0 ? given : today;
  });

  const disabledDates = computed(() => normalizeList(toValue(options.disabledDates)));

  const value = useControlled<CalendarValue>({
    value: () => normalizeValue(toValue(options.value)),
    defaultValue: () => normalizeValue(toValue(options.defaultValue)) ?? startingPreset() ?? emptyValue(mode()),
    prop: 'modelValue',
    empty: () => emptyValue(mode()),
    onChange: (next) => options.onChange?.(next),
    name: 'useCalendar',
    label: 'value'
  });

  // A bound model that starts empty takes the preset too, so the caller's state holds it.
  const filledByPreset = toList(value.value).length === 0 ? startingPreset() : undefined;

  const selection = shallowRef<Date[]>(toList(value.value));

  function syncFromValue(): void {
    const incoming = toList(value.value);
    if (!sameDays(incoming, selection.value)) {
      selection.value = incoming;
    }
  }

  watch(() => value.value, syncFromValue);

  function publish(next: CalendarValue): void {
    value.value = next;
    syncFromValue();
  }

  if (filledByPreset) publish(filledByPreset);

  const cursor = ref<Date>(
    clampToBounds(
      toDate(toValue(options.defaultMonth)) ?? selection.value[0] ?? toList(filledByPreset ?? null)[0] ?? new Date()
    )
  ) as Ref<Date>;

  const view = ref<CalendarView>('day');

  const hovered = shallowRef<Date | null>(null);

  const gridElement = ref<HTMLElement | null>(null);

  const displayedMonth = computed(() => cursor.value.getMonth());
  const displayedYear = computed(() => cursor.value.getFullYear());
  const yearPageStart = computed(() => Math.floor(displayedYear.value / YEARS_PER_PAGE) * YEARS_PER_PAGE);

  const months = computed(() => monthNames(locale()));
  const weekDays = computed(() => weekDayNames(locale(), firstDayOfWeek()));
  const years = computed(() => Array.from({ length: YEARS_PER_PAGE }, (_, index) => yearPageStart.value + index));

  const dayLabelFormat = computed(() => new Intl.DateTimeFormat(locale(), { dateStyle: 'long' }));

  const weeks = computed(() => {
    const year = displayedYear.value;
    const month = displayedMonth.value;

    const first = new Date(year, month, 1);
    const offset = (first.getDay() - firstDayOfWeek() + DAYS_IN_WEEK) % DAYS_IN_WEEK;
    const start = subDays(first, offset);
    const rows = fixedWeeks() ? 6 : Math.ceil((daysInMonth(year, month) + offset) / DAYS_IN_WEEK);

    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: DAYS_IN_WEEK }, (_, column) => addDays(start, row * DAYS_IN_WEEK + column))
    );
  });

  const activeRange = computed<[Date, Date] | null>(() => {
    if (mode() !== 'range') return null;

    const [first, second] = selection.value;

    if (first && second) {
      return compareDay(first, second) <= 0 ? [first, second] : [second, first];
    }

    if (first && hovered.value) {
      return compareDay(first, hovered.value) <= 0 ? [first, hovered.value] : [hovered.value, first];
    }

    return null;
  });

  const selecting = computed(() => mode() === 'range' && selection.value.length === 1);

  const state = computed<CalendarState>(() => ({
    mode: mode(),
    view: view.value,
    month: displayedMonth.value,
    year: displayedYear.value,
    monthLabel: months.value[displayedMonth.value] ?? '',
    yearLabel: String(displayedYear.value),
    selected: selection.value,
    selecting: selecting.value,
    empty: selection.value.length === 0,
    disabled: disabled(),
    readOnly: readOnly(),
    required: required(),
    invalid: invalid()
  }));

  useFieldValue(field, () => value.value);
  watch(() => selection.value.length > 0, (filled) => field?.setFilled(filled), { immediate: true });

  // A range is submitted once both ends are picked; the days go in date order.
  const hiddenInputs = computed(() => {
    const name = toValue(options.name) ?? field?.name();
    if (!name || (mode() === 'range' && selection.value.length !== 2)) return [];

    const form = toValue(options.form);
    return [...selection.value]
      .sort(compareDay)
      .map((date) => ({ name, value: formatISO(date), form }));
  });

  const ROOT_ATTRS = {
    month: () => null,
    year: () => null,
    monthLabel: () => null,
    yearLabel: () => null,
    selected: () => null,
    readOnly: (on: boolean) => (on ? { 'data-readonly': '' } : null)
  };

  const rootProps = computed(() => ({
    'data-part': 'calendar',
    ...dataAttrs(state.value, ROOT_ATTRS),
    // Inside a field, the calendar is its control: a group named by the label.
    ...(field && {
      role: 'group',
      'aria-labelledby': field.labelledBy.value,
      'aria-describedby': field.describedBy.value,
      'aria-required': required() || undefined,
      'aria-invalid': invalid() || undefined,
      onFocusin: () => field.setFocused(true),
      // Touched once focus leaves the calendar, not when it moves between days.
      onFocusout(event: FocusEvent) {
        const next = event.relatedTarget;
        if (next instanceof Node && (event.currentTarget as HTMLElement).contains(next)) return;

        field.setFocused(false);
        field.setTouched(true);
      }
    })
  }));

  function boundary(input: DateInput): Date | null {
    const parsed = toDate(input);
    return parsed ? startOfDay(parsed) : null;
  }

  function clampToBounds(date: Date): Date {
    return startOfDay(clampDate(date, min.value, max.value));
  }

  function isDayDisabled(date: Date): boolean {
    if (disabled()) return true;
    if (!isWithin(date, min.value, max.value)) return true;
    if (disabledDates.value.some((entry) => isSameDay(entry, date))) return true;
    return options.isDateDisabled?.(date) ?? false;
  }

  function pageRange(date: Date, current: CalendarView = view.value): [Date, Date] {
    if (current === 'day') return [startOfMonth(date), endOfMonth(date)];
    if (current === 'month') return [startOfYear(date), endOfYear(date)];

    const start = Math.floor(date.getFullYear() / YEARS_PER_PAGE) * YEARS_PER_PAGE;
    return [new Date(start, 0, 1), new Date(start + YEARS_PER_PAGE - 1, 11, 31)];
  }

  function setCursor(next: Date): void {
    const clamped = clampToBounds(next);
    if (!isSameDay(clamped, cursor.value)) {
      cursor.value = clamped;
    }
  }

  function focusCursor(): void {
    void nextTick(() => {
      // Focus may have left by now (a pick that closed a datepicker); only follow it inside, or off the
      // body where a re-rendered day dropped it.
      const active = document.activeElement;
      if (!focusInsideGrid() && active !== document.body && active !== null) return;

      const target = gridElement.value?.querySelector<HTMLElement>('[data-highlighted]');
      if (target && target !== active) target.focus();
    });
  }

  function focusInsideGrid(): boolean {
    const grid = gridElement.value;
    return !!grid && typeof document !== 'undefined' && grid.contains(document.activeElement);
  }

  watch(cursor, () => {
    if (focusInsideGrid()) focusCursor();
  });

  function select(date: Date): void {
    const day = startOfDay(date);
    setCursor(day);

    if (readOnly() || isDayDisabled(day)) return;

    if (mode() === 'single') {
      publish(day);
      return;
    }

    if (mode() === 'multiple') {
      const without = selection.value.filter((entry) => !isSameDay(entry, day));
      const next = without.length === selection.value.length ? [...selection.value, day] : without;
      next.sort(compareDay);
      publish(next);
      return;
    }

    if (selection.value.length === 1) {
      const pair: [Date, Date] =
        compareDay(selection.value[0]!, day) <= 0 ? [selection.value[0]!, day] : [day, selection.value[0]!];
      hovered.value = null;
      publish(pair);
      return;
    }

    selection.value = [day];
  }

  function clear(): void {
    publish(emptyValue(mode()));
  }

  function completeRange(): void {
    if (mode() !== 'range' || selection.value.length !== 1) return;

    const only = selection.value[0]!;
    hovered.value = null;
    publish([only, only]);
  }

  function setView(next: CalendarView): void {
    view.value = next;
  }

  function step(direction: 1 | -1, current: CalendarView = view.value): Date {
    if (current === 'day') return addMonths(cursor.value, direction);
    if (current === 'month') return addYears(cursor.value, direction);
    return addYears(cursor.value, direction * YEARS_PER_PAGE);
  }

  function goto(direction: 1 | -1): void {
    const inside = focusInsideGrid();
    setCursor(step(direction));
    if (inside) focusCursor();
  }

  function canGo(direction: 1 | -1): boolean {
    const [start, end] = pageRange(step(direction));
    return direction === -1
      ? !min.value || compareDay(end, min.value) >= 0
      : !max.value || compareDay(start, max.value) <= 0;
  }

  function selectMonth(month: number): void {
    const inside = focusInsideGrid();
    const year = displayedYear.value;
    const day = Math.min(cursor.value.getDate(), daysInMonth(year, month));
    setCursor(new Date(year, month, day));
    setView('day');
    if (inside) {
      focusCursor();
    }
  }

  function selectYear(year: number): void {
    const inside = focusInsideGrid();
    const month = displayedMonth.value;
    const day = Math.min(cursor.value.getDate(), daysInMonth(year, month));
    setCursor(new Date(year, month, day));
    setView('day');
    if (inside) {
      focusCursor();
    }
  }

  function unit(amount: number): Date {
    if (view.value === 'day') return addDays(cursor.value, amount);
    if (view.value === 'month') return addMonths(cursor.value, amount);
    return addYears(cursor.value, amount);
  }

  function rowStep(): number {
    return view.value === 'day' ? DAYS_IN_WEEK : 3;
  }

  function rowEdge(edge: 'start' | 'end'): Date {
    if (view.value === 'day') {
      const offset = (cursor.value.getDay() - firstDayOfWeek() + DAYS_IN_WEEK) % DAYS_IN_WEEK;
      return addDays(cursor.value, edge === 'start' ? -offset : DAYS_IN_WEEK - 1 - offset);
    }
    if (view.value === 'month') {
      return addMonths(
        cursor.value,
        edge === 'start' ? -displayedMonth.value : MONTHS_IN_YEAR - 1 - displayedMonth.value
      );
    }
    const offset = displayedYear.value - yearPageStart.value;
    return addYears(cursor.value, edge === 'start' ? -offset : YEARS_PER_PAGE - 1 - offset);
  }

  function pageBy(direction: 1 | -1, large: boolean): Date {
    if (view.value === 'day') {
      return large ? addYears(cursor.value, direction) : addMonths(cursor.value, direction);
    }

    if (view.value === 'month') {
      return addYears(cursor.value, direction * (large ? YEARS_PER_PAGE : 1));
    }

    return addYears(cursor.value, direction * YEARS_PER_PAGE);
  }

  function onKeydown(event: KeyboardEvent): void {
    let next: Date | null = null;

    switch (event.key) {
      case 'ArrowLeft':
        next = unit(-1);
        break;
      case 'ArrowRight':
        next = unit(1);
        break;
      case 'ArrowUp':
        next = unit(-rowStep());
        break;
      case 'ArrowDown':
        next = unit(rowStep());
        break;
      case 'Home':
        next = rowEdge('start');
        break;
      case 'End':
        next = rowEdge('end');
        break;
      case 'PageUp':
        next = pageBy(-1, event.shiftKey);
        break;
      case 'PageDown':
        next = pageBy(1, event.shiftKey);
        break;
      default:
        return;
    }

    event.preventDefault();
    setCursor(next);
    focusCursor();
  }

  const gridLabel = computed(() => {
    if (view.value === 'day') return `${state.value.monthLabel} ${displayedYear.value}`;
    if (view.value === 'month') return String(displayedYear.value);

    return `${yearPageStart.value}–${yearPageStart.value + YEARS_PER_PAGE - 1}`;
  });

  const gridProps = computed(() => ({
    'data-part': 'grid',
    'data-view': view.value,
    ref: setGridElement,
    role: 'grid',
    'aria-label': gridLabel.value,
    'aria-disabled': disabled() || undefined,
    'aria-readonly': readOnly() || undefined,
    'aria-multiselectable': mode() === 'single' ? undefined : true,
    onKeydown,
    onPointerleave() {
      hovered.value = null;
    }
  }));

  function setGridElement(element: unknown): void {
    gridElement.value = (element as HTMLElement) ?? null;
  }

  const rowProps = computed(() => ({ 'data-part': 'row', role: 'row' }));

  const DAY_ATTRS = {
    date: () => null,
    rangeStart: (on: boolean) => (on ? { 'data-range-start': '' } : null),
    rangeEnd: (on: boolean) => (on ? { 'data-range-end': '' } : null),
    inRange: (on: boolean) => (on ? { 'data-in-range': '' } : null)
  };

  function getDayState(date: Date): CalendarDayState {
    const range = activeRange.value;
    const selected = selection.value.some((entry) => isSameDay(entry, date));

    return {
      date,
      selected,
      rangeStart: !!range && isSameDay(date, range[0]),
      rangeEnd: !!range && isSameDay(date, range[1]),
      inRange: !!range && compareDay(date, range[0]) > 0 && compareDay(date, range[1]) < 0,
      preview: selecting.value && !selected && !!hovered.value && isSameDay(date, hovered.value),
      outside: !isSameMonth(date, cursor.value),
      today: isToday(date),
      weekend: isWeekend(date),
      disabled: isDayDisabled(date),
      highlighted: isSameDay(date, cursor.value)
    };
  }

  function getDayProps(date: Date): Record<string, unknown> {
    const day = getDayState(date);

    return {
      'data-part': 'day',
      'data-value': formatISO(date),
      ...dataAttrs(day, DAY_ATTRS),
      role: 'gridcell',
      type: 'button',
      'aria-disabled': day.disabled || undefined,
      'aria-selected': day.selected,
      'aria-current': day.today ? ('date' as const) : undefined,
      'aria-label': dayLabelFormat.value.format(date),
      tabindex: day.highlighted ? 0 : -1,
      autofocus: (day.highlighted && toValue(options.autofocusDay)) || undefined,
      onClick() {
        select(date);
      },
      onFocus() {
        setCursor(date);
      },
      onPointerenter() {
        if (!day.disabled) {
          hovered.value = date;
        }
      }
    };
  }

  function getWeekDayState(index: WeekDay): CalendarWeekDayState {
    const entry = weekDays.value.find((day) => day.index === index) ?? weekDays.value[0]!;
    return { ...entry, weekend: entry.index === 0 || entry.index === 6 };
  }

  function getWeekDayProps(index: WeekDay): Record<string, unknown> {
    const day = getWeekDayState(index);
    return {
      'data-part': 'week-day',
      'data-value': day.index,
      ...(day.weekend ? { 'data-weekend': '' } : null),
      role: 'columnheader',
      'aria-label': day.long
    };
  }

  function getMonthState(month: number): CalendarMonthState {
    const now = new Date();
    const [start, end] = pageRange(new Date(displayedYear.value, month, 1), 'day');

    return {
      month,
      label: months.value[month] ?? '',
      selected: month === displayedMonth.value,
      current: month === now.getMonth() && displayedYear.value === now.getFullYear(),
      disabled: disabled() || !overlapsBounds(start, end),
      highlighted: month === displayedMonth.value
    };
  }

  function getMonthProps(month: number): Record<string, unknown> {
    const item = getMonthState(month);
    return {
      'data-part': 'month',
      'data-value': month,
      ...dataAttrs(item, { month: () => null, label: () => null }),
      role: 'gridcell',
      type: 'button',
      'aria-disabled': item.disabled || undefined,
      'aria-selected': item.selected,
      'aria-label': `${item.label} ${displayedYear.value}`,
      tabindex: item.highlighted ? 0 : -1,
      onClick() {
        if (!item.disabled) selectMonth(month);
      }
    };
  }

  function getYearState(year: number): CalendarYearState {
    return {
      year,
      selected: year === displayedYear.value,
      current: year === new Date().getFullYear(),
      disabled: disabled() || !overlapsBounds(new Date(year, 0, 1), new Date(year, 11, 31)),
      highlighted: year === displayedYear.value
    };
  }

  function getYearProps(year: number): Record<string, unknown> {
    const item = getYearState(year);
    return {
      'data-part': 'year',
      'data-value': year,
      ...dataAttrs(item, { year: () => null }),
      role: 'gridcell',
      type: 'button',
      'aria-disabled': item.disabled || undefined,
      'aria-selected': item.selected,
      tabindex: item.highlighted ? 0 : -1,
      onClick() {
        if (!item.disabled) {
          selectYear(year);
        }
      }
    };
  }

  function overlapsBounds(start: Date, end: Date): boolean {
    if (min.value && compareDay(end, min.value) < 0) return false;
    if (max.value && compareDay(start, max.value) > 0) return false;
    return true;
  }

  const PAGE_NOUN: Record<CalendarView, string> = {
    day: 'month',
    month: 'year',
    year: 'years'
  };

  const prevProps = computed(() => ({
    'data-part': 'prev',
    type: 'button',
    disabled: disabled() || !canGo(-1) || undefined,
    'aria-label': `Previous ${PAGE_NOUN[view.value]}`,
    onClick() {
      goto(-1);
    }
  }));

  const nextProps = computed(() => ({
    'data-part': 'next',
    type: 'button',
    disabled: disabled() || !canGo(1) || undefined,
    'aria-label': `Next ${PAGE_NOUN[view.value]}`,
    onClick() {
      goto(1);
    }
  }));

  function getViewTriggerProps(target: Exclude<CalendarView, 'day'>): Record<string, unknown> {
    const open = view.value === target;
    return {
      'data-part': 'view-trigger',
      'data-view': target,
      ...(open ? { 'data-open': '' } : null),
      type: 'button',
      disabled: disabled() || undefined,
      'aria-expanded': open,
      onClick() {
        setView(open ? 'day' : target);
      }
    };
  }

  // `disabled` here is only "out of bounds"; the list adds the calendar's own state.
  function resolvePreset(entry: CalendarPresetInput): CalendarPresetItem | null {
    const option: CalendarPresetOption = typeof entry === 'string' ? { key: entry } : entry;
    const raw = option.range
      ? option.range()
      : isPresetKey(option.key)
        ? presetRange(option.key, { includeToday: includeToday() })
        : null;

    if (!raw) return null;

    const start = toDate(raw[0]);
    const end = toDate(raw[1]);

    if (!start || !end) return null;

    const ordered: [Date, Date] =
      compareDay(start, end) <= 0 ? [startOfDay(start), startOfDay(end)] : [startOfDay(end), startOfDay(start)];

    // A built-in quarter is no use before it starts; a custom range may be meant for the future.
    const notStarted = !option.range && QUARTERS.has(option.key) && compareDay(ordered[0], new Date()) > 0;

    return {
      key: option.key,
      label: option.label ?? (isPresetKey(option.key) ? PRESET_LABELS[option.key] : option.key),
      range: [clampToBounds(ordered[0]), clampToBounds(ordered[1])],
      disabled: notStarted || !overlapsBounds(ordered[0], ordered[1])
    };
  }

  function presetValue([start, end]: [Date, Date]): CalendarValue {
    if (mode() === 'range') return [start, end];
    if (mode() === 'multiple') return setDateRange(start, end).filter((day) => !isDayDisabled(day));
    return start;
  }

  // The `preset` option's value: a key from `presets`, or any built-in key.
  function startingPreset(): CalendarValue | undefined {
    const key = toValue(options.preset);
    if (!key) return undefined;

    const entry =
      presetList(toValue(options.presets)).find((option) => (typeof option === 'string' ? option : option.key) === key) ??
      (isPresetKey(key) ? key : undefined);
    const item = entry && resolvePreset(entry);

    return item && !item.disabled ? presetValue(item.range) : undefined;
  }

  const presets = computed<CalendarPresetItem[]>(() =>
    presetList(toValue(options.presets)).flatMap((entry) => {
      const item = resolvePreset(entry);
      return item ? [{ ...item, disabled: disabled() || readOnly() || item.disabled }] : [];
    })
  );

  const presetsProps = computed(() => ({ 'data-part': 'presets' }));

  function getPresetState(key: string): CalendarPresetItem | undefined {
    return presets.value.find((item) => item.key === key);
  }

  function getPresetProps(key: string): Record<string, unknown> {
    const item = getPresetState(key);
    return {
      'data-part': 'preset',
      'data-value': key,
      ...(item?.disabled ? { 'data-disabled': '' } : null),
      type: 'button',
      disabled: item?.disabled || undefined,
      onClick() {
        applyPreset(key);
      }
    };
  }

  function applyPreset(key: string): void {
    const item = getPresetState(key);

    if (!item || item.disabled) return;

    publish(presetValue(item.range));

    hovered.value = null;
    setView('day');
    setCursor(item.range[0]);
  }

  return {
    value,
    state,
    selection,
    weeks,
    weekDays,
    months,
    years,
    presets,

    rootProps,
    hiddenInputs,
    gridProps,
    rowProps,
    prevProps,
    nextProps,
    presetsProps,

    getDayProps,
    getDayState,
    getWeekDayProps,
    getWeekDayState,
    getMonthProps,
    getMonthState,
    getYearProps,
    getYearState,
    getViewTriggerProps,
    getPresetProps,
    getPresetState,

    select,
    clear,
    applyPreset,
    completeRange,
    setView,
    goto,

    isDayDisabled,
    cursor
  };
}

function presetList(input: CalendarPresetsInput | undefined): CalendarPresetInput[] {
  if (input === undefined) return DEFAULT_PRESETS;

  const entries = (typeof input === 'string' ? [input] : input).flatMap((entry) =>
    entry === 'base' || entry === 'all' ? PRESET_GROUPS[entry] : [entry]
  );
  const seen = new Set<string>();

  return entries.filter((entry) => {
    const key = typeof entry === 'string' ? entry : entry.key;
    return !seen.has(key) && !!seen.add(key);
  });
}

/** The value as `v-model` writes it back, through its modifiers. */
export function serializeCalendarValue(value: CalendarValue, modifiers: CalendarModelModifiers = {}): CalendarModelValue {
  const { iso, safe } = modifiers;
  if (!iso && !safe) return value;

  const write = (date: Date) => (iso ? (safe ? formatSafeISO(date) : formatISO(date)) : toDate(formatSafeISO(date))!);
  if (value === null) return null;
  return Array.isArray(value) ? (value.map(write) as string[] | Date[]) : write(value);
}

function normalizeList(input: DateInput[] | undefined): Date[] {
  if (!input) return [];

  return input
    .map((entry) => toDate(entry))
    .filter((entry): entry is Date => entry !== null)
    .map(startOfDay);
}

function normalizeValue(input: CalendarValueInput | undefined): CalendarValue | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (Array.isArray(input)) return normalizeList(input);

  const parsed = toDate(input);
  return parsed ? startOfDay(parsed) : null;
}

function emptyValue(mode: CalendarSelectionMode): CalendarValue {
  return mode === 'single' ? null : [];
}

function toList(value: CalendarValue): Date[] {
  if (value === null || value === undefined) return [];

  return Array.isArray(value) ? value : [value];
}

function sameDays(a: Date[], b: Date[]): boolean {
  return a.length === b.length && a.every((date, index) => isSameDay(date, b[index]!));
}

export const { provideContext: provideCalendarContext, useContext: useCalendarContext } =
  createContext<UseCalendarReturn>('Calendar');
