import {
  computed,
  nextTick,
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
import { anchoredStateAttrs } from './popup-state-attrs';
import { useTransitionStatus, type TransitionStatus } from './use-transition-status';
import {
  usePositioning,
  type Align,
  type Side,
  type UsePositioningOptions,
  type VirtualAnchor
} from './use-positioning';
import { useDismiss } from './use-dismiss';
import { useRovingFocus } from './use-roving-focus';
import { useTypeahead } from './use-typeahead';
import { useExitAnimation } from './use-exit-animation';
import { useMenubarContext } from './use-menubar';
import { createContext } from './context';
import { provideSurface } from './surface';
import { elementOf } from './element-of';

export interface MenuParentContext {
  /** The id of the submenu currently open within this menu, if any. */
  openSubmenu: Ref<string | null>;
  /** A submenu that replaced an already-open sibling, and so skips its animation. */
  switchedInto: Ref<string | null>;
  setOpenSubmenu: (id: string | null) => void;
  /** Focuses this menu's trigger. Used when a submenu closes via ArrowLeft. */
  focusTrigger: () => void;
  /** Closes this menu and every ancestor above it. */
  closeChain: () => void;
  /** Keeps a hover-opened ancestor from closing while the pointer is inside a descendant of it. */
  holdHover: () => void;
  /** Releases the hold, letting the chain close after its delay. */
  releaseHover: () => void;
}

const { provideContext: provideMenuParent, useOptionalContext: useMenuParent } =
  createContext<MenuParentContext>('MenuParent');

export interface MenuState {
  /**
   * Whether the menu is open.
   * @attribute `data-open` while open, `data-closed` otherwise
   */
  open: boolean;
  /**
   * The side of the trigger the menu ended up on.
   * @attribute `data-side="…"`
   */
  side: Side;
  /**
   * How the menu lines up along that side.
   * @attribute `data-align="…"`
   */
  align: Align;
  /** Whether the trigger ignores interaction. */
  disabled: boolean;
  /**
   * Where the menu is in its enter or exit animation.
   * @attribute `data-enter-from` as it enters, `data-leave-to` as it leaves
   */
  transitionStatus: TransitionStatus;
}

export interface UseMenuOptions extends UsePositioningOptions {
  open?: MaybeRefOrGetter<boolean | undefined>;
  defaultOpen?: MaybeRefOrGetter<boolean | undefined>;
  disabled?: MaybeRefOrGetter<boolean | undefined>;
  /** Close the menu after an item is chosen. @default true */
  closeOnSelect?: MaybeRefOrGetter<boolean | undefined>;
  /** Open on hover rather than only on click. @default false */
  openOnHover?: MaybeRefOrGetter<boolean | undefined>;
  /** How long the pointer must rest on the trigger before it opens. @default 100 */
  delay?: MaybeRefOrGetter<number | undefined>;
  /** How long the menu waits after the pointer leaves before closing. @default 150 */
  closeDelay?: MaybeRefOrGetter<number | undefined>;
  /** Whether arrow keys wrap from the last item to the first. @default true */
  loop?: MaybeRefOrGetter<boolean | undefined>;
  onChange?: (open: boolean) => void;
}

export interface UseMenuReturn {
  open: WritableComputedRef<boolean>;
  state: ComputedRef<MenuState>;
  present: Ref<boolean>;
  triggerProps: ComputedRef<Record<string, unknown>>;
  positionerProps: ComputedRef<Record<string, unknown>>;
  popupProps: ComputedRef<Record<string, unknown>>;
  arrowProps: ComputedRef<Record<string, unknown>>;
  /** Builds props for one item. Call per item. */
  getItemProps: (itemOptions?: MenuItemOptions) => Record<string, unknown>;
  close: () => void;
  /** Opens the menu and focuses its first item once it is placed, as the keyboard does. */
  openAndFocusFirst: () => Promise<void>;
  /** Anchors the menu to a point rather than to its trigger. Pass `null` to go back to the trigger. */
  setAnchor: (anchor: VirtualAnchor | null) => void;
  /** Where focus goes back to on close while there is no trigger element: a context menu's. */
  setReturnFocus: (element: HTMLElement | null) => void;
}

export type MenuItemRole = 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';

export interface MenuItemOptions {
  disabled?: boolean;
  /** @default 'menuitem' */
  role?: MenuItemRole;
  checked?: boolean;
  /** Whether choosing this item closes the menu. @default true */
  closeOnClick?: boolean;
  onSelect?: (event: Event) => void;
}

const ITEM_SELECTOR = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';

export function useMenu(options: UseMenuOptions = {}): UseMenuReturn {
  const menuId = useId();
  const triggerId = useId();
  const menubar = useMenubarContext();
  const parent = useMenuParent();
  const isSubmenu = parent !== null;

  const disabled = () => (toValue(options.disabled) ?? false) || (menubar?.disabled() ?? false);

  const localOpen = useControlled<boolean>({
    value: () => toValue(options.open),
    defaultValue: () => toValue(options.defaultOpen) ?? false,
    onChange: options.onChange,
    prop: 'open',
    empty: false,
    name: 'useMenu',
    label: 'open'
  });

  const open = computed<boolean>({
    get() {
      if (parent) return parent.openSubmenu.value === menuId;
      if (menubar) return menubar.openMenu.value === menuId;

      return localOpen.value;
    },
    set(value) {
      if (parent) {
        parent.setOpenSubmenu(value ? menuId : null);
        options.onChange?.(value);
      } else if (menubar) {
        if (value) {
          menubar.open(menuId);
        } else {
          menubar.close();
        }
        options.onChange?.(value);
      } else {
        localOpen.value = value;
      }
    }
  }) as WritableComputedRef<boolean>;

  const openSubmenu = ref<string | null>(null);
  const submenuSwitchedInto = ref<string | null>(null);

  const { mounted, transitionStatus, setMounted } = useTransitionStatus(() => open.value, {
    skipEnter: () => menubar?.switchedInto.value === menuId || parent?.switchedInto.value === menuId,
    skipExit: () => {
      const took = menubar?.switchedInto.value ?? parent?.switchedInto.value ?? null;
      return took !== null && took !== menuId;
    }
  });

  const positioning = usePositioning({
    side: () => toValue(options.side) ?? (isSubmenu ? 'right' : 'bottom'),
    align: () => toValue(options.align) ?? 'start',
    sideOffset: () => toValue(options.sideOffset) ?? (isSubmenu ? 0 : 4),
    alignOffset: options.alignOffset,
    collisionPadding: options.collisionPadding,
    enabled: () => mounted.value
  });

  const triggerEl = positioning.anchorRef;
  const popupEl = ref<HTMLElement | null>(null);
  let returnFocus: HTMLElement | null = null;
  const focusTrigger = () => (triggerEl.value ?? returnFocus)?.focus();

  const state = computed<MenuState>(() => ({
    open: open.value,
    side: positioning.renderedSide.value,
    align: positioning.renderedAlign.value,
    disabled: disabled(),
    transitionStatus: transitionStatus.value
  }));

  const hooks = computed(() => dataAttrs(state.value, { ...anchoredStateAttrs }));

  provideMenuParent({
    openSubmenu,
    switchedInto: submenuSwitchedInto,
    setOpenSubmenu: (id) => {
      submenuSwitchedInto.value = id !== null && openSubmenu.value !== null && openSubmenu.value !== id ? id : null;
      openSubmenu.value = id;
    },
    focusTrigger,
    holdHover,
    releaseHover,
    closeChain: () => {
      open.value = false;
      if (parent) parent.closeChain();
      else focusTrigger();
    }
  });

  const roving = useRovingFocus({
    container: popupEl,
    itemSelector: ITEM_SELECTOR,
    orientation: 'vertical',
    loop: () => toValue(options.loop) ?? true
  });

  const typeahead = useTypeahead({ items: () => roving.items() });

  function close(restoreFocus = true) {
    open.value = false;
    if (restoreFocus) focusTrigger();
  }

  useDismiss({
    enabled: () => mounted.value,
    elements: () => [popupEl.value, triggerEl.value],
    onDismiss: (reason) => {
      close(reason === 'escape-key');
    }
  });

  useExitAnimation({
    open: () => open.value,
    mounted,
    setMounted,
    element: popupEl
  });

  const hoverEnabled = () =>
    !isSubmenu && ((toValue(options.openOnHover) ?? false) || (menubar?.openOnHover() ?? false));

  let hoverTimer: ReturnType<typeof setTimeout> | undefined;

  const pinned = ref(false);

  watch(
    () => open.value,
    (isOpen) => {
      if (!isOpen) pinned.value = false;
    }
  );

  function cancelHover() {
    if (hoverTimer !== undefined) {
      clearTimeout(hoverTimer);
      hoverTimer = undefined;
    }
  }

  function scheduleHover(next: boolean) {
    if (!next && pinned.value) return;

    cancelHover();
    const wait = next ? (toValue(options.delay) ?? 100) : (toValue(options.closeDelay) ?? 150);

    if (wait <= 0) {
      open.value = next;
      return;
    }

    hoverTimer = setTimeout(() => {
      hoverTimer = undefined;
      if (!next && !open.value) return;

      open.value = next;
    }, wait);
  }

  function holdHover() {
    if (hoverEnabled()) cancelHover();

    parent?.holdHover();
  }

  function releaseHover() {
    if (hoverEnabled()) scheduleHover(false);
    parent?.releaseHover();
  }

  onScopeDispose(cancelHover);

  async function openAndFocusFirst() {
    open.value = true;
    if (positioning.isPositioned.value) {
      await nextTick();
      roving.focusAt(0);
      return;
    }
    focusFirstWhenPlaced = true;
  }

  let focusFirstWhenPlaced = false;

  watch(
    () => positioning.isPositioned.value,
    async (placed) => {
      if (!placed || !focusFirstWhenPlaced) return;

      focusFirstWhenPlaced = false;
      await nextTick();
      roving.focusAt(0);
    },
    { flush: 'post' }
  );

  const triggerProps = computed(() => ({
    ...hooks.value,
    'data-part': 'trigger',
    id: triggerId,
    type: 'button',
    role: menubar || isSubmenu ? 'menuitem' : undefined,
    'data-menubar-trigger': menubar && !isSubmenu ? menuId : undefined,
    'data-submenu-trigger': isSubmenu ? menuId : undefined,
    'aria-haspopup': 'menu',
    'aria-expanded': open.value,
    'aria-controls': mounted.value ? menuId : undefined,
    disabled: disabled() || undefined,
    tabindex: isSubmenu ? -1 : menubar ? (open.value || !menubar.isActive.value ? 0 : -1) : undefined,
    ref: (el: unknown) => {
      triggerEl.value = elementOf(el);
    },
    onClick(event: MouseEvent) {
      if (disabled()) return;

      if (isSubmenu) {
        event.stopPropagation();
        open.value = true;
        return;
      }

      if (hoverEnabled() && open.value && !pinned.value) {
        cancelHover();
        pinned.value = true;
        return;
      }

      open.value = !open.value;
    },
    onPointerenter() {
      if (disabled()) return;

      if (isSubmenu) {
        open.value = true;
        return;
      }

      if (menubar?.isActive.value) {
        menubar.open(menuId);
        return;
      }

      if (hoverEnabled()) scheduleHover(true);
    },
    onPointerleave() {
      if (hoverEnabled()) scheduleHover(false);
    },
    onKeydown(event: KeyboardEvent) {
      if (disabled()) return;

      const openKey = isSubmenu ? 'ArrowRight' : 'ArrowDown';
      if (event.key === openKey || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        void openAndFocusFirst();
      }
    }
  }));

  const popupProps = computed(() => ({
    ...hooks.value,
    id: menuId,
    role: 'menu',
    'aria-labelledby': triggerId,
    tabindex: -1,
    ref: (el: unknown) => {
      popupEl.value = (el as HTMLElement) ?? null;
    },
    onPointerenter: holdHover,
    onPointerleave: releaseHover,
    onKeydown(event: KeyboardEvent) {
      if (roving.onKeydown(event)) return;

      if (isSubmenu && event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      }

      if (menubar && !isSubmenu && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        menubar.focusSibling(event.key === 'ArrowRight' ? 1 : -1);
        return;
      }

      if (event.key === 'Tab') {
        close(false);
        return;
      }

      typeahead.onKeydown(event);
    }
  }));

  const ITEM_PARTS = { menuitem: 'item', menuitemcheckbox: 'checkbox-item', menuitemradio: 'radio-item' } as const;

  function getItemProps(itemOptions: MenuItemOptions = {}): Record<string, unknown> {
    const itemDisabled = itemOptions.disabled ?? false;
    const role = itemOptions.role ?? 'menuitem';
    const { checked } = itemOptions;

    function select(event: Event) {
      if (itemDisabled) return;

      itemOptions.onSelect?.(event);

      const closes = (itemOptions.closeOnClick ?? true) && (toValue(options.closeOnSelect) ?? true);
      if (!closes) return;

      if (parent) {
        open.value = false;
        parent.closeChain();
      } else {
        close();
      }
    }

    return {
      'data-part': ITEM_PARTS[role],
      role,
      tabindex: -1,
      'aria-disabled': itemDisabled || undefined,
      'aria-checked': role === 'menuitem' ? undefined : Boolean(checked),
      'data-checked': checked === true ? '' : undefined,
      'data-unchecked': checked === false ? '' : undefined,
      'data-disabled': itemDisabled ? '' : undefined,
      onClick: select,
      onKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          // A link goes where it points: its click selects too, and a router link navigates on it.
          const el = event.currentTarget as HTMLElement;
          if (el instanceof HTMLAnchorElement && el.hasAttribute('href') && !itemDisabled) el.click();
          else select(event);
        }
      },
      onPointermove(event: PointerEvent) {
        if (itemDisabled) return;

        (event.currentTarget as HTMLElement).focus();
        openSubmenu.value = null;
      }
    };
  }

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
    getItemProps,
    close,
    openAndFocusFirst,
    setAnchor: positioning.setVirtualAnchor,
    setReturnFocus: (element) => {
      returnFocus = element;
    }
  };
}

export const { provideContext: provideMenuContext, useContext: useMenuContext } = createContext<UseMenuReturn>('Menu');

export type MenuRadioValue = string | number;

export interface MenuRadioGroupContext {
  value: Ref<MenuRadioValue | undefined>;
  select: (value: MenuRadioValue, event: Event) => void;
  disabled: () => boolean;
}

export const { provideContext: provideMenuRadioGroupContext, useContext: useMenuRadioGroupContext } =
  createContext<MenuRadioGroupContext>('MenuRadioGroup');

export interface MenuGroupContext {
  labelId: string;
  registerLabel: () => () => void;
}

export const { provideContext: provideMenuGroupContext, useContext: useMenuGroupContext } =
  createContext<MenuGroupContext>('MenuGroup');

/** What a checkbox or radio item tells its indicator. */
export interface MenuItemIndicatorContext {
  checked: () => boolean;
  disabled: () => boolean;
}

export const { provideContext: provideMenuItemIndicatorContext, useContext: useMenuItemIndicatorContext } =
  createContext<MenuItemIndicatorContext>('MenuItemIndicator');
