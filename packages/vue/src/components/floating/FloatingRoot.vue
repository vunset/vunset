<script lang="ts">
import { computed, onMounted, onScopeDispose, ref, watch, type ComputedRef, type CSSProperties, type Ref } from 'vue';
import { createContext } from '../../shared/context';
import { useLabeling, type RegisterId } from '../../shared/labeling';
import { dataAttrs } from '../../shared/data-attrs';
import { popupStateAttrs } from '../../shared/popup-state-attrs';
import { provideSurface } from '../../shared/surface';
import { useControlled } from '../../shared/use-controlled';
import { useTransitionStatus, type TransitionStatus } from '../../shared/use-transition-status';
import { useExitAnimation } from '../../shared/use-exit-animation';

export type FloatingResize = 'none' | 'x' | 'y' | 'both';

export type FloatingHandle = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

export interface FloatingAnchor {
  side: 'left' | 'right' | 'top' | 'bottom';
  offset: number;
}

export interface FloatingState {
  /**
   * Whether the panel is open.
   * @attribute `data-open` while open, `data-closed` otherwise
   */
  open: boolean;
  /**
   * Where the panel is in its enter or exit animation.
   * @attribute `data-enter-from` as it enters, `data-leave-to` as it leaves
   */
  transitionStatus: TransitionStatus;
  /** Which edges may be pulled. */
  resize: FloatingResize;
  /** Whether the header is being dragged. */
  dragging: boolean;
  /** Whether an edge is being pulled. */
  resizing: boolean;
  /**
   * The edge or corner being pulled, while resizing.
   * @attribute `data-handle="…"` while resizing
   */
  handle: FloatingHandle | null;
  /** Whether it has been dragged from where it opened; double-clicking the header puts it back. */
  moved: boolean;
  /**
   * Its left edge, in pixels from the viewport's.
   * @attribute none
   */
  left: number;
  /**
   * Its top edge, in pixels from the viewport's.
   * @attribute none
   */
  top: number;
  /**
   * Its width once an edge has been pulled; `null` while its content decides.
   * @attribute none
   */
  width: number | null;
  /**
   * Its height once an edge has been pulled; `null` while its content decides.
   * @attribute none
   */
  height: number | null;
}

export interface FloatingContext {
  state: ComputedRef<FloatingState>;
  open: Ref<boolean>;
  handles: ComputedRef<FloatingHandle[]>;
  headerProps: ComputedRef<Record<string, unknown>>;
  titleProps: ComputedRef<Record<string, unknown>>;
  closeProps: ComputedRef<Record<string, unknown>>;
  getResizerProps: (handle: FloatingHandle) => Record<string, unknown>;
  registerTitle: RegisterId;
  reset: () => void;
}

export const { provideContext: provideFloatingContext, useContext: useFloatingContext } =
  createContext<FloatingContext>('Floating');

const HANDLES: Record<FloatingResize, FloatingHandle[]> = {
  none: [],
  x: ['w', 'e'],
  y: ['n', 's'],
  both: ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']
};

const INTERACTIVE = 'button, a, input, select, textarea, [contenteditable="true"]';

const DEFAULT_OFFSET = 100;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max?: number): number {
  return Math.min(Math.max(value, min), max ?? Infinity);
}

function smallest(limits: (number | undefined)[]): number | undefined {
  const known = limits.filter((limit): limit is number => limit !== undefined);
  return known.length > 0 ? Math.min(...known) : undefined;
}
</script>

<script setup lang="ts">
defineOptions({ name: 'FloatingRoot' });

const props = withDefaults(
  defineProps<{
    /** Whether the panel is open, bound with `v-model:open`. */
    open?: boolean;
    /** Opens at first, when no `v-model:open` owns it. @default false */
    defaultOpen?: boolean;
    /** Which edges may be pulled. @default 'none' */
    resize?: FloatingResize;
    /** Keep the panel inside the viewport. @default true */
    bounding?: boolean;
    /** The narrowest a resize may make it, in pixels. @default 0 */
    minWidth?: number;
    /** The shortest a resize may make it, in pixels. @default 30 */
    minHeight?: number;
    /** The widest it may be, in pixels. */
    maxWidth?: number;
    /** The tallest it may be, in pixels. */
    maxHeight?: number;
    /** Its width at first, in pixels. Its content decides when not given. */
    width?: number;
    /** Its height at first, in pixels. Its content decides when not given. */
    height?: number;
    /** Opens this many pixels from the viewport's left edge, and keeps that distance as the window resizes. */
    left?: number;
    /** Opens this many pixels from the viewport's right edge, and keeps it. */
    right?: number;
    /** Opens this many pixels from the viewport's top edge, and keeps it. */
    top?: number;
    /** Opens this many pixels from the viewport's bottom edge, and keeps it. */
    bottom?: number;
  }>(),
  { open: undefined, bounding: undefined }
);

