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
import { createContext } from '../../shared/context';
import { provideSurface } from '../../shared/surface';
import { useControlled } from '../../shared/use-controlled';
import { dataAttrs } from '../../shared/data-attrs';
import { anchoredStateAttrs } from '../../shared/popup-state-attrs';
import { useTransitionStatus, type TransitionStatus } from '../../shared/use-transition-status';
import { usePositioning, type Align, type Side, type UsePositioningOptions } from '../../shared/use-positioning';
import { useDismiss } from '../../shared/use-dismiss';
import { useExitAnimation } from '../../shared/use-exit-animation';
import { isKeyboardFocus } from '../../shared/input-modality';
import {
  createTooltipGroup,
  defaultTooltipGroup,
  DEFAULT_GROUP_OPTIONS,
  type TooltipGroup
} from './tooltip-group';
import { elementOf } from '../../shared/element-of';

export const { provideContext: provideTooltipGroup, useOptionalContext: useTooltipGroupContext } =
  createContext<TooltipGroup>('TooltipGroup');

export interface UseTooltipGroupOptions {
  /** How long the pointer must rest before the first tooltip opens. */
  delay?: MaybeRefOrGetter<number | undefined>;
  /** How long after the pointer leaves before a tooltip hides. */
  closeDelay?: MaybeRefOrGetter<number | undefined>;
  /** How long after the last tooltip closes that neighbors still open instantly. */
  timeout?: MaybeRefOrGetter<number | undefined>;
}

export function useTooltipGroup(options: UseTooltipGroupOptions = {}): TooltipGroup {
  const group = createTooltipGroup(() => ({
    delay: toValue(options.delay) ?? DEFAULT_GROUP_OPTIONS.delay,
    closeDelay: toValue(options.closeDelay) ?? DEFAULT_GROUP_OPTIONS.closeDelay,
    timeout: toValue(options.timeout) ?? DEFAULT_GROUP_OPTIONS.timeout
  }));

  provideTooltipGroup(group);

  return group;
}

export interface TooltipState {
  /**
   * Whether the tooltip is open.
   * @attribute `data-open` while open, `data-closed` otherwise
   */
  open: boolean;
  /**
   * The side of the trigger the tooltip ended up on.
   * @attribute `data-side="…"`
   */
  side: Side;
  /**
   * How the tooltip lines up along that side.
   * @attribute `data-align="…"`
   */
  align: Align;
  /**
   * Where the tooltip is in its enter or exit animation.
   * @attribute `data-enter-from` as it enters, `data-leave-to` as it leaves
   */
  transitionStatus: TransitionStatus;
}

export interface UseTooltipOptions extends UsePositioningOptions {
  open?: MaybeRefOrGetter<boolean | undefined>;
  defaultOpen?: MaybeRefOrGetter<boolean | undefined>;
  /** Overrides the group's open delay, in milliseconds. */
  delay?: MaybeRefOrGetter<number | undefined>;
  /** Overrides the group's close delay, in milliseconds. */
  closeDelay?: MaybeRefOrGetter<number | undefined>;
  /** Allow the pointer to move into the tooltip without closing it. */
  hoverable?: MaybeRefOrGetter<boolean | undefined>;
  /** Never open. */
  disabled?: MaybeRefOrGetter<boolean | undefined>;
  onChange?: (open: boolean) => void;
}

export interface UseTooltipReturn {
  open: WritableComputedRef<boolean>;
  state: ComputedRef<TooltipState>;
  present: Ref<boolean>;
  triggerProps: ComputedRef<Record<string, unknown>>;
  positionerProps: ComputedRef<Record<string, unknown>>;
  popupProps: ComputedRef<Record<string, unknown>>;
  arrowProps: ComputedRef<Record<string, unknown>>;
}

const HOVER_GRACE = 100;

