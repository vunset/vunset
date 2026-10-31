<script setup lang="ts">
import { computed } from 'vue';
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useTimepickerContext, type TimeUnit } from './use-timepicker';

defineOptions({ name: 'TimepickerSegment', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which part of the time it holds. */
    unit: TimeUnit;
    /** Shown while it's empty. */
    placeholder?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { placeholder: '--', as: 'span' }
);

defineSlots<{
  /**
   * What it shows.
   * @slotOnly The element carries `data-placeholder` while empty.
   */
  default(props: {
    /** The number, or `null` while empty: the hour 0–23 in either cycle, `0`/`1` for AM/PM. */
    value: number | null;
    /** As shown: zero-padded, `12` for a 12-hour midnight, the AM/PM label, or the placeholder. */
    text: string;
  }): unknown;
}>();

const { getSegmentProps, parts, units, display } = useTimepickerContext();
const merged = usePartProps(() => getSegmentProps(props.unit));
const shown = computed(() => units.value.includes(props.unit));
const value = computed(() => parts[props.unit]);
const text = computed(() => (value.value === null ? props.placeholder : display(props.unit, value.value)));
</script>

<template>
  <Part v-if="shown" :as="props.as" v-bind="merged">
    <slot :value="value" :text="text">{{ text }}</slot>
  </Part>
</template>