const emit = defineEmits<{
  /** It opened or closed, for `v-model:open`. */
  'update:open': [open: boolean];
  /** Every move while dragging, with its new left and top. */
  drag: [left: number, top: number];
  /** Every change while resizing, with its new width and height. */
  resize: [width: number | null, height: number | null];
}>();

defineSlots<{
  /**
   * The panel's state, and the resize handles to render.
   * @slotOnly The root renders no element of its own: the popup carries these as attributes.
   */
  default(
    props: FloatingState & {
      /** The edges and corners `resize` allows, one `FloatingResizer` each. */
      handles: FloatingHandle[];
    }
  ): unknown;
}>();

const resize = () => props.resize ?? 'none';
const bounding = () => props.bounding ?? true;
const minWidth = () => props.minWidth ?? 0;
const minHeight = () => props.minHeight ?? 30;

const open = useControlled<boolean>({
  value: () => props.open,
  defaultValue: () => props.defaultOpen ?? false,
  onChange: (next) => emit('update:open', next),
  prop: 'open',
  empty: false,
  name: 'FloatingRoot',
  label: 'open'
});

const element = ref<HTMLElement | null>(null);
const { titleId, registerTitle } = useLabeling();

const left = ref(DEFAULT_OFFSET);
const top = ref(DEFAULT_OFFSET);
const width = ref<number | null>(null);
const height = ref<number | null>(null);

const anchorX = ref<FloatingAnchor | null>(null);
const anchorY = ref<FloatingAnchor | null>(null);

const dragging = ref(false);
const resizing = ref(false);
const handle = ref<FloatingHandle | null>(null);
const moved = ref(false);

const handles = computed(() => HANDLES[resize()]);

const { mounted, transitionStatus, setMounted } = useTransitionStatus(() => open.value);
useExitAnimation({ open: () => open.value, mounted, setMounted, element });

function viewport() {
  return typeof window === 'undefined'
    ? { width: 0, height: 0 }
    : { width: window.innerWidth, height: window.innerHeight };
}

function currentRect(): Rect {
  const el = element.value;

  if (!el) {
    return { left: left.value, top: top.value, width: width.value ?? 0, height: height.value ?? 0 };
  }

  const rect = el.getBoundingClientRect();
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
}

function readProps(): void {
  width.value = props.width ?? null;
  height.value = props.height ?? null;

  anchorX.value =
    props.left !== undefined
      ? { side: 'left', offset: props.left }
      : props.right !== undefined
        ? { side: 'right', offset: props.right }
        : { side: 'left', offset: DEFAULT_OFFSET };

  anchorY.value =
    props.top !== undefined
      ? { side: 'top', offset: props.top }
      : props.bottom !== undefined
        ? { side: 'bottom', offset: props.bottom }
        : { side: 'top', offset: DEFAULT_OFFSET };
}

readProps();
// Where the server renders it too, before anything is measured.
if (anchorX.value?.side === 'left') left.value = anchorX.value.offset;
if (anchorY.value?.side === 'top') top.value = anchorY.value.offset;

// The viewport is unknown until mount: a server has none, and the first client
// render has to match the server's.
const measured = ref(false);
onMounted(() => (measured.value = true));

function widthLimit(atLeft = left.value): number | undefined {
  const limits = [props.maxWidth];

  if (bounding() && measured.value) {
    limits.push(anchorX.value?.side === 'right' ? viewport().width - anchorX.value.offset : viewport().width - atLeft);
  }

  return smallest(limits);
}

function heightLimit(atTop = top.value): number | undefined {
  const limits = [props.maxHeight];

  if (bounding() && measured.value) {
    limits.push(
      anchorY.value?.side === 'bottom' ? viewport().height - anchorY.value.offset : viewport().height - atTop
    );
  }

  return smallest(limits);
}

function resolveAnchors(boxWidth: number, boxHeight: number) {
  const view = viewport();

  return {
    left: anchorX.value
      ? anchorX.value.side === 'left'
        ? anchorX.value.offset
        : view.width - boxWidth - anchorX.value.offset
      : left.value,
    top: anchorY.value
      ? anchorY.value.side === 'top'
        ? anchorY.value.offset
        : view.height - boxHeight - anchorY.value.offset
      : top.value
  };
}

