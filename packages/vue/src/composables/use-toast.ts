import {
  computed,
  hasInjectionContext,
  onScopeDispose,
  provide,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type CSSProperties,
  type App,
  type MaybeRefOrGetter,
  type Ref
} from 'vue';
import { createContext } from '../shared/context';
import { useLabeling, type RegisterId } from '../shared/labeling';
import { dataAttrs } from '../shared/data-attrs';
import type { Align } from '../shared/use-positioning';
import { popupStateAttrs } from '../shared/popup-state-attrs';
import { waitForAnimationsToFinish } from '../shared/animations';
import { createVelocity, dismissesOnRelease, resist } from '../shared/swipe-dismiss';
import {
  createToastStore,
  defaultToastStore,
  type Toast,
  type ToastId,
  type ToastOptions,
  type ToastStore,
  type ToastTimer,
  type ToastTransitionStatus
} from '../shared/toast-store';

export { createToastStore, defaultToastStore };
export type { Toast, ToastId, ToastOptions, ToastStore, ToastTimer };

export type ToastSide = 'top' | 'bottom';

export type ToastPosition = `${ToastSide}-${Align}`;

export interface UseToastReturn {
  toasts: Ref<Toast<any>[]>;
  setToast: <Data>(options: ToastOptions<Data>) => ToastId;
  updateToast: <Data>(id: ToastId, options: ToastOptions<Data>) => void;
  removeToast: (id: ToastId) => void;
  clearToasts: () => void;
}

const { key: toastStoreKey, useOptionalContext: useProvidedToastStore } = createContext<ToastStore>('ToastStore');

/**
 * Makes `store` the one `useToast()` and the viewport use below this component,
 * or across `app`: a server render's own, so its toasts reach no other request.
 */
export function provideToastStore(store: ToastStore, app?: App): ToastStore {
  if (app) app.provide(toastStoreKey, store);
  else provide(toastStoreKey, store);
  return store;
}

/** The store named, else the provided one, else the shared default. */
function resolveToastStore(store?: ToastStore): ToastStore {
  return store ?? (hasInjectionContext() ? useProvidedToastStore() : null) ?? defaultToastStore;
}

/** The nearest provided store, or the shared one. Callable outside `setup` too, where it is always the shared one. */
export function useToast(store?: ToastStore): UseToastReturn {
  store = resolveToastStore(store);
  return {
    toasts: store.toasts,
    setToast: store.add,
    updateToast: store.update,
    removeToast: store.close,
    clearToasts: store.closeAll
  };
}

export interface ToastViewportState {
  position: ToastPosition;
  /** The `top` or `bottom` half of `position`. */
  side: ToastSide;
  /** The `start`, `center` or `end` half of `position`. */
  align: Align;
  /** Whether the stack is fanned out rather than collapsed. */
  expanded: boolean;
  /** Whether there is nothing to show. */
  empty: boolean;
}

export interface UseToastViewportOptions {
  store?: ToastStore;
  /** @default 'bottom-end' */
  position?: MaybeRefOrGetter<ToastPosition | undefined>;
  /** How many toasts stay in the stack; the rest wait their turn. @default 3 */
  limit?: MaybeRefOrGetter<number | undefined>;
  /** The timeout for toasts that name none. @default 5000 */
  timeout?: MaybeRefOrGetter<number | undefined>;
  /** Names the region for assistive technology. @default 'Notifications' */
  label?: MaybeRefOrGetter<string | undefined>;
}

export interface UseToastViewportReturn {
  toasts: Ref<Toast<any>[]>;
  state: ComputedRef<ToastViewportState>;
  viewportProps: ComputedRef<Record<string, unknown>>;
  store: ToastStore;
}

