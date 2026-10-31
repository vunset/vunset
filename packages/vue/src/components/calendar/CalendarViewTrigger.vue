<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useCalendarContext, type CalendarView, type CalendarState } from './use-calendar';

defineOptions({ name: 'CalendarViewTrigger', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which grid it opens, and closes again back to the days. */
    value: Exclude<CalendarView, 'day'>;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

defineSlots<{
  /**
   * The calendar's state, for the slot only: the element carries none of it.
   * @slotOnly
   */
  default(props: CalendarState): unknown;
}>();

const calendar = useCalendarContext();
const merged = usePartProps(() => calendar.getViewTriggerProps(props.value));

const label = computed(() =>
  props.value === 'month' ? calendar.state.value.monthLabel : calendar.state.value.yearLabel
);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="calendar.state.value">{{ label }}</slot>
  </Part>
</template>