function applyBounds(nextLeft: number, nextTop: number, boxWidth: number, boxHeight: number): Rect {
  let resolvedWidth = clamp(boxWidth, minWidth(), widthLimit(nextLeft));
  let resolvedHeight = clamp(boxHeight, minHeight(), heightLimit(nextTop));

  if (!bounding()) {
    return { left: nextLeft, top: nextTop, width: resolvedWidth, height: resolvedHeight };
  }

  const view = viewport();
  const resolvedLeft = clamp(nextLeft, 0, Math.max(0, view.width - resolvedWidth));
  const resolvedTop = clamp(nextTop, 0, Math.max(0, view.height - resolvedHeight));

  if (resolvedLeft + resolvedWidth > view.width) {
    resolvedWidth = view.width - resolvedLeft;
  }

  if (resolvedTop + resolvedHeight > view.height) {
    resolvedHeight = view.height - resolvedTop;
  }

  return {
    left: resolvedLeft,
    top: resolvedTop,
    width: Math.max(resolvedWidth, minWidth()),
    height: Math.max(resolvedHeight, minHeight())
  };
}

function syncBounds(): void {
  if (dragging.value || resizing.value) return;

  const rect = currentRect();
  const boxWidth = width.value ?? rect.width;
  const boxHeight = height.value ?? rect.height;
  const resolved = resolveAnchors(boxWidth, boxHeight);
  const next = applyBounds(resolved.left, resolved.top, boxWidth, boxHeight);

  if (anchorX.value || anchorY.value || width.value !== null || height.value !== null) {
    left.value = next.left;
    top.value = next.top;
  } else {
    const view = viewport();
    left.value = clamp(rect.left, 0, Math.max(0, view.width - rect.width));
    top.value = clamp(rect.top, 0, Math.max(0, view.height - rect.height));
  }

  if (width.value !== null) {
    width.value = next.width;
  }
  if (height.value !== null) {
    height.value = next.height;
  }
}

watch(
  () => [props.left, props.right, props.top, props.bottom, props.width, props.height],
  () => {
    readProps();
    syncBounds();
  }
);

function dropAnchors(): void {
  anchorX.value = null;
  anchorY.value = null;
  moved.value = true;
}

function moveTo(rect: Rect, dx: number, dy: number): void {
  let nextLeft = rect.left + dx;
  let nextTop = rect.top + dy;

  if (bounding()) {
    const view = viewport();
    nextLeft = clamp(nextLeft, 0, Math.max(0, view.width - rect.width));
    nextTop = clamp(nextTop, 0, Math.max(0, view.height - rect.height));
  }

  left.value = nextLeft;
  top.value = nextTop;
}

function pull(target: FloatingHandle, rect: Rect, dx: number, dy: number): void {
  const horizontal = target.includes('e') || target.includes('w');
  const vertical = target.includes('n') || target.includes('s');
  const view = viewport();
  const rightEdge = rect.left + rect.width;
  const bottomEdge = rect.top + rect.height;

  let nextLeft = rect.left;
  let nextTop = rect.top;
  let nextWidth = rect.width;
  let nextHeight = rect.height;

  if (target.includes('e')) {
    const room = bounding() ? view.width - rect.left : Infinity;
    nextWidth = clamp(rect.width + dx, minWidth(), Math.min(props.maxWidth ?? Infinity, room));
  } else if (target.includes('w')) {
    const room = bounding() ? rightEdge : Infinity;
    nextWidth = clamp(rect.width - dx, minWidth(), Math.min(props.maxWidth ?? Infinity, room));
    nextLeft = rightEdge - nextWidth;
  }

  if (target.includes('s')) {
    const room = bounding() ? view.height - rect.top : Infinity;
    nextHeight = clamp(rect.height + dy, minHeight(), Math.min(props.maxHeight ?? Infinity, room));
  } else if (target.includes('n')) {
    const room = bounding() ? bottomEdge : Infinity;
    nextHeight = clamp(rect.height - dy, minHeight(), Math.min(props.maxHeight ?? Infinity, room));
    nextTop = bottomEdge - nextHeight;
  }

  left.value = nextLeft;
  top.value = nextTop;

  if (horizontal) {
    width.value = nextWidth;
  }
  if (vertical) {
    height.value = nextHeight;
  }
}

function pinFor(target: FloatingHandle, rect: Rect): void {
  if (target.includes('e') || target.includes('w')) {
    width.value = rect.width;
  }
  if (target.includes('n') || target.includes('s')) {
    height.value = rect.height;
  }
}

function reset(): void {
  readProps();
  moved.value = false;
  syncBounds();
  emit('drag', left.value, top.value);
  emit('resize', width.value, height.value);
}

function track(event: PointerEvent, onMove: (dx: number, dy: number) => void, onEnd: () => void): void {
  const target = event.currentTarget as HTMLElement;
  const { pointerId, clientX, clientY } = event;

  target.setPointerCapture?.(pointerId);

  function onPointermove(move: PointerEvent) {
    if (move.pointerId === pointerId) {
      onMove(move.clientX - clientX, move.clientY - clientY);
    }
  }

  function finish(end: PointerEvent) {
    if (end.pointerId !== pointerId) return;

    target.releasePointerCapture?.(pointerId);
    target.removeEventListener('pointermove', onPointermove);
    target.removeEventListener('pointerup', finish);
    target.removeEventListener('pointercancel', finish);

    onEnd();
  }

  target.addEventListener('pointermove', onPointermove);
  target.addEventListener('pointerup', finish);
  target.addEventListener('pointercancel', finish);
}

