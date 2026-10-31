import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { createContext } from './context';
import { dataAttrs } from './data-attrs';
import { popupStateAttrs } from './popup-state-attrs';
import { useTransitionStatus, type TransitionStatus } from './use-transition-status';
import { useExitAnimation } from './use-exit-animation';

/** What a checkbox or radio root hands its indicator. */
export interface ToggleIndicatorContext<State extends object = object> {
  state: ComputedRef<State>;
  /** The root's own `data-*` hooks, repeated on the indicator. */
  hooks: ComputedRef<Record<string, string>>;
  /** Whether the indicator should be showing. */
  present: () => boolean;
}

export const { provideContext: provideToggleIndicator, useContext: useToggleIndicatorContext } =
  createContext<ToggleIndicatorContext>('ToggleIndicator');

export interface UseToggleIndicatorReturn<State extends object> {
  /** Whether the indicator is in the DOM. Outlives `present` for an exit animation. */
  mounted: Ref<boolean>;
  state: ComputedRef<
    State & {
      /**
       * Where the indicator is in its enter or exit animation.
       * @attribute `data-enter-from` as it enters, `data-leave-to` as it leaves
       */
      transitionStatus: TransitionStatus;
    }
  >;
  indicatorProps: ComputedRef<Record<string, unknown>>;
}

/** Mounts the indicator while its root is checked, and holds it through the exit animation. */
export function useToggleIndicator<State extends object>(): UseToggleIndicatorReturn<State> {
  const context = useToggleIndicatorContext() as ToggleIndicatorContext<State>;
  const element = ref<HTMLElement | null>(null);

  const { mounted, transitionStatus, setMounted } = useTransitionStatus(context.present);
  useExitAnimation({ open: context.present, mounted, setMounted, element });

  const state = computed(() => ({ ...context.state.value, transitionStatus: transitionStatus.value }));

  const indicatorProps = computed(() => ({
    'data-part': 'indicator',
    ...context.hooks.value,
    ...dataAttrs({ transitionStatus: transitionStatus.value }, popupStateAttrs),
    ref: (el: unknown) => {
      element.value = (el as HTMLElement) ?? null;
    }
  }));

  return { mounted, state, indicatorProps };
}
