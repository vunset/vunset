<script setup lang="ts">
import { useAttrs } from 'vue';
import { useChartPart, type ChartTooltipSlotProps } from './ChartRoot.vue';

defineOptions({ name: 'ChartTooltip', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** `row`: every series at the row under the pointer. `point`: the one point nearest it. @default 'row' */
    mode?: 'row' | 'point';
    /** A click, Enter or Space pins it in place; another, or Escape, lets it go. @default true */
    sticky?: boolean;
    /** Formats the heading from the row's `x-key` value, apart from the x axis' ticks. Defaults to the x axis' `format`. */
    headingFormat?: (value: any) => string;
  }>(),
  { mode: 'row', sticky: true }
);

const slots = defineSlots<{
  /** Replaces the content: a heading, then a row per series. */
  default?(props: ChartTooltipSlotProps): unknown;
}>();

const attrs = useAttrs();

useChartPart('tooltip', () => ({
  attrs,
  slot: slots.default,
  mode: props.mode,
  sticky: props.sticky,
  headingFormat: props.headingFormat
}));
</script>

<template></template>
