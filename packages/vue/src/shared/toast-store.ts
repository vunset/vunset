import { computed, ref, shallowReactive, type ComputedRef, type Ref, type VNodeChild } from 'vue';

export type ToastId = string | number;

/** The enter/exit phase, matching the rest of the library's animation hooks. */
export type ToastTransitionStatus = 'enter' | 'leave' | undefined;

export interface ToastOptions<Data = unknown> {
  /** Reuse an id to replace a toast that is already showing. One is generated otherwise. */
  id?: ToastId;
  /** What `ToastTitle` shows unless given content of its own. */
  title?: string;
  /** What `ToastDescription` shows unless given content of its own. */
  text?: string;
  /** Free-form, for the template to branch on. `loading` never times out; move it on with `update`. */
  type?: string;
  /** Keeps the toast up until it is dismissed by hand. */
  manualClose?: boolean;
  /** Milliseconds before it dismisses itself. Ignored when `manualClose` is set. */
  timeout?: number;
  /**
   * Renders this one toast instead of the viewport's registered template.
   *
   * The escape hatch for a toast that looks nothing like the others — it still
   * has to render a `ToastRoot` to take part in the stack.
   */
  slot?: (toast: Toast<Data>) => VNodeChild;
  /** Anything else the template needs. */
  data?: Data;
  /** Runs as it starts to leave, however it was dismissed. */
  onClose?: () => void;
}

export interface Toast<Data = unknown> extends ToastOptions<Data> {
  id: ToastId;
  transitionStatus: ToastTransitionStatus;
  /** Measured natural height, published so the stack can lay itself out. */
  height: number;
  /**
   * How many times this toast has been raised again under the same id.
   *
   * `0` for one that has only been shown once. A repeat replaces the toast
   * where it stands rather than stacking a duplicate, so this counter is the
   * only trace of it — and what a stylesheet can hang a nudge on to show that
   * something happened.
   */
  repeatCount: number;
}

/** A toast's place in the stack. Derived, so it never drifts from the list. */
export interface ToastPlacement {
  /** Position among the toasts still arriving or resting. `-1` once leaving. */
  visibleIndex: number;
  /** Combined height of everything in front of it, which is where it sits when expanded. */
  offsetY: number;
  /** Whether it is beyond the viewport's limit and should be held back. */
  limited: boolean;
}

/** A toast's timeout, as a progress bar follows it. */
export interface ToastTimer {
  /** Its full length, in milliseconds. */
  duration: number;
  /** Whether it is held: while the stack is expanded, and once the toast is leaving. */
  paused: boolean;
  /** Goes up each time it starts over, after an update or a repeat. */
  cycle: number;
}

export interface ToastStore {
  /** Newest first, which is also front-to-back in the stack. */
  toasts: Ref<Toast<any>[]>;
  /** Whether the stack is fanned out, because it is hovered or holds focus. */
  expanded: ComputedRef<boolean>;
  placements: ComputedRef<Map<ToastId, ToastPlacement>>;
  /** How many toasts stay visible. Set by the viewport. */
  limit: Ref<number>;
  /** The fallback timeout, for toasts that name none. Set by the viewport. */
  timeout: Ref<number>;
  add: <Data>(options: ToastOptions<Data>) => ToastId;
  /** Changes a toast in place, keeping what `options` leaves out. Ignored once it is leaving. */
  update: <Data>(id: ToastId, options: ToastOptions<Data>) => void;
  /** Starts the toast leaving. It is removed once its exit animation finishes. */
  close: (id: ToastId) => void;
  /** Takes the toast out of the list, ending any animation immediately. */
  remove: (id: ToastId) => void;
  closeAll: () => void;
  /** Its timeout, or `undefined` for one that never times out. */
  timer: (id: ToastId) => ToastTimer | undefined;
  setHeight: (id: ToastId, height: number) => void;
  setTransitionStatus: (id: ToastId, status: ToastTransitionStatus) => void;
  setHovering: (value: boolean) => void;
  setFocused: (value: boolean) => void;
}

