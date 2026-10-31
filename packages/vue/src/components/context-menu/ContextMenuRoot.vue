<script setup lang="ts">
import { toRef } from 'vue';
import { useMenu, provideMenuContext, type MenuState } from '../../shared/use-menu';
import { useScrollLock } from '../../shared/use-scroll-lock';
import type { Align, Side } from '../../shared/use-positioning';

defineOptions({ name: 'ContextMenuRoot' });

const props = withDefaults(
  defineProps<{
    /** Whether the menu is open, bound with `v-model:open`. */
    open?: boolean;
    /** Opens at first, when no `v-model:open` owns it. */
    defaultOpen?: boolean;
    /** Leaves the browser's own context menu in place. */
    disabled?: boolean;
    /** Whether choosing an item closes the menu at all. @default true */
    closeOnSelect?: boolean;
    /** Whether arrow keys wrap past the ends. @default true */
    loop?: boolean;
    /** Which side of the pointer the menu opens on. */
    side?: Side;
    /** How the menu lines up with the pointer. `start` puts its corner on it. */
    align?: Align;
    /** The gap between the pointer and the menu, in pixels. */
    sideOffset?: number;
    /** Sides to try, in order, when the preferred one does not fit. */
    fallbackSides?: Side[];
    /** Allow dropping to the perpendicular axis as a last resort. @default true */
    fallbackAxis?: boolean;
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    disabled: false,
    closeOnSelect: true,
    loop: undefined,
    // A context menu opens *at* the pointer, so its corner sits on the point:
    // below and to the inline-start of it, touching. The offsets a dropdown
    // wants would push it off the very place the user aimed at.
    side: 'bottom',
    align: 'start',
    sideOffset: 0,
    fallbackSides: undefined,
    fallbackAxis: undefined
  }
);

const emit = defineEmits<{
  /** The menu opened or closed, for `v-model:open`. */
  'update:open': [open: boolean];
  /** The same, for a listener without `v-model:open`. */
  change: [open: boolean];
}>();

defineSlots<{
  /**
   * The menu's state.
   * @slotOnly The root renders no element of its own: the popup carries these as attributes.
   */
  default(props: MenuState): unknown;
}>();

/*
  The same `useMenu` a dropdown runs on, and the same context — so `MenuItem`,
  `MenuCheckboxItem`, `MenuRadioGroup`, `Separator` and submenus all work in
  here unchanged. What differs is only what the popup is anchored to, which
  `ContextMenuTrigger` sets to the point the pointer was at.

  `openOnHover` is absent on purpose: a region that opened a menu when the
  pointer crossed it would be unusable.
*/
const api = useMenu({
  open: toRef(() => props.open),
  defaultOpen: toRef(() => props.defaultOpen),
  disabled: toRef(() => props.disabled),
  closeOnSelect: toRef(() => props.closeOnSelect),
  loop: toRef(() => props.loop),
  side: toRef(() => props.side),
  align: toRef(() => props.align),
  sideOffset: toRef(() => props.sideOffset),
  fallbackSides: toRef(() => props.fallbackSides),
  fallbackAxis: toRef(() => props.fallbackAxis),
  onChange: (open) => {
    emit('update:open', open);
    emit('change', open);
  }
});

// Pinned to a point, not to an element: a page scrolling under it would leave
// it over the wrong row. A dropdown follows its trigger, so it needs no lock.
useScrollLock(() => api.present.value);

provideMenuContext(api);
defineExpose(api);
</script>

<template>
  <slot v-bind="api.state.value" />
</template>
