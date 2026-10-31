<script setup lang="ts">
import { toRef } from 'vue';
import { useTooltip } from './use-tooltip';
import { provideTooltipContext, type TooltipState } from './use-tooltip';
import type { Align, Side } from '../../shared/use-positioning';

defineOptions({ name: 'TooltipRoot' });

const props = withDefaults(
  defineProps<{
    /** Whether the tooltip is open, bound with `v-model:open`. */
    open?: boolean;
    /** Opens at first, when no `v-model:open` owns it. @default false */
    defaultOpen?: boolean;
    /** Keeps the tooltip from opening. @default false */
    disabled?: boolean;
    /** Allow the pointer to move into the tooltip without closing it. @default true */
    hoverable?: boolean;
    /** How long the pointer rests on the trigger before it opens, in ms. A `TooltipGroup` sets it for its tooltips. @default 600 */
    delay?: number;
    /** How long after the pointer leaves before it closes, in ms. A `TooltipGroup` sets it too. @default 0 */
    closeDelay?: number;
    /** Which side of the trigger the tooltip prefers. @default 'top' */
    side?: Side;
    /** How the tooltip lines up along that side. @default 'center' */
    align?: Align;
    /** The gap between the trigger and the tooltip, in pixels. @default 8 */
    sideOffset?: number;
    /** Sides to try, in order, when the preferred one does not fit. */
    fallbackSides?: Side[];
    /** Allow dropping to the perpendicular axis as a last resort. @default true */
    fallbackAxis?: boolean;
  }>(),
  {
    open: undefined,
    defaultOpen: undefined,
    disabled: undefined,
    hoverable: undefined,
    // Left undefined so the composable and the surrounding group decide.
    delay: undefined,
    closeDelay: undefined,
    side: undefined,
    align: undefined,
    sideOffset: undefined,
    fallbackSides: undefined,
    fallbackAxis: undefined,
  },
);

const emit = defineEmits<{
  /** The tooltip opened or closed, for `v-model:open`. */
  'update:open': [open: boolean];
  /** The same, for a listener without `v-model:open`. */
  change: [open: boolean];
}>();

defineSlots<{
  /**
   * The tooltip's state.
   * @slotOnly The root renders no element of its own: the trigger and the popup carry these as attributes.
   */
  default(props: TooltipState): unknown;
}>();

const api = useTooltip({
  open: toRef(() => props.open),
  defaultOpen: toRef(() => props.defaultOpen),
  disabled: toRef(() => props.disabled),
  hoverable: toRef(() => props.hoverable),
  delay: toRef(() => props.delay),
  closeDelay: toRef(() => props.closeDelay),
  side: toRef(() => props.side),
  align: toRef(() => props.align),
  sideOffset: toRef(() => props.sideOffset),
  fallbackSides: toRef(() => props.fallbackSides),
  fallbackAxis: toRef(() => props.fallbackAxis),
  onChange: (open) => {
    emit('update:open', open);
    emit('change', open);
  },
});

provideTooltipContext(api);
defineExpose(api);
</script>

<template>
  <slot v-bind="api.state.value" />
</template>
