<script lang="ts">
import { computed, nextTick, onScopeDispose, ref, useAttrs, useId, type ComputedRef, type CSSProperties } from 'vue';
import { createContext } from '../../shared/context';
import { dataAttrs } from '../../shared/data-attrs';
import { mergeProps } from '../../shared/merge-props';
import { useControlled } from '../../shared/use-controlled';

/** `grid` is one ordered list laid out in rows that wrap: it drags and moves on both axes. */
export type DragOrientation = 'vertical' | 'horizontal' | 'grid';

export interface DragChange<T = unknown> {
  value: T;
  from: number;
  to: number;
}

export interface DragState {
  /** Whether an item is being dragged, or has been picked up with the keyboard. */
  sorting: boolean;
  /** Which way the list runs. */
  orientation: DragOrientation;
  /** Whether the whole list is disabled. */
  disabled: boolean;
}

export interface DragItemState {
  /**
   * Where the item is in the list.
   * @attribute none
   */
  index: number;
  /** Whether this item is being dragged, or has been picked up with the keyboard. */
  dragging: boolean;
  /** Whether it is disabled, or the whole list is. */
  disabled: boolean;
}

export interface DragContext {
  state: ComputedRef<DragState>;
  getItemProps: (value: unknown, disabled?: boolean) => Record<string, unknown>;
  getItemState: (value: unknown, disabled?: boolean) => DragItemState;
  getHandleProps: (value: unknown, disabled?: boolean) => Record<string, unknown>;
}

export const { provideContext: provideDragContext, useContext: useDragContext } = createContext<DragContext>('Drag');

export const { provideContext: provideDragItemContext, useContext: useDragItemContext } = createContext<{
  value: () => unknown;
  disabled: () => boolean;
}>('DragItem');

const INTERACTIVE = 'button, a, input, select, textarea, [contenteditable="true"]';
</script>

<script setup lang="ts" generic="T">
import { Part } from '../../shared/part';
defineOptions({ name: 'DragRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The items in order, bound with `v-model`. */
    modelValue?: T[];
    /** The items at first, when no `v-model` owns the order. */
    defaultValue?: T[];
    /** Which way the list runs: arrows and dragging follow it. `grid` for rows that wrap. */
    orientation?: DragOrientation;
    /** Only a `DragHandle` starts a drag, so a long list still scrolls on touch. */
    handle?: boolean;
    /** Whether the list is disabled. */
    disabled?: boolean;
    /** Pixels the pointer travels before a press becomes a drag. */
    threshold?: number;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { modelValue: undefined, orientation: 'vertical', disabled: false, threshold: 4, as: 'div' }
);

const emit = defineEmits<{
  /** The new order, for `v-model`. */
  'update:modelValue': [value: T[]];
  /** An item moved, as `{ value, from, to }` with the indexes. */
  change: [change: DragChange<T>];
}>();

defineSlots<{
  default(
    props: DragState & {
      /**
       * The items in their current order, to render the `DragItem`s from.
       * @attribute none
       */
      items: T[];
    }
  ): unknown;
}>();

const id = useId();
const root = ref<HTMLElement | null>(null);

const order = useControlled<T[]>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? [],
  onChange: (next) => emit('update:modelValue', next),
  name: 'DragRoot',
  label: 'modelValue'
});

const vertical = () => props.orientation === 'vertical';
const grid = () => props.orientation === 'grid';
const indexOf = (value: unknown) => order.value.indexOf(value as T);

const from = ref<number | null>(null);
const target = ref(0);
// How far the pointer has moved; only the list's own axis, unless it's a grid.
const delta = ref({ x: 0, y: 0 });
const dragging = ref(false);

let rects: DOMRect[] = [];
let shift = 0;
let release: (() => void) | null = null;

const start = (rect: DOMRect) => (vertical() ? rect.top : rect.left);
const end = (rect: DOMRect) => (vertical() ? rect.bottom : rect.right);
const middle = (rect: DOMRect) => (start(rect) + end(rect)) / 2;

function measure(): DOMRect[] {
  const items = root.value?.querySelectorAll<HTMLElement>(`[data-drag-root="${id}"]`) ?? [];
  return Array.from(items, (item) => item.getBoundingClientRect());
}

function begin(): void {
  rects = measure();

  const f = from.value!;
  const own = rects[f]!;
  const neighbor = rects[f + 1] ?? rects[f - 1];
  const gap = !neighbor ? 0 : neighbor === rects[f + 1] ? start(neighbor) - end(own) : start(own) - end(neighbor);
  shift = end(own) - start(own) + gap;

  dragging.value = true;
}