export function useToastViewport(options: UseToastViewportOptions = {}): UseToastViewportReturn {
  const store = resolveToastStore(options.store);

  const position = () => toValue(options.position) ?? 'bottom-end';
  const side = () => position().split('-')[0] as ToastSide;
  const align = () => position().split('-')[1] as Align;

  watch(
    () => toValue(options.limit) ?? 3,
    (value) => {
      store.limit.value = value;
    },
    { immediate: true }
  );

  watch(
    () => toValue(options.timeout) ?? store.timeout.value,
    (value) => {
      store.timeout.value = value;
    },
    { immediate: true }
  );

  watch(
    () => store.toasts.value.length,
    (length) => {
      if (length === 0) {
        store.setHovering(false);
        store.setFocused(false);
      }
    }
  );

  onScopeDispose(() => {
    store.setHovering(false);
    store.setFocused(false);
  });

  const state = computed<ToastViewportState>(() => ({
    position: position(),
    side: side(),
    align: align(),
    expanded: store.expanded.value,
    empty: store.toasts.value.length === 0
  }));

  const frontHeight = computed(() => {
    const front = store.toasts.value.find((toast) => toast.transitionStatus !== 'leave');
    return front?.height ?? 0;
  });

  const viewportProps = computed(() => ({
    ...dataAttrs(state.value, {
      position: (value) => ({ 'data-position': value }),
      side: (value) => ({ 'data-side': value }),
      align: (value) => ({ 'data-align': value })
    }),
    'data-part': 'viewport',
    style: {
      '--toast-front-height': `${frontHeight.value}px`,
      '--toast-count': store.toasts.value.length
    } as CSSProperties,
    role: 'region',
    'aria-label': toValue(options.label) ?? 'Notifications',
    onPointerenter() {
      store.setHovering(true);
    },
    onPointerleave() {
      store.setHovering(false);
    },
    onFocusin() {
      store.setFocused(true);
    },
    onFocusout(event: FocusEvent) {
      const next = event.relatedTarget;
      const viewport = event.currentTarget as HTMLElement;
      if (next instanceof Node && viewport.contains(next)) return;

      store.setFocused(false);
    }
  }));

  return { toasts: store.toasts, state, viewportProps, store };
}

export const { provideContext: provideToastViewportContext, useContext: useToastViewportContext } = createContext<{
  store: ToastStore;
}>('ToastViewport');

export const { provideContext: provideToastItemContext, useContext: useToastItemContext } =
  createContext<ComputedRef<Toast<any>>>('ToastItem');

export type ToastSwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface UseToastRootOptions {
  /** Where a swipe dismisses it; `[]` turns swiping off. @default ['down', 'right'] */
  swipeDirection?: MaybeRefOrGetter<ToastSwipeDirection | ToastSwipeDirection[] | undefined>;
}

const SWIPE_IGNORE = 'button,a,input,textarea,select,[role="button"],[data-swipe-ignore]';

export interface ToastRootState {
  /** The toast's `type`, for the template to branch on. */
  type: string | undefined;
  /** Its place in the stack: `0` at the front, `-1` once leaving. */
  index: number;
  /** Whether it is the newest, at the front of the stack. */
  front: boolean;
  /** Whether the stack is fanned out, because it is hovered or holds focus. */
  expanded: boolean;
  /** Whether it is beyond the viewport's `limit`, waiting its turn. */
  limited: boolean;
  /** Whether it was just raised again under the same id; on until its animation ends. */
  repeated: boolean;
  /**
   * How many times it has been raised again under the same id.
   * @attribute `data-repeat-count="…"` once repeated
   */
  repeatCount: number;
  /**
   * Where it is in its enter or exit animation.
   * @attribute `data-enter-from` as it enters, `data-leave-to` as it leaves
   */
  transitionStatus: ToastTransitionStatus;
  /** Whether it is being dragged. */
  swiping: boolean;
  /**
   * The way it was swiped out, once it has been.
   * @attribute `data-swipe-direction="…"` once swiped out
   */
  swipeDirection: ToastSwipeDirection | undefined;
}

/** What each toast part hands its slot. */
export type ToastSlotProps = ToastRootState & {
  /**
   * The toast itself: what was passed to `setToast`, plus its `id`.
   * @attribute none
   */
  toast: Toast<any>;
  /**
   * Dismisses it.
   * @attribute none
   */
  close: () => void;
};

export interface UseToastRootReturn {
  toast: ComputedRef<Toast<any>>;
  state: ComputedRef<ToastRootState>;
  rootProps: ComputedRef<Record<string, unknown>>;
  titleProps: ComputedRef<Record<string, unknown>>;
  descriptionProps: ComputedRef<Record<string, unknown>>;
  closeProps: ComputedRef<Record<string, unknown>>;
  /** A button that acts and then closes, named by its own text. */
  actionProps: ComputedRef<Record<string, unknown>>;
  /** A bar running down its timeout. */
  progressProps: ComputedRef<Record<string, unknown>>;
  /** Its timeout, or `undefined` for one that never times out. */
  timer: ComputedRef<ToastTimer | undefined>;
  close: () => void;
  registerTitle: RegisterId;
  registerDescription: RegisterId;
}

