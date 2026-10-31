import {
  computed,
  onScopeDispose,
  ref,
  shallowReactive,
  toValue,
  useId,
  watch,
  watchEffect,
  type ComputedRef,
  type CSSProperties,
  type MaybeRefOrGetter,
  type Ref,
  type WritableComputedRef
} from 'vue';
import { createContext } from '../../shared/context';
import { useControlled } from '../../shared/use-controlled';
import { dataAttrs } from '../../shared/data-attrs';
import { visuallyHidden } from '../../shared/visually-hidden';
import { isKeyboardFocus } from '../../shared/input-modality';
import { useFieldValue, useOptionalFieldContext } from '../../shared/use-field';
import { clamp, dragTo, roomFor, snap, tidy, toPercent, type Scale, type ThumbCollisionBehavior } from './range-math';

export type { ThumbCollisionBehavior };

export type RangeOrientation = 'horizontal' | 'vertical';
export type ThumbAlignment = 'center' | 'edge';

export type RangeChangeReason = 'input-change' | 'track-press' | 'drag' | 'keyboard' | 'none';

export interface RangeChangeDetails {
  reason: RangeChangeReason;
  event: Event;
  activeThumbIndex: number;
}

export interface RangeState {
  /**
   * The thumb currently focused, or `-1`.
   * @attribute none
   */
  activeThumbIndex: number;
  /** Whether it ignores interaction. */
  disabled: boolean;
  /** Whether a pointer is down on it. */
  dragging: boolean;
  /** Whether the value is invalid. */
  invalid: boolean;
  /** Which way the control runs. */
  orientation: RangeOrientation;
  /**
   * The highest value.
   * @attribute none
   */
  max: number;
  /**
   * The lowest value.
   * @attribute none
   */
  min: number;
  /**
   * The least gap between thumbs, in steps.
   * @attribute none
   */
  minStepsBetweenValues: number;
  /**
   * The grid values snap to.
   * @attribute none
   */
  step: number;
  /**
   * Every thumb's value, in order.
   * @attribute none
   */
  values: readonly number[];
}

export interface RangeConfig {
  min: number;
  max: number;
  step: number;
  largeStep: number;
  minStepsBetweenValues: number;
  orientation: RangeOrientation;
  /** Whether thumbs are inset within the control — `thumbAlignment: 'edge'`. */
  inset: boolean;
  disabled: boolean;
  format: Intl.NumberFormatOptions | undefined;
  locale: Intl.LocalesArgument | undefined;
  name: string | undefined;
  form: string | undefined;
  thumbCollisionBehavior: ThumbCollisionBehavior;
}

export interface UseRangeOptions {
  value?: MaybeRefOrGetter<number | number[] | undefined>;
  /** The initial value while uncontrolled. Defaults to `min`. */
  defaultValue?: MaybeRefOrGetter<number | number[] | undefined>;
  /** The smallest value. @default 0 */
  min?: MaybeRefOrGetter<number>;
  /** The largest value. @default 100 */
  max?: MaybeRefOrGetter<number>;
  /** The granularity values snap to, counting from `min`. @default 1 */
  step?: MaybeRefOrGetter<number>;
  /** The step taken by Page Up/Page Down, or by a shifted arrow key. @default 10 */
  largeStep?: MaybeRefOrGetter<number>;
  /** How many steps must separate neighboring thumbs. @default 0 */
  minStepsBetweenValues?: MaybeRefOrGetter<number>;
  disabled?: MaybeRefOrGetter<boolean>;
  /** Whether the value is invalid. Also read from a surrounding field. */
  invalid?: MaybeRefOrGetter<boolean>;
  orientation?: MaybeRefOrGetter<RangeOrientation>;
  /** @default 'center' */
  thumbAlignment?: MaybeRefOrGetter<ThumbAlignment>;
  /**
   * What happens when a dragged thumb meets another.
   *
   * - `push` shoves the others along
   * - `swap` hands the drag over to the thumb in the way
   * - `none` stops the dragged thumb at its neighbor
   *
   * @default 'push'
   */
  thumbCollisionBehavior?: MaybeRefOrGetter<ThumbCollisionBehavior>;
  /** Passed to `Intl.NumberFormat` when the value is displayed or announced. */
  format?: MaybeRefOrGetter<Intl.NumberFormatOptions | undefined>;
  /** Defaults to the runtime locale. */
  locale?: MaybeRefOrGetter<Intl.LocalesArgument | undefined>;
  /** The id of the single-thumb input. One is generated when omitted. */
  id?: MaybeRefOrGetter<string | undefined>;
  /** Name submitted with the form, on each thumb's input. */
  name?: MaybeRefOrGetter<string | undefined>;
  /** Id of the form to associate with, when the inputs are not descendants of it. */
  form?: MaybeRefOrGetter<string | undefined>;
  /** Called on every change, including each move of a drag. */
  onChange?: (value: number | number[], details: RangeChangeDetails) => void;
  /**
   * Called once an interaction settles: on pointer release, or straight after a
   * keyboard step. Never called for a change that did not move the value.
   */
  onCommit?: (value: number | number[], details: RangeChangeDetails) => void;
}