function onDragStart(event: PointerEvent): void {
  if (event.button !== 0) return;

  const target = event.target as HTMLElement | null;
  if (target && target !== event.currentTarget && target.closest(INTERACTIVE)) return;

  event.preventDefault();
  dropAnchors();

  const rect = currentRect();
  dragging.value = true;

  track(
    event,
    (dx, dy) => moveTo(rect, dx, dy),
    () => {
      dragging.value = false;
      emit('drag', left.value, top.value);
    }
  );
}

function onResizeStart(event: PointerEvent, target: FloatingHandle): void {
  if (event.button !== 0) return;

  event.preventDefault();
  event.stopPropagation();
  dropAnchors();

  const rect = currentRect();
  pinFor(target, rect);

  resizing.value = true;
  handle.value = target;

  track(
    event,
    (dx, dy) => pull(target, rect, dx, dy),
    () => {
      resizing.value = false;
      handle.value = null;
      emit('resize', width.value, height.value);
    }
  );
}

let observer: ResizeObserver | null = null;

if (typeof ResizeObserver !== 'undefined') {
  observer = new ResizeObserver(syncBounds);
}

if (typeof window !== 'undefined') window.addEventListener('resize', syncBounds);

watch(
  element,
  (el, _previous, onCleanup) => {
    if (!el) return;

    syncBounds();
    observer?.observe(el);
    onCleanup(() => observer?.unobserve(el));
  },
  { flush: 'post' }
);

onScopeDispose(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', syncBounds);

  observer?.disconnect();
});

const state = computed<FloatingState>(() => ({
  open: open.value,
  transitionStatus: transitionStatus.value,
  resize: resize(),
  dragging: dragging.value,
  resizing: resizing.value,
  handle: handle.value,
  moved: moved.value,
  left: left.value,
  top: top.value,
  width: width.value,
  height: height.value
}));

const STATE_ATTRS = {
  ...popupStateAttrs,
  left: () => null,
  top: () => null,
  width: () => null,
  height: () => null,
  handle: (value: FloatingHandle | null) => (value ? { 'data-handle': value } : null)
};

const popupProps = computed(() => {
  const capWidth = width.value === null ? widthLimit() : undefined;
  const capHeight = height.value === null ? heightLimit() : undefined;

  return {
    'data-part': 'floating',
    ...dataAttrs(state.value, STATE_ATTRS),
    ref: (el: unknown) => {
      element.value = (el as HTMLElement) ?? null;
    },
    role: titleId.value ? 'dialog' : undefined,
    'aria-labelledby': titleId.value,
    style: {
      position: 'fixed',
      left: '0px',
      top: '0px',
      transform: `translate(${left.value}px, ${top.value}px)`,
      width: width.value === null ? undefined : `${width.value}px`,
      height: height.value === null ? undefined : `${height.value}px`,
      maxWidth: capWidth === undefined ? undefined : `${capWidth}px`,
      maxHeight: capHeight === undefined ? undefined : `${capHeight}px`,
      ...(dragging.value || resizing.value ? { transition: 'none' } : null)
    } satisfies CSSProperties
  };
});

const headerProps = computed(() => ({
  'data-part': 'header',
  style: { touchAction: 'none' } satisfies CSSProperties,
  onPointerdown: onDragStart,
  onDblclick: reset
}));

const titleProps = computed(() => ({ 'data-part': 'title' }));

const closeProps = computed(() => ({
  'data-part': 'close',
  type: 'button' as const,
  'aria-label': 'Close',
  onClick() {
    open.value = false;
  }
}));

function getResizerProps(target: FloatingHandle): Record<string, unknown> {
  return {
    'data-part': 'resizer',
    'data-handle': target,
    'aria-hidden': true,
    style: { touchAction: 'none' } satisfies CSSProperties,
    onPointerdown(event: PointerEvent) {
      onResizeStart(event, target);
    }
  };
}

const api: FloatingContext = {
  state,
  open,
  handles,
  headerProps,
  titleProps,
  closeProps,
  getResizerProps,
  registerTitle,
  reset
};

provideFloatingContext(api);
provideSurface({ present: mounted, state, popupProps });
defineExpose(api);

const slotProps = computed(() => ({ ...state.value, handles: handles.value }));
</script>

<template>
  <slot v-bind="slotProps" />
</template>
