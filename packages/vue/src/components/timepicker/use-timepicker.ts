import {
  computed,
  nextTick,
  onMounted,
  reactive,
  ref,
  toValue,
  useId,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type WritableComputedRef
} from 'vue';
import { createContext } from '../../shared/context';
import { dataAttrs } from '../../shared/data-attrs';
import { provideSurface } from '../../shared/surface';
import { useControlled } from '../../shared/use-controlled';
import { useFieldValue, useOptionalFieldContext } from '../../shared/use-field';
import { usePopover } from '../popover/use-popover';
import type { Align, Side } from '../../shared/use-positioning';

/** `period` is the AM/PM segment and column, shown with `hourCycle: 12`. */
export type TimeUnit = 'hour' | 'minute' | 'second' | 'period';

export type HourCycle = 12 | 24;

export interface TimepickerState {
  /** The value, `HH:mm` or `HH:mm:ss`; `null` while any segment is empty. */
  value: string | null;
  /**
   * Whether every segment is empty.
   * @attribute `data-empty`
   */
  empty: boolean;
  /**
   * Whether the popup is open.
   * @attribute `data-open`
   */
  open: boolean;
  /** @attribute `data-disabled` */
  disabled: boolean;
  /** @attribute `data-readonly` */
  readOnly: boolean;
  /** @attribute `data-required` */
  required: boolean;
  /** @attribute `data-invalid` */
  invalid: boolean;
}

export interface UseTimepickerOptions {
  value?: MaybeRefOrGetter<string | null | undefined>;
  defaultValue?: MaybeRefOrGetter<string | null | undefined>;
  /** Adds a second segment and column, and writes `HH:mm:ss`. */
  seconds?: MaybeRefOrGetter<boolean | undefined>;
  /** The earliest time that can be stepped to or picked, `HH:mm(:ss)`. */
  min?: MaybeRefOrGetter<string | null | undefined>;
  /** The latest time that can be stepped to or picked, `HH:mm(:ss)`. */
  max?: MaybeRefOrGetter<string | null | undefined>;
  /** `12` shows the hour as 12, 01–11 with an AM/PM segment; the value stays 24-hour. @default 24 */
  hourCycle?: MaybeRefOrGetter<HourCycle | undefined>;
  /** The AM/PM segment's text. @default ['AM', 'PM'] */
  periodLabels?: MaybeRefOrGetter<readonly [string, string] | undefined>;
  open?: MaybeRefOrGetter<boolean | undefined>;
  /** Opens the popup when focus enters the segments, leaving it there. @default true */
  openOnFocus?: MaybeRefOrGetter<boolean | undefined>;
  side?: MaybeRefOrGetter<Side | undefined>;
  align?: MaybeRefOrGetter<Align | undefined>;
  sideOffset?: MaybeRefOrGetter<number | undefined>;
  disabled?: MaybeRefOrGetter<boolean | undefined>;
  readOnly?: MaybeRefOrGetter<boolean | undefined>;
  required?: MaybeRefOrGetter<boolean | undefined>;
  invalid?: MaybeRefOrGetter<boolean | undefined>;
  name?: MaybeRefOrGetter<string | undefined>;
  form?: MaybeRefOrGetter<string | undefined>;
  onChange?: (value: string | null) => void;
  onOpenChange?: (open: boolean) => void;
}

export interface TimepickerOption {
  /** The hour 0–23 even in 12-hour, the minute or second, or `0`/`1` for AM/PM. */
  value: number;
  /** As the segment shows it: `'07'`, `'12'`, `'PM'`. */
  label: string;
  selected: boolean;
  /** Outside `min`/`max`. */
  disabled: boolean;
  props: Record<string, unknown>;
}