const centerOf = (rect: DOMRect) => ({ x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 });

function landing(offset: { x: number; y: number }): number {
  const f = from.value!;

  // A grid lands in the slot nearest the dragged item's center.
  if (grid()) {
    const own = centerOf(rects[f]!);
    const x = own.x + offset.x;
    const y = own.y + offset.y;
    let best = f;
    let nearest = Infinity;
    rects.forEach((rect, index) => {
      const slot = centerOf(rect);
      const distance = (slot.x - x) ** 2 + (slot.y - y) ** 2;
      if (distance < nearest) {
        nearest = distance;
        best = index;
      }
    });
    return best;
  }

  const center = middle(rects[f]!) + (vertical() ? offset.y : offset.x);
  return rects.reduce((count, rect, index) => (index !== f && middle(rect) < center ? count + 1 : count), 0);
}

function transformFor(index: number): string | undefined {
  if (!dragging.value || from.value === null) return undefined;

  const f = from.value;
  const t = target.value;

  if (index === f) {
    const { x, y } = delta.value;
    return grid() ? `translate3d(${x}px, ${y}px, 0)` : vertical() ? `translate3d(0, ${y}px, 0)` : `translate3d(${x}px, 0, 0)`;
  }

  // Each item between takes its neighbor's slot: a step back, or one on.
  const step = f < t && index > f && index <= t ? -1 : t < f && index >= t && index < f ? 1 : 0;
  if (!step) return undefined;

  if (grid()) {
    const own = rects[index]!;
    const slot = rects[index + step]!;
    return `translate3d(${slot.left - own.left}px, ${slot.top - own.top}px, 0)`;
  }

  const offset = step * shift;
  return vertical() ? `translate3d(0, ${offset}px, 0)` : `translate3d(${offset}px, 0, 0)`;
}

function press(event: PointerEvent, index: number): void {
  if (event.button !== 0) return;

  event.preventDefault();

  const element = event.currentTarget as HTMLElement;
  const { pointerId, clientX, clientY } = event;

  element.setPointerCapture?.(pointerId);
  from.value = index;

  function onMove(move: PointerEvent) {
    if (move.pointerId !== pointerId) return;

    const offset = { x: move.clientX - clientX, y: move.clientY - clientY };
    const travel = grid() ? Math.hypot(offset.x, offset.y) : Math.abs(vertical() ? offset.y : offset.x);

    if (!dragging.value) {
      if (travel < props.threshold) return;

      begin();
    }

    delta.value = offset;
    target.value = landing(offset);
  }

  function onUp(up: PointerEvent) {
    if (up.pointerId === pointerId) finish(true);
  }

  function onCancel(cancel: PointerEvent) {
    if (cancel.pointerId === pointerId) finish(false);
  }

  function onKey(key: KeyboardEvent) {
    if (key.key === 'Escape' && dragging.value) {
      key.preventDefault();
      finish(false);
    }
  }

  element.addEventListener('pointermove', onMove);
  element.addEventListener('pointerup', onUp);
  element.addEventListener('pointercancel', onCancel);
  window.addEventListener('keydown', onKey);

  release = () => {
    element.releasePointerCapture?.(pointerId);
    element.removeEventListener('pointermove', onMove);
    element.removeEventListener('pointerup', onUp);
    element.removeEventListener('pointercancel', onCancel);
    window.removeEventListener('keydown', onKey);
    release = null;
  };
}

function finish(commit: boolean): void {
  release?.();

  const moved = dragging.value;

  if (moved && commit && from.value !== null && target.value !== from.value) {
    reorder(from.value, target.value);
  }

  if (moved) swallowClick();

  from.value = null;
  dragging.value = false;
  delta.value = { x: 0, y: 0 };
}

function swallowClick(): void {
  const stop = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();
  };
  window.addEventListener('click', stop, { capture: true, once: true });
  setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0);
}

onScopeDispose(() => release?.());

function reorder(f: number, t: number): void {
  const next = [...order.value];
  const [value] = next.splice(f, 1);
  next.splice(t, 0, value as T);
  order.value = next;
  emit('change', { value: value as T, from: f, to: t });
}

// --- keyboard --------------------------------------------------------------

const grabbed = ref<number | null>(null);
let original: T[] = [];
let moving = false;

function ownsKey(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  return target === event.currentTarget || !!target.closest('[data-part="drag-handle"]');
}