export function useToastRoot(options: UseToastRootOptions = {}): UseToastRootReturn {
  const { store } = useToastViewportContext();
  const toast = useToastItemContext();

  const { titleId, descriptionId, registerTitle, registerDescription } = useLabeling();

  const rootEl = ref<HTMLElement | null>(null);

  const placement = computed(
    () =>
      store.placements.value.get(toast.value.id) ?? {
        visibleIndex: 0,
        offsetY: 0,
        limited: false
      }
  );

  const stackSize = computed(() => store.toasts.value.length);

  function measure() {
    if (rootEl.value) store.setHeight(toast.value.id, naturalHeight(rootEl.value));
  }

  watch(rootEl, (element, _previous, onCleanup) => {
    if (!element) return;

    measure();

    if (typeof ResizeObserver !== 'function') return;

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });

  let frame: number | undefined;
  watch(
    [rootEl, () => toast.value.transitionStatus],
    ([element, status]) => {
      if (!element || status !== 'enter') return;

      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          store.setTransitionStatus(toast.value.id, undefined);
        });
      });
    },
    { immediate: true, flush: 'post' }
  );

  watch(
    [rootEl, () => toast.value.transitionStatus],
    ([element, status]) => {
      if (!element || status !== 'leave') return;

      const id = toast.value.id;
      waitForAnimationsToFinish(element).then(() => store.remove(id));
    },
    { flush: 'post' }
  );

  const repeating = ref(false);
  let repeatFrame: number | undefined;

  watch(
    () => toast.value.repeatCount,
    (count, previous) => {
      if (count === 0 || count === previous || !rootEl.value) return;

      repeating.value = false;
      if (repeatFrame !== undefined) cancelAnimationFrame(repeatFrame);

      repeatFrame = requestAnimationFrame(() => {
        repeatFrame = undefined;
        repeating.value = true;
      });
    },
    { flush: 'post' }
  );

  onScopeDispose(() => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    if (repeatFrame !== undefined) cancelAnimationFrame(repeatFrame);
  });

  const directions = computed(() => {
    const value = toValue(options.swipeDirection) ?? ['down', 'right'];
    return Array.isArray(value) ? value : [value];
  });

  const swiping = ref(false);
  const swipeDirection = ref<ToastSwipeDirection>();
  const movement = ref({ x: 0, y: 0 });
  let drag:
    | {
        x: number;
        y: number;
        pointerId: number;
        axis?: 'x' | 'y';
        velocity: { x: ReturnType<typeof createVelocity>; y: ReturnType<typeof createVelocity> };
      }
    | undefined;

  const allows = (direction: ToastSwipeDirection) => directions.value.includes(direction);
  const towards = (axis: 'x' | 'y', delta: number): ToastSwipeDirection =>
    axis === 'x' ? (delta < 0 ? 'left' : 'right') : delta < 0 ? 'up' : 'down';
  // Resists the ways it cannot be dismissed, rather than refusing to move.
  const follow = (axis: 'x' | 'y', delta: number) => (allows(towards(axis, delta)) ? delta : resist(delta));

  function onPointerdown(event: PointerEvent) {
    if (event.button !== 0 || directions.value.length === 0) return;
    if ((event.target as Element | null)?.closest?.(SWIPE_IGNORE)) return;

    drag = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      velocity: {
        x: createVelocity(event.clientX, event.timeStamp),
        y: createVelocity(event.clientY, event.timeStamp)
      }
    };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function onPointermove(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) return;

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.velocity.x.sample(event.clientX, event.timeStamp);
    drag.velocity.y.sample(event.clientY, event.timeStamp);

    if (!drag.axis) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 1) return;

      const canX = allows('left') || allows('right');
      const canY = allows('up') || allows('down');
      drag.axis = canX && canY ? (Math.abs(dx) > Math.abs(dy) ? 'x' : 'y') : canX ? 'x' : 'y';
      swiping.value = true;
    }

    movement.value = drag.axis === 'x' ? { x: follow('x', dx), y: 0 } : { x: 0, y: follow('y', dy) };
  }

  function onPointerup(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) return;

    const { axis, velocity } = drag;
    const delta = axis === 'x' ? event.clientX - drag.x : event.clientY - drag.y;
    drag = undefined;
    swiping.value = false;

    // Only a release decides; a canceled pointer always springs back.
    const out = event.type === 'pointerup' && axis ? towards(axis, delta) : undefined;
    const element = rootEl.value;
    const leaves =
      out !== undefined &&
      element !== null &&
      allows(out) &&
      dismissesOnRelease({
        traveled: Math.abs(delta),
        velocity: velocity[axis!].speed() * Math.sign(delta),
        size: axis === 'x' ? element.offsetWidth : element.offsetHeight
      });

    if (leaves) {
      // Keeps the offset, so the exit carries on from where the finger let go.
      swipeDirection.value = out;
      close();
    } else {
      movement.value = { x: 0, y: 0 };
    }
  }

  const state = computed<ToastRootState>(() => ({
    type: toast.value.type,
    index: placement.value.visibleIndex,
    front: placement.value.visibleIndex === 0,
    expanded: store.expanded.value,
    limited: placement.value.limited,
    repeated: repeating.value,
    repeatCount: toast.value.repeatCount,
    transitionStatus: toast.value.transitionStatus,
    swiping: swiping.value,
    swipeDirection: swipeDirection.value
  }));

  const hooks = computed(() =>
    dataAttrs(state.value, {
      transitionStatus: popupStateAttrs.transitionStatus,
      index: (value) => ({ 'data-index': String(value) }),
      type: (value) => (value ? { 'data-type': value } : null),
      repeatCount: (value) => (value > 0 ? { 'data-repeat-count': String(value) } : null),
      swipeDirection: (value) => (value ? { 'data-swipe-direction': value } : null)
    })
  );

  function close() {
    store.close(toast.value.id);
  }

  const timer = computed(() => store.timer(toast.value.id));

  const rootProps = computed(() => ({
    ...hooks.value,
    'data-part': 'root',
    role: 'status',
    'aria-atomic': true,
    'aria-labelledby': titleId.value,
    'aria-describedby': descriptionId.value,
    style: {
      '--toast-index': placement.value.visibleIndex,
      '--toast-offset-y': `${placement.value.offsetY}px`,
      '--toast-height': `${toast.value.height}px`,
      zIndex: placement.value.visibleIndex < 0 ? 0 : stackSize.value - placement.value.visibleIndex,
      '--toast-repeat-count': toast.value.repeatCount,
      '--toast-swipe-movement-x': `${movement.value.x}px`,
      '--toast-swipe-movement-y': `${movement.value.y}px`,
      // A touch drag would scroll the page instead.
      touchAction: directions.value.length ? 'none' : undefined
    } as CSSProperties,
    ref: (el: unknown) => {
      rootEl.value = (el as HTMLElement) ?? null;
    },
    onAnimationend() {
      repeating.value = false;
    },
    onPointerdown,
    onPointermove,
    onPointerup,
    onPointercancel: onPointerup
  }));

  return {
    toast,
    state,
    rootProps,
    titleProps: computed(() => ({ ...hooks.value, 'data-part': 'title' })),
    descriptionProps: computed(() => ({ ...hooks.value, 'data-part': 'description' })),
    closeProps: computed(() => ({
      'data-part': 'close',
      type: 'button',
      'aria-label': 'Close',
      onClick: close
    })),
    actionProps: computed(() => ({
      'data-part': 'action',
      type: 'button',
      onClick: close
    })),
    progressProps: computed(() => ({
      ...hooks.value,
      'data-part': 'progress',
      'data-paused': timer.value?.paused ? '' : undefined,
      'aria-hidden': true,
      style: { '--toast-duration': `${timer.value?.duration ?? 0}ms` } as CSSProperties
    })),
    timer,
    close,
    registerTitle,
    registerDescription
  };
}

export const { provideContext: provideToastRootContext, useContext: useToastRootContext } =
  createContext<UseToastRootReturn>('ToastRoot');

/**
 * The height a toast's content asks for, whatever a stylesheet pins it to while
 * it sits in a collapsed pile. Lifted with `important`, which also outranks a
 * stylesheet's own `!important`, then put back exactly as it was.
 */
function naturalHeight(element: HTMLElement): number {
  const { style } = element;
  const inline = style.getPropertyValue('height');
  const priority = style.getPropertyPriority('height');

  style.setProperty('height', 'auto', 'important');
  const height = element.offsetHeight;
  style.setProperty('height', inline, priority);

  return height;
}
