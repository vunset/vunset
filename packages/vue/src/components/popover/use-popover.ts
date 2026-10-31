import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  useId,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type WritableComputedRef
} from 'vue';
import { createContext } from '../../shared/context';
import { useLabeling, type RegisterId } from '../../shared/labeling';
import { provideSurface } from '../../shared/surface';
import { useControlled } from '../../shared/use-controlled';
import { dataAttrs } from '../../shared/data-attrs';
import { anchoredStateAttrs } from '../../shared/popup-state-attrs';
import { useTransitionStatus, type TransitionStatus } from '../../shared/use-transition-status';
import { usePositioning, type Align, type Side, type UsePositioningOptions } from '../../shared/use-positioning';
import { useDismiss } from '../../shared/use-dismiss';
import { useFocusTrap } from '../../shared/use-focus-trap';
import { useExitAnimation } from '../../shared/use-exit-animation';
import { useScrollLock } from '../../shared/use-scroll-lock';
import { useInertBackground } from '../../shared/use-inert-background';
import { watch } from 'vue';
import { elementOf } from '../../shared/element-of';

export interface PopoverState {
  /**
   * Whether the popover is open.
   * @attribute `data-open` while open, `data-closed` otherwise
   */
  open: boolean;
  /**
   * The side of the trigger the popover ended up on.
   * @attribute `data-side="…"`
   */
  side: Side;
  /**
   * How the popover lines up along that side.
   * @attribute `data-align="…"`
   */
  align: Align;
  /**
   * Where the popover is in its enter or exit animation.
   * @attribute `data-enter-from` as it enters, `data-leave-to` as it leaves
   */
  transitionStatus: TransitionStatus;
}

export interface UsePopoverOptions extends UsePositioningOptions {
  open?: MaybeRefOrGetter<boolean | undefined>;
  defaultOpen?: MaybeRefOrGetter<boolean | undefined>;
  /** `true` also locks scroll and makes the page inert; `'trap-focus'` only traps focus. */
  modal?: MaybeRefOrGetter<boolean | 'trap-focus' | undefined>;
  /** Close when Escape is pressed. */
  escapeKey?: MaybeRefOrGetter<boolean | undefined>;
  /** Close on a press outside the popup. */
  outsidePress?: MaybeRefOrGetter<boolean | undefined>;
  /** Move focus into the popup when it opens. */
  autoFocus?: MaybeRefOrGetter<boolean | undefined>;
  /** Also open while a mouse rests on the trigger, staying open while it is on the popup. A tap still opens it. */
  openOnHover?: MaybeRefOrGetter<boolean | undefined>;
  /** With `openOnHover`: how long the mouse rests on the trigger before it opens, in milliseconds. @default 200 */
  delay?: MaybeRefOrGetter<number | undefined>;
  /** With `openOnHover`: how long after the mouse leaves before it closes, time to cross to the popup. @default 150 */
  closeDelay?: MaybeRefOrGetter<number | undefined>;
  onChange?: (open: boolean) => void;
}

export interface UsePopoverReturn {
  open: WritableComputedRef<boolean>;
  state: ComputedRef<PopoverState>;
  present: Ref<boolean>;
  triggerProps: ComputedRef<Record<string, unknown>>;
  positionerProps: ComputedRef<Record<string, unknown>>;
  popupProps: ComputedRef<Record<string, unknown>>;
  arrowProps: ComputedRef<Record<string, unknown>>;
  closeProps: ComputedRef<Record<string, unknown>>;
  registerTitle: RegisterId;
  registerDescription: RegisterId;
  anchorRef: Ref<HTMLElement | null>;
}

