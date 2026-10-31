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
import { useControlled } from './use-controlled';
import { dataAttrs } from './data-attrs';
import { popupStateAttrs } from './popup-state-attrs';
import { useTransitionStatus, type TransitionStatus } from './use-transition-status';
import { useDismiss } from './use-dismiss';
import { useFocusTrap } from './use-focus-trap';
import { useScrollLock } from './use-scroll-lock';
import { useInertBackground } from './use-inert-background';
import { useExitAnimation } from './use-exit-animation';
import { createContext } from './context';
import { useLabeling, type RegisterId } from './labeling';
import { provideSurface } from './surface';
import { elementOf } from './element-of';

interface DialogParentContext {
  /** How deeply nested the providing dialog is. Top level is 0. */
  depth: number;
  /** Called by a nested dialog as it opens, with its own depth. */
  registerNested: (depth: number) => () => void;
  closeChain: () => void;
}

const { provideContext: provideDialogParent, useOptionalContext: useDialogParent } =
  createContext<DialogParentContext>('DialogParent');

export interface DialogState {
  /**
   * Whether it is open.
   * @attribute `data-open` while open, `data-closed` otherwise
   */
  open: boolean;
  /**
   * Whether focus is trapped and the page behind made inert.
   * @attribute none
   */
  modal: boolean;
  /**
   * Where it is in its enter or exit animation.
   * @attribute `data-enter-from` as it enters, `data-leave-to` as it leaves
   */
  transitionStatus: TransitionStatus;
  /** Whether a dialog opened from inside this one is currently showing. */
  nested: boolean;
  /**
   * How many dialogs are stacked on top of this one. `0` is whichever is in front.
   * @attribute `data-level="…"` above 0; always `--dialog-level` on the backdrop and popup
   */
  level: number;
}

export interface UseDialogOptions {
  open?: MaybeRefOrGetter<boolean | undefined>;
  defaultOpen?: MaybeRefOrGetter<boolean | undefined>;
  /** Trap focus, lock page scrolling and hide the rest of the page from assistive technology. */
  modal?: MaybeRefOrGetter<boolean | undefined>;
  escapeKey?: MaybeRefOrGetter<boolean | undefined>;
  /** Close when the backdrop is pressed. @default false */
  outsidePress?: MaybeRefOrGetter<boolean | undefined>;
  /** `'alertdialog'` asks for a response: always modal, never closed by an outside press. */
  role?: MaybeRefOrGetter<DialogRole | undefined>;
  onChange?: (open: boolean) => void;
}

export type DialogRole = 'dialog' | 'alertdialog';

export interface UseDialogReturn {
  open: WritableComputedRef<boolean>;
  state: ComputedRef<DialogState>;
  present: Ref<boolean>;
  triggerProps: ComputedRef<Record<string, unknown>>;
  backdropProps: ComputedRef<Record<string, unknown>>;
  popupProps: ComputedRef<Record<string, unknown>>;
  closeProps: ComputedRef<Record<string, unknown>>;
  registerTitle: RegisterId;
  registerDescription: RegisterId;
  /** The dialog surface, for composables layered on top such as a drawer. */
  popupRef: Ref<HTMLElement | null>;
  close: () => void;
  /** Closes this dialog and every dialog it was opened from. */
  closeAll: () => void;
}