export interface UseTimepickerReturn {
  value: WritableComputedRef<string | null>;
  open: WritableComputedRef<boolean>;
  state: ComputedRef<TimepickerState>;
  hooks: ComputedRef<Record<string, string>>;
  /** The units shown, in order. */
  units: ComputedRef<TimeUnit[]>;
  /** What each segment holds, `null` while empty. `hour` is 0–23 in either cycle; `period` is `0` (AM) or `1` (PM). */
  parts: Record<TimeUnit, number | null>;
  /** A unit's value as its segment shows it: `'07'`, `'12'`, `'PM'`. */
  display: (unit: TimeUnit, value: number) => string;
  rootProps: ComputedRef<Record<string, unknown>>;
  inputProps: ComputedRef<Record<string, unknown>>;
  triggerProps: ComputedRef<Record<string, unknown>>;
  clearProps: ComputedRef<Record<string, unknown>>;
  getSegmentProps: (unit: TimeUnit) => Record<string, unknown>;
  /** The hidden input's value: the value, or `''`. */
  hiddenValue: ComputedRef<string>;
  name: () => string | undefined;
  form: () => string | undefined;
  clear: () => void;
  /** @internal For `useTimepickerColumn`. */
  pick: (unit: TimeUnit, value: number) => void;
  /** @internal A column's values, in order. */
  values: (unit: TimeUnit) => number[];
  /** @internal Whether a value can be picked within `min`/`max`. */
  allowed: (unit: TimeUnit, value: number) => boolean;
  /** @internal The next value allowed `delta` away, wrapping; from `null`, the first (or last) one. */
  seek: (unit: TimeUnit, from: number | null, delta: number) => number | undefined;
  /** @internal */
  columns: Map<TimeUnit, HTMLElement>;
}

export const MAX: Record<TimeUnit, number> = { hour: 23, minute: 59, second: 59, period: 1 };
const LABELS: Record<TimeUnit, string> = { hour: 'Hours', minute: 'Minutes', second: 'Seconds', period: 'AM/PM' };
const DAY = 24 * 3600;
const TIME = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/;

const pad = (value: number) => String(value).padStart(2, '0');

/** `'9:5'` → `{ hour: 9, minute: 5, second: 0 }`; `null` for anything out of range or unreadable. */
export function parseTime(input: string | null | undefined): Record<'hour' | 'minute' | 'second', number> | null {
  const match = TIME.exec(input?.trim() ?? '');
  if (!match) return null;

  const time = { hour: Number(match[1]), minute: Number(match[2]), second: Number(match[3] ?? 0) };
  return time.hour <= MAX.hour && time.minute <= MAX.minute && time.second <= MAX.second ? time : null;
}

const range = (length: number, from = 0) => Array.from({ length }, (_, i) => from + i);
const wrap = (value: number, size: number) => ((value % size) + size) % size;

