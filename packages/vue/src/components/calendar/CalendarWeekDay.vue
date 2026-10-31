<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useCalendarContext } from './use-calendar';
import type { WeekDay } from '@vunset/utils';

defineOptions({ name: 'CalendarWeekDay', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which day of the week, `0` (Sunday) to `6`. Without it, it renders all seven, in the day view only. */
    value?: WeekDay;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  default(props: {
    /**
     * `0` (Sunday) to `6`.
     * @attribute `data-value="…"`
     */
    index: WeekDay;
    /**
     * The full name: "Monday".
     * @attribute none
     */
    long: string;
    /**
     * The short name: "Mon".
     * @attribute none
     */
    short: string;
    /**
     * The narrowest name: "M".
     * @attribute none
     */
    narrow: string;
    /** Whether it is a Saturday or Sunday. */
    weekend: boolean;
  }): unknown;
}>();

const calendar = useCalendarContext();
const attrs = useAttrs();

const values = computed<WeekDay[]>(() => {
  if (props.value !== undefined) return [props.value];
  return calendar.state.value.view === 'day' ? calendar.weekDays.value.map((day) => day.index) : [];
});
</script>

<template>
  <Part :as="props.as" v-for="day in values" :key="day" v-bind="mergeProps(calendar.getWeekDayProps(day), attrs)">
    <slot v-bind="calendar.getWeekDayState(day)">{{ calendar.getWeekDayState(day).short }}</slot>
  </Part>
</template>