export function usePopover(options: UsePopoverOptions = {}): UsePopoverReturn {
  const triggerId = useId();
  const popupId = useId();
  const { titleId, descriptionId, registerTitle, registerDescription } = useLabeling();

  const open = useControlled<boolean>({
    value: () => toValue(options.open),
    defaultValue: () => toValue(options.defaultOpen) ?? false,
    onChange: options.onChange,
    prop: 'open',
    empty: false,
    name: 'usePopover',
    label: 'open'
  });

  const { mounted, transitionStatus, setMounted } = useTransitionStatus(() => open.value);

  const positioning = usePositioning({ ...options, enabled: () => mounted.value });

  const triggerEl = positioning.anchorRef;
  const popupEl = positioning.popupRef;
  const surfaceEl = ref<HTMLElement | null>(null);

  const state = computed<PopoverState>(() => ({
    open: open.value,
    side: positioning.renderedSide.value,
    align: positioning.renderedAlign.value,
    transitionStatus: transitionStatus.value
  }));

  const hooks = computed(() => dataAttrs(state.value, { ...anchoredStateAttrs }));

  const modal = () => toValue(options.modal) ?? false;
  const isModal = () => modal() === true;

  useDismiss({
    enabled: () => mounted.value,
    elements: () => [popupEl.value, triggerEl.value],
    escapeKey: () => toValue(options.escapeKey) ?? true,
    outsidePress: () => toValue(options.outsidePress) ?? true,
    onDismiss: () => {
      open.value = false;
    }
  });

  // Opened by a resting mouse: it closes when the mouse leaves, and leaves focus where it was.
  const byHover = ref(false);
  let hoverTimer: ReturnType<typeof setTimeout> | undefined;
  const clearHoverTimer = () => clearTimeout(hoverTimer);
  const hovers = (event: PointerEvent) => (toValue(options.openOnHover) ?? false) && event.pointerType !== 'touch';

  function onHoverEnter(event: PointerEvent): void {
    if (!hovers(event)) return;
    clearHoverTimer();
    if (open.value) return;
    hoverTimer = setTimeout(() => {
      byHover.value = true;
      open.value = true;
    }, toValue(options.delay) ?? 200);
  }

  function onHoverLeave(event: PointerEvent): void {
    if (!hovers(event)) return;
    clearHoverTimer();
    if (!open.value || !byHover.value) return;
    hoverTimer = setTimeout(() => {
      open.value = false;
    }, toValue(options.closeDelay) ?? 150);
  }

  watch(open, (isOpen) => {
    if (!isOpen) byHover.value = false;
  });
  onScopeDispose(clearHoverTimer);

  useFocusTrap({
    enabled: () => open.value,
    container: surfaceEl,
    ready: () => positioning.isPositioned.value,
    modal: () => modal() !== false,
    autoFocus: () => (toValue(options.autoFocus) ?? true) && !byHover.value,
    returnFocus: true,
    returnFallback: () => triggerEl.value
  });

  useScrollLock(() => mounted.value && isModal());
  // Open, not mounted: a closing popover gives the page back while it animates out.
  useInertBackground(() => open.value && isModal(), surfaceEl);

  useExitAnimation({
    open: () => open.value,
    mounted,
    setMounted,
    element: surfaceEl
  });

  const triggerProps = computed(() => ({
    ...hooks.value,
    'data-part': 'trigger',
    id: triggerId,
    type: 'button',
    'aria-haspopup': 'dialog',
    'aria-expanded': open.value,
    'aria-controls': mounted.value ? popupId : undefined,
    ref: (el: unknown) => {
      triggerEl.value = elementOf(el);
    },
    onClick() {
      clearHoverTimer();
      // A press on a popover the mouse opened keeps it open, no longer tied to the mouse.
      if (open.value && byHover.value) byHover.value = false;
      else open.value = !open.value;
    },
    onPointerenter: onHoverEnter,
    onPointerleave: onHoverLeave
  }));

  const popupProps = computed(() => ({
    ...hooks.value,
    id: popupId,
    role: 'dialog',
    'aria-modal': isModal() || undefined,
    'aria-labelledby': titleId.value,
    'aria-describedby': descriptionId.value,
    ref: (el: unknown) => {
      surfaceEl.value = (el as HTMLElement) ?? null;
    },
    onPointerenter: (event: PointerEvent) => hovers(event) && clearHoverTimer(),
    onPointerleave: onHoverLeave
  }));

  const closeProps = computed(() => ({
    'data-part': 'close',
    type: 'button',
    onClick() {
      open.value = false;
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
    arrowProps: positioning.arrowProps,
    closeProps,
    registerTitle,
    registerDescription,
    anchorRef: triggerEl
  };
}

export const { provideContext: providePopoverContext, useContext: usePopoverContext } =
  createContext<UsePopoverReturn>('Popover');
