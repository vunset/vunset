import { watch, type Ref } from 'vue';
import { waitForAnimationsToFinish } from './animations';

export interface UseExitAnimationOptions {
  /** Whether the surface is open. */
  open: () => boolean;
  /** Whether it is still in the DOM. Outlives `open` for the duration of the exit. */
  mounted: Ref<boolean>;
  setMounted: (value: boolean) => void;
  /** The animating element. Unmounting waits on this. */
  element: Ref<HTMLElement | null>;
}

/** Holds a closing surface in the DOM until its exit animation has finished. */
export function useExitAnimation(options: UseExitAnimationOptions): void {
  watch(
    () => [options.open(), options.mounted.value] as const,
    ([isOpen, isMounted]) => {
      const element = options.element.value;
      if (isOpen || !isMounted || !element) return;

      waitForAnimationsToFinish(element).then(() => {
        if (!options.open()) options.setMounted(false);
      });
    },
    { flush: 'post' }
  );
}
