<script setup lang="ts">
import { toRef } from 'vue';
import { usePopover } from './use-popover';
import { providePopoverContext, type PopoverState } from './use-popover';
import type { Align, Side } from '../../shared/use-positioning';

defineOptions({ name: 'PopoverRoot' });

const props = withDefaults(
  defineProps<{
    /** Whether the popover is open, bound with `v-model:open`. */
    open?: boolean;
    /** Opens at first, when no `v-model:open` owns it. */
    defaultOpen?: boolean;
    /** Which side of the trigger the popover prefers. */
    side?: Side;
    /** How the popover lines up along that side. */
    align?: Align;
    /** The gap between the trigger and the popover, in pixels. */
    sideOffset?: number;
    /** A shift along the side, in pixels. */
    alignOffset?: number;
    /** The least room kept from the viewport's edges, in pixels. */
    collisionPadding?: number;
    /** Sides to try, in order, when the preferred one does not fit. */
    fallbackSides?: Side[];
    /** Allow dropping to the perpendicular axis as a last resort. @default true */
    fallbackAxis?: boolean;
    /** Stay anchored and slide instead of flipping. */
    sticky?: boolean;
    /** `true` traps focus, locks scroll and makes the page inert; `'trap-focus'` only traps focus. */
    modal?: boolean | 'trap-focus';
    /** Closes on Escape. */
    escapeKey?: boolean;
    /** Closes on a press outside the popover and its trigger. */
    outsidePress?: boolean;
    /** Moves focus into the popover when it opens, and back to the trigger when it closes. */
    autoFocus?: boolean;
    /** Also opens while a mouse rests on the trigger, and stays open while it is on the popover. A tap still opens it. */
    openOnHover?: boolean;
    /** With `open-on-hover`: how long the mouse rests on the trigger before it opens, in milliseconds. @default 200 */
    delay?: number;
    /** With `open-on-hover`: how long after the mouse leaves before it closes, in milliseconds. @default 150 */
    closeDelay?: number;
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    side: 'bottom',
    align: 'center',
    sideOffset: 8,
    alignOffset: 0,
    collisionPadding: 8,
    fallbackSides: undefined,
    fallbackAxis: undefined,
    sticky: undefined,
    modal: false,
    escapeKey: true,
    outsidePress: true,
    autoFocus: true,
  },
);

const emit = defineEmits<{
  /** The popover opened or closed, for `v-model:open`. */
  'update:open': [open: boolean];
  /** The same, for a listener without `v-model:open`. */
  change: [open: boolean];
}>();

defineSlots<{
  /**
   * The popover's state.
   * @slotOnly The root renders no element of its own: the trigger and the popup carry these as attributes.
   */
  default(props: PopoverState): unknown;
}>();

const api = usePopover({
  open: toRef(() => props.open),
  defaultOpen: toRef(() => props.defaultOpen),
  side: toRef(() => props.side),
  align: toRef(() => props.align),
  sideOffset: toRef(() => props.sideOffset),
  alignOffset: toRef(() => props.alignOffset),
  collisionPadding: toRef(() => props.collisionPadding),
  fallbackSides: toRef(() => props.fallbackSides),
  fallbackAxis: toRef(() => props.fallbackAxis),
  sticky: toRef(() => props.sticky),
  modal: toRef(() => props.modal),
  escapeKey: toRef(() => props.escapeKey),
  outsidePress: toRef(() => props.outsidePress),
  autoFocus: toRef(() => props.autoFocus),
  openOnHover: toRef(() => props.openOnHover),
  delay: toRef(() => props.delay),
  closeDelay: toRef(() => props.closeDelay),
  onChange: (open) => {
    emit('update:open', open);
    emit('change', open);
  },
});

providePopoverContext(api);
defineExpose(api);
</script>

<template>
  <slot v-bind="api.state.value" />
</template>