/** What a thumb hands its root so the root can find, measure and focus it. */
interface ThumbSlot {
  /** The `index` prop, when given; otherwise the slot's mount order decides. */
  explicitIndex: () => number | undefined;
  disabled: () => boolean;
  inputId: () => string;
  element: Ref<HTMLElement | null>;
  input: Ref<HTMLInputElement | null>;
}

export interface UseRangeReturn {
  /** The value in the shape it was given — a number, or an array. Writable. */
  value: WritableComputedRef<number | number[]>;
  /** The value normalized: clamped, sorted, and always an array. */
  values: ComputedRef<readonly number[]>;
  /** Each value run through `Intl.NumberFormat`. */
  formattedValues: ComputedRef<string[]>;
  state: ComputedRef<RangeState>;
  /** The options resolved to plain values. */
  config: ComputedRef<RangeConfig>;
  rootProps: ComputedRef<Record<string, unknown>>;
  labelProps: ComputedRef<Record<string, unknown>>;
  valueProps: ComputedRef<Record<string, unknown>>;
  controlProps: ComputedRef<Record<string, unknown>>;
  trackProps: ComputedRef<Record<string, unknown>>;
  indicatorProps: ComputedRef<Record<string, unknown>>;
  /** Names the range with the label element. Returns the undo. */
  registerLabel: () => () => void;
  /** @internal The rest is what `useRangeThumb` works through. */
  thumbs: RangeThumbHost;
}

/** @internal */
export interface RangeThumbHost {
  scale: ComputedRef<Scale>;
  hooks: ComputedRef<Record<string, string>>;
  controlEl: Ref<HTMLElement | null>;
  rtl: Ref<boolean>;
  activeIndex: Ref<number>;
  lastUsedIndex: Ref<number>;
  labelledBy: ComputedRef<string | undefined>;
  /** Measured positions of edge-aligned thumbs, by index, for the indicator. */
  positions: Map<number, number>;
  add: (slot: ThumbSlot) => () => void;
  indexOf: (slot: ThumbSlot) => number;
  onKeydown: (index: number, event: KeyboardEvent) => void;
  onChange: (index: number, event: Event) => void;
  onFocus: (index: number) => void;
  onBlur: (index: number) => void;
}

/** The control's inner edges along its axis, from the end holding `min` to the one holding `max`. */
function span(control: HTMLElement, vertical: boolean, rtl: boolean): { from: number; to: number } {
  const rect = control.getBoundingClientRect();
  const style = getComputedStyle(control);
  const px = (property: string) => parseFloat(style.getPropertyValue(property)) || 0;
  const inner = (side: 'top' | 'right' | 'bottom' | 'left') => px(`padding-${side}`) + px(`border-${side}-width`);

  if (vertical) return { from: rect.bottom - inner('bottom'), to: rect.top + inner('top') };

  const left = rect.left + inner('left');
  const right = rect.right - inner('right');
  return rtl ? { from: right, to: left } : { from: left, to: right };
}

const sameValues = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((value, i) => value === b[i]);

