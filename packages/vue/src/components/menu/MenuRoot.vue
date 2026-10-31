<script setup lang="ts">
import { toRef } from 'vue';
import { useMenu } from '../../shared/use-menu';
import { provideMenuContext, type MenuState } from '../../shared/use-menu';
import type { Align, Side } from '../../shared/use-positioning';

defineOptions({ name: 'MenuRoot' });

const props = withDefaults(
  defineProps<{
    /** Whether the menu is open, bound with `v-model:open`. */
    open?: boolean;
    /** Opens at first, when no `v-model:open` owns it. */
    defaultOpen?: boolean;
    /** Keeps the trigger from opening the menu. */
    disabled?: boolean;
    /** Whether choosing an item closes the menu at all. @default true */
    closeOnSelect?: boolean;
    /** Open on hover. Standalone menus only — submenus always do, a menubar owns its own. */
    openOnHover?: boolean;
    /** How long the pointer rests on the trigger before it opens. @default 100 */
    delay?: number;
    /** How long after the pointer leaves before it closes. @default 150 */
    closeDelay?: number;
    /** Whether arrow keys wrap past the ends. @default true */
    loop?: boolean;
    /** Which side of the trigger the menu prefers. Submenus default to the side. */
    side?: Side;
    /** How the menu lines up along that side. */
    align?: Align;
    /** The gap between the trigger and the menu, in pixels. */
    sideOffset?: number;
    /** Sides to try, in order, when the preferred one does not fit. */
    fallbackSides?: Side[];
    /** Allow dropping to the perpendicular axis as a last resort. @default true */
    fallbackAxis?: boolean;
    /** Stay anchored and slide instead of flipping. */
    sticky?: boolean;
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    disabled: false,
    closeOnSelect: true,
    openOnHover: false,
    delay: undefined,
    closeDelay: undefined,
    loop: undefined,
    side: undefined,
    align: undefined,
    sideOffset: undefined,
    fallbackSides: undefined,
    fallbackAxis: undefined,
    sticky: undefined
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
   * @slotOnly The root renders no element of its own: the trigger and the popup carry these as attributes.
   */
  default(props: MenuState): unknown;
}>();

const api = useMenu({
  open: toRef(() => props.open),
  defaultOpen: toRef(() => props.defaultOpen),
  disabled: toRef(() => props.disabled),
  closeOnSelect: toRef(() => props.closeOnSelect),
  openOnHover: toRef(() => props.openOnHover),
  delay: toRef(() => props.delay),
  closeDelay: toRef(() => props.closeDelay),
  loop: toRef(() => props.loop),
  side: toRef(() => props.side),
  align: toRef(() => props.align),
  sideOffset: toRef(() => props.sideOffset),
  fallbackSides: toRef(() => props.fallbackSides),
  fallbackAxis: toRef(() => props.fallbackAxis),
  sticky: toRef(() => props.sticky),
  onChange: (open) => {
    emit('update:open', open);
    emit('change', open);
  }
});

provideMenuContext(api);
defineExpose(api);
</script>

<template>
  <slot v-bind="api.state.value" />
</template>