export function useTooltip(options: UseTooltipOptions = {}): UseTooltipReturn {
  const tooltipId = useId();
  const group = useTooltipGroupContext() ?? defaultTooltipGroup;

  const disabled = () => toValue(options.disabled) ?? false;
  const hoverable = () => toValue(options.hoverable) ?? true;
  const openDelay = () => toValue(options.delay) ?? group.options().delay;
  const closeDelay = () => toValue(options.closeDelay) ?? group.options().closeDelay;

  const open = useControlled<boolean>({
    value: () => toValue(options.open),
    defaultValue: () => toValue(options.defaultOpen) ?? false,
    onChange: options.onChange,
    prop: 'open',
    empty: false,
    name: 'useTooltip',
    label: 'open'
  });

  const { mounted, transitionStatus, setMounted } = useTransitionStatus(() => open.value, {
    skipEnter: () => group.isInstant(),
    skipExit: () => group.openCount() > 1
  });

  const positioning = usePositioning({
    ...options,
    side: () => toValue(options.side) ?? 'top',
    align: () => toValue(options.align) ?? 'center',
    sideOffset: () => toValue(options.sideOffset) ?? 8,
    enabled: () => mounted.value
  });

  const triggerEl = positioning.anchorRef;
  const surfaceEl = ref<HTMLElement | null>(null);

  let timer: ReturnType<typeof setTimeout> | undefined;

  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };

  function show(immediate = false) {
    if (disabled()) return;
    // Clears a pending close too: the pointer came back.
    cancel();
    if (open.value) return;

    const wait = immediate || group.isInstant() ? 0 : openDelay();

    if (wait <= 0) {
      open.value = true;
      return;
    }

    timer = setTimeout(() => {
      open.value = true;
    }, wait);
  }

  function hide(immediate = false) {
    cancel();
    if (!open.value) return;

    // A hoverable tooltip waits long enough for the pointer to cross the gap to it.
    const wait = immediate ? 0 : hoverable() ? Math.max(closeDelay(), HOVER_GRACE) : closeDelay();

    if (wait <= 0) {
      open.value = false;
      return;
    }

    timer = setTimeout(() => {
      open.value = false;
    }, wait);
  }

  const closeNow = () => hide(true);

  watch(open, (isOpen) => (isOpen ? group.onOpen(closeNow) : group.onClose(closeNow)), { flush: 'post' });

  onScopeDispose(() => {
    cancel();
    if (open.value) group.onClose(closeNow);
  });

  const state = computed<TooltipState>(() => ({
    open: open.value,
    side: positioning.renderedSide.value,
    align: positioning.renderedAlign.value,
    transitionStatus: transitionStatus.value
  }));

  const hooks = computed(() => dataAttrs(state.value, { ...anchoredStateAttrs }));

  useDismiss({
    enabled: () => mounted.value,
    elements: () => [surfaceEl.value, triggerEl.value],
    escapeKey: true,
    outsidePress: false,
    onDismiss: () => hide(true)
  });

  useExitAnimation({
    open: () => open.value,
    mounted,
    setMounted,
    element: surfaceEl
  });

  const triggerProps = computed(() => ({
    ...hooks.value,
    'data-part': 'trigger',
    'aria-describedby': mounted.value ? tooltipId : undefined,
    ref: (el: unknown) => {
      triggerEl.value = elementOf(el);
    },
    onPointerenter(event: PointerEvent) {
      if (event.pointerType === 'touch') return;

      show();
    },
    onPointerleave(event: PointerEvent) {
      if (event.pointerType === 'touch') return;

      hide();
    },
    onPointerdown() {
      hide(true);
    },
    onFocus() {
      if (isKeyboardFocus()) show(true);
    },
    onBlur() {
      hide(true);
    }
  }));

  const popupProps = computed(() => ({
    ...hooks.value,
    id: tooltipId,
    role: 'tooltip',
    ref: (el: unknown) => {
      surfaceEl.value = (el as HTMLElement) ?? null;
    },
    onPointerenter() {
      if (hoverable()) cancel();
    },
    onPointerleave() {
      if (hoverable()) hide();
    }
  }));

  provideSurface({
    present: mounted,
    state,
    popupProps,
    positionerProps: positioning.positionerProps,
    arrowProps: positioning.arrowProps
  });

  return {
    open,
    state,
    present: mounted,
    triggerProps,
    positionerProps: positioning.positionerProps,
    popupProps,
    arrowProps: positioning.arrowProps
  };
}

export const { provideContext: provideTooltipContext, useContext: useTooltipContext } =
  createContext<UseTooltipReturn>('Tooltip');