export function useRange(options: UseRangeOptions = {}): UseRangeReturn {
  const field = useOptionalFieldContext();

  const config = computed<RangeConfig>(() => ({
    min: toValue(options.min) ?? 0,
    max: toValue(options.max) ?? 100,
    step: toValue(options.step) ?? 1,
    largeStep: toValue(options.largeStep) ?? 10,
    minStepsBetweenValues: toValue(options.minStepsBetweenValues) ?? 0,
    orientation: toValue(options.orientation) ?? 'horizontal',
    inset: toValue(options.thumbAlignment) === 'edge',
    disabled: (toValue(options.disabled) ?? false) || (field?.state.value.disabled ?? false),
    format: toValue(options.format),
    locale: toValue(options.locale),
    name: toValue(options.name) ?? field?.name(),
    form: toValue(options.form),
    thumbCollisionBehavior: toValue(options.thumbCollisionBehavior) ?? 'push'
  }));

  const scale = computed<Scale>(() => {
    const { min, max, step, minStepsBetweenValues } = config.value;
    return { min, max, step, gap: tidy(minStepsBetweenValues * step, step) };
  });

  const vertical = () => config.value.orientation === 'vertical';
  const invalid = () => (toValue(options.invalid) ?? false) || (field?.state.value.invalid ?? false);

  const value = useControlled<number | number[]>({
    value: options.value,
    defaultValue: toValue(options.defaultValue) ?? config.value.min,
    prop: 'modelValue',
    // An empty `v-model` reads as the starting value: a range always holds one.
    empty: () => toValue(options.defaultValue) ?? config.value.min,
    name: 'RangeRoot'
  });

  const values = computed<readonly number[]>(() => {
    const { min, max } = config.value;
    const list = Array.isArray(value.value) ? value.value : [value.value];
    return list.map((item) => clamp(item, min, max)).sort((a, b) => a - b);
  });

  useFieldValue(field, () => value.value);
  // A range always holds a value.
  field?.setFilled(true);

  const formatter = computed(
    () => new Intl.NumberFormat(config.value.locale as string | undefined, config.value.format)
  );
  const formattedValues = computed(() => values.value.map((item) => formatter.value.format(item)));

  // Thumbs

  const slots = shallowReactive<ThumbSlot[]>([]);
  const indexOf = (slot: ThumbSlot) => slot.explicitIndex() ?? slots.indexOf(slot);
  const slotAt = (index: number) => slots.find((slot) => indexOf(slot) === index);
  const thumbDisabled = (index: number) => config.value.disabled || (slotAt(index)?.disabled() ?? false);

  function add(slot: ThumbSlot): () => void {
    slots.push(slot);
    return () => {
      const at = slots.indexOf(slot);
      if (at >= 0) slots.splice(at, 1);
    };
  }

  const thumbInputIds = computed(() =>
    [...slots].sort((a, b) => indexOf(a) - indexOf(b)).map((slot) => slot.inputId())
  );

  function focusThumb(index: number) {
    slotAt(index)?.input.value?.focus({ preventScroll: true });
  }

  const activeIndex = ref(-1);
  const lastUsedIndex = ref(-1);
  const dragging = ref(false);
  const positions = shallowReactive(new Map<number, number>());

  // Changes

  function emitChange(next: readonly number[], reason: RangeChangeReason, event: Event, index: number): boolean {
    if (sameValues(next, values.value)) return false;

    const shaped = Array.isArray(value.value) ? [...next] : next[0]!;
    value.value = shaped;
    options.onChange?.(shaped, { reason, event, activeThumbIndex: index });
    return true;
  }

  function commit(next: readonly number[], reason: RangeChangeReason, event: Event, index: number) {
    const shaped = Array.isArray(value.value) ? [...next] : next[0]!;
    options.onCommit?.(shaped, { reason, event, activeThumbIndex: index });
  }

  /** Puts thumb `index` at `target`, snapped and kept within its neighbors. */
  function placed(index: number, target: number): number[] {
    const next = [...values.value];
    next[index] = clamp(snap(target, scale.value), ...roomFor(values.value, index, scale.value));
    return next;
  }

  // Keyboard and the input itself

  const controlEl = ref<HTMLElement | null>(null);
  const rtl = ref(false);

  function readDirection() {
    if (controlEl.value) rtl.value = getComputedStyle(controlEl.value).direction === 'rtl';
  }

  function onKeydown(index: number, event: KeyboardEvent) {
    const current = values.value[index];
    if (current === undefined || thumbDisabled(index)) return;

    readDirection();
    const { step, largeStep } = config.value;
    const by = event.shiftKey ? largeStep : step;
    // Horizontal arrows move the thumb the way they point, which in RTL is down the scale.
    const right = !vertical() && rtl.value ? -by : by;
    const [low, high] = roomFor(values.value, index, scale.value);

    const targets: Record<string, number> = {
      ArrowUp: current + by,
      ArrowDown: current - by,
      ArrowRight: current + right,
      ArrowLeft: current - right,
      PageUp: current + largeStep,
      PageDown: current - largeStep,
      Home: low,
      End: high
    };
    const target = targets[event.key];
    if (target === undefined) return;

    // The input's own stepping cannot see the other thumbs.
    event.preventDefault();

    const next = placed(index, target);
    if (emitChange(next, 'keyboard', event, index)) commit(next, 'keyboard', event, index);
  }

  function onChange(index: number, event: Event) {
    const typed = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(typed) || thumbDisabled(index)) return;

    const next = placed(index, typed);
    if (emitChange(next, 'input-change', event, index)) commit(next, 'input-change', event, index);
  }

  function onFocus(index: number) {
    activeIndex.value = index;
    lastUsedIndex.value = index;
    field?.setFocused(true);
  }

  function onBlur(index: number) {
    // A swap moves the active index before focus follows, so this blur is stale.
    if (activeIndex.value === index) activeIndex.value = -1;
    field?.setFocused(false);
    field?.setTouched(true);
  }

  // Pointer

  interface Drag {
    pointerId: number;
    index: number;
    /** Pointer to thumb center at the press, so grabbing a thumb does not jump it. */
    offset: number;
    origin: readonly number[];
    latest: readonly number[];
    moved: boolean;
  }

  let drag: Drag | null = null;

  const along = (event: { clientX: number; clientY: number }) => (vertical() ? event.clientY : event.clientX);

  function centerOf(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    return vertical() ? (rect.top + rect.bottom) / 2 : (rect.left + rect.right) / 2;
  }

  /** The value under a point on the control's axis. */
  function valueAt(point: number): number | undefined {
    const control = controlEl.value;
    if (!control) return undefined;

    let { from, to } = span(control, vertical(), rtl.value);
    if (config.value.inset) {
      // An edge-aligned thumb's center stops half a thumb short of either end.
      const thumb = slots.find((slot) => slot.element.value)?.element.value;
      const rect = thumb?.getBoundingClientRect();
      const half = ((vertical() ? rect?.height : rect?.width) ?? 0) / 2;
      const direction = Math.sign(to - from);
      from += half * direction;
      to -= half * direction;
    }
    if (to === from) return undefined;

    const { min, max } = scale.value;
    const ratio = clamp((point - from) / (to - from), 0, 1);
    return clamp(snap(min + ratio * (max - min), scale.value), min, max);
  }

  /** The enabled thumb nearest `target`; among thumbs sharing a spot, the one that can move towards it. */
  function nearestThumb(target: number): number {
    let best = -1;
    values.value.forEach((item, i) => {
      if (thumbDisabled(i)) return;
      const distance = Math.abs(item - target);
      const bestDistance = best < 0 ? Infinity : Math.abs(values.value[best]! - target);
      if (distance < bestDistance || (distance === bestDistance && target > item)) best = i;
    });
    return best;
  }

  function moveTo(target: number, reason: RangeChangeReason, event: Event) {
    if (!drag) return;

    const result = dragTo(drag.latest, drag.index, target, scale.value, config.value.thumbCollisionBehavior, drag.origin);
    drag.latest = result.values;
    if (result.index !== drag.index) {
      drag.index = result.index;
      activeIndex.value = result.index;
      lastUsedIndex.value = result.index;
      focusThumb(result.index);
    }
    emitChange(result.values, reason, event, drag.index);
  }

  function onPointerdown(event: PointerEvent) {
    if (event.button !== 0 || config.value.disabled) return;

    readDirection();
    const point = along(event);
    const pressed = valueAt(point);
    if (pressed === undefined) return;

    const grabbed = slots.find(
      (slot) => !slot.disabled() && slot.element.value?.contains(event.target as Node)
    );
    const index = grabbed ? indexOf(grabbed) : nearestThumb(pressed);
    if (index < 0) return;

    // Keeps the press from selecting text or starting a native drag.
    event.preventDefault();

    drag = {
      pointerId: event.pointerId,
      index,
      offset: grabbed ? point - centerOf(grabbed.element.value!) : 0,
      origin: values.value,
      latest: values.value,
      moved: false
    };
    dragging.value = true;
    activeIndex.value = index;
    lastUsedIndex.value = index;
    focusThumb(index);

    if (!grabbed) moveTo(pressed, 'track-press', event);

    document.addEventListener('pointermove', onPointermove);
    document.addEventListener('pointerup', onPointerup);
    document.addEventListener('pointercancel', onPointerup);
  }

  function onPointermove(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    // No button held: the release happened somewhere this never heard about.
    if (event.buttons === 0) return finish(event);

    const target = valueAt(along(event) - drag.offset);
    if (target === undefined) return;

    drag.moved = true;
    moveTo(target, 'drag', event);
  }

  function onPointerup(event: PointerEvent) {
    if (drag && event.pointerId === drag.pointerId) finish(event);
  }

  function stopListening() {
    document.removeEventListener('pointermove', onPointermove);
    document.removeEventListener('pointerup', onPointerup);
    document.removeEventListener('pointercancel', onPointerup);
  }

  function finish(event: Event) {
    if (!drag) return;

    const { origin, latest, moved, index } = drag;
    drag = null;
    dragging.value = false;
    stopListening();

    if (!sameValues(latest, origin)) commit(latest, moved ? 'drag' : 'track-press', event, index);
  }

  onScopeDispose(stopListening);

  // Parts

  const state = computed<RangeState>(() => ({
    activeThumbIndex: activeIndex.value,
    disabled: config.value.disabled,
    dragging: dragging.value,
    invalid: invalid(),
    orientation: config.value.orientation,
    max: config.value.max,
    min: config.value.min,
    minStepsBetweenValues: config.value.minStepsBetweenValues,
    step: config.value.step,
    values: values.value
  }));

  const hooks = computed(() =>
    dataAttrs(state.value, {
      // Numbers belong in CSS variables and ARIA, not in selectors.
      activeThumbIndex: () => null,
      max: () => null,
      min: () => null,
      minStepsBetweenValues: () => null,
      step: () => null,
      values: () => null
    })
  );

  const labelId = useId();
  const labels = ref(0);
  const labelledBy = computed(() => (labels.value > 0 ? labelId : undefined));

  function registerLabel() {
    labels.value += 1;
    return () => {
      labels.value -= 1;
    };
  }

  const rootProps = computed(() => ({
    ...hooks.value,
    'data-part': 'root',
    role: 'group',
    id: toValue(options.id),
    'aria-labelledby': labelledBy.value
  }));

  const labelProps = computed(() => ({ ...hooks.value, 'data-part': 'label', id: labelId }));

  const valueProps = computed(() => ({
    ...hooks.value,
    'data-part': 'value',
    for: thumbInputIds.value.join(' ') || undefined,
    'aria-live': 'off'
  }));

  const controlProps = computed(() => ({
    ...hooks.value,
    'data-part': 'control',
    // A touch drag would scroll the page instead.
    style: { position: 'relative', touchAction: 'none' } as CSSProperties,
    ref: (element: unknown) => {
      controlEl.value = (element as HTMLElement) ?? null;
      readDirection();
    },
    onPointerdown
  }));

  const trackProps = computed(() => ({
    ...hooks.value,
    'data-part': 'track',
    style: { position: 'relative' } as CSSProperties
  }));

  const indicatorProps = computed(() => {
    const list = values.value;
    const several = list.length > 1;
    const percent = (item: number) => {
      const p = toPercent(item, scale.value);
      return Number.isFinite(p) ? p : 0;
    };

    let start: string;
    let size: string;
    let measured: CSSProperties = {};

    if (config.value.inset) {
      const first = positions.get(0);
      const last = positions.get(list.length - 1);
      measured = {
        '--start-position': `${first ?? 0}%`,
        ...(several ? { '--relative-size': `${(last ?? 0) - (first ?? 0)}%` } : {}),
        visibility: first === undefined || (several && last === undefined) ? 'hidden' : undefined
      } as CSSProperties;
      start = several ? 'var(--start-position)' : '0';
      size = several ? 'var(--relative-size)' : 'var(--start-position)';
    } else {
      const first = percent(list[0]!);
      start = several ? `${first}%` : '0';
      size = `${percent(list[list.length - 1]!) - (several ? first : 0)}%`;
    }

    const style = {
      position: 'absolute',
      ...(vertical() ? { left: 0, right: 0, bottom: start, height: size } : { top: 0, bottom: 0, insetInlineStart: start, width: size }),
      ...measured
    } as CSSProperties;

    return { ...hooks.value, 'data-part': 'indicator', style };
  });

  return {
    value,
    values,
    formattedValues,
    state,
    config,
    rootProps,
    labelProps,
    valueProps,
    controlProps,
    trackProps,
    indicatorProps,
    registerLabel,
    thumbs: {
      scale,
      hooks,
      controlEl,
      rtl,
      activeIndex,
      lastUsedIndex,
      labelledBy,
      positions,
      add,
      indexOf,
      onKeydown,
      onChange,
      onFocus,
      onBlur
    }
  };
}