export const DEFAULT_TIMEOUT = 5000;

export function createToastStore(): ToastStore {
  // Per store, so a server's ids don't depend on how many toasts it has seen.
  let counter = 0;
  const toasts = ref<Toast<any>[]>([]);
  const hovering = ref(false);
  const focused = ref(false);
  const limit = ref(3);
  const timeout = ref(DEFAULT_TIMEOUT);

  const expanded = computed(() => hovering.value || focused.value);

  interface Timer {
    /** Time still owed while paused. */
    remaining: number;
    /** When it fires, while running. */
    deadline: number;
    handle: ReturnType<typeof setTimeout> | undefined;
  }

  const timers = new Map<ToastId, Timer>();
  // What a progress bar reads, kept through the exit so the bar holds still.
  const runs = shallowReactive(new Map<ToastId, { duration: number; cycle: number }>());
  let cycles = 0;

  function find(id: ToastId) {
    return toasts.value.find((toast) => toast.id === id);
  }

  /**
   * Where each toast sits, recomputed from the list rather than stored on it.
   * A leaving toast drops out of the running total at once, so the ones behind
   * close the gap while it fades rather than after it is gone.
   */
  const placements = computed(() => {
    const map = new Map<ToastId, ToastPlacement>();
    let resting = 0;
    let depth = 0;

    for (const toast of toasts.value) {
      if (toast.transitionStatus === 'leave') {
        map.set(toast.id, { visibleIndex: -1, offsetY: depth, limited: false });
        continue;
      }

      map.set(toast.id, { visibleIndex: resting, offsetY: depth, limited: resting >= limit.value });
      resting += 1;
      depth += toast.height;
    }

    return map;
  });

  function clearTimer(id: ToastId) {
    const timer = timers.get(id);
    if (timer?.handle !== undefined) {
      clearTimeout(timer.handle);
      timer.handle = undefined;
    }
  }

  function runTimer(id: ToastId) {
    const timer = timers.get(id);
    if (!timer || timer.handle !== undefined || expanded.value) {
      return;
    }
    timer.deadline = Date.now() + timer.remaining;
    timer.handle = setTimeout(() => {
      timers.delete(id);
      close(id);
    }, timer.remaining);
  }

  function pauseTimer(id: ToastId) {
    const timer = timers.get(id);
    if (!timer || timer.handle === undefined) {
      return;
    }
    clearTimeout(timer.handle);
    timer.handle = undefined;
    // Banked rather than restarted: a toast the user has read halfway through
    // should not serve its full time again every time the pointer passes over.
    timer.remaining = Math.max(0, timer.deadline - Date.now());
  }

  function startTimer(toast: Toast<any>) {
    if (toast.manualClose || toast.type === 'loading') {
      return;
    }
    const duration = toast.timeout ?? timeout.value;
    if (duration <= 0) {
      return;
    }
    // Recorded on a server too, so its progress bar matches the hydrated one.
    runs.set(toast.id, { duration, cycle: ++cycles });
    // A server render has no one to dismiss it for.
    if (typeof window === 'undefined') {
      return;
    }
    timers.set(toast.id, { remaining: duration, deadline: 0, handle: undefined });
    runTimer(toast.id);
  }

  function add<Data>(options: ToastOptions<Data>): ToastId {
    let id = options.id;
    // Past any id already showing: one a server render numbered may be carried in.
    while (id === undefined || (options.id === undefined && find(id))) {
      counter += 1;
      id = `toast-${counter}`;
    }

    const toast: Toast<Data> = {
      ...options,
      id,
      transitionStatus: 'enter',
      height: 0,
      repeatCount: 0,
    };

    const existing = toasts.value.findIndex((entry) => entry.id === id);
    if (existing !== -1) {
      // Reusing an id replaces the toast in place, so a progress message can be
      // rewritten without the stack reshuffling underneath it.
      clearTimer(id);
      timers.delete(id);
      runs.delete(id);

      const previous = toasts.value[existing];
      // One already on screen must not replay its enter animation, or it
      // flashes out and back in. One caught on its way out really is arriving
      // again, so it enters properly.
      const returning = previous.transitionStatus === 'leave';

      const next = toasts.value.slice();
      next[existing] = {
        ...toast,
        transitionStatus: returning ? 'enter' : undefined,
        height: previous.height,
        repeatCount: returning ? 0 : previous.repeatCount + 1,
      };
      toasts.value = next;
    } else {
      toasts.value = [toast, ...toasts.value];
    }

    startTimer(toast);
    return id;
  }

  function update<Data>(id: ToastId, options: ToastOptions<Data>) {
    const index = toasts.value.findIndex((entry) => entry.id === id);
    const previous = toasts.value[index];
    if (!previous || previous.transitionStatus === 'leave') return;

    clearTimer(id);
    timers.delete(id);
    runs.delete(id);

    const next = toasts.value.slice();
    next[index] = { ...previous, ...options, id };
    toasts.value = next;

    startTimer(next[index]);
  }

  function close(id: ToastId) {
    const toast = find(id);
    if (!toast || toast.transitionStatus === 'leave') {
      return;
    }

    clearTimer(id);
    timers.delete(id);
    setTransitionStatus(id, 'leave');
    toast.onClose?.();
  }

  function remove(id: ToastId) {
    clearTimer(id);
    timers.delete(id);
    runs.delete(id);
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }

  function setTransitionStatus(id: ToastId, status: ToastTransitionStatus) {
    const toast = find(id);
    if (!toast || toast.transitionStatus === status) {
      return;
    }
    toasts.value = toasts.value.map((entry) =>
      entry.id === id ? { ...entry, transitionStatus: status } : entry,
    );
  }

  function setHeight(id: ToastId, height: number) {
    const toast = find(id);
    if (!toast || toast.height === height) {
      return;
    }
    toasts.value = toasts.value.map((entry) => (entry.id === id ? { ...entry, height } : entry));
  }

  /** Every timer halts while the stack is being read, not just the hovered one. */
  function syncTimers() {
    for (const id of timers.keys()) {
      if (expanded.value) {
        pauseTimer(id);
      } else {
        runTimer(id);
      }
    }
  }

  return {
    toasts,
    expanded,
    placements,
    limit,
    timeout,
    add,
    update,
    close,
    remove,
    closeAll() {
      for (const toast of toasts.value.slice()) {
        close(toast.id);
      }
    },
    timer(id: ToastId) {
      const run = runs.get(id);
      if (!run) return undefined;
      return { ...run, paused: expanded.value || find(id)?.transitionStatus === 'leave' };
    },
    setHeight,
    setTransitionStatus,
    setHovering(value: boolean) {
      hovering.value = value;
      syncTimers();
    },
    setFocused(value: boolean) {
      focused.value = value;
      syncTimers();
    },
  };
}

/**
 * The store used when none is named.
 *
 * A module-level instance is what lets `useToast().setToast(...)` be called from
 * a plain module — an API client, a router guard — with nothing to wire up.
 * Anything that needs isolation, such as a server render or a second app on the
 * page, should create its own with {@link createToastStore}.
 */
export const defaultToastStore = serverSafe(createToastStore());

// The shared store outlives a server request, so a toast added there would show
// up in every later one. It is ignored instead.
function serverSafe(store: ToastStore): ToastStore {
  const add = store.add;
  store.add = (options) => {
    if (typeof window !== 'undefined') return add(options);
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[vunset] A toast added during a server render is ignored: give the request its own createToastStore().',
      );
    }
    return options.id ?? '';
  };
  return store;
}
