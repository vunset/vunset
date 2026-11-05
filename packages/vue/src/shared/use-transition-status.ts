import { getCurrentInstance, onMounted, ref, watch, onScopeDispose, type Ref } from 'vue';

export type TransitionStatus = 'enter' | 'leave' | 'idle' | undefined;

export interface UseTransitionStatusReturn {
  /** Whether the element should be present in the DOM. Outlives `open` while closing. */
  mounted: Ref<boolean>;
  /** Drives the `data-enter-from` / `data-leave-to` hooks. */
  transitionStatus: Ref<TransitionStatus>;
  /** Called by the owner once exit animations have finished. */
  setMounted: (value: boolean) => void;
}

export interface UseTransitionStatusOptions {
  /** Whether an element that mounts already open should still animate in. */
  animateInitialOpen?: boolean;
  /** Consulted each time the element opens. Returning `true` skips the `enter` phase, so the element appears with no enter animation. */
  skipEnter?: () => boolean;
  /** Consulted each time the element closes. Returning `true` skips the `leave` phase and unmounts at once. */
  skipExit?: () => boolean;
}

/** Tracks an animating element's phase: `closed → enter → idle → (open) → leave → closed`. */
export function useTransitionStatus(
  open: () => boolean,
  options: UseTransitionStatusOptions = {}
): UseTransitionStatusReturn {
  const { animateInitialOpen = false } = options;
  const initiallyOpen = open();
  const mounted = ref(initiallyOpen);
  const transitionStatus = ref<TransitionStatus>(initiallyOpen && !animateInitialOpen ? 'idle' : undefined);

  let frame: number | undefined;

  const cancelFrame = () => {
    if (frame !== undefined) {
      cancelAnimationFrame(frame);
      frame = undefined;
    }
  };

  // Paints `enter` for two frames, so the browser has two distinct states to interpolate between.
  function enter() {
    transitionStatus.value = 'enter';
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        transitionStatus.value = 'idle';
      });
    });
  }

  // Mounting open has no `open` change to react to, so the enter starts here once mounted; a server render stays on `enter`.
  if (initiallyOpen && animateInitialOpen) {
    transitionStatus.value = 'enter';
    if (getCurrentInstance()) onMounted(enter);
    else enter();
  }

  watch(
    open,
    (isOpen) => {
      cancelFrame();

      if (isOpen) {
        mounted.value = true;

        if (options.skipEnter?.()) {
          transitionStatus.value = 'idle';
          return;
        }

        enter();
      } else {
        if (options.skipExit?.()) {
          transitionStatus.value = undefined;
          mounted.value = false;
          return;
        }
        transitionStatus.value = 'leave';
      }
    },
    { flush: 'post' }
  );

  onScopeDispose(cancelFrame);

  return {
    mounted,
    transitionStatus,
    setMounted(value: boolean) {
      mounted.value = value;
      if (!value) transitionStatus.value = undefined;
    }
  };
}