export const { provideContext: provideRangeContext, useContext: useRangeContext } =
  createContext<UseRangeReturn>('Range');

export interface UseRangeThumbOptions {
  index?: MaybeRefOrGetter<number | undefined>;
  /** Whether this thumb alone ignores user interaction. */
  disabled?: MaybeRefOrGetter<boolean>;
  /** Names the thumb, for a range whose ends need distinguishing. */
  ariaLabel?: MaybeRefOrGetter<string | undefined>;
  /** Overrides what is announced in place of the raw number. */
  valueText?: MaybeRefOrGetter<string | undefined>;
  /** Builds what is announced, from the formatted value. Wins over `valueText`. */
  getValueText?: (formattedValue: string, value: number, index: number) => string;
  tabIndex?: MaybeRefOrGetter<number | undefined>;
}

export interface UseRangeThumbReturn {
  /** This thumb's position in the value list. */
  index: ComputedRef<number>;
  /** This thumb's value. */
  value: ComputedRef<number>;
  state: ComputedRef<RangeState>;
  /** Bind to the element that looks like a thumb. Positions itself. */
  thumbProps: ComputedRef<Record<string, unknown>>;
  /** Bind to the `<input type="range">` inside it. Required. */
  inputProps: ComputedRef<Record<string, unknown>>;
}

