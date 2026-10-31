<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { createContext } from '../../shared/context';

export const { provideContext: provideCalendarWeek, useOptionalContext: useCalendarWeek } =
  createContext<() => Date[]>('CalendarWeek');

/** Hands one week's days to the `CalendarDay` in its row. */
const WeekScope = defineComponent({
  props: { days: { type: Array as PropType<Date[]>, required: true } },
  setup(props, { slots }) {
    provideCalendarWeek(() => props.days);
    return () => slots.default?.();
  }
});
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useCalendarContext } from './use-calendar';

defineOptions({ name: 'CalendarWeek', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * A `CalendarDay` without a `value`, which renders the week's seven days.
   * The week, for the slot only: the row carries none of it.
   * @slotOnly
   */
  default(props: {
    /** The week's days. */
    days: Date[];
    /** Which week of the month, from `0`. */
    index: number;
  }): unknown;
}>();

const calendar = useCalendarContext();
const merged = usePartProps(calendar.rowProps);
</script>

<template>
  <!-- A row per week of the month on screen, in the day view only. -->
  <template v-if="calendar.state.value.view === 'day'">
    <WeekScope v-for="(days, index) in calendar.weeks.value" :key="index" :days="days">
      <Part :as="props.as" v-bind="merged">
        <slot :days="days" :index="index" />
      </Part>
    </WeekScope>
  </template>
</template>
