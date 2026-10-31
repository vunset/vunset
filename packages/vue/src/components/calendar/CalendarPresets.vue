<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useCalendarContext, type CalendarState, type CalendarPresetItem } from './use-calendar';

defineOptions({ name: 'CalendarPresets', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * The calendar's state, for the slot only: the element carries none of it.
   * @slotOnly
   */
  default(
    props: CalendarState & {
      /** The presets to render, each with its days worked out. */
      presets: CalendarPresetItem[];
    }
  ): unknown;
}>();

const calendar = useCalendarContext();
const merged = usePartProps(calendar.presetsProps);

const slotProps = computed(() => ({ ...calendar.state.value, presets: calendar.presets.value }));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="slotProps" />
  </Part>
</template>