export function useTimepicker(options: UseTimepickerOptions = {}): UseTimepickerReturn {
  const field = useOptionalFieldContext();
  const segmentBaseId = useId();

  const seconds = () => toValue(options.seconds) ?? false;
  const twelve = () => toValue(options.hourCycle) === 12;
  const units = computed<TimeUnit[]>(() => [
    'hour',
    'minute',
    ...(seconds() ? (['second'] as const) : []),
    ...(twelve() ? (['period'] as const) : [])
  ]);

  const disabled = () => (toValue(options.disabled) ?? false) || (field?.state.value.disabled ?? false);
  const readOnly = () => (toValue(options.readOnly) ?? false) || (field?.state.value.readOnly ?? false);
  const required = () => (toValue(options.required) ?? false) || (field?.required() ?? false);
  // A typed time outside `min`/`max` too (`outOfRange`, below).
  const invalid = () =>
    (toValue(options.invalid) ?? false) || (field?.state.value.invalid ?? false) || outOfRange.value;
  const locked = () => disabled() || readOnly();

  const value = useControlled<string | null>({
    value: () => toValue(options.value),
    defaultValue: () => toValue(options.defaultValue) ?? null,
    empty: null,
    prop: 'modelValue',
    onChange: (next) => options.onChange?.(next),
    name: 'TimepickerRoot',
    label: 'modelValue'
  });

  const parts = reactive<Record<TimeUnit, number | null>>({ hour: null, minute: null, second: null, period: null });

  // In 12-hour, `hour` stays 0–23: while the period is empty it reads as AM.
  const filled = () => units.value.every((unit) => parts[unit] !== null);

  function format(): string | null {
    if (!filled()) return null;
    return [parts.hour!, parts.minute!, ...(seconds() ? [parts.second!] : [])].map(pad).join(':');
  }

  /** Seconds since midnight, once every segment is filled. */
  function time(): number | null {
    return filled() ? parts.hour! * 3600 + parts.minute! * 60 + (seconds() ? parts.second! : 0) : null;
  }

  // What this picker last wrote: when it comes back as the value, the segments
  // already show it, partly typed ones included.
  let published: string | null | undefined;

  function publish(): void {
    const next = format();
    if (next === value.value) return;
    published = next;
    value.value = next;
  }

  function read(input: string | null): void {
    const time = parseTime(input);
    for (const unit of ['hour', 'minute', 'second'] as const) {
      parts[unit] = time ? time[unit] : null;
    }
    parts.period = time ? Number(time.hour >= 12) : null;
  }

  watch(
    () => value.value,
    (next) => {
      if (published !== undefined && next === published) return;
      published = undefined;
      read(next);
    },
    { immediate: true }
  );

  // Seconds or the hour cycle changed: the value is rewritten in the new shape.
  watch(units, () => {
    if (seconds() && parts.second === null && parts.hour !== null && parts.minute !== null) parts.second = 0;
    if (twelve() && parts.period === null && parts.hour !== null) parts.period = Number(parts.hour >= 12);
    publish();
  });

  // `min`/`max` in seconds since midnight. Without a seconds segment they round
  // inward to whole minutes, the finest a value can then be. A `min` after `max`
  // (a range over midnight) isn't supported, and bounds nothing.
  const bounds = computed(() => {
    const min = parseTime(toValue(options.min));
    const max = parseTime(toValue(options.max));
    if (!min && !max) return null;

    const seconds_ = ({ hour, minute, second }: Record<'hour' | 'minute' | 'second', number>) =>
      hour * 3600 + minute * 60 + second;
    let lo = min ? seconds_(min) : 0;
    let hi = max ? seconds_(max) : DAY - 1;
    if (!seconds()) {
      lo = Math.ceil(lo / 60) * 60;
      hi = Math.floor(hi / 60) * 60;
    }
    return lo <= hi ? { lo, hi } : null;
  });

  const outOfRange = computed(() => {
    const at = parseTime(value.value);
    const limit = bounds.value;
    if (!at || !limit) return false;
    const t = at.hour * 3600 + at.minute * 60 + (seconds() ? at.second : 0);
    return t < limit.lo || t > limit.hi;
  });

  // Whether a unit can take a value with some time inside the bounds: the units
  // above it as they are (any value while empty), the ones below it free.
  function allowed(unit: TimeUnit, next: number): boolean {
    const limit = bounds.value;
    if (!limit) return true;

    // In 12-hour an hour is either half until the period says which.
    const halves = (hour: number) =>
      !twelve() ? [hour] : parts.period === null ? [hour % 12, (hour % 12) + 12] : [(hour % 12) + parts.period * 12];
    let hours: number[];
    if (unit === 'period') hours = parts.hour === null ? range(12, next * 12) : [(parts.hour % 12) + next * 12];
    else if (unit === 'hour') hours = halves(next);
    else if (parts.hour !== null) hours = halves(parts.hour);
    else hours = twelve() && parts.period !== null ? range(12, parts.period * 12) : range(24);

    let minutes: (number | null)[] = [null];
    if (unit === 'minute') minutes = [next];
    else if (unit === 'second') minutes = parts.minute === null ? range(60) : [parts.minute];

    const second = unit === 'second' ? next : null;
    const lastSecond = seconds() ? 59 : 0;

    return hours.some((hour) =>
      minutes.some((minute) => {
        const start = hour * 3600 + (minute ?? 0) * 60 + (second ?? 0);
        const end = hour * 3600 + (minute ?? 59) * 60 + (second ?? lastSecond);
        return start <= limit.hi && end >= limit.lo;
      })
    );
  }

  // A step or a pick never leaves the bounds: a time it left outside them moves
  // to the nearer one. Typing is left as typed, and marked invalid.
  function clampIntoRange(): void {
    const t = time();
    const limit = bounds.value;
    if (t === null || !limit || (t >= limit.lo && t <= limit.hi)) return;

    const next = t < limit.lo ? limit.lo : limit.hi;
    parts.hour = Math.floor(next / 3600);
    parts.minute = Math.floor(next / 60) % 60;
    if (seconds()) parts.second = next % 60;
    if (twelve()) parts.period = Number(parts.hour >= 12);
  }

  /** A column's values in order: in 12-hour, the hours of the period shown, 12 first. */
  function values(unit: TimeUnit): number[] {
    if (unit === 'period') return [0, 1];
    if (unit === 'hour' && twelve()) return range(12, (parts.period ?? 0) * 12);
    return range(MAX[unit] + 1);
  }

  function seek(unit: TimeUnit, from: number | null, delta: number): number | undefined {
    const list = values(unit);
    const direction = Math.sign(delta);
    const index = from === null ? -1 : list.indexOf(from);
    let at = index === -1 ? (direction > 0 ? 0 : list.length - 1) : wrap(index + delta, list.length);

    for (let tries = 0; tries < list.length; tries += 1) {
      if (allowed(unit, list[at])) return list[at];
      at = wrap(at + direction, list.length);
    }
    return undefined;
  }

  function display(unit: TimeUnit, next: number): string {
    if (unit === 'period') return (toValue(options.periodLabels) ?? ['AM', 'PM'])[next];
    if (unit === 'hour' && twelve()) return pad(next % 12 || 12);
    return pad(next);
  }

  const empty = computed(() => units.value.every((unit) => parts[unit] === null));

  useFieldValue(field, () => value.value);
  watch(() => !empty.value, (filled) => field?.setFilled(filled), { immediate: true });

  // Opened from the trigger, focus moves into the columns; opened by focus on a
  // segment, it stays there, so typing carries on.
  const focusPopup = ref(true);

  // The popup lines up with the whole picker: its root, not the trigger.
  const popover = usePopover({
    open: () => toValue(options.open),
    autoFocus: () => focusPopup.value,
    side: () => toValue(options.side) ?? 'bottom',
    align: () => toValue(options.align) ?? 'start',
    sideOffset: () => toValue(options.sideOffset) ?? 8,
    onChange: (open) => options.onOpenChange?.(open)
  });

  const state = computed<TimepickerState>(() => ({
    value: value.value,
    empty: empty.value,
    open: popover.open.value,
    disabled: disabled(),
    readOnly: readOnly(),
    required: required(),
    invalid: invalid()
  }));

  const hooks = computed(() => dataAttrs(state.value, { value: () => null }));

  const segments = new Map<TimeUnit, HTMLElement>();
  const columns = new Map<TimeUnit, HTMLElement>();
  const rootEl = ref<HTMLElement | null>(null);
  const popupEl = ref<HTMLElement | null>(null);

  function focusSegment(unit: TimeUnit | undefined): void {
    if (unit) segments.get(unit)?.focus();
  }

  function neighbor(unit: TimeUnit, step: number): TimeUnit | undefined {
    return units.value[units.value.indexOf(unit) + step];
  }

  // A period keeps the hour in its half; a 12-hour hour lands in the period's.
  function assign(unit: TimeUnit, next: number | null): void {
    parts[unit] = next;
    if (!twelve() || next === null) return;
    if (unit === 'period' && parts.hour !== null) parts.hour = (parts.hour % 12) + next * 12;
    if (unit === 'hour') parts.hour = (next % 12) + (parts.period ?? 0) * 12;
  }

  function set(unit: TimeUnit, next: number | null, clamp = false): void {
    assign(unit, next);
    if (clamp) clampIntoRange();
    publish();
  }

  // From empty, up gives the lowest and down the highest.
  function step(unit: TimeUnit, delta: number, from: number | null = parts[unit]): void {
    const next = seek(unit, from, delta);
    if (next !== undefined) set(unit, next, true);
  }

  // The digits typed into one segment so far; leaving it ends the typing.
  let typing: { unit: TimeUnit; digits: string } | null = null;

  function type(unit: TimeUnit, digit: string): void {
    // A 12-hour hour runs 1–12, so a lone 0 only waits for its second digit.
    const hour12 = unit === 'hour' && twelve();
    const max = hour12 ? 12 : MAX[unit];
    let digits = (typing?.unit === unit ? typing.digits : '') + digit;
    if (Number(digits) > max || (hour12 && digits === '00')) digits = digit;

    if (!(hour12 && digits === '0')) set(unit, Number(digits));

    const done = digits.length === 2 || Number(digits) * 10 > max;
    typing = done ? null : { unit, digits };
    if (done) focusSegment(neighbor(unit, 1));
  }

  // The first letter of either label sets the period: `a` or `p`.
  function typePeriod(letter: string): boolean {
    const labels = toValue(options.periodLabels) ?? ['AM', 'PM'];
    const index = labels.findIndex((label) => label[0]?.toLowerCase() === letter.toLowerCase());
    if (index === -1) return false;
    set('period', index, true);
    return true;
  }

  function onSegmentKeydown(unit: TimeUnit, event: KeyboardEvent): void {
    if (disabled()) return;

    const moves: Record<string, () => void> = {
      ArrowLeft: () => focusSegment(neighbor(unit, -1)),
      ArrowRight: () => focusSegment(neighbor(unit, 1)),
      ':': () => focusSegment(neighbor(unit, 1)),
      '.': () => focusSegment(neighbor(unit, 1)),
      ' ': () => focusSegment(neighbor(unit, 1))
    };
    const big = unit === 'minute' || unit === 'second' ? 10 : 1;
    const edits: Record<string, () => void> = {
      ArrowUp: () => step(unit, 1),
      ArrowDown: () => step(unit, -1),
      PageUp: () => step(unit, big),
      PageDown: () => step(unit, -big),
      Home: () => step(unit, 1, null),
      End: () => step(unit, -1, null),
      Backspace: () => set(unit, null),
      Delete: () => set(unit, null)
    };

    const move = moves[event.key];
    const edit = edits[event.key];
    const digit = unit !== 'period' && /^\d$/.test(event.key);
    const letter = unit === 'period' && /^\p{L}$/u.test(event.key);
    if (!move && !edit && !digit && !letter) return;

    event.preventDefault();
    if (move) return move();
    if (readOnly()) return;

    if (digit) return type(unit, event.key);
    if (letter) {
      typing = null;
      if (typePeriod(event.key)) focusSegment(neighbor(unit, 1));
      return;
    }
    typing = null;
    edit!();
  }

  // Touched once focus leaves the picker and its popup, not as it moves between them.
  function onFocusout(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && (rootEl.value?.contains(next) || popupEl.value?.contains(next))) return;
    field?.setFocused(false);
    field?.setTouched(true);
    // Tabbed away. Focus going nowhere, as a press on the popup's padding sends
    // it, is left to the outside-press dismissal.
    if (next instanceof Node) popover.open.value = false;
  }

  function show(focusInside: boolean): void {
    if (locked() || popover.open.value) return;
    focusPopup.value = focusInside;
    popover.open.value = true;
  }

  const inputEl = ref<HTMLElement | null>(null);
  const openOnFocus = () => toValue(options.openOnFocus) ?? true;

  // Only focus arriving from outside opens it: not a move between segments, and
  // not focus handed back from the closing popup, or Escape would reopen it.
  function onInputFocusin(event: FocusEvent): void {
    if (!openOnFocus()) return;
    const from = event.relatedTarget;
    if (from instanceof Node && (inputEl.value?.contains(from) || popupEl.value?.contains(from))) return;
    show(false);
  }

  const rootProps = computed(() => ({
    ...hooks.value,
    'data-part': 'timepicker',
    ref: (el: unknown) => {
      rootEl.value = (el as HTMLElement) ?? null;
      popover.anchorRef.value = rootEl.value;
    },
    onFocusin: () => field?.setFocused(true),
    onFocusout
  }));

  const inputProps = computed(() => ({
    ...hooks.value,
    'data-part': 'input',
    role: 'group',
    'aria-labelledby': field?.labelledBy.value,
    'aria-describedby': field?.describedBy.value,
    ref: (el: unknown) => {
      inputEl.value = (el as HTMLElement) ?? null;
    },
    onFocusin: onInputFocusin,
    // A press on a focused segment reopens what Escape closed.
    onPointerdown: () => openOnFocus() && show(false)
  }));

  function getSegmentProps(unit: TimeUnit): Record<string, unknown> {
    const current = parts[unit];
    const first = unit === units.value[0];
    const hour12 = unit === 'hour' && twelve();

    return {
      ...hooks.value,
      'data-part': 'segment',
      'data-unit': unit,
      'data-placeholder': current === null ? '' : undefined,
      // The first segment is the field's control: its label focuses it.
      id: first ? (field?.controlId.value ?? `${segmentBaseId}-${unit}`) : `${segmentBaseId}-${unit}`,
      role: 'spinbutton',
      tabindex: disabled() ? undefined : 0,
      'aria-label': LABELS[unit],
      'aria-valuemin': hour12 ? 1 : 0,
      'aria-valuemax': hour12 ? 12 : MAX[unit],
      'aria-valuenow': current === null ? undefined : hour12 ? current % 12 || 12 : current,
      'aria-valuetext': current === null ? 'Empty' : display(unit, current),
      'aria-disabled': disabled() || undefined,
      'aria-readonly': readOnly() || undefined,
      'aria-required': required() || undefined,
      'aria-invalid': invalid() || undefined,
      inputmode: unit === 'period' ? 'text' : 'numeric',
      ref: (el: unknown) => {
        if (el) segments.set(unit, el as HTMLElement);
        else segments.delete(unit);
        if (first) field?.setControl((el as HTMLElement) ?? null);
      },
      onKeydown: (event: KeyboardEvent) => onSegmentKeydown(unit, event),
      onFocusout: () => {
        if (typing?.unit === unit) typing = null;
      }
    };
  }

  const triggerProps = computed(() => {
    const { ref: _ref, onClick: _onClick, onPointerenter: _enter, onPointerleave: _leave, ...base } =
      popover.triggerProps.value;

    return {
      ...base,
      ...hooks.value,
      'data-part': 'trigger',
      'aria-label': 'Choose time',
      disabled: disabled() || undefined,
      onClick() {
        if (popover.open.value) popover.open.value = false;
        else show(true);
      }
    };
  });

  const popupProps = computed(() => {
    const base = popover.popupProps.value;
    const baseRef = base.ref as (el: unknown) => void;

    return {
      ...base,
      'aria-labelledby': base['aria-labelledby'] ?? field?.labelledBy.value,
      ref(el: unknown) {
        baseRef(el);
        popupEl.value = (el as HTMLElement) ?? null;
      },
      onFocusin: () => field?.setFocused(true),
      onFocusout
    };
  });

  provideSurface({
    present: popover.present,
    state: popover.state,
    popupProps,
    positionerProps: popover.positionerProps,
    arrowProps: popover.arrowProps
  });

  function clear(): void {
    for (const unit of ['hour', 'minute', 'second', 'period'] as const) parts[unit] = null;
    typing = null;
    publish();
  }

  const clearProps = computed(() => ({
    ...hooks.value,
    'data-part': 'clear',
    type: 'button',
    'aria-label': 'Clear',
    onClick() {
      if (locked()) return;
      clear();
      focusSegment(units.value[0]);
    }
  }));

  // A pick on an empty value fills the other units with 00, so it is complete at
  // once. An empty period becomes AM, or PM where only that half is allowed.
  function pick(unit: TimeUnit, next: number): void {
    if (locked() || !allowed(unit, next)) return;
    if (twelve() && unit !== 'period' && parts.period === null) {
      parts.period = 0;
      if (!allowed(unit, next)) parts.period = 1;
    }
    for (const other of units.value) if (parts[other] === null) parts[other] = 0;
    if (twelve()) assign('hour', parts.hour);
    set(unit, next, true);
  }

  const hiddenValue = computed(() => value.value ?? '');

  return {
    value,
    open: popover.open,
    state,
    hooks,
    units,
    parts,
    rootProps,
    inputProps,
    triggerProps,
    clearProps,
    getSegmentProps,
    hiddenValue,
    name: () => toValue(options.name) ?? field?.name(),
    form: () => toValue(options.form),
    clear,
    pick,
    values,
    allowed,
    seek,
    display,
    columns
  };
}

