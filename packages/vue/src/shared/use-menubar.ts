import { computed, ref, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue';
import { createContext } from './context';
import { useRovingFocus } from './use-roving-focus';

export interface MenubarContextValue {
  openMenu: Ref<string | null>;
  switchedInto: Ref<string | null>;
  isActive: ComputedRef<boolean>;
  open: (id: string) => void;
  close: () => void;
  containerRef: Ref<HTMLElement | null>;
  /** Moves focus to the adjacent trigger, used when a menu handles Arrow keys. */
  focusSibling: (delta: number) => void;
  disabled: () => boolean;
  openOnHover: () => boolean;
  /** Props for a link in the bar, beside the menus: `MenubarLink`'s. */
  getLinkProps: (link?: { disabled?: boolean }) => Record<string, unknown>;
}

// A link in the bar takes its turn among the triggers.
const BAR_ITEMS = '[data-menubar-trigger], [data-menubar-link]';

export const { provideContext: provideMenubarContext, useOptionalContext: useMenubarContext } =
  createContext<MenubarContextValue>('Menubar');

export interface UseMenubarOptions {
  disabled?: MaybeRefOrGetter<boolean>;
  loop?: MaybeRefOrGetter<boolean>;
  /** Open the bar on hover, without a first click. @default false */
  openOnHover?: MaybeRefOrGetter<boolean>;
}

export function useMenubar(options: UseMenubarOptions = {}) {
  const containerRef = ref<HTMLElement | null>(null);
  const openMenu = ref<string | null>(null);
  const switchedInto = ref<string | null>(null);
  const disabled = () => toValue(options.disabled) ?? false;
  const openOnHover = () => toValue(options.openOnHover) ?? false;

  const isActive = computed(() => openMenu.value !== null);

  const roving = useRovingFocus({
    container: containerRef,
    itemSelector: BAR_ITEMS,
    orientation: 'horizontal',
    loop: () => toValue(options.loop) ?? true
  });

  function open(id: string) {
    if (disabled()) return;

    switchedInto.value = openMenu.value !== null && openMenu.value !== id ? id : null;
    openMenu.value = id;
  }

  function close() {
    openMenu.value = null;
    switchedInto.value = null;
  }

  function focusSibling(delta: number) {
    const list = roving.items();
    if (list.length === 0) return;

    let index = list.indexOf(document.activeElement as HTMLElement);
    if (index === -1 && openMenu.value) {
      index = list.findIndex((el) => el.dataset.menubarTrigger === openMenu.value);
    }

    const next = index === -1 ? 0 : (index + delta + list.length) % list.length;
    const target = list[next];
    target.focus();

    // Moving onto a link closes the open menu; onto a trigger, opens its menu.
    if (openMenu.value) {
      const id = target.dataset.menubarTrigger;
      if (id) open(id);
      else close();
    }
  }

  function getLinkProps(link: { disabled?: boolean } = {}): Record<string, unknown> {
    const off = disabled() || (link.disabled ?? false);
    return {
      'data-part': 'menubar-link',
      'data-menubar-link': '',
      role: 'menuitem',
      tabindex: isActive.value ? -1 : 0,
      'aria-disabled': off || undefined,
      'data-disabled': off ? '' : undefined,
      onClick(event: MouseEvent) {
        if (off) event.preventDefault();
        else close();
      },
      // As hovering another trigger switches menus, hovering a link closes the open one.
      onPointerenter() {
        if (isActive.value) close();
      }
    };
  }

  const context: MenubarContextValue = {
    openMenu,
    switchedInto,
    isActive,
    open,
    close,
    containerRef,
    focusSibling,
    disabled,
    openOnHover,
    getLinkProps
  };

  provideMenubarContext(context);

  const rootProps = computed(() => ({
    'data-part': 'menubar',
    role: 'menubar',
    'aria-orientation': 'horizontal' as const,
    ref: (el: unknown) => {
      containerRef.value = (el as HTMLElement) ?? null;
    },
    onKeydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.matches(BAR_ITEMS)) return;

      roving.onKeydown(event);
    }
  }));

  return { rootProps, openMenu, isActive, open, close, focusSibling, containerRef };
}