export function useDialog(options: UseDialogOptions = {}): UseDialogReturn {
  const triggerId = useId();
  const popupId = useId();
  const { titleId, descriptionId, registerTitle, registerDescription } = useLabeling();

  const popupRef = ref<HTMLElement | null>(null);
  const backdropRef = ref<HTMLElement | null>(null);
  const triggerRef = ref<HTMLElement | null>(null);

  const role = () => toValue(options.role) ?? 'dialog';
  const isAlert = () => role() === 'alertdialog';
  const modal = () => isAlert() || (toValue(options.modal) ?? true);

  const parent = useDialogParent();
  const depth = (parent?.depth ?? -1) + 1;
  const openBelow = ref<number[]>([]);

  const deepestOpen = computed(() => openBelow.value.reduce((deepest, entry) => Math.max(deepest, entry), depth));
  const level = computed(() => deepestOpen.value - depth);

  provideDialogParent({
    depth,
    closeChain: () => {
      open.value = false;
      parent?.closeChain();
    },
    registerNested: (nestedDepth: number) => {
      openBelow.value = [...openBelow.value, nestedDepth];
      const releaseAncestor = parent?.registerNested(nestedDepth);

      let released = false;
      return () => {
        if (released) return;

        released = true;
        const next = openBelow.value.slice();
        next.splice(next.indexOf(nestedDepth), 1);
        openBelow.value = next;
        releaseAncestor?.();
      };
    }
  });

  const open = useControlled<boolean>({
    value: () => toValue(options.open),
    defaultValue: () => toValue(options.defaultOpen) ?? false,
    onChange: options.onChange,
    prop: 'open',
    empty: false,
    name: 'useDialog',
    label: 'open'
  });

  const { mounted, transitionStatus, setMounted } = useTransitionStatus(() => open.value, {
    // Mounted already open (behind a `v-if`), it still animates in.
    animateInitialOpen: true
  });

  const state = computed<DialogState>(() => ({
    open: open.value,
    modal: modal(),
    transitionStatus: transitionStatus.value,
    nested: level.value > 0,
    level: level.value
  }));

  let unregisterFromParent: (() => void) | null = null;

  watch(
    mounted,
    (isMounted) => {
      if (isMounted) {
        unregisterFromParent ??= parent?.registerNested(depth) ?? null;
      } else {
        unregisterFromParent?.();
        unregisterFromParent = null;
      }
    },
    { immediate: true }
  );
  onScopeDispose(() => unregisterFromParent?.());

  const hooks = computed(() => dataAttrs(state.value, { ...popupStateAttrs, modal: () => null }));

  function close() {
    open.value = false;
  }

  useDismiss({
    enabled: () => mounted.value,
    elements: () => [popupRef.value],
    escapeKey: () => toValue(options.escapeKey) ?? true,
    outsidePress: () => !isAlert() && (toValue(options.outsidePress) ?? false),
    modal,
    onDismiss: close
  });

  useFocusTrap({
    enabled: () => open.value,
    container: popupRef,
    modal,
    autoFocus: true,
    returnFocus: true
  });

  useScrollLock(() => mounted.value && modal());
  // Open, not mounted: a closing dialog gives the page back while it animates out.
  useInertBackground(() => open.value && modal(), popupRef);

  useExitAnimation({
    open: () => open.value,
    mounted,
    setMounted,
    element: popupRef
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
      triggerRef.value = elementOf(el);
    },
    onClick() {
      open.value = !open.value;
    }
  }));

  const backdropProps = computed(() => ({
    ...hooks.value,
    'data-part': 'backdrop',
    style: { '--dialog-level': level.value },
    'aria-hidden': true,
    ref: (el: unknown) => {
      backdropRef.value = (el as HTMLElement) ?? null;
    }
  }));

  const popupProps = computed(() => ({
    ...hooks.value,
    style: { '--dialog-level': level.value },
    id: popupId,
    role: role(),
    'aria-modal': modal() ? true : undefined,
    'aria-labelledby': titleId.value,
    'aria-describedby': descriptionId.value,
    tabindex: -1,
    ref: (el: unknown) => {
      popupRef.value = (el as HTMLElement) ?? null;
    }
  }));

  const closeProps = computed(() => ({ 'data-part': 'close', type: 'button', onClick: close }));

  provideSurface({ present: mounted, state, popupProps });

  return {
    open,
    state,
    present: mounted,
    triggerProps,
    backdropProps,
    popupProps,
    closeProps,
    registerTitle,
    registerDescription,
    popupRef,
    close,
    closeAll: () => {
      open.value = false;
      parent?.closeChain();
    }
  };
}

export const { provideContext: provideDialogContext, useContext: useDialogContext } =
  createContext<UseDialogReturn>('Dialog');
