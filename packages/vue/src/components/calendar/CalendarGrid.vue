<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import type { WeekDayName } from '@vunset/utils';
import { useCalendarContext, type CalendarState } from './use-calendar';

defineOptions({ name: 'CalendarGrid', inheritAttrs: false });

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
      /** The month's days, a row of seven per week. */
      weeks: Date[][];
      /** The week's day names, starting from \`first-day-of-week\`. */
      weekDays: WeekDayName[];
      /** The months' names, \`0\`–\`11\`. */
      months: string[];
      /** The twelve years on the year page. */
      years: number[];
    }
  ): unknown;
}>();

const calendar = useCalendarContext();
const merged = usePartProps(calendar.gridProps);

const slotProps = computed(() => ({
  ...calendar.state.value,
  weeks: calendar.weeks.value,
  weekDays: calendar.weekDays.value,
  months: calendar.months.value,
  years: calendar.years.value
}));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="slotProps" />
  </Part>
</template>