export function useRangeThumb(options: UseRangeThumbOptions = {}): UseRangeThumbReturn {
  const range = useRangeContext();
  const host = range.thumbs;
  const field = useOptionalFieldContext();

  const generatedId = useId();
  const element = ref<HTMLElement | null>(null);
  const input = ref<HTMLInputElement | null>(null);
  const ownDisabled = () => toValue(options.disabled) ?? false;

  // A lone thumb is the field's control, so a field label points at its input.
  const inputId = computed(() => (range.values.value.length === 1 ? field?.controlId.value : undefined) ?? generatedId);

  const slot: ThumbSlot = {
    explicitIndex: () => toValue(options.index),
    disabled: ownDisabled,
    inputId: () => inputId.value,
    element,
    input
  };
  onScopeDispose(host.add(slot));

  const index = computed(() => host.indexOf(slot));
  const value = computed(() => range.values.value[index.value] ?? range.config.value.min);
  const vertical = () => range.config.value.orientation === 'vertical';

  // Edge alignment: the thumb's own size shortens its travel, so it is measured.
  const position = ref<number>();

  function measure() {
    const control = host.controlEl.value;
    const thumb = element.value;
    if (!range.config.value.inset || !control || !thumb) {
      position.value = undefined;
      return;
    }

    const { from, to } = span(control, vertical(), false);
    const length = Math.abs(to - from);
    const rect = thumb.getBoundingClientRect();
    const size = vertical() ? rect.height : rect.width;
    const ratio = toPercent(value.value, host.scale.value) / 100;
    const percent = ((size / 2 + (length - size) * ratio) / length) * 100;

    position.value = Number.isFinite(percent) ? percent : undefined;
  }

  watch([value, range.config, element, host.controlEl], measure, { flush: 'post', immediate: true });

  watch([element, host.controlEl], ([thumb, control], _, onCleanup) => {
    if (!thumb || !control || typeof ResizeObserver !== 'function') return;

    const observer = new ResizeObserver(measure);
    observer.observe(thumb);
    observer.observe(control);
    onCleanup(() => observer.disconnect());
  });

  watchEffect((onCleanup) => {
    const at = index.value;
    const measured = position.value;
    if (measured === undefined) return;

    host.positions.set(at, measured);
    onCleanup(() => host.positions.delete(at));
  });

  const thumbProps = computed(() => {
    const at = index.value;
    const active = host.activeIndex.value === at;
    const base = {
      ...host.hooks.value,
      'data-part': 'thumb',
      'data-index': at,
      'data-focused': active ? '' : undefined,
      'data-focus-visible': active && isKeyboardFocus() ? '' : undefined,
      ref: (el: unknown) => {
        element.value = (el as HTMLElement) ?? null;
      }
    };

    const percent = toPercent(value.value, host.scale.value);
    // An empty interval has no position to give; hide rather than place it at NaN.
    if (!Number.isFinite(percent)) return { ...base, style: visuallyHidden };

    const inset = range.config.value.inset;
    const offset = inset ? 'var(--position)' : `${percent}%`;
    const style = {
      position: 'absolute',
      ...(vertical()
        ? { left: '50%', bottom: offset, translate: '-50% 50%' }
        : // `inset-inline-start` follows the direction; `translate` does not.
          { top: '50%', insetInlineStart: offset, translate: `${host.rtl.value ? 50 : -50}% -50%` }),
      // The thumb in use rises above the rest, then the one used last, so a
      // thumb pushed on top of another can still be picked up.
      zIndex: active ? 2 : host.lastUsedIndex.value === at ? 1 : undefined,
      ...(inset
        ? { '--position': `${position.value ?? 0}%`, visibility: position.value === undefined ? 'hidden' : undefined }
        : {})
    } as CSSProperties;

    return { ...base, style };
  });

  const inputProps = computed(() => {
    const at = index.value;
    const { min, max, step, name, form, orientation } = range.config.value;
    const formatted = range.formattedValues.value[at] ?? String(value.value);
    const pair = range.values.value.length === 2;
    const label = toValue(options.ariaLabel);

    return {
      type: 'range',
      'data-part': 'thumb-input',
      id: inputId.value,
      // Before `value`, so the browser never clamps it against the default 0–100.
      min,
      max,
      step,
      value: value.value,
      name,
      form,
      disabled: range.config.value.disabled || ownDisabled(),
      tabindex: toValue(options.tabIndex),
      'aria-label': label,
      'aria-labelledby': label ? undefined : (host.labelledBy.value ?? field?.labelledBy.value),
      'aria-describedby': field?.describedBy.value,
      'aria-valuenow': value.value,
      'aria-valuetext':
        options.getValueText?.(formatted, value.value, at) ??
        toValue(options.valueText) ??
        (pair ? `${formatted} ${at === 0 ? 'start' : 'end'} range` : formatted),
      'aria-orientation': orientation,
      'aria-invalid': range.state.value.invalid || undefined,
      style: visuallyHidden,
      ref: (el: unknown) => {
        input.value = (el as HTMLInputElement) ?? null;
      },
      onKeydown: (event: KeyboardEvent) => host.onKeydown(at, event),
      onChange: (event: Event) => host.onChange(at, event),
      onFocus: () => host.onFocus(at),
      onBlur: () => host.onBlur(at)
    };
  });

  return { index, value, state: range.state, thumbProps, inputProps };
}