function onKeydown(event: KeyboardEvent, index: number): void {
  if (!ownsKey(event)) return;

  const lift = event.key === ' ' || event.key === 'Enter';

  if (grabbed.value === null) {
    if (lift) {
      event.preventDefault();
      grabbed.value = index;
      original = [...order.value];
    }
    return;
  }

  if (grabbed.value !== index) return;

  const to = keyTarget(event.key, index);

  if (to !== undefined) {
    event.preventDefault();
    if (to === index) return;

    const focused = document.activeElement as HTMLElement | null;
    moving = true;
    reorder(index, to);
    grabbed.value = to;
    void nextTick(() => {
      if (focused && document.activeElement !== focused) focused.focus();
      moving = false;
    });
  } else if (lift) {
    event.preventDefault();
    grabbed.value = null;
  } else if (event.key === 'Escape') {
    event.preventDefault();
    order.value = original;
    grabbed.value = null;
  }
}

/** Where an arrow moves the picked-up item, or `undefined` for a key that isn't one. */
function keyTarget(key: string, index: number): number | undefined {
  const last = order.value.length - 1;
  const clamp = (to: number) => Math.min(Math.max(to, 0), last);

  if (!grid()) {
    const back = vertical() ? 'ArrowUp' : 'ArrowLeft';
    const forward = vertical() ? 'ArrowDown' : 'ArrowRight';
    return key === back ? clamp(index - 1) : key === forward ? clamp(index + 1) : undefined;
  }

  if (key === 'ArrowLeft') return clamp(index - 1);
  if (key === 'ArrowRight') return clamp(index + 1);
  if (key !== 'ArrowUp' && key !== 'ArrowDown') return undefined;

  // A row is as long as the layout makes it, counted from the first row.
  const slots = measure();
  const top = slots[0]?.top ?? 0;
  const columns = Math.max(1, slots.filter((rect) => Math.abs(rect.top - top) < 1).length);

  if (key === 'ArrowUp') return index - columns >= 0 ? index - columns : index;
  // Down from a column the short last row doesn't reach goes to its last item.
  const row = Math.floor(index / columns);
  const lastRow = Math.floor(last / columns);
  return row < lastRow ? Math.min(index + columns, last) : index;
}

function onFocusout(index: number): void {
  if (grabbed.value === index && !moving) {
    grabbed.value = null;
  }
}

const state = computed<DragState>(() => ({
  sorting: dragging.value || grabbed.value !== null,
  orientation: props.orientation,
  disabled: props.disabled
}));

function getItemState(value: unknown, disabled = false): DragItemState {
  const index = indexOf(value);
  return {
    index,
    dragging: (dragging.value && from.value === index) || grabbed.value === index,
    disabled: props.disabled || disabled
  };
}

function getItemProps(value: unknown, disabled = false): Record<string, unknown> {
  const item = getItemState(value, disabled);
  const byItem = !props.handle && !item.disabled;

  return {
    'data-part': 'drag-item',
    'data-drag-root': id,
    ...dataAttrs(item, { index: () => null }),
    role: 'listitem',
    tabindex: byItem ? 0 : undefined,
    style: {
      transform: transformFor(item.index),
      ...(byItem ? { touchAction: 'none' } : null)
    } satisfies CSSProperties,
    onPointerdown: byItem
      ? (event: PointerEvent) => {
          const target = event.target as HTMLElement;
          if (target !== event.currentTarget && target.closest(INTERACTIVE)) {
            return;
          }
          press(event, item.index);
        }
      : undefined,
    onKeydown: item.disabled ? undefined : (event: KeyboardEvent) => onKeydown(event, item.index),
    onFocusout: () => onFocusout(item.index)
  };
}

function getHandleProps(value: unknown, disabled = false): Record<string, unknown> {
  const item = getItemState(value, disabled);

  return {
    'data-part': 'drag-handle',
    ...dataAttrs(item, { index: () => null }),
    type: 'button',
    'aria-label': 'Reorder',
    tabindex: props.handle && !item.disabled ? 0 : -1,
    style: { touchAction: 'none' } satisfies CSSProperties,
    onPointerdown: item.disabled ? undefined : (event: PointerEvent) => press(event, item.index)
  };
}

provideDragContext({ state, getItemProps, getItemState, getHandleProps });

const attrs = useAttrs();
const merged = computed(() =>
  mergeProps(
    {
      'data-part': 'drag',
      ...dataAttrs(state.value),
      role: 'list',
      ref: (element: unknown) => {
        root.value = (element as HTMLElement) ?? null;
      }
    },
    attrs
  )
);

defineExpose({ state });
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="{ ...state, items: order }" />
  </Part>
</template>
