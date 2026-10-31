import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  useId,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type WritableComputedRef
} from 'vue';
import { createContext } from './context';
import { useControlled } from './use-controlled';
import { dataAttrs } from './data-attrs';
import { popupStateAttrs } from './popup-state-attrs';
import { useTransitionStatus, type TransitionStatus } from './use-transition-status';
import { waitForAnimationsToFinish } from './animations';

export const PANEL_HEIGHT_VAR = '--collapsible-panel-height';
export const PANEL_WIDTH_VAR = '--collapsible-panel-width';

export interface CollapsibleState {
  /**
   * Whether the panel is open.
   * @attribute `data-open` while open, `data-closed` otherwise
   */
  open: boolean;
  /** Whether the trigger ignores interaction. */
  disabled: boolean;
  /**
   * Where the panel is in its opening or closing animation.
   * @attribute `data-enter-from` as it opens, `data-leave-to` as it closes
   */
  transitionStatus: TransitionStatus;
}

export interface UseCollapsibleOptions {
  /** The open state. Supplying this makes the value controlled. */
  open?: MaybeRefOrGetter<boolean | undefined>;
  /** The initial open state while uncontrolled. */
  defaultOpen?: MaybeRefOrGetter<boolean>;
  /** Whether the trigger ignores user interaction. */
  disabled?: MaybeRefOrGetter<boolean>;
  /** The panel id, referenced by the trigger's `aria-controls`. Generated when omitted. */
  id?: MaybeRefOrGetter<string | undefined>;
  /** Called whenever the open state changes. */
  onChange?: (open: boolean) => void;
}

export interface UseCollapsibleReturn {
  open: WritableComputedRef<boolean>;
  state: ComputedRef<CollapsibleState>;
  /** Whether the panel belongs in the DOM. */
  present: Ref<boolean>;
  rootProps: ComputedRef<Record<string, unknown>>;
  triggerProps: ComputedRef<Record<string, unknown>>;
  panelProps: ComputedRef<Record<string, unknown>>;
  toggle: () => void;
}

export function useCollapsible(options: UseCollapsibleOptions = {}): UseCollapsibleReturn {
  const generatedId = useId();
  const panelEl = ref<HTMLElement | null>(null);

  const disabled = () => toValue(options.disabled) ?? false;
  const panelId = computed(() => toValue(options.id) ?? generatedId);

  const open = useControlled<boolean>({
    value: () => toValue(options.open),
    defaultValue: () => toValue(options.defaultOpen) ?? false,
    onChange: options.onChange,
    prop: 'open',
    empty: false,
    name: 'useCollapsible',
    label: 'open'
  });

  const { mounted, transitionStatus, setMounted } = useTransitionStatus(() => open.value);

  const state = computed<CollapsibleState>(() => ({
    open: open.value,
    disabled: disabled(),
    transitionStatus: transitionStatus.value
  }));

  const hooks = computed(() => dataAttrs(state.value, { ...popupStateAttrs }));

  let abort: AbortController | null = null;
  let observer: ResizeObserver | null = null;

  function measure(panel: HTMLElement) {
    panel.style.setProperty(PANEL_HEIGHT_VAR, `${panel.scrollHeight}px`);
    panel.style.setProperty(PANEL_WIDTH_VAR, `${panel.scrollWidth}px`);
  }

  function observe(panel: HTMLElement) {
    observer?.disconnect();
    observer = null;
    if (typeof ResizeObserver === 'undefined') return;

    observer = new ResizeObserver(() => measure(panel));
    observer.observe(panel);
  }

  watch(
    () => [open.value, mounted.value, panelEl.value] as const,
    ([isOpen, isMounted, panel]) => {
      if (!panel || !isMounted) return;

      abort?.abort();
      abort = new AbortController();

      measure(panel);

      if (isOpen) {
        observe(panel);
        return;
      }

      observer?.disconnect();
      observer = null;

      const { signal } = abort;
      waitForAnimationsToFinish(panel, signal).then(() => {
        if (!signal.aborted && !open.value) setMounted(false);
      });
    },
    { flush: 'post' }
  );

  onScopeDispose(() => {
    abort?.abort();
    observer?.disconnect();
  });

  function toggle() {
    if (disabled()) return;

    open.value = !open.value;
  }

  const rootProps = computed(() => ({ ...hooks.value, 'data-part': 'collapsible' }));

  const triggerProps = computed(() => ({
    ...hooks.value,
    'data-part': 'collapsible-trigger',
    type: 'button',
    disabled: disabled(),
    'aria-expanded': open.value,
    'aria-controls': panelId.value,
    onClick: toggle
  }));

  const panelProps = computed(() => ({
    ...hooks.value,
    'data-part': 'collapsible-panel',
    id: panelId.value,
    hidden: !mounted.value ? true : undefined,
    ref: (el: unknown) => {
      panelEl.value = (el as HTMLElement) ?? null;
    }
  }));

  return { open, state, present: mounted, rootProps, triggerProps, panelProps, toggle };
}

export const { provideContext: provideCollapsibleContext, useContext: useCollapsibleContext } =
  createContext<UseCollapsibleReturn>('Collapsible');