export const { provideContext: provideTimepickerContext, useContext: useTimepickerContext } =
  createContext<UseTimepickerReturn>('Timepicker');

export interface UseTimepickerColumnReturn {
  /** Whether the column is drawn: a `second` column needs `seconds`. */
  shown: ComputedRef<boolean>;
  columnProps: ComputedRef<Record<string, unknown>>;
  options: ComputedRef<TimepickerOption[]>;
  state: ComputedRef<TimepickerState>;
}

/** One unit's column in the popup: its options, its keys, and the scroll that keeps the pick in view. */
export function useTimepickerColumn(unit: MaybeRefOrGetter<TimeUnit>): UseTimepickerColumnReturn {
  const picker = useTimepickerContext();
  const baseId = useId();
  const element: Ref<HTMLElement | null> = ref(null);

  const current = () => toValue(unit);
  const shown = computed(() => picker.units.value.includes(current()));
  const selected = computed(() => picker.parts[current()]);
  const optionId = (value: number) => `${baseId}-${value}`;

  // Inside the column only: `scrollIntoView` would scroll the page too.
  function reveal(behavior: ScrollBehavior): void {
    const column = element.value;
    const option = column?.querySelector<HTMLElement>('[data-selected]');
    if (!column || !option) return;

    // Rects are drawn sizes: a popup scaling in as it opens shrinks them, so they're scaled back.
    const columnRect = column.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();
    const scale = columnRect.height ? column.offsetHeight / columnRect.height : 1;
    const offset = (optionRect.top - columnRect.top) * scale - column.clientTop;
    const top = column.scrollTop + offset - (column.clientHeight - option.offsetHeight) / 2;

    if (typeof column.scrollTo === 'function') column.scrollTo({ top, behavior });
    else column.scrollTop = top;
  }

  onMounted(() => nextTick(() => reveal('instant')));
  watch(selected, () => nextTick(() => reveal('smooth')));

  function move(step: number): void {
    const order = picker.units.value;
    const next = order[order.indexOf(current()) + step];
    if (next) picker.columns.get(next)?.focus();
  }

  // Skipping what `min`/`max` rule out; from empty, down gives the first and up the last.
  function pickNext(delta: number, from: number | null = selected.value): void {
    const next = picker.seek(current(), from, delta);
    if (next !== undefined) picker.pick(current(), next);
  }

  function onKeydown(event: KeyboardEvent): void {
    const keys: Record<string, () => void> = {
      ArrowUp: () => pickNext(-1),
      ArrowDown: () => pickNext(1),
      Home: () => pickNext(1, null),
      End: () => pickNext(-1, null),
      ArrowLeft: () => move(-1),
      ArrowRight: () => move(1),
      Enter: () => {
        picker.open.value = false;
      }
    };

    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  const columnProps = computed(() => ({
    ...picker.hooks.value,
    'data-part': 'column',
    'data-unit': current(),
    role: 'listbox',
    tabindex: picker.state.value.disabled ? undefined : 0,
    'aria-label': LABELS[current()],
    'aria-activedescendant': selected.value === null ? undefined : optionId(selected.value),
    ref: (el: unknown) => {
      element.value = (el as HTMLElement) ?? null;
      if (element.value) picker.columns.set(current(), element.value);
      else picker.columns.delete(current());
    },
    onKeydown
  }));

  const options = computed<TimepickerOption[]>(() =>
    picker.values(current()).map((value) => {
      const isSelected = value === selected.value;
      const disabled = !picker.allowed(current(), value);
      const label = picker.display(current(), value);
      return {
        value,
        label,
        selected: isSelected,
        disabled,
        props: {
          'data-part': 'option',
          'data-value': label,
          'data-selected': isSelected ? '' : undefined,
          'data-disabled': disabled ? '' : undefined,
          id: optionId(value),
          role: 'option',
          'aria-selected': isSelected,
          'aria-disabled': disabled || undefined,
          onClick: () => picker.pick(current(), value)
        }
      };
    })
  );

  return { shown, columnProps, options, state: picker.state };
}
